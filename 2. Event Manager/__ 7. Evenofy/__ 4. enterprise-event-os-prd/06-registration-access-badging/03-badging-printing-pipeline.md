> Module 6: Registration, Access Control & Badging -> 6.3 Badging & Printing Pipeline

## Badging & Printing Pipeline

### A. Purpose Statement

The Badging & Printing Pipeline transforms a confirmed `registration` (Module 6.1) and its active `credential` set (Module 6.2) into a physical artifact the attendee wears around their neck: the badge. At FMF scale, the pipeline produces 12,000+ badges across a 4-week pre-event window and a 36-hour onsite window, with peak onsite throughput of 23 badges per minute per kiosk across a 12-kiosk fleet during the 08:00-09:00 check-in surge. The badge is the trust anchor for every physical scan in the venue; a misprinted badge (wrong name, expired QR, wrong color band) cascades into access denials, queue build-up, and attendee frustration. The pipeline publishes `badge.*` topics; Module 6.4 (Onsite Check-In Kiosk) consumes `badge.queued` to drive the kiosk flow; Module 6.2 (Access Control) consumes `badge.voided` to invalidate the old QR; Module 8 (Ops) consumes `badge.print_failed` to dispatch an FV to the failed printer.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all badge production stats; write via break-glass on VIP badge reprints with rotating-QR mode change.
- **Operations Lead (OL):** Read on print queue depth, printer health, ribbon/substrate stock. Write on backup-printer failover activation. Cannot modify individual badge artwork or content.
- **Protocol Officer (PO):** Read/write on `badge_template` for `registration_type = dignitary`; can override the photo capture requirement for protocol-class dignitaries (photo-redaction mode).
- **VIP Liaison (VL):** Read-only on the assigned dignitary's badge status (printed / shipped / ready-for-collection).
- **Registration Manager (RM):** Primary owner. Read/write on all badge templates, reprint approvals up to 3 per registration, batch reprint jobs. Approves lost-badge reprints after ID verification. Cannot modify rotating-QR crypto material.
- **Sponsorship Sales Lead (SSL):** Read-only on badge counts by sponsor (used to verify staff_quota consumption).
- **Exhibitor Portal User (EPU):** Read-only on badge status for their own staff (printed, shipped, or ready-for-collection).
- **Content & Stage Manager (CSM):** Read-only on speaker badge status; used to confirm speaker photo upload during onboarding.
- **Matchmaking Concierge (MC):** No direct access. MC sees only the badge QR (via scan) at the meeting table.
- **Finance & Administration Lead (FAL):** Read-only on reprint count per attendee (used to bill sponsors for excess reprints) and on shipping costs from DHL/FedEx.
- **Marketing & PR Lead (MPL):** Read-only on badge template design versions (for brand consistency checks). No write.
- **ESG & Sustainability Officer (ESGO):** Read-only on substrate material, ribbon waste, and printer energy consumption for ESG reporting.
- **Field Volunteer (FV):** Read on the print queue at their assigned printer; write on "badge retrieved from printer" confirmation and "badge handed to attendee" confirmation. Cannot approve reprints.
- **Attendee (ATT):** Read-only on their own badge status and reprint history via the Mobile App.

### C. Data Model

