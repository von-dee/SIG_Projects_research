> Module 5: Commercial & Exhibition Management -> 5.2 Booth Floorplan & Allocation

## Booth Floorplan & Allocation

### A. Purpose Statement

The Booth Floorplan & Allocation subsystem is the spatial inventory and assignment engine for the FMF exhibition halls. At FMF scale, the Forum operates 3 exhibition halls across 2 venues (RCC Riyadh + adjacent Pavilion) totaling 28,000 sqm of net exhibition space, hosting 220+ booths across 80+ sponsors. This subsystem owns the digital twin of that physical space: a 2D floorplan with booth polygons, dimensions, utility hookups (power, data, water), accessibility status, and the assignment of each booth to a sponsor company based on the entitlement snapshot produced by Module 5.1.

The subsystem is distinct from generic venue-mapping tools (Mapwize, Situm) which own *indoor navigation* (wayfinding for attendees). This subsystem owns the *commercial allocation*: who has the right to occupy a given polygon of floor space, what they are permitted to build on it, and what happens when physical reality diverges from the planned layout (power hookup fails, swap requested, booth graphics do not match the as-built location). Mapwize consumes the published floorplan as a read-only render for attendee wayfinding; this subsystem is the source of truth for assignment, configuration, and operational issues.

At FMF scale, the subsystem must handle 220+ booth assignments across 3 halls with strict tier-based pricing (Premium corner booths at US$ 950/sqm, Standard at US$ 650/sqm, Budget back-of-hall at US$ 380/sqm), CAD file import from venue architects (DWG/DXF), real-time preview of booth graphics rendered against the as-built floorplan, accessory selection (furniture, AV, signage), installation slot booking across a 4-day move-in window, and physical-issue incident management integrated with the Ops & Logistics module (Module 8). Every booth assignment flows to the Exhibitor Portal (5.3) so the EPU can configure their booth, and to the Lead Capture ROI Engine (5.4) so leads captured at a booth can be attributed to the correct sponsor.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all floorplans and booth assignments. Write only via break-glass for booth swaps within 5 days of move-in (requires ED + SSL co-sign).
- **Operations Lead (OL):** Read on all floorplans; write on the `installation_slot` schedule and the `booth_issue` record. Sees the "Floor Operations" tile in the War Room showing per-hall move-in progress and active booth issues.
- **Protocol Officer (PO):** Read-only on booths adjacent to VIP walkways (the "diplomatic corridor" buffer zone of 3 meters around rank 1-2 dignitary walking routes).
- **VIP Liaison (VL):** Read-only on booths along their assigned dignitary's walking route for advance coordination.
- **Registration Manager (RM):** Read-only on booth_id reference for badge entitlement encoding (Module 6).
- **Sponsorship Sales Lead (SSL):** Primary owner of allocation. Read/write on booth proposals and assignment for sponsors they manage; cannot modify the floorplan geometry (booth polygons are owned by OL/venue). Approves sponsor accessory selections.
- **Exhibitor Portal User (EPU):** Read on their own booth assignment; write on booth graphics upload, accessory selection, and installation slot booking. Cannot see other sponsors' booths except for `booth_tier` and `booth_id`.
- **Content & Stage Manager (CSM):** No direct access. Receives a derived "Sponsor Booths Near Stage" report for traffic planning.
- **Matchmaking Concierge (MC):** Read-only on booth locations for proximity-based meeting pod placement.
- **Finance & Administration Lead (FAL):** Read-only on `booth_tier` and `booth_sqm` for invoicing reconciliation (price * sqm); cannot modify assignments.
- **Marketing & PR Lead (MPL):** Read-only on the published floorplan render for inclusion in the event program.
- **ESG & Sustainability Officer (ESGO):** Read-only on `power_kw` and `water_lpm` per booth for sustainability reporting.
- **Field Volunteer (FV):** Read-only on booth_id and sponsor_company legal_name for directional assistance ("Where is BHP's booth?").
- **Attendee (ATT):** Read-only on the published floorplan render via the Mobile App (Module 7) and via Mapwize indoor navigation; cannot see commercial fields.

