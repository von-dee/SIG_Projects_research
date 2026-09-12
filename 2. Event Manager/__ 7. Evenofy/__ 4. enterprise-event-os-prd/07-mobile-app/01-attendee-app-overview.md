> Module 7: Mobile App (Attendee & Staff Facing) -> 7.1 Attendee App Overview

## Attendee App Overview

### A. Purpose Statement

The Attendee App is the single surface a Future Minerals Forum participant uses from the moment they confirm registration until the moment they board their return flight. It must serve a Head of State walking into the plenary, a junior investor navigating between B2B pods, a Mandarin-speaking sponsor delegate, and a wheelchair user routing via elevators, all from the same React Native binary. At FMF scale this means 10,000+ concurrent app sessions across three days, 100+ sovereign delegations, 60+ ministerial speakers, multi-venue indoor navigation, and US$ 9B+ in deal-related meetings whose confirmation flows transit the app.

The app is published to the Apple App Store (iOS 15+) and Google Play (Android 10+) with a parallel PWA fallback at `app.fmf.example` for delegates who cannot or will not install a native binary (e.g., government-issued devices locked to MDM with no consumer app store). The app is the read-side surface for Modules 1, 2, 3, 4, 5, and 6; it consumes `registration.confirmed`, `meeting.scheduled`, `session.published`, `credential.granted`, `badge.issued`, and `notif.*` Kafka events through a Mobile BFF (6 instances, 2 vCPU / 4 GB RAM per Module 0.1) and republishes attendee-originated mutations (agenda stars, B2B match requests, session ratings) onto `appconfig.*` for downstream consumers. The app's non-negotiable contract is that a confirmed attendee who lands at the host airport without a printed badge can still use the app to display a rotating QR for entry, navigate to their first session, request a B2B match, and receive a real-time session-room change, all within 90 seconds of opening the app for the first time.

### B. User Roles & Permissions

The Attendee App is the ATT persona's primary surface, but several other personas interact with it for read-only visibility or delegated action.

- **Attendee (ATT):** Primary. Read/write on own profile, own agenda, own meeting requests, own session ratings. Read on published agenda, own badge QR, own credentials, venue map, speaker list, sponsor/exhibitor directory. Cannot see other attendees' PII beyond what is explicitly consented (e.g., a confirmed B2B match reveals the counterpart's name and company).
- **Event Director (ED):** Read-only on app config, push notification templates, and aggregate app usage analytics. Write only via break-glass on app-wide feature flags (e.g., global "Crisis Mode" banner).
- **Operations Lead (OL):** Read on app adoption, active sessions, push delivery rates. No write on attendee-facing content.
- **Protocol Officer (PO):** Read on dignitary app sessions (which dignitary is logged in, last-seen location if dignitary has consented to indoor positioning). Write on dignitary-only broadcast list (e.g., push to all protocol_rank 1-3 attendees).
- **VIP Liaison (VL):** Read on assigned dignitary's app activity (last-opened, last-page) to anticipate needs. No write on the attendee app itself; the VL operates the parallel Shadow App (Module 2.4 / Module 7.2).
- **Registration Manager (RM):** Read on app adoption funnel (registration.confirmed -> app_first_opened). No write.
- **Sponsorship Sales Lead (SSL):** Read on sponsor-published promotion delivery metrics. Write only on opt-in sponsor push list per sponsor_deal.
- **Exhibitor Portal User (EPU):** Uses the Sponsor Portal (web), not the Attendee App. Read-only mirror of the Attendee App's sponsor directory entry for their own company.
- **Content & Stage Manager (CSM):** Write on session metadata, speaker bios, room assignments (consumed by app via `session.published`). Read on session attendance and in-app rating aggregates.
- **Matchmaking Concierge (MC):** Read on B2B match-request volume per attendee. Write only on flagged match requests requiring human review.
- **Finance & Administration Lead (FAL):** Read-only on sponsor push promotion invoices. No write on app content.
- **Marketing & PR Lead (MPL):** Write on app-marketing push campaigns (opt-in audience). Read on app adoption by persona and country for campaign attribution.
- **ESG & Sustainability Officer (ESGO):** Read on aggregate session-attendance counts for venue carbon-footprint-per-attendee calculation. No write.
- **Field Volunteer (FV):** Uses the Staff App (Module 7.2), not the Attendee App. May use the Attendee App in a "read-only demo" mode for troubleshooting.

### C. Data Model

