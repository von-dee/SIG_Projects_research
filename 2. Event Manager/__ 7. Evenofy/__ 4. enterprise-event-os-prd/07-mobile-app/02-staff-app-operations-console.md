> Module 7: Mobile App (Attendee & Staff Facing) -> 7.2 Staff App & Operations Console

## Staff App & Operations Console

### A. Purpose Statement

The Staff App is the operational surface carried in the pocket of every Field Volunteer, Zone Lead, VIP Liaison, Registration Manager, Operations Lead, and Protocol Officer on event day. At FMF scale this means 200-400 FVs plus 30-50 senior staff moving across three venues and a 1.2 million square meter site, handling 10,000+ attendees, 100+ sovereign delegations, and a 3-day run-of-show whose drift tolerance is measured in seconds. A single app binary, gated by role, must let an FV scan an attendee into a session in under 2 seconds, let a Zone Lead broadcast a message to 25 volunteers in one tap, let a VL push a dignitary's "on stage in 90 seconds" status to the War Room, and let an RM see check-in throughput by kiosk without ever leaving the same app.

The app is a single React Native binary distributed via Microsoft Intune MDM (staff devices are enrolled) plus the public App Store and Google Play (BYOD for senior staff with conditional access). The Staff App is offline-first by contract: full functionality for 90 minutes without network connectivity (see Module 7.4 for sync engine details), because venue cellular congestion and WiFi coverage gaps during peak moments (motorcade arrival, banquet ingress, plenary egress) are guaranteed, not exceptional. The Staff App is the read-side surface for Modules 1 (War Room), 2 (VIP Protocol), 6 (Registration, Access, Badging), and 8 (Ops & Logistics), and the write-side surface for incident reports (Module 1.2), task acknowledgments, FV scans (Module 6.2), and VL status updates (Module 2.4). It publishes `appconfig.*` events for analytics and consumes `notif.*` for staff-targeted pushes (e.g., VIP motorcade arrival, incident alerts).

### B. User Roles & Permissions

The Staff App is the primary surface for FV and VL. It is also used by OL, RM, and PO for portable read-only visibility and limited write actions. Role gating is enforced both client-side (UI rendered per role) and server-side (BFF rejects unauthorized mutations).

