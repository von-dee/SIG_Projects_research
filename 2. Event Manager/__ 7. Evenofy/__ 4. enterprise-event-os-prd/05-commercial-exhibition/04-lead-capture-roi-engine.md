> Module 5: Commercial & Exhibition Management -> 5.4 Lead Capture & ROI Engine

## Lead Capture & ROI Engine

### A. Purpose Statement

The Lead Capture & ROI Engine is the post-event value realization system for sponsors. It captures every interaction between a sponsor's booth staff and an attendee during the event, qualifies those interactions into actionable leads, routes them to the sponsor's CRM (Salesforce or HubSpot) in real time where configured, and post-event aggregates per-sponsor lead data into a cost-per-lead ROI report that the sponsor can use to justify their sponsorship renewal. At FMF scale, the System captures 60,000+ lead interactions across 80+ sponsors over 3 days, with peak capture rate of 1,200 leads/minute during the Day 1 plenary break.

The subsystem supports four capture mechanisms: (a) sponsor staff scan attendee badge with Zebra TC52 scanner running the FMF Lead Capture app; (b) attendee taps the booth's NFC tag with the FMF Mobile App, expressing interest in the sponsor; (c) attendee drops a digital business card via the Mobile App to a specific sponsor; (d) sponsor staff manually enter attendee details when the badge is unavailable (no scan). All four mechanisms produce a normalized `lead` record. The engine is distinct from generic lead capture tools (Eventbrite, Cvent) because it integrates tightly with the FMF attendee registration data (Module 6), the booth allocation (Module 5.2), and the sponsor deal (Module 5.1) so every lead is enriched with attendee context and attributed to a specific booth, sponsor, and tier.

The ROI Engine is the post-event closure of the commercial loop. Within 72 hours of event close, the System generates a per-sponsor ROI dashboard: lead count, cost-per-lead (sponsorship fee / lead count), lead quality distribution (hot/warm/cold), follow-up recommendations (route hot leads to sponsor CRM within 24 hours; warm leads within 7 days; cold leads archived). For sponsors with `post_event_report_access = true` (Platinum, Gold, Strategic Partner per Module 5.1), the report is delivered via the Exhibitor Portal (5.3). For lower tiers, an aggregate summary is provided. The System does not sync individual lead content to sponsor CRM without the sponsor's explicit opt-in (captured in `sponsor_company.lead_sync_consent = true`), per GDPR and Saudi PDPL data-sharing requirements.

### B. User Roles & Permissions

- **Event Director (ED):** Read on aggregate ROI dashboards (total leads, total cost-per-lead across all sponsors). No access to individual lead PII except via break-glass with audit log.
- **Operations Lead (OL):** Read on per-hall lead capture volume for staffing planning (e.g., if Hall A booths are capturing 3x more leads than Hall C, OL may reassign FVs to balance attendee flow).
- **Protocol Officer (PO):** No access. Lead capture data is commercial, not protocol.
- **VIP Liaison (VL):** No direct access. Receives a derived "VIP Attendee Lead Activity" report if a rank 1-2 dignitary's badge is scanned by a sponsor (the dignitary's protocol officer must be aware of which sponsors interacted with their principal).
- **Registration Manager (RM):** Read on `lead_scan.attendee_id` for badge analytics (which badges were scanned most). No access to lead notes or qualification.
- **Sponsorship Sales Lead (SSL):** Read on aggregate per-sponsor lead counts and ROI for renewal conversations. Cannot see individual lead PII except for their own managed sponsors. Sees the "Sponsor Lead Capture Health" tile in the War Room.
- **Exhibitor Portal User (EPU):** Read on their own company's leads only; write on lead qualification (hot/warm/cold rating, notes). Can export leads via CSV or via CRM sync. Cannot see other sponsors' leads.
- **Content & Stage Manager (CSM):** No access.
- **Matchmaking Concierge (MC):** No direct access. Receives a derived "High-Intent Attendees" feed (attendees who scanned 3+ sponsors in a single track) for proactive meeting suggestions.
- **Finance & Administration Lead (FAL):** Read on `cost_per_lead` per sponsor for sponsor ROI statement preparation. No access to individual lead PII.
- **Marketing & PR Lead (MPL):** Read on aggregate lead capture by industry category (e.g., "Mining sponsors captured 12,000 leads, Energy sponsors 8,000") for sector analysis.
- **ESG & Sustainability Officer (ESGO):** No direct access. Receives derived "Digital vs Paper Lead Capture" metric for the carbon report (digital business card drops = paper saved).
- **Field Volunteer (FV):** Write on `lead_scan` records when assisting sponsor staff with scanner troubleshooting. Cannot qualify leads. Cannot export.
- **Attendee (ATT):** Read on their own lead activity (which sponsors scanned them, which digital business cards they dropped). Can request lead deletion per GDPR/PDPL (right to be forgotten; Module 3.4 SLA applies).

