> Module 7: Mobile App (Attendee & Staff Facing) -> 7.3 Push Notification Center

## Push Notification Center

### A. Purpose Statement

The Push Notification Center is the operational brain that decides which message reaches which device at which time, across which channel, with what privacy constraint, and how delivery is verified. At FMF scale this means orchestrating up to 12,000 device endpoints (10,000 attendee apps + 400 staff apps + 1,600 kiosk fallback emails), 6 notification categories, 4 scheduling modes, 3 send channels (push, SMS, email), 1 cross-platform orchestrator (Azure Notification Hubs), and a hard contractual SLA: safety-critical notifications must reach their target audience within 30 seconds of dispatch, and session-reminder notifications must reach their audience no later than 14 minutes before session start (15-minute reminder minus 60-second orchestration budget).

The Notification Center is the write-side surface for the `notif.*` Kafka topic prefix per Module 0.1. It consumes inbound events from Modules 1, 2, 3, 4, 5, 6, and 8 (e.g., `incident.created` triggers an incident-alert notification to staff; `meeting.scheduled` triggers a B2B meeting confirmation to both attendees; `session.cancelled` triggers a session-cancellation push to all registered-for-session attendees). It publishes `notif.sent`, `notif.delivered`, `notif.opened`, `notif.delivery.degraded`, and `notif.failed` events back to Kafka for downstream analytics (Module 10 attribution, Module 9 cost tracking). The Notification Center owns the audience-targeting rules, the rate-limit batching logic, the multi-channel fallback chain, and the privacy contract that explicitly distinguishes mandatory safety alerts from opt-in commercial notifications.

### B. User Roles & Permissions

The Notification Center is operated primarily by the OL (operational alerts) and MPL (marketing pushes), with governance by the ED and PO for safety-critical and protocol-gated audiences.

- **Operations Lead (OL):** Primary operator for staff-targeted notifications (incident alerts, VIP motorcade arrival, task dispatch). Write on ad-hoc and event-triggered notifications to staff segments. Read on delivery metrics. Cannot send to attendee audiences without MPL co-approval.
- **Marketing & PR Lead (MPL):** Primary operator for attendee-targeted commercial notifications (session reminders, sponsor promotions, daily highlights). Write on opt-in segments only. Read on delivery metrics and opt-out rates.
- **Event Director (ED):** Read on all notifications sent. Write only via break-glass on Crisis Mode broadcasts (all-hands safety alerts) and on escalating a notification's severity above S2.
- **Protocol Officer (PO):** Write on dignitary-only broadcasts (e.g., "Ministerial Welcome Reception starts in 15 minutes" to protocol_rank 1-3 attendees). Read on dignitary delivery metrics. Cannot send non-protocol notifications.
- **Operations Lead for VIP Liaison broadcasts (VL-pull):** A VL may request an ad-hoc notification to their assigned dignitary via the Shadow App (Module 2.4); the request is auto-approved if the audience is exactly that VL's assigned dignitary and auto-routed to the PO for review if the audience is broader.
- **Registration Manager (RM):** Read on check-in-related notification delivery rates (e.g., "Your badge is ready for pickup"). No write on notification content.
- **Sponsorship Sales Lead (SSL):** Write only on sponsor promotions for their portfolio's sponsors, to the opt-in audience that has consented to that sponsor. Read on delivery metrics for their sponsor portfolio only.
- **Content & Stage Manager (CSM):** Write on session-content notifications (room changes, cancellations) to registered-for-session attendees. Read on delivery and open rates.
- **Matchmaking Concierge (MC):** Write on B2B meeting confirmation notifications to the two attendees involved only. No broadcast rights.
- **Finance & Administration Lead (FAL):** Read-only on per-channel cost (FCM/APNs free, Twilio SMS per-message, SendGrid email per-message) and invoice attribution. No write.
- **ESG & Sustainability Officer (ESGO):** Read on aggregate notification volume for carbon-footprint-of-digital-comms reporting. No write.
- **Exhibitor Portal User (EPU):** No direct access to the Notification Center. Sponsor promotions are submitted via the Sponsor Portal and approved by SSL.
- **Field Volunteer (FV):** No direct access. FVs receive notifications; they do not author them.
- **Attendee (ATT):** Read/write on their own `notification_preferences` (which categories they opt into, per-channel preference). Read on their own notification inbox (last 7 days). Cannot author notifications.

