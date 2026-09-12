> Module 7: Mobile App (Attendee & Staff Facing) -> 7.4 Offline Sync Engine

## Offline Sync Engine

### A. Purpose Statement

The Offline Sync Engine is the subsystem that lets the FMF mobile apps continue to function when the network fails, which at event scale is not an exceptional condition but a guaranteed one. At a 1.2 million square meter site with 10,000+ concurrent attendees, 100+ sovereign delegations, and 200-400 staff moving between concrete-and-steel venue structures, cellular and WiFi connectivity will degrade or disappear for predictable windows: motorcade arrival triggers RF jamming countermeasures, banquet ingress saturates WiFi access points, basement holding rooms are signal dead zones, and the plenary hall during a Head of State address drops every device to airplane-grade interference. The Sync Engine's contract is that the Staff App retains full functionality for 90 minutes without network, the Attendee App retains read functionality indefinitely (cached data) and write-queuing for 24 hours, and on reconnect the server reconciles mutations deterministically without silent data loss.

The engine is built on Couchbase Lite (Attendee App) and WatermelonDB (Staff App) for local storage, with a custom sync API over HTTPS for mutation push and a GraphQL subscription layer (AWS AppSync) for online real-time updates. Conflict resolution follows a tiered strategy: last-write-wins for non-critical fields with deterministic timestamp comparison, and manual adjudication for critical fields (incident status changes, credential revocations, protocol-rank changes). The engine publishes `appconfig.sync.*` events on Kafka for analytics (sync queue depth, conflict counts, degraded-mode entries) and consumes `notif.*` for push-driven invalidations of local cache.

### B. User Roles & Permissions

The Sync Engine is infrastructure, not a directly-operated surface. Its permissions model governs which personas' writes are subject to which conflict-resolution strategy, and who can adjudicate conflicts.

