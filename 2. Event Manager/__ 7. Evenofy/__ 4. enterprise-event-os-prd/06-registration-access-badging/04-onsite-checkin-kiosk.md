> Module 6: Registration, Access Control & Badging -> 6.4 Onsite Check-In Kiosk

## Onsite Check-In Kiosk

### A. Purpose Statement

The Onsite Check-In Kiosk is the physical and digital surface where 10,000+ FMF attendees transition from "registered" to "in the venue" over a 36-hour window. The kiosk fleet is 12 freestanding units deployed across the three main entrances of the venue, each handling a peak load of 23 check-ins per minute during the 08:00-09:00 surge, with a 5-minute average wait time. A failed check-in is the single highest-friction moment in the attendee journey; a 30-second per-attendee delay at the kiosk becomes a 60-minute queue at peak. The kiosk is therefore designed for sub-15-second median check-in time, multi-language support, accessibility compliance, and graceful degradation under every plausible failure mode (scanner breakage, network loss, printer ribbon out, VIP escalation). The kiosk consumes `registration.confirmed`, `badge.queued`, and `badge.printed` events from Modules 6.1 and 6.3, and publishes `checkin.completed`, `checkin.failed`, `checkin.vip_escalation`, and `kiosk.health` events that feed Module 1.1 (War Room live throughput tile), Module 8 (FV dispatch for VIP escalation), and Module 7 (Mobile App "You're checked in" confirmation push).

### B. User Roles & Permissions

- **Event Director (ED):** Read on fleet throughput, per-kiosk health, and VIP escalations. Write only via break-glass on kiosk config changes (e.g., language set) during event hours.
- **Operations Lead (OL):** Read on all kiosk telemetry (queue depth, throughput, printer status, scanner status). Write on kiosk open/close, language set updates, failover routing. Primary fleet operator.
- **Protocol Officer (PO):** Read on dignitary check-ins as they occur. Write on VIP Console re-print approval (break-glass) and on dignitary photo-redaction override.
- **VIP Liaison (VL):** Read-only on their assigned dignitary's check-in status. Notified via Shadow App when the dignitary arrives at the kiosk.
- **Registration Manager (RM):** Read/write on kiosk branding, language set, accessibility config. Approves Help Desk reprints. Cannot operate the kiosk UI during event hours (RM uses the Badging Console, not the kiosk).
- **Sponsorship Sales Lead (SSL):** Read-only on sponsor-staff check-in counts (used to verify sponsor booth readiness).
- **Exhibitor Portal User (EPU):** No direct access. The EPU sees aggregate "X of Y staff checked in" in the portal.
- **Content & Stage Manager (CSM):** Read-only on speaker check-in status (used to trigger green-room readiness).
- **Matchmaking Concierge (MC):** Read-only on attendee check-in events; the MC's matchmaking graph materialization is updated when an attendee checks in (the attendee's "available for meeting" flag flips to true).
- **Finance & Administration Lead (FAL):** Read-only on reprint costs and Help Desk override counts for cost-allocation reporting.
- **Marketing & PR Lead (MPL):** Read-only on aggregate check-in counts for press releases ("FMF welcomes its 10,000th attendee at 09:14").
- **ESG & Sustainability Officer (ESGO):** Read-only on kiosk power consumption and queue-wait time for the attendee-experience component of the ESG report.
- **Field Volunteer (FV):** Primary kiosk-side operator. Read on the current attendee's check-in flow state, write on "photo captured", "badge retrieved", "hand to attendee", and "escalate to Help Desk" actions. Cannot approve reprints (escalates to RM via Help Desk). Cannot self-restart a frozen kiosk (escalates to OL via pager).
- **Attendee (ATT):** The end user of the kiosk. Read on the kiosk-facing UI: language selector, lookup fields, photo capture preview, wayfinding prompt. Write on their own photo capture confirmation and on the "Done" tap.

### C. Data Model

