> Module 8: Operations, Logistics & F&B Management -> 8.3 F&B and Catering Orchestration

## F&B and Catering Orchestration

### A. Purpose Statement

The F&B and Catering Orchestration subsystem is the authoritative planner, dietary validator, live-service monitor, and food-safety incident responder for every catered food event at the Future Minerals Forum. At FMF scale this covers 40+ catered events across three days (banquets, VIP receptions, ministerial working breakfasts, delegate coffee breaks, gala dinners, exhibition hall grab-and-go stations), serving 30,000+ covers in aggregate with 8 dietary categories per cover (omnivore, vegetarian, vegan, halal, kosher, gluten-free, nut-allergy, shellfish-allergy), sourced from up to 6 concurrent caterers with their own sub-recipes and ingredient traceability streams. A single mis-served allergen at a VIP banquet attended by a Head of State can become a ministerial-level diplomatic incident; a 5-minute delay in a coffee break for 4,000 attendees produces queue cascades that overflow into the exhibition hall aisles.

The subsystem is the write-side owner of the `fnb.*` Kafka topic prefix per the Module 0.1 bounded context table. It publishes `fnb.event.confirmed`, `fnb.event.coverage_validated`, `fnb.menu.uploaded`, `fnb.dietary.gap_flagged`, `fnb.service.progress` (start, mid-service, end milestones), `fnb.service.deviation`, `fnb.cover.change.requested`, `fnb.incident.quarantined`, and `fnb.incident.notified`. It subscribes to `registration.confirmed` and `registration.dietary_updated` (Module 6.1) to keep per-session dietary aggregates live, to `session.published` (Module 4.1) to auto-link catered events to sessions, to `resource.booking.confirmed` (Module 8.1) to reserve F&B service areas, and to `supplier.compliance.flagged` (Module 8.2) to escalate caterer compliance issues. Its non-negotiable contract is that no F&B event goes live without a menu whose coverage matrix matches every declared dietary need of every confirmed attendee on the guest list, and that every served batch is traceable to a supplier ingredient lot within 30 seconds.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all F&B events and dietary aggregates. Write only via break-glass on gala-dinner menu overrides (e.g., host-country requests a last-minute change to feature a specific regional dish). Sees a War Room tile summarizing covers-served vs. covers-planned in real time.
- **Operations Lead (OL):** Read/write on F&B events, caterer assignments, service schedules. Approves cover-count changes within 10% of confirmed; above requires FAL co-approval. Approves caterer substitutions during an incident.
- **Protocol Officer (PO):** Read-only on VIP banquet seating and menu, with emphasis on religious and cultural compliance (e.g., halal certification for the OIC delegation dinner). Write only on protocol-specific menu flags (e.g., "no alcohol service during ministerial working lunch in observance of guest delegation").
- **VIP Liaison (VL):** Read-only on the assigned dignitary's dietary needs, allergen alerts, and assigned banquet table. No write on F&B planning.
- **Registration Manager (RM):** Read on dietary aggregate trends across the registration base. Write only on dietary need field on the registration form (consumed by this subsystem via Kafka).
- **Sponsorship Sales Lead (SSL):** Read on sponsor-hosted reception catering plans. Write only on sponsor-catered menu proposals, subject to OL approval.
- **Exhibitor Portal User (EPU):** Read on sponsor-hosted reception details they are invited to. No write on F&B data.
- **Content & Stage Manager (CSM):** No direct access. Sees only the F&B schedule integrated into the run-of-show.
- **Matchmaking Concierge (MC):** No direct access.
- **Finance & Administration Lead (FAL):** Read on caterer POs and invoices (sourced from Module 8.2). Write on cover-count-change approvals above 10%. Approves surcharges for last-minute menu expansions.
- **Marketing & PR Lead (MPL):** Read on gala dinner menu for press kit and dignitary gift coordination. No write.
- **ESG & Sustainability Officer (ESGO):** Read on food waste tracking, local-sourcing percentage per caterer, and composting/diversion rate. Write on ESG F&B targets per event.
- **Field Volunteer (FV):** Read/write on assigned F&B service tasks via Staff App (Module 7.2): log "food delivered", "service started", "service ended" milestones; raise F&B incident reports with photo.
- **Attendee (ATT):** Read-only mirror of own dietary selection (recorded at registration) and own invited banquet assignment via the Attendee App (Module 7.1).

