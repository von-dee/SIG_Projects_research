> Module 0: Overview → 0.1 System Architecture Overview

## System Architecture Overview

### Architectural Style

The System follows an **event-sourced, modular monolith with service-bus federation**. The core transactional domain (registrations, attendees, sessions, payments, protocol records) lives in a single deployable unit with strict module boundaries enforced in code (not in network topology). Read-optimized surfaces (dashboards, analytics, mobile app APIs) are deployed as separate services that subscribe to the event bus and materialize their own projections. This avoids the operational overhead of microservices for a team of 12-25 engineers while preserving the ability to scale reads horizontally.

The choice of modular monolith over microservices is deliberate. At FMF scale, the transactional write rate is modest (peak ~1,200 writes/sec across all modules combined); the bottleneck is read fan-out and real-time push, which is handled at the projection layer. Microservices would add distributed-transaction complexity (saga orchestration for badge issuance, seating reassignment, protocol re-ranking) without commensurate scaling benefit.

### Layered Topology

```
┌──────────────────────────────────────────────────────────────────┐
│  EDGE / CLIENTS                                                  │
│  Web Console (React 18) | Mobile App (React Native)             │
│  Kiosk App (Electron) | Scanner Firmware (Zebra SDK)            │
│  Public Site (Next.js) | Sponsor/Exhibitor Portal (React)       │
└──────────────────────────────────────────────────────────────────┘
                              │ HTTPS / WSS
┌──────────────────────────────────────────────────────────────────┐
│  API GATEWAY (Kong / Envoy)                                      │
│  Auth (OIDC + scopes) | Rate limit | Tenant routing | Audit     │
└──────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────────┐
│  READ FEDERATION (Apollo Router, GraphQL)                        │
│  Composes subgraphs: registration, agenda, vip, finance, ops    │
└──────────────────────────────────────────────────────────────────┘
                              │
   ┌───────────────┬──────────┴───────────┬────────────────┐
   ▼               ▼                       ▼                ▼
┌────────┐   ┌──────────┐           ┌──────────┐    ┌────────────┐
│ Core   │   │ Analytics│           │ Mobile   │    │ Integration│
│ Domain │   │ Service  │           │ BFF     │    │ Hub (Mule) │
│ (Mono) │   │ (Go)     │           │ (Node)   │    │            │
└────────┘   └──────────┘           └──────────┘    └────────────┘
   │               │                       │                │
   ▼               ▼                       ▼                ▼
┌──────────────────────────────────────────────────────────────────┐
│  EVENT BUS (Kafka, 3-broker, RF=3)                              │
│  Topics per aggregate: registration.*, vip.*, agenda.*, ...     │
└──────────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────────────────────────────┐
│  PERSISTENCE                                                     │
│  PostgreSQL 16 (OLTP, RDS-style) | ClickHouse (Analytics)        │
│  Redis 7 (Hot state, locks, presence) | S3 (Media, exports)     │
│  Neo4j (Relationship graph for matchmaking)                     │
└──────────────────────────────────────────────────────────────────┘
```

### Domain Bounded Contexts

The System is partitioned into 12 bounded contexts, one per module. Each context owns its own tables, its own GraphQL subgraph, and its own event topic prefix. Cross-context communication is via Kafka events or via synchronous GraphQL federation, never via direct database access.

| Bounded Context | Owns | Publishes Events On |
|---|---|---|
| Master Dashboard | Projections, run-of-show, incidents | `incident.*`, `ros.*` |
| VIP & Protocol | Dignitaries, protocol rules, seating | `vip.*`, `seating.*`, `protocol.*` |
| Matchmaking | Meetings, requests, matches | `meeting.*`, `match.*` |
| Content & Stage | Sessions, speakers, run sheets, streams | `session.*`, `speaker.*`, `stream.*` |
| Commercial | Sponsors, booths, contracts, leads | `sponsor.*`, `booth.*`, `lead.*` |
| Registration | Attendees, badges, credentials, scans | `registration.*`, `credential.*`, `scan.*` |
| Mobile App | App config, notifications, sync cursors | `appconfig.*`, `notif.*` |
| Ops & Logistics | Resources, suppliers, F&B, transport | `resource.*`, `supplier.*`, `fnb.*`, `transport.*` |
| Finance | Budgets, invoices, POs, GL postings | `budget.*`, `invoice.*`, `po.*` |
| Marketing & PR | Campaigns, accreditation, press, social | `campaign.*`, `accreditation.*`, `press.*` |
| ESG | Carbon, waste, supplier diversity, reports | `esg.*` |
| Analytics | Warehouse, journey, ROI, dashboards | (consumes only) |

### Data Model Conventions