### C. Data Model

`notification_template` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | MPL, OL, CSM, MC, or PO |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{sendgrid_template_id, twilio_content_sid}` |
| `audit_log` | `jsonb[]` | Append-only |
| `template_key` | `text` | e.g., "session_reminder_15min", "incident_alert_s1", "sponsor_promo_opt_in" |
| `category` | `enum[session_reminder, session_cancellation, vip_motorcade_arrival, incident_alert, b2b_meeting_confirmation, sponsor_promotion, daily_highlight, safety_alert, transport_update, post_event_follow_up]` | Drives privacy rules |
| `is_safety_critical` | `bool` | True for safety_alert, incident_alert (staff), session_cancellation; cannot be opted out |
| `default_locale` | `text` | BCP-47, e.g., "en-US" |
| `title_i18n` | `jsonb` | `{en: "...", ar: "...", fr: "...", zh: "...", es: "...", ru: "..."}` |
| `body_i18n` | `jsonb` | Same 6 languages |
| `dynamic_fields` | `jsonb[]` | Field list, e.g., `[{key: "session_name", required: true}]` |
| `ttl_seconds` | `int` | Default 3600; safety_alert = 600 |
| `target_channel_priority` | `enum[push_first, sms_first, email_first]` | Default push_first |

`notification_send` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Operator persona or system |
| `updated_by` | `uuid` | Sender or sync worker |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{triggering_event_id, triggering_kafka_topic}` |
| `audit_log` | `jsonb[]` | Append-only |
| `template_id` | `uuid` | FK -> notification_template.id |
| `template_version` | `int` | Snapshot of template.version at send time |
| `sender_persona_id` | `uuid` | FK -> staff_persona.id or system service account |
| `scheduling_mode` | `enum[pre_scheduled, ad_hoc, event_triggered]` | Per spec |
| `scheduled_send_at` | `timestamptz null` | For pre_scheduled |
| `trigger_event_topic` | `text null` | For event_triggered, e.g., "incident.created" |
| `trigger_event_filter` | `jsonb null` | E.g., `{severity: [s0, s1]}` |
| `audience_kind` | `enum[broadcast_all, segment_persona, segment_registration_type, segment_location, targeted_attendee_ids, segment_dignitary_rank, segment_staff]` | Targeting mode |
| `audience_definition` | `jsonb` | E.g., `{radius_m: 50, zone_id: "hall_a"}` for location |
| `audience_size_at_send` | `int` | Resolved count at send time |
| `audience_resolution_snapshot` | `jsonb` | Resolved attendee IDs (for audit) |
| `status` | `enum[draft, pending_approval, approved, sending, sent, partially_sent, failed, cancelled]` | Lifecycle |
| `approved_by` | `uuid null` | For break-glass or co-approval sends |
| `started_at` | `timestamptz null` | Send loop start |
| `completed_at` | `timestamptz null` | Last recipient processed |
| `cost_estimate_usd` | `numeric(10,2)` | Pre-send estimate (SMS, email charges) |

