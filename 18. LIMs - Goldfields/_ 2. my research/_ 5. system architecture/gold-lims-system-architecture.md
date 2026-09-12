# Gold Bullion LIMS & Traceability Platform
## Full System Architecture — Hardware, Software, Modules & Data Model

*Companion technical spec to the LIMS market/opportunity analysis (Aug 2026)*

---

## 1. Architecture Overview

The system is a **layered, offline-first, event-sourced platform** built around one core idea: every physical transformation in the gold chain (Section 1.1 of the market doc) is a first-class, immutable event linked by parent-child references, from raw sample to serialized bullion bar. Five layers sit on top of that data spine:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 5 — Compliance & Reporting                                │
│  (LBMA CoO Annex, OECD 5-Step, GoldBod submission generators)    │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 4 — Analytics & BI                                        │
│  (TAT, recovery %, mass-balance variance, anomaly detection)     │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3 — Core Domain Services                                  │
│  (Sample/Batch/Assay engine, custody chain, user/role, workflow) │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2 — Trust & Ledger Layer                                  │
│  (Hash-chained audit log → permissioned ledger → blockchain)     │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1 — Capture & Integration                                 │
│  (Mobile field app, edge cache, instrument middleware)           │
└─────────────────────────────────────────────────────────────────┘
```

Design principle: **capture works with zero connectivity; everything above Layer 1 reconciles when a connection appears.** This is the single biggest differentiator versus every incumbent product reviewed in the market analysis — none of them are built offline-first.

---

## 2. Hardware Landscape (what physically connects to the system)

### 2.1 Lab instruments (Layer 1 — instrument integration)

| Instrument class | Examples | Connection method | Notes |
|---|---|---|---|
| **Analytical/micro balances** | Sartorius, Mettler Toledo, OHAUS | RS232 serial → USB-serial adapter, or direct USB/Ethernet on newer models | Highest-frequency data point (bead/button mass); needs calibration-status linkage, not just raw reading |
| **XRF analyzers** (handheld & benchtop) | Olympus Vanta, Bruker Tracer, Niton | USB export file, Bluetooth on handhelds, RS232 on older benchtop units | Treat as "file drop" integration first (matches OnLIMS' proven approach); vendor SDK integration is phase 2 |
| **AAS (Atomic Absorption Spectrometers)** | Thermo iCE, PerkinElmer PinAAcle | RS232 or vendor software CSV export to watched folder | Rarely has an open API; plan for file-based capture |
| **ICP-OES/MS** | Agilent, Thermo iCAP | Vendor software CSV/LIMS-export plug-in where available, else file-based | Lower priority for MVP — mostly refinery/large-lab tier |
| **Furnaces** (fusion, cupellation, muffle) | Various | Usually **no data interface** — temperature/timestamp logged manually or via a cheap IoT thermocouple logger (ESP32 + thermocouple + Wi-Fi/LoRa) | A low-cost DIY IoT retrofit here is a genuine differentiator — nobody in the competitive set does this |
| **Barcode/QR scanners** | Standard USB/Bluetooth 1D/2D scanners | USB-HID or Bluetooth | For sample ID and bar-serial scanning at every handoff point |
| **Label printers** | Zebra, Brother thermal | USB/Bluetooth/Wi-Fi, driver via printing SDK | Prints sample IDs, bar serials, QR-coded certificates |

### 2.2 Field & site hardware (Layer 1 — mobile capture)

| Hardware | Purpose |
|---|---|
| Android tablets/phones (ruggedized preferred — e.g., CAT, Samsung XCover) | Offline-first mobile app for buying-station and site data entry |
| GPS module (built into device) | Geo-tags sample origin, buying-station location — required for GoldBod traceability and OECD risk-mapping |
| Camera (built into device) | Photo evidence of sample, bag seals, bar serials, signatures |
| Portable Bluetooth/USB scale | For field weighing at buying stations before formal lab receipt |
| Feature-phone / basic phone | SMS/USSD fallback channel for sites with no smartphone or data plan (Phase 3) |

### 2.3 Edge/site infrastructure

| Hardware | Purpose |
|---|---|
| Small edge server or NUC-class mini-PC at each assay lab | Local database cache, local sync hub for instruments and tablets, buffers data during connectivity outages |
| 4G/LTE router with local Wi-Fi (e.g., a MiFi/CPE with SIM) | Primary connectivity at remote sites; edge server syncs opportunistically over this link |
| UPS/battery backup | Protects edge server and instruments from Ghana's variable grid power |
| Local NAS or external drive | Rolling backup of edge-cached data before cloud sync |

### 2.4 Central/cloud infrastructure

| Hardware (cloud-abstracted) | Purpose |
|---|---|
| Application servers (containerized, autoscaling) | Core domain services, APIs |
| Managed relational database (primary store) | Source-of-truth object graph |
| Object storage | Photos, signed documents, PDF certificates, raw instrument export files |
| Ledger nodes (if permissioned blockchain is used) | Hyperledger Fabric peer nodes — can be hosted on the same cloud or split across GoldBod/refiner/regulator organizations for genuine multi-party trust |
| Message queue / event bus | Reconciles offline-synced events, drives BI pipeline and compliance generation asynchronously |

---

## 3. Software Architecture

### 3.1 Layer 1 — Capture & Integration

**Mobile field app**
- Cross-platform: React Native or Flutter (offline-first is the hard requirement, not the framework choice)
- Local embedded database (SQLite / WatermelonDB / Realm) with a sync engine (custom, or a framework like PowerSync/ElectricSQL) that queues writes locally and syncs to the central API when connectivity returns
- Conflict resolution strategy: append-only event log per device, server-side merge by timestamp + device ID — never overwrite, only append (critical for audit integrity)
- Digital signature capture (finger-drawn signature widget), photo capture with EXIF/GPS embedding, QR/barcode generation and scanning

**Instrument middleware service**
- Runs on the edge server at each lab
- Serial listener service (per instrument, configurable baud/parity) parsing known output formats into structured readings
- File-watcher service monitoring vendor-software export folders (CSV/TXT), parsing on file-create events
- Normalizes all instrument output into one canonical `InstrumentReading` event before it enters the core data model — this abstraction is what lets you add new instrument models later without touching core logic
- Local buffering with retry/backoff if the edge server itself temporarily can't reach the cloud API

**Edge cache/sync service**
- Local REST/GraphQL API mirroring the cloud schema for a single site
- Scheduled or connectivity-triggered sync jobs (delta sync, not full re-upload)
- Local read access for lab staff even when the site is fully offline

### 3.2 Layer 2 — Trust & Ledger Layer

- **MVP:** cryptographic hash-chaining of every event (Merkle-tree style, Chainpoint-like) computed server-side on write; each record stores the hash of its own content plus the hash of the previous record in that entity's chain. Tamper-evident and independently verifiable without needing a distributed ledger network yet.
- **Phase 3:** migrate/augment to a permissioned ledger (Hyperledger Fabric is the natural choice — private, multi-org, no cryptocurrency/token overhead) with GoldBod, a refiner, and an independent auditor each running a peer node, so no single party (including your company) can unilaterally alter history.
- **Phase 4 (only if mandated):** anchor periodic Merkle roots to a public blockchain for external verifiability, without putting raw custody data on a public chain.
- Every write from Layers 1/3 goes through this layer before being considered "committed" — this is what makes the audit trail a genuine trust primitive rather than just a database log.

### 3.3 Layer 3 — Core Domain Services (the heart of the system)

Organized as domain-driven microservices (or a well-modularized monolith for MVP — microservices are a Phase 3+ concern, not a Day 1 one):

- **Sample & Custody Service** — owns the object graph in Section 4 below; enforces parent-child linkage rules (e.g., a `CupellationRun` cannot exist without a valid `LeadButton` parent)
- **Workflow/Method Engine** — encodes standard method sequences (fire assay, XRF screening, wet chemistry) as configurable state machines; guides lab techs step-by-step (equivalent to SampleManager's "Laboratory Execution System")
- **QA/QC Service** — manages CRM (certified reference material) expected values, auto-flags out-of-tolerance results, triggers re-run workflows
- **Mass-Balance/Reconciliation Service** — computes feed-grade × tonnage vs. bullion + tailings + slag output; flags variance beyond configurable thresholds (AMIRA-style metal accounting)
- **Identity & Access Service** — role-based access control (lab tech, supervisor, compliance officer, auditor, regulator read-only), electronic signatures, session/audit logging aligned to 21 CFR Part 11-style expectations
- **Instrument Calibration Service** — tracks calibration schedules/status per instrument; blocks or flags results captured on an out-of-calibration instrument
- **Notification Service** — push alerts (mobile), email/SMS for QA failures, calibration due dates, reconciliation variances

### 3.4 Layer 4 — Analytics & BI

- Event-stream consumer (from the message queue) feeding a reporting/analytics data store (star-schema warehouse or a columnar store like ClickHouse/Postgres+TimescaleDB for smaller deployments)
- Dashboards: turnaround time (TAT) per stage, gold recovery %, instrument utilization, mass-balance variance trends, per-site throughput
- **Anomaly detection module** (Phase 3): statistical/ML flagging of sites "overproducing" relative to declared capacity — the Circulor-style smuggling signal — plus outlier detection on assay results vs. historical site averages
- Visualization layer: embeddable charts (e.g., using a charting library server-rendered into the dashboard, or a BI tool like Metabase/Superset white-labeled)

### 3.5 Layer 5 — Compliance & Reporting

- **Template-driven document generator** — the single most defensible feature. One source of truth (the custody object graph) feeds multiple output templates:
  - LBMA Responsible Gold Guidance **Step 5** Country-of-Origin Annex format
  - OECD 5-Step due-diligence report format
  - GoldBod submission format (Act 1140, Section 26–31 requirements)
- Templates are versioned and swappable — when a regulator changes its format (expected, given Act 1140 is newly implemented), you update a template, not application code
- Digital certificate generator: per-bar Certificate of Analysis (CoA) as a signed PDF with an embedded QR code linking back to the full custody chain in the system
- Export connectors/interfaces (Phase 3) to Minerals Commission, Ghana Standards Authority, Ghana Revenue Authority, and Environmental Protection Authority systems, or at minimum clean file-export formats each can ingest

### 3.6 Cross-cutting: API layer

- REST + GraphQL API exposed centrally, versioned, documented (OpenAPI spec)
- Public-facing verification endpoint: anyone with a bar's QR code can query a read-only, minimal-disclosure view of its custody chain (satisfies buyer due-diligence checks without exposing full internal lab data)
- Webhook/event system for future integration into whatever central GoldBod platform is ultimately mandated (per the "picks and shovels" go-to-market strategy)

---

## 4. Core Data Model (object graph)

Mirrors the physical chain in the market analysis, one table/entity per transformation stage, each carrying mass-in/mass-out fields for automatic reconciliation:

```
Site ──< User/Role
  │
  └──< Sample (unique ID, GPS, collector, chain-of-custody signature)
         │
         └──< PrepBatch (drying/crushing/riffling — mass before/after)
                │
                └──< FusionRun (furnace ID, flux recipe, operator, temp log)
                       │
                       └──< LeadButton (mass, linked slag record)
                              │
                              └──< CupellationRun (cupel batch, furnace log)
                                     │
                                     └──< DoréBead (mass, balance ID/calibration ref)
                                            │
                                            ├──< PartingRun (pre/post mass) ──< FinalGold
                                            │
                                            └──< InstrumentReading (AAS/ICP/XRF, raw + calibrated)
                                                   │
                                                   └──< QAQCReference (CRM expected vs actual, pass/fail)

