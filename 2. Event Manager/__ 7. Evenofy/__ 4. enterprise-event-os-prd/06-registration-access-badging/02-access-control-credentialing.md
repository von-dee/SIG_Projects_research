> Module 6: Registration, Access Control & Badging -> 6.2 Access Control & Credentialing

## Access Control & Credentialing

### A. Purpose Statement

The Access Control & Credentialing subsystem is the gatekeeper between the registration record (Module 6.1) and the physical venue. Every physical access decision at FMF flows through this engine: the 14 plenary doors, 32 breakout rooms, 6 VIP holding rooms, 4 media zones, 18 sponsor pavilion entries, and 9 back-of-house corridors. At FMF scale, this is 60,000+ access attempts per day across 12 hours of operation, with a peak of 4,200 attempts per minute during the 08:30-09:00 plenary ingress window. A credential is the unit of authorization: it binds an attendee identity to a zone and a time window, and it is the only thing the readers trust. A misissued credential is a security incident; a missing credential is a diplomatic incident (e.g., a Minister denied stage access). The engine publishes `credential.*` and `scan.*` topics; Module 1.1 (Real-Time Data Visualization) consumes `scan.ingress` and `scan.egress` for live occupancy tiles; Module 6.3 (Badging) consumes `credential.issued` to encode the QR; Module 8 (Ops & Logistics) consumes `scan.denied` to dispatch floor staff to reader queues.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all credentials and scans; write only via break-glass on credential revocation of protocol_rank 1-2 dignitaries (requires PO co-approval).
- **Operations Lead (OL):** Read on all credentials, scans, zone occupancy, and reader health. Write on zone capacity overrides (with audit). Cannot modify individual dignitary credentials.
- **Protocol Officer (PO):** Read/write on credentials attached to `dignitary_profile_id` records. Can grant or revoke VIP Lounge, Speaker Backstage, and Holding Room access. Can revoke mid-event in real time. Cannot modify floor plan or reader config.
- **VIP Liaison (VL):** Read-only on the assigned dignitary's active credentials and access log; used to navigate the dignitary through the venue. No write.
- **Registration Manager (RM):** Read on all credentials; write only on credential template configuration (which registration_type gets which default credentials). Cannot modify individual credentials post-issuance (that is PO or OL).
- **Sponsorship Sales Lead (SSL):** Read-only on credentials attached to sponsor staff for their portfolio (used to verify booth access entitlements).
- **Exhibitor Portal User (EPU):** Read-only on the credentials of their own staff (just the zone list, not the time windows or audit log).
- **Content & Stage Manager (CSM):** Read-only on Speaker Backstage credentials for sessions they manage; used to validate stage access during session run-of-show.
- **Matchmaking Concierge (MC):** No access.
- **Finance & Administration Lead (FAL):** No access.
- **Marketing & PR Lead (MPL):** Read-only on aggregate zone occupancy counts (no individual credential data).
- **ESG & Sustainability Officer (ESGO):** Read-only on aggregate ingress/egress counts per zone for crowd-density carbon calculations.
- **Field Volunteer (FV):** Read-only on zone capacity and the next 5 expected scans at their assigned post. No access to attendee identity in scans, only the access decision (granted / denied / queue).
- **Attendee (ATT):** Read-only on their own active credentials via the Mobile App (Module 7). Can see zone list, time windows, and access history.

### C. Data Model

