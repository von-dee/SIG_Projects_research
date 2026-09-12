> Module 2: VIP & Diplomatic Protocol Management -> 2.3 VIP Transportation & Security

## VIP Transportation & Security

### A. Purpose Statement

The VIP Transportation & Security subsystem plans, executes, and audits the movement of every rank 1-3 dignitary from arrival (airport or residence) to venue, between venues, and to departure. It is used by Protocol Officers (PO), VIP Liaisons (VL), and the host-country protective-service security leads to coordinate motorcades, drivers, security details, and curbside arrivals without collision. At FMF scale, where 60+ ministerial motorcades converge on a single venue over a 90-minute window, an uncoordinated curb produces gridlock, missed cues, and security exposure; this subsystem exists so that movement is choreographed, ETAs are predictive (not reactive), and every VIP movement is auditable.

### B. User Roles & Permissions

Movement data is the most security-sensitive class of data in the platform. Access is restricted to the minimum set of personas required to execute the event.

- **Event Director (ED):** Read on all motorcade manifests, ETA boards, and security assignments. Approves plan B re-routes and motorcade staging changes via break-glass.
- **Operations Lead (OL):** Read on aggregate curb-arrival schedule (no dignitary names; just "Motorcade 7 arriving 08:14 at Curb B"). Cannot see security detail assignments.
- **Protocol Officer (PO):** Primary user. Read/write on motorcade manifests, driver assignments, route plans, and curb assignments. Cannot modify security detail assignments (those are owned by the host-country protective service via a restricted sub-form).
- **VIP Liaison (VL):** Read-only on the assigned dignitary's motorcade schedule, ETA, driver name, and security lead name. Writes "Motorcade arrived" and "In transit" status updates.
- **Registration Manager (RM):** No access to motorcade detail. Sees only a "VIP arrival count per hour" tile for staffing the VIP check-in lane.
- **Sponsorship Sales Lead (SSL):** No access.
- **Exhibitor Portal User (EPU):** No access.
- **Content & Stage Manager (CSM):** Read-only on the dignitary ETA board for the next 60 minutes (used to time the green-room cue).
- **Matchmaking Concierge (MC):** No access.
- **Finance & Administration Lead (FAL):** Read on motorcade cost ledger (driver hours, fuel, vehicle lease); no access to dignitary identity within the ledger.
- **Marketing & PR Lead (MPL):** No access.
- **ESG & Sustainability Officer (ESGO):** Read-only on motorcade vehicle carbon footprint aggregate (no dignitary names); used for the event carbon report.
- **Field Volunteer (FV):** Read-only on the curb assignment list for their assigned curb; sees motorcade number, ETA, vehicle count, no dignitary name.
- **Attendee (ATT):** No access.

### C. Data Model

