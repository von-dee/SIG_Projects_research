> Module 0: Overview → 0.0 Executive Summary

## Executive Summary

### Purpose of this Document

This Product Requirements Document (PRD) defines the functional, data, integration, and operational specification for the **Enterprise Event Management Operating System** (hereafter "the System"), a unified platform purpose-built to plan, execute, and close out large-scale international forums at the complexity of the **Future Minerals Forum (FMF)**: 10,000+ in-person attendees, 100+ sovereign delegations, 60+ ministerial-level speakers, US$ 9B+ in announced sponsorship and offtake deals, multi-day multi-venue programming, and diplomatic protocol requirements that carry geopolitical consequences if mishandled.

The document is written for three concurrent audiences. The **CTO/VP Engineering** needs the data model, integration topology, and failure-mode analysis required to begin sprint planning and infra sizing immediately. **Product Managers** need user flows, role definitions, and acceptance criteria detailed enough to write Jira epics without re-clarification. The **Event Director/Ops Lead** needs business logic that maps to real-world run-of-show, protocol, and commercial reality so they can validate the spec against operational experience.

### Why a Unified Operating System (and Not a Stack of Point Tools)

At FMF scale, the typical event tooling stack (Cvent for registration, Bizzabo for the app, Whova for matchmaking, Excel for seating, WhatsApp for ops, Marketo for marketing) fails on three counts. First, **data fragmentation**: a sponsor's status is spread across five systems, making reconciliation a 40-person-week exercise post-event. Second, **latency**: protocol changes need to propagate to seating, transport, and badging in under 60 seconds, which is impossible when those systems are loosely coupled via nightly CSV syncs. Third, **audit liability**: when a head-of-state motorcade arrives 11 minutes late, the question "who knew what when" must be answerable from a single event log, not reconstructed from chat threads.

The System addresses this by owning the canonical data layer for every operational entity (attendee, dignitary, sponsor, booth, session, asset, transaction) and exposing role-scoped surfaces on top of that layer. Point tools are not eliminated; they are integrated as edge services (printing, scanning, streaming) where their specialization matters, with the System acting as the system of record.

### Scope

The System covers 12 functional modules, listed below. Each module is decomposed into 3-4 sub-sections in the body of this PRD. A 13th module (Legal & Cybersecurity) is proposed in the appendix as a candidate addition.

1. Master Dashboard & "War Room" Command Center
2. VIP & Diplomatic Protocol Management
3. B2B / G2G Matchmaking & Meeting Hub
4. Content & Stage Management System
5. Commercial & Exhibition Management
6. Registration, Access Control & Badging
7. Mobile App (Attendee & Staff Facing)
8. Operations, Logistics & F&B Management
9. Finance & Administration Module
10. Marketing, PR & Media Center
11. ESG & Sustainability Tracker
12. Post-Event Analytics & Data Engine

### Design Principles

The System is built on six non-negotiable principles, every one of which is enforced as an architectural constraint in subsequent sections.

**P1: Single Source of Truth.** Every operational entity has exactly one canonical record. All UI surfaces are views onto that record; no module maintains a private copy that can drift.

**P2: Offline-First for Field Staff.** Every staff-facing surface (mobile app, kiosk, scanner) must remain fully functional during a complete network outage for at least 90 minutes, with conflict-free merge on reconnect. This is non-negotiable because event venues routinely lose WiFi during peak load.

**P3: Protocol-Grade Auditability.** Every state change to a VIP, diplomatic, security, or financial record is captured in an append-only event log with actor identity, timestamp, source device, and prior state. Logs are exportable in W3C JSON-LD format for forensic review.

**P4: 60-Second Propagation.** A change to a canonical record (e.g., dignitary protocol rank, sponsor payment status, session cancellation) must propagate to every dependent surface (seating chart, badge entitlements, agenda app, sponsor portal) within 60 seconds at p95, 120 seconds at p99.

**P5: Role-Based Access with Break-Glass.** Standard operations run under least-privilege RBAC. A break-glass override exists for every privileged action, requires two-person approval, and writes a high-severity audit event visible to the Event Director within 5 seconds.

**P6: Multi-Tenant by Default.** The System supports running concurrent events (e.g., FMF 2026 Riyadh and FMF 2026 Doha regional summit) on shared infrastructure with strict tenant isolation. A `tenant_id` is the first column of every operational table.

### Target Scale Assumptions

The System is sized for the following peak-load envelope. These are assumptions, documented in the appendix; they should be re-validated against actual FMF metrics before infrastructure provisioning.

| Dimension | Peak Load | Sustained Load |
|---|---|---|
| Registered attendees | 12,000 | 8,000 concurrent onsite |
| Dignitaries (protocol rank 1-3) | 350 | n/a |
| Concurrent mobile app sessions | 9,000 | 6,000 |
| Concurrent staff console sessions | 220 | 140 |
| Sessions across 3 days | 180 | 60 concurrent rooms |
| B2B meeting slots over 3 days | 4,500 | 1,500/day |
| Exhibitor booths | 240 | n/a |
| Real-time telemetry events/sec | 8,000 | 3,500 |
| Print jobs during peak check-in | 1,400/hr | 600/hr sustained |
| Media accredited | 600 | n/a |

### Technology Posture (Summary)

Detailed in `01-system-architecture-overview.md`. Headline choices: polyglot persistence (PostgreSQL for transactional records, ClickHouse for analytics, Redis for hot state, S3-compatible object store for media), event-driven backbone via Kafka, GraphQL federation for read surfaces, React + React Native for web and mobile respectively, on Kubernetes with active-active multi-region deployment.

### Out of Scope

The System does not attempt to replace: physical security systems (X-ray, metal detection, perimeter CCTV), sovereign-government databases (visa issuance, immigration), or financial general ledgers (it integrates with the customer's existing ERP via REST). It does not provide AI-powered translation of diplomatic correspondence (a human-in-the-loop translation workflow is integrated instead).

### Reading Order for Reviewers

- **CTO/VP Engineering:** Start at `01-system-architecture-overview.md`, then read every module's "Failure Modes" and "Integrations" sections.
- **Product Managers:** Read `02-glossary-and-personas.md` first, then walk every module in order, focusing on User Roles, Business Logic, and Acceptance Criteria.
- **Event Director/Ops Lead:** Read modules 1, 2, 6, 7, 8 first; these define the live-event control surfaces. Then skim 3, 4, 5 for commercial and content validation.

### Success Criteria for the PRD Itself

This document is complete when: (a) an engineering team can draft a Jira epic breakdown with no follow-up questions, (b) an Ops Lead can walk the run-of-show for a sample plenary and trace every actor's actions through the System, and (c) every named integration in the document corresponds to a real vendor whose API documentation can be cited.
