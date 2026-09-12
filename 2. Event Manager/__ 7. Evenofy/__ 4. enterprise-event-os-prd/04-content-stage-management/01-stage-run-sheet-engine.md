> Module 4: Content & Stage Management System -> 4.1 Stage Run-Sheet Engine

## Stage Run-Sheet Engine

### A. Purpose Statement

The Stage Run-Sheet Engine is the per-session operational script for a single stage during a single session. It differs from the Module 1.3 Live Run-of-Show Engine, which is event-wide and binds sessions, breaks, F&B, security, and protocol cues into a single timeline. This engine goes one level deeper: it orchestrates the second-by-second AV, lighting, camera, microphone, lower-third, and music cues that operators execute during a single session on a single stage.

At FMF scale, the Forum operates 6 concurrent stages across 3 venues. Each stage session has between 40 and 220 discrete cues. A ministerial keynote with 4 supporting speakers averages 180 cues over 45 minutes. With 60+ ministerial speakers across 3 days, the System must reliably execute tens of thousands of cue transitions without operator confusion, missed walk-on music, or microphone cross-fade errors that can become diplomatic incidents when a Minister's mic cuts out mid-sentence. The engine exists so that cue authoring, rehearsal, and live execution are codified, version-controlled, and recoverable from any operator workstation failure within 90 seconds.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all stage run sheets. Write only via break-glass to skip or insert a cue affecting a rank 1-2 dignitary's stage time, with two-person approval (ED + CSM). Sees a "Live Cue Health" tile in the War Room showing per-stage current cue, drift, and active AV incidents.
- **Operations Lead (OL):** Read-only on all run sheets; sees the multi-stage matrix view for resource conflict detection. Cannot edit cues.
- **Protocol Officer (PO):** Read-only on the cues that affect dignitary walk-on, walk-off, and stage precedence. Cannot edit AV cues.
- **VIP Liaison (VL):** Read-only on the "next cue" affecting their assigned dignitary (e.g., "walk-on music in 90 seconds"), surfaced in the Shadow App.
- **Registration Manager (RM):** No access.
- **Sponsorship Sales Lead (SSL):** No access. Sponsor branding cues (lower-third logos) are authored by the CSM and exposed to SSL as a read-only PDF preview only.
- **Exhibitor Portal User (EPU):** No access.
- **Content & Stage Manager (CSM):** Primary owner. Read/write on all run sheets, cue lists, operator assignments, rehearsal logs, and AV incident records. Cannot self-approve a break-glass cue skip on a dignitary session.
- **Matchmaking Concierge (MC):** No direct access. Receives a `session.started` and `session.ended` event stream for syncing meeting scheduling.
- **Finance & Administration Lead (FAL):** No access.
- **Marketing & PR Lead (MPL):** Read-only on the published run sheet PDF for press scheduling; no access to live cue state.
- **ESG & Sustainability Officer (ESGO):** Read-only on energy-consumption projections derived from cue lists (used for the post-event carbon report).
- **Field Volunteer (FV):** Read-only on the "session start in N minutes" tile in the Staff App for usher timing; no access to internal cues.
- **Attendee (ATT):** No access to cue lists. Sees only the public session start time in the Mobile App.

### C. Data Model

