> Module 4: Content & Stage Management System -> 4.3 Live Streaming & Broadcast Control

## Live Streaming & Broadcast Control

### A. Purpose Statement

The Live Streaming & Broadcast Control subsystem is the operational surface for multi-destination video distribution during the Forum. At FMF scale, every plenary session is streamed to 4+ destinations simultaneously: YouTube Live (public), the FMF mobile app (registered attendees), the partner broadcaster feed (Saudi TV for FMF), and internal overflow rooms in the venue. Peak concurrent viewership exceeds 80,000; a 15-second stream dropout during a ministerial announcement can trigger a 4% swing in the social-media conversation as viewers flip to alternative feeds.

This subsystem exists so that the broadcast director can monitor all destinations in one surface, switch shots via Program/Preview semantics, recover from any single-destination failure within 15 seconds without viewer interruption on the surviving destinations, and have an unambiguous panic control to mute all mics and roll back 30 seconds of pre-mute audio for forensic review. It is distinct from the Stage Run-Sheet Engine (4.1), which orchestrates operator cues; this subsystem consumes those cues and produces the actual encoded video/audio streams.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all stream health metrics and broadcast director actions. Write only via break-glass to forcibly end a stream (e.g., a diplomatic incident requiring immediate blackout), with two-person approval (ED + CSM). Sees a "Stream Health" tile in the War Room showing per-destination status, total viewer count, and any active incidents.
- **Operations Lead (OL):** Read-only on stream health; cannot operate the broadcast director console.
- **Protocol Officer (PO):** No direct access. Receives a `stream.blackout.requested` event if ED initiates one for diplomatic reasons.
- **VIP Liaison (VL):** Read-only on whether their assigned dignitary's session is currently being streamed, surfaced in the Shadow App as "Your dignitary is now on the live public stream."
- **Registration Manager (RM):** Read-only on aggregate viewer count for the Mobile App destination; cannot see other destinations.
- **Sponsorship Sales Lead (SSL):** Read-only on the public YouTube Live viewer count and the sponsor-branded pre-roll status. No access to broadcast director controls.
- **Exhibitor Portal User (EPU):** No access.
- **Content & Stage Manager (CSM):** Primary owner. Read/write on stream destinations, encoder configurations, caption settings, and broadcast director console state. Can initiate a stream failover. Cannot self-approve a forced stream end.
- **Matchmaking Concierge (MC):** No access.
- **Finance & Administration Lead (FAL):** Read-only on streaming infrastructure cost telemetry (egress bandwidth, encoder minutes) for post-event cost reconciliation.
- **Marketing & PR Lead (MPL):** Read-only on YouTube Live viewer count and chat sentiment feed for social media monitoring. Cannot operate broadcast controls.
- **ESG & Sustainability Officer (ESGO):** Read-only on streaming energy consumption projections (encoder kWh) for the ESG report.
- **Field Volunteer (FV):** No access.
- **Attendee (ATT):** For ATT joining a stream, read-only on the player view; no access to broadcast internals.

### C. Data Model