### C. Data Model

`lead` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{salesforce_lead_id, hubspot_contact_id, scanner_device_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `sponsor_deal_id` | `uuid` | FK -> sponsor_deal.id (Module 5.1) |
| `sponsor_company_id` | `uuid` | FK -> sponsor_company.id |
| `booth_assignment_id` | `uuid` | FK -> booth_assignment.id (Module 5.2) |
| `booth_id` | `uuid` | FK -> booth.id (denormalized for analytics) |
| `attendee_id` | `uuid` | FK -> registration.attendee.id (Module 6) |
| `capture_mechanism` | `enum[badge_scan, nfc_tap, digital_card_drop, manual_entry]` | |
| `capture_device_id` | `uuid null` | FK -> scanner_device.id for badge_scan mechanism |
| `captured_at` | `timestamptz` | Local time of capture (preserved across offline sync) |
| `captured_at_event_local` | `timestamptz` | Same moment in `Asia/Riyadh` for human-readable reporting |
| `captured_by_user_id` | `uuid` | FK -> portal_user.id (the EPU staff who scanned or dropped) |
| `qualification` | `enum[hot, warm, cold, unrated]` | Set by EPU staff post-capture |
| `notes` | `text` | Free text from EPU staff |
| `synced_to_crm_at` | `timestamptz null` | When the lead was pushed to sponsor CRM |
| `synced_to_crm_status` | `enum[pending, synced, failed, not_applicable]` | |
| `is_duplicate` | `bool` | True if dedup matched an existing lead for the same attendee by same sponsor |
| `deduped_lead_id` | `uuid null` | FK -> lead.id of the canonical record (if this is a duplicate) |

`scanner_device` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{zebra_device_serial, mdm_device_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `device_serial` | `text` | Zebra TC52 hardware serial |
| `assigned_portal_account_id` | `uuid` | FK -> portal_account.id (Module 5.3) |
| `assigned_user_id` | `uuid null` | FK -> portal_user.id (which EPU staff currently has the device) |
| `status` | `enum[assigned, active, offline, returned, lost]` | |
| `battery_pct` | `int` | Last reported battery |
| `last_heartbeat_at` | `timestamptz` | Zebra Data Service heartbeat |
| `offline_queue_depth` | `int` | Number of scans queued locally on device |

`nfc_tap_log` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (system for attendee-initiated taps) |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{mobile_app_session_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `booth_id` | `uuid` | FK -> booth.id |
| `attendee_id` | `uuid` | FK -> registration.attendee.id |
| `tapped_at` | `timestamptz` | When the attendee tapped the booth NFC tag |
| `mobile_app_device_id` | `text` | Hashed device ID for fraud detection |
| `lead_id` | `uuid null` | FK -> lead.id (set if the tap produced a lead) |

`lead_qualification_log` (extends shared columns): audit trail of qualification changes.

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
| `ext_refs` | `jsonb` | e.g., `{}` |
| `audit_log` | `jsonb[]` | Append-only |
| `lead_id` | `uuid` | FK -> lead.id |
| `from_qualification` | `enum[hot, warm, cold, unrated]` | Prior state |
| `to_qualification` | `enum[hot, warm, cold, unrated]` | New state |
| `notes_added` | `text` | Notes appended |
| `changed_by_user_id` | `uuid` | FK -> portal_user.id |
| `changed_at` | `timestamptz` | When qualification changed |

`sponsor_roi_report` (extends shared columns): post-event per-sponsor ROI snapshot.

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (system) |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{tableau_dashboard_id, power_bi_workspace_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `sponsor_deal_id` | `uuid` | FK -> sponsor_deal.id |
| `sponsor_company_id` | `uuid` | FK -> sponsor_company.id |
| `total_leads` | `int` | Count of non-duplicate leads |
| `hot_leads` | `int` | |
| `warm_leads` | `int` | |
| `cold_leads` | `int` | |
| `unrated_leads` | `int` | |
| `contracted_fee` | `numeric(18,3)` | From sponsor_deal |
| `cost_per_lead` | `numeric(18,3)` | `contracted_fee / total_leads` |
| `currency_code` | `char(3)` | ISO 4217 |
| `generated_at` | `timestamptz` | When the report was generated |
| `delivered_at` | `timestamptz null` | When delivered to EPU portal |

### D. Business Logic & Edge Cases

- IF a sponsor staff scans an attendee badge (Zebra TC52 scanner reads the badge QR code containing `attendee_id`) THEN the System creates a `lead` record with `capture_mechanism = badge_scan`, `captured_at = now()`, `qualification = unrated`, `sponsor_deal_id` derived from the scanner's `assigned_portal_account_id -> sponsor_deal_id`, and `booth_id` derived from the scanner's current location (Zebra location services or the assigned booth for static-scanner scenarios). The lead is enriched with attendee data (job title, company, declared interests) pulled from Module 6 registration.
- IF an attendee taps a booth NFC tag with the Mobile App THEN the System creates an `nfc_tap_log` and a `lead` record with `capture_mechanism = nfc_tap`, `qualification = unrated`. The lead is associated with the sponsor's `portal_account` admin user by default (since the attendee initiated, no specific staff is identified).
- IF an attendee drops a digital business card via the Mobile App to a specific sponsor THEN the System creates a `lead` with `capture_mechanism = digital_card_drop`, `qualification = warm` (higher intent than nfc_tap which is `unrated`), and the attendee's contact info (name, email, phone) is shared with the sponsor only if `attendee.consent_share_contact = true` (set in Module 6 registration).
- IF a sponsor staff manually enters attendee details THEN `capture_mechanism = manual_entry`, the lead is created with the entered fields, and `captured_by_user_id` is set to the entering staff. Manual entries are subject to fraud detection (same attendee entered by multiple sponsors within 5 minutes triggers review).
- IF a `lead` is created with `attendee_id` already having a non-duplicate lead by the same `sponsor_company_id` within 5 minutes THEN the System deduplicates: the existing lead is kept as canonical, the new lead is created with `is_duplicate = true` and `deduped_lead_id = existing_lead.id`, the new lead's notes (if any) are appended to the existing lead's `notes` with a timestamp and the new staff's identity, and a `lead.deduplicated` event is published. The first scan's `captured_at` is preserved.
- IF an EPU staff rates a lead (hot/warm/cold) THEN a `lead_qualification_log` record is created with `from_qualification = current`, `to_qualification = new`, the lead's `qualification` is updated, and `lead.qualified` event is published on Kafka topic `lead.qualification`.
- IF `sponsor_company.lead_sync_consent = true` AND the sponsor has a configured CRM (Salesforce or HubSpot via Integration Hub) THEN on each lead creation or qualification change, a sync job pushes the lead to the sponsor's CRM with idempotency key `lead.id + version`. On success, `synced_to_crm_at = now()` and `synced_to_crm_status = synced`. On failure, the sync is retried 3 times then lands in the DLQ.
- IF `sponsor_company.lead_sync_consent = false` THEN the lead is stored in the System but not synced; the EPU can export via CSV from the portal (with their own consent checkbox per export).
- IF a `lead` is captured by a scanner that is offline THEN the lead is queued locally on the Zebra TC52 device (capacity 500 leads), and on reconnect the queue replays to the Mobile BFF with original `captured_at` timestamps preserved. The device's `offline_queue_depth` is updated on each heartbeat. The replay uses an idempotency key derived from `device_serial + local_sequence_number` to avoid duplicates on partial replay.
- IF post-event (event.end_date + 24 hours) THEN the daily ROI job generates a `sponsor_roi_report` for each sponsor: total_leads, hot/warm/cold counts, cost_per_lead = contracted_fee / total_leads, and publishes `lead.roi.generated` on Kafka. The report is delivered via the portal (5.3) to EPU admins and via email to the EPU admin and the SSL.

**Edge Case 1 (Non-obvious): Scanner offline for 2 hours.** Sponsor D's Zebra TC52 scanner loses WiFi connectivity at 11:30 during the Day 1 plenary break (peak lead capture). The EPU staff continues scanning badges. The scanner queues 187 leads locally with original timestamps. At 13:30, WiFi reconnects. The scanner replays the queue to the Mobile BFF: each lead is created with the original `captured_at` timestamp (e.g., 11:42:13 UTC), the `synced_to_crm_at` is set to 13:30 (when the System actually processed it). The `ext_refs.scanner_device_id` is recorded for each lead. The `scanner_device.offline_queue_depth` decrements as leads are processed; if the replay is interrupted (battery dies mid-replay), the remaining leads are preserved locally and replayed on next reconnect. The 187 leads appear in the EPU portal with the correct capture timestamps. For sponsors with CRM sync enabled, the leads are pushed to their CRM in original-timestamp order (the Integration Hub preserves the `captured_at` ordering on sync). Twilio SMS notifies the EPU admin on successful replay: "187 queued leads synced from offline scanner #ABC123."

**Edge Case 2 (Non-obvious): Attendee scanned by same sponsor twice within 5 minutes.** Sponsor E has two booth staff (EPU-1 and EPU-2) working the booth during a peak traffic moment. An attendee approaches the booth and is scanned by EPU-1 at 14:23:11. The attendee then walks 3 meters within the same booth and is scanned by EPU-2 at 14:26:42 (3 minutes 31 seconds later). EPU-2 did not realize the attendee was already scanned. The System's deduplication logic detects that `attendee_id` has an existing lead by the same `sponsor_company_id` within the 5-minute window: the second lead is created with `is_duplicate = true` and `deduped_lead_id = first_lead.id`. The first lead's `notes` field is appended with: "[14:26:42 UTC] Additional scan by EPU-2: {notes if any}". The first lead's `captured_at` remains 14:23:11. A `lead.deduplicated` event is published. The EPU portal shows the lead once in the lead list with an "Additional scan by EPU-2" badge. EPU-2 receives a discreet toast: "Attendee already scanned by EPU-2 at 14:23:11; notes merged." This avoids the awkward experience of the attendee being told they were "already scanned" while preserving the data quality.

### E. Third-Party Integrations

- **Zebra Data Service (ZDS):** Outbound: device management (assignment, MDM profile push via SOTI MobiControl or Microsoft Intune). Inbound: device heartbeat every 60 seconds reports `battery_pct`, `status`, `offline_queue_depth`. On `status = offline` for > 5 minutes, OL is alerted.
- **Zebra TC52 scanner (via lead capture app):** The scanner runs a React Native lead capture app (built on Zebra DataWedge for barcode scanning). On scan, the app posts to the Mobile BFF; on offline, queues locally in SQLite. App uses Zebra Print API for receipt printing (optional, configurable per sponsor).
- **NFC tags (NTAG215):** Each booth has an NTAG215 NFC tag encoded with `booth_id` (UUID) at install time by FV using a Zebra TC5x NFC writer. Attendee taps with Mobile App -> app reads NFC -> posts to Mobile BFF.
- **Salesforce CRM (via Integration Hub):** Outbound: lead creation in Salesforce as a Lead or Contact (configurable per sponsor; default Lead). Field mapping: `lead.attendee_id` -> `Lead.FMF_Attendee_ID__c`, `lead.qualification` -> `Lead.Rating` (hot = Hot, warm = Warm, cold = Cold), `lead.notes` -> `Lead.Description`. Idempotency key: `lead.id + version`. Inbound: Salesforce workflow can update `Lead.Status` which syncs back to `lead.qualification` (bidirectional, with conflict resolution: most recent wins, with audit log).
- **HubSpot CRM (via Integration Hub):** Same pattern as Salesforce; creates HubSpot Contact in sponsor's portal. Field mapping per Integration Hub recipe.
- **Twilio (Programmable SMS):** Outbound: SMS to EPU admin on offline scanner replay completion, on lead sync failure (DLQ alert), and on ROI report delivery. SMS to ATT on their lead activity if `attendee.consent_lead_notifications = true`.
- **Tableau or Power BI:** Outbound: `sponsor_roi_report` data is pushed to Tableau Cloud or Power BI workspace (per-tenant choice). Sponsors with `post_event_report_access = true` receive a Tableau/Power BI dashboard link in the portal. The dashboard shows lead count over time, quality distribution, cost-per-lead, and follow-up recommendations.
- **AWS KMS:** Envelope encryption for `lead.notes` (free text may contain PII from sponsor-attendee conversations) and for `attendee_contact_info` shared via digital_card_drop.
- **AWS S3:** Stores CSV lead exports (with sponsor-specific retention policy; default 90 days post-event then auto-purge unless extended).
- **Kafka:** Publishes `lead.captured`, `lead.qualified`, `lead.deduplicated`, `lead.synced_to_crm`, `lead.roi.generated` on topic prefix `lead.*` per Module 0.1 bounded context table.

### F. UI/UX Notes

- **EPU Lead Capture App (Zebra TC52):** Minimal UI. On launch: shows assigned sponsor + booth + battery. On scan: full-screen green checkmark + haptic feedback + lead count for the day. On qualification: 3-button bottom sheet (Hot = red, Warm = amber, Cold = blue) + notes text field. Works fully offline (SQLite cache); shows "Offline mode - X leads queued" banner when network is down.
- **EPU Portal Lead List:** Sortable/filterable table of leads: attendee name, company, job title, capture mechanism, captured_at, qualification, notes, synced_to_crm status. Bulk actions: export CSV, mark multiple as "follow-up sent." Filter by date, qualification, capture mechanism.
- **EPU Portal ROI Dashboard (post-event):** Card layout. Top: total_leads + cost_per_lead hero metric. Middle: qualification donut chart (hot/warm/cold/unrated). Bottom: follow-up recommendations list (e.g., "23 hot leads not yet synced to Salesforce - sync now?"). Tableau/Power BI deep link for advanced analytics.
- **SSL Pipeline View (with lead capture health):** Per-sponsor row showing lead count today, cumulative, cost-per-lead trend. Highlights sponsors below 50% of peer-tier average for SSL follow-up.
- **ED War Room Tile:** "Lead Capture Volume" tile showing real-time leads/minute, peak, and total-to-date. Color-coded by hall.
- **Mobile App (ATT-facing):** Attendee taps booth NFC tag -> app shows "Interest expressed to {Sponsor Name}. They may contact you. Manage your consent." Deep link to privacy settings where ATT can withdraw `consent_share_contact` or `consent_lead_notifications` at any time.
- **VL Report (PO-derived):** "VIP Attendee Lead Activity" PDF delivered to VLs after event showing which sponsors scanned their dignitary (diplomatic context).

### G. Failure Modes & Offline Behavior

- IF Zebra Data Service heartbeat fails for a scanner > 5 minutes THEN `scanner_device.status` transitions to `offline`, OL is alerted via PagerDuty, and the EPU admin receives a Twilio SMS: "Scanner #ABC123 assigned to your sponsor has been offline for 5 minutes. Please verify device or contact FV."
- IF a scanner battery dies mid-capture THEN queued leads are preserved in SQLite on-device; on recharge and reconnect, leads replay. If the device is lost (status = lost for > 24 hours), SSL initiates a device wipe via MDM (SOTI or Intune) and assigns a backup scanner (the System maintains a 10% scanner reserve at the registration desk).
- IF the Mobile BFF is unreachable (regional outage) THEN scanners queue locally (500-lead capacity); Mobile App NFC taps also queue locally on the attendee's phone; on BFF recovery, both replay. The lead capture service has a 99.95% SLA; on rare outage, the impact is delayed sync, not lost data.
- IF Salesforce or HubSpot is unreachable (CRM outage) THEN the Integration Hub retries 3 times then queues in the DLQ; leads remain in the System with `synced_to_crm_status = pending`. On CRM recovery, the Integration Hub replays from the DLQ with original timestamps. Sponsors without CRM sync (lead_sync_consent = false) are unaffected.
- IF an attendee withdraws consent (`consent_share_contact = false`) post-event THEN the System marks all of that attendee's leads as `notes_redacted = true` (notes content is purged), the `attendee_contact_info` field is purged, and any leads already synced to sponsor CRM are flagged for deletion request to the sponsor (the System sends a deletion request to the sponsor's CRM via Integration Hub; deletion is the sponsor's responsibility, but the System logs the request for audit per GDPR/PDPL).
- IF an attendee requests right to be forgotten (GDPR Article 17 / PDPL) THEN the lead records are soft-deleted (`deleted_at = now()`), the `lead_qualification_log` records are soft-deleted, and a `lead.forgotten` event is published. Aggregate anonymized stats in the `sponsor_roi_report` are NOT modified (the lead count remains in the report for sponsor ROI accuracy, but the PII is purged). SLA is 30 days per Module 3.4 (GDPR purge pattern reused here).
- IF duplicate lead detection fails (e.g., attendee_id is null due to manual entry with typo) THEN the dedup check is skipped and a `lead.dedup_skipped` event is logged for analytics; the EPU can manually merge duplicates post-event via the portal.

### H. Acceptance Criteria

- **Given** a Zebra TC52 scanner with WiFi connectivity scanning an attendee badge at 14:23:11 UTC, **When** the scanner posts to the Mobile BFF, **Then** a `lead` record is created with `capture_mechanism = badge_scan`, `captured_at = 2026-01-13T14:23:11Z`, `qualification = unrated`, enriched with attendee data from Module 6 (job title, company, declared interests), `sponsor_deal_id` derived from the scanner's assignment, and a `lead.captured` event is published on Kafka topic `lead.capture` within 2 seconds.
- **Given** a scanner offline from 11:30 to 13:30 with 187 leads queued locally on device, **When** WiFi reconnects and the scanner replays the queue, **Then** each lead is created in the System with its original `captured_at` timestamp preserved (not the replay time), `synced_to_crm_at` is set to the actual sync time (post-replay), and the EPU admin receives a Twilio SMS "187 queued leads synced from offline scanner #ABC123" within 60 seconds of replay completion.
- **Given** an attendee scanned by EPU-1 at 14:23:11 and again by EPU-2 at 14:26:42 (same sponsor, 3 minutes 31 seconds later), **When** the second scan is processed, **Then** the System creates a duplicate lead record with `is_duplicate = true` and `deduped_lead_id = first_lead.id`, appends EPU-2's notes (if any) to the first lead's `notes` field with a timestamped annotation, preserves the first lead's `captured_at = 14:23:11`, and publishes `lead.deduplicated` on Kafka.
- **Given** a Platinum sponsor with `lead_sync_consent = true`, `contracted_fee = US$ 2,500,000`, and 312 non-duplicate leads captured during the event, **When** the post-event ROI job runs at event.end_date + 24 hours, **Then** a `sponsor_roi_report` is generated with `total_leads = 312`, `cost_per_lead = US$ 8,012.82`, `hot_leads`/`warm_leads`/`cold_leads`/`unrated_leads` counts summing to 312, the report is delivered via the EPU portal and email within 72 hours of event close, and a `lead.roi.generated` event is published.
- **Given** an attendee who has been scanned by 3 sponsors and exercises their GDPR right to be forgotten on day 5 post-event, **When** the DPO approves the purge request, **Then** the System soft-deletes all `lead` records with that `attendee_id`, soft-deletes the `lead_qualification_log` records, sends a deletion request to each sponsor's CRM (Salesforce or HubSpot) via the Integration Hub, logs the request in `audit_log` for audit trail, and completes the purge within 30 days per GDPR Article 17 SLA (with day-25 watchdog alert to the DPO if not yet complete).
