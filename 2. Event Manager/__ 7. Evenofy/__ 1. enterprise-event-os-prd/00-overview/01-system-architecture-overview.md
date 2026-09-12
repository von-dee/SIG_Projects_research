> Enterprise Event OS → Overview → System Architecture

## System Architecture Overview

### Purpose

Provide a resilient system of record without forcing every peripheral system to be replaced. The design must sustain high-volume ingress while a venue network is degraded.

### Architecture

The platform is a modular API-first application: web consoles and mobile clients call a gateway; domain services own transactional data; an event bus publishes immutable domain events; an integration worker manages vendor adapters, retries, and dead-letter queues. A lakehouse receives pseudonymized event streams. Use PostgreSQL for OLTP, Redis for short-lived state, object storage for assets/evidence, and a queue such as Kafka or SNS/SQS.

```text
Web / Mobile / Kiosk -> API Gateway -> Domain services -> PostgreSQL
                                      |-> Event bus -> Integration workers -> Vendors
                                      |-> Object storage / search / lakehouse
Offline scanner / staff app -> encrypted local store -> sync API
```

### Canonical contract

| Entity | Key fields | Relationships |
|---|---|---|
| `event` | `id UUID`, `tenant_id UUID`, `timezone IANA`, `status enum` | parent of all operational records |
| `person` | `id UUID`, `legal_name text`, `email citext`, `privacy_state enum` | may have registrations, roles, credentials |
| `organization` | `id UUID`, `type enum`, `legal_name text` | owns contacts, contracts, booths |
| `audit_event` | `id UUID`, `actor_id UUID`, `action text`, `before jsonb`, `after jsonb`, `at timestamptz` | references protected mutation |
| `integration_delivery` | `id UUID`, `provider enum`, `idempotency_key text`, `status enum`, `attempts int` | belongs to domain event |

All write APIs require `Idempotency-Key`; all reads and writes are scoped by `tenant_id,event_id`; every permission-sensitive mutation produces `audit_event`.

### Security and non-functional requirements

OIDC/SAML SSO, MFA for privileged roles, RBAC plus event-scoped ABAC, encryption in transit and at rest, secrets in a vault, WAF/rate limits, SIEM export, and quarterly access reviews are required. RPO is 15 minutes and RTO is 4 hours for core web services. Gate and staff workflows must continue for 12 hours offline using signed entitlement snapshots. Availability target during event days is 99.95% excluding planned maintenance.

### Integration rules

Adapters normalize external IDs into `external_reference`. Webhooks are signature-verified, replay-safe, and placed in a quarantine state on schema failure. Outbound changes use an outbox table; retries use exponential backoff and never duplicate a financial posting or credential issuance.