`kiosk` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{mimo_serial, elo_serial, device_cert_thumbprint}` |
| `audit_log` | `jsonb[]` | Append-only |
| `kiosk_label` | `text` | e.g., "Kiosk 03 - East Entrance" |
| `location_zone_id` | `uuid` | FK -> zone.id; the entrance zone |
| `hardware_config` | `jsonb` | Display, scanner, reader, printer config (see schema below) |
| `language_set` | `text[]` | ISO 639-1 codes shown on the home screen |
| `is_accessible` | `bool` | True for wheelchair-height units (10% of fleet) |
| `is_vip_console` | `bool` | False for kiosk; true for VIP desk station |
| `status` | `enum[open, closed, degraded, offline, maintenance]` | Lifecycle / health |
| `current_language` | `text` | Default 'en' on session start |
| `current_session_id` | `uuid null` | FK -> kiosk_session.id; active session |
| `last_heartbeat_at` | `timestamptz` | UTC; OL alert if > 30s stale |
| `sw_version` | `text` | Kiosk app build hash |
| `ip_address` | `inet` | For mTLS endpoint |
| `printer_id` | `uuid` | FK -> printer.id |
| `scanner_id` | `uuid` | FK -> scanner.id |
| `reader_id` | `uuid null` | FK -> reader.id; HID iCLASS for FV staff auth |

`hardware_config` schema (jsonb):

```json
{
  "display": {"model": "mimo_mp5x_55in_touch", "resolution": "1920x1080", "orientation": "portrait"},
  "scanner": {"model": "zebra_ds3600_2d", "connection": "usb"},
  "reader": {"model": "hid_iclass_se", "purpose": "fv_staff_auth"},
  "printer": {"model": "zebra_zc350", "connection": "lan", "ip": "10.x.x.x"},
  "audio_jack": {"present": true, "supports_audio_guidance": true},
  "accessibility": {"wheelchair_height": true, "large_text_mode": true, "audio_guidance": true}
}
```

`kiosk_session` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC; session start |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ATT (or kiosk service for walkup) |
| `updated_by` | `uuid` | Kiosk service |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{device_local_session_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `kiosk_id` | `uuid` | FK -> kiosk.id |
| `registration_id` | `uuid null` | FK -> registration.id; resolved after lookup |
| `badge_id` | `uuid null` | FK -> badge.id; populated on print |
| `lookup_method` | `enum[qr_scan, confirmation_code, name_plus_phone]` | Which path was used |
| `lookup_payload_hash` | `text` | SHA-256 hash of lookup input (PII protection) |
| `photo_captured` | `bool` | True if photo was captured at this session |
| `photo_asset_id` | `uuid null` | FK -> content_asset.id |
| `language_used` | `text` | ISO 639-1, e.g., 'ar' |
| `started_at` | `timestamptz` | Kiosk-local time, for latency analytics |
| `completed_at` | `timestamptz null` | UTC; null if session not yet completed |
| `duration_ms` | `int null` | Derived; completed_at - started_at |
| `outcome` | `enum[completed, failed_lookup, failed_print, vip_escalation, abandoned, retry_attempted]` | Session outcome |
| `failure_reason` | `text null` | Enumerated: not_found, qr_unreadable, photo_capture_failed, printer_out, network_timeout |
| `queue_position_at_start` | `int null` | If kiosk had a queue, the position when session started |
| `wait_time_ms` | `int null` | Time the attendee waited before the session started |

`scanner` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{zebra_serial}` |
| `audit_log` | `jsonb[]` | Append-only |
| `hardware_id` | `text` | Zebra DS3600 serial |
| `model` | `enum[zebra_ds3600, zebra_ds8178, hid_2d_gun]` | Scanner model |
| `kiosk_id` | `uuid` | FK -> kiosk.id |
| `status` | `enum[online, offline, degraded]` | Materialized from heartbeat |
| `last_heartbeat_at` | `timestamptz` | UTC |
| `firmware_version` | `text` | For OTA updates |
| `scan_count_total` | `int` | Cumulative scans for the event |