`badge` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | RM, kiosk service, or bulk-print service |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{zebra_print_job_id, dhl_tracking_number}` |
| `audit_log` | `jsonb[]` | Append-only |
| `registration_id` | `uuid` | FK -> registration.id |
| `badge_template_id` | `uuid` | FK -> badge_template.id |
| `photo_asset_id` | `uuid null` | FK -> content_asset.id; null if not yet captured |
| `qr_payload` | `text` | Encrypted JWT containing credential_id list, issued_at, signature |
| `qr_payload_version` | `int` | 1 = static, 2 = rotating TOTP |
| `qr_totp_secret_id` | `uuid null` | FK -> kms_key.id; non-null for VIP rotating QR |
| `color_band` | `enum[blue, gold, purple, green, red, orange]` | Derived from registration_type |
| `country_flag_iso` | `char(2) null` | ISO 3166-1 alpha-2 |
| `zone_icon_list` | `text[]` | Materialized from active credentials for visual layout |
| `status` | `enum[draft, queued, printing, printed, shipped, ready_for_collection, collected, voided, lost]` | Lifecycle |
| `print_job_id` | `uuid null` | FK -> print_job.id |
| `printer_id` | `uuid null` | FK -> printer.id |
| `printed_at` | `timestamptz null` | UTC |
| `collected_at` | `timestamptz null` | When FV hands to attendee |
| `voided_at` | `timestamptz null` | When superseded by a reprint |
| `voided_by` | `uuid null` | RM or break-glass approver |
| `void_reason` | `text null` | Required when voided |
| `reprint_count` | `int` | Number of reprints for this registration; starts at 0 |
| `reprint_of_badge_id` | `uuid null` | FK -> badge.id; non-null if this badge is a reprint |

`badge_template` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | RM (or PO for dignitary) |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{zebra_template_id, hid_fargo_template_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `registration_type` | `enum[attendee, dignitary, speaker, sponsor_staff, media, staff_volunteer]` | One template per type |
| `template_version` | `text` | e.g., "v2.1" |
| `is_active` | `bool` | Only one active per registration_type |
| `layout_json` | `jsonb` | Per-element layout (see schema below) |
| `color_band_hex` | `text` | e.g., "#FFD700" for gold (VIP) |
| `substrate_type` | `enum[pvc_standard, pvc_high_security, paper_bio]` | ESG-aware substrate |
| `qr_mode` | `enum[static, rotating_totp]` | rotating_totp for VIP only |

`layout_json` schema (jsonb):

```json
{
  "dimensions_mm": {"width": 85.6, "height": 54.0},
  "elements": [
    {"key": "photo", "type": "image", "x_mm": 5, "y_mm": 5, "w_mm": 25, "h_mm": 30},
    {"key": "full_name", "type": "text", "x_mm": 35, "y_mm": 8, "font_size_pt": 16, "font_weight": "bold"},
    {"key": "company", "type": "text", "x_mm": 35, "y_mm": 16, "font_size_pt": 11},
    {"key": "country_flag", "type": "image", "x_mm": 70, "y_mm": 5, "w_mm": 10, "h_mm": 7},
    {"key": "color_band", "type": "rectangle", "x_mm": 0, "y_mm": 0, "w_mm": 85.6, "h_mm": 4, "fill_hex": "#FFD700"},
    {"key": "qr_code", "type": "qr", "x_mm": 5, "y_mm": 38, "w_mm": 15, "h_mm": 15, "ecc_level": "H"},
    {"key": "zone_icons", "type": "icon_row", "x_mm": 25, "y_mm": 42, "icon_size_mm": 6, "max_count": 6}
  ]
}
```

`print_job` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Kiosk service, bulk-print service, or RM |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{zebra_job_uuid}` |
| `audit_log` | `jsonb[]` | Append-only |
| `badge_id` | `uuid` | FK -> badge.id |
| `printer_id` | `uuid` | FK -> printer.id |
| `job_type` | `enum[initial, reprint, batch]` | initial = first-time; reprint = replacement |
| `status` | `enum[queued, sent_to_printer, printing, completed, failed, cancelled]` | Lifecycle |
| `queued_at` | `timestamptz` | UTC |
| `sent_at` | `timestamptz null` | UTC |
| `completed_at` | `timestamptz null` | UTC |
| `failed_at` | `timestamptz null` | UTC |
| `failure_reason` | `text null` | Enumerated: ribbon_out, substrate_jam, printer_offline, sdk_error |
| `retry_count` | `int` | Auto-retry up to 2 times before alerting FV |

