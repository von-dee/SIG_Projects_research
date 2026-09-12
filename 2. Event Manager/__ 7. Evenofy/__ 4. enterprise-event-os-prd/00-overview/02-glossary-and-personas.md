> Module 0: Overview → 0.2 Glossary and Personas

## Glossary and Personas

### Glossary

The following terms appear throughout this PRD with the precise meaning defined here. When capitalized in module files (e.g., "the Run-of-Show"), the definition below applies.

| Term | Definition |
|---|---|
| **Aggregate** | A cluster of domain objects treated as a single unit for data consistency (e.g., a Registration aggregate includes the attendee, their badge, and their access entitlements). |
| **B2B Matchmaking** | Algorithmic and human-curated matching of business attendees for the purpose of scheduling 1:1 meetings during the event. |
| **Break-Glass** | Elevated-privilege action requiring two-person approval and producing a high-severity audit event. |
| **Credential** | The combination of an attendee identity and their access entitlements (zone, session, time window). |
| **Dignitary** | An attendee classified as VIP with a protocol rank of 1-5. Dignitaries are subject to protocol rules (seating, holding-room assignment, transport). |
| **Event Log** | The append-only Kafka stream of domain events, used as the source of truth for audit and analytics. |
| **FMF** | Future Minerals Forum. The reference event for scale and complexity. |
| **G2G Matchmaking** | Government-to-government meeting scheduling, distinct from B2B in that meeting participants represent sovereign entities and the meeting record is treated as a diplomatic artifact. |
| **Holding Room** | A private backstage space assigned to a dignitary and their delegation for use before/after a stage appearance. |
| **Kafka Topic** | A named stream of events in the System's event bus. Topics are prefixed with the bounded context name (e.g., `vip.seating.changed`). |
| **Pass** | A physical or digital artifact that grants an entitlement to enter a zone or session at a specific time. |
| **Protocol Rank** | An integer 1-5 representing diplomatic seniority, where 1 = Head of State, 2 = Head of Government, 3 = Minister, 4 = Deputy Minister / Ambassador, 5 = Senior Official. |
| **Run-of-Show (ROS)** | The minute-by-minute operational script for a session or the event as a whole. Includes cues for content, AV, lighting, F&B, security, and protocol. |
| **Sponsor** | A commercial entity that has paid for a sponsorship package granting specific entitlements (booth, branding, speaking slots, attendee quota). |
| **Sponsorship Tier** | A named commercial package (Platinum, Gold, Silver, etc.) with a fixed price and a fixed entitlement set. |
| **Tenant** | An isolated customer environment. The System is multi-tenant; every record carries a `tenant_id`. |
| **War Room** | The physical and virtual command center where the Event Director and senior ops staff sit during the event. The Master Dashboard is the digital surface of the War Room. |
| **Zone** | A geographically bounded area of the venue with a defined access policy (e.g., "Plenary Hall", "VIP Holding", "Media Center"). |

### Personas

The System serves 14 primary personas. Each persona's name, role, and the modules they primarily interact with are listed below. Permissions matrices in each module reference these persona names.

#### P1 - Event Director (ED)

- **Who:** Single accountable owner of the event. Reports to the Forum's Secretary-General.
- **Modules:** All, with emphasis on Master Dashboard (1), VIP Protocol (2), Finance (9).
- **Permissions:** Read on everything; write only on strategic levers (event-level config, sponsorship pricing tiers, protocol rank overrides via break-glass).
- **Typical day at FMF:** Opens War Room at 06:00, walks ROS with Ops Lead at 06:30, joins Ministerial motorcade briefing at 07:15, reviews incident log at 12:00 and 18:00, signs off on day-end commercial summary at 22:00.

#### P2 - Operations Lead (OL)

- **Who:** Day-of execution owner. Reports to the Event Director.
- **Modules:** Master Dashboard (1), Ops & Logistics (8), Mobile App Staff Console (7), Registration/Access (6).
- **Permissions:** Read on most operational modules; write on resources, run-of-show, incidents; cannot modify commercial or protocol records.
- **Typical day:** Drives the 06:30 ops standup, dispatches floor teams via Staff App, owns incident triage, gates the F&B service window.