FinalGold ──> BullionBar (serial #, gross weight, fineness, refiner mark)
                  │
                  └──> CertificateOfAnalysis (signed PDF, QR, full upstream chain link)

Slag ──> QAQCReference (retained for re-assay)

MassBalanceReport (Sample → BullionBar+Tailings+Slag reconciliation, variance flag)
```

Every entity carries: `created_by`, `created_at`, `device_id`, `hash_chain_prev`, `hash_chain_self`, and `sync_status` (for offline-first reconciliation).

---

## 5. Feature & Module Summary

| Module | Core features |
|---|---|
| **Mobile Field Capture** | Offline sample intake, GPS/photo/signature capture, QR generation, buying-station workflows, SMS/USSD fallback (Phase 3) |
| **Instrument Integration** | Serial + file-based ingestion, canonical reading normalization, calibration-status linkage |
| **Fire-Assay Chain Engine** | Full fusion → button → cupel → bead → parting → final-gold workflow with parent-child enforcement |
| **QA/QC** | CRM management, blank/duplicate tracking, auto-flagging, re-run triggers |
| **Mass Balance/Metal Accounting** | Feed-to-bullion reconciliation, variance alerts, AMIRA-style reporting |
| **Bullion & Certification** | Bar serialization, fineness recording, QR-coded CoA generation, public verification endpoint |
| **Trust/Ledger** | Hash-chained audit log (MVP) → permissioned ledger (Phase 3) → anchoring (Phase 4) |
| **Identity & Access** | RBAC, e-signatures, session audit trail |
| **BI/Analytics** | TAT, recovery %, utilization, variance dashboards; anomaly/smuggling-signal detection (Phase 3) |
| **Compliance Generator** | LBMA CoO Annex, OECD 5-Step report, GoldBod submission — one data source, three outputs |
| **Admin/Config** | Site/user management, instrument registry, template management, method/workflow configuration |

---

## 6. Suggested Tech Stack (illustrative)

- **Mobile:** React Native (or Flutter), SQLite/WatermelonDB local store, custom or PowerSync-style delta sync
- **Backend:** Node.js/NestJS or Python/FastAPI for core services; PostgreSQL as primary store (strong relational integrity for the parent-child object graph); Redis for caching/queues; Kafka or a lighter message broker (RabbitMQ) for the event bus
- **Edge:** Lightweight containerized services (Docker) on a NUC-class device, same codebase pattern as cloud services for consistency
- **Ledger:** Custom hash-chaining in MVP (a Postgres extension or application-layer implementation is sufficient); Hyperledger Fabric for Phase 3 permissioned ledger
- **BI:** Metabase or Apache Superset for dashboards; ClickHouse or TimescaleDB if data volume grows beyond what Postgres analytics can comfortably serve
- **Document generation:** Templated PDF generation (e.g., a headless-Chrome/HTML-to-PDF pipeline) for compliance documents and CoAs
- **Infra:** Kubernetes or a simpler managed-container platform for the cloud tier; object storage (S3-compatible) for photos/documents/raw instrument files

---

## 7. Security & Data-Sovereignty Notes

- Local hosting option for Ghana-based deployments should be available from day one — this is a strategic-national-commodity use case, and data-sovereignty scrutiny is likely (per the risk register in the market analysis)
- End-to-end encryption for data in transit (mobile ↔ edge ↔ cloud) and at rest
- Role-based, least-privilege access; every read/write attributable to a user and device
- Regular independent security audits — worth budgeting for given the compliance-facing nature of the product
- Backup/disaster-recovery plan at both the edge (local NAS) and cloud tier

---

This architecture is intentionally phased so the MVP (Section 9.1 of the market analysis) is buildable with a small team in 4–9 months, while the object model and API design leave room to grow into the full multi-tenant, ledger-backed, anomaly-detecting platform described in later phases — without a rewrite.