- **Field Volunteer (FV):** Primary. Read on assigned zone map, current session schedule for assigned zone, attendee lookup (limited fields: name, registration type, photo, valid credentials, last scan location). Write on scan events (Module 6.2), incident reports (photo + category + location), task acknowledgments. Cannot close incidents, cannot dispatch other FVs, cannot view dignitary protocol data.
- **VIP Liaison (VL):** Primary (parallel to the dedicated Shadow App in Module 2.4). Read on assigned dignitary's full profile and live status. Write on dignitary status updates (10 coded values per Module 2.4), VL-to-FV chat messages, photo and voice note sharing. Cannot modify protocol rank, seating, or motorcade assignments.
- **Operations Lead (OL):** Read on the Ops Dashboard (live zone occupancy, incident queue, task completion rate, FV on-duty roster). Write on incident escalation, FV dispatch, broadcast-to-zone messages. Cannot modify commercial records or dignitary protocol data.
- **Event Director (ED):** Read on all Staff App surfaces. Write only via break-glass on Crisis Mode activation (per Module 1.2) and on incident severity escalation above S2.
- **Protocol Officer (PO):** Read on dignitary tracking surface (all dignitaries, all zones). Write on protocol-related incident flags (e.g., "dignitary held at security checkpoint"). Cannot dispatch FVs (that is OL's role).
- **Registration Manager (RM):** Read on check-in metrics (per-kiosk throughput, badge reprint queue). Write on reprint approvals (up to US$ threshold per Module 6.3). Cannot dispatch FVs or modify incidents.
- **Sponsorship Sales Lead (SSL):** Read-only on sponsor-zone incidents (e.g., booth power outage). No write.
- **Exhibitor Portal User (EPU):** No Staff App access. Uses the Sponsor Portal web app.
- **Content & Stage Manager (CSM):** Read on speaker check-in status (consumed from Module 6.4) and stage run-sheet progress. Write only on session-delay alerts published to assigned FVs.
- **Matchmaking Concierge (MC):** Read on B2B pod occupancy and queue. Write on pod reassignment in case of overflow.
- **Finance & Administration Lead (FAL):** Read-only on incident cost records and FV timesheet aggregates. No write.
- **Marketing & PR Lead (MPL):** Read on attendee-density heatmap for media positioning. No write.
- **ESG & Sustainability Officer (ESGO):** Read on aggregate waste and F&B surplus data per zone. No write.
- **Attendee (ATT):** No Staff App access. ATT uses the Attendee App (Module 7.1).

### C. Data Model

`staff_device` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | RM (enrollment) or self (BYOD) |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete (device retired) |
| `ext_refs` | `jsonb` | e.g., `{intune_device_id, zebra_device_serial}` |
| `audit_log` | `jsonb[]` | Append-only |
| `assigned_persona_id` | `uuid` | FK -> staff_persona.id (the FV/VL/etc. assigned) |
| `device_kind` | `enum[byod_phone, org_iphone, org_android, zebra_tc52, zebra_tc57]` | Hardware tier |
| `platform_version` | `text` | e.g., "Android 13" |
| `app_version` | `text` | Semver |
| `mdm_enrolled` | `bool` | True for org devices, conditional for BYOD |
| `foreground_service_enabled` | `bool` | Required for Zebra TC52 / 90-min offline window |
| `zone_assignment_id` | `uuid null` | FK -> zone.id (Module 6.2); null = floating |
| `shift_id` | `uuid null` | FK -> shift.id; current shift |
| `last_seen_at` | `timestamptz` | Heartbeat timestamp; offline-detected after 90s |
| `battery_pct` | `numeric(5,2)` | 0-100; throttles sync per Module 7.4 |

`staff_task` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL or dispatcher |
| `updated_by` | `uuid` | OL or assignee |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{incident_id_if_related, meeting_id_if_related}` |
| `audit_log` | `jsonb[]` | Append-only |
| `title` | `text` | Short label, e.g., "Escort VIP to holding room" |
| `description` | `text` | Detailed instructions |
| `task_type` | `enum[escort, scan_session, crowd_control, incident_response, vip_handoff, setup, teardown]` | Drives UI template |
| `assigned_persona_ids` | `uuid[]` | 1 or more assignees; co-assignment allowed with explicit flag |
| `co_assignment_confirmed` | `bool` | True if dispatcher confirmed intent (see Edge Case 2) |
| `zone_id` | `uuid` | FK -> zone.id (Module 6.2) |
| `related_dignitary_profile_id` | `uuid null` | FK -> dignitary_profile.id; set for escort/vip_handoff tasks |
| `status` | `enum[unassigned, assigned, acknowledged, in_progress, completed, cancelled, failed]` | Lifecycle |
| `priority` | `enum[p1_critical, p2_high, p3_normal, p4_low]` | Sla-driven |
| `due_at` | `timestamptz` | UTC; sla tracked |
| `acknowledged_at` | `timestamptz null` | Assignee tap-on-ack |
| `completed_at` | `timestamptz null` | Assignee tap-on-complete + optional photo |
| `completion_photo_asset_id` | `uuid null` | FK -> content_asset.id (Module 4.4) |

`incident_report` (extends shared columns; mobile-originated draft, mirrors Module 1.2 record for offline access):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | FV or VL |
| `updated_by` | `uuid` | FV or sync engine |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{pagerduty_incident_id, war_room_incident_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `reporter_persona_id` | `uuid` | FK -> staff_persona.id |
| `reporter_location` | `jsonb` | `{lat, lng, indoor_floor, indoor_x, indoor_y, zone_id}` |
| `category` | `enum[medical, security, fire, av_failure, crowd_density, vip_protocol, facility, lost_found, other]` | Drives escalation path |
| `severity_guess` | `enum[s0, s1, s2, s3, unknown]` | Reporter's guess; OL re-triages |
| `description` | `text` | Free text, max 1000 chars |
| `photo_asset_ids` | `uuid[]` | Up to 5; FK -> content_asset.id |
| `audio_asset_ids` | `uuid[]` | Up to 2 voice notes |
| `reported_at` | `timestamptz` | Original device timestamp (preserved across offline) |
| `upload_status` | `enum[pending, uploading, uploaded, rejected]` | Sync engine state |
| `upload_retry_count` | `int` | Resets to 0 on success |
| `rejected_reason` | `text null` | Server rejection reason; surfaced to user |
| `merged_into_incident_id` | `uuid null` | FK -> incident.id (Module 1.2) when server creates the canonical record |

`team_chat_message` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Sender persona |
| `updated_by` | `uuid` | Sender or sync engine |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete (recall within 2 min) |
| `ext_refs` | `jsonb` | e.g., `{teams_message_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `channel_id` | `uuid` | FK -> chat_channel.id |
| `sender_persona_id` | `uuid` | FK -> staff_persona.id |
| `message_text` | `text` | Max 2000 chars |
| `photo_asset_ids` | `uuid[]` | Optional attachments |
| `priority` | `enum[normal, urgent, broadcast]` | Broadcast silences mute-settings for zone |
| `acknowledged_by` | `uuid[]` | Personas who tapped "ack" |
| `sent_at` | `timestamptz` | Device timestamp (preserved offline) |
| `delivered_at` | `timestamptz null` | Server-received timestamp |

`chat_channel` (extends shared columns):

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
| `deleted_at` | `timestamptz null` | Soft-delete (end of event) |
| `ext_refs` | `jsonb` | e.g., `{teams_channel_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `channel_kind` | `enum[zone, role, incident, direct, broadcast]` | Per-zone, per-role (all VLs), per-incident, DM, all-staff |
| `zone_id` | `uuid null` | FK -> zone.id when channel_kind = zone |
| `member_persona_ids` | `uuid[]` | Current members; OL can edit |
| `federated_with_teams` | `bool` | True if mirrored to Microsoft Teams |
| `teams_channel_id` | `text null` | Teams channel ID when federated |

### D. Business Logic & Edge Cases

- **IF** an FV taps "Report Incident" and fills in the form (photo + category + location auto-captured from Mapwize), **THEN** the app creates a local `incident_report` record with `upload_status = pending`, displays a "Pending Upload" badge on the FV's home screen, and the Offline Sync Engine (Module 7.4) retries upload every 30 seconds with exponential backoff (30s, 60s, 120s, 240s capped) until success or 10 attempts. **IF** upload succeeds, **THEN** the server creates the canonical `incident` record (Module 1.2), publishes `incident.created` on Kafka, and the FV's local record transitions to `upload_status = uploaded` with `merged_into_incident_id` set. **IF** upload fails after 10 attempts, **THEN** the FV sees a "Manual Sync Required" red banner and a one-tap "Retry Now" button.
- **IF** a Zone Lead taps "Broadcast to Zone", **THEN** the app creates a `team_chat_message` with `priority = broadcast` on the zone's chat channel, the message is delivered to all FVs currently assigned to the zone via WebSocket (or queued for offline FVs in the Sync Engine), and the broadcast silences any per-FV mute settings (only safety-critical broadcasts allowed; misuse is logged to `audit_log` and reviewed post-event).
- **IF** two staff members are assigned the same task (see Edge Case 2), **THEN** the dispatcher is required to either confirm `co_assignment_confirmed = true` (with reason recorded in audit_log) or reassign one of the assignees. The system never silently allows duplicate assignments.
- **IF** an FV's `last_seen_at` heartbeat is older than 90 seconds, **THEN** the Zone Lead's roster view marks that FV as "Offline / Possibly Degraded" with an amber indicator. After 5 minutes, the indicator turns red and the Zone Lead is prompted to dispatch a replacement.
- **IF** a task `due_at` is within 5 minutes and `status` is not yet `in_progress`, **THEN** the app raises a `task.at_risk` event consumed by the OL's Ops Dashboard; the OL may tap "Reassign" or "Extend SLA" (with break-glass if past due_at).
- **IF** an FV scans an attendee's badge QR that returns `denied` from the access-control service (Module 6.2), **THEN** the app creates an `incident_report` with `category = security` and `severity_guess = s2` automatically, attaches the scan event ID, and routes the incident to the OL for triage.
- **IF** the app is on a Zebra TC52 device, **THEN** the app uses the Zebra DataWedge SDK to capture barcode scans as intents (faster than camera-based scanning, no preview needed), and the foreground service is enabled by default to maintain operation during lock screen for the 90-minute offline window per Module 7.4.

**Edge Case 1: FV reports an incident but loses network before upload (non-obvious).** At 10:42:17, FV-04 in Hall B witnesses a delegate collapse. They tap "Report Incident", select `category = medical`, the camera captures a photo of the surrounding area (no people in frame, per privacy training), the Mapwize SDK auto-captures `reporter_location = {lat, lng, indoor_floor: 2, indoor_x: 14.3, indoor_y: 22.7, zone_id: hall_b}`. They tap "Submit" at 10:43:05. The venue WiFi in Hall B is congested (plenary in session, 1,800 attendees in the hall) and the cellular backup is also degraded; the upload HTTP request to the BFF fails with a connection timeout. The app creates the local `incident_report` record with `reported_at = 10:43:05` (device timestamp, preserved), `upload_status = pending`, and `upload_retry_count = 0`. The Offline Sync Engine queues the mutation and retries at 10:43:35 (30s). Still failing. Retry at 10:44:35 (60s). Still failing. Retry at 10:46:35 (120s). At 10:46:50, the WiFi recovers (session ends, attendees disperse); the upload succeeds. The server creates the canonical `incident` record with `reported_at` preserved at 10:43:05 (not the upload time of 10:46:50), publishes `incident.created` on Kafka, and the OL's War Room tile and PagerDuty escalation fire from the preserved timestamp. The FV's local record transitions to `upload_status = uploaded` with `merged_into_incident_id` set, and the home-screen "Pending Upload" badge clears. The 3-minute-45-second offline window did not delay triage because the FV also used their radio to verbally call the Zone Lead, who escalated separately; the merged `incident` record (per Module 1.2 dual-reporter merge logic) consolidated both reports within 30 seconds of the second arrival.

**Edge Case 2: Two staff members assigned the same task (non-obvious).** At 11:15, the OL dispatcher creates a task "Escort Minister of Mines from curb to VIP Holding Room B" (`task_type = escort`, `related_dignitary_profile_id = ...`). The OL assigns it to VL-Ahmed (the Minister's assigned VL per Module 2.4) and, in a separate dispatch action 90 seconds later, also assigns it to FV-12 (intending to provide a security escort). The Staff App's task-assignment service detects the duplicate assignment (same `task.id`, now 2 entries in `assigned_persona_ids`), and at the dispatcher's UI shows a modal: "Two staff members are now assigned to this task. Co-assignment may be intentional (e.g., VL + security escort). Please confirm." The dispatcher selects "Confirm Co-Assignment" and enters a reason: "VL-Ahmed handles protocol; FV-12 provides security per PS policy." The `co_assignment_confirmed` flag is set to `true`, the reason is recorded in `audit_log`, and both assignees see the task with a "Co-assigned with: VL-Ahmed / FV-12" indicator. **IF** the dispatcher had instead selected "Reassign", **THEN** the second assignee (FV-12) is removed and the task is reassigned to a different FV. The detection happens at dispatch time, not after-the-fact, to prevent two staff members from showing up at the curb simultaneously (which is a protocol incident for a rank 1-3 dignitary per Module 2.1). For rank 1-2 dignitaries, co-assignment is forbidden entirely: the system rejects the second assignment with "Co-assignment not permitted for protocol_rank 1-2. Use the dedicated motorcade detail (Module 2.3) instead."

### E. Third-Party Integrations

- **Microsoft Teams (chat federation):** Staff App <-> Microsoft Teams Graph API. Each `chat_channel` with `federated_with_teams = true` is mirrored to a corresponding Teams channel; messages sent from the Staff App are replicated to Teams and vice versa. This lets senior staff who live in Teams (OL, ED, FAL) participate without installing the Staff App. Attachment and @mention parity is enforced; some Staff App features (broadcast, ack tracking) are not natively supported in Teams and degrade gracefully to plain messages with a footer "View in FMF Staff App for full features."
- **PagerDuty (incident escalation):** Staff App -> PagerDuty REST API. When an `incident_report` with `category = medical` or `severity_guess IN (s0, s1)` is uploaded, the BFF creates a corresponding PagerDuty incident and stores the `pagerduty_incident_id` in `ext_refs`. PagerDuty's on-call rotation (per Module 1.2) handles medical-doctor and security-detail escalation. Acknowledgment and resolution events from PagerDuty flow back via webhook to update the canonical `incident` record.
- **Zebra TC52 / TC57 SDK (dedicated scanners):** Staff App -> Zebra DataWedge SDK. On Zebra devices, the hardware scan button captures barcodes and QR codes as intents (sub-100ms capture, no camera preview), which is critical for high-volume session check-in. The SDK also enables the foreground service (Android) that maintains operation during lock screen, required for the 90-minute offline window.
- **Mapwize (location-aware task routing):** Staff App <-> Mapwize React Native SDK. Task assignments include the destination zone; the app renders a turn-by-turn route from the FV's current location to the task destination. Geofence-crossing events update `staff_device.last_seen_at` and the OL's heatmap.
- **Microsoft Intune MDM:** Staff App <-> Microsoft Intune MAM SDK. Org-owned devices are enrolled; BYOD devices use Intune MAM (app-level management). Intune enforces PIN, encryption-at-rest, and remote-wipe on staff devices. Conditional access policies block Staff App access on non-compliant devices.
- **Azure AD B2C (identity):** Staff App -> BFF -> Azure AD B2C. Staff identities federate from the org's IdP (e.g., Azure AD) via B2C; the JWT's `roles` claim drives feature gating (FV vs VL vs OL).
- **Twilio (SMS fallback for staff push):** When the Notification Center (Module 7.3) targets a staff segment and push delivery is degraded, Twilio SMS is used as fallback for safety-critical messages only (incident alerts, VIP motorcade arrival). Each staff persona's mobile number (from `staff_persona.contact_phone`) is the SMS target.
- **AWS KMS (PII encryption):** `incident_report.description` and `team_chat_message.message_text` are encrypted at rest via envelope encryption. DEK per `tenant_id`, rotated quarterly.
- **AWS S3 (photo and voice note storage):** Photos and voice notes attached to incident reports and chat messages are uploaded to S3 with server-side encryption (KMS-managed key) and a 30-day auto-delete policy post-event.

### F. UI/UX Notes

- **Home screen (FV):** "Up Next" task card (next task in next 30 min with tappable route), "My Zone" status (occupancy, on-duty FVs count), "Pending Upload" badge (count of incident reports awaiting sync), quick-action buttons: "Scan", "Report Incident", "Chat". Top bar: battery %, network status indicator (online / offline / degraded), shift end time countdown.
- **Home screen (VL):** "My Dignitary" card (current status with the 10 coded values from Module 2.4, next cue countdown, photo), "Status Update" quick-action buttons (4 most-common transitions as large tappable tiles), "Chat with PO" and "Chat with Security Lead" quick actions. Top bar mirrors FV.
- **Home screen (OL):** Ops Dashboard mini-view (4 quadrants: zone occupancy, incident queue, task completion rate, FV on-duty roster). Tap any quadrant for full-screen drill-down. "Broadcast" quick action with zone selector.
- **Scanner view (FV):** Full-screen camera view (or Zebra intent-based capture on TC52) with a green-frame overlay. Result toast: "Access Granted" (green) with attendee first name + photo thumbnail, "Access Denied" (red) with reason code (per Module 6.2), "Already Checked In" (amber) with timestamp of prior scan. Auto-returns to scanner after 3 seconds for high-volume flow.
- **Incident report form (FV/VL):** Single screen, optimized for one-handed use. Category selector (icons, 9 options), severity guess slider (s0/s1/s2/s3/unknown), description text field (optional), photo capture (max 5, with a privacy reminder banner "Do not photograph people; document the scene"), location auto-filled (editable), "Submit" button. Submit is enabled offline; the "Pending Upload" badge appears on home.
- **Zone Lead view:** Roster list of FVs currently assigned to zone (with status indicators: green=online, amber=stale heartbeat, red=offline), real-time occupancy gauge (current/max), "Broadcast to Zone" button, "Dispatch FV" button (opens task-creation flow with zone pre-filled). Tapping an FV opens their chat channel or a direct call link.
- **Task list (FV):** Vertical list of assigned tasks sorted by `due_at`. Each row: title, due time, status (color-coded), tappable for detail. Acknowledge button (sets `acknowledged_at`), Complete button (sets `completed_at`, optional photo).
- **Team chat (all):** Standard chat UX with messages list, input field, attachment picker. Per-channel @mention, message recall within 2 minutes, "ack" button on broadcast messages. Dignitary-specific channels are access-controlled (VL-only for rank 1-2).
- **Offline banner:** Persistent red banner at the top of every screen when offline: "Offline. Scans and incident reports are queued. Last sync: 4m ago." Tappable for sync-engine status detail.

### G. Failure Modes & Offline Behavior

- **Network loss (cellular + WiFi both down):** Full functionality for 90 minutes per Module 7.4. Scans validate against a 10-minute-TTL offline cache of valid credentials (per Module 6.2). Incident reports queue locally with timestamps preserved. Chat messages queue and replay on reconnect. After 90 minutes, the app enters "Degraded Mode" (per Module 7.4 Edge Case 2): scan-only functionality, prominent banner.
- **WebSocket disconnect:** Same fallback as Module 7.1 (exponential backoff, then 15-second polling). For staff, polling is shortened to 5 seconds during active incidents.
- **PagerDuty API unreachable:** Incident reports still create the canonical `incident` record in the War Room (Module 1.2); PagerDuty sync retries on a 60-second interval. Escalation paths fallback to internal Twilio SMS to on-call doctors/security leads.
- **Zebra SDK failure:** On Zebra devices, if the DataWedge service crashes, the app falls back to camera-based scanning (slower, ~1.5s per scan vs 100ms) and surfaces a "Scanner hardware issue. Using camera fallback." toast.
- **Microsoft Teams federation lag:** Teams messages may lag up to 30 seconds behind Staff App messages. Broadcasts and ack tracking are not supported on the Teams side; the footer "View in FMF Staff App for full features" is added automatically.
- **Device battery < 20%:** Sync engine throttles per Module 7.4. Foreground service on Zebra devices is preserved (safety-critical), but background photo upload pauses.
- **MDM non-compliance (BYOD jailbreak detected):** App refuses to launch; surfaces "This device is not compliant with FMF security policy. Contact IT." with a help-desk link. The `staff_device` record is marked `mdm_enrolled = false` server-side.

### H. Acceptance Criteria

- **Given** an FV in Hall B with congested WiFi and cellular, **when** they tap "Submit" on a medical incident report at 10:43:05 with a photo and auto-captured location, **then** the app creates a local `incident_report` record with `upload_status = pending` and `reported_at = 10:43:05`, displays a "Pending Upload" badge on the home screen, retries upload every 30 seconds with exponential backoff, and on successful upload at 10:46:50 preserves the original `reported_at = 10:43:05` in the canonical `incident` record (not the upload time).
- **Given** a dispatcher creating an escort task for a Minister (protocol_rank 3), **when** they assign both VL-Ahmed and FV-12 to the same task within 90 seconds, **then** the system detects the duplicate assignment, displays a co-assignment confirmation modal, requires the dispatcher to confirm intent with a reason recorded in `audit_log`, sets `co_assignment_confirmed = true`, and surfaces a "Co-assigned with: VL-Ahmed / FV-12" indicator on both assignees' task detail screens.
- **Given** a dispatcher creating an escort task for a Head of State (protocol_rank 1), **when** they attempt to assign a second staff member after the VL is already assigned, **then** the system rejects the second assignment with "Co-assignment not permitted for protocol_rank 1-2. Use the dedicated motorcade detail (Module 2.3) instead" and does not create the assignment.
- **Given** a Zone Lead on Hall A with 25 FVs currently on duty, **when** they tap "Broadcast to Zone" and send an urgent message about a session-room change, **then** the message is delivered to all 25 FVs within 5 seconds (via WebSocket for online FVs, queued for offline FVs), the broadcast silences any per-FV mute settings, and the OL's Ops Dashboard logs the broadcast in `audit_log` with the sender, timestamp, and message content.
- **Given** an FV with a Zebra TC52 device and the foreground service enabled, **when** they press the hardware scan button on an attendee's badge QR at peak check-in (1,400 attendees/hour across 12 kiosks + 4 FV mobile scanners), **then** the DataWedge SDK captures the barcode in under 100ms as an intent (no camera preview), the app validates the credential against the 10-minute-TTL offline cache if offline or the access-control service if online, and displays the result toast (granted/denied/already-checked-in) within 2 seconds total.