`notification_delivery` (extends shared columns, per-recipient tracking):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Sender service account |
| `updated_by` | `uuid` | Sync worker |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete (30-day post-event) |
| `ext_refs` | `jsonb` | e.g., `{azure_notification_hub_message_id, fcm_message_id, apns_message_id, twilio_message_sid, sendgrid_message_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `notification_send_id` | `uuid` | FK -> notification_send.id |
| `registration_id` | `uuid` | FK -> registration.id (Module 6.1) |
| `device_platform` | `enum[ios, android, pwa, no_push_token]` | Resolved at send time |
| `primary_channel` | `enum[push_fcm, push_apns, in_app_banner, sms, email]` | Channel actually used |
| `secondary_channel` | `enum[...] null` | Fallback channel if primary failed |
| `delivery_status` | `enum[queued, sent, delivered, opened, bounced, failed, suppressed]` | Lifecycle |
| `sent_at` | `timestamptz null` | Hand-off to channel provider |
| `delivered_at` | `timestamptz null` | Receipt from device SDK |
| `opened_at` | `timestamptz null` | User tap-on-notification |
| `bounced_at` | `timestamptz null` | Channel-provider bounce |
| `failure_reason` | `text null` | E.g., "FCM: 429 quota exceeded" |
| `cost_usd` | `numeric(10,4)` | Per-message cost (SMS/email only) |
| `locale_used` | `text` | BCP-47 actually sent |

`notification_preference` (extends shared columns, per-attendee opt-in):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ATT (self) |
| `updated_by` | `uuid` | ATT or sync engine |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{azure_notification_hub_tag_set_version}` |
| `audit_log` | `jsonb[]` | Append-only |
| `registration_id` | `uuid` | FK -> registration.id |
| `opt_in_session_reminder` | `bool` | Default true; opt-out allowed |
| `opt_in_session_cancellation` | `bool` | Default true; cannot be opted out (safety) |
| `opt_in_b2b_meeting_confirmation` | `bool` | Default true; opt-out allowed |
| `opt_in_sponsor_promotion` | `bool` | Default false; explicit opt-in required per sponsor |
| `opt_in_daily_highlight` | `bool` | Default true; opt-out allowed |
| `opt_in_safety_alert` | `bool` | Default true; cannot be opted out |
| `preferred_channel` | `enum[push, sms, email]` | Default push |
| `preferred_locale` | `text` | BCP-47 override; default from registration |

### D. Business Logic & Edge Cases

- **IF** a notification_template has `is_safety_critical = true`, **THEN** the system refuses to honor `opt_in_* = false` for that category for any attendee; safety-critical notifications are always sent to all affected recipients regardless of preference.
- **IF** a `notification_send` targets `audience_kind = segment_location` (e.g., "everyone within 50m of Hall A"), **THEN** the audience-resolution worker queries the live geofence cache (consumed from `appconfig.geofence` per Module 7.1) for all `registration_id`s with a geofence-crossing event in the target zone within the last 5 minutes, snapshots that list into `audience_resolution_snapshot`, and uses it for the send loop. The snapshot is preserved for audit even after the send completes.
- **IF** the audience size exceeds the FCM/APNs rate limit (default 1,000 recipients/sec per the Notification Hubs tier), **THEN** the send loop batches the send into chunks of 1,000 recipients with a 1-second delay between batches (see Edge Case 1). Each batch's send and delivery status are tracked per-recipient in `notification_delivery` records.
- **IF** a session is cancelled 5 minutes before start time (see Edge Case 2), **THEN** the Notification Center triggers a multi-channel cascade: push to all registered-for-session attendees with `opt_in_session_cancellation = true` (mandatory anyway), SMS to VIPs (protocol_rank 1-3) who have `preferred_channel = sms` or who have no push token, email to all registered attendees as a permanent record, and an in-app agenda update.
- **IF** an event-triggered notification's trigger event arrives (e.g., `incident.created` on Kafka with `severity = s1`), **THEN** the Notification Center consumes the event, resolves the audience (staff in the incident's zone + OL + ED + on-call doctor for medical incidents), constructs a `notification_send` with `scheduling_mode = event_triggered`, and dispatches within 30 seconds of the original Kafka event timestamp.
- **IF** a delivery receipt does not arrive within 5 minutes of `sent_at` for a push notification (per Module 7.1 Edge Case 1), **THEN** the Notification Center publishes `notif.delivery.degraded`, queues an in-app banner payload on the WebSocket, and after 10 more minutes dispatches the SendGrid email fallback.
- **IF** a sponsor promotion send would target an attendee whose `opt_in_sponsor_promotion = false` (or who did not explicitly opt-in to that sponsor), **THEN** the system excludes that attendee from the send and logs the suppression in `audit_log`. Sponsor promotions are double-opt-in: the attendee must opt into the category AND into the specific sponsor.
- **IF** a `notification_send` requires break-glass approval (e.g., broadcast_all during Crisis Mode), **THEN** the send is created in `status = pending_approval` and requires ED + (PO or OL) co-approval before transitioning to `approved` and entering the send loop.

