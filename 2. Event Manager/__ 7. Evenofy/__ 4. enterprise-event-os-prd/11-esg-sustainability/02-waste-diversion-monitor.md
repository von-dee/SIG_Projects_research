> Module 11: ESG & Sustainability Tracker -> 11.2 Waste Diversion Monitor

## Waste Diversion Monitor

### A. Purpose Statement

The Waste Diversion Monitor is the authoritative measurement, classification, and reconciliation engine for every kilogram of solid and liquid waste generated across the Future Minerals Forum footprint, from the four host hotels to the three plenary venues to the temporary exhibition halls and the curb-line catering tents. At FMF scale, the event generates approximately 38 tonnes of waste across the three-day window: 14 tonnes of general waste destined for landfill, 11 tonnes of recycling (paper, plastic, glass, metal), 8 tonnes of compostable food waste, 1.2 tonnes of hazardous waste (AV lithium batteries, paint, cleaning chemicals), and 0.4 tonnes of e-waste (lanyard RFID chips, broken headsets, spent signage electronics). The headline metric is the diversion rate, defined as (recycling + compost) / total waste, with FMF's published target of 75% diversion by 2026 against a 2024 baseline of 51%.

This subsystem exists because the host-city municipality (Riyadh Municipality's Waste Management Center) levies a per-tonne landfill surcharge that scales non-linearly above a contracted cap, because two Strategic Partner sponsors include diversion-rate milestones as a sponsorship-renewal clause, and because the post-event ESG impact report (Module 11.4) requires ISO 20121 alignment with a verifiable waste audit trail. A single mis-classified haul (e.g., a 2-tonne load of contaminated "recycling" being rejected at the materials recovery facility and re-routed to landfill) can drop the headline diversion rate by 5 percentage points. This subsystem codifies the classification taxonomy, captures hauler weight tickets as primary source artifacts, and cross-checks every load via independent audit sampling.

The subsystem owns the `esg.waste.*` Kafka topic prefix within the broader `esg.*` bounded context established in Module 0.1. It publishes `esg.waste.stream.logged`, `esg.waste.pickup.scheduled`, `esg.waste.pickup.completed`, `esg.waste.load.contaminated`, `esg.waste.load.audited`, `esg.waste.diversion_rate.snapshot_published`, `esg.waste.surplus_food.donated`, and `esg.waste.material.flagged`. It subscribes to `fnb.menu.published` (Module 8.3) to forecast expected food waste per menu, to `sponsor.deal.signed` (Module 5.1) to flag sponsor-supplied materials at onboarding, to `supplier.delivery.confirmed` (Module 8.2) for packaging-intensity metadata, and to `po.payment_released` (Module 9.3) for sourcing-level material classification. Its non-negotiable contract is that every reported kilogram of waste is traceable to a hauler weight ticket and that every load classified as "recycling" or "compost" has either a clean audit sample or a documented contamination adjustment.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all waste data, diversion snapshots, and audit records. Write only via break-glass on diversion-rate target revisions (with ESGO co-approval) and on emergency hazardous-waste disposal overrides. Sees the live diversion rate gauge in the War Room.
- **Operations Lead (OL):** Read on all waste streams by venue and day. Write on hauler scheduling adjustments and Field Volunteer waste-audit task assignment. Cannot modify the classification taxonomy or the diversion target.
- **Protocol Officer (PO):** No direct access. Receives a one-line diversion-rate summary for ministerial briefing packs only after ESGO sign-off.
- **VIP Liaison (VL):** No access.
- **Registration Manager (RM):** No direct access. Sees only the "digital vs printed collateral" diversion contribution per registration cohort.
- **Sponsorship Sales Lead (SSL):** Read-only on the per-sponsor material footprint (booth construction waste, branded giveaways, packaging) surfaced in the sponsor ESG dashboard. Write only on flagging a sponsor-supplied material for ESGO review at sponsor onboarding.
- **Exhibitor Portal User (EPU):** Read on their own booth's waste generation (haul-out weight, diversion contribution). Can submit hauler weight tickets via a structured form for booth tear-down waste.
- **Content & Stage Manager (CSM):** Read-only on stage and AV waste per stage. Write only on AV equipment disposition (return to supplier, donate, recycle, e-waste).
- **Matchmaking Concierge (MC):** No access.
- **Finance & Administration Lead (FAL):** Read on hauler invoices and disposal fees. Write only on invoice approval via the standard three-way match (Module 9.3). Cannot modify waste classification.
- **Marketing & PR Lead (MPL):** Read-only on the externally shareable diversion snapshot. Cannot see contamination audit details.
- **ESG & Sustainability Officer (ESGO):** Primary user. Read/write on the waste classification taxonomy, hauler registry, audit sampling plan, diversion targets, source-reduction rules, and snapshot publication. Owns the contamination adjudication queue and the surplus-food donation workflow.
- **Field Volunteer (FV):** Read on assigned waste-audit sampling tasks. Write via the Staff App to log audit sample weight, contamination percentage, and photo evidence per audit.
- **Attendee (ATT):** No direct access to the subsystem. The Mobile App surfaces only the aggregate "Today's diversion rate" tile on the home screen as a public-awareness feature.

### C. Data Model

`waste_stream_log` (the atomic unit per pickup load):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (OL, ESGO, or service account) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{hauler_id, hauler_ticket_no, mrf_id, scale_ticket_photo}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `stream_type` | `enum[general, recycling_paper, recycling_plastic, recycling_glass, recycling_metal, compost_food, compost_organic, hazardous, e_waste, construction]` | |
| `venue_id` | `uuid` | FK -> venue.id (Module 8.1) |
| `pickup_zone` | `text` | e.g., "Plenary Hall A - back of house", "Exhibition Hall 2 - north loading dock" |
| `hauler_id` | `uuid` | FK -> waste_hauler.id |
| `scheduled_pickup_at` | `timestamptz` | |
| `actual_pickup_at` | `timestamptz null` | null = not yet picked up |
| `weight_kg_measured` | `numeric(10,2)` | Weight per hauler scale ticket |
| `weight_kg_audit_adjusted` | `numeric(10,2) null` | Audit-adjusted weight when contamination is found |
| `contamination_pct` | `numeric(5,2) null` | 0-100, percentage of load that is non-conforming (e.g., general waste in a recycling load) |
| `audit_status` | `enum[not_audited, sampled, full_audit, audit_pending, audit_failed]` | |
| `disposition` | `enum[landfill, mrf_recycling, compost_facility, anaerobic_digestion, hazardous_incineration, e_waste_recycler, donation, reuse, return_to_supplier]` | Final destination |
| `weight_ticket_artifact_uri` | `text` | S3 object key for the hauler's weight ticket photo or PDF |
| `contamination_photo_uris` | `text[]` | Photos from FV audit sampling |
| `data_quality` | `enum[measured, audit_adjusted, estimated]` | Estimated is used only when hauler scale is offline |
| `notes` | `text null` | ESGO or OL notes |

`waste_hauler` (registered hauler registry):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | FAL or OL |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{rubicon_account_id, wm_account_id, mrf_facility_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `hauler_name` | `text` | e.g., "Riyadh Waste Management Co." |
| `hauler_type` | `enum[general, recycling, compost, hazardous, e_waste, multi_stream]` | |
| `license_number` | `text` | Host-country waste hauler licence |
| `license_expiry` | `date` | Compliance check at PO issuance |
| `api_integration` | `enum[rubicon, waste_management, recycle_tracker, twilio_sms, manual]` | How the hauler reports pickups |
| `mrf_destination_id` | `uuid null` | FK -> waste_facility.id, the materials recovery facility where recycling loads are processed |
| `contact_phone` | `text` | E.164 format |
| `service_window` | `text` | e.g., "06:00-10:00, 22:00-02:00" |

`waste_facility` (MRF, compost facility, hazardous incinerator, e-waste recycler):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ESGO |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{facility_permit_id, recycle_tracker_facility_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `facility_name` | `text` | e.g., "Riyadh MRF - North" |
| `facility_type` | `enum[mrf, compost, anaerobic_digestion, hazardous_incineration, e_waste_recycler, landfill]` | |
| `permit_number` | `text` | Government permit reference |
| `permit_expiry` | `date` | |
| `accepted_streams` | `text[]` | Array of `stream_type` the facility accepts |
| `geography` | `text` | e.g., "RUH-N", "RUH-S" |

`source_reduction_initiative` (the proactive reduction ledger):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ESGO or OL |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{po_id, sponsor_id, supplier_id, fnb_menu_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `initiative_type` | `enum[fb_surplus_donation, reusable_vs_single_use, digital_vs_printed_collateral, packaging_reduction, bulk_dispenser, sponsor_swag_alternative]` | |
| `description` | `text` | e.g., "Surplus Day-2 catering donated to Iradah charity kitchen" |
| `baseline_kg` | `numeric(10,2)` | What would have been generated absent the initiative |
| `actual_kg` | `numeric(10,2)` | What was actually generated |
| `reduction_kg` | `numeric(10,2)` | baseline_kg - actual_kg |
| `monetary_cost_usd` | `numeric(18,3)` | Cost of implementing the initiative |
| `monetary_savings_usd` | `numeric(18,3)` | Avoided disposal fees + avoided procurement |
| `partner_ref` | `text null` | e.g., Food Rescue US donation receipt number |

`diversion_rate_snapshot` (point-in-time published rate):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ESGO |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{workiva_document_id, iso_20121_audit_ref}` |
| `audit_log` | `jsonb[]` | Append-only |
| `period_start` | `timestamptz` | |
| `period_end` | `timestamptz` | |
| `total_waste_kg` | `numeric(10,2)` | |
| `recycling_kg` | `numeric(10,2)` | Sum of recycling_* stream types |
| `compost_kg` | `numeric(10,2)` | Sum of compost_* stream types |
| `hazardous_kg` | `numeric(10,2)` | |
| `e_waste_kg` | `numeric(10,2)` | |
| `general_kg` | `numeric(10,2)` | Landfill-bound |
| `diversion_rate_pct` | `numeric(5,2)` | (recycling_kg + compost_kg) / total_waste_kg * 100 |
| `target_rate_pct` | `numeric(5,2)` | From event config |
| `gap_pct` | `numeric(5,2)` | diversion_rate_pct - target_rate_pct |
| `publication_status` | `enum[draft, internal_review, approved, published, superseded]` | Workflow |

### D. Business Logic & Edge Cases

- **IF** a hauler reports a load as `stream_type = recycling_plastic` but a Field Volunteer audit sample finds `contamination_pct >= 25`, **THEN** the system reclassifies the load's `weight_kg_audit_adjusted` by moving the contaminated portion to `general` stream, recomputes the diversion rate for the affected day and venue, and surfaces a "data quality" flag in the ESGO dashboard with a link to the audit photo evidence.
- **IF** the total contamination-adjusted weight of a load exceeds the originally reported `weight_kg_measured` by more than 5%, **THEN** the system flags the hauler record, triggers a Twilio SMS to the hauler's `contact_phone` requesting clarification, and holds the hauler's next scheduled pickup pending ESGO review.
- **IF** a sponsor at onboarding (Module 5.3) declares branded giveaways that the `material_flag` classifier marks as non-recyclable (e.g., plastic swag without resin identification code), **THEN** the system surfaces an "ESG non-compliance" warning in the sponsor's onboarding flow, blocks the sponsor record from advancing to `onboarded_complete` until the sponsor either swaps the material or accepts the warning with a documented justification, and offers three pre-vetted alternative products from the supplier registry (e.g., bamboo lanyards, recycled-cotton tote bags, plantable seed-paper notebooks).
- **IF** a hauler's `license_expiry` falls within 30 days of the event start, **THEN** the system blocks new pickup scheduling against that hauler, surfaces a "license renewal required" task to OL and FAL, and re-routes pending pickups to alternative haulers from the same `hauler_type` if available.
- **IF** an F&B menu (Module 8.3) is published with a forecasted surplus greater than 15% of expected consumption, **THEN** the system pre-schedules a `source_reduction_initiative` of type `fb_surplus_donation` and notifies the registered food-rescue partner (Food Rescue US or the host-city food bank partner) of an expected surplus window 24 hours before service.
- **IF** a hazardous-waste pickup is logged (e.g., AV lithium battery pack failure), **THEN** the system requires ESGO sign-off on the disposition (cannot default to `landfill`), routes the load to the contracted `hazardous_incineration` facility, and generates a hazardous-waste manifest document for the regulatory filing (host-country Environmental Ministry requirement).
- **IF** the diversion rate for a single day drops below 60% (10 points below target), **THEN** the system publishes `esg.waste.diversion_rate.degraded` event, surfaces a "Daily Diversion Alert" tile in the War Room, and auto-creates a Field Volunteer waste-sorting refresh task for the affected pickup zones.
- **IF** a hauler fails to log a scheduled pickup within a 2-hour window of `scheduled_pickup_at`, **THEN** the system escalates to OL via the Staff App, triggers a Twilio SMS reminder to the hauler's contact phone, and if no response within 30 minutes, suggests a backup hauler from the registry.
- **IF** an audit sample finds a stream mismatch where a load tagged `recycling_paper` is actually `general` waste (e.g., contaminated with food), **THEN** the entire load's `weight_kg_audit_adjusted` is moved to the `general` stream with `data_quality = audit_adjusted`, the hauler record accrues a `mis_classification_count`, and after three mis-classifications the hauler is auto-flagged for deactivation pending ESGO review.

**Edge case (non-obvious): waste hauler mis-reports contamination as zero to inflate the diversion rate.** A hauler, incentivized by a per-tonne recycling-disposal rebate, reports every load as `contamination_pct = 0` for three consecutive days. The system's randomized audit sampling plan (configured at event setup with a default 10% sample rate, settable up to 50% for high-risk haulers) catches this: a Field Volunteer audit finds 38% contamination in a load the hauler reported as clean. The system (a) marks the audited load `audit_status = audit_failed`, (b) recomputes the prior two days of loads from that hauler using the audit-derived contamination rate as a proxy (`estimation_method = "audit_derived_proxy"`), (c) publishes `esg.waste.load.contaminated`, (d) reduces the hauler's `trust_score` and increases their audit sample rate to 50% for the remainder of the event, and (e) surfaces the hauler to ESGO for potential deactivation. This pattern, applied at FMF 2024, found a single hauler inflating diversion by 2.1 tonnes across three days; the post-event diversion rate was revised from a reported 64% to an audited 58%.

**Edge case (non-obvious): a sponsor brings branded giveaways that are non-recyclable and the sponsor onboarding has already completed.** A Platinum sponsor ships 8,000 branded plastic water bottles (single-use PET without a recycling resin code) to the venue two days before the event, after sponsor onboarding has closed. The system (a) receives the inbound shipment notification from Module 8.2 (`supplier.delivery.confirmed`), (b) the `material_flag` classifier inspects the supplier-provided material spec, (c) the system surfaces an "ESG non-compliance - urgent" alert to ESGO and SSL with the sponsor's contract terms attached, (d) the system suggests three pre-vetted alternatives from the supplier registry and estimates the disposal-cost impact of accepting the non-recyclable batch (e.g., 800 kg of plastic to landfill at the contracted tipping fee), (e) the SSL can negotiate a material swap with the sponsor up to T-12 hours, after which the system either accepts the batch with a documented waiver (captured in `audit_log` and surfaced in the post-event ESG report as a "deviation") or refuses delivery at the loading dock and triggers a return-to-supplier disposition. The waiver path automatically deducts the equivalent tonnes from the diversion rate target in the post-event report and discloses the deviation in the published snapshot.

### E. Third-Party Integrations

- **Rubicon:** Hauler-side API for waste haulers on the Rubicon platform. Data flow: hauler vehicle completes pickup -> Rubicon API publishes weight ticket and load metadata -> Integration Hub (Workato) -> `waste_stream_log` record with `api_integration = rubicon`. Pulls scale ticket photos as S3 artifacts.
- **Waste Management (WM):** Equivalent hauler-side API for haulers on the WM platform. Same integration pattern as Rubicon. Both can coexist within a single event depending on hauler registry composition.
- **RecycleTracker:** Third-party waste analytics aggregator that pulls from multiple haulers and provides standardized diversion reporting. Used as an independent verification source; the system pulls a nightly RecycleTracker report and reconciles against internal `waste_stream_log` totals, surfacing any discrepancy > 3% to ESGO.
- **Food Rescue US:** Surplus food donation matching platform. Data flow: system predicts surplus 24 hours before service -> Food Rescue US API matches to a partner charity kitchen -> donation pickup scheduled -> donation receipt number returned -> `source_reduction_initiative` record with `initiative_type = fb_surplus_donation` and `partner_ref` populated. For host-country events where Food Rescue US does not operate (e.g., FMF in Riyadh), the equivalent local partner (e.g., Saudi Food Bank, Iradah Association) is configured via a generic webhook.
- **Twilio:** SMS reminders to haulers for missed or imminent pickups, and to Field Volunteers for waste-audit sampling assignments. Data flow: scheduled task or threshold breach -> Twilio SMS API -> hauler or FV phone -> response (yes/no/ETA) parsed back into the task record.
- **Salesforce Net Zero Cloud:** Push of the daily `diversion_rate_snapshot` into the Forum's year-round corporate ESG ledger, parallel to the carbon sync in Module 11.1.
- **AWS S3 (KMS-CMK):** Storage for weight ticket photos, contamination audit photos, and hazardous-waste manifests. Bucket policy requires server-side encryption with the ESG service KMS key.
- **OpenCV + AWS Rekognition:** Optional computer-vision contamination classifier that pre-screens audit photos before FV review, tagging photos with suspected contamination percentage and material categories. Used to prioritize FV audit queue, not to replace human judgement.
- **Kafka topics:** Publishes the events enumerated in Section A. Subscribes to `fnb.menu.published` (Module 8.3) to forecast food waste, `sponsor.deal.signed` and `sponsor.onboarding.completed` (Modules 5.1, 5.3) to flag sponsor-supplied materials, `supplier.delivery.confirmed` (Module 8.2) to inspect inbound material specs, `po.payment_released` (Module 9.3) to track sourcing-level material classification, and `registration.confirmed` (Module 6.1) to forecast collateral waste per attendee cohort (digital vs printed badge, printed agenda vs app).

### F. UI/UX Notes

The ESGO's primary screen is a four-quadrant dashboard. Top-left: the live diversion rate gauge with target line, broken down by venue as stacked bars (recycling, compost, hazardous, e-waste, general). Top-right: the "Today's Pickup Schedule" with hauler, time, zone, and pickup status (scheduled, in transit, completed, missed). Bottom-left: the "Audit Queue" listing every load flagged for audit, sorted by contamination suspicion score, with a one-click "Open audit form" that opens the FV-submitted photo and the contamination estimate. Bottom-right: the "Source Reduction Initiatives" ledger showing reduction_kg and monetary savings per initiative, with a sortable view by initiative_type.

The OL's surface shows a per-venue waste heat map for the current day, with pickup zones colored green (on schedule), amber (delayed), red (missed). The FV's Staff App surface shows the assigned audit sampling tasks with photo capture, weight input, and contamination-percentage slider.

The SSL's sponsor ESG dashboard shows the sponsor's waste generation (booth construction, branded giveaways, packaging) and diversion contribution, with the "ESG non-compliance" warning banner if applicable and three alternative-product suggestions inline.

The ATT Mobile App surface shows the public "Today's diversion rate" tile on the home screen with a daily tip (e.g., "Refill at a hydration station, not a single-use bottle"). The tile updates once per day at 06:00 local time with the prior day's audited number.

### G. Failure Modes & Offline Behavior

- **Rubicon and WM APIs both unavailable:** The system falls back to manual hauler reporting via a structured form in the OL console, with `data_quality = estimated` and `api_integration = manual`. Weight tickets are uploaded as photos and stored in S3; the Integration Hub queues the API calls for backfill when connectivity returns, with the original `scheduled_pickup_at` preserved.
- **Hauler scale malfunction (weight recorded as zero or implausibly low):** The system rejects the weight_kg_measured value, flags the record `audit_status = audit_pending`, dispatches a Field Volunteer to perform a manual weight estimate using volumetric conversion (bin volume x stream density), and marks the resulting record `data_quality = estimated` with `estimation_method = "volumetric_proxy"`.
- **Twilio SMS delivery failure:** Reminder falls back to email (via SendGrid) to the hauler's registered address, and to an in-app push notification if the hauler has the Staff App. If all channels fail, the OL is paged for manual phone outreach.
- **Food Rescue US partner unable to accept a predicted surplus:** The system attempts the secondary partner (configured per event as a fallback). If no partner accepts within 4 hours of surplus prediction, the surplus is logged as `actual_kg = baseline_kg` (no reduction achieved), the initiative is marked "failed" in the ledger, and the ESGO is notified for post-event narrative.
- **Audit sampling plan not executable (insufficient FV availability):** The system reduces the sample rate (defaulting to 5%) and prioritizes haulers with the lowest `trust_score`, with a documented sampling plan deviation in the post-event snapshot's `methodology_notes`. ESGO can override to a stratified sampling approach based on stream type rather than random selection.
- **Hazardous-waste facility permit expired mid-event:** The system blocks all hazardous-waste pickups destined for that facility, surfaces an urgent alert to ESGO and OL, and routes to the alternate `hazardous_incineration` facility if available. If no alternate is registered, the hazardous waste is held at the venue in compliant storage (sealed drums, ventilated, fire-suppression-rated) until a facility is added, with a maximum storage duration per host-country regulation.
- **Contamination-photo Rekognition API unavailable:** The system skips the AI pre-screen and routes all audit photos directly to the FV manual review queue, increasing FV workload. A banner in the ESGO dashboard reads "AI pre-screen offline; manual audit throughput reduced."

### H. Acceptance Criteria

- **Given** a hauler reports a 1.2-tonne load as `stream_type = recycling_plastic` with `contamination_pct = 0`, **When** a Field Volunteer audit sample finds 32% contamination, **Then** the system marks the load `audit_status = audit_failed`, recomputes `weight_kg_audit_adjusted` to move 384 kg from `recycling_plastic` to `general`, decreases the day's diversion rate by the corresponding amount, increases the hauler's `audit_sample_rate` to 50%, and surfaces a "data quality" flag with the audit photos in the ESGO dashboard.
- **Given** a Platinum sponsor ships 8,000 non-recyclable branded plastic water bottles to the venue two days before the event, **When** the `material_flag` classifier inspects the supplier-provided material spec at `supplier.delivery.confirmed`, **Then** the system surfaces an "ESG non-compliance - urgent" alert to ESGO and SSL with the sponsor's contract terms, suggests three pre-vetted alternatives from the supplier registry, and either swaps the material before T-12 hours or accepts the batch with a documented waiver that auto-deducts the equivalent tonnes from the diversion rate target in the post-event report.
- **Given** an F&B menu is published with a forecasted surplus of 18% of expected consumption, **When** the surplus threshold (15%) is breached, **Then** the system pre-schedules a `source_reduction_initiative` of type `fb_surplus_donation`, notifies the registered food-rescue partner 24 hours before service, and on successful donation captures the donation receipt number in the initiative record with `reduction_kg` computed as `baseline_kg - actual_kg`.
- **Given** a hazardous-waste pickup is logged for a failed AV lithium battery pack, **When** the OL creates the `waste_stream_log` record with `stream_type = hazardous`, **Then** the system requires ESGO sign-off on `disposition` (rejecting any default to landfill), routes the load to the contracted `hazardous_incineration` facility, generates a hazardous-waste manifest document for the regulatory filing, and retains the manifest artifact URI in `weight_ticket_artifact_uri`.
- **Given** the diversion rate for a single day drops to 58% against a 75% target, **When** the gap exceeds 10 percentage points, **Then** the system publishes `esg.waste.diversion_rate.degraded`, surfaces a "Daily Diversion Alert" tile in the War Room, and auto-creates a Field Volunteer waste-sorting refresh task for the affected pickup zones within 15 minutes.