`credential` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | RM (template) or PO (individual) |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{hid_credential_id, hid_panel_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `registration_id` | `uuid` | FK -> registration.id |
| `credential_kind` | `enum[all_event, session_specific, time_bounded]` | Determines validation logic |
| `zone_scope` | `uuid` | FK -> zone.id; can be a floor, zone, or sub-zone |
| `session_id` | `uuid null` | FK -> session.id; non-null when kind = session_specific |
| `valid_from` | `timestamptz` | Start of validity window |
| `valid_to` | `timestamptz` | End of validity window; equal to event end for all_event kind |
| `status` | `enum[active, revoked, expired, suspended]` | Lifecycle |
| `revoked_at` | `timestamptz null` | When status moved to revoked |
| `revoked_by` | `uuid null` | PO, OL, or ED (break-glass) |
| `revoke_reason` | `text null` | Required when revoked |
| `priority` | `enum[primary, override]` | override supersedes any conflicting primary |
| `source_template_id` | `uuid null` | FK -> credential_template.id if issued by template |
| `qr_payload_version` | `int` | 1 = static QR; 2 = rotating TOTP-based (VIP only) |

`zone` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL or RM |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{genetec_door_id, mapwize_polygon_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `zone_code` | `text` | e.g., "PLN-MAIN", "VIP-LNG-1" |
| `display_name` | `text` | e.g., "Plenary Main Hall" |
| `parent_zone_id` | `uuid null` | FK -> zone.id; null for venue root |
| `zone_level` | `enum[venue, floor, zone, sub_zone]` | Hierarchy depth |
| `max_capacity` | `int` | Hard cap for occupancy enforcement |
| `current_occupancy` | `int` | Materialized from ingress/egress scans |
| `inheritance_mode` | `enum[grant_to_children, deny_to_children, mixed]` | Default grant_to_children |
| `reader_id_list` | `uuid[]` | FK -> reader.id; readers at this zone's boundaries |

`reader` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{hid_aero_x110_serial, panel_mac}` |
| `audit_log` | `jsonb[]` | Append-only |
| `hardware_id` | `text` | Hardware serial number |
| `model` | `enum[hid_aero_x110, hid_iclass_se, zebra_tc52_mobile]` | Reader type |
| `zone_id` | `uuid` | FK -> zone.id; the zone this reader guards |
| `direction` | `enum[ingress, egress, bidirectional]` | Used for occupancy delta |
| `status` | `enum[online, offline, degraded, maintenance]` | Materialized from heartbeat |
| `last_heartbeat_at` | `timestamptz` | UTC; OL alert if > 60s stale |
| `firmware_version` | `text` | For OTA updates |
| `cached_credential_count` | `int` | Number of credentials in local cache |
| `cache_expires_at` | `timestamptz null` | When the offline cache becomes invalid |
| `ip_address` | `inet` | For mTLS endpoint |
| `queue_depth` | `int` | People waiting if zone at capacity |

`scan_event` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | reader.id (service account) |
| `updated_by` | `uuid` | Same |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{hid_event_uuid}` |
| `audit_log` | `jsonb[]` | Append-only |
| `reader_id` | `uuid` | FK -> reader.id |
| `zone_id` | `uuid` | FK -> zone.id |
| `credential_id` | `uuid null` | FK -> credential.id; null if denied (no credential) |
| `registration_id` | `uuid null` | FK -> registration.id; resolved from credential or QR lookup |
| `scan_result` | `enum[granted, denied_revoked, denied_expired, denied_capacity, denied_no_credential, denied_zone_closed]` | Outcome |
| `direction` | `enum[ingress, egress]` | From reader.direction at scan time |
| `occurred_at` | `timestamptz` | UTC, from reader clock |
| `occupancy_delta` | `int` | +1 for ingress granted, -1 for egress granted, 0 otherwise |
| `queue_position_assigned` | `int null` | If denied_capacity and queue opened |
| `device_local_seq` | `bigint` | Reader-local monotonic counter, for offline dedup |

`credential_template` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | RM |
| `updated_by` | `uuid` | RM |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{cvent_template_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `registration_type` | `enum[attendee, dignitary, speaker, sponsor_staff, media, staff_volunteer]` | Triggers on registration.confirmed |
| `zone_scope_list` | `uuid[]` | FK -> zone.id; default zones granted |
| `kind` | `enum[all_event, session_specific, time_bounded]` | Default kind for the template |
| `default_valid_from_offset` | `interval` | e.g., `event.start - interval '1 hour'` |
| `default_valid_to_offset` | `interval` | e.g., `event.end + interval '1 hour'` |
| `priority` | `enum[primary, override]` | Default primary |

### D. Business Logic & Edge Cases

- **IF** a `credential_template` matches a new `registration.confirmed` event, **THEN** the engine materializes one or more `credential` rows per the template's `zone_scope_list` and publishes `credential.issued` per credential created. Materialization is idempotent: the consumer dedup keys on `registration_id + zone_scope + kind`.
- **IF** a credential's `zone_scope` is a `floor`-level zone with `inheritance_mode = grant_to_children`, **THEN** the credential is implicitly valid for every child zone and sub-zone under that floor, unless an explicit `deny_to_children` override exists at a lower level (override > primary).
- **IF** a `scan_event` arrives at a reader with `direction = ingress` and the zone's `current_occupancy >= max_capacity`, **THEN** the engine returns `scan_result = denied_capacity`, opens a queue (or appends to an existing one), assigns `queue_position_assigned`, and the reader displays the position on its e-ink panel. **IF** a subsequent egress scan decrements occupancy below max_capacity, **THEN** the queue's position 1 is admitted (push notification to Mobile App + reader display).
- **IF** a credential has `status = revoked` and a scan arrives, **THEN** the engine returns `scan_result = denied_revoked` and triggers a `scan.denied` event consumed by Module 8 (Ops) which dispatches the nearest FV to the reader. No personally identifiable info is shown on the reader display (privacy by design).
- **IF** a reader's `last_heartbeat_at` is older than 60 seconds, **THEN** the engine marks `reader.status = offline`, surfaces an OL alert in the War Room, and switches the reader to "offline cache mode" where it validates scans against its local cache (24-hour validity, refreshed nightly via OTA push from HID Origo).
- **IF** an offline reader's cache is older than `cache_expires_at`, **THEN** the reader hard-deny all scans (`denied_no_credential`) and the engine pages the FV to direct attendees to the nearest online reader. This is the safety failure mode.
- **IF** a `session_specific` credential is scanned outside the session's time window, **THEN** the engine returns `denied_expired` and suggests (via reader display) the session start time and the nearest waiting area.
- **IF** an attendee scans for egress from a zone they never ingressed (orphan egress), **THEN** the engine logs the event with a warning flag, does NOT decrement occupancy below 0, and surfaces the anomaly in the War Room for OL review (potential badge sharing or scan gaming).

**Edge Case 1: Credential revoked mid-event, push within 60 seconds (non-obvious).** A Minister is removed from the closing panel by the Protocol Officer at 14:32:00 (break-glass: PO + ED co-approval because protocol_rank = 3). The PO clicks "Revoke Plenary Backstage" in the Registration Console. The engine immediately: (1) sets `credential.status = revoked` and `revoked_at = now()` for the Speaker Backstage credential scoped to that session, (2) publishes `credential.revoked` on Kafka, (3) the reader-management service consumes this and pushes a revocation command to every reader (`reader_id_list`) currently online via the HID Aero X110 management API, targeting a 60-second deadline. (4) For readers that are offline, the revocation is queued in HID Origo and applied on the next heartbeat (typically within 5 minutes). (5) **IF** the attendee attempts to scan at a reader that has already received the revocation push, the scan returns `denied_revoked` and a `scan.denied` event flows to Module 8, dispatching an FV to intercept. **IF** the attendee scans at an offline reader whose cache still has the credential as valid (cache older than the revocation), the attendee is incorrectly admitted; on the next heartbeat sync, the engine detects the post-revocation ingress via `device_local_seq` reconciliation, marks the scan_event with `result_override = should_have_been_denied` (audit only, cannot unwind the physical admission), and pages the OL + PO with a severity s2 incident. The reconciliation worker runs every 60 seconds during event hours.

**Edge Case 2: Zone at capacity, "one out, one in" enforcement (non-obvious).** The VIP Lounge (max_capacity = 80, current_occupancy = 80) receives 14 standing attendees at the ingress reader at 16:14:00. The engine returns `denied_capacity` for all 14, opens a queue, and assigns positions 1-14. The reader's e-ink panel displays "VIP Lounge at capacity. You are in position N. Estimated wait: ~12 minutes." Each attendee's Mobile App receives a push notification with the same information. At 16:18:22, an egress scan decrements occupancy to 79. The engine atomically: (1) admits queue position 1 (push notification + reader display "Position 1, please proceed"), (2) increments occupancy to 80, (3) shifts queue positions down by 1, (4) recomputes estimated wait for remaining 13. **IF** position 1's attendee does not scan within 90 seconds (timeout), the engine expires the admission, re-admits position 2 as the new position 1, and moves the original position 1 to the back of the queue (or marks them as "no-show" if they had departed the area, detected via Mobile App geofence). **IF** a protocol_rank 1-2 dignitary arrives and the queue is non-empty, the PO may invoke break-glass to admit them ahead of the queue; the bumped attendee at position 1 receives an apology toast and an expedited admission on the next egress.

### E. Third-Party Integrations

- **HID Global Origo (cloud credential management):** Bi-directional. The engine pushes credential issuance / revocation events to HID Origo via REST; Origo distributes to panels and readers globally. Pull: device inventory and firmware status. mTLS with client certificate issued by HID PKI.
- **HID Aero X110 card readers:** Outbound commands from the engine via the Aero X110 management API (revocation push, firmware OTA, config update). Inbound scan events via the Aero X110 webhook (signed). The 60-second revocation SLA is enforced by the Aero X110's real-time channel.
- **HID iCLASS SE readers (legacy / offline-capable):** Used at lower-traffic zones. Validated via the offline cache, refreshed nightly via a bulk export from the engine to the reader's internal SQLite over USB by an FV. Cache includes a 24-hour validity window and a cryptographic signature (HMAC SHA-256, key per reader rotated weekly).
- **Zebra TC52 mobile scanners:** Used by FVs for ad-hoc validation (e.g., at a VIP entrance without a fixed reader). The Zebra DataWedge app on the TC52 reads the badge QR, calls the engine's `/validate-credential` endpoint via 5G/LTE, and displays the result. Offline mode: caches the last 1,000 validated credentials with 10-minute TTL.
- **Genetec Security Center (PACS integration):** Outbound. The engine publishes `credential.issued`, `credential.revoked`, and `scan.denied` events to Genetec via the Security Center SDK, allowing the venue's existing security operations center to see FMF access events alongside CCTV. Integration is read-only from Genetec's perspective (Genetec does not write back to FMF).
- **LenelS2 OnGuard (alternative PACS):** Same integration pattern as Genetec; chosen per tenant. The Integration Hub abstracts both behind a single connector.
- **AWS KMS:** Envelope encryption for `qr_payload` and TOTP secrets (VIP rotating QR mode).
- **Kafka:** Topics `credential.issued`, `credential.revoked`, `credential.expired`, `scan.ingress`, `scan.egress`, `scan.denied`, `reader.online`, `reader.offline`. Retention 7 years.

### F. UI/UX Notes

- **Access Control Console (OL, PO, ED):** Live venue map (Mapwize indoor) overlaid with zone occupancy heat (green / amber / red). Clicking a zone shows the active credentials list (filterable by registration_type), the reader list with status, and the last 50 scans. Break-glass revocation panel for PO with required reason field.
- **Reader display (attendee-facing):** 7-inch e-ink panel. States: "Welcome [first name]" on grant, "Access denied - please see staff" on deny (no reason shown), "VIP Lounge at capacity, position 3, ETA 12 min" on queue.
- **War Room tile (ED, OL):** Real-time throughput (scans/min) line chart, denial rate (%), zone occupancy heatmap, top 5 zones by denial count, top 5 readers by latency.
- **Mobile App (ATT):** "My Access" page lists active credentials as cards (zone name, time window, status). Tap-to-navigate to the zone via Mapwize. Push notifications on queue position updates.
- **Shadow App (VL):** Shows the dignitary's credentials and a "next access" timeline ("Plenary Backstage at 14:55 - 16:30").
- **Accessibility:** Reader displays support high-contrast and large-text modes via a tactile button on the reader housing. Audio guidance via headphone jack on the reader for visually impaired attendees.

### G. Failure Modes & Offline Behavior

- **HID Origo cloud down:** Readers continue operating on their cached credentials (24-hour validity). Revocations are queued in the engine's outbox table and pushed when Origo recovers. SLA degradation: revocation push goes from 60s to "next reader heartbeat" (up to 5 min). OL sees a "Degraded - revocations delayed" warning.
- **Reader offline (single):** Engine routes attendees to the nearest online reader (Mobile App push + physical signage). Anomalous scans at the offline reader during the offline window are reconciled on reconnect.
- **Reader offline (cluster, e.g., power loss in a wing):** OL triggers a contingency plan: FVs with Zebra TC52 mobile scanners take over the affected entrances. Engine switches the affected zone to "manual validation mode" where FVs scan and the engine validates server-side (requires LTE coverage; if LTE also down, FVs use a printed list with hourly refresh).
- **Kafka consumer lag (scan events back up):** The engine writes scan_events directly to PostgreSQL (primary) and publishes to Kafka asynchronously. Occupancy materialization reads from a Redis counter updated synchronously. Kafka lag does not impact the access decision path.
- **Redis failure (occupancy counter lost):** Engine falls back to a `SELECT count(*)` query against `scan_event` for the zone (slower, ~200ms vs 5ms). Throughput drops but access continues. PagerDuty pages SRE.
- **Zone capacity mis-configured (max_capacity set too low):** PO/OL can issue a temporary override with a documented reason and ED notification. Override expires in 4 hours by default, requiring renewal.
- **Mobile App push delivery failure (queue position not received):** The reader display is the primary surface; the push is a convenience. Attendees within geofence of the reader see the position on the reader display.

### H. Acceptance Criteria

- **Given** a confirmed attendee registration with `registration_type = attendee`, **when** the `registration.confirmed` event is processed, **then** the engine materializes credentials per the `credential_template` for `attendee` type within 5 seconds, publishes one `credential.issued` event per credential, and the attendee's badge QR (issued in Module 6.3) encodes all active credential IDs.
- **Given** a Minister whose Speaker Backstage credential for the closing panel is revoked by the PO at 14:32:00 (with ED break-glass co-approval), **when** the engine processes the revocation, **then** all online readers with the credential in their cache receive the revocation push within 60 seconds, the credential `status` is set to `revoked`, and a `credential.revoked` event is published with the actor identities and reason captured in `audit_log`.
- **Given** the VIP Lounge at max_capacity = 80 with current_occupancy = 80 and 14 attendees queued, **when** a single egress scan decrements occupancy to 79, **then** the engine admits queue position 1 (push notification + reader display), increments occupancy back to 80, and recomputes estimated wait for the remaining 13 with a 90-second admission timeout on position 1.
- **Given** a reader whose `last_heartbeat_at` is older than 60 seconds, **when** the engine detects the staleness, **then** the reader's status moves to `offline`, an OL alert surfaces in the War Room, the reader switches to local cache validation, and `cache_expires_at` is enforced strictly (deny-all after expiry).
- **Given** a `floor`-level credential with `inheritance_mode = grant_to_children`, **when** the attendee scans at any child `zone` or `sub_zone` reader, **then** access is granted unless an explicit `deny_to_children` override credential exists for that specific child zone, in which case the override wins and the scan is denied with `denied_no_credential`.
