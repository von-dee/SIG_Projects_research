> Module 2: VIP & Diplomatic Protocol Management -> 2.4 VIP Liaison Shadow App

## VIP Liaison Shadow App

### A. Purpose Statement

The VIP Liaison Shadow App is a mobile application surface (React Native, iOS and Android) used by the VIP Liaison (VL) persona, who is assigned 1:1 to a specific dignitary or delegation for the duration of the event. The VL uses the app to relay real-time status updates ("Motorcade arrived", "In holding room", "On stage in 90 seconds") to the Protocol Officer (PO) and the War Room, to communicate with the PO and the assigned security lead, and to access the dignitary's brief (schedule, dietary needs, language preferences, "do not mention" notes). At FMF scale, where 60+ ministerial-level dignitaries move simultaneously through multiple venues, the protocol team physically cannot escort each one; the VL-and-Shadow-App model is the deputized extension of protocol authority, and the app is the instrument that keeps every shadow's status, comms, and brief synchronized and auditable.

### B. User Roles & Permissions

The VL app is the most tightly scoped user surface in the platform. A VL can see only their assigned dignitary's data, and only the fields explicitly granted by the PO. All other data is hidden at the API gateway (OPA policy on `dignitary_id` claim in the JWT).

- **Event Director (ED):** No direct use of the app; sees VL status updates aggregated in the War Room dashboard. Can authorize reassignment of a VL via break-glass.
- **Operations Lead (OL):** No direct use. Sees VL status updates in aggregate in the War Room.
- **Protocol Officer (PO):** Configures VL assignments, briefs the VL via the app's brief section, monitors VL status feed in real time. Read/write on the VL's assignment, brief fields, and communication channels. Can revoke VL access mid-event.
- **VIP Liaison (VL):** Primary user. Read on assigned dignitary's profile (restricted fields), schedule, dietary, language, and "do not mention" notes. Write on dignitary status updates (with audit trail and 60-second reversibility for "On stage" taps), chat messages, and shared photos. Cannot modify protocol rank, seating, motorcade manifests, or security assignments.
- **Registration Manager (RM):** No access.
- **Sponsorship Sales Lead (SSL):** No access.
- **Exhibitor Portal User (EPU):** No access.
- **Content & Stage Manager (CSM):** Read-only on VL status updates for the next 30 minutes (used to time stage cues). Cannot chat with VL.
- **Matchmaking Concierge (MC):** No access.
- **Finance & Administration Lead (FAL):** No access.
- **Marketing & PR Lead (MPL):** No access.
- **ESG & Sustainability Officer (ESGO):** No access.
- **Field Volunteer (FV):** No access. FVs receive direction from the PO or OL, not from VLs.
- **Attendee (ATT):** No access.

### C. Data Model