- **Attendee (ATT):** Primary (via the Attendee App, Module 7.1). Writes (agenda stars, B2B match requests, session ratings, profile edits) queue locally and sync on reconnect. All attendee writes are subject to last-write-wins for non-critical fields. ATT cannot adjudicate conflicts; conflicts surface as in-app notifications.
- **Field Volunteer (FV):** Primary (via the Staff App, Module 7.2). Writes (incident reports, scan events, task acknowledgments, chat messages) queue locally. Incident-status changes (e.g., marking an incident "resolved") are subject to manual adjudication.
- **VIP Liaison (VL):** Primary (via the Staff App / Shadow App, Module 7.2 / 2.4). Writes (dignitary status updates, chat messages) queue locally. Dignitary-status updates are subject to last-write-wins with the server's timestamp as the tiebreaker (the Shadow App preserves device timestamps per Module 2.4).
- **Operations Lead (OL):** Adjudicates conflicts on staff-originated writes (e.g., two FVs both marked an incident "resolved"). Read on sync queue depth, conflict counts, and degraded-mode entries across the fleet. Write on conflict resolutions.
- **Event Director (ED):** Read on sync engine health metrics. Write only via break-glass on forced sync resets (e.g., when a device's local DB is corrupted and must be purged remotely).
- **Protocol Officer (PO):** Adjudicates conflicts on protocol-related writes (e.g., two VLs reported conflicting status for the same dignitary). Read on dignitary-sync metrics.
- **Registration Manager (RM):** Read on attendee-sync funnel metrics (registration.confirmed -> first sync -> first write). No write on the sync engine itself.
- **Sponsorship Sales Lead (SSL):** No direct interaction. EPU writes via the Sponsor Portal (web) which uses a different sync path (server-authoritative, no offline queue).
- **Exhibitor Portal User (EPU):** No direct interaction. (See SSL note above.)
- **Content & Stage Manager (CSM):** Read on session-rating sync progress (attendee ratings syncing back to the content service). No write on the sync engine.
- **Matchmaking Concierge (MC):** Read on B2B match-request sync progress. No write on the sync engine.
- **Finance & Administration Lead (FAL):** Read-only on sync engine infrastructure costs (Couchbase Lite licensing, AppSync request volume, S3 storage for queued mutations). No write.
- **Marketing & PR Lead (MPL):** Read on aggregate sync metrics for adoption dashboards. No write.
- **ESG & Sustainability Officer (ESGO):** Read on sync engine's energy cost (battery consumed by sync, foreground-service hours on Zebra devices) for ESG reporting. No write.

### C. Data Model

`sync_mutation` (extends shared columns, the local-queue record that mirrors server-side):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable (also used for client-side ordering) |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC, server-received |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Originating persona |
| `updated_by` | `uuid` | Sync worker |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete after 30-day retention |
| `ext_refs` | `jsonb` | e.g., `{device_id, local_record_id, couchbase_rev}` |
| `audit_log` | `jsonb[]` | Append-only |
| `device_id` | `uuid` | FK -> app_install.id or staff_device.id |
| `target_table` | `text` | E.g., "attendee_agenda_item", "incident_report", "b2b_match_request" |
| `target_record_id` | `uuid` | Client-side v7 UUID; server may re-map on accept |
| `operation` | `enum[insert, update, delete]` | Mutation kind |
| `payload` | `jsonb` | Full record for insert; changed fields for update; null for delete |
| `original_payload_hash` | `text null` | SHA-256 of the client's last-read state (for optimistic concurrency check) |
| `client_timestamp` | `timestamptz` | Device clock at mutation time (preserved across sync) |
| `server_received_at` | `timestamptz null` | Server receipt time |
| `sync_status` | `enum[queued, in_flight, accepted, rejected, conflict_pending, merged]` | Lifecycle |
| `rejection_reason` | `text null` | Server's reason for rejection |
| `conflict_resolution` | `enum[last_write_wins, manual_adjudication, server_authoritative] null` | Strategy applied |
| `adjudicated_by` | `uuid null` | FK -> staff_persona.id (OL or PO) when manual |
| `adjudicated_at` | `timestamptz null` | UTC |
| `retry_count` | `int` | Resets on accept |
| `next_retry_at` | `timestamptz null` | Computed backoff |

`sync_session` (extends shared columns, tracks each reconnect cycle):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Sync worker |
| `updated_by` | `uuid` | Sync worker |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{appsync_subscription_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `device_id` | `uuid` | FK -> app_install.id or staff_device.id |
| `session_kind` | `enum[attendee_app, staff_app]` | Drives sync strategy |
| `started_at` | `timestamptz` | Reconnect detected |
| `ended_at` | `timestamptz null` | Sync completed or connection lost |
| `mutations_pushed` | `int` | Count accepted by server |
| `mutations_rejected` | `int` | Count rejected |
| `mutations_conflict_pending` | `int` | Count awaiting adjudication |
| `mutations_merged` | `int` | Count auto-merged (last-write-wins) |
| `cache_invalidated_tables` | `text[]` | Tables whose cache was refreshed |
| `bytes_transferred` | `bigint` | Total bytes |
| `battery_at_start_pct` | `numeric(5,2)` | 0-100 |
| `battery_at_end_pct` | `numeric(5,2)` | 0-100 |
| `degraded_mode_entered` | `bool` | True if sync window exceeded |

`sync_cache_manifest` (extends shared columns, per-device cache state):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Sync worker |
| `updated_by` | `uuid` | Sync worker |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{couchbase_db_name, watermelon_db_version}` |
| `audit_log` | `jsonb[]` | Append-only |
| `device_id` | `uuid` | FK -> app_install.id or staff_device.id |
| `table_name` | `text` | E.g., "attendee_profile", "session_list", "venue_map_tiles" |
| `last_synced_at` | `timestamptz` | UTC |
| `last_synced_etag` | `text` | Server ETag for conditional fetch |
| `record_count` | `int` | Local record count |
| `size_bytes` | `bigint` | Local storage size |
| `is_critical` | `bool` | True for attendee_profile, agenda, venue_map, badge_qr_seed |
| `cache_strategy` | `enum[full_refresh, incremental, on_demand]` | Per-table strategy |

`conflict_record` (extends shared columns, manual-adjudication queue):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Sync worker (auto) |
| `updated_by` | `uuid` | OL or PO (adjudicator) |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete after resolution + 90-day retention |
| `ext_refs` | `jsonb` | e.g., `{incident_id, war_room_incident_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `target_table` | `text` | E.g., "incident_report" |
| `target_record_id` | `uuid` | Server-side canonical record ID |
| `mutation_a_id` | `uuid` | FK -> sync_mutation.id |
| `mutation_b_id` | `uuid` | FK -> sync_mutation.id |
| `conflict_kind` | `enum[concurrent_update, delete_then_update, optimistic_concurrency_mismatch, schema_drift]` | Classification |
| `field_diff` | `jsonb` | Per-field before/after for both mutations |
| `severity` | `enum[s0, s1, s2, s3]` | Per Module 1.2 severity scale |
| `adjudication_status` | `enum[pending, resolved_accept_a, resolved_accept_b, resolved_merge, resolved_reject_both]` | Lifecycle |
| `adjudicated_by` | `uuid null` | FK -> staff_persona.id |
| `adjudicated_at` | `timestamptz null` | UTC |
| `adjudication_notes` | `text null` | Free text |

### D. Business Logic & Edge Cases

- **IF** the device's local mutation queue contains records and network reconnects, **THEN** the sync worker pushes mutations in client-timestamp order (oldest first), the server validates each mutation against the current server state, and either accepts (returns the canonical `target_record_id` and `version`), rejects (with `rejection_reason`), or flags for conflict (creates a `conflict_record` and returns `sync_status = conflict_pending`). The device's local record is updated to match the server's response.
- **IF** a mutation is rejected (e.g., the target session was cancelled between client-write and server-receipt), **THEN** the device surfaces a notification to the user: "Your action could not be completed: [reason]. Tap to review." The rejected mutation is preserved in the local queue for 7 days for audit; the user can dismiss it.
- **IF** two devices modify the same record offline (see Edge Case 1), **THEN** the server compares the `client_timestamp` of both mutations; the later write wins for non-critical fields (last-write-wins); for critical fields (incident status, credential revocation), a `conflict_record` is created and routed to the OL or PO for manual adjudication. The earlier writer is notified with a conflict-resolution summary.
- **IF** the device is offline for more than 90 minutes (see Edge Case 2), **THEN** the app enters "Degraded Mode": the Staff App switches to scan-only functionality (no server-side entitlement validation, scans queued), the Attendee App switches to cached-data-only mode (no write queuing beyond 24 hours), and a prominent banner warns the user.
- **IF** the device's battery drops below 20%, **THEN** the sync worker throttles: reduces background sync frequency from 60s to 300s, pauses photo uploads (which are large), and prioritizes text-only mutations (incident reports, chat messages, status updates). The Staff App on Zebra TC52 devices uses the foreground service to maintain operation during lock screen, bypassing the throttle for safety-critical mutations (per Module 7.2).
- **IF** the local cache for a critical table (attendee_profile, agenda, venue_map, badge_qr_seed) is older than 24 hours, **THEN** the sync worker prioritizes refreshing those tables on the next reconnect, regardless of queue order. The app displays "Refreshing your data..." progress for those tables.
- **IF** a schema change is deployed server-side while devices are offline, **THEN** the device's mutation queue may contain records with field structures that don't match the new schema. The server's mutation validator detects the mismatch, rejects the mutation with `rejection_reason = "schema_drift"`, and the device is forced to perform a full cache refresh (purge and re-download) before any further mutations are accepted. This prevents silent data corruption.

**Edge Case 1: Two devices modify the same record offline (non-obvious).** At 10:30:00, FV-04 and FV-12 are both assigned to Hall B. An incident occurs (delegate collapse). FV-04 creates an `incident_report` locally at 10:42:17 (per Module 7.2 Edge Case 1) with `category = medical`, `severity_guess = s2`. FV-12, unaware that FV-04 has already reported the incident (their devices are both offline, no chat sync), creates their own `incident_report` locally at 10:43:55 with `category = medical`, `severity_guess = s1` (FV-12 is closer and observes the delegate's breathing is irregular). Both devices lose network until 10:46:50 (WiFi recovers). At 10:46:50, FV-04's mutation pushes first (earlier `client_timestamp`); the server accepts it, creates the canonical `incident` record, and returns `target_record_id = <uuid-A>`. At 10:46:52, FV-12's mutation pushes; the server detects that the canonical `incident` record was created 2 seconds ago in the same zone by another FV (within the Module 1.2 dual-reporter 30-second auto-merge window). For the non-critical fields (`description`, `photo_asset_ids`, `reporter_location`), the server merges both reports into the canonical record (last-write-wins on `severity_guess` means FV-12's s1 wins over FV-04's s2). For the critical fields (`severity`, `status`), a `conflict_record` is created with `conflict_kind = concurrent_update` and `severity = s2` (per Module 1.2 severity scale). The OL receives a notification: "Incident <uuid-A> in Hall B has a severity conflict between FV-04 (s2) and FV-12 (s1). Please adjudicate." The OL reviews both reports, sees FV-12's note about irregular breathing, and adjudicates `severity = s1` at 10:48:30. The canonical `incident` record's `severity` is updated; the `conflict_record` is marked `resolved_accept_b`. FV-04 receives a push notification: "Your incident report was merged with FV-12's. Severity was escalated to s1 based on FV-12's observation. Tap to review the merged record." The merge ensures no duplicate incidents clog the War Room tile, and the OL retains authority over severity changes (which drive escalation paths per Module 1.2).

**Edge Case 2: Device offline > 90 minutes (sync window exceeded) (non-obvious).** A Zebra TC52 device carried by FV-07 enters a basement holding room at 09:15:00 to set up for a dignitary arrival. The holding room is a known RF dead zone (concrete walls, no cellular, no WiFi). The 90-minute offline window (per Module 7.2 contract) starts ticking. At 10:45:00, the 90-minute window expires. The app transitions to "Degraded Mode": the home screen shows a persistent red banner "Degraded Mode: 90+ minutes offline. Scan-only functionality. Entitlement validation deferred." The scanner view switches to scan-only mode: badges are scanned and recorded locally with a `degraded_mode_scan = true` flag, but the access-control service (Module 6.2) is not queried for entitlement validation. Instead, the device validates against a 10-minute-TTL offline cache of valid credentials (per Module 6.2 Edge Case), but that cache has also expired (it was last refreshed at 09:15:00, 90 minutes ago). So the device accepts all scans and queues them with a `validation_pending = true` flag, surfacing a per-scan toast "Scan recorded. Entitlement will be validated on reconnect." All queued scans are timestamped and stored locally. At 11:32:00, FV-07 exits the basement and reconnects. The sync worker immediately begins a full sync: pushes the queued scans (each creates a `scan_event` record in Module 6.2 with `degraded_mode = true` and `validation_status = pending`), then receives the entitlement validation results. **IF** any of the queued scans would have been denied (e.g., a revoked credential), the server creates an `incident_report` with `category = security` and `severity_guess = s2` automatically, routes it to the OL for triage, and the War Room tile highlights the after-the-fact denial in red. The device transitions out of Degraded Mode, the banner clears, and full functionality resumes. The OL reviews the degraded-mode scan list as part of the post-event incident review. For attendees whose badges were scanned in Degraded Mode and would have been denied, the post-event report flags them for follow-up; for FMF scale this is typically 0-3 scans per event (most attendees have valid credentials), but the audit trail is mandatory. The Staff App on Zebra TC52 devices uses the foreground service (per Module 7.2) to maintain the device's operation during the lock screen, so the 90-minute window is the sync-engine's data-freshness limit, not the device's operational limit.

### E. Third-Party Integrations

- **Couchbase Lite (Attendee App local storage):** React Native app <-> Couchbase Lite SDK. The local NoSQL store holds attendee_profile, agenda, session_list, venue_map_tiles (Mapwize tile bundle), b2b_match_requests, notification_inbox. Sync gateway protocol replicates with the server-side Couchbase Sync Gateway for bidirectional sync. Conflict resolution: last-write-wins with `client_timestamp` as the deterministic tiebreaker.
- **WatermelonDB (Staff App local storage):** React Native app <-> WatermelonDB SDK. The local SQLite-backed store is optimized for high-write-volume scenarios (FV scans, incident reports). WatermelonDB's reactive queries power the Staff App's real-time UI updates even when offline. Sync via the custom HTTPS sync API (below).
- **Custom sync API over HTTPS:** Mobile app -> Mobile BFF -> Sync Worker service. Endpoints: `POST /v1/sync/push` (push mutation queue), `GET /v1/sync/pull?since=<cursor>` (pull server-side changes since last sync cursor), `POST /v1/sync/conflict/ack` (acknowledge a conflict resolution). Idempotency keys on `mutation.id` prevent duplicate application on retry. The BFF authenticates via the Azure AD B2C JWT (per Module 7.1 / 7.2).
- **AWS AppSync GraphQL subscriptions (online sync):** Mobile app <-> AWS AppSync. When online, the app subscribes to GraphQL subscriptions for real-time updates (e.g., `onSessionUpdate`, `onIncidentUpdate`, `onTaskAssignment`). Subscriptions are per-`registration_id` (attendee) or per-`staff_persona_id` (staff), filtered server-side to prevent cross-tenant data leakage. AppSync publishes changes back to Kafka on the `appconfig.*` topic for analytics.
- **AWS KMS (PII encryption):** `sync_mutation.payload` is encrypted at rest via envelope encryption. DEK per `tenant_id`, rotated quarterly. The local Couchbase Lite and WatermelonDB stores use SQLCipher (AES-256) for at-rest encryption on the device, with the key derived from the device's Secure Enclave (iOS) or Keystore (Android).
- **AWS S3 (large payload offload):** Photo and voice note attachments in mutations are offloaded to S3 (per Module 7.2) and the mutation's `payload` references the S3 key rather than embedding the binary. The sync worker downloads the binary on the server side and stores it as a `content_asset` (per Module 4.4).
- **Microsoft Intune MDM (staff device compliance):** Intune enforces disk encryption (SQLCipher key escrow), PIN policy, and remote-wipe on staff devices. The Sync Engine checks Intune compliance on each reconnect; non-compliant devices are refused sync and the user is prompted to remediate.
- **Mapwize SDK (offline tile bundle):** The Mapwize React Native SDK downloads venue map tile bundles on first foreground (per Module 7.1) and stores them in the local Couchbase Lite store. The Sync Engine refreshes the bundle on a weekly cadence (or on event-day if Mapwise publishes a venue-layout change).

### F. UI/UX Notes

- **Sync status indicator (all apps):** Top-bar icon (cloud with checkmark = synced, cloud with arrow = syncing, cloud with slash = offline, cloud with exclamation = degraded mode / conflict pending). Tappable for detail view.
- **Sync detail view:** Last sync timestamp, queue depth (count of pending mutations), last conflict resolution timestamp, cache freshness per table (color-coded: green = <1h, amber = 1-24h, red = >24h). "Sync Now" manual button (forces immediate sync).
- **Conflict notification (attendee):** In-app banner "Your [action] conflicted with another update. Tap to review." Tap opens a diff view showing the user's submitted value and the server's accepted value, with a "Got it" acknowledgment.
- **Conflict notification (staff):** Push notification + in-app banner. For OL/PO adjudicators, the conflict appears in the Ops Dashboard conflict queue with side-by-side diff, accept-a / accept-b / merge / reject-both buttons, and a notes field.
- **Degraded mode banner (staff):** Persistent red banner at top of every screen: "Degraded Mode: 90+ minutes offline. Scan-only functionality. Entitlement validation deferred. Reconnect to WiFi or cellular to resume full functionality." Tappable for sync-engine detail.
- **Pending upload badge (staff):** Home-screen badge with count of incident reports and chat messages awaiting sync. Tappable for the queue list with per-mutation retry status.
- **Battery saver indicator (all apps):** When battery < 20%, a "Battery saver" pill appears in the top bar with the throttled sync cadence noted. Photo uploads are paused; text mutations continue.
- **Cache management screen (attendee, advanced):** Per-table cache size and last-synced timestamp, with a "Refresh now" button per table (useful when the user knows their agenda is stale). Total cache size with a "Clear cache" button (forces full re-download on next foreground).

### G. Failure Modes & Offline Behavior

- **Couchbase Lite / WatermelonDB local corruption:** The app detects corruption via a checksum mismatch on next foreground. The local DB is purged, the user is logged out, and on next login the full essential cache is re-downloaded (~15 MB for attendee, ~50 MB for staff with Mapwize tiles). Any un-pushed mutations in the corrupt DB are lost; the user is warned "Local data was corrupted. Unsynced changes may have been lost."
- **Sync API BFF unavailable:** The app continues to queue mutations locally with no upper bound (until device storage hits 80% full, at which point the oldest non-critical mutations are evicted with a warning). On BFF recovery, the sync worker resumes from the last-acknowledged cursor. The cursor is stored locally and server-side (in `sync_session`).
- **AWS AppSync subscription disconnect:** The app detects within 5 seconds (heartbeat), surfaces a "Reconnecting..." toast, and retries with exponential backoff. After 3 failed retries, the app switches to 15-second polling of the sync API pull endpoint (5 seconds for staff during active incidents).
- **Schema drift (server-side migration deployed while devices offline):** Per the schema-drift rule above, mutations are rejected with `rejection_reason = "schema_drift"` and the device is forced into a full cache refresh. The Staff App surfaces a "Server update required. Refreshing your data..." progress card; mutations queued during the refresh are replayed against the new schema.
- **Conflict backlog exceeds threshold:** If the OL's conflict queue exceeds 20 pending conflicts, the OL is paged (PagerDuty) to adjudicate; unattended conflicts block downstream incident closures per Module 1.2.
- **Device storage near-full (>80%):** The app pauses photo uploads (largest payload), continues text-only mutations, and surfaces a "Storage nearly full. Old photos will be evicted to make room for new data." warning. The oldest non-critical cached tables (e.g., past-day session recordings) are evicted.
- **NTP clock skew on device:** If the device's clock drifts more than 30 seconds from server time (checked on each sync), the sync worker refuses to accept mutations from that device and surfaces a "Your device clock is incorrect. Please sync your date and time settings." warning. This prevents timestamp-based conflict resolution from being gamed by a malicious or misconfigured device.

### H. Acceptance Criteria

- **Given** two FV devices (FV-04 and FV-12) both offline in Hall B, **when** both create `incident_report` records for the same medical incident at 10:42:17 and 10:43:55 respectively, **then** the server, on receiving both mutations at 10:46:50 and 10:46:52, merges non-critical fields via last-write-wins (FV-12's s1 severity wins), creates a `conflict_record` for the critical severity field, notifies the OL for adjudication, and sends a push notification to FV-04 with "Your incident report was merged with FV-12's" including the merged record link.
- **Given** a Zebra TC52 device carried by FV-07 entering a basement RF dead zone at 09:15:00, **when** the 90-minute sync window expires at 10:45:00, **then** the app transitions to Degraded Mode, displays a persistent red banner, switches the scanner to scan-only functionality, queues all scans with `degraded_mode_scan = true` and `validation_pending = true`, and on reconnect at 11:32:00 pushes the queued scans to the access-control service for after-the-fact validation, creating incident reports automatically for any scans that would have been denied.
- **Given** an attendee's device with battery at 18%, **when** the sync worker evaluates the next sync cycle, **then** background sync frequency is throttled from 60s to 300s, photo uploads are paused, text-only mutations (agenda stars, match requests) continue with normal priority, and the Attendee App displays a "Battery saver" pill in the top bar.
- **Given** a server-side schema migration that changes the `attendee_agenda_item` table structure while 2,000 attendee devices are offline, **when** the first device reconnects and pushes a mutation in the old schema, **then** the server rejects the mutation with `rejection_reason = "schema_drift"`, the device is forced into a full cache refresh, and on completion the device's mutation queue is replayed against the new schema with a "Refreshing your data..." progress card displayed to the user.
- **Given** a device whose NTP clock has drifted more than 30 seconds from server time, **when** the device attempts to push a mutation, **then** the sync worker refuses the mutation, surfaces a "Your device clock is incorrect. Please sync your date and time settings." warning to the user, and the device is not allowed to push mutations until the clock is corrected.