`app_install` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ATT (self) |
| `updated_by` | `uuid` | ATT or sync service |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete (uninstall + 90-day retention) |
| `ext_refs` | `jsonb` | e.g., `{azure_notification_hub_handle, firebase_instance_id, apns_token}` |
| `audit_log` | `jsonb[]` | Append-only |
| `registration_id` | `uuid` | FK -> registration.id (Module 6.1) |
| `device_platform` | `enum[ios, android, pwa]` | PWA recorded when no native push token |
| `platform_version` | `text` | OS version, e.g., "iOS 17.4.1" |
| `app_version` | `text` | Semver from build, e.g., "3.2.1" |
| `device_locale` | `text` | BCP-47, e.g., "ar-SA" |
| `push_token` | `text null` | Encrypted (AWS KMS envelope); null when notifications declined |
| `push_opt_in_state` | `enum[granted, denied, not_prompted, revoked]` | Updated on every app foreground |
| `last_foregrounded_at` | `timestamptz` | Used for stale-install detection |
| `notification_preferences` | `jsonb` | Per-category opt-in, see Module 7.3 |
| `indoor_positioning_consent` | `bool` | Default false; required for Mapwize blue-dot |

`attendee_agenda_item` (extends shared columns, app-local cache synced to server):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ATT |
| `updated_by` | `uuid` | ATT or sync engine |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{calendar_sync_event_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `registration_id` | `uuid` | FK -> registration.id |
| `session_id` | `uuid` | FK -> session.id (Module 4.1) |
| `relationship` | `enum[starred, attending, tentative, declined]` | User-set |
| `reminder_offset_min` | `int` | Default 15; 0 = no reminder |
| `source` | `enum[user, system_recommended, system_auto_added]` | Auto-added for VIP required sessions |
| `recommendation_score` | `numeric(5,2) null` | 0-100 from AI recommender |
| `rating` | `numeric(2,1) null` | 1.0-5.0 submitted post-session |

`b2b_match_request` (extends shared columns, mirrors Module 3.1 record for offline access):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ATT (requester) |
| `updated_by` | `uuid` | ATT or sync engine |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{match_id_from_module_3_1}` |
| `audit_log` | `jsonb[]` | Append-only |
| `requester_registration_id` | `uuid` | FK -> registration.id |
| `target_registration_id` | `uuid` | FK -> registration.id |
| `status` | `enum[draft, sent, accepted, declined, expired, scheduled]` | Lifecycle |
| `requested_slot_window` | `jsonb` | e.g., `{day: 2, from: "10:00", to: "12:00"}` |
| `message` | `text` | Optional; max 500 chars |
| `expires_at` | `timestamptz` | Default 24h after sent |

`app_config_snapshot` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL or ED |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{launchdarkly_flag_set_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `config_key` | `enum[crisis_mode, agenda_locked, matchmaking_open, indoor_positioning_required, badge_qr_rotating]` | Known set |
| `config_value` | `jsonb` | Strongly typed per config_key |
| `effective_from` | `timestamptz` | UTC |
| `effective_to` | `timestamptz null` | Null = until superseded |
| `target_segment` | `jsonb` | e.g., `{registration_type: [dignitary, speaker]}` |

### D. Business Logic & Edge Cases

- **IF** the attendee scans the QR code in their registration confirmation email, **THEN** the app deep-links into the onboarding flow, the OS hands off the `registration_id` and a short-lived `onboarding_token` to the app, the app exchanges that token for an Azure AD B2C JWT via the Mobile BFF, and the attendee is auto-logged in without typing credentials. The token has a 10-minute TTL; expired tokens force a magic-link email fallback.
- **IF** the app detects `push_opt_in_state = granted` but no FCM/APNs delivery receipt arrives within 5 minutes of a push send (see Edge Case 1), **THEN** the Notification Center (Module 7.3) flags the recipient as `delivery_degraded`, queues an in-app banner payload via the WebSocket channel, and as a last resort dispatches a SendGrid email to the registration's email address with the notification content.
- **IF** an attendee's `registration_type` changes from `attendee` to `dignitary` mid-event (e.g., upgraded by PO via Module 6.1 due to a late-confirmed Ministerial attendee), **THEN** the Registration service publishes `registration.attendee.upserted` on the `registration.*` topic, the Mobile BFF consumes it, pushes a profile-update payload via the open WebSocket to the attendee's app, the app re-fetches entitlements from the BFF (new credentials, new badge template, new agenda items auto-added), and refreshes the UI without requiring re-login. The previously-issued JWT is invalidated server-side and a new one with the updated `registration_type` claim is returned in the same round-trip.
- **IF** an attendee opens the app for the first time on a device that fails Google Play Services integrity (e.g., rooted Android), **THEN** the app refuses to render the badge QR (defense against QR cloning per Module 6.3 Edge Case 2), redirects to a read-only "agenda only" mode, and surfaces a banner "This device cannot display your entry credential. Please visit a Check-In Kiosk." The PWA fallback path is similarly gated.
- **IF** an attendee is `indoor_positioning_consent = true` and walks within 50 meters of Hall A entrance, **THEN** the app pre-caches the Hall A venue map (Mapwize tile bundle, ~3 MB) so the blue-dot navigation is instant on entry, and logs the geofence-crossing event to `appconfig.geofence` for the OL's War Room tile (occupancy-by-zone).
- **IF** the AI recommender proposes a session that conflicts (time-overlap) with a starred session, **THEN** the app surfaces the conflict in the agenda view with a "Conflicts with X" label, never auto-removing the user's existing star, and offers a "swap" one-tap action that demotes the conflict to `tentative`.
- **IF** the attendee's device is offline (airplane mode, venue cellular congestion), **THEN** the app renders the last-synced agenda, the cached venue map (already downloaded at first open), and the cached badge QR. The badge QR uses the rotating TOTP mode (Module 6.3) which is valid offline for 60 minutes. The Offline Sync Engine (Module 7.4) handles mutation queuing.

**Edge Case 1: Push notifications fail to deliver (non-obvious).** A delegate installs the app on Day 1 and grants notification permission (`push_opt_in_state = granted`). On Day 2, they manually disable notifications at the OS level (iOS Settings -> App -> Notifications off) OR Android Doze mode aggressively defers the FCM delivery. The Notification Center sends a "Session starts in 15 minutes" push at 10:45 for an 11:00 session. The FCM API returns a 200 with a `message_id`, but no delivery receipt arrives from the FCM SDK on device within the 5-minute window. The Notification Center's `delivery_receipt_watchdog` (a Kafka Streams job consuming `notif.sent` and `notif.delivered` topics with a 5-minute watermark) detects the missing receipt, publishes `notif.delivery.degraded` with `reason = no_receipt_within_5m`, and the Mobile BFF immediately queues an in-app banner payload on the attendee's WebSocket channel. If the attendee's app is in the foreground within the next 10 minutes, the banner renders with the original notification content and an "Acknowledge" button. **IF** the attendee does not foreground the app within 10 minutes of the original send, **THEN** the SendGrid email fallback fires to the registration's email address with subject "FMF Alert: Session starts in 5 minutes" and the session details. The same logic applies in reverse for APNs `Disable` feedback (silent push returns the disabled-token response); in that case the app's `push_opt_in_state` is server-side set to `revoked` and the attendee is marked for email-only communication going forward.

**Edge Case 2: Profile upgraded to VIP mid-event (non-obvious).** A registered attendee (`registration_type = attendee`) arrives at the venue on Day 1 and uses the app normally. Late on Day 1, the host country's Ministry confirms their delegation lead as a last-minute Ministerial attendee; the PO edits the registration in the Protocol Console (Module 6.1), changing `registration_type` to `dignitary` and `dignitary_profile.protocol_rank` to 3. The Registration service publishes `registration.attendee.upserted` with the new type. The Mobile BFF consumes it within 2 seconds, identifies the open WebSocket session for that `registration_id`, and pushes a `profile_update` message containing the new entitlements: an additional `credential` for the VIP Lounge (time-bounded 14:00-18:00 Day 2), an auto-added `attendee_agenda_item` for the Ministerial Welcome Reception, and a new `badge_template_id` (gold band per Module 6.3). The app receives the WebSocket message, re-fetches the full entitlement set from the BFF (`GET /v1/me/entitlements` with `If-None-Match` ETag handling), refreshes the agenda tab (animating in the new item with a "VIP Welcome Reception added" toast), and renders a "Your badge has been updated. Please visit the VIP Desk to collect your new credential." banner. The previously-issued JWT is invalidated server-side (added to Redis denylist) and a new JWT with the updated `registration_type` and `protocol_rank` claims is returned in the same response; the app stores the new JWT and silently re-authenticates all in-flight requests. The attendee does not see a login screen at any point in this flow.

### E. Third-Party Integrations

- **Azure Notification Hubs (cross-platform push orchestration):** Mobile BFF -> Azure Notification Hubs REST API. The Notification Hub is the single send-point; it routes to APNs for iOS devices and FCM for Android based on the registered `PushChannelHandle`. Tags per `tenant_id`, `event_id`, `registration_id`, and `notification_category` enable audience targeting (see Module 7.3). Send telemetry (per-recipient state: queued, sent, delivered, failed) flows back to the Notification Center via a webhook into the `notif.*` Kafka topic.
- **Firebase Cloud Messaging (Android push):** Notification Hubs -> FCM v1 HTTP API. The app registers a `firebase_instance_id` on first foreground post-permission, stores it in `app_install.push_token` (encrypted), and includes it in the BFF registration handshake. Doze-mode-aggressive devices (Huawei, Xiaomi) receive a high-priority FCM message type for safety-critical notifications (per Module 7.3).
- **Apple Push Notification service (iOS push):** Notification Hubs -> APNs HTTP/2. The app registers an `apns_token` via `UNUserNotificationCenter`, sends it to the BFF, and the BFF registers it with the Notification Hub. APNs feedback service (disabled tokens) is polled every 6 hours and disabled tokens update `push_opt_in_state = revoked`.
- **Mapwize / Situm (indoor positioning):** App -> Mapwize React Native SDK. The SDK provides blue-dot navigation, turn-by-turn directions between sessions and B2B pods, and 3D venue visualization. Tile bundles are downloaded on-demand at first approach to a venue (geofence-triggered pre-cache). Indoor positioning requires explicit user consent (`indoor_positioning_consent = true`) per GDPR/KSA PDPL; aggregated anonymized positioning flows back to the OL's occupancy tile via `appconfig.geofence`.
- **Twilio (SMS fallback):** Notification Center -> Twilio Programmable SMS. SMS is reserved for safety-critical notifications to VIPs who have explicitly listed SMS as their preferred channel in `notification_preferences` (per Module 7.3). SMS is never the default; cost-per-message is tracked and attributed to FAL.
- **Microsoft Azure AD B2C (identity):** App -> BFF -> Azure AD B2C. The BFF exchanges the onboarding QR token (or magic-link email token) for a B2C-issued JWT. The JWT's `sub` claim is stored as `created_by` for all attendee-originated writes. Token refresh uses the B2C refresh-token flow; access tokens have a 60-minute TTL.
- **AWS KMS (PII encryption at rest):** `app_install.push_token`, `attendee_agenda_item.message`, and `b2b_match_request.message` are encrypted with envelope encryption. DEK per `tenant_id`, rotated quarterly.
- **LaunchDarkly (feature flags):** App -> LaunchDarkly React Native SDK. Flags control rollout of new features (e.g., AI recommender v2), crisis-mode UI, and per-event experiments. The SDK fetches the flag set on app foreground; offline fallback uses the last-cached set.
- **SendGrid (email fallback for push failure):** Notification Center -> SendGrid Email API. Triggered when push delivery is degraded AND the in-app banner is not acknowledged within 10 minutes (see Edge Case 1). Templates versioned in SendGrid with `notification_id` and `event_id` dynamic data.

### F. UI/UX Notes

- **Tab bar (bottom, 5 tabs):** Home (today's agenda), Agenda (full 3-day), Map (Mapwize indoor), Connect (B2B matches + requests), More (profile, badge, settings). Dignitary attendees see a 6th tab "Briefing" (visible only when `registration_type IN (dignitary, speaker)`) hosting VL contact card and protocol notes.
- **Home tab:** "Up next" card (next session in next 30 min) with countdown, tappable for indoor route. Below: a horizontal carousel of recommended sessions (AI-driven). Below: notifications inbox (last 7 days).
- **Agenda tab:** Filterable by day, by track (Ministerial, Investor, Technical, Exhibition), by starred. Long-press a session for "Add to agenda", "Rate", "Navigate", "View speakers".
- **Map tab:** Mapwize view with blue-dot, search bar (room name, exhibitor name, sponsor name), category layers (restrooms, F&B, VIP lounges, prayer rooms, ATMs). Tapping a session in the agenda auto-routes from current location to session room.
- **Connect tab:** List of incoming match requests (with accept/decline swipe), list of outgoing requests (with status), "Discover" CTA opening the matchmaking recommender (consumes Module 3.1).
- **Badge QR (in More tab and on Home as a peeking card):** Full-screen tappable QR with rotating TOTP for VIP rank 1-2 per Module 6.3. Standard QR (non-rotating) for attendees. Pin-protected (FaceID / TouchID / biometric).
- **Onboarding flow (first open after QR scan):** 3 screens: "Welcome to FMF" (event branding), "Notifications" (permission prompt with clear rationale per category), "Indoor Positioning" (consent prompt with privacy notice). Each screen has a "Skip" that records the refusal in `notification_preferences` and `indoor_positioning_consent`.
- **Localization:** 6 languages (Arabic RTL, English, French, Mandarin, Spanish, Russian). Arabic layout is fully mirrored (icons, swipe directions, animations). Date/time formats per locale. Currency display in registration's `currency_code` for paid features.
- **Accessibility:** WCAG 2.1 AA. VoiceOver / TalkBack support on all screens. Dynamic Type up to XXL. Color contrast 4.5:1 minimum. Reduced-motion respect for OS setting.

### G. Failure Modes & Offline Behavior

- **FCM/APNs outage:** Notification Center detects a >5% failure rate in a 5-minute window, marks the Notification Hub as `degraded`, and routes all safety-critical notifications through the in-app WebSocket banner and SendGrid email fallback. Non-critical notifications are queued and replayed when the outage clears.
- **Azure AD B2C outage:** App falls back to magic-link email login (SendGrid) with a 30-second JWT signed by the BFF (rate-limited to 100 logins/min per the Module 6.1 convention). The fallback is gated by LaunchDarkly flag `auth_b2c_fallback`.
- **Mapwize SDK failure (map tiles won't load):** App falls back to a static PDF map bundled with the app binary (downloaded on first open, refreshed weekly). The blue-dot navigation is unavailable; the static map shows "you are here" markers per zone.
- **WebSocket disconnect:** App detects within 5 seconds (heartbeat), surfaces a "Reconnecting..." toast, and retries with exponential backoff (1s, 2s, 4s, 8s, 16s, 30s capped). After 3 failed retries, the app switches to 15-second polling of the BFF for profile and entitlement updates.
- **Mobile BFF unavailable:** App uses cached agenda, cached venue map, cached badge QR (valid 60 min for VIP per Module 6.3). All write operations (match requests, ratings, profile edits) queue in the Offline Sync Engine (Module 7.4). A persistent banner "Offline. Some features may be delayed." appears.
- **Device battery < 20%:** App reduces background sync frequency from 60s to 300s, disables Mapwize blue-dot (high battery cost), and surfaces a "Battery saver mode" indicator. VIP rank 1-2 attendees with safety-critical notifications bypass this throttle.
- **Corrupt local cache (Couchbase Lite / WatermelonDB):** App detects on next foreground via checksum mismatch with server ETag, purges the local DB, re-downloads the essential cache (profile, agenda, venue map, session list, ~15 MB), and surfaces a "Refreshing your data..." progress card.

### H. Acceptance Criteria

- **Given** an attendee with a confirmed registration who has not installed the app, **when** they scan the QR code in their confirmation email on their iPhone, **then** the App Store opens to the FMF app listing, and on install and first open, the app deep-links into the onboarding flow and auto-logs the attendee in within 10 seconds without prompting for credentials, with their personalized agenda visible on the Home tab.
- **Given** an attendee whose push notifications were granted on Day 1 but disabled at the OS level on Day 2, **when** the Notification Center sends a session-reminder push at T-15min that receives no delivery receipt within 5 minutes, **then** the Notification Center publishes `notif.delivery.degraded`, the Mobile BFF queues an in-app banner on the attendee's WebSocket, and if the app is not foregrounded within 10 minutes, a SendGrid email is dispatched to the registration's email address with the session details.
- **Given** an attendee whose `registration_type` is upgraded from `attendee` to `dignitary` mid-event by the PO, **when** the Registration service publishes `registration.attendee.upserted`, **then** the Mobile BFF pushes a profile-update payload to the attendee's open WebSocket within 2 seconds, the app re-fetches entitlements (new credential, new agenda item, new badge template), refreshes the UI with a toast, and invalidates the prior JWT with a new JWT containing the updated `registration_type` and `protocol_rank` claims, all without requiring the attendee to re-login.
- **Given** a Mandarin-speaking delegate on a PWA-only device with no native push token, **when** they authenticate via magic-link email and open the Home tab, **then** the agenda renders in Mandarin with RTL-aware date formatting (where applicable), the venue map is pre-cached on first open, and any push notification targeting them falls back to email delivery to their registration email address (no push token to send to).
- **Given** an attendee who grants indoor positioning consent and walks within 50 meters of Hall A, **when** the geofence-crossing event fires, **then** the app pre-caches the Hall A Mapwize tile bundle (~3 MB) in the background, logs the geofence event to `appconfig.geofence` for the OL's occupancy tile, and on entry into Hall A the blue-dot navigation renders within 2 seconds of the screen being tapped.