**Edge Case 1: 4,000-recipient segment with 1,000/sec FCM rate limit (non-obvious).** At 10:45:00, the session-reminder scheduler fires for the 11:00 keynote. The audience is all 4,000 attendees who registered for the keynote (`audience_kind = segment_attendee_ids` resolved from Module 4.1 session registrants). The Notification Center's send loop queries the Notification Hubs tier's published rate limit (1,000 sends/sec for the Standard tier) and computes the batch plan: 4 batches of 1,000 recipients each, with a 1-second pause between batches, totaling 4 seconds of wall-clock send time. The loop dispatches batch 1 at 10:45:00.000 (1,000 `notification_delivery` records created with `delivery_status = queued`, then `sent` as Notification Hubs acknowledges the FCM hand-off), batch 2 at 10:45:01.000, batch 3 at 10:45:02.000, batch 4 at 10:45:03.000. As FCM delivery receipts arrive (typically within 30-60 seconds), each `notification_delivery` record transitions from `sent` to `delivered` (or `failed` with `failure_reason = "FCM: 429 quota exceeded"` if FCM itself rate-limits further, in which case the loop pauses for 5 seconds and retries the failed batch). The `notification_send` record transitions to `sent` at 10:45:04.000 and `completed_at` is set when the last receipt arrives (typically 10:46:00). The send loop publishes `notif.sent` at dispatch and `notif.delivered` per-recipient as receipts arrive, all on the `notif.*` Kafka topic. **IF** a recipient's device is offline or in Doze mode (Android), the FCM delivery receipt may be delayed up to 24 hours; the watchdog (per Module 7.1 Edge Case 1) flags it as `delivery_degraded` at the 5-minute mark and triggers the email fallback cascade. The per-recipient `cost_usd` is 0 for FCM (free tier) but the analytics pipeline aggregates total SMS/email fallback costs and attributes them to FAL's cost center per Module 9.

**Edge Case 2: Session cancelled 5 minutes before start time (non-obvious).** At 10:55:00, CSM cancels the 11:00 keynote due to a speaker medical emergency. The Content service publishes `session.cancelled` on the `session.*` Kafka topic (Module 4.1). The Notification Center consumes the event within 5 seconds (10:55:05), resolves the audience (4,000 registered attendees from Module 4.1 session_registrant table, plus all staff assigned to the keynote zone from Module 8), and constructs a `notification_send` with `template_id = session_cancellation`, `scheduling_mode = event_triggered`, `audience_kind = segment_attendee_ids`. The send loop runs in three parallel cascades:

1. **Push cascade (priority 1):** For all attendees with `opt_in_session_cancellation = true` (which is mandatory and cannot be opted out) AND a valid `push_token` (3,200 attendees), the loop dispatches a `safety_alert` priority FCM message (Android high-priority to bypass Doze) and an APNs `push-type = alert` (iOS). Batched at 1,000/sec, completes by 10:55:09 (4 seconds).
2. **SMS cascade (priority 2):** For VIPs (protocol_rank 1-3, ~120 attendees) who have `preferred_channel = sms` OR have `push_token = null` (per their `notification_preference`), the loop dispatches a Twilio Programmable SMS to their `registration.contact_phone`. The SMS template includes the session name and a link to the updated agenda (`app.fmf.example/agenda`). SMS cost is tracked per message (~US$ 0.05 per SMS to Saudi numbers, US$ 0.11 to international). Total SMS cost for this send: ~US$ 6.60 for 120 VIPs, attributed to FAL.
3. **Email cascade (priority 3):** For all 4,000 attendees, the loop dispatches a SendGrid email (using the `session_cancellation` template) as a permanent record. SendGrid handles batching internally; the email is delivered within 5 minutes.

The in-app agenda is updated via the WebSocket broadcast (consumed from the same `session.cancelled` event by the Mobile BFF) within 2 seconds of the original event, so attendees in the app see the cancelled status before they see the push notification. The OL's War Room tile shows the live delivery progress: "Session Cancellation (Keynote 11:00): 4000 recipients, 3200 push sent, 1200 delivered, 120 SMS sent, 4000 email queued. SLA: 30 sec for push, 5 min for SMS, 5 min for email." The full send completes within 6 minutes of the original cancellation event. The CSM records the speaker medical emergency as a separate `incident` record (per Module 1.2), which triggers its own incident-alert notification to medical staff via a parallel send.

### E. Third-Party Integrations

