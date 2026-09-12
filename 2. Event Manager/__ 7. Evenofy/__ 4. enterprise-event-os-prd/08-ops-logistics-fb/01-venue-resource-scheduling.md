> Module 8: Operations, Logistics & F&B Management -> 8.1 Venue Resource Scheduling

## Venue Resource Scheduling

### A. Purpose Statement

The Venue Resource Scheduling subsystem is the authoritative inventory and allocation engine for every physical asset consumed by the Future Minerals Forum: halls, breakout rooms, outdoor areas, AV equipment, lighting rigs, signage, furniture, power feeds, water taps, data drops, and skilled staff shifts. At FMF scale the platform books across three venues (main plenary, exhibition hall, off-site ministerial retreat), serves 10,000+ attendees across three days, and orchestrates 60+ ministerial sessions, 100+ sovereign delegation rooms, 200+ sponsor booths, and 40+ catered food events on a single constrained footprint. A double-booked hall at this scale does not produce an inconvenience; it produces a diplomatic incident.

The subsystem is the write-side owner of the `resource.*` Kafka topic prefix (per the Module 0.1 bounded context table). It publishes `resource.booking.created`, `resource.booking.updated`, `resource.booking.cancelled`, `resource.conflict.detected`, `resource.incident.relocated`, and `resource.inventory.adjusted`. It subscribes to `session.published` / `session.cancelled` (Module 4.1) to auto-create and auto-release bookings tied to sessions, to `sponsor_deal.confirmed` (Module 5.1) to auto-provision sponsor booth footprints, to `fnb.event.confirmed` (Module 8.3) to reserve F&B service areas, and to `transport.eta.updated` (Module 8.4) to extend VIP holding-room bookings if a motorcade is delayed. Its non-negotiable contract is that no two bookings for the same resource may overlap in time, that every booking has explicit setup and teardown buffers, and that the Operations Lead (OL) can see, at any moment, the precise utilization of every bookable resource on a single Gantt-style heatmap.

### B. User Roles & Permissions

Venue Resource Scheduling is the OL persona's primary surface during the prep phase and a critical escalation target during the live event. Permissions are enforced at the API gateway and refined at field-level via OPA/Rego.

- **Event Director (ED):** Read on all resources and bookings. Write only via break-glass on venue-incident auto-relocation overrides and on cross-venue capacity transfers. Sees a War Room tile summarizing utilization vs. capacity for the top 20 constrained resources.
- **Operations Lead (OL):** Primary user. Read/write on resources, bookings, floorplans, setup/teardown buffers, and conflict resolution. Can override auto-relocation proposals during a venue incident. Approves any booking that touches a protocol_rank 1-2 holding room.
- **Protocol Officer (PO):** Read-only on holding-room and VIP-route bookings; cannot modify venue layout. Write only on protocol-specific buffer extensions (e.g., requiring 30-minute motorcade-staging buffer before a Head of State session).
- **VIP Liaison (VL):** Read-only on the assigned dignitary's holding-room booking, motorcade-staging slot, and seated-session room. No write.
- **Registration Manager (RM):** Read-only on venue capacity vs. registration count, used to gate registration sell-by-venue. No write.
- **Sponsorship Sales Lead (SSL):** Read on availability of sponsor-tier booth footprints. Write on booth dimension change requests, which require OL co-approval when they encroach on neighboring space.
- **Exhibitor Portal User (EPU):** Read-only mirror of own booth's setup/teardown windows via the Exhibitor Portal (Module 5.3). No write on venue data.
- **Content & Stage Manager (CSM):** Write on session-linked room assignments (consumed by this subsystem via `session.published`). Read on room dimensions, AV inventory, and signage placement.
- **Matchmaking Concierge (MC):** Read on meeting-room availability for B2B pods. No write on bookings.
- **Finance & Administration Lead (FAL):** Read-only on venue rental cost accruals, equipment rental line items, and staff shift cost projections. No write.
- **Marketing & PR Lead (MPL):** Read on signage placement and brand-zone bookings for sponsor visibility audits. No write.
- **ESG & Sustainability Officer (ESGO):** Read on resource utilization efficiency, energy draw estimates for AV and lighting, and floorplan waste per zone. No write.
- **Field Volunteer (FV):** Read on setup/teardown tasks assigned to them via the Staff App (Module 7.2). No write on bookings.
- **Attendee (ATT):** No direct access. Sees only the room label and start time surfaced in the Attendee App agenda (Module 7.1).

### C. Data Model