### C. Data Model

`fnb_event` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL or auto-ingest |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{linked_session_id, linked_resource_booking_id, caterer_supplier_id, touchbistro_order_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `fnb_type` | `enum[breakfast, coffee_break, banquet, vip_reception, working_lunch, gala_dinner, grab_and_go_station, tea_break]` | Drives default cover rules |
| `linked_session_id` | `uuid null` | FK -> session.id (Module 4.1) if F&B tied to a session |
| `venue_resource_id` | `uuid` | FK -> resource.id (Module 8.1, the booked area) |
| `caterer_supplier_id` | `uuid` | FK -> supplier.id (Module 8.2) |
| `service_start_at` | `timestamptz` | When food service begins (separate from setup) |
| `service_end_at` | `timestamptz` | When food service ends |
| `covers_planned` | `int` | Initial cover count |
| `covers_confirmed` | `int` | After registration cutoff (typically T-48h) |
| `covers_actual` | `int null` | Recorded at service end via FV tally |
| `dietary_aggregate` | `jsonb` | `{omnivore, vegetarian, vegan, halal, kosher, gluten_free, nut_allergy, shellfish_allergy}` counts |
| `menu_id` | `uuid null` | FK -> fnb_menu.id once menu uploaded |
| `coverage_status` | `enum[not_uploaded, partial, validated, gap_flagged, manually_overridden]` | Computed from menu vs. dietary_aggregate |
| `service_progress` | `enum[scheduled, food_delivered, service_started, mid_service, service_ended, cleared]` | Live milestone tracking |
| `last_progress_update_at` | `timestamptz null` | |
| `deviation_alert_count` | `int` | Reset on each event |
| `is_vip_protocol_event` | `bool` | True for protocol_rank 1-2 banquets; triggers extra security |
| `surcharge_usd` | `numeric(10,2) null` | If menu expanded mid-cycle |
| `linked_po_id` | `uuid null` | FK -> procurement_record.id (Module 8.2) |

`fnb_menu` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Caterer via portal or OL |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{foodlogiq_menu_id, caterer_internal_code}` |
| `audit_log` | `jsonb[]` | Append-only |
| `fnb_event_id` | `uuid` | FK -> fnb_event.id |
| `caterer_supplier_id` | `uuid` | FK -> supplier.id |
| `menu_title` | `text` | e.g., "Ministerial Banquet - Saudi Fusion" |
| `service_phase` | `enum[starter, main, dessert, beverage, canape, buffet_station]` | |
| `menu_items` | `jsonb[]` | `[{item_name, description, dietary_tags[], allergen_tags[], ingredient_lots[], serving_temp_c, plating_notes}]` |
| `coverage_matrix` | `jsonb` | `{omnivore: [items], vegetarian: [items], vegan: [items], halal: [items], kosher: [items], gluten_free: [items], nut_allergy: [items], shellfish_allergy: [items]}` |
| `halal_certification_ref` | `text null` | Required if `halal` count > 0 |
| `kosher_certification_ref` | `text null` | Required if `kosher` count > 0 |
| `uploaded_at` | `timestamptz` | From caterer portal |
| `validated_at` | `timestamptz null` | When system auto-validates coverage |

`fnb_service_log` (extends shared columns, FV-tapped milestone events):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | FV via Staff App |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{photo_asset_ids, batch_lot_codes}` |
| `audit_log` | `jsonb[]` | Append-only |
| `fnb_event_id` | `uuid` | FK -> fnb_event.id |
| `milestone` | `enum[food_delivered, service_started, mid_service, service_ended, cleared, deviation_reported, incident_reported]` | |
| `recorded_at_device` | `timestamptz` | FV device timestamp (preserved across offline per Module 7.4) |
| `recorded_at_server` | `timestamptz null` | Server-reconciled timestamp |
| `covers_served_running` | `int null` | Running tally for mid_service milestones |
| `deviation_type` | `enum[late_delivery, under_quantity, quality_issue, allergen_concern, equipment_failure, staff_shortfall, other] null` | |
| `notes` | `text null` | Free-text |
| `severity` | `enum[s0, s1, s2, s3] null` | For incident_reported milestones |

`fnb_incident` (extends shared columns, food safety incidents):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | FV, OL, or auto-trigger |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{pagerduty_incident_id, foodlogiq_recall_id, medical_case_ids, war_room_incident_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `fnb_event_id` | `uuid` | FK -> fnb_event.id |
| `affected_menu_item_ids` | `uuid[]` | FK -> fnb_menu.menu_items[] (item-level) |
| `affected_batch_lots` | `text[]` | From `ingredient_lots` |
| `incident_type` | `enum[suspected_allergen_exposure, food_poisoning_suspected, foreign_object, contamination, temperature_deviation, supplier_recall, other]` | |
| `severity` | `enum[s0, s1, s2, s3]` | s0 = single ATT reaction, s3 = mass exposure |
| `detected_at` | `timestamptz` | |
| `quarantine_status` | `enum[active, released, destroyed]` | |
| `affected_registration_ids` | `uuid[]` | Attendees who consumed the suspect item (from check-in scan log) |
| `notification_status` | `enum[pending, sent, acknowledged, partial_failure]` | |

### D. Business Logic & Edge Cases

- **IF** an `fnb_event` is created and the `linked_session_id` has a confirmed registration list, **THEN** the engine computes `dietary_aggregate` from the dietary fields on each `registration` record and stores the JSON; on every `registration.dietary_updated` event the aggregate recomputes within 5 seconds.
- **IF** a `fnb_menu` is uploaded whose `coverage_matrix` does not include at least one menu item for every dietary tag with a non-zero count in `dietary_aggregate`, **THEN** `coverage_status = gap_flagged`, a `fnb.dietary.gap_flagged` event is published naming the missing tags (e.g., "kosher: 0 items for 2 declared kosher attendees"), and the OL and caterer primary contact are alerted.
- **IF** `dietary_aggregate.halal > 0` and the `fnb_menu.halal_certification_ref` is null, **THEN** block `coverage_status = validated` until the caterer uploads the certificate; flag for OL intervention.
- **IF** a caterer's `supplier.compliance_status` regresses to `blocked` after `fnb_event.confirmed`, **THEN** the F&B event is flagged with a "Caterer Non-Compliant" warning, the OL is paged, and the engine proposes the top 3 alternate compliant caterers by `category_tags` intersection and prior `overall_score`.
- **IF** a `fnb_service_log` milestone is recorded later than the scheduled `service_start_at` plus 5 minutes, **THEN** publish `fnb.service.deviation` with `deviation_type = late_delivery` and surface on the OL's War Room tile.
- **IF** a FV submits `covers_served_running` below 80% of `covers_confirmed` at the `mid_service` milestone, **THEN** publish `fnb.service.deviation` with `deviation_type = under_quantity` and alert the OL to investigate (caterer under-supplied or attendance lower than expected).
- **IF** an `fnb_incident` is created with `severity = s3`, **THEN** the engine publishes `fnb.incident.quarantined`, triggers a PagerDuty s0 incident (reusing Module 1.2 severity scale), auto-creates a War Room incident tile (Module 1.2), and runs a 4-step automated response: (1) quarantine the affected batch lots in the caterer's FoodLogiQ traceability system, (2) alert on-site medical staff via Twilio SMS, (3) compute `affected_registration_ids` from the F&B check-in scan log (every attendee who scanned into the service area within the service window), (4) push a targeted `safety_alert` notification via Module 7.3 to those attendees' Attendee App with the suspect item name and the action to take.
- **IF** a cover-count change request exceeds `covers_confirmed` by more than 10%, **THEN** the change requires FAL co-approval (for surcharge) and the caterer must confirm capacity via the supplier portal before the new count is committed.
- **IF** the FV's Staff App is offline when a service milestone is logged, **THEN** the milestone is queued locally with `recorded_at_device` preserved and synced on reconnect per Module 7.4's offline-first protocol; the server preserves the original device timestamp in the canonical record.

**Edge case (non-obvious): last-minute dignitary confirmation adds 5 covers to a capacity banquet.** At T-2 hours before a Ministerial Banquet (a protocol_rank 1-2 VIP event), the Protocol Officer confirms that an additional Minister of Energy from a guest country will attend, plus 4 staff. The banquet is at `covers_confirmed = 200` which equals the venue's `capacity = 200`. The OL receives an in-app alert and is shown three options: (1) Expand the menu with surcharge (the caterer must confirm availability of additional covers at this notice; default surcharge rate is 1.5x the per-cover cost due to expedite fees; estimated surcharge = US$ 5 K for 5 covers); this expansion requires FAL co-approval and pushes a `fnb.cover.change.requested` event that the caterer must accept via portal within 30 minutes. (2) Relocate overflow attendees to a secondary room with a video feed of the banquet (requires a parallel F&B service in the secondary room, which must be a previously unbooked `resource` in Module 8.1; the engine auto-searches for an available adjacent room of `capacity >= 5` and proposes the top 3); PO must approve the protocol implication of relocating a delegation. (3) Decline the additional covers (the PO must communicate to the guest delegation that the banquet is at capacity; the dignitary attends only the post-banquet reception). If option (1) is chosen, the caterer's portal receives a "Cover Expansion Request - Action Required in 30 min" notification, the FAL receives a "Surcharge Approval" workflow, and on both approvals the `covers_confirmed` is updated to 205, the `dietary_aggregate` recomputes from the new registration list, and the menu's `coverage_status` is re-validated. If the new covers' dietary needs (e.g., the new Minister requires halal) introduce a gap, the gap-flag workflow restarts with a 30-minute SLA.

**Edge case (non-obvious): suspected allergen exposure triggers food safety incident.** During service at a VIP reception, an attendee reports throat swelling to a FV. The FV opens the Staff App incident report, selects category `allergen_concern`, severity `s2`, photographs the suspect canape, and submits. The engine immediately creates an `fnb_incident` with `severity = s2` (escalated to `s3` if a second attendee reports symptoms within 10 minutes), publishes `fnb.incident.quarantined`, and triggers the 4-step automated response. FoodLogiQ's API receives a recall request for the batch lots associated with the canape's `ingredient_lots` array, quarantining the remaining inventory in the caterer's cold storage within 60 seconds. The on-site medical team (positioned at every VIP event per protocol) receives a Twilio SMS with the attendee's location, the suspect item, the ingredient list, and the allergen tags. The engine computes `affected_registration_ids` by querying the NFC tap log (Module 6.2) for everyone who entered the reception area during the service window (e.g., 19:00-21:30) and cross-references with the registration dietary field (anyone with `nut_allergy = true` is a high-priority notification target). Module 7.3 sends a targeted `safety_alert` push notification to those attendees via Azure Notification Hubs with the message: "Important F&B safety alert: please check the FMF app for guidance on a food item consumed at the [Reception Name]." The notification deep-links to an in-app screen with the suspect item photo, the allergen tag, and the action to take (e.g., "If you consumed the almond-crusted canape and have a nut allergy, please proceed to the medical station at [location] or contact [medical hotline number]"). The OL's War Room tile surfaces the incident with a real-time count of notifications sent, acknowledged, and any responses indicating symptoms. The incident remains in `quarantine_status = active` until the OL, the medical lead, and the caterer's food safety officer jointly sign off on release or destruction of the affected batch.

### E. Third-Party Integrations

- **TouchBistro / Lightspeed Restaurant (caterer POS, optional):** For large caterers who use a POS for plated-service tracking, the Integration Hub pulls order-to-cover data in near-real-time. Data flow: TouchBistro/Lightspeed webhook -> Integration Hub -> `fnb_service_log.covers_served_running` updated every 60 seconds during service. Not all caterers use POS; the FV-tapped milestone remains the authoritative fallback.
- **FoodLogiQ (food safety traceability):** Bidirectional. Caterers upload menu items, ingredient lots, and supplier sources to FoodLogiQ; FMF mirrors them into `fnb_menu.menu_items[].ingredient_lots` and `coverage_matrix`. On an incident, FMF sends a quarantine request to FoodLogiQ via REST API; FoodLogiQ confirms quarantine within 60 seconds and FMF records `quarantine_status = active`. Data flow: FMF -> Integration Hub -> FoodLogiQ; FoodLogiQ webhook -> Integration Hub -> FMF.
- **Twilio (attendee notifications during incidents):** For `fnb_incident` notifications where the attendee's `push_opt_in_state != granted` (per Module 7.1) or for protocol_rank 1-3 attendees who are always reached via SMS regardless, the Integration Hub dispatches a Twilio Programmable SMS with the safety alert. Data flow: FMF `fnb.incident.notified` event -> Integration Hub -> Twilio SMS API; per-message cost tracked and attributed to FAL cost center (Module 9).
- **Microsoft Outlook / Google Calendar (caterer scheduling):** When an `fnb_event.confirmed` event fires, the Integration Hub creates calendar invites for the caterer's on-site team via Microsoft Graph / Google Calendar API. Data flow: FMF -> Integration Hub -> Microsoft Graph / Google Calendar; decline notification back -> FMF flags for OL reassignment.
- **Coupa (caterer PO and invoice):** Cross-references Module 8.2. Each `fnb_event.linked_po_id` resolves to a procurement record in Coupa; surcharges from cover expansions create PO change orders in Coupa.
- **PagerDuty (incident escalation):** `fnb_incident` with `severity >= s2` triggers a PagerDuty incident paging the on-call OL and the medical lead.
- **Kafka topics:** Publishes `fnb.*` (full list above). Subscribes to `registration.confirmed`, `registration.dietary_updated` (Module 6.1), `session.published` (Module 4.1), `resource.booking.confirmed` (Module 8.1), `supplier.compliance.flagged` (Module 8.2).

### F. UI/UX Notes

The OL's primary screen is a four-quadrant layout. Top-left: a list of `fnb_event` records for the active day, filterable by `fnb_type`, `caterer_supplier_id`, and `service_progress`. Each row shows a colored chip for `service_progress` (gray = scheduled, blue = delivered, green = in service, dark green = ended) and `coverage_status` (green check = validated, amber = gap_flagged, red = not_uploaded). Top-right: the selected event's detail with tabs for Overview (covers, dietary aggregate, menu link), Coverage Matrix (a grid of dietary tags x menu items showing which items satisfy which tags), Service Progress (live milestone timeline with FV-logged timestamps vs. scheduled), and Incident Log. Bottom-left: a live "Service Floor" map showing each active F&B event's location with real-time `covers_served_running` vs. `covers_confirmed` progress bars. Bottom-right: the deviation and incident alert feed.

The FV's Staff App view (Module 7.2) shows their assigned F&B task as a card with the event name, location, scheduled service window, and three large action buttons: "Food Delivered", "Service Started", "Service Ended". Each tap records a milestone in `fnb_service_log`. An "Report Issue" button opens the incident report form with a photo capture and a category dropdown.

The FAL's view adds a "Surcharge Approval" queue above the standard layout. The caterer's portal (Coupa-branded) shows their assigned events, menus (with upload form), and an "Action Required" queue for cover expansion requests.

### G. Failure Modes & Offline Behavior

- **FoodLogiQ API outage during an incident:** The Integration Hub logs the quarantine request locally with a 24-hour TTL; the engine still proceeds with attendee notification and medical alert (these are independent of FoodLogiQ). The OL manually directs the caterer's food safety officer to quarantine the physical batch via phone; the FoodLogiQ record is backfilled on API recovery.
- **TouchBistro/Lightspeed webhook silent failure:** The FV-tapped milestone remains authoritative; the POS-derived `covers_served_running` is treated as a secondary signal. The OL sees a "POS sync delayed" badge; the FV is prompted to manually tap mid-service covers-served counts.
- **Twilio SMS delivery failure during incident notification:** The Integration Hub retries 3 times with 30-second backoff; on final failure it falls back to SendGrid email (Module 7.3) and in-app WebSocket banner; the FV is dispatched to physically locate any protocol_rank 1-3 attendee whose SMS failed.
- **Caterer portal offline (cover expansion request cannot be acknowledged):** The 30-minute SLA is paused; the OL is alerted to call the caterer directly; on verbal confirmation the OL manually advances the request in the FMF UI with a note in `audit_log`.
- **Kafka broker failure (cross-region):** MirrorMaker 2 continues replicating; service milestone writes in the failed region are queued locally and replayed within 2 seconds of broker recovery; offline-first per Module 7.4 ensures FV milestones are not lost even on extended outage.
- **Dietary aggregate computation lag > 5 seconds:** The OL sees a "Dietary aggregate last refreshed N seconds ago" warning banner; new dietary updates are queued and processed on recovery; the validation against `fnb_menu.coverage_matrix` is deferred until the aggregate is current.
- **FV mobile device offline during mid-service milestone logging:** Per Module 7.4, milestones are queued locally with `recorded_at_device` preserved; on reconnect the server preserves the original device timestamp; the OL's view shows a "Pending Upload" badge on the F&B event card until reconciliation completes.

### H. Acceptance Criteria

- **Given** an `fnb_event` with `covers_confirmed = 200` and `dietary_aggregate = {omnivore: 150, vegetarian: 30, halal: 12, kosher: 4, vegan: 2, nut_allergy: 2}`, **When** the caterer uploads a `fnb_menu` whose `coverage_matrix` includes zero items tagged `kosher`, **Then** `coverage_status` transitions to `gap_flagged`, a `fnb.dietary.gap_flagged` event is published naming the missing tag ("kosher: 0 items for 4 declared kosher attendees"), and the OL and caterer primary contact receive in-app alerts within 30 seconds.
- **Given** a confirmed Ministerial Banquet at `covers_confirmed = 200` (venue capacity = 200), **When** the PO confirms an additional 5 covers for a guest Minister plus staff at T-2 hours, **Then** the engine alerts the OL with three resolution options (expand menu with surcharge requiring FAL co-approval and caterer portal acknowledgement within 30 minutes, relocate overflow to secondary room with video feed requiring PO approval of protocol implication, or decline additional covers), and on selection of option 1 the `covers_confirmed` updates to 205 and `dietary_aggregate` recomputes from the new registration list within 5 seconds.
- **Given** an FV reports an `allergen_concern` incident of severity `s2` at a VIP reception with 250 attendees present, **When** the FV submits the incident via Staff App with a photo of the suspect canape, **Then** the engine creates an `fnb_incident`, publishes `fnb.incident.quarantined`, triggers a PagerDuty s2 page within 60 seconds, sends a FoodLogiQ quarantine request for the associated ingredient lots within 60 seconds, computes `affected_registration_ids` from the NFC tap log of attendees who entered the reception area during the service window, and dispatches targeted `safety_alert` push notifications via Module 7.3 with SMS fallback via Twilio for any protocol_rank 1-3 attendees or those with `push_opt_in_state != granted`.
- **Given** an `fnb_event` with scheduled `service_start_at = 12:00`, **When** the FV logs the `service_started` milestone at 12:08 (8 minutes late), **Then** the engine publishes `fnb.service.deviation` with `deviation_type = late_delivery`, the deviation appears on the OL's War Room tile within 5 seconds, and the caterer primary contact receives a portal notification requesting explanation.
- **Given** a `fnb_event` with `linked_po_id` to a caterer supplier whose `compliance_status` regresses to `blocked` after `fnb_event.confirmed`, **When** the regression event arrives via Kafka, **Then** the F&B event is flagged with a "Caterer Non-Compliant" warning within 30 seconds, the OL is paged with the top 3 alternate compliant caterers proposed, and the OL can either initiate substitution or invoke a remediation grace period via break-glass with ED + FAL co-approval.