- **Azure Notification Hubs (cross-platform orchestration):** Notification Center -> Azure Notification Hubs REST API. Single send-point; routes to APNs (iOS) and FCM (Android) based on registered `PushChannelHandle`. Tags per `tenant_id`, `event_id`, `registration_id`, and `notification_category` enable audience targeting. Per-recipient send telemetry (queued, sent, delivered, failed) flows back via a webhook into the `notif.*` Kafka topic. Rate limit: 1,000 sends/sec on the Standard tier.
- **Firebase Cloud Messaging (Android push):** Notification Hubs -> FCM v1 HTTP API. High-priority messages for `is_safety_critical = true` notifications bypass Android Doze. The FCM SDK on device delivers the message; the SDK calls back to the Notification Center with a delivery receipt via the BFF's `/v1/push/receipt` endpoint.
- **Apple Push Notification service (iOS push):** Notification Hubs -> APNs HTTP/2. `push-type = alert` for normal notifications, `push-type = background` for silent content-update pushes (e.g., agenda refresh). APNs feedback service (disabled tokens) polled every 6 hours; disabled tokens update `app_install.push_opt_in_state = revoked` (per Module 7.1).
- **Twilio Programmable SMS (SMS fallback):** Notification Center -> Twilio REST API. Used for safety-critical notifications to VIPs (per Edge Case 2) and to attendees whose `preferred_channel = sms` or who have no push token. Per-message cost tracked in `notification_delivery.cost_usd` and aggregated to FAL.
- **SendGrid Email API (email fallback):** Notification Center -> SendGrid v3 Mail Send. Used for permanent-record notifications (session cancellations, B2B meeting confirmations) and as a last-resort fallback when push and SMS both fail. Templates versioned in SendGrid with `notification_id` and `event_id` dynamic data. Idempotency key on `sendgrid_message_id` prevents duplicate sends on retry.
- **Internal analytics pipeline (delivery rate tracking):** Notification Center -> ClickHouse (per Module 0.1 analytics store). Every `notification_delivery` record's state transitions are streamed to ClickHouse for real-time delivery-rate dashboards (per-channel, per-template, per-locale). SLA watchdog alerts the OL if delivery rate drops below 95% for safety-critical notifications within the 30-second window.
- **Microsoft Teams (staff notification mirroring):** For staff-targeted notifications (incident alerts, VIP motorcade arrival), the message is also mirrored to the relevant Teams channel (per Module 7.2 chat federation) so that senior staff not using the Staff App still receive it.
- **PagerDuty (incident-alert escalation):** For `incident_alert` notifications with `severity_guess IN (s0, s1)`, the Notification Center also creates a PagerDuty incident (per Module 1.2 and Module 7.2 integration) for on-call escalation.

### F. UI/UX Notes

- **Notification authoring (OL/MPL):** Template selector (from `notification_template` list), audience selector (broadcast / segment / location radius + zone / targeted IDs), scheduling selector (pre-scheduled with datetime picker / ad-hoc / event-triggered with topic + filter), channel priority (push-first / sms-first / email-first), preview pane (renders the template with sample dynamic fields in all 6 locales), cost estimate widget ("Est. 4,000 recipients, ~US$ 220 SMS fallback cost if all push fails"), approval flow indicator (if break-glass required).
- **Audience location selector:** A Mapwize mini-map showing the venue; operator draws a radius circle around a zone or pin; the audience-resolution preview shows the count of currently-in-zone attendees (e.g., "1,847 attendees currently within 50m of Hall A").
- **Send dashboard (OL/MPL):** Live send progress per `notification_send`: a horizontal bar chart with queued / sent / delivered / opened / failed segments; per-recipient drill-down table (filterable by status). SLA timer showing elapsed vs target.
- **Attendee notification inbox (in Attendee App):** A vertical list of last 7 days of notifications, grouped by day, with status icons (read / unread). Tapping a notification opens the deep-linked destination (session detail, meeting detail, sponsor profile).
- **Attendee preference screen:** Toggles for each opt-in/out category (with safety_alert toggle disabled and a tooltip "Safety alerts cannot be turned off"). Channel preference (push / sms / email) radio. Locale override dropdown. Per-sponsor opt-in list (each sponsor the attendee has interacted with).
- **Notification received UX (attendee in-app):** In-app banner drops from the top with the notification title, a snippet of the body, and a tap-to-open action. Banner auto-dismisses after 8 seconds if not tapped; remains in the inbox.
- **Notification received UX (attendee lock screen):** Standard iOS / Android lock-screen notification with the title and body. Tap deep-links into the app to the destination. Long-press shows quick actions (e.g., "Add to agenda" for session reminders).