`stream_destination` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{youtube_broadcast_id, mux_live_stream_id, ivs_channel_arn}` |
| `audit_log` | `jsonb[]` | Append-only |
| `session_id` | `uuid` | FK -> session.id |
| `destination_type` | `enum[youtube_live, mobile_app, partner_broadcaster, overflow_room, internal_archive]` | Functional classification |
| `vendor` | `enum[youtube, mux, aws_ivs, vimeo_live, wowza, self_hosted, saudi_tv_srt]` | Concrete provider |
| `stream_key_ref` | `text` | AWS Secrets Manager ARN holding the actual key |
| `ingest_url_primary` | `text` | Primary RTMP/SRT endpoint |
| `ingest_url_backup` | `text null` | Backup endpoint (different region or vendor) |
| `bitrate_kbps` | `int` | Target encode bitrate |
| `codec` | `enum[h264, hevc, av1]` | Default h264 for compatibility |
| `audio_channels` | `enum[mono, stereo, 5_1]` | Default stereo |
| `caption_mode` | `enum[embedded_cea_608, webvtt_sidecar, none]` | Default webvtt_sidecar for mobile app |
| `is_active` | `bool` | Currently streaming |
| `started_at` | `timestamptz null` | Stream start |
| `ended_at` | `timestamptz null` | Stream end |
| `viewer_count` | `int` | Latest viewer count (polled every 15 seconds) |
| `health_status` | `enum[healthy, degraded, critical, offline]` | Aggregate state |

`stream_health_sample` (extends shared columns, time-series optimized):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | System |
| `updated_by` | `uuid` | System |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | Empty for system-generated |
| `audit_log` | `jsonb[]` | Append-only |
| `destination_id` | `uuid` | FK -> stream_destination.id |
| `sampled_at` | `timestamptz` | Sample timestamp |
| `bitrate_kbps` | `int` | Observed bitrate |
| `dropped_frames` | `int` | Cumulative since last sample |
| `audio_level_lufs` | `numeric(5,1)` | EBU R128 momentary loudness |
| `viewer_count` | `int` | At sample time |
| `latency_to_ingest_ms` | `int` | Round-trip to ingest endpoint |
| `notes` | `text null` | Anomaly notes |

`broadcast_director_state` (extends shared columns, singleton per session):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{obs_scene_collection_id, atem_mix_effect_block}` |
| `audit_log` | `jsonb[]` | Append-only |
| `session_id` | `uuid` | FK -> session.id |
| `program_source` | `enum[camera_1, camera_2, camera_3, speaker_slides, remote_zoom, lower_third_overlay, fallback_slide]` | Currently on program |
| `preview_source` | `enum[camera_1, camera_2, camera_3, speaker_slides, remote_zoom, lower_third_overlay, fallback_slide]` | Next-up source |
| `program_changed_at` | `timestamptz` | When current source went to program |
| `audio_mute_state` | `jsonb` | Per-mic mute state, e.g., `{mic_minister: false, mic_moderator: true}` |
| `panic_mute_active` | `bool` | True when director has hit panic mute |
| `pre_mute_buffer_start` | `timestamptz null` | Start of the 30-second pre-mute buffer |
| `pre_mute_buffer_asset_id` | `uuid null` | FK -> content_asset.id after buffer is saved |
| `caption_language_pairs` | `jsonb[]` | e.g., `[{source: "en", target: "ar"}, {source: "en", target: "fr"}]` |