`vl_assignment` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (PO) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{device_attestation_id, hardware_key_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `vl_user_id` | `uuid` | FK -> user.id (Azure AD B2C) |
| `dignitary_id` | `uuid` | FK -> dignitary_profile.id |
| `delegation_id` | `uuid null` | FK -> delegation.id if VL covers whole delegation |
| `assigned_at` | `timestamptz` | UTC |
| `assigned_by` | `uuid` | PO user id |
| `revoked_at` | `timestamptz null` | When VL access was revoked |
| `revoked_by` | `uuid null` | Actor |
| `revoke_reason` | `text null` | Required if revoked mid-event |
| `device_id` | `text` | Hardware attestation ID from iOS DeviceCheck or Android Play Integrity |
| `device_attested_at` | `timestamptz` | Last successful attestation |
| `encryption_key_id` | `uuid` | FK -> kms_key.id; derived from VL auth token + device attestation |
| `status` | `enum[assigned, active, paused, revoked]` | Lifecycle |

`dignitary_status_update` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (VL) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{war_room_tile_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `dignitary_id` | `uuid` | FK -> dignitary_profile.id |
| `vl_assignment_id` | `uuid` | FK -> vl_assignment.id |
| `status_value` | `enum[motorcade_departed, motorcade_arrived, in_security_screening, in_holding_room, en_route_to_stage, on_stage, off_stage, in_meeting, meal_break, departed_venue]` | Coded status |
| `status_label` | `text` | Human-readable, e.g., "On stage in 90 seconds" |
| `status_at` | `timestamptz` | When the VL tapped the button (preserved across offline/online transitions) |
| `status_received_at` | `timestamptz` | When the server actually received the update (may differ from `status_at` if offline) |
| `lat` | `numeric(10,7) null` | Optional GPS at time of tap |
| `lng` | `numeric(10,7) null` | Optional GPS |
| `is_reversed` | `bool` | True if VL reversed the status within 60 seconds |
| `reversed_at` | `timestamptz null` | When reversed |
| `reversal_reason` | `text null` | Required if reversed after 60s (break-glass) |
| `transmission_path` | `enum[online, offline_cached]` | Whether this update was sent immediately or cached |

`vl_chat_message` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Sender (VL, PO, or security lead) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete (retention 7 years for diplomatic audit) |
| `ext_refs` | `jsonb` | e.g., `{thread_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `thread_id` | `uuid` | Conversation thread (VL + PO + security lead) |
| `sender_user_id` | `uuid` | FK -> user.id |
| `recipient_user_ids` | `uuid[]` | FK -> user.id (typically PO + security lead) |
| `message_body` | `text` | Encrypted at column level with VL key |
| `message_kind` | `enum[text, status_share, photo, voice_note, system]` | Type |
| `photo_s3_key` | `text null` | Encrypted object key (if message_kind = photo) |
| `voice_duration_seconds` | `int null` | If voice note |
| `sent_at` | `timestamptz` | When VL tapped send (preserved offline) |
| `received_at` | `timestamptz null` | When server received |
| `delivered_at` | `timestamptz null` | When delivered to recipient app |
| `read_at` | `timestamptz null` | When recipient opened |

`dignitary_brief` (extends shared columns, one row per dignitary):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (PO) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{mfa_briefing_doc_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `dignitary_id` | `uuid` | FK -> dignitary_profile.id |
| `schedule_summary` | `jsonb` | Ordered array of `{ts, label, location, cue_id}` |
| `dietary_needs` | `jsonb` | e.g., `{halal: true, allergies: ["shellfish"], preference: "low_sodium"}` |
| `language_preferences` | `text[]` | ISO 639-1 ordered |
| `interpreter_assigned` | `bool` |
| `interpreter_name` | `text null` | Encrypted |
| `interpreter_phone_e164` | `text null` | Encrypted |
| `do_not_mention` | `jsonb` | Encrypted; e.g., `[{topic: "recent_election_dispute", context: "...", added_at: "..."}]` |
| `cultural_notes` | `jsonb` | e.g., `{greeting_style: "handshake_only", prayer_times_observed: true}` |
| `emergency_contacts` | `jsonb` | Encrypted array |
| `briefing_last_refreshed_at` | `timestamptz` | When PO last updated the brief |
| `briefing_signature_required` | `bool` | If true, VL must acknowledge reading the brief |

`vl_audit_event` (specialized audit; appended on every status tap, message send, photo share, brief view):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{correlation_id, trace_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `vl_assignment_id` | `uuid` | FK -> vl_assignment.id |
| `event_kind` | `enum[status_tap, status_reverse, chat_send, chat_read, photo_share, brief_view, brief_acknowledge, offline_reconnect, device_attestation, auth_failure]` |
| `event_payload` | `jsonb` | Encrypted |
| `occurred_at` | `timestamptz` | Client-side timestamp |
| `received_at` | `timestamptz` | Server receipt timestamp |
| `device_id` | `text` |
| `network_state` | `enum[online, offline, degraded]` | When the event was generated |

### D. Business Logic & Edge Cases

- **IF** a VL taps "On stage" and then taps "Reverse" within 60 seconds, **THEN** the system marks the original status update `is_reversed = true`, preserves both the original and reversal timestamps, and emits a `vip.status.reversed` event. No break-glass is required within the 60-second window.
- **IF** a VL attempts to reverse a status tap after 60 seconds, **THEN** the system requires break-glass approval (VL requests, PO approves) with a mandatory `reversal_reason`, and the reversal is logged as a higher-severity audit event.
- **IF** the VL's device loses connectivity (e.g., entering an elevator or a holding room with poor cellular), **THEN** the app caches all status taps and chat messages in a local SQLite store with their original `status_at` / `sent_at` timestamps, and on reconnect transmits them in order with `transmission_path = offline_cached`. The server preserves the original timestamps in `status_at` / `sent_at` and records the receipt time in `received_at`.
- **IF** two cached updates conflict (e.g., VL tapped "In holding room" at 08:14 and "On stage" at 08:16 while offline, then reconnected at 08:20), **THEN** the system accepts both in timestamp order and surfaces the sequence to the PO and CSM with an "Offline sequence" indicator.
- **IF** a VL attempts to view a brief that has not been signed/acknowledged within the required window (default 30 minutes before the dignitary's first scheduled cue), **THEN** the app blocks further status updates until the VL taps "Acknowledge Brief".
- **IF** the PO revokes a VL's assignment mid-event, **THEN** the app immediately disables write actions, hides the brief, displays a "Contact Protocol Office" screen, and emits `vl.assignment.revoked` for audit.
- **IF** the VL shares a photo, **THEN** the photo is uploaded to an encrypted S3 bucket, the object key is stored in `vl_chat_message.photo_s3_key`, and the photo is auto-deleted after 7 days (configurable per tenant; FMF default is 7 days for diplomatic sensitivity).
- **IF** the VL's device fails device attestation (DeviceCheck or Play Integrity), **THEN** the app refuses to decrypt the brief or send status updates, displays a "Device not verified" screen, and emits `vl.device.attestation_failed`.
- **IF** the dignitary's `protocol_rank` changes mid-event (from Module 2.1), **THEN** the VL receives a push notification with the new rank, the brief is updated with any new "do not mention" notes within 60 seconds, and the app surfaces a confirmation banner.

**Edge case (non-obvious): VL accidentally taps "On stage" while the dignitary is still in the holding room.** Within the 60-second reversal window, the VL taps "Reverse", the original status is marked `is_reversed = true`, and the PO and CSM see the reversal in real time with a "Reversed by VL" label. If the CSM had already advanced the ROS cue based on the original tap, the system auto-pauses the next cue and surfaces a "Status reversal: hold the cue" alert to the CSM with a 30-second decision timer.

**Edge case (non-obvious): VL is offline for 25 minutes in a holding room with no signal, while the dignitary has progressed through three status changes.** The cached updates include "In holding room", "En route to stage", and "On stage". On reconnect at 09:05, the app transmits all three with their original timestamps (08:40, 08:55, 09:02). The server replays them in order, and the PO and War Room see a "Replay" indicator showing the sequence with their original timestamps. The CSM's ROS engine reconciles its cue state against the now-complete status history and surfaces any drift.

**Edge case (non-obvious): VL's device is lost or stolen.** The PO triggers "Revoke VL access" from the PO console, which invalidates the VL's JWT, marks the device attestation as revoked, and forces the encryption key to be re-derived on the next auth (which will fail because the device is no longer attested). The PO reassigns the VL role to a backup VL with a new device and new encryption key.

### E. Third-Party Integrations

- **Azure AD B2C:** Identity provider for the VL account. OIDC with PKCE; refresh tokens rotated every 60 minutes; conditional access policies require device compliance (Microsoft Intune) and MFA at login.
- **Microsoft Intune (MDM):** Device management for VL-issued phones (typically corporate-issued, not BYOD). Enforces passcode, encryption-at-rest, and remote-wipe. Pushes the Shadow App via Intune Company Portal.
- **Apple DeviceCheck / Google Play Integrity:** Device attestation. The app calls DeviceCheck/Play Integrity on launch and every 4 hours; the attestation token is sent to the server and verified before the brief is decrypted. Data flow: app -> Apple/Google attestation service (outbound) -> app -> server (attestation token) -> server verifies with Apple/Google (outbound).
- **AWS KMS:** The VL encryption key is derived from a combination of the VL's auth token (short-lived) and the device attestation (device-bound). The DEK is wrapped by an AWS KMS customer-managed key with a 90-day rotation policy.
- **Twilio Programmable Chat (or Twilio Conversations):** Powers the chat thread. Data flow: bidirectional via Twilio Conversations API; messages also mirrored to the `vl_chat_message` table for audit and 7-year retention.
- **Twilio Programmable Voice:** If a chat message is urgent and unread for more than 2 minutes, the system triggers an automated voice call to the VL. Data flow: system -> Integration Hub -> Twilio Voice (outbound).
- **AWS S3 (encrypted with VL key):** Photo storage for shared photos. Auto-delete lifecycle rule at 7 days.
- **Mapwize / Situm:** Indoor positioning. The VL app can optionally capture indoor position when a status tap is logged, used to verify the dignitary is in the expected zone. Data flow: Mapwize SDK (in-app) -> server (lat/lng with status tap).
- **Microsoft Graph (calendar sync):** VL's calendar shows the dignitary's schedule mirrored from the PO's calendar. Read-only.
- **SendGrid (email fallback):** If push notifications to the VL fail (e.g., APNs/FCM unavailable), critical alerts are sent via email to the VL's corporate email.
- **Apple Push Notification service (APNs) / Firebase Cloud Messaging (FCM):** Push delivery to iOS and Android respectively.
- **OpenSearch:** Full-text search across the VL audit trail (7-year retention) for post-event protocol review.
- **Kafka topics:** Publishes `vl.status.tapped`, `vl.status.reversed`, `vl.chat.sent`, `vl.chat.read`, `vl.photo.shared`, `vl.brief.viewed`, `vl.brief.acknowledged`, `vl.assignment.revoked`, `vl.device.attested`, `vl.offline.reconnected`. Subscribes to `vip.protocol_rank.changed` (re-derive brief), `transport.motorcade.arrived` (auto-suggest status tap), `seating.assignment.changed` (update brief schedule).

### F. UI/UX Notes

The app has four primary tabs accessible from a bottom navigation bar: Status, Brief, Chat, and Map.

**Status tab** is the default landing screen. It shows a vertical list of the dignitary's upcoming cues (pulled from the brief's schedule_summary) with the next cue highlighted. Below each cue is a row of large tap-target buttons corresponding to the valid status transitions for that cue ("Motorcade arrived", "In security screening", "In holding room", "En route to stage", "On stage"). Each tap triggers a confirmation modal showing the status label and a 60-second countdown during which a "Reverse" button is prominently displayed. After 60 seconds, the "Reverse" button is replaced by "Request reversal" which opens the break-glass flow.

**Brief tab** shows the dignitary's profile summary (photo, name, title, country, rank chip), followed by collapsible sections: Schedule, Dietary, Language, Cultural Notes, Do Not Mention, Emergency Contacts. The "Do Not Mention" section is visually distinguished with a warning icon and requires a tap-to-expand gesture to prevent accidental reading aloud. A "Brief last refreshed" timestamp and an "Acknowledge" button sit at the top.

**Chat tab** shows a single thread with the PO and the security lead. Messages are timestamped; offline-cached messages show a "Cached" badge until acknowledged. A photo-attach button (camera or library) and a voice-note button are available. Urgent messages can be flagged with a long-press "Mark urgent" which triggers the Twilio Voice fallback if unread in 2 minutes.

**Map tab** shows the venue's indoor map (Mapwize) with the dignitary's current expected zone highlighted. A "I am here" button lets the VL capture their current indoor position and submit it with a status tap.

A persistent banner at the top of the app shows the connectivity state: "Online", "Degraded (X cached updates pending)", or "Offline (X cached updates pending)". When offline, the banner turns amber and a "Last sync: X minutes ago" timestamp appears.

### G. Failure Modes & Offline Behavior

- **Cellular/Wi-Fi connectivity loss (e.g., elevator, basement holding room):** The app caches all status taps, chat messages, and photo shares in local SQLite with original timestamps. On reconnect, the app transmits in timestamp order. The cache has a 7-day TTL; if not transmitted within 7 days, the cache is dropped and the events are lost (with an audit entry recording the loss). The app displays a clear offline banner at all times.
- **APNs/FCM push delivery failure:** The server retries push delivery 3 times with exponential backoff (10s, 30s, 90s). If all retries fail, the system triggers an email via SendGrid and (for urgent messages) a Twilio Voice call.
- **DeviceCheck/Play Integrity attestation failure:** The app refuses to decrypt the brief or send updates; displays a "Device not verified" screen with a "Contact Protocol Office" button. The PO is notified via the PO console and a PagerDuty alert if the VL is mid-event.
- **AWS KMS key unavailable:** The app cannot decrypt the brief or chat history; displays a "Brief locked" screen. The app continues to accept status taps (which are queued locally) but cannot transmit them until KMS recovers, because the messages need to be encrypted before transmission.
- **Twilio Conversations API outage:** The app falls back to a direct REST API for chat messages (with the same encryption). Messages are mirrored to the `vl_chat_message` table via a reconciler that runs every 60 seconds during outage and on recovery.
- **Azure AD B2C token refresh failure:** The app enters a "Read-only" mode for 15 minutes during which the VL can view the brief and receive (but not send) chat messages; after 15 minutes, the app forces re-authentication. If B2C is still down, break-glass single-use codes are issued via the PO console.
- **VL's device lost or stolen:** The PO triggers "Revoke VL" from the console; the device's tokens are invalidated, the device attestation is revoked, and a remote-wipe command is sent via Intune (if the device was corporate-issued and Intune-managed).
- **Server-side Kafka producer failure:** Status updates are queued in the Mobile BFF's local store and replayed on recovery. The PO console shows a "VL sync degraded" indicator.
- **Two VLs assigned to the same dignitary (misconfiguration):** The system detects the duplicate assignment at write time and refuses the second assignment with an error naming the existing VL. The PO must revoke the first VL before assigning a new one.

### H. Acceptance Criteria

- **Given** the VL taps "On stage" at 09:02:00 and then taps "Reverse" at 09:02:45, **When** the reversal is processed, **Then** the original status update is marked `is_reversed = true`, both timestamps are preserved, the PO and CSM see a "Reversed by VL" indicator within 5 seconds, and the CSM's ROS engine auto-pauses the next cue for 30 seconds with a "Status reversal" alert.
- **Given** the VL enters a no-signal elevator at 08:40 and exits at 09:05, during which time they tapped "In holding room" (08:42), "En route to stage" (08:55), and "On stage" (09:02), **When** the device reconnects at 09:05, **Then** all three updates are transmitted in timestamp order with `transmission_path = offline_cached`, the server preserves the original `status_at` timestamps, and the PO and War Room see a "Replay" indicator showing the offline sequence.
- **Given** the VL taps "Acknowledge Brief" 30 minutes before the dignitary's first scheduled cue, **When** the brief has been updated by the PO since the VL last viewed it, **Then** the app requires the VL to re-acknowledge the updated brief before permitting any new status taps.
- **Given** the VL's device fails device attestation (DeviceCheck/Play Integrity), **When** the app next attempts to refresh the brief, **Then** the app refuses to decrypt the brief, displays a "Device not verified" screen, and emits a `vl.device.attestation_failed` audit event within 10 seconds.
- **Given** the PO revokes a VL's assignment mid-event, **When** the revocation is committed, **Then** the VL's JWT is invalidated within 30 seconds (next refresh), the app disables write actions, the brief is hidden behind a "Contact Protocol Office" screen, and the `vl.assignment.revoked` audit event is captured with the PO's identity and a mandatory `revoke_reason`.
