> Module 8: Operations, Logistics & F&B Management -> 8.4 Ground Transport Fleet

## Ground Transport Fleet

### A. Purpose Statement

The Ground Transport Fleet subsystem is the authoritative inventory, scheduling, dispatch, live-tracking, and incident-response engine for every vehicle that moves a Forum participant between airport, hotel, venue, off-site ministerial retreat, and protocol event during the Future Minerals Forum. At FMF scale this covers 80+ owned and contracted vehicles (motorcoach shuttles, mid-size buses, VIP sedans, electric carts for venue-internal moves, and armoured sedans for protocol_rank 1-2 dignitaries), 120+ certified drivers across three shifts, 25+ scheduled routes (hotel loops, airport shuttles, venue-to-venue connectors), 60+ on-demand VIP pickups (some scheduled, some ad-hoc as dignitary plans change), and 10+ emergency medical and security vehicles on standby. A shuttle that breaks down with 30 attendees aboard during peak morning inflow can cascade into 4,000 late check-ins; a delayed VIP motorcade that misses its protocol window can disrupt a ministerial roundtable and trigger a diplomatic note.

The subsystem is the write-side owner of the `transport.*` Kafka topic prefix per the Module 0.1 bounded context table. It publishes `transport.route.published`, `transport.route.updated`, `transport.dispatch.assigned`, `transport.dispatch.started`, `transport.eta.updated`, `transport.dispatch.completed`, `transport.fleet.audit`, `transport.breakdown.reported`, `transport.replacement.dispatched`, `transport.vip_delay.conflict`, and `transport.signage.updated`. It subscribes to `registration.confirmed` (Module 6.1) to plan airport pickup demand, to `session.published` / `session.cancelled` (Module 4.1) to align shuttle schedules with session starts, to `resource.booking.confirmed` (Module 8.1) to extend VIP holding-room bookings on motorcade delay, to `supplier.compliance.flagged` (Module 8.2) to validate transport vendor drivers and vehicle insurance, and to `vip.protocol_rank.changed` (Module 2.1) to upgrade transport class on rank promotion. Its non-negotiable contract is that every moving vehicle has a GPS-derived ETA visible to the OL's War Room tile within 30 seconds of dispatch, that any breakdown triggers a replacement vehicle within 5 minutes for VIP routes and 15 minutes for shuttle routes, and that no driver is dispatched against a lapsed license or expired vehicle insurance.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all routes, dispatches, ETAs, and incidents. Write only via break-glass on VIP motorcade protocol changes (e.g., authorising a helicopter transfer as an alternative to a delayed ground motorcade). Sees a War Room tile summarizing active vehicles, on-time performance, and any open incidents.
- **Operations Lead (OL):** Primary operator. Read/write on fleet inventory, routes, driver shifts, dispatch, and incident response. Approves route changes affecting more than 200 attendees. Approves emergency vehicle release from standby.
- **Protocol Officer (PO):** Read on VIP routes and motorcade manifests. Write on protocol-specific buffer requirements (e.g., 15-minute pre-arrival sweep by security detail). Approves any VIP motorcade re-routing.
- **VIP Liaison (VL):** Read-only on the assigned dignitary's transport schedule, current vehicle location, and ETA. No write on fleet or routes.
- **Registration Manager (RM):** Read on airport-pickup demand forecasts (delegates arriving by flight, by hour). No write on fleet.
- **Sponsorship Sales Lead (SSL):** No direct access. Sees only "shuttle serving sponsor booths" flags.
- **Exhibitor Portal User (EPU):** Read on shuttle schedules servicing the exhibition hall. No write.
- **Content & Stage Manager (CSM):** Read on shuttle schedules for speaker hotel pickups. No write.
- **Matchmaking Concierge (MC):** No direct access.
- **Finance & Administration Lead (FAL):** Read on vehicle rental costs, driver shift costs, fuel, and incidentals. Write on cost-center allocation per route. Approves vendor invoices for transport suppliers.
- **Marketing & PR Lead (MPL):** Read on signage content for digital transport signage (e.g., shuttle loop displays). No write on dispatch.
- **ESG & Sustainability Officer (ESGO):** Read on vehicle emissions per route (electric vs. hybrid vs. diesel), idle time, and modal split. Write on ESG transport targets.
- **Field Volunteer (FV):** Read/write via Staff App (Module 7.2) on assigned dispatch tasks: log "driver checked in", "vehicle departed", "vehicle arrived", "passengers boarded". Raise incident reports for breakdowns or route deviations.
- **Attendee (ATT):** Read-only mirror of own scheduled shuttle via the Attendee App (Module 7.1) with live ETA and route map.