#### P3 - Protocol Officer (PO)

- **Who:** Diplomatic protocol specialist, typically seconded from a foreign ministry. Reports to the Event Director for event purposes.
- **Modules:** VIP & Diplomatic Protocol (2), Mobile App (7).
- **Permissions:** Read on dignitary profiles and protocol rules; write on protocol ranks (with break-glass for cross-rank reassignments), seating assignments, holding-room allocations.
- **Typical day:** Reviews dignitary arrival manifest at 05:30, validates seating charts at 07:00, shadows ministerial arrivals through holding rooms, troubleshoots protocol conflicts in real time.

#### P4 - VIP Liaison (VL)

- **Who:** Assigned 1:1 to a specific dignitary (or delegation) for the duration of the event. Acts as the dignitary's point of contact for all logistical matters.
- **Modules:** VIP Liaison Shadow App (2.4), Mobile App (7).
- **Permissions:** Read on their assigned dignitary's full profile; write on dignitary status (arrival, location, next cue); cannot modify protocol rank or seating.
- **Typical day:** Meets motorcade at curb, escorts dignitary through security and holding room, communicates real-time status (ETA, "ready in holding", "on stage in 90 seconds") back to the Protocol team via the Shadow App.

#### P5 - Registration Manager (RM)

- **Who:** Owns the registration funnel and the onsite check-in experience.
- **Modules:** Registration, Access & Badging (6), Master Dashboard (1, for throughput monitoring).
- **Permissions:** Read/write on registrations, badges, credentials; cannot modify protocol or commercial records.
- **Typical day:** Monitors registration conversion in the lead-up; on event day, owns the check-in hall, manages volunteer staffing, escalates badge-print failures.

#### P6 - Sponsorship Sales Lead (SSL)

- **Who:** Commercial owner of sponsorship revenue. Reports to the Event Director on commercial matters.
- **Modules:** Commercial & Exhibition (5), Finance (9, read-only on invoices).
- **Permissions:** Read/write on sponsor records, deal pipeline, booth allocations; cannot modify protocol records or run-of-show.
- **Typical day:** Reviews pipeline-to-target pacing; on event day, walks the exhibition floor, hosts sponsor breakfasts, logs informal commitments in the Lead Capture tool.

#### P7 - Exhibitor Portal User (EPU)

- **Who:** An employee of a sponsoring or exhibiting company, logging into the Sponsor/Exhibitor portal to manage their company's presence.
- **Modules:** Commercial & Exhibition (5), Mobile App (7).
- **Permissions:** Read/write only on their own company's booth, staff list, lead capture; no access to other exhibitors or to internal ops data.
- **Typical day:** Pre-event: uploads booth graphics, registers their staff, books meeting pods. On-event: receives leads via the Lead Capture tool, exports their lead list.

#### P8 - Content & Stage Manager (CSM)

- **Who:** Owns the agenda, speaker experience, and stage execution. Reports to the Operations Lead.
- **Modules:** Content & Stage (4), Mobile App (7).
- **Permissions:** Read/write on sessions, speakers, run sheets; read on registrations (for speaker lookup); no access to commercial or finance.
- **Typical day:** Pre-event: curates agenda, manages speaker onboarding, rehearses. On-event: drives stage cues, manages speaker green room, owns the live stream handoff.

#### P9 - Matchmaking Concierge (MC)

- **Who:** A human curator who reviews algorithmic match suggestions and intervenes to schedule high-value meetings. Typically a team of 4-6 for FMF.
- **Modules:** Matchmaking & Meeting Hub (3).
- **Permissions:** Read on attendee profiles (subject to consent flags); write on meeting requests, matches, and meeting room assignments; no access to commercial or protocol records.
- **Typical day:** Reviews daily match queue at 07:00, intervenes on VIP meeting requests, handles room-overflow situations, post-event reviews meeting acceptance rates.

#### P10 - Finance & Administration Lead (FAL)

- **Who:** Owns the event P&L, AP/AR, procurement, and compliance.
- **Modules:** Finance & Administration (9).
- **Permissions:** Read/write on budgets, invoices, POs, GL postings; read-only on commercial pipeline (cannot modify deals).
- **Typical day:** Pre-event: approves POs, reconciles sponsorship receipts. On-event: monitors budget pacing, escalates cost overruns, handles expense approvals. Post-event: closes the books, prepares sponsor ROI statements.