`stream_incident` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | System or actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{pagerduty_incident_id, youtube_incident_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `destination_id` | `uuid null` | FK -> stream_destination.id, if incident is destination-bound |
| `session_id` | `uuid` | FK -> session.id |
| `incident_type` | `enum[ingest_unreachable, bitrate_drop, audio_feedback, caption_failure, panic_mute, forced_blackout]` | Classification |
| `severity` | `enum[s0, s1, s2, s3]` | Aligns with Module 1.2 |
| `detected_at` | `timestamptz` | Detection |
| `failover_action` | `text` | e.g., "Switched YouTube primary ingest to backup Mux endpoint in 11.4s; mobile app viewers saw no interruption" |
| `resolved_at` | `timestamptz null` | Resolution |

### D. Business Logic & Edge Cases

- **IF** a stream destination's `health_status` degrades from healthy to degraded (bitrate drops below 80% of target OR dropped frames exceed 1% in a 30-second window), **THEN** the broadcast director's console highlights the destination in amber and emits a `stream.health.degraded` event.
- **IF** `health_status` transitions to critical (bitrate below 50% OR ingest unreachable for more than 5 seconds), **THEN** the engine initiates the auto-failover sequence for that destination.
- **IF** auto-failover is initiated, **THEN** the engine: (1) within 15 seconds activates the backup ingest endpoint (different vendor if configured, e.g., YouTube primary -> Mux backup); (2) preserves the encoder output so surviving destinations see no interruption; (3) creates a `stream_incident` with `severity = s1`; (4) pages the on-call broadcast engineer via PagerDuty; (5) emits `stream.failover.completed` when the backup is live.
- **IF** the broadcast director hits the panic mute button, **THEN** the engine: (1) immediately mutes all microphone sources on the program bus; (2) starts a 30-second pre-mute buffer capture (the engine continuously records the last 30 seconds of program audio in a rolling buffer); (3) sets `panic_mute_active = true`; (4) creates a `stream_incident` with `incident_type = panic_mute` and `severity = s0`; (5) pages ED, CSM, and on-call AV engineer; (6) displays a "PANIC MUTE ACTIVE - restore mics one at a time" overlay on the director console.
- **IF** the director restores mics after panic mute, **THEN** the engine enforces one-at-a-time restoration: each mic unmute requires a deliberate tap with a 1.5-second inter-mic delay; the pre-mute buffer is committed to S3 as a content_asset and the asset_id is written to `pre_mute_buffer_asset_id` for post-event forensic review.
- **IF** a caption failure is detected (no caption data for 30 seconds while audio is present), **THEN** the engine falls back from DeepL to Microsoft Translator; if both fail, the broadcast director is alerted and captions are marked "temporarily unavailable" in the player.
- **IF** program source is changed (cut from camera_1 to camera_2), **THEN** the engine records the change in `broadcast_director_state.audit_log` within 100 milliseconds and publishes `stream.program.changed` for downstream analytics.

**Edge case (non-obvious): YouTube Live ingest endpoint goes down mid-stream.** The YouTube Live RTMP ingest at `a.rtmp.youtube.com` returns TCP RST during a ministerial keynote, detected by the encoder's heartbeat probe within 4 seconds. The engine's auto-failover sequence activates: the encoder's secondary output (already configured to push to Mux's ingest endpoint as backup) is promoted to primary for the YouTube destination by updating the YouTube-side broadcast to point at the Mux-hosted HLS pull (via YouTube's `liveBroadcast.bind` API within 7 seconds); the mobile app, which was already pulling from Mux directly, sees no interruption; the partner broadcaster (Saudi TV) is on a separate SRT circuit and is unaffected. Total viewer-perceived downtime on the YouTube destination: 0 seconds for viewers who joined the new Mux-backed stream; up to 15 seconds for viewers who held the old YouTube player (the YouTube player shows a brief buffering state). The engine creates a `stream_incident` with `incident_type = ingest_unreachable`, `severity = s1`, and `failover_action = "YouTube primary RTMP failed; promoted Mux HLS as YouTube source via liveBroadcast.bind; mobile_app viewers uninterrupted; YouTube player perceived 11s buffering"`. The on-call broadcast engineer is paged; the YouTube primary ingest is monitored for recovery and, when stable for 5 minutes, the engine reverses the failover to restore YouTube-native ingest.

**Edge case (non-obvious): audio feedback loop during a panel.** A panel of 4 ministers with 4 lavalier mics; one mic gets too close to a stage monitor and a 1.2 kHz feedback loop builds within 3 seconds. The broadcast director hits the panic mute button. All 4 mics mute instantly on the program bus. The 30-second pre-mute buffer (containing the feedback buildup and the last words of the speaker who triggered it) is committed to S3. The director identifies the offending mic (camera op reports which minister was near the monitor) and restores the other 3 mics one at a time over 4.5 seconds. The offending mic is left muted; the Stage Manager (Module 4.1) is notified via `stream.audio.panic_mute` event so they can swap the mic physically. The session continues with 3 live mics; the audience hears a brief 4-second silence. Post-event, the pre-mute buffer is reviewed in the ESG and AV post-mortem to identify whether monitor placement or mic gain was the root cause.

### E. Third-Party Integrations

- **YouTube Live API (Data API v3 + Live Streaming API):** Programmatic broadcast creation, stream key rotation, bind operations for failover. Data flow: engine -> YouTube (broadcast create, bind); YouTube -> engine (viewer count poll every 15 seconds, health webhook).
- **Mux:** Self-hosted primary or backup streaming. Data flow: encoder -> Mux (RTMP ingest); Mux -> engine (Live Stream API webhooks for active/idle/ended); Mux -> mobile app (HLS playback).
- **AWS IVS (Interactive Video Service):** Alternative self-hosted stream with sub-3-second latency. Data flow: encoder -> IVS (RTMP ingest); IVS -> mobile app (LL-HLS playback).
- **Vimeo Live:** Tertiary backup for high-stakes sessions. Data flow: encoder -> Vimeo Live (RTMP ingest); Vimeo -> engine (health webhook).
- **Wowza Streaming Engine:** On-prem transcoder for in-venue overflow rooms and partner broadcaster contribution feeds (SRT output to Saudi TV). Data flow: encoder -> Wowza (SRT ingest); Wowza -> overflow room displays (RTSP); Wowza -> Saudi TV (SRT push).
- **StreamYard:** Remote speaker contribution for panelists who cannot attend in person but are not on the Zoom Webinars track. Data flow: StreamYard -> engine (RTMP output as a source); engine -> program bus.
- **NewTek NDI:** In-venue IP video for camera sources. Data flow: NDI camera -> NDI discovery -> OBS NDI source -> program bus.
- **DeepL API:** Live caption translation. Data flow: engine (audio -> text via AWS Transcribe or Whisper) -> DeepL (text -> text translation); DeepL -> engine (translated text); engine -> player (WebVTT sidecar).
- **Microsoft Translator (Azure Cognitive Services):** Caption fallback. Data flow: same as DeepL with a 30-second timeout triggering fallback.
- **OBS Studio / vMix:** Encoder and scene composition. Data flow: engine -> OBS/vMix (scene switch via WebSocket); OBS/vMix -> destinations (RTMP/SRT output).
- **Blackmagic ATEM:** Camera switching hardware. Data flow: engine -> ATEM (Program/Preview via TCP); ATEM -> OBS (NDI output).
- **AWS KMS:** Column-level encryption for `stream_key_ref` references and any credentials stored in `ext_refs`.
- **Kafka topics:** Publishes `stream.started`, `stream.health.degraded`, `stream.health.critical`, `stream.failover.completed`, `stream.program.changed`, `stream.audio.panic_mute`, `stream.incident.raised`, `stream.ended`. Subscribes to `session.cue.fired` (Module 4.1), `speaker.session_started` (Module 4.2), `speaker.consent.denied` (Module 4.2).
- **AWS S3:** Pre-mute buffer and incident recording archive. Data flow: engine -> S3 (rolling buffer commit on panic mute).

### F. UI/UX Notes

The broadcast director's console is a multi-pane full-screen surface intended for a 43-inch ultrawide monitor in the broadcast control room. Top pane: program output (large) and preview output (smaller, beside it), both live video. Middle pane: a grid of all stream destinations, each cell showing destination name, vendor logo, health status indicator (green/amber/red dot), bitrate, dropped frames %, audio level (EBU R128 momentary meter), and viewer count. A red "PANIC MUTE" button sits center-screen, large enough for a deliberate two-finger tap, with a 1.5-second hold-to-confirm to prevent accidental trigger. Bottom pane: caption preview in all configured language pairs, the source selector (camera_1, camera_2, speaker_slides, etc.), and the audio mixer per-mic faders with mute buttons.

The CSM's companion view (smaller, on a tablet) shows a simplified version: program/preview, destination health grid, and a "request panic mute" button that requires the broadcast director's confirmation on the main console.

The ED's War Room tile shows: total concurrent viewers across all destinations, count of healthy/degraded/critical/offline destinations, count of active stream incidents, and a red flashing border if any incident is `severity = s0`.

The mobile app's player view is simple: video, caption language selector, and a "report an issue" button that opens a quick form (pre-populated with destination, timestamp, and session_id) feeding the `stream_incident` table.

### G. Failure Modes & Offline Behavior

- **All destinations unreachable simultaneously (encoder failure):** The engine immediately falls back to the "fallback slide" program source (a static slide with the FMF logo and "Technical difficulty - please stand by" in English and Arabic). The CSM is paged. The pre-mute buffer equivalent (last 5 minutes of program) is committed to S3. Recovery requires either encoder restart or hot-swap to the backup encoder (configured in warm standby with the same scene collection).
- **Mobile app HLS playback failure on attendee devices:** The mobile app player retries 3 times with exponential backoff, then surfaces a "Stream issue - try the YouTube Live alternative" link with the YouTube URL prefilled. The engine logs the playback failure for post-event analytics.
- **Caption vendor rate limit (DeepL returns 429):** The engine throttles caption submission to 80% of the rate limit and falls back to Microsoft Translator for overflow; if both fail, the player shows "Captions temporarily unavailable" with a 60-second retry.
- **ATEM disconnects (camera switching hardware):** The engine falls back to OBS scene switching via NDI sources within 3 seconds; a banner reads "Camera switcher offline - using OBS fallback. Some transitions may be slower."
- **Panic mute triggered accidentally:** The director can cancel the panic mute within 5 seconds via a "Cancel Panic Mute" button that requires the same two-finger hold; the pre-mute buffer is still committed (for forensic completeness) but no incident is created if cancellation occurs within the 5-second window.
- **Network partition between broadcast control room and the cloud Kafka cluster:** The broadcast console operates on a local Redis cache of the director state; all program changes, mute events, and source switches are written locally and replayed to Kafka on reconnect with original timestamps. The destinations continue to receive encoder output (which is on the same LAN as the encoder, unaffected by the cloud partition).

### H. Acceptance Criteria

- **Given** a live YouTube Live destination with the YouTube RTMP ingest returning TCP RST, **When** the engine detects the failure within 4 seconds, **Then** the auto-failover activates Mux as the YouTube source via `liveBroadcast.bind` within 15 seconds, mobile app viewers see no interruption, a `stream_incident` with `severity = s1` is created, and the on-call broadcast engineer is paged.
- **Given** a 4-minister panel with audio feedback on one mic, **When** the broadcast director hits the panic mute button, **Then** all 4 mics mute within 200 milliseconds, the 30-second pre-mute buffer is committed to S3, a `stream_incident` with `incident_type = panic_mute` and `severity = s0` is created, ED/CSM/on-call AV are paged, and the director console shows a "PANIC MUTE ACTIVE" overlay with one-at-a-time restore controls.
- **Given** a session with `caption_mode = webvtt_sidecar` and DeepL as the translation provider, **When** DeepL returns HTTP 429 for more than 30 seconds, **Then** the engine throttles DeepL to 80% of rate limit and routes overflow to Microsoft Translator, captions remain visible in the player with no more than a 2-second additional latency, and the broadcast director sees a "caption provider degraded" advisory.
- **Given** a broadcast director switching program from camera_1 to speaker_slides, **When** the source change is committed, **Then** the change is recorded in `broadcast_director_state.audit_log` within 100 milliseconds, `stream.program.changed` is published on Kafka, and the program_changed_at timestamp updates.
- **Given** a forced stream end initiated by the ED via break-glass for a diplomatic incident, **When** the ED submits the request with justification and the CSM co-approves via second-factor push notification, **Then** all destinations receive an end-stream command within 5 seconds, the player surfaces "Stream ended" to viewers, the recording stops, and the action is logged with both approver identities and the justification in the audit trail.