`checkin_event` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Kiosk service account |
| `updated_by` | `uuid` | Same |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{device_local_checkin_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `registration_id` | `uuid` | FK -> registration.id |
| `badge_id` | `uuid` | FK -> badge.id |
| `kiosk_id` | `uuid` | FK -> kiosk.id |
| `session_id` | `uuid` | FK -> kiosk_session.id |
| `occurred_at` | `timestamptz` | UTC, from kiosk clock |
| `attendee_first_checkin` | `bool` | True if this is the first check-in for the registration |
| `is_vip_escalation` | `bool` | True if escalated to VIP desk |
| `vip_console_user_id` | `uuid null` | FK -> user.id; non-null if VIP Console re-print used |

### D. Business Logic & Edge Cases

- **IF** an attendee scans a QR code at the kiosk scanner, **THEN** the kiosk extracts the registration_id from the QR (signed JWT validated locally with the per-event public key in the kiosk app's config), displays the registration summary in the selected language within 2 seconds, and prompts for photo capture if `registration.photo_asset_id` is null.
- **IF** the attendee selects "Lookup by Confirmation Code", **THEN** the kiosk prompts for the 6-character code and the last name. The engine validates both server-side; on match, the same flow continues. On no match, the kiosk offers "Try Again" or "Help Desk" escalation.
- **IF** the attendee selects "Lookup by Name and Phone", **THEN** the kiosk prompts for full name and last 4 of phone. The engine returns matching registrations (up to 3 candidates) for the attendee to disambiguate. PII handling: phone digits are masked except the last 4.
- **IF** photo capture is required and the attendee declines, **THEN** the kiosk informs the attendee that a photo is required for their badge type (mandatory for non-dignitary types). Dignitary badges (registration_type = dignitary) skip photo capture per protocol privacy rules.
- **IF** the print job completes, **THEN** the kiosk displays "Please retrieve your badge from the slot below", the FV (if present) sees a confirmation on the staff strip, and on the FV's tap of "Handed to Attendee", the kiosk publishes `checkin.completed` and shows a wayfinding prompt with the next destination (e.g., "Plenary Hall - 200m - follow the blue line").
- **IF** the print job fails (printer out of ribbon, paper jam), **THEN** the kiosk auto-retries up to 2 times; on third failure, it surfaces "Printer issue - please proceed to Kiosk N" (where N is the nearest healthy kiosk, computed via Mapwize distance + queue depth) and publishes a `checkin.failed` event with `failure_reason = printer_out`.
- **IF** the attendee's `registration_type = dignitary` (rank 1-3), **THEN** the kiosk does not display the standard self-service flow; instead, it routes the attendee directly to the VIP desk via a "Please proceed to the VIP Desk" screen with wayfinding, and publishes `checkin.vip_escalation` consumed by the VIP Console and the VL's Shadow App.
- **IF** a kiosk's `last_heartbeat_at` is older than 30 seconds, **THEN** the engine marks it `offline`, redistributes its expected load to the nearest 3 kiosks (see Edge Case 3), and pages the FV zone lead.

**Edge Case 1: QR code doesn't scan (damaged, screen reflection) - fallback lookup (non-obvious).** An attendee approaches Kiosk 07 and presents their phone with the QR code from the registration confirmation email. The Zebra DS3600 scanner fails to read the QR after 3 attempts (the screen has fingerprint smudges and the ambient sunlight is causing glare). The kiosk UI, after the third failed scan, automatically surfaces a modal: "Having trouble scanning? Enter your confirmation code and last name." The attendee taps the button, enters "FMF-2026-AB12CD" and "Dupont". The engine looks up the registration, finds a match, and continues the standard flow. **IF** the confirmation code lookup also fails (attendee mistyped), the kiosk offers "Lookup by Name and Phone" with the masked phone digits prompt. **IF** all three lookup methods fail, the kiosk escalates to the Help Desk by printing a numbered ticket ("Help Desk Queue Position: N") and publishing a `checkin.failed` event with `failure_reason = lookup_failed_all_methods`. The Help Desk FV can then perform a manual lookup via the Staff App using additional verification (e.g., government ID photo, company email match). To prevent QR scan failures at scale, the kiosk UI surfaces a tip on the home screen: "Increase screen brightness to 100% for the best scan experience." The scanner itself is configured with a higher retry threshold (5 attempts) during the peak 08:00-09:00 window, configurable via LaunchDarkly flag.

**Edge Case 2: VIP arrives without pre-printed badge (lost in transit) - break-glass reprint (non-obvious).** A rank-2 Prime Minister's pre-event badge was shipped via DHL but lost in transit (DHL webhook reported "delivered" but the delegation office never received it). The PM arrives at Kiosk 02 at 08:47:00. The kiosk detects `registration_type = dignitary` and routes to the VIP Desk per Edge Case 1's flow. At the VIP Desk, the VL (assigned to the PM) and the VIP Console operator (a senior FV with VIP Console permission) take over. The VIP Console shows the PM's registration with a "Badge Status: shipped - delivered - reported lost" warning. The operator clicks "Re-Print Lost Badge", which triggers a break-glass approval workflow: the request is sent to the RM (or ED if RM unavailable) via Twilio push notification with a 90-second SLA. On approval, the VIP Console queues a `print_job` of `job_type = reprint` at the VIP Desk's dedicated HID FARGO HDP6600 printer (high-security substrate with holographic overlay). The old badge's QR is voided in real time via Redis denylist. The reprint completes in ~12 seconds (FARGO is slower than Zebra ZC350). The VL hands the badge to the PM with a discreet apology. The whole flow from arrival to badge-in-hand is targeted at under 4 minutes; if the break-glass approval takes longer than 90 seconds, the VIP Console operator can request an "emergency interim badge" - a temporary Zebra ZC350-printed badge without the holographic overlay that grants general access only (not VIP Lounge, not Speaker Backstage) - valid for 60 minutes while the FARGO reprint completes. The interim badge is logged as a separate `badge` record with `status = temporary` and is auto-voided at the 60-minute mark. The whole sequence is captured in `audit_log` and surfaced to the PO and ED in real time.

**Edge Case 3: 1,400 check-ins during peak 08:00-09:00 across 12-kiosk fleet, with one kiosk failure (non-obvious).** At 08:23:00, Kiosk 09's display freezes (an Edge kiosk-mode crash). The kiosk heartbeat stops at 08:23:14. The engine marks Kiosk 09 `offline` at 08:23:44 (30s threshold) and immediately redistributes expected load. The redistribution algorithm: each of the 3 nearest kiosks (Kiosks 07, 08, 10 by Mapwize walking distance) absorbs an additional 33% of Kiosk 09's expected load. The expected load per kiosk was 23/min (1400/60); after redistribution, Kiosks 07, 08, 10 each handle ~30.6/min, which is within their design capacity of 35/min. Wait time at the redistribution kiosks increases from 5 min to ~7 min. The OL is paged and a FV is dispatched with a reboot tablet; the kiosk is back online at 08:31:00 (8-minute downtime). During the 8-minute outage, ~187 attendees who would have used Kiosk 09 were redistributed; the War Room tile shows "Kiosk 09 offline - load redistributed to 07, 08, 10" with a real-time wait-time graph. **IF** the fleet drops below 9 kiosks online (75% availability), the engine escalates to OL with a "Critical kiosk fleet capacity" alert, and OL activates the contingency plan: 6 FVs with Zebra TC52 mobile scanners take manual check-in positions at the entrances, validating badges via the `/validate-credential` endpoint over LTE. The mobile-checkin path is slower (~40 seconds per attendee vs 15 at the kiosk) but prevents queue collapse. The peak-window throughput target of 23 check-ins/min/kiosk is validated by load testing in staging 2 weeks prior, simulating 1,400 synthetic check-ins across 12 kiosks with a 99th-percentile latency of 18 seconds per check-in (median 12 seconds).

### E. Third-Party Integrations

- **Zebra DS3600 2D scanner + Zebra DataWedge SDK:** Outbound scan events from the DS3600 to the kiosk app via the DataWedge intent-based API on the kiosk's Android host (the kiosk runs Microsoft Edge kiosk mode on Windows, but the scanner is connected via USB to a Zebra-built Android bridge device that converts the scan to a keyboard-wedge input, or alternatively a native Zebra Windows SDK is used). Configurable scan profile: error-correction level H for QR codes, 200ms debounce.
- **Mimo Monitors or ELO Touch (55-inch touch display):** Hardware vendor for the kiosk's primary display. The kiosk app is a PWA served from the Next.js front-end and rendered in Microsoft Edge kiosk mode. Touch events are standard pointer events; no vendor SDK required.
- **Microsoft Edge kiosk mode:** The kiosk UI shell. Configured via Windows Assigned Access with a single-app kiosk profile, no browser chrome, no URL bar, no right-click context menu. Auto-restart on crash via a watchdog service.
- **HID iCLASS reader (for FV staff auth):** Connected via USB. The FV taps their staff badge at the kiosk to unlock the staff strip (the bottom 10% of the screen showing print status, escalate button). Without a valid FV tap, the staff strip is hidden.
- **Zebra ZC350 printer (thermal receipt for name-tag reprint):** Wait, the kiosk uses the ZC350 for badge printing (Module 6.3), and a separate small thermal receipt printer (Star TSP143 or Zebra ZD410) for the wayfinding receipt ("Plenary Hall - 200m - follow blue line"). The receipt printer is connected via USB.
- **Mapwize (wayfinding prompt):** Outbound only. After check-in completion, the kiosk calls the Mapwize API to compute the route from the kiosk's location to the attendee's first session (resolved from the registration's schedule). The route is rendered as a small map snippet on the kiosk display and printed on the receipt.
- **Twilio (VIP escalation notifications):** When a VIP check-in escalates to the VIP Desk, the kiosk publishes `checkin.vip_escalation` consumed by a worker that sends a Twilio push to the VL's Shadow App and a Twilio SMS to the RM for break-glass reprint approval.
- **AWS KMS:** Envelope encryption for the kiosk app's per-event signing keys (used to validate the registration QR's signature locally) and for photo-at-rest encryption before upload to S3.
- **LaunchDarkly:** Feature flags for kiosk config (scanner retry threshold, language set, large-text default, VIP-routing toggle).
- **Kafka:** Topics `checkin.started`, `checkin.completed`, `checkin.failed`, `checkin.vip_escalation`, `kiosk.online`, `kiosk.offline`, `kiosk.degraded`, `kiosk.load_redistributed`, `scanner.health`.

### F. UI/UX Notes

- **Home screen (kiosk-facing):** Large language selector (5 flag buttons: Arabic, English, French, Mandarin, Spanish). Below the selector, 3 large buttons: "Scan QR Code", "Enter Confirmation Code", "Lookup by Name and Phone". Accessibility tip strip at the bottom: "Wheelchair-height kiosks are marked with a blue icon. Audio guidance available - plug headphones into the jack."
- **Photo capture screen:** Live camera preview with face-detection overlay (green box when aligned). Capture button, retake button, and a "Decline Photo" link (only shown if `registration_type` allows). For dignitary types, this screen is replaced with a "No photo required for your registration type" message.
- **Confirmation screen:** Summary of attendee name, registration type, badge color band preview, and "Please retrieve your badge from the slot below" instruction. After FV taps "Handed to Attendee", a "Where to next?" screen with Mapwize wayfinding and a "Done" button.
- **Multi-language:** Full RTL layout for Arabic. Language switching mid-session preserves all entered data. Numerals are localized (Arabic-Indic digits in Arabic mode, Western digits otherwise).
- **Accessibility:** Wheelchair-height kiosks (10% of fleet, marked with a blue icon on the housing) have the display mounted at 1100mm (vs 1500mm for standard). Large-text mode doubles all font sizes and is toggled via a physical button on the kiosk housing (not in the UI). Audio guidance via headphone jack reads the on-screen content in the selected language using a pre-recorded TTS library.
- **Staff strip (FV-facing):** Bottom 10% of the screen, only visible after FV taps staff badge at the HID reader. Shows: current attendee's registration type and color band (so FV knows what to expect), "Photo Captured" status, "Print Status" with retry button, "Escalate to Help Desk" button, "Escalate to VIP Desk" button (only for dignitary types), "Reboot Kiosk" button (escalates to OL).
- **Help Desk Console (RM, Help Desk FV):** Separate tablet-based UI for the Help Desk station, showing the queue of escalated attendees with lookup history and a "Manual Lookup" form (government ID photo scan, company email match).
- **VIP Console (senior FV):** Tablet-based UI at the VIP Desk showing arriving dignitaries in protocol-rank order, with break-glass reprint buttons and interim-badge issuance.

### G. Failure Modes & Offline Behavior

- **Kiosk app crash (Edge kiosk mode):** Windows watchdog restarts the app within 5 seconds; if 3 crashes in 5 minutes, kiosk marked `degraded` and FV dispatched to physically reboot. The kiosk's last known state (active session, if any) is recovered from the engine's session store.
- **Scanner offline (USB disconnect):** Kiosk UI disables the "Scan QR Code" button and surfaces "Scanner unavailable - please use confirmation code lookup". FV alerted to reconnect.
- **Network loss (LAN/WiFi down):** Kiosk switches to offline mode with a 1-hour local cache of confirmed registrations (refreshed hourly via a pre-fetch job). Lookups against the cache return a "Provisional check-in" status; when network recovers, the kiosk syncs the session to the engine within 30 seconds. Badge printing cannot be queued offline (the print_job requires engine-side QR generation); in this case, the kiosk issues a "Temporary Badge" printed locally with a placeholder QR that is replaced on network recovery.
- **Printer offline (ribbon out, paper jam):** Kiosk auto-routes to nearest healthy kiosk (Mapwize + queue depth calculation). Attendee receives a wayfinding prompt.
- **HID iCLASS reader failure (FV auth):** Staff strip becomes inaccessible. Kiosk continues to operate in "self-service only" mode (attendee self-retrieves badge, FV not required to confirm handoff). OL is paged.
- **All kiosks offline (power loss in check-in hall):** OL activates the mobile FV contingency plan; Zebra TC52 scanners run a check-in app variant that validates against the engine over LTE. Throughput drops to ~40s/attendee but check-in continues.
- **Cloud engine unreachable (full outage):** Each kiosk has a 4-hour battery and a local cache of the next 100 expected registrations (by scheduled arrival time, fetched nightly). The kiosk can complete check-ins for these 100 registrations offline, with sync deferred. Beyond 4 hours, the kiosk displays "System temporarily unavailable - please proceed to Help Desk".
- **Photo capture fails (camera broken):** Kiosk falls back to "photo-less badge" mode with "Photo Pending" placeholder; attendee is asked to visit Help Desk later or accept the photo-less badge.

### H. Acceptance Criteria

- **Given** an attendee with a valid QR code in their registration email, **when** they scan the QR at a kiosk during the 08:00-09:00 peak window, **then** the kiosk resolves the registration within 2 seconds, displays the summary in the selected language, prompts for photo capture if needed, queues a `print_job`, prints the badge, and on FV confirmation publishes `checkin.completed` with a total `duration_ms` under 15,000ms median and 18,000ms p99.
- **Given** an attendee whose QR code fails to scan after 3 attempts due to screen glare or damage, **when** the kiosk surfaces the fallback modal, **then** the attendee can enter their confirmation code and last name to complete the lookup, and if that also fails, the attendee is offered name-plus-phone lookup, and if all three methods fail, a `checkin.failed` event is published with `failure_reason = lookup_failed_all_methods` and a Help Desk ticket is printed.
- **Given** a rank-2 Prime Minister whose pre-printed badge was lost in transit arriving at Kiosk 02 at 08:47:00, **when** the kiosk detects `registration_type = dignitary`, **then** the kiosk routes the PM to the VIP Desk via a wayfinding screen, publishes `checkin.vip_escalation` consumed by the VL Shadow App and VIP Console, the VIP Console operator triggers a break-glass reprint approved by RM/ED within 90 seconds, the FARGO HDP6600 prints the high-security badge in ~12 seconds, and the entire flow from arrival to badge-in-hand completes within 4 minutes; if approval exceeds 90 seconds, an interim ZC350-printed general-access badge is issued valid for 60 minutes.
- **Given** a 12-kiosk fleet processing 1,400 check-ins during the 08:00-09:00 peak window with Kiosk 09 going offline at 08:23:14, **when** the engine detects the heartbeat staleness at 08:23:44, **then** the engine marks Kiosk 09 offline, redistributes its expected load to the 3 nearest kiosks (07, 08, 10) increasing their per-kiosk load from 23/min to ~30.6/min (within design capacity of 35/min), pages OL with an FV dispatch, and if the fleet drops below 9 kiosks online, escalates to a "Critical kiosk fleet capacity" alert and activates the mobile FV contingency plan.
- **Given** an attendee checking in at a wheelchair-height accessible kiosk with large-text mode enabled and Arabic language selected, **when** the attendee navigates the flow, **then** the kiosk displays all content in Arabic with RTL layout, doubled font sizes, and the entire flow (scan, photo, print, wayfinding) is operable from a wheelchair height of 1100mm with no button above 1300mm, and the audio guidance via headphone jack reads all on-screen content in Arabic.