### G. Failure Modes & Offline Behavior

- **Azure Notification Hubs outage:** The Notification Center detects the outage via the heartbeat endpoint (polled every 30 seconds). If down, it falls back to direct FCM and APNs API calls (bypassing the Hub's orchestration), losing the tag-based audience targeting but preserving delivery. The fallback is gated by LaunchDarkly flag `notif_hub_direct_fallback`.
- **FCM rate-limit exceeded (429 response):** The send loop pauses for 5 seconds, retries the failed batch, and logs the rate-limit event. If 3 consecutive batches fail, the loop escalates to the OL with a "FCM rate limit exceeded. Consider switching to email fallback for remaining recipients?" prompt.
- **APNs feedback service delays (disabled-token detection):** Disabled tokens may not be detected for up to 6 hours (APNs polling cadence). During that window, sends to those tokens will return `delivery_status = bounced` on the APNs response; the system updates `push_opt_in_state = revoked` immediately on bounce (not waiting for the feedback poll).
- **Twilio SMS outage:** SMS fallback fails. The Notification Center routes safety-critical messages through SendGrid email and marks `delivery_status = suppressed` for SMS with `failure_reason = "Twilio unreachable"`. The OL is paged.
- **SendGrid email outage:** Email fallback fails. Safety-critical notifications rely on push (with retry) and in-app WebSocket banner. Non-critical notifications are queued in a Kafka DLQ and replayed on SendGrid recovery.
- **Audience-resolution latency spike (live geofence cache lag):** For `segment_location` sends, if the geofence cache (consumed from `appconfig.geofence`) is stale by more than 2 minutes, the Notification Center warns the operator: "Audience resolution may include attendees who left the zone up to 2 minutes ago. Send anyway?" The operator can re-resolve or send with the warning.
- **Kafka consumer lag (event-triggered notification delay):** If the Notification Center's Kafka consumer on `incident.created` lags more than 10 seconds, the SLA watchdog alerts the OL. The OL may trigger the notification manually via the ad-hoc send UI.

### H. Acceptance Criteria

- **Given** a pre-scheduled `notification_send` for a session reminder 15 minutes before an 11:00 keynote with 4,000 registered attendees, **when** the scheduler fires at 10:45:00, **then** the send loop batches the send into 4 chunks of 1,000 recipients each, dispatches them over 4 seconds, creates 4,000 `notification_delivery` records with `delivery_status = queued` transitioning to `sent`, and publishes `notif.sent` on Kafka with the resolved audience snapshot preserved in `audience_resolution_snapshot`.
- **Given** a session cancelled by the CSM 5 minutes before start time with 4,000 registered attendees including 120 VIPs (protocol_rank 1-3), **when** the `session.cancelled` event is consumed by the Notification Center, **then** the system dispatches push notifications to all attendees with valid push tokens (within 30 seconds), SMS to the 120 VIPs via Twilio (within 5 minutes), email to all 4,000 attendees via SendGrid (within 5 minutes), and updates the in-app agenda via WebSocket broadcast within 2 seconds of the original event.
- **Given** an attendee who has set `opt_in_sponsor_promotion = false`, **when** a sponsor promotion send is dispatched to the opt-in audience for that sponsor, **then** the system excludes the attendee from the send, logs the suppression in `audit_log`, and the attendee does not receive the notification via any channel (push, SMS, or email).
- **Given** an attendee who attempts to set `opt_in_safety_alert = false` in their notification preferences, **when** they toggle the switch in the Attendee App, **then** the toggle is disabled with a tooltip "Safety alerts cannot be turned off" and the underlying `notification_preference.opt_in_safety_alert` remains `true` in the database.
- **Given** a `notification_send` targeting `audience_kind = segment_location` with `audience_definition = {radius_m: 50, zone_id: "hall_a"}`, **when** the audience-resolution worker queries the live geofence cache, **then** the resolved audience is the list of `registration_id`s with a geofence-crossing event in Hall A within the last 5 minutes, the count is displayed to the operator before send confirmation, and the snapshot is preserved in `audience_resolution_snapshot` for audit.