Every table in the System follows these conventions. Specific schemas are documented per module; this section establishes the shared columns.

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` (v7 for time-sortable) | Primary key |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | Event scoping within tenant |
| `created_at` | `timestamptz` | Record creation (UTC) |
| `updated_at` | `timestamptz` | Last mutation |
| `created_by` | `uuid` | Actor (user or service account) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete timestamp |
| `ext_refs` | `jsonb` | External system IDs (e.g., `{cvent_id, marketo_id}`) |
| `audit_log` | `jsonb[]` | Append-only local audit (full log in Kafka) |

All money fields are stored as `numeric(18,3)` with a separate `currency_code` ISO 4217 column. All timestamps are UTC; UI surfaces convert to event-local timezone (`Asia/Riyadh` for FMF) at presentation time.

### Event Sourcing and the Audit Log

Every state-mutating operation on a core domain object appends an event to Kafka on the relevant topic, with the schema:

```json
{
  "event_id": "01HXXX...",
  "event_type": "vip.protocol_rank.changed",
  "tenant_id": "...",
  "event_id_scope": "...",
  "aggregate_id": "dignitary.id",
  "actor": { "user_id": "...", "role": "protocol_officer", "device_id": "..." },
  "occurred_at": "2026-01-12T08:14:23.512Z",
  "causation_id": "...",
  "payload": { "from": 3, "to": 2, "reason": "ministerial reshuffle" },
  "prior_state_hash": "sha256:..."
}
```

Kafka topics are retained for 7 years for FMF-class events (regulatory and diplomatic audit requirement). ClickHouse materializes these into queryable audit tables with sub-second full-text search across actor, aggregate, and payload.

### Multi-Region and Failover

The System deploys active-active across two AWS regions (`me-central-1` UAE and `eu-west-1` Ireland for FMF). Writes are routed to the region with the lowest latency from the actor's location, with Kafka MirrorMaker 2 replicating events cross-region within 2 seconds. PostgreSQL uses logical replication for the transactional core; in the event of regional failure, the surviving region accepts traffic after a 60-second DNS flip and a 30-second quorum re-elect.

Failover is **last-writer-wins for non-critical fields** and **requires manual adjudication for critical fields** (protocol rank, payment status, badge entitlement). Manual adjudication surfaces as a reconciliation queue in the War Room dashboard within 5 minutes of failover.

### Authentication and Authorization

**Identity Provider:** Azure AD B2C for external identities (attendees, sponsors, media), Azure AD for internal staff. Federation via OIDC; the API Gateway validates JWTs and extracts scopes.

**Authorization model:** RBAC with 38 roles across 12 modules, plus 6 cross-cutting roles (`super_admin`, `event_director`, `auditor`, `break_glass_operator`, `kiosk_device`, `scanner_device`). Roles are scoped per `tenant_id` and `event_id`. Permission checks are implemented as a policy engine (OPA / Rego) evaluated at the API gateway for coarse-grained access and at the application layer for field-level access.

**Break-glass:** Elevated actions (force-badge-print, override-protocol-rank, manual-payment-posting) require two-person approval: the requesting operator and an approver with `break_glass_approver` scope. Both identities are captured in the audit event. Break-glass actions are visible in real-time in the War Room dashboard.

### Integration Hub

External system integrations are mediated by a dedicated **Integration Hub** built on MuleSoft Anypoint or Workato (the choice between them is documented in the appendix). The Hub provides:

- **Connector library:** Pre-built connectors for Cvent, Marketo, Salesforce, HID Global Origo, Zebra Data Service, Twilio, SendGrid, Stripe, SAP S/4HANA, FlightAware, Mapwize, Situm, Vmix, OBS, Zoom Webinars.
- **Idempotency:** Every outbound call carries an idempotency key derived from the source event ID; retries are safe.
- **Dead-letter queue:** Failed integrations land in a DLQ visible in the War Room; an on-call integration engineer is paged if DLQ depth exceeds 50 messages.
- **Field-level mapping:** A visual mapper (Workato recipe or Mule DataWeave) handles schema translation; mappings are versioned in Git.

### Observability

**Metrics:** Prometheus + Grafana. RED metrics (Rate, Errors, Duration) per API endpoint; business metrics (registrations/min, badge throughput, meeting match latency) on a separate dashboard.

**Logs:** Structured JSON to OpenSearch. Every log entry carries `tenant_id`, `event_id`, `actor_id`, `trace_id` (W3C trace context), and `correlation_id`.

**Tracing:** OpenTelemetry SDK in every service; traces sampled at 10% default, 100% for break-glass operations and errors.

**Synthetic monitoring:** A synthetic probe simulates a full attendee journey (register, check in, scan into a session, request a meeting) every 5 minutes from three geographic locations; degradations page the on-call SRE.

### Security Posture

- **Encryption at rest:** AES-256 via AWS KMS customer-managed keys, rotated annually.
- **Encryption in transit:** TLS 1.3 mandatory; mTLS for service-to-service within the VPC.
- **PII handling:** VIP personal data (passport, dietary, medical) is encrypted at the column level with envelope encryption; only the Protocol service has the DEK.
- **Secrets:** AWS Secrets Manager; rotated every 90 days; access via IAM roles, not static credentials.
- **Penetration testing:** Annual third-party pentest plus internal red-team exercise 60 days before each FMF-class event.

### Deployment Pipeline

- **Source:** GitHub Enterprise (monorepo for core, separate repos for mobile apps).
- **CI:** GitHub Actions; every PR triggers lint, unit tests, integration tests against ephemeral Postgres, and a Snyk dependency scan.
- **CD:** Argo CD with GitOps; merges to `main` deploy to `staging` automatically, to `prod` after manual approval from a release captain.
- **Rollback:** Argo CD rollback within 90 seconds; database migrations are forward-only with a documented remediation runbook per migration.
- **Feature flags:** LaunchDarkly; every user-visible feature is flagged; flags auto-expire 90 days after release.

### Capacity and Sizing

Production sizing for FMF-class events (assumed in appendix):

- Core domain monolith: 6 instances, 8 vCPU / 32 GB RAM each, behind NLB.
- Analytics service: 4 instances, 4 vCPU / 16 GB RAM.
- Mobile BFF: 6 instances, 2 vCPU / 4 GB RAM.
- PostgreSQL: r6g.4xlarge primary + 2 read replicas, multi-AZ.
- ClickHouse: 3-node cluster, r6g.4xlarge each.
- Redis: cluster mode, 6 nodes, r6g.2xlarge.
- Kafka: 3 brokers, m6g.2xlarge, 7-day retention, RF=3.
- Total infrastructure cost estimate (3-day event window + 30-day prep + 30-day post): ~US$ 145,000.