`motorcade` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{flightaware_faFlightID, gaca_permit_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit (additionally, every view appends a `view` event) |
| `dignitary_id` | `uuid` | FK -> dignitary_profile.id |
| `primary_vehicle_id` | `uuid` | FK -> vehicle.id |
| `escort_vehicle_ids` | `uuid[]` | FK -> vehicle.id (0-3 escort vehicles) |
| `security_lead_id` | `uuid` | FK -> security_detail.id |
| `driver_id` | `uuid` | FK -> driver.id |
| `route_plan_id` | `uuid` | FK -> route_plan.id |
| `origin_type` | `enum[airport, residence, hotel, other_venue, diplomatic_mission]` | Trip origin class |
| `origin_ref` | `text` | e.g., "RUH Terminal 1 - VVIP Apron" |
| `destination_zone_id` | `uuid` | FK -> zone.id |
| `destination_curb_id` | `uuid` | FK -> curb.id |
| `scheduled_departure_at` | `timestamptz` | UTC |
| `scheduled_arrival_at` | `timestamptz` | UTC |
| `predicted_arrival_at` | `timestamptz` | Updated by ETA engine every 60 seconds |
| `actual_departure_at` | `timestamptz null` | Set when VL taps "Departed" |
| `actual_arrival_at` | `timestamptz null` | Set when VL taps "Motorcade arrived" |
| `status` | `enum[scheduled, briefing, in_transit, arrived_at_curb, arrived_at_venue, delayed, cancelled]` | Lifecycle |
| `delay_reason_code` | `enum[flight_late, traffic, security_hold, weather, mechanical, other] null` | Coded reason |
| `privacy_classification` | `enum[restricted, confidential, secret]` | Default "secret" for rank 1-2 |

`vehicle` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{lease_provider_id, plate_registration_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `vehicle_class` | `enum[limousine, suv, sedan, escort_police, ambulance, sweep_vehicle]` | Drives assignment rules |
| `plate_number` | `text` | Encrypted at column level |
| `capacity` | `int` | Seats |
| `license_required_class` | `enum[standard, vip_chauffeur, security_escort]` | Driver qualification |
| `availability_window` | `tstzrange` | When the vehicle is bookable |
| `carbon_per_km` | `numeric(8,3)` | Used by ESGO aggregate |
| `is_armored` | `bool` | Required for rank 1-2 |
| `current_lat` | `numeric(10,7) null` | Live GPS, updated every 30s when in transit |
| `current_lng` | `numeric(10,7) null` | Live GPS |
| `current_heading` | `numeric(5,2) null` | Degrees from north |
| `last_position_at` | `timestamptz null` | When GPS last updated |

`driver` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{protective_service_id, vendor_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `full_name` | `text` | Encrypted at column level |
| `license_class` | `enum[standard, vip_chauffeur, security_escort]` | Must match vehicle.license_required_class |
| `clearance_level` | `enum[standard, enhanced, secret]` | "secret" required for rank 1 motorcades |
| `languages` | `text[]` | ISO 639-1; match to dignitary language_pref preferred |
| `phone_e164` | `text` | Encrypted at column level |
| `protective_service_id` | `uuid null` | FK -> security_detail.id (if driver is also PS) |
| `assigned_vehicle_ids` | `uuid[]` | Current assignments |
| `fatigue_status` | `enum[fresh, on_duty, near_limit, mandatory_rest]` | Updated from driver log |

`route_plan` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{google_maps_route_id, waze_route_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `origin_lat` | `numeric(10,7)` | Departure point |
| `origin_lng` | `numeric(10,7)` | Departure point |
| `destination_lat` | `numeric(10,7)` | Arrival point |
| `destination_lng` | `numeric(10,7)` | Arrival point |
| `waypoints` | `jsonb` | Ordered array of `{lat, lng, label, type}` |
| `distance_km` | `numeric(8,3)` | Computed at plan time |
| `base_eta_minutes` | `int` | Standard Google Maps ETA |
| `motorcade_eta_minutes` | `int` | Adjusted for motorcade speed profile (typically +20% to +35%) |
| `road_closures` | `jsonb[]` | Active closures pulled from local traffic authority |
| `motorcade_speed_profile` | `enum[standard, brisk, expedited]` | "expedited" requires PS lead approval |
| `alternate_route_ids` | `uuid[]` | FK -> route_plan.id; plan B/C routes |

`security_detail` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{protective_service_battalion_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `dignitary_id` | `uuid` | FK -> dignitary_profile.id |
| `lead_name` | `text` | Encrypted at column level |
| `lead_phone_e164` | `text` | Encrypted |
| `team_size` | `int` | Number of agents |
| `protective_service_org` | `enum[host_country_ps, delegation_ps, private_contractor]` | Source |
| `briefing_doc_s3_key` | `text` | Encrypted object key in S3 for the security briefing |
| `clearance_level` | `enum[enhanced, secret]` | Must match dignitary rank requirement |
| `assigned_motorcade_ids` | `uuid[]` | Current motorcade assignments |

`curb` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{venue_curb_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `zone_id` | `uuid` | FK -> zone.id |
| `curb_label` | `text` | e.g., "VVIP Curb B" |
| `capacity_per_5min` | `int` | Max motorcades per 5-minute window |
| `min_spacing_minutes` | `int` | Minimum gap between motorcades (default 3) |
| `access_classification` | `enum[vvip, vip, delegation, restricted]` | Drives vehicle gate |

### D. Business Logic & Edge Cases

- **IF** a dignitary has `protocol_rank` in 1-3, **THEN** a `security_detail` with `clearance_level >= enhanced` must be assigned before the motorcade can be marked `scheduled`. Rank 1-2 requires `clearance_level = secret`.
- **IF** two motorcades are scheduled to arrive at the same curb within `min_spacing_minutes` (default 3 minutes) of each other, **THEN** the system warns the PO and proposes either staggering (shift one motorcade's scheduled arrival by 5 minutes) or routing the second to an alternate curb with capacity.
- **IF** a FlightAware inbound flight for a dignitary is delayed by more than 15 minutes, **THEN** the engine recomputes `predicted_arrival_at` using the new ETA, checks for curb conflicts at the new arrival time, and notifies the PO, VL, and security lead via Twilio push and an entry in the War Room ticker.
- **IF** the recomputed arrival falls within the peak check-in window (configurable per event, default 08:00-09:30 local), **THEN** the engine proposes priority curb access (a dedicated VVIP curb) and shortens the security detail's pre-arrival briefing from 15 minutes to 7 minutes, with a flag for PS approval.
- **IF** the motorcade's predicted ETA drifts by more than 5 minutes from the scheduled arrival, **THEN** the CSM is notified to adjust the green-room cue and the OL is notified to adjust the curb staffing.
- **IF** a driver's `fatigue_status` is `mandatory_rest`, **THEN** the system refuses to assign that driver to a new motorcade and surfaces a replacement-driver suggestion matching `license_class` and `clearance_level`.
- **IF** a vehicle's `is_armored = false` and the assigned dignitary has `protocol_rank` 1-2, **THEN** the assignment is blocked; the system requires an armored vehicle for rank 1-2.
- **IF** a route plan's `motorcade_speed_profile = expedited`, **THEN** the security lead must approve via a confirmation flow, and the audit log captures both the requester and approver identities.
- **IF** a motorcade's status is `in_transit` and GPS telemetry has not updated for more than 90 seconds, **THEN** the system raises a "Telemetry Loss" warning to the security lead and VL, and the route plan's `alternate_route_ids` are surfaced for manual re-route.

**Edge case (non-obvious): two motorcades from two delegations in active diplomatic dispute are scheduled within 15 minutes of each other at the same curb.** The engine detects that the two dignitaries' `conflict_flags` (pulled from Module 2.1) include a `severity = restricted` entry, and forces a minimum 15-minute curb spacing (overriding the default 3 minutes) with both motorcades routed through separate vehicle gates if available. The PO is notified and can override with break-glass justification.

**Edge case (non-obvious): flight delay pushes a rank-1 dignitary's arrival into the same 5-minute window as a rank-3 Minister's scheduled departure, and only one VVIP curb is operational.** The engine proposes (a) advancing the rank-3 departure by 10 minutes to free the curb, (b) routing the rank-1 arrival to a secondary VIP curb (with PS approval), or (c) holding the rank-1 motorcade at the airport apron for 7 minutes. The PO chooses; the engine executes the chosen plan and notifies all downstream consumers.

**Edge case (non-obvious): dignitary requests an unscheduled intermediate stop (e.g., a private meeting at a hotel not on the route plan).** The PO creates a new route plan with the intermediate waypoint, the engine validates driver `fatigue_status` for the extended journey, validates vehicle fuel range (pulled from the vehicle telemetry), and recomputes the ETA. If the new ETA threatens the next scheduled cue, the engine surfaces a warning.

### E. Third-Party Integrations

- **FlightAware AeroAPI:** Real-time flight tracking for inbound dignitary aircraft. Data flow: FlightAware (outbound from system perspective, but actually FlightAware pushes via webhook) -> Integration Hub -> `motorcade.ext_refs.faFlightID` and ETA updates every 60 seconds.
- **Google Maps Distance Matrix / Routes API:** Base ETA computation for ground transport. Data flow: system -> Integration Hub -> Google Maps API (outbound), refreshed every 5 minutes or on route change.
- **Waze for Cities (Crowd-sourced traffic):** Supplementary ETA and incident data via the Waze for Cities Data feed. Bidirectional; the system can also push road closure data back to Waze for the motorcade window.
- **HID Global Origo (curb access control):** Curb gate authorization. The motorcade manifest is pushed to HID Origo at the gate-level so the gate auto-opens for the expected plate at the expected time. Data flow: system -> Integration Hub -> HID Origo API.
- **Zebra TC5x scanners (curb verification):** Field Volunteer at the curb scans the vehicle plate or QR code on the windshield; the scan event verifies against `motorcade.id` and timestamps `actual_arrival_at`. Data flow: Zebra scanner -> Mobile BFF -> motorcade record.
- **Twilio (notifications):** SMS and push notifications to PO, VL, security lead, and driver. Data flow: system -> Integration Hub -> Twilio API (outbound).
- **Microsoft Graph / Google Workspace (calendar sync):** Dignitary calendar invites are updated with motorcade departure times. Data flow: system -> Integration Hub -> Microsoft Graph (outbound).
- **Host-country General Authority of Civil Aviation (GACA) secure API:** Aircraft landing slot confirmation and apron allocation. Data flow: bidirectional via a dedicated secure SFTP or REST API per a bilateral data-sharing protocol.
- **Host-country protective service secure file share (typically a SharePoint Online with restricted access):** Security briefing documents. Data flow: PO uploads briefing -> SharePoint -> notification to PS lead. Encrypted at rest with the PS's KMS key.
- **AWS KMS:** Column-level encryption of plate numbers, driver names, phone numbers, and security lead names.
- **AWS S3:** Encrypted object store for security briefing documents, route maps, and post-event motorcade reports.
- **OpenSearch:** Searchable audit log of motorcade events, view events (every read of a rank-1 motorcade record generates a `view` audit entry), and ETA change history.
- **Kafka topics:** Publishes `transport.motorcade.scheduled`, `transport.motorcade.in_transit`, `transport.motorcade.arrived`, `transport.eta.recomputed`, `transport.security.assigned`. Subscribes to `vip.protocol_rank.changed` (re-evaluates security clearance requirements) and `vip.conflict_matrix.changed` (re-evaluates curb spacing).

### F. UI/UX Notes

The PO's motorcade console is a timeline-and-map layout. Top half: a horizontal timeline (typically 06:00 to 22:00 on event day) with motorcade blocks colored by dignitary rank (gold for rank 1, silver for rank 2, dark blue for rank 3). Each block expands on hover to show driver, vehicle, security lead, and predicted vs. scheduled ETA. Overlapping blocks at the same curb are highlighted with a red conflict marker.

Bottom half: a map view (Mapwize for indoor venue, Google Maps for outdoor route) showing live motorcade positions as vehicle icons, with the planned route drawn as a colored line and the alternate route drawn as a dashed line. The map shows curb locations as labeled pins with a capacity meter (e.g., "VVIP Curb B: 1 of 2 slots used in 08:00-08:05").

Right side: a motorcade detail panel for the selected motorcade, with collapsible sections for Driver, Vehicle, Route Plan, Security Detail, and Audit Log. A "Send Briefing" button generates a PDF briefing (via the pdf skill pipeline) and dispatches it to the PS lead via SharePoint. A "Re-route" button opens a modal with the alternate routes and their tradeoffs (time delta, distance, road closures).

A privacy banner at the top of the screen reads "Motorcade data is restricted. Every view is logged." and shows the current user's identity and role.

### G. Failure Modes & Offline Behavior

- **FlightAware AeroAPI outage:** The Integration Hub retains the last known flight ETA and surfaces a "Flight data stale, last update X minutes ago" banner. PO can fall back to manual ETA entry via a phone call to the airport liaison; manual entry overrides the FlightAware feed for 60 minutes before reverting to automatic.
- **Google Maps Routes API outage:** The system falls back to Waze for Cities for ETA. If both are down, the engine uses the most recent base ETA and applies a configurable delay buffer (+15% default). PO can manually adjust ETA.
- **Zebra scanner failure at curb:** The Field Volunteer can manually confirm arrival via the Mobile App, which writes the `actual_arrival_at` timestamp. Manual confirmations are flagged in the audit log with `source = manual_fv`.
- **GPS telemetry loss for an in-transit motorcade (rank 1-2):** The engine raises an S1 incident automatically, pages the PS lead via PagerDuty, and switches the motorcade view to a "Last Known Position" mode showing the last GPS fix with a timestamp. The OL is notified. The route plan's alternate route is surfaced.
- **Azure AD B2C authentication outage:** Break-glass auth via single-use codes (same scheme as Module 2.1).
- **Host-country GACA secure SFTP unavailable:** Flight slot confirmation is queued; the motorcade is marked `scheduled` with a "pending GACA confirmation" flag. The Integration Hub retries every 5 minutes and pages the on-call integration engineer after 3 failures.
- **Twilio delivery failure for security lead notification:** The engine falls back to email (via SendGrid) and to an automated phone call (via Twilio Programmable Voice) with a text-to-speech rendering of the message. If all channels fail, the PO is paged to contact the security lead by phone.
- **Kafka producer failure:** Motorcade status updates are queued locally in the Mobile BFF (for VL taps) and replayed on recovery. The PO console shows a "Sync degraded" indicator.
- **Privacy breach attempt (unauthorized user attempts to read a rank-1 motorcade record):** The OPA policy denies access; the attempt is logged as an S0 incident and the ED is paged immediately.

### H. Acceptance Criteria

- **Given** two motorcades scheduled at the same curb 3 minutes apart with `min_spacing_minutes = 3`, **When** the PO attempts to publish the motorcade schedule, **Then** the system warns of the conflict and proposes staggering (5-minute shift) or routing one motorcade to an alternate curb.
- **Given** a rank-1 dignitary's inbound flight is delayed by 30 minutes (FlightAware feed), **When** the new ETA pushes the motorcade into the peak check-in window (08:00-09:30), **Then** the system recomputes the predicted arrival, proposes priority curb access and a shortened 7-minute security briefing, and notifies PO, VL, and security lead within 60 seconds.
- **Given** a vehicle with `is_armored = false` and a rank-2 dignitary assignment, **When** the PO attempts to assign that vehicle to the motorcade, **Then** the assignment is blocked with an error naming the vehicle, the dignitary, and the armor requirement, and the system suggests the next available armored vehicle of the same class.
- **Given** two delegations with `conflict_flags` severity = restricted, **When** their motorcades are scheduled within 15 minutes of each other at the same curb, **Then** the engine forces a minimum 15-minute curb spacing, proposes separate vehicle gates if available, and notifies the PO with a break-glass override option requiring justification.
- **Given** a rank-1 motorcade is `in_transit` and GPS telemetry has not updated for more than 90 seconds, **When** the telemetry loss threshold is crossed, **Then** the engine raises an S1 incident, pages the security lead via PagerDuty within 30 seconds, switches the motorcade view to "Last Known Position", and surfaces the alternate route plan to the PO.