`printer` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL |
| `updated_by` | `uuid` | OL |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{zebra_serial, hid_fargo_serial}` |
| `audit_log` | `jsonb[]` | Append-only |
| `hardware_id` | `text` | Serial number |
| `model` | `enum[zebra_zc350, hid_fargo_hdp6600, zebra_zxp9]` | Printer model |
| `location_label` | `text` | e.g., "Kiosk 03 - Main Hall East" |
| `status` | `enum[online, offline, degraded, out_of_ribbon, out_of_substrate, maintenance]` | Materialized from heartbeat |
| `last_heartbeat_at` | `timestamptz` | UTC; OL alert if > 30s stale |
| `ribbon_remaining_pct` | `numeric(5,2)` | 0-100; estimated from print count |
| `substrate_remaining` | `int` | Number of blank badges left in hopper |
| `is_failover_target` | `bool` | True for the designated backup printer |
| `ip_address` | `inet` | For Zebra Print DNA SDK connection |

### D. Business Logic & Edge Cases

- **IF** a `registration.confirmed` event arrives, **THEN** the pipeline resolves the `badge_template` by `registration_type`, materializes a `badge` record with `status = draft`, generates the `qr_payload` (signed JWT containing active credential IDs from Module 6.2), and queues a `print_job` of `job_type = initial` if the registration is onsite or schedules pre-event shipping if pre-event.
- **IF** the `badge_template.qr_mode = rotating_totp` (VIP only), **THEN** the pipeline generates a per-badge TOTP secret stored in AWS KMS (`qr_totp_secret_id`), the `qr_payload` is replaced with a TOTP-bound payload that the reader's validation logic recomputes every 60 seconds, and the badge hardware must be a Bluetooth-enabled smart badge (e.g., HID fobs with e-ink display) for the QR to rotate. Static-QR badges cannot use this mode.
- **IF** a `print_job` is `completed`, **THEN** the pipeline publishes `badge.printed`, sets `badge.status = printed`, and waits for either `shipped` (pre-event) or `ready_for_collection` (onsite).
- **IF** a reprint is requested, **THEN** the pipeline requires RM approval and ID verification (the FV at the kiosk scans the attendee's government ID via the Zebra DS3600, and the engine compares the ID name to `registration.submitted_payload.full_name`). On approval, the old badge is `voided_at` and `voided_by` set; the old `qr_payload` is added to a revoked-JWT denylist that Module 6.2's reader validation checks (real-time via Redis). A new `badge` is created with `reprint_of_badge_id = old_badge.id` and `reprint_count` incremented.
- **IF** a printer's `ribbon_remaining_pct` drops below 10%, **THEN** the pipeline sends a Twilio SMS to the assigned FV ("Kiosk 03 ribbon low - 12% remaining - swap ribbon at next break") and shows an amber light on the printer's status LED.
- **IF** a printer fails (`status = out_of_ribbon` or `out_of_substrate` mid-job), **THEN** the pipeline triggers auto-failover (see Edge Case 1), re-queues the affected `print_job` to the backup printer, and the failed printer's queue is drained to the backup within 30 seconds.
- **IF** a pre-event badge is shipped and the DHL/FedEx tracking shows "delivered" but the attendee reports non-receipt, **THEN** the pipeline requires RM approval + ID verification at the kiosk for a reprint, marks the original badge `status = lost`, and the reprint cost is billed to the event's "contingency" cost center (FAL visibility).
- **IF** the `color_band` configured for `registration_type = dignitary` does not match the protocol flag (e.g., dignitary template uses gold but a rank-1 Head of State requires platinum), **THEN** the PO can override per-dignitary via break-glass; the override is captured in `audit_log`.

**Edge Case 1: Printer runs out of ribbon mid-event, auto-failover to backup (non-obvious).** At 09:14:32 during peak check-in, Printer 04 (Kiosk 04) exhausts its ribbon mid-print of a Gold sponsor's badge. The Zebra ZC350 SDK fires a `ribbon_out` event; the pipeline's printer-monitor worker (a Kafka consumer on `printer.heartbeat`) receives it within 2 seconds. The pipeline: (1) marks `printer.status = out_of_ribbon`, (2) cancels all queued `print_job` records for Printer 04 (status -> `cancelled` with `failure_reason = ribbon_out`), (3) auto-re-queues them to the designated backup printer (Printer 12, `is_failover_target = true`), preserving FIFO order, (4) publishes a `printer.out_of_ribbon` event that triggers a Twilio SMS to FV-04 with instructions ("Printer 04 ribbon out. Replace at next break. Badges routed to Printer 12 automatically."), (5) updates the Kiosk 04 UI to display "Badges printing at Kiosk 12 - please collect there" with wayfinding via Mapwize, (6) tracks the gap period in a `printer_gap_period` record for the post-event report. The backup printer must absorb up to 2x its normal load; capacity planning requires the backup printer's `substrate_remaining` and `ribbon_remaining_pct` to be at 80%+ before auto-failover triggers. **IF** the backup is also below 80%, the pipeline escalates to the secondary backup (Printer 11) and pages OL. Ribbon replacement by the FV takes ~90 seconds; once Printer 04's heartbeat shows `ribbon_remaining_pct > 50%`, the pipeline fails traffic back to Printer 04 and releases the backup.

**Edge Case 2: VIP badge QR photographed by unauthorized party, rotating-QR mode (non-obvious).** A rank-1 Head of State's badge is photographed by a journalist in the plenary hall at 11:23:00. The journalist attempts to clone the QR and use it at a Speaker Backstage reader at 11:24:15 (75 seconds later). The badge is a Bluetooth-enabled smart badge (HID fob with e-ink display) running `qr_mode = rotating_totp` with a 60-second rotation. The original QR was captured at T=0; by T+60s the badge has displayed a new QR (computed via TOTP with the per-badge secret in AWS KMS). At T+75s the reader at Speaker Backstage recomputes the expected TOTP value for the current window; the journalist's cloned (stale) QR is rejected with `denied_no_credential`, and a `scan.denied` event flows to Module 8, which dispatches an FV to intercept. The FV confiscates the cloned QR attempt, the PO is notified, and the Security Operations team (via Genetec) pulls the CCTV footage from the plenary at 11:23:00 to identify the photographer. **IF** the smart badge's battery is below 15% (display frozen), the rotating-QR mode fails open to the last-displayed QR with a 5-minute grace window during which the engine flags any scan of that QR for manual review; the badge's BLE beacon alerts the FV via the Staff App to swap the badge for a freshly charged one. Static-QR badges (used for non-VIP attendees) cannot use this protection; for these, the engine relies on the reader's photo-on-screen verification (the FV at high-security zones compares the badge photo to the attendee face). The rotating-QR TOTP window is 60 seconds with a +/- 1 window skew tolerance; this prevents replay but requires clock sync between badge, reader, and engine within 5 seconds (NTP enforced).

### E. Third-Party Integrations

- **Zebra ZC350 card printers (onsite):** Connected via USB or LAN. The pipeline uses Zebra Print DNA SDK (ZebraPrinterLinkOS) to send print jobs, query status (ribbon, substrate, head temperature), and receive alerts. Bidirectional with mTLS for LAN-connected units. Throughput: ~6 seconds per badge (single-side color).
- **Zebra Print DNA SDK:** The pipeline's adapter layer. Provides a unified API across Zebra ZC350, ZXP9, and (via a sibling SDK) HID FARGO HDP6600. Job queue management, status polling, and error code normalization.
- **HID Global FARGO HDP6600 (high-security badges):** Used for protocol_rank 1-2 dignitary badges with holographic overlay and UV watermark. The pipeline routes these jobs to the FARGO printer in the secure operations room (OL access only), not to the public kiosk fleet.
- **DHL Express and FedEx (pre-event shipping):** Outbound. The pipeline generates a shipping label via the carrier API (address from `registration.submitted_payload`), packs the badge in a tamper-evident sleeve, and ships via tracked service (next-day delivery for VIPs, 3-day for attendees). The tracking number is stored in `badge.ext_refs.dhl_tracking_number` and surfaced to the attendee via the Mobile App. Inbound webhook updates the `badge.status` to `shipped` and `collected` (on delivery).
- **AWS KMS:** Envelope encryption for `qr_payload` signing keys (per-event), per-badge TOTP secrets (VIP rotating-QR), and photo redaction crypto material.
- **AWS S3:** Stores badge artwork proofs (versioned), pre-event print batch PDFs (for the commercial print house), and the post-event print reconciliation reports.
- **Twilio:** SMS to FVs on printer alerts (ribbon low, failover, paper jam), to RMs on reprint requests, and to attendees on badge-shipped and ready-for-collection events.
- **Mapwize:** Wayfinding prompt on the kiosk when a badge is rerouted to a backup printer ("Please collect your badge at Kiosk 12 - 90m walk").
- **Kafka:** Topics `badge.queued`, `badge.printed`, `badge.shipped`, `badge.collected`, `badge.voided`, `badge.reprint_requested`, `printer.online`, `printer.offline`, `printer.out_of_ribbon`, `printer.out_of_substrate`, `printer.failover_triggered`.

### F. UI/UX Notes

- **Badging Console (RM):** Dashboard with print throughput (badges/min), printer health grid (12 cells colored by status), reprint queue with one-click approval (after ID verification), and a live "voided QR" count. Tab for pre-event shipping tracker (DHL/FedEx status per badge).
- **Kiosk UI (FV-facing strip):** When a badge is queued, the kiosk shows the attendee's name and registration type. On print completion, the FV sees "Ready to retrieve" with a thumbnail of the badge artwork. FV clicks "Retrieved" then "Handed to Attendee" to advance the badge lifecycle.
- **Badge artwork preview (RM, PO):** Side-by-side template editor showing the design canvas and the rendered badge for a sample registration. Per-element drag-and-drop. Real-time preview of QR placeholder.
- **Mobile App (ATT):** "My Badge" page shows current status (queued, printed, shipped, ready-for-collection, collected), tracking link if shipped, and a "Report Lost Badge" button that initiates the reprint workflow.
- **Shadow App (VL):** "Dignitary Badge" card shows the dignitary's badge status and a "Report Lost" button that triggers a high-priority reprint workflow (bypasses the standard ID verification step because the VL's identity is already attested).
- **Accessibility:** Color bands are paired with text labels (not color-only) for color-blind attendees. Zone icons are high-contrast and standardized (plenary, VIP, media, backstage, F&B).

### G. Failure Modes & Offline Behavior

- **Zebra Print DNA SDK unreachable (LAN/WiFi down to printer):** Pipeline marks `printer.status = offline` and triggers failover to backup. Kiosk UI displays a "Printer temporarily offline, redirecting you to Kiosk N" message with wayfinding.
- **All kiosk printers fail simultaneously (power loss in check-in hall):** OL triggers the contingency plan: FVs use pre-printed "temporary badges" (a generic white badge with manual name-and-zone writing) and the engine logs them as `badge_temporary` records; the actual badge is printed within 2 hours at a backup location and delivered to the attendee via FV.
- **AWS KMS throttling (TOTP secret generation spike):** The pipeline pre-generates TOTP secrets for all expected VIPs during the pre-event window (2 weeks prior) and stores them in an encrypted cache (Redis). Onsite TOTP generation is a fallback only.
- **DHL/FedEx API outage (pre-event):** Shipping labels queue in the Integration Hub DLQ with 48-hour retention. The pipeline falls back to bulk shipping via the commercial print house's own logistics partner (one master shipment to the venue's mailroom) and onsite collection replaces shipping for affected attendees.
- **Reprint request for a non-existent registration:** Pipeline returns 404 and surfaces a "Cannot find registration" error to the kiosk; FV escalates to the Help Desk for manual lookup (break-glass).
- **Photo capture fails at the kiosk (camera broken):** Pipeline falls back to "photo-less badge" mode: the badge prints without the photo, with a "Photo Pending" placeholder. The attendee is asked to visit the Help Desk to add the photo later (or accept the photo-less badge). Protocol dignitaries are always photo-less (privacy by protocol).
- **Bluetooth smart badge battery dead (rotating-QR mode):** The badge fails open to static-QR (last displayed) with a 5-minute grace window; the FV receives a Staff App alert to swap the badge.

### H. Acceptance Criteria

- **Given** a confirmed attendee registration, **when** the `registration.confirmed` event is processed by the badging pipeline, **then** a `badge` record is created with `status = draft`, the active credentials from Module 6.2 are encoded into a signed `qr_payload`, and within 5 seconds a `print_job` of `job_type = initial` is queued at the appropriate printer (or scheduled for pre-event shipping) and a `badge.queued` event is published.
- **Given** a Zebra ZC350 printer at Kiosk 04 that runs out of ribbon mid-print at 09:14:32 during peak check-in, **when** the SDK fires the `ribbon_out` event, **then** the pipeline marks `printer.status = out_of_ribbon` within 2 seconds, cancels queued jobs, auto-re-queues them to the designated backup printer (Printer 12) preserving FIFO order, sends a Twilio SMS to FV-04, updates Kiosk 04 UI with wayfinding to Kiosk 12, and tracks the gap period for the post-event report.
- **Given** a rank-1 Head of State's rotating-QR badge (60-second TOTP rotation, Bluetooth smart badge) whose QR is photographed by an unauthorized party at T=0, **when** the cloned QR is presented at a Speaker Backstage reader at T+75s, **then** the reader recomputes the expected TOTP for the current window, the stale QR is rejected with `denied_no_credential`, a `scan.denied` event triggers FV dispatch, and the engine escalates the photographer identification to Genetec via CCTV pull.
- **Given** a lost-badge reprint request at the kiosk, **when** the FV scans the attendee's government ID via Zebra DS3600 and the ID name matches `registration.submitted_payload.full_name`, **then** the pipeline requires RM approval, on approval voids the old badge's `qr_payload` in real time (Redis denylist), creates a new `badge` record with `reprint_of_badge_id = old_badge.id` and `reprint_count` incremented, queues a `print_job` of `job_type = reprint`, and publishes `badge.voided` and `badge.reprint_requested` events.
- **Given** a pre-event badge shipped via DHL, **when** the DHL webhook reports `delivered`, **then** the pipeline updates `badge.status = collected`, sends a confirmation via Twilio to the attendee, and a `badge.collected` event is published for the analytics warehouse.