`stage_run_sheet` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{ros_session_id, qlab_workspace_id, obs_scene_collection_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `session_id` | `uuid` | FK -> session.id (the Module 4 session this sheet executes) |
| `stage_id` | `uuid` | FK -> stage.id; a physical stage in a physical venue |
| `name` | `text` | e.g., "Day 2 Plenary Keynote - Minister of Energy" |
| `status` | `enum[draft, rehearsal, live, completed, archived]` | Lifecycle |
| `locked_at` | `timestamptz null` | When sheet transitioned to live; immutable afterward except via break-glass |
| `parent_version_id` | `uuid null` | For variant chains (Plan A / B / C) |
| `rehearsal_mode` | `bool` | When true, cue fires record timestamps without going to hardware |
| `total_estimated_duration_s` | `int` | Sum of cue durations; recomputed on save |

`cue` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{qlab_cue_id, atem_macro_id, gpip_closure_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `run_sheet_id` | `uuid` | FK -> stage_run_sheet.id |
| `sequence` | `int` | 1-based order within the sheet |
| `cue_type` | `enum[lighting, av, camera, microphone, lower_third, walk_on_music, walk_off_music]` | Functional classification |
| `name` | `text` | Operator-readable label, e.g., "Speaker 2 walk-on - Track A" |
| `trigger_mode` | `enum[time_based, manual, on_speaker_start, on_previous_complete]` | How the cue is fired |
| `trigger_offset_s` | `int null` | For time_based: seconds from session start; for on_speaker_start: seconds after speaker mic goes live |
| `duration_s` | `int` | Expected runtime (music track length, lower-third display time) |
| `operator_role` | `enum[lighting_op, av_tech, camera_op, stage_manager]` | Default filter for operator console |
| `operator_user_id` | `uuid null` | Named operator; null = any qualified operator |
| `hardware_target` | `jsonb` | e.g., `{device: "QLab-1", cue_number: 42, channel: "A"}` |
| `depends_on_cue_ids` | `uuid[]` | Cues that must complete before this fires |
| `parallel_with_cue_ids` | `uuid[]` | Cues that fire simultaneously |
| `state` | `enum[pending, armed, fired, completed, skipped, failed]` | Live lifecycle |
| `fired_at` | `timestamptz null` | Actual fire time |
| `completed_at` | `timestamptz null` | Actual completion |
| `drift_s` | `int` | fired_at - expected_fired_at, signed |
| `rehearsal_fired_at` | `timestamptz null` | Captured during rehearsal_mode |
| `rehearsal_drift_s` | `int null` | Rehearsal drift for comparison |

`av_incident` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{pagerduty_incident_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `run_sheet_id` | `uuid` | FK -> stage_run_sheet.id |
| `cue_id` | `uuid null` | FK -> cue.id, if incident is cue-bound |
| `incident_type` | `enum[mic_failure, video_loss, audio_feedback, lighting_error, hardware_offline, manual_halt]` | Classification |
| `severity` | `enum[s0, s1, s2, s3]` | Aligns with Module 1.2 incident severity |
| `detected_at` | `timestamptz` | Detection timestamp |
| `failover_action` | `text` | e.g., "Switched RF channel 1 -> 3; backup mic live in 4.2s" |
| `resolved_at` | `timestamptz null` | When normal operation resumed |

### D. Business Logic & Edge Cases

- **IF** a cue has `depends_on_cue_ids` non-empty, **THEN** the operator console disables the FIRE button on that cue until every dependency has `state = completed`; the dependency chain is rendered visually as a directed graph.
- **IF** a cue has `parallel_with_cue_ids` non-empty, **THEN** firing any one cue in the group fires all in the group within 50 milliseconds; the group renders as a single banded row in the operator console.
- **IF** `trigger_mode = time_based` and `trigger_offset_s` has been reached on the session clock, **THEN** the cue auto-arms and the responsible operator sees a 10-second countdown; the operator must press FIRE within the window or the cue records `state = failed` with `reason = "operator_no_fire"`.
- **IF** `trigger_mode = on_speaker_start`, **THEN** the cue subscribes to the `speaker.session_started` event from Module 4.2 and arms within 100 milliseconds of that event.
- **IF** `rehearsal_mode = true`, **THEN** cue fire commands are routed to a virtual sink that records `rehearsal_fired_at` and `rehearsal_drift_s` without sending GPI closures or QLab OSC commands to hardware.
- **IF** two consecutive `walk_on_music` cues reference the same `hardware_target.asset_id` (the same music track), **THEN** the engine blocks the save and surfaces a warning at save time: "Speakers N and N+1 share walk-on track X. Suggest alternatives from the music library," with three suggested replacement tracks.
- **IF** the active cue is a `microphone` cue for a rank 1-2 dignitary and the mic RF signal drops below -75 dBm for more than 1.5 seconds, **THEN** the engine auto-fires the failover cue: it issues an OSC command to switch the receiver to backup RF channel, lights the `av_incident` row in red on the Stage Manager's view, and emits a `stream.av_incident.raised` event consumed by Module 1.2 (Incident Management).
- **IF** the operator workstation loses connection to the engine mid-session, **THEN** the workstation falls back to a local SQLite cache of the next 20 cues and continues to accept FIRE inputs, replaying the state transitions to the server on reconnect with original timestamps preserved.

**Edge case (non-obvious): speaker microphone fails mid-sentence.** A minister is mid-keynote when the primary lavalier mic RF signal drops due to a venue-wide interference burst. The engine detects the signal loss via the Shure ULXD receiver's GPIO closure and triggers the failover cue within 1.8 seconds: the backup RF channel on a different frequency band (470 MHz vs 530 MHz) goes live; the speaker's lower-third cue is re-armed so that if it had fired it remains visually consistent; the Stage Manager's console flashes the cue row red with a "MIC FAILOVER" banner and a one-tap button to confirm or escalate; the incident is logged as an `av_incident` with `severity = s1`; the live stream (Module 4.3) receives a `stream.audio.failover` event so the broadcast director can choose to mute the bad channel on the program bus; and a push notification is sent to the ED's War Room tile. The engine does NOT pause the session clock because the speaker is still speaking (audible on the backup mic) and the dignitary's time on stage is contractually protected.

**Edge case (non-obvious): walk-on music collision between consecutive speakers.** During sheet authoring, the CSM assigns the same production track to Speaker 3 and Speaker 4 walk-on cues. The engine detects this at save time by joining on `hardware_target.asset_id` across consecutive `walk_on_music` cues within the same sheet. It blocks the save with an inline warning listing both cue sequences, the track name, and three suggested replacements ranked by tempo similarity and duration match (so the operator's muscle memory for the music-to-stage-walk timing is preserved). The CSM can override the warning via a "Confirm Duplicate" button, which requires a written justification captured in `audit_log` and is surfaced as a yellow advisory on the run sheet header.

### E. Third-Party Integrations

- **QLab (Figure 53):** Lighting, sound, and video playback cues authored in QLab are mirrored to the engine via OSC (Open Sound Control) over the venue LAN. Data flow: engine -> QLab (cue fire commands); QLab -> engine (cue completed feedback via OSC `/reply`).
- **OBS Studio / vMix:** Broadcast graphics and scene switching. Data flow: engine -> OBS/vMix (scene transition triggers via WebSocket); OBS/vMix -> engine (scene-active heartbeat every 1 second).
- **Blackmagic ATEM (camera switching):** Program/Preview camera cuts. Data flow: engine -> ATEM (macro trigger via TCP); ATEM -> engine (preview and program tally state).
- **Shure Wireless Workbench / ULXD receivers:** Microphone RF health. Data flow: Shure -> engine (RF signal level, battery level, mute state via SNMP traps every 500 ms).
- **Analog GPI closures:** Hard-wired hardware triggers for failover redundancy. Data flow: hardware contact closure -> GPIO interface (Global Cache IP2CC or equivalent) -> engine webhook.
- **PagerDuty:** S0 and S1 AV incidents page the on-call AV engineer. Data flow: engine -> PagerDuty (incident create via REST API).
- **Kafka topics:** Publishes `session.cue.fired`, `session.cue.completed`, `session.cue.failed`, `stream.av_incident.raised`, `session.run_sheet.locked`. Subscribes to `speaker.session_started` (Module 4.2), `ros.session_started` (Module 1.3).
- **AWS KMS:** Column-level encryption for `hardware_target.credentials` embedded in the cue's external refs (e.g., ATEM TCP password).
- **OpenSearch:** Full-text search across cue names and incident logs for post-event review.

### F. UI/UX Notes

The Stage Manager's primary screen is a four-quadrant layout. Top-left: the live cue list, ordered by `sequence`, with the current cue highlighted in green, the next 5 cues previewed below, and completed cues dimmed with their `drift_s` shown in green/amber/red. Top-right: a stage diagram showing operator zones (lighting console, AV desk, camera positions, stage manager podium), with each zone's assigned operator's name and a live presence indicator (green if logged in, amber if idle > 2 min, red if disconnected). Bottom-left: the AV incident log, scrolling, with each row colored by severity and a one-tap "acknowledge" button. Bottom-right: the rehearsal-vs-live drift chart, plotting rehearsal `drift_s` against live `drift_s` per cue for the current sheet.

Each operator's filtered view defaults to showing only cues where `operator_role` matches their role; a "Show All Cues" toggle at the top of their screen reveals the full sheet for situational awareness. The FIRE button is large, color-coded by cue type (blue for AV, amber for lighting, green for camera, purple for microphone, white for lower-thirds, orange for music), and requires a single tap in live mode and a confirmation tap in rehearsal mode.

The CSM's authoring surface is a horizontal swimlane editor: one swimlane per `operator_role`, with cues placed on a time axis. Dragging a cue vertically reassigns the operator; dragging horizontally adjusts `trigger_offset_s`. Dependencies render as curved arrows between cues; parallel groups render as a single banded box. The save button runs all validation rules (dependency cycle detection, music collision detection, mandatory-field check) and reports violations inline before committing.

### G. Failure Modes & Offline Behavior

- **QLab workstation crash:** The engine detects loss of OSC heartbeat within 5 seconds and immediately pages the AV tech via PagerDuty. The CSM's console shows the failing workstation in red. The operator can manually trigger cues from the engine UI, which sends the same OSC commands to the backup QLab workstation (configured in hot standby via QLab's show control sync).
- **ATEM network disconnect:** The engine falls back to OBS scene switching if ATEM is unreachable for more than 3 seconds, with a banner: "Camera switcher offline; using OBS fallback. Manual camera cuts available." The broadcast director (Module 4.3) is notified.
- **Shure Wireless Workbench offline:** The engine cannot perform mic-failover detection; the Stage Manager's view shows "Mic health monitoring offline - manual watch required" and the operator must visually monitor signal LEDs on the receiver front panel. The failover cue remains armed but requires manual trigger.
- **Engine-to-operator network loss:** Each operator workstation has a local SQLite cache of the next 20 cues; FIRE inputs are timestamped locally and replayed on reconnect. The operator sees a "DEGRADED - OFFLINE BUFFER" banner but can continue working.
- **Cue fire command lost in transit (rare, but possible on congested venue LAN):** The engine uses an idempotency key per cue fire and expects an OSC `/reply` within 2 seconds; if no reply, the engine retries once and then alerts the operator with a "Confirm cue fired?" dialog. The operator's tap on "Confirm" writes `fired_at` with the original timestamp; "Retry" re-issues the OSC command.
- **Rehearsal mode accidentally left on:** If the sheet is locked to live but `rehearsal_mode = true`, the engine blocks the transition and surfaces: "Rehearsal mode is active. Disable before going live." This guard prevents a stage manager from accidentally running a real session with cues going to a virtual sink.

### H. Acceptance Criteria

- **Given** a run sheet in `draft` status with two consecutive `walk_on_music` cues referencing the same `asset_id`, **When** the CSM presses Save, **Then** the save is blocked, a warning lists both cue sequences and the duplicated track name, and three replacement tracks are suggested ranked by tempo and duration match.
- **Given** a live session with a `microphone` cue for a rank 1 dignitary and the Shure ULXD receiver reports signal below -75 dBm for 1.5 seconds, **When** the failover cue auto-fires, **Then** the backup RF channel goes live within 2 seconds, an `av_incident` with `severity = s1` is created, the Stage Manager's cue row flashes red with "MIC FAILOVER", the live stream module is notified via `stream.audio.failover`, and a push notification reaches the ED's War Room tile.
- **Given** a cue with `depends_on_cue_ids = [A]` and cue A in `state = pending`, **When** the operator attempts to fire the dependent cue, **Then** the FIRE button is disabled, a tooltip names the dependency, and the dependency graph renders the broken link in red.
- **Given** a sheet in `rehearsal_mode = true`, **When** the CSM attempts to transition `status` from `rehearsal` to `live`, **Then** the transition is blocked with the message "Rehearsal mode is active. Disable before going live," and the CSM must explicitly disable `rehearsal_mode` to proceed.
- **Given** the operator workstation loses connection to the engine mid-session, **When** the operator presses FIRE on the next 3 cues while offline, **Then** the FIRE events are recorded in the local SQLite cache with original timestamps, and on reconnect the engine's `cue.state` for those cues transitions to `fired` and `completed` with no manual intervention.