#### P11 - Marketing & PR Lead (MPL)

- **Who:** Owns external communications, media relations, and campaign performance.
- **Modules:** Marketing, PR & Media (10).
- **Permissions:** Read/write on campaigns, accreditation, press releases, social listening; no access to internal ops data except aggregate metrics.
- **Typical day:** Pre-event: runs registration campaigns, accredits media, prepares press kits. On-event: manages press conferences, monitors social sentiment, escalates PR risks.

#### P12 - ESG & Sustainability Officer (ESGO)

- **Who:** Owns the event's environmental and social impact reporting.
- **Modules:** ESG & Sustainability (11).
- **Permissions:** Read on supplier, F&B, transport, and waste data; write on ESG metrics, supplier diversity flags, report configurations.
- **Typical day:** Pre-event: sets baselines and targets, screens suppliers. On-event: monitors real-time carbon and waste metrics, validates offset purchases. Post-event: authors the ESG report.

#### P13 - Field Volunteer (FV)

- **Who:** On-the-ground staff handling directional, check-in, F&B, and crowd management tasks. Typically 200-400 for FMF.
- **Modules:** Mobile App Staff Console (7).
- **Permissions:** Read on zone maps, session schedules, attendee lookup (limited fields); write on scan events and incident reports (cannot close incidents).
- **Typical day:** Reports to zone lead at 06:00, scans attendees into sessions, redirects lost attendees, escalates incidents to Zone Lead.

#### P14 - Attendee (ATT)

- **Who:** The end participant. Includes everyone from a junior investor to a Head of State (dignitaries are a special class of attendee).
- **Modules:** Mobile App Attendee surface (7), Matchmaking (3), Registration (6, pre-event).
- **Permissions:** Read on their own profile, schedule, meetings, and the public agenda; write on their own profile fields and meeting requests.
- **Typical day:** Pre-event: registers, builds profile, requests meetings. On-event: navigates venue via app, joins sessions, scans into B2B meetings, rates sessions.

### Persona-to-Module Permission Matrix (Summary)

| Persona | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ED | R/W* | R/W* | R | R | R | R | R | R | R | R | R | R |
| OL | R/W | R | R | R | R | R | R/W | R/W | R | R | R | R |
| PO | R | R/W* | R | R | – | R | R | R | – | – | – | R |
| VL | R | R/W (own) | – | – | – | – | R/W | – | – | – | – | – |
| RM | R | – | – | – | – | R/W | R/W | R | – | – | – | – |
| SSL | R | – | R | – | R/W | R | R/W | R | R | – | – | R |
| EPU | – | – | – | – | R/W (own) | – | R | – | – | – | – | – |
| CSM | R | R | – | R/W | – | R | R/W | R | – | – | – | R |
| MC | R | – | R/W | R | R | R | R | R | – | – | – | R |
| FAL | R | – | – | – | R | – | R | R | R/W | – | – | R |
| MPL | R | – | – | R | – | R | R/W | – | – | R/W | – | R |
| ESGO | R | – | – | – | R | – | R | R/W | R | – | R/W | R |
| FV | R (limited) | – | – | R (limited) | – | R/W (scan) | R/W | – | – | – | – | – |
| ATT | – | – | R/W (own) | R | – | R/W (own) | R/W (own) | – | – | – | – | – |

`R` = read, `W` = write, `R/W*` = with break-glass, `(own)` = only own records, `(limited)` = field-level restrictions apply.

### Persona Discovery Notes

Personas were derived from observed roles at FMF 2023-2025 and comparable international forums (Davos, COP, Munich Security Conference). The VL (VIP Liaison) persona in particular is non-obvious; it exists because at FMF scale, protocol officers cannot personally escort every dignitary, and a delegated "shadow" model with a dedicated app surface is required. The MC (Matchmaking Concierge) persona is similarly non-obvious; purely algorithmic matchmaking at G2G scale produces diplomatic incidents (e.g., matching representatives of two countries in active dispute), so a human-in-the-loop curator with the right tooling is mandatory.