### C. Data Model

`vehicle` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL or import service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{geotab_vehicle_id, samsara_vehicle_id, license_plate, vin, blacklane_reservation_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `vehicle_type` | `enum[motorcoach, midibus, shuttle_van, vip_sedan, vip_armoured_sedan, electric_cart, medical_van, security_vehicle, helicopter]` | |
| `ownership` | `enum[owned, contracted_partner, on_demand_partner]` | |
| `supplier_id` | `uuid null` | FK -> supplier.id (Module 8.2) if contracted |
| `capacity_seated` | `int` | Seated passenger capacity |
| `capacity_wheelchair` | `int` | Default 0 |
| `fuel_type` | `enum[diesel, petrol, hybrid, electric, aviation_fuel]` | |
| `emissions_co2e_per_km` | `numeric(5,2)` | For ESG reporting |
| `license_plate` | `text` | |
| `insurance_status` | `enum[current, expiring_30d, expiring_7d, lapsed, not_on_file]` | Computed from compliance items |
| `compliance_status` | `enum[compliant, non_compliant, remediation, blocked]` | Aggregated |
| `last_safety_check_at` | `timestamptz` | Required pre-event inspection |
| `telematics_provider` | `enum[geotab, samsara, phone_gps, none]` | |
| `telematics_device_id` | `text null` | Hardware device ID |
| `is_accessible` | `bool` | Wheelchair lift or ramp |
| `is_vip_protocol_certified` | `bool` | Required for protocol_rank 1-2 transport |
| `home_base_geopoint` | `jsonb` | `{lat, lon}` of the vehicle's standby location |
| `standby_status` | `enum[on_standby, dispatched, in_service, returning, offline]` | |

`driver` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL or import service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{workday_employee_id, supplier_contact_id, geotab_driver_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `full_name` | `text` | |
| `primary_phone_e164` | `text` | Encrypted (AWS KMS envelope) |
| `supplier_id` | `uuid null` | FK -> supplier.id if contracted |
| `license_class` | `enum[a, b, c, d, e, diplomatic_certified]` | Local jurisdiction's commercial classes |
| `license_expiry_date` | `date` | Drives compliance |
| `languages` | `text[]` | ISO 639-1; required: at least `["en"]` for all drivers; VIP drivers require `["ar","en"]` |
| `security_clearance_level` | `enum[standard, enhanced, vip_protocol]` | vip_protocol required for protocol_rank 1-2 routes |
| `medical_cert_expiry` | `date` | Annual driver medical |
| `compliance_status` | `enum[compliant, non_compliant, remediation, blocked]` | Aggregated |
| `shift_assignments` | `jsonb[]` | `[{shift_id, vehicle_id, route_id, start_at, end_at}]` denormalized for Staff App |
| `last_dispatch_at` | `timestamptz null` | |
| `hours_on_duty_running` | `numeric(4,1)` | Hours, resets on shift break; max 12 per shift |

`transport_route` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL or auto-ingest |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{google_maps_directions_id, waze_url}` |
| `audit_log` | `jsonb[]` | Append-only |
| `route_type` | `enum[scheduled_loop, scheduled_one_way, on_demand_vip, on_demand_shuttle, emergency, motorcade]` | |
| `origin_geopoint` | `jsonb` | `{lat, lon, label}` |
| `destination_geopoint` | `jsonb` | `{lat, lon, label}` |
| `waypoints` | `jsonb[]` | `[{lat, lon, label, dwell_min}]` for multi-stop loops |
| `default_frequency_min` | `int null` | For scheduled_loop, e.g., 20 minutes |
| `first_departure_at` | `timestamptz` | First scheduled departure |
| `last_departure_at` | `timestamptz` | Last scheduled departure |
| `default_travel_time_min` | `int` | Baseline ETA without traffic |
| `default_vehicle_type` | `enum` (subset of `vehicle.vehicle_type`) | Required vehicle type for this route |
| `min_compliance_status` | `enum[compliant, vip_protocol_certified]` | |
| `linked_session_ids` | `uuid[]` | Sessions this route services (Module 4.1) |
| `linked_resource_booking_ids` | `uuid[]` | VIP holding-room bookings to extend on delay (Module 8.1) |
| `is_vip_protocol` | `bool` | True for motorcade and on_demand_vip routes |
| `dignitary_id` | `uuid null` | FK -> dignitary_profile.id (Module 2.1) if is_vip_protocol |
| `live_status` | `enum[scheduled, active, delayed, breakdown, completed, cancelled]` | |

`transport_dispatch` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL or dispatcher |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{blacklane_reservation_id, samsara_dispatch_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `route_id` | `uuid` | FK -> transport_route.id |
| `vehicle_id` | `uuid` | FK -> vehicle.id |
| `driver_id` | `uuid` | FK -> driver.id |
| `scheduled_departure_at` | `timestamptz` | |
| `actual_departure_at` | `timestamptz null` | |
| `scheduled_arrival_at` | `timestamptz` | |
| `actual_arrival_at` | `timestamptz null` | |
| `live_eta_at` | `timestamptz null` | Real-time ETA from telematics |
| `passenger_count` | `int null` | |
| `passenger_registration_ids` | `uuid[]` | ATT IDs for on_demand_vip routes; sampled for shuttles |
| `live_status` | `enum[scheduled, dispatched, departed, in_transit, arrived, completed, breakdown, cancelled, replaced]` | |
| `geopoint_last` | `jsonb null` | `{lat, lon, heading_deg, speed_kmh, recorded_at}` |
| `geopoint_history` | `jsonb[]` | Last 100 geopoints for replay |
| `delay_reason` | `enum[traffic, weather, vehicle_issue, security_hold, vip_protocol_delay, other] null` | |
| `replacement_dispatch_id` | `uuid null` | Self-FK if replaced due to breakdown |
| `vip_delay_conflict_id` | `uuid null` | Self-FK to next dispatch affected |

### D. Business Logic & Edge Cases

- **IF** a `transport_dispatch` is created with a `vehicle_id` whose `compliance_status != compliant` OR `insurance_status` in `{expiring_7d, lapsed}`, **THEN** the save is blocked with a "Vehicle Non-Compliant" error and the OL is shown the top 3 alternate compliant vehicles of the required `vehicle_type`.
- **IF** a `transport_dispatch` is created with a `driver_id` whose `compliance_status != compliant` OR `hours_on_duty_running >= 11.5`, **THEN** the save is blocked; if `route.is_vip_protocol = true` and `driver.security_clearance_level != vip_protocol`, the save is blocked with a "Driver Not VIP-Certified" error.
- **IF** telematics data (Geotab, Samsara, or driver phone GPS via the Staff App) reports a `geopoint_last` update more than 90 seconds stale, **THEN** the dispatch is flagged "Telematics Stale" on the OL's War Room tile and the FV or driver receives a Staff App prompt to confirm location.
- **IF** a `transport_dispatch` with `route.is_vip_protocol = true` and `dignitary.protocol_rank` 1 or 2 has `live_eta_at > scheduled_arrival_at` (i.e., late), **THEN** the engine publishes `transport.vip_delay.conflict` and surfaces to PO and VL with three proposed options: (1) delay the linked session start (requires CSM + ED co-approval per Module 4.1), (2) shorten the dignitary's prior commitment (requires PO approval and re-booking of any dependent `resource_booking` in Module 8.1), or (3) switch to helicopter transfer (requires ED break-glass, an available `helicopter` vehicle, and weather clearance).
- **IF** a `vehicle.standby_status = in_service` vehicle's telematics reports zero speed for more than 5 minutes mid-route, **THEN** the dispatch is flagged "Possible Breakdown" and the driver receives a Staff App prompt to confirm status; if confirmed breakdown, the engine publishes `transport.breakdown.reported` and triggers the replacement workflow.
- **IF** a breakdown is reported on a shuttle route with `passenger_count > 0`, **THEN** the engine auto-dispatches the nearest available replacement vehicle of the same `vehicle_type` from `home_base_geopoint`, publishes `transport.replacement.dispatched`, sends a Twilio SMS (via anonymized number) to each affected passenger's ATT app, and updates the public signage at downstream stops with the new ETA. The replacement vehicle is given priority routing via Google Maps/Waze.
- **IF** a `transport_route` is a `scheduled_loop` with `default_frequency_min = 20`, **THEN** the engine auto-generates `transport_dispatch` records for each loop iteration between `first_departure_at` and `last_departure_at`; a route change triggers regeneration and a `transport.route.updated` event.
- **IF** a driver's `license_expiry_date` or `medical_cert_expiry` is within 30 days, **THEN** the driver's `compliance_status` transitions to `remediation`, the driver and their supplier (if contracted) are notified, and any `transport_dispatch` scheduled more than 7 days out is flagged for reassignment if the certification is not renewed.
- **IF** the OL changes a route's `default_frequency_min` from 20 to 30 mid-event (e.g., to consolidate shuttles due to low demand), **THEN** all future `transport_dispatch` records are regenerated, affected drivers are notified via Staff App with updated manifests, and the public signage is refreshed within 60 seconds.

**Edge case (non-obvious): shuttle breaks down mid-route with 30 attendees on board.** At 08:42 on Day 1, shuttle S-14 (motorcoach, 50-seat capacity, 30 attendees on board) on the Hotel Loop A route breaks down on the highway 8 km from the venue. The driver taps "Breakdown" on the Staff App and confirms via voice note. The engine immediately: (1) publishes `transport.breakdown.reported` with `passenger_count = 30` and `passenger_registration_ids = [...]` (sampled via the boarding scan log from Module 6.2), (2) queries `vehicle` records for the nearest `motorcoach` with `standby_status = on_standby` and `compliance_status = compliant` (the nearest candidate is S-22, 4 km away at a hotel standby point), (3) creates a replacement `transport_dispatch` with `vehicle_id = S-22` and a `replacement_dispatch_id` cross-reference, (4) sends a Twilio SMS from an anonymized number (via Twilio Proxy API to mask driver and attendee phone numbers) to each of the 30 attendees with the message: "Your shuttle S-14 has experienced a mechanical issue. Replacement vehicle S-22 will arrive at your location in approximately 12 minutes. Please remain at the current location safely. Track replacement at app.fmf.example/track/S-22." (5) pushes an in-app notification via Module 7.3 to those attendees with a live-tracking deep link, (6) updates the public digital signage at the venue arrival zone and at Hotel A lobby to reflect the new ETA for the affected loop, (7) dispatches a security vehicle to the breakdown location to ensure attendee safety until the replacement arrives, (8) alerts the OL's War Room tile with a "Breakdown: S-14, 30 pax, replacement 12 min ETA" banner. The original driver logs "Passengers Transferred" once the replacement arrives and all 30 attendees board S-22; the engine closes the breakdown dispatch and S-14's `standby_status` transitions to `offline` pending maintenance. The affected attendees' arrival lateness is recorded for FAL attendance-tracking purposes but does not count against them in the no-show algorithm.

**Edge case (non-obvious): VIP motorcade delayed by traffic and conflicts with the next scheduled event.** At 13:50 on Day 2, the motorcade for protocol_rank 1 dignitary (Head of State from a guest country) is en route from the off-site ministerial retreat to the venue for a 14:30 plenary address. At 13:55, the Geotab telematics reports the motorcade's `live_eta_at = 14:42` (12 minutes late vs. the 14:30 scheduled arrival, conflicting with the plenary address which cannot start late by diplomatic protocol). The engine immediately publishes `transport.vip_delay.conflict` and surfaces to PO and VL with a modal showing three options: (1) Delay the plenary start (requires CSM and ED co-approval per Module 4.1's session-timing break-glass; the CSM's stage run sheet would need to insert a 15-minute interstitial segment, and Module 7.3 would push a session_reminder update to the 3,800 registered attendees; cost: US$ 0 direct, high diplomatic cost if the host country's protocol office objects), (2) Shorten the dignitary's prior commitment (the retreat roundtable would need to end 15 minutes early; requires PO approval and re-booking of any dependent `resource_booking` in Module 8.1 for the retreat room; the roundtable's other participants would need to be notified), (3) Switch to helicopter transfer (requires ED break-glass approval; an available `helicopter` vehicle with `is_vip_protocol_certified = true` must be within range; weather clearance from the aviation partner; estimated new ETA = 14:18, within the 14:30 window; cost: US$ 12 K for the helicopter charter, visible to FAL). The PO and VL jointly evaluate; if they choose option 3, the ED's break-glass approval is requested via a Twilio push notification with a 5-minute TTL; on approval the engine creates a new `transport_dispatch` with `route_type = motorcade` and `vehicle_type = helicopter`, cancels the original ground dispatch, notifies the security detail to redirect to the helipad, and pushes an updated ETA to the Attendee App for protocol_rank 1-2 attendees awaiting the dignitary's arrival. The original ground motorcade is rerouted to the venue as backup. The incident is logged in `audit_log` with all approver identities, the chosen option, the timestamp, and the cost; it surfaces on the ESGO's post-event review because the helicopter charter has a high carbon footprint (recorded in `vehicle.emissions_co2e_per_km`).

### E. Third-Party Integrations

- **Geotab / Samsara (fleet telematics):** Real-time GPS polling every 15 seconds for each dispatched vehicle via the Geotab / Samsara API. Data flow: Geotab/Samsara cloud -> Integration Hub webhook -> `transport_dispatch.geopoint_last` updated; `transport.eta.updated` published. Driver behaviour (harsh braking, idle time) is captured for ESGO reporting.
- **Google Maps / Waze (routing and ETA):** Real-time traffic-aware routing. Data flow: Integration Hub calls Google Maps Directions API or Waze Embedded API on each `geopoint_last` update to compute `live_eta_at`; route changes proposed by Google Maps (e.g., incident on the planned route) trigger a `transport.route.updated` recommendation to the OL.
- **Twilio (driver-attendee communication with anonymized numbers):** Twilio Proxy API creates a masked number pair so drivers and attendees can communicate without exposing personal phone numbers. Data flow: FMF dispatch event -> Integration Hub -> Twilio Proxy API -> masked number pair created; SMS and voice calls route through Twilio; per-message and per-minute costs tracked and attributed to FAL cost center.
- **Blacklane / Carey (premium VIP transport partner integration):** For on_demand_vip routes when owned fleet capacity is insufficient, the Integration Hub dispatches a Blacklane or Carey reservation via their partner API. Data flow: FMF -> Integration Hub -> Blacklane/Carey API -> reservation confirmed with `driver_name`, `vehicle_plate`, `pickup_eta`; Blacklane/Carey webhook -> FMF `transport_dispatch.ext_refs.blacklane_reservation_id`.
- **Workday (driver records and certifications):** Read-only sync of driver profiles, license classes, medical certification dates, and security clearance levels. Data flow: Workday HCM REST API -> Integration Hub -> `driver` table.
- **Microsoft Outlook / Google Calendar (driver shift scheduling):** When a `transport_dispatch` is created, the Integration Hub creates a calendar invite for the driver's shift via Microsoft Graph / Google Calendar API. Decline triggers reassignment.
- **PagerDuty (incident escalation for breakdowns with passenger risk):** `transport.breakdown.reported` with `passenger_count > 0` triggers a PagerDuty incident paging the OL and on-call security lead.
- **Kafka topics:** Publishes `transport.*` (full list above). Subscribes to `registration.confirmed` (Module 6.1), `session.published` / `session.cancelled` (Module 4.1), `resource.booking.confirmed` (Module 8.1), `supplier.compliance.flagged` (Module 8.2), `vip.protocol_rank.changed` (Module 2.1).

### F. UI/UX Notes

The OL's primary screen is a four-quadrant layout. Top-left: a fleet inventory list filterable by `vehicle_type`, `compliance_status`, and `standby_status`; each row shows a colored chip (green = on_standby, blue = dispatched, red = breakdown, gray = offline). Top-right: the selected vehicle or driver's detail with tabs for Overview, Compliance Items, Dispatch History, Telematics (live map view), and ESG Profile. Bottom-left: a live fleet map (Google Maps or Mapwize for venue-internal electric carts) showing all active vehicles color-coded by route type (gold = motorcade, blue = scheduled shuttle, purple = on_demand_vip, green = electric cart, red = breakdown in progress). Bottom-right: the dispatch Kanban with columns for Scheduled, Dispatched, In Transit, Arrived, Completed, Breakdown, Replaced; cards drag between columns with state-machine validation; each card shows route name, vehicle ID, driver name, scheduled vs. live ETA, and passenger count.

The top banner shows three counts: "Active Vehicles", "On-Time Performance" (percentage of dispatches where `actual_arrival_at <= scheduled_arrival_at`), and "Open Incidents" (breakdowns, replacements in progress, VIP delay conflicts). The VIP delay conflict modal opens automatically when triggered and shows the three resolution options side by side with cost, time, and protocol implications.

The FV's Staff App view shows their assigned dispatch as a card with the route map, scheduled times, vehicle ID, and large action buttons: "Driver Checked In", "Vehicle Departed", "Passengers Boarded", "Vehicle Arrived". A "Report Breakdown" button opens the incident form with photo capture and an auto-located geopoint.

The ATT's Attendee App view shows a "My Transport" card for their scheduled shuttle with live ETA, next pickup time, route map, and a "Track My Shuttle" deep link.

### G. Failure Modes & Offline Behavior

- **Geotab / Samsara API outage:** Telematics data becomes stale; the driver's Staff App falls back to phone GPS polling (less precise but functional) and pushes geopoints via the Module 7.4 sync mechanism; the OL sees a "Telematics Provider Degraded" banner and an amber chip on each affected dispatch; live ETAs are computed from the phone GPS with a confidence flag.
- **Google Maps / Waze API outage:** The Integration Hub falls back to the route's `default_travel_time_min` baseline; the OL sees a "Routing on Baseline" warning; new dispatches use the static route without traffic-aware optimization.
- **Twilio Proxy API outage:** Driver-attendee SMS is sent via the driver's personal phone with a privacy warning (the FMF platform cannot guarantee number masking); the OL is alerted and a post-event audit is queued to verify no PII was mishandled.
- **Blacklane / Carey partner API outage:** The Integration Hub retries 3 times; on final failure the OL is alerted to manually dispatch an owned vehicle or contact the partner via phone; the dispatch is held in `scheduled` state with a "Partner Unreachable" flag.
- **Kafka broker failure (cross-region):** MirrorMaker 2 continues replicating; dispatch and telematics writes in the failed region are queued locally and replayed within 2 seconds of broker recovery; offline-first per Module 7.4 ensures driver milestone logs are not lost.
- **OL mobile device offline during a breakdown incident:** The replacement workflow runs server-side automatically; the OL receives a push notification with a deep link to the incident modal; if the device remains offline for more than 5 minutes, the engine auto-approves the default replacement workflow (nearest compliant vehicle of the same type) and queues the OL's review for reconnect.
- **Driver's Staff App offline (no telematics, no milestone logging):** The driver's last-known geopoint remains visible on the OL's map with a "Stale - last update N min ago" warning; the OL can call the driver via the Twilio Proxy masked number; on driver reconnect, all queued milestones sync with original timestamps preserved.

### H. Acceptance Criteria

- **Given** a `transport_dispatch` is attempted for a VIP motorcade route with `dignitary.protocol_rank = 1`, **When** the OL selects a vehicle with `is_vip_protocol_certified = false` or a driver with `security_clearance_level != vip_protocol`, **Then** the save is blocked with a "Vehicle/Driver Not VIP-Certified" error naming the specific compliance gap, and the OL is shown the top 3 compliant alternatives.
- **Given** a shuttle dispatch with `passenger_count = 30` is in transit and the driver reports a breakdown via Staff App at 08:42, **When** the breakdown is submitted, **Then** the engine publishes `transport.breakdown.reported` within 5 seconds, queries for the nearest compliant replacement vehicle, creates a replacement `transport_dispatch` within 60 seconds, dispatches Twilio SMS via anonymized numbers to all 30 attendees with the new ETA, updates the public digital signage at the venue and hotel, and surfaces a "Breakdown: S-14, 30 pax, replacement 12 min ETA" banner on the OL's War Room tile.
- **Given** a VIP motorcade for protocol_rank 1 dignitary is en route with `live_eta_at = 14:42` vs. scheduled arrival at 14:30 for a plenary address, **When** the engine detects the conflict, **Then** it publishes `transport.vip_delay.conflict` within 10 seconds, surfaces a modal to PO and VL with three options (delay plenary start with CSM+ED break-glass, shorten prior commitment with PO approval, or switch to helicopter with ED break-glass and weather clearance), and on selection of option 3 records the US$ 12 K cost in FAL's ledger and the carbon footprint in ESGO's report.
- **Given** a driver's `license_expiry_date` is 25 days away, **When** the daily compliance reconciliation job runs at 02:00, **Then** the driver's `compliance_status` transitions to `remediation`, the driver and their supplier receive a portal notification with a renewal deadline, and any `transport_dispatch` scheduled more than 7 days out is flagged for reassignment if the license is not renewed by the deadline.
- **Given** the OL changes a Hotel Loop A route's `default_frequency_min` from 20 to 30 mid-event, **When** the route change is saved, **Then** all future `transport_dispatch` records are regenerated within 30 seconds, affected drivers receive updated manifests via Staff App, the public signage at all stops refreshes within 60 seconds, and a `transport.route.updated` event is published.