### C. Data Model

`floorplan` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{source_dwg_id, oda_conversion_job_id, mapwize_venue_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `hall_id` | `text` | e.g., "RCC-Hall-A", "Pavilion-1" |
| `venue_id` | `uuid` | FK -> venue.id (Module 8 venue master) |
| `name` | `text` | e.g., "RCC Hall A - Main Exhibition" |
| `total_sqm` | `numeric(8,2)` | Total net floor area |
| `published_at` | `timestamptz null` | When floorplan was published to EPU portal and Mapwize |
| `source_dwg_url` | `text` | Original DWG/DXF file in S3 |

`booth` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{mapwize_location_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `floorplan_id` | `uuid` | FK -> floorplan.id |
| `booth_code` | `text` | Human-readable e.g., "A-101", "B-204" |
| `polygon_wkt` | `text` | Well-Known Text polygon geometry |
| `centroid_x` | `numeric(8,2)` | Meters from hall origin |
| `centroid_y` | `numeric(8,2)` | Meters from hall origin |
| `sqm` | `numeric(8,2)` | Net booth area |
| `booth_tier` | `enum[premium, standard, budget]` | Pricing tier |
| `is_corner` | `bool` | Premium tier trigger |
| `is_high_traffic` | `bool` | Premium tier trigger (within 10m of entrance or main aisle) |
| `price_per_sqm` | `numeric(10,2)` | In event local currency |
| `currency_code` | `char(3)` | ISO 4217 |
| `power_kw` | `numeric(5,2)` | Power hookup capacity in kW |
| `data_mbps` | `int` | Data line capacity |
| `water_lpm` | `numeric(5,2)` | Water hookup capacity in liters per minute |
| `accessibility_status` | `enum[full, partial, none]` | Wheelchair access |
| `is_diplomatic_corridor_adjacent` | `bool` | True if within 3m of a VIP walking route |
| `status` | `enum[available, proposed, allocated, locked, swap_pending, swap_completed, issue_active, decommissioned]` | Lifecycle |

`booth_assignment` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{invoice_line_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `booth_id` | `uuid` | FK -> booth.id |
| `sponsor_deal_id` | `uuid` | FK -> sponsor_deal.id (Module 5.1) |
| `entitlement_snapshot_id` | `uuid` | FK -> entitlement_snapshot.id |
| `status` | `enum[proposed, accepted, rejected, contracted, locked, swap_pending, swap_completed]` | Allocation lifecycle |
| `proposed_at` | `timestamptz null` | When SSL proposed |
| `accepted_at` | `timestamptz null` | When EPU accepted |
| `contract_signed_at` | `timestamptz null` | When deal signed |
| `locked_at` | `timestamptz null` | When booth is locked (T-7 days before move-in) |
| `graphics_asset_id` | `uuid null` | FK -> content_asset.id (Module 4.4) for the rendered booth graphics |
| `accessories` | `jsonb[]` | Array of `{accessory_code, quantity, vendor_id}` e.g., `[{accessory_code: "led_screen_55in", quantity: 2, vendor_id: "..."}]` |
| `installation_slot_id` | `uuid null` | FK -> installation_slot.id |

`installation_slot` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{ops_resource_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `floorplan_id` | `uuid` | FK -> floorplan.id |
| `start_at` | `timestamptz` | Slot start (move-in window) |
| `end_at` | `timestamptz` | Slot end |
| `hall_capacity_concurrent` | `int` | Max concurrent installers in the hall |
| `booth_ids_assigned` | `uuid[]` | Booths in this slot |

`booth_issue` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{ops_incident_id, electrician_dispatch_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `booth_id` | `uuid` | FK -> booth.id |
| `booth_assignment_id` | `uuid` | FK -> booth_assignment.id |
| `issue_type` | `enum[power_failure, data_failure, water_leak, structural_damage, accessibility_block, other]` | |
| `severity` | `enum[s0, s1, s2, s3]` | Aligned with Module 1.2 severity scale |
| `reported_at` | `timestamptz` | |
| `reported_by` | `uuid` | Actor |
| `description` | `text` | Free text |
| `status` | `enum[open, dispatched, in_progress, resolved, relocated, closed]` | |
| `resolved_at` | `timestamptz null` | |
| `relocation_booth_id` | `uuid null` | If sponsor relocated, FK -> booth.id |
| `ops_incident_id` | `uuid null` | FK to Module 8 Ops incident if escalated |

### D. Business Logic & Edge Cases

- IF a new `floorplan` is created from a DWG/DXF source THEN the Integration Hub invokes ODA File Converter (Cloud or on-prem) to normalize to SVG + GeoJSON; booths are extracted as polygons with `centroid_x/y` computed; power/data/water hookups are extracted from CAD layers named `POWER`, `DATA`, `WATER`; accessibility paths are extracted from the `ACCESS` layer. The conversion job runs asynchronously and posts a webhook on completion.
- IF `booth.is_corner = true OR booth.is_high_traffic = true` THEN `booth_tier` is auto-set to `premium` unless overridden by OL.
- IF SSL proposes a booth to a sponsor THEN `booth.status` transitions to `proposed`, `booth_assignment.status = proposed`, and a notification is sent to EPU via SendGrid email + Twilio SMS with a deep link to accept or reject in the Exhibitor Portal (5.3).
- IF EPU accepts the proposal THEN `booth_assignment.status = accepted`, `accepted_at = now()`. If EPU rejects THEN `booth.status` reverts to `available` and SSL is notified.
- IF `sponsor_deal.stage` reaches `contract_signed` (Module 5.1) THEN `booth_assignment.status = contracted`, `contract_signed_at = now()`, `booth.status = allocated`, and a `booth.allocated` event is published on Kafka topic `booth.allocation`.
- IF today is T-7 days before move-in THEN all `contracted` booths with a valid contract_signed_at transition to `locked`. Locked booths cannot be modified except via ED break-glass.
- IF EPU uploads booth graphics (a PNG, JPG, or PDF file) THEN the file is stored as a `content_asset` in Module 4.4 with `asset_type = marketing_asset`, the asset is linked via `booth_assignment.graphics_asset_id`, and the System renders a preview of the graphics composited onto the booth polygon in the floorplan 2D viewer (using Pillow and the booth polygon coordinates).
- IF EPU selects accessories (furniture, AV, signage) THEN each accessory selection must be approved by SSL (workflow rule: items above US$ 5,000 require SSL approval; under US$ 5,000 are auto-approved); the `accessories` array is updated and an `accessory_request` is sent to the Ops module (Module 8) for procurement.
- IF EPU books an installation slot THEN the System validates that the slot has not exceeded `hall_capacity_concurrent` and that the booth is in `locked` or `contracted` status; on success, `installation_slot_id` is set and a confirmation email is sent to EPU.

**Edge Case 1 (Non-obvious): Booth swap 5 days before move-in.** Sponsor A (booth A-101, Premium corner) and Sponsor B (booth A-204, Standard) agree to swap booths 5 days before move-in. The swap requires (a) both EPUs to consent in the portal (each clicks "Agree to Swap" within a 48-hour window), (b) SSL approval (verifies tier compatibility and that neither sponsor's graphics have already been printed at the original booth dimensions), and (c) ED break-glass approval (because move-in is imminent). On approval, the System: swaps `booth_assignment.booth_id` references, re-issues booth staff badge entitlements (because Module 6 badges encode `booth_id` for access control to back-of-house areas and for the booth's own private storage), notifies the registration team (Module 6) to reprint affected staff badges, updates Mapwize indoor navigation to reflect the new sponsor locations, and publishes `booth.swap_completed` on Kafka. If graphics have already been printed at original dimensions and the new booth has different dimensions, the System flags a `graphics_mismatch` requiring EPU to upload new graphics within 24 hours or forfeit the swap.

**Edge Case 2 (Non-obvious): Booth power hookup fails during install.** During move-in, Sponsor C's booth (B-105, allocated, contracted) experiences a power hookup failure: the 32A 3-phase circuit trips repeatedly when the sponsor's LED wall is powered on. The OL (or FV) opens a `booth_issue` with `issue_type = power_failure`, `severity = s2`. The System dispatches an electrician via the Ops module (Module 8) within 15 minutes (SLA), creates an `ops_incident` linked via `ext_refs.ops_incident_id`, and starts a 4-hour resolution timer. If the issue is not resolved within 4 hours, the System identifies the nearest available `backup_booth` of equal or higher tier (auto-located by spatial query on `booth.status = 'available' AND booth_tier >= current_tier`), proposes relocation to the EPU, and on EPU approval executes a relocation: `booth_assignment.booth_id` is updated, `booth_issue.relocation_booth_id` is set, `booth.status` of the original booth is set to `decommissioned`, and the new booth is set to `locked`. A `booth.relocated` event is published; Mapwize is updated; Module 6 badge entitlements are re-issued. If no backup booth is available, the OL escalates to ED for manual resolution (potentially relocating to a different hall).

### E. Third-Party Integrations

- **ODA File Converter:** Outbound: DWG/DXF file uploaded to S3 triggers an ODA conversion job (via Integration Hub) that produces SVG (for 2D rendering) and GeoJSON (for polygon extraction). Inbound: webhook posts job completion with conversion artifacts URLs.
- **Mapwize:** Outbound: published floorplan (booth polygons + sponsor_company legal_name labels) is pushed to Mapwize via REST API on `floorplan.published_at` set or `booth.swap_completed` event. Mapwize renders the indoor navigation for attendees; this subsystem is the source of truth.
- **Zebra TC5x scanners (via Zebra Data Service):** Inbound: booth check-in scans (FV scanning EPU staff badge at booth entry to verify entitlement) post via the Mobile BFF; the scan validates that the badge's `booth_id` entitlement matches the scanned booth and logs the check-in for installation-slot attendance tracking.
- **Pillow (Python imaging):** Local library used to composite uploaded booth graphics onto the booth polygon in the 2D preview renderer; runs on the Core Domain service.
- **AWS S3:** Stores original DWG/DXF, converted SVG/GeoJSON, and rendered preview images.
- **Twilio:** Outbound SMS to EPU on booth proposal, swap request, swap approval, relocation proposal, and installation slot confirmation.
- **SendGrid:** Outbound email with deep links to the Exhibitor Portal for proposal accept/reject, swap consent, and relocation acceptance.
- **AWS KMS:** Envelope encryption for `ext_refs` containing vendor pricing in `accessories` (commercially sensitive).
- **Kafka:** Publishes `booth.allocated`, `booth.swap_pending`, `booth.swap_completed`, `booth.relocated`, `booth.issue.opened`, `booth.issue.resolved` on topic prefix `booth.*` per Module 0.1 bounded context table.

### F. UI/UX Notes

- **SSL Floorplan View:** 2D interactive canvas (rendered from SVG via react-konva) showing booth polygons colored by `booth_tier` (premium = gold fill, standard = blue, budget = gray). Hover shows tooltip with `booth_code`, `sqm`, `status`, assigned sponsor. Click opens the booth detail drawer. SSL can drag a sponsor card from the sidebar onto a booth polygon to propose assignment.
- **EPU Portal Booth Configurator:** Three-pane layout. Left: 2D preview of their booth with uploaded graphics rendered onto the polygon. Center: accessory catalog (searchable, with images and prices). Right: installation slot calendar showing available slots and the EPU's booked slot highlighted.
- **OL Floor Operations Dashboard:** Per-hall grid showing all booths with color-coded status (green = installed, yellow = in progress, red = issue active, gray = not started). Click into an issue to see dispatch status and resolution timer.
- **ED War Room Tile:** "Booth Allocation Health" showing % allocated vs available per hall, # of pending swap requests, # of open `booth_issue` records by severity.
- **Mobile App (ATT-facing):** Renders the Mapwize-published floorplan with sponsor_company legal_name labels. Attendee taps a booth to see sponsor details, lead capture CTA (NFC tag), and walking directions.

### G. Failure Modes & Offline Behavior

- IF ODA File Converter is unavailable (cloud service outage) THEN the Integration Hub retries every 5 minutes for 2 hours; if still failing, OL can manually upload a pre-converted SVG via a break-glass admin endpoint, and the booth polygons are extracted from SVG paths instead of GeoJSON.
- IF Mapwize is unavailable (publish fails) THEN attendees cannot use indoor navigation; the floorplan PDF is still downloadable from the Mobile App as a fallback; this subsystem continues to function as the source of truth and re-publishes to Mapwize on recovery.
- IF Zebra scanners cannot reach the Mobile BFF (venue WiFi degraded) THEN booth check-in scans are queued locally on the device (Zebra TC5x supports offline queue of up to 500 scans) and replayed on reconnect with original timestamps. The badge entitlement validation happens locally on-device against a cached entitlement list refreshed every 15 minutes.
- IF the EPU portal is offline when a swap request is initiated THEN the swap request is queued in the backend; on portal recovery, both EPUs receive the consent request with a deadline extended by the offline duration.
- IF a booth graphics upload fails (file too large, invalid format) THEN the System retries with a compressed version (Pillow resize) up to 3 times; on final failure, the EPU is notified and the booth remains without rendered graphics (a placeholder is shown in the 2D preview).
- IF two `booth_issue` records are opened for the same booth within 5 minutes THEN the System auto-merges them (same heuristic as Module 1.2 dual-reporter merge) to avoid duplicate electrician dispatch.

### H. Acceptance Criteria

- **Given** a DWG/DXF source file uploaded by OL, **When** the ODA File Converter completes conversion and posts the webhook, **Then** the System extracts booth polygons, computes `centroid_x`/`centroid_y`, sets `booth_tier` based on `is_corner` and `is_high_traffic` heuristics, sets `price_per_sqm` from the tier pricing table, and publishes `booth.extracted` events on Kafka topic `booth.allocation` for each extracted booth within 60 seconds of webhook receipt.
- **Given** a sponsor with `sponsor_deal.stage = contract_signed` and a `booth_assignment.status = accepted`, **When** the daily T-7 lock job runs, **Then** `booth.status` transitions to `locked`, `booth_assignment.status = locked`, `locked_at = now()`, and the booth becomes immutable except via ED break-glass.
- **Given** two sponsors with `booth_assignment.status = contracted` who agree to swap booths 5 days before move-in, **When** both EPUs click "Agree to Swap" within the 48-hour window and SSL and ED approve, **Then** `booth_assignment.booth_id` references are swapped, Module 6 re-issues affected booth staff badges with new `booth_id` entitlement, Mapwize is updated with new sponsor locations, and a `booth.swap_completed` event is published with payload `{swap_id, booth_a_id, booth_b_id, sponsor_a_id, sponsor_b_id}`.
- **Given** a `booth_issue` with `issue_type = power_failure` and `severity = s2`, **When** the 4-hour resolution timer expires without `resolved_at` being set, **Then** the System identifies the nearest available backup booth of equal or higher tier, proposes relocation to the EPU via Twilio SMS + SendGrid email, and on EPU approval executes the relocation with `booth_assignment.booth_id` updated, `booth_issue.relocation_booth_id` set, and a `booth.relocated` event published.
- **Given** an EPU uploads a 12MB PNG booth graphic, **When** the upload completes, **Then** the System stores the asset in S3 via Module 4.4, links `booth_assignment.graphics_asset_id`, composites the graphic onto the booth polygon using Pillow, and renders the preview in the EPU portal Booth Configurator within 5 seconds.