`resource` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (OL or import service) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{autocad_block_id, skuvault_sku, workday_asset_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `resource_type` | `enum[space, equipment, utility, staff_skill]` | Top-level classification |
| `resource_subtype` | `text` | e.g., "hall", "breakout_room", "outdoor_courtyard", "av_projector_4k", "led_wall_6m", "power_63a_3ph", "data_10gbps_drop", "skill_simultaneous_interpreter_ar_en" |
| `venue_id` | `uuid` | FK -> venue.id; null for cross-venue skills |
| `floorplan_ref` | `text null` | AutoCAD/BricsCAD block handle for spaces |
| `capacity` | `int null` | For spaces: max occupants. For equipment: units available. For staff_skill: count of qualified staff. |
| `dimensions` | `jsonb null` | For spaces: `{length_m, width_m, height_m, area_m2}`. For equipment: `{weight_kg, power_kw}`. |
| `location_desc` | `text` | e.g., "Hall A, North Wing, Mezzanine Level" |
| `geoshape` | `jsonb null` | GeoJSON polygon for outdoor areas; point for indoor rooms; consumed by Mapwize (Module 7.1) |
| `standard_setup_buffer_min` | `int` | Default setup buffer in minutes, e.g., 120 for banquets |
| `standard_teardown_buffer_min` | `int` | Default teardown buffer, e.g., 60 |
| `utilization_policy` | `enum[exclusive, shareable, sequential]` | exclusive = one booking at a time; shareable = multiple concurrent (e.g., open hall); sequential = one booking at a time but no buffer required |
| `replacement_cost_usd` | `numeric(10,2)` | For equipment: insurance baseline |
| `is_relocatable` | `bool` | If true, can be auto-relocated during a venue incident |
| `compliance_tags` | `text[]` | e.g., `["fire_rated", "wheelchair_accessible", "vip_protocol_ready"]` |

`resource_booking` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL or auto-service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{session_id, sponsor_booth_id, fnb_event_id, transport_motorcade_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `resource_id` | `uuid` | FK -> resource.id |
| `booking_purpose` | `enum[session, sponsor_booth, fnb_service, vip_holding, motorcade_staging, staff_break, equipment_use, utility_draw]` | Drives default buffer rules |
| `linked_event_element_id` | `uuid null` | FK to the consuming element (session.id, sponsor_booth.id, fnb_event.id, etc.) |
| `occupancy_estimate` | `int` | Expected number of people or units in use; used for capacity validation |
| `setup_start_at` | `timestamptz` | Start of setup buffer |
| `event_start_at` | `timestamptz` | Start of actual use |
| `event_end_at` | `timestamptz` | End of actual use |
| `teardown_end_at` | `timestamptz` | End of teardown buffer |
| `setup_buffer_min` | `int` | Effective setup buffer (overrides resource default if set) |
| `teardown_buffer_min` | `int` | Effective teardown buffer |
| `status` | `enum[draft, pending_approval, confirmed, in_setup, live, in_teardown, completed, cancelled, relocated]` | Lifecycle |
| `priority` | `enum[p0_vip_protocol, p1_critical, p2_standard, p3_flex]` | p0 wins in auto-relocation |
| `conflict_resolution_state` | `enum[clear, flagged, resolved_manual, resolved_auto]` | Tracks conflict workflow |
| `assigned_staff_ids` | `uuid[]` | FK -> staff_profile.id, for setup/teardown crews |
| `approval_required_from` | `uuid[]` | FK -> persona_id; e.g., OL and SSL for sponsor encroachment |

`venue_incident` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL or FV via Staff App |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{pagerduty_incident_id, ol_ticket_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `venue_id` | `uuid` | FK -> venue.id |
| `affected_resource_ids` | `uuid[]` | FK -> resource.id, expanded list |
| `affected_booking_ids` | `uuid[]` | FK -> resource_booking.id, expanded list |
| `incident_type` | `enum[fire_damage, flood, power_loss, hvac_failure, security_lockdown, structural, biohazard, other]` | Drives relocation playbook |
| `severity` | `enum[s0, s1, s2, s3]` | s0/s1/s2/s3 scale reused from Module 1.2 |
| `detected_at` | `timestamptz` | When issue first observed |
| `expected_resolution_at` | `timestamptz null` | When venue is expected back online |
| `relocation_status` | `enum[proposed, auto_executed, manual_override, declined]` | Tracks auto-relocation workflow |
| `override_actor_id` | `uuid null` | If manual_override, who authorized |

### D. Business Logic & Edge Cases

- **IF** a `resource_booking` write would create a time overlap with an existing booking on the same `resource_id` where `utilization_policy = exclusive`, **THEN** the save is blocked at the application layer (before transaction commit) with a `resource.conflict.detected` event published, and the OL is shown both bookings side by side with three resolution options: relocate one to the next available equivalent resource, shrink one's window, or request co-approval to share (allowed only if `utilization_policy` is flipped to `shareable`, which itself requires OL + ED sign-off).
- **IF** a `utilization_policy = shareable` resource is booked such that combined `occupancy_estimate` exceeds `resource.capacity`, **THEN** block the save with an overcapacity warning naming the total and the threshold.
- **IF** a partial overlap exists between two bookings where the overlap window is entirely within the teardown buffer of the earlier booking and the setup buffer of the later booking (i.e., neither event window overlaps but buffers touch), **THEN** flag for resolution rather than blocking; the OL can approve a "buffer compression" that reduces both buffers by up to 50% with a justification note in `audit_log`.
- **IF** `booking_purpose = vip_holding` and the linked dignitary has `protocol_rank` 1 or 2, **THEN** the booking requires PO co-approval before `status = confirmed`, and the setup buffer is auto-inflated by 60 minutes to allow security sweep.
- **IF** a `session.published` event arrives from Module 4.1 and the session has no pre-existing `resource_booking`, **THEN** the engine auto-creates a draft booking with default buffers drawn from the resource type and surfaces it on the OL's "Pending Confirmation" queue.
- **IF** a `session.cancelled` event arrives, **THEN** the linked `resource_booking` is auto-released and a `resource.booking.cancelled` event is published; the teardown buffer is preserved if the next booking's setup can absorb it.
- **IF** a venue-incident workflow is triggered (e.g., fire damage reported via FV Staff App or PagerDuty webhook), **THEN** the engine computes the set of affected `resource_booking` records, ranks them by `priority` (p0 first), and proposes an auto-relocation plan that fits each affected booking into the nearest available equivalent `resource` of the same `resource_subtype`, preserving setup/teardown buffers; the OL has 10 minutes to override before the plan auto-executes.
- **IF** a sponsor requests a last-minute change to their booth dimensions that would encroach on a neighboring sponsor's allocated space (i.e., the new polygon intersects the neighbor's `geoshape`), **THEN** the engine blocks the change, publishes `resource.conflict.detected` with both `sponsor_booth_id` references, and requires explicit digital consent from the neighboring sponsor's EPU AND approval from SSL before the change is committed.

**Edge case (non-obvious): sponsor booth dimension change encroaches on neighbor.** Sponsor A (platinum) submits a booth redesign at T-3 days that increases their footprint from 6m x 6m to 8m x 6m, extending 2m into the aisle and partially overlapping Sponsor B's (also platinum) neighboring footprint by 0.5m. The system flags the conflict because the new polygon intersects Sponsor B's `geoshape` (computed via PostGIS `ST_Intersects`). The OL is shown both booths highlighted in red on the floorplan. The change cannot be saved until: (1) Sponsor B's EPU receives an in-portal notification with an "Approve" or "Reject" button (TTL 24h, then auto-reject), (2) SSL reviews the commercial implication (e.g., Sponsor B may receive a credit), and (3) OL confirms the aisle width still meets the venue's fire-marshal minimum (1.8m). All three approvals are recorded in `approval_required_from` with timestamps. If Sponsor B rejects, Sponsor A's change is reverted and they are notified with alternative expansion options (e.g., a corner upgrade at additional cost).

**Edge case (non-obvious): venue space goes offline the day before the event.** At 22:00 on Day -1, a small fire in the HVAC plant of Hall B causes the venue safety officer to declare Hall B offline for 48 hours. Hall B holds 14 confirmed bookings across Day 1, including a p0 VIP reception (protocol_rank 1-2), three p1 ministerial roundtables, and ten p2 breakout sessions. The OL (paged via PagerDuty within 60 seconds of the venue safety officer's report being uploaded) opens the venue-incident workflow. The engine computes the relocation plan: the p0 VIP reception moves to Hall C's North Wing (equivalent capacity, available because Hall C had a flexible p3 buffer slot); the three p1 roundtables move to Breakout Rooms 4-6 in the adjacent convention wing; seven of the p2 breakouts are stacked into available slots in Breakout Rooms 7-12 with 15-minute sequential offsets; three p2 breakouts cannot be accommodated and are flagged for OL decision (options: shorten to 30 minutes, move to Day 2, or convert to virtual-only). The OL approves the auto-plan for the 10 relocations and manually adjudicates the remaining 3, with each decision time-stamped in `audit_log`. `resource.incident.relocated` events fire for each moved booking, consumed by Module 4.1 (agenda update), Module 7.1 (Attendee App push), and Module 7.3 (notification_send with category `safety_alert` for VIP-affected moves).

### E. Third-Party Integrations

- **Microsoft Outlook / Google Calendar (staff scheduling):** Bidirectional sync for staff_skill bookings. When OL books a `staff_skill` resource (e.g., 4 simultaneous Arabic-English interpreters for a ministerial session), the engine creates calendar invites on each staff member's Outlook/Google calendar via Microsoft Graph and Google Calendar API. Data flow: `resource_booking.created` -> Integration Hub -> Microsoft Graph / Google Calendar API -> invite in staff inbox.反向: if a staff member declines the invite, the Integration Hub publishes `resource.staff_skill.declined` and the booking is flagged for OL reassignment.
- **AutoCAD / BricsCAD (venue floorplans):** Read-only ingestion of `.dwg` floorplan files. Each named block in the DWG (e.g., "BOOTH_A1", "ROOM_B3") is parsed by a Python script (`ezdxf` library for DXF, or ODA File Converter for DWG-to-DXF) and upserted into `resource.floorplan_ref` and `resource.geoshape`. Data flow: DWG file in SharePoint -> Integration Hub -> `resource` table. The OL sees a side-by-side DWG preview and booking overlay in the UI.
- **SKUVault (equipment inventory tracking):** Real-time inventory counts for consumable and reusable equipment (microphones, headsets, signage stands, table linens). Data flow: SKUVault webhook -> Integration Hub -> `resource.capacity` updated; `resource.inventory.adjusted` published. If a count drops below the sum of confirmed bookings, the OL sees a red "Equipment Shortfall" banner with a one-click "Order Replenishment" action that creates a procurement request in Module 8.2.
- **Workday / BambooHR (staff skills database):** Read-only sync of staff profiles, certifications (e.g., "Forklift Operator", "Rigging Certified", "First Aid Level 3"), and availability. Data flow: Workday HCM REST API -> Integration Hub -> `staff_profile` table (cached); skills map to `resource.resource_subtype = "skill_*"` entries with `capacity` set to the count of certified staff.
- **Mapwize (indoor positioning):** Consumes `resource.geoshape` polygons to render the venue map in the Attendee App (Module 7.1) and Staff App (Module 7.2). Data flow: `resource.*` events -> Mapwize API -> tile cache.
- **PagerDuty (incident escalation):** When a `venue_incident` is created with `severity >= s2`, the engine triggers a PagerDuty incident that pages the on-call OL and Facilities Lead. Data flow: `venue_incident.created` -> PagerDuty Events API v2 -> paging; PagerDuty webhook back updates `venue_incident.ext_refs.pagerduty_incident_id`.
- **Kafka topics:** Publishes `resource.booking.created`, `resource.booking.updated`, `resource.booking.cancelled`, `resource.conflict.detected`, `resource.incident.relocated`, `resource.inventory.adjusted`, `resource.staff_skill.declined`. Subscribes to `session.published`, `session.cancelled` (Module 4.1), `sponsor_deal.confirmed` (Module 5.1), `fnb.event.confirmed` (Module 8.3), `transport.eta.updated` (Module 8.4 for VIP holding-room extensions).

### F. UI/UX Notes

The OL's primary screen is a four-pane layout. Top-left: a venue selector and date scrubber. Top-right: a Gantt-style heatmap where each row is a `resource` (filterable by type, subtype, venue) and each colored bar is a `resource_booking` with setup buffer (hatched gray), event window (solid color by `booking_purpose`: blue for session, gold for sponsor_booth, green for fnb_service, red for vip_holding, purple for motorcade_staging), and teardown buffer (hatched gray). Bottom-left: a floorplan canvas rendered from the DWG ingest, with booked resources shaded by utilization percentage (white = 0%, light green = 1-50%, dark green = 51-90%, red = over 91%). Bottom-right: the conflict-resolution panel, visible only when an active conflict exists, showing both bookings side by side with three action buttons (Relocate / Compress Buffer / Co-Approve Share).

The top banner shows three counts: "Active Conflicts", "Pending Approvals" (with a count by approval type: PO buffer extension, SSL sponsor encroachment, ED break-glass), and "Venue Incidents" (with severity color). The venue-incident modal opens on click and shows the relocation plan with each affected booking, its proposed new resource, and a one-click "Approve All Auto-Relocations" button plus per-booking override controls.

The FV's Staff App view (Module 7.2) shows their assigned setup/teardown tasks as a checklist with map navigation to the resource location. The EPU's Portal view (Module 5.3) shows only their own booth's footprint, setup window, and a "Request Dimension Change" button that opens the encroachment workflow.

### G. Failure Modes & Offline Behavior

- **AutoCAD DWG ingestion fails (corrupt file or unsupported version):** The OL is notified in-app with the parse error; the prior floorplan_ref remains authoritative; manual `resource.geoshape` polygon editing is enabled as a fallback with a warning banner "Floorplan out of sync; manual edits in effect."
- **SKUVault webhook down:** Inventory counts become stale; the OL sees a "Inventory last refreshed N minutes ago (stale)" banner; new bookings are accepted but flagged with a "Pending Inventory Check" badge that resolves when SKUVault comes back online or the OL manually overrides.
- **Workday HCM API outage:** Staff skills cannot be queried for new bookings; existing assignments remain valid. The OL can manually assign staff by name from a cached dropdown; certifications are not validated at assignment time but flagged for retroactive validation when Workday returns.
- **Kafka broker failure (cross-region):** MirrorMaker 2 continues replicating; booking writes in the failed region are queued locally and replayed within 2 seconds of broker recovery. If both regions are unreachable, the OL can export the current Gantt as CSV and re-import changes with a conflict-resolution screen handling divergent edits.
- **PagerDuty outage during a venue incident:** The OL's Staff App raises an audible alarm with a "Critical Venue Incident" modal; SMS fallback via Twilio sends a one-way alert to the OL and Facilities Lead phone numbers with the incident ID and a deep link.
- **OL mobile device offline during a venue incident:** The relocation plan is computed server-side and pushed via WebSocket; if the OL's device loses connectivity, the plan auto-executes after the 10-minute TTL with the most-conservative default (p0 to nearest equivalent, others declined). The OL receives the post-hoc plan summary on reconnect.
- **Microsoft Graph rate limit (staff calendar invites):** The Integration Hub batches invites (10 per request, 60 requests per minute per the Graph throttling policy) and queues excess invites; a 1,000-invite burst for an all-hands staff call is processed within 17 minutes. The OL sees a "Calendar invites queued: 847 of 1000 sent" progress bar.

### H. Acceptance Criteria

- **Given** a confirmed booking for Hall A from 14:00 to 16:00 with a 120-minute setup buffer and 60-minute teardown buffer, **When** a second booking is attempted on Hall A from 17:00 to 18:00 (event windows do not overlap, but teardown buffer of the first ends at 17:00 and setup buffer of the second starts at 15:00, overlapping 14:00-17:00 vs 15:00-19:00), **Then** the save is blocked with a `resource.conflict.detected` event naming both bookings and the OL is shown options to compress buffers, relocate one booking, or co-approve shared use.
- **Given** a sponsor requests a booth dimension change from 6m x 6m to 8m x 6m that encroaches 0.5m on a neighboring sponsor's footprint, **When** the EPU submits the change via the Exhibitor Portal, **Then** the change is held in `pending_approval` state, both the neighboring sponsor's EPU and the SSL receive notifications with consent/approval actions, and the change is committed only after both approvals are recorded with timestamps in `approval_required_from`.
- **Given** Hall B is declared offline at 22:00 on Day -1 due to fire damage with 14 confirmed bookings affected (1 p0 VIP reception, 3 p1 roundtables, 10 p2 breakouts), **When** the OL opens the venue-incident workflow, **Then** the engine computes a relocation plan within 30 seconds that places the p0 VIP reception in Hall C North Wing (equivalent capacity), the three p1 roundtables in Breakout Rooms 4-6, and seven of the p2 breakouts in available slots, with the remaining three flagged for manual OL adjudication.
- **Given** a `session.published` event arrives from Module 4.1 for a session with 200 expected attendees in Venue 1, **When** the session has no pre-existing `resource_booking`, **Then** the engine auto-creates a draft booking in a room with `capacity >= 200` and `compliance_tags` containing `wheelchair_accessible`, with default setup/teardown buffers, and surfaces it on the OL's "Pending Confirmation" queue within 5 seconds.
- **Given** a `transport.eta.updated` event indicates a protocol_rank 1 dignitary's motorcade is delayed by 25 minutes and conflicts with the VIP holding-room booking window, **When** the engine receives the event, **Then** it auto-extends the holding-room booking by 30 minutes (with a 5-minute safety buffer), publishes `resource.booking.updated`, and alerts the OL with a "VIP Holding Extended" toast; if the extension would conflict with the next booking on the same room, the engine escalates to PO and OL for adjudication.
