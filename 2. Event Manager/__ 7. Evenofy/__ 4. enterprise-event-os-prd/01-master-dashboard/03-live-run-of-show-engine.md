> Module 1: Master Dashboard & War Room Command Center → 1.3 Live Run-of-Show Engine

## Live Run-of-Show Engine

### A. Purpose Statement

The Live Run-of-Show (ROS) Engine is the System's minute-by-minute operational script engine for every session and for the event as a whole. It transforms a static agenda into a living, time-aware control surface that tracks each cue's planned vs. actual execution, cascades drift across downstream cues, and surfaces decision points to the Content & Stage Manager (CSM) and Operations Lead (OL) before small slips become major visible failures. At FMF scale, where 60+ ministerial speakers and 100+ sovereign delegations must move through multi-venue choreography under diplomatic protocol constraints, an out-of-date ROS is the single most common cause of cascading operational incidents. This engine exists to make drift a first-class, machine-trackable phenomenon.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all ROS; write on event-level variant activation and crisis-mode overrides. Approves any variant switch that affects a dignitary's appearance.
- **Operations Lead (OL):** Read on all ROS; write on cue status (`pending`, `ready`, `in_progress`, `complete`, `skipped`, `delayed`), manual drift entry, and override of automated cascade decisions. Default owner of the event-level ROS during showtime.
- **Protocol Officer (PO):** Read on all ROS; write on protocol cues (dignitary arrival, holding-room handoff, stage entry, motorcade departure). Can veto a variant switch that violates protocol (e.g., a Plan B that puts two conflicting-rank dignitaries in the same holding room).
- **VIP Liaison (VL):** Read on cues involving their assigned dignitary; writes a structured "dignitary status" update on arrival and holding-room-ready cues. Cannot change cue status.
- **Registration Manager (RM):** Read-only on ROS; no write access.
- **Sponsorship Sales Lead (SSL):** Read-only on ROS; specifically reads cues tagged `sponsor_visible` (e.g., sponsor walk-on, sponsor logo display).
- **Exhibitor Portal User (EPU):** No access to ROS. EPU receives a derived "exhibitor access window" schedule via the Commercial module (5).
- **Content & Stage Manager (CSM):** Read/write on ROS for sessions in their scope. Primary owner of session-level ROS authoring during the pre-event phase and primary driver of live cue status during showtime. Can switch variants (Plan A/B/C) for sessions in scope with ED approval required for any change affecting a dignitary.
- **Matchmaking Concierge (MC):** Read-only; uses ROS to schedule B2B meeting windows around session cues.
- **Finance & Administration Lead (FAL):** Read-only; uses ROS to validate supplier billing windows.
- **Marketing & PR Lead (MPL):** Read-only; uses ROS to time press releases and social posts.
- **ESG & Sustainability Officer (ESGO):** Read-only; uses ROS to align waste and energy measurements with session windows.
- **Field Volunteer (FV):** Read on cues in their assigned zone; writes the `on_scene_status` field for cues they are responsible for executing (e.g., "doors open", "F&B reset complete"). Cannot change cue timing.
- **Attendee (ATT):** Read-only on a derived public agenda (session title, start time, end time, location); never sees internal cue-level detail.

### C. Data Model

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
| `ext_refs` | `jsonb` | External IDs (e.g., `{cvent_session_id, airmmeet_id}`) |
| `audit_log` | `jsonb[]` | Append-only local audit |

`run_of_show` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `session_id` | `uuid null` | FK -> session.id; null for event-level ROS |
| `scope` | `enum[event, session]` | Event-level or session-level |
| `variant_label` | `enum[plan_a, plan_b, plan_c, contingency]` | Named variant |
| `is_active_variant` | `boolean` | True if this is the currently executing variant |
| `activation_reason` | `text null` | Why a non-default variant was activated |
| `approved_by` | `uuid null` | FK -> user.id (ED for dignitary-affecting switches) |

`cue`:

| Field | Type | Notes |
|---|---|---|
| `ros_id` | `uuid` | FK -> run_of_show.id |
| `order_index` | `int` | Sequence within the ROS |
| `cue_type` | `enum[content, av, lighting, fnb, security, protocol, transport, sponsor, comms]` | Primary classification |
| `title` | `text` | Short label, e.g., "Doors open", "Speaker 2 walk-up" |
| `description` | `text` | Detailed execution notes |
| `scheduled_start` | `timestamptz` | Planned start, UTC |
| `scheduled_duration_s` | `int` | Planned duration in seconds |
| `actual_start` | `timestamptz null` | Set when status moves to `in_progress` |
| `actual_duration_s` | `int null` | Set when status moves to `complete` |
| `status` | `enum[pending, ready, in_progress, complete, skipped, delayed]` | Lifecycle |
| `drift_s` | `int` | Computed: actual_start - scheduled_start (seconds, can be negative for early) |
| `responsible_party` | `enum[CSM, OL, PO, VL, RM, AV_team, FNB_team, Security_team, Transport_team]` | Owner |
| `assigned_user_id` | `uuid null` | FK -> user.id if assigned to a specific person |
| `dependencies` | `uuid[]` | Array of cue IDs that must be `complete` before this cue can start |
| `affects_dignitary` | `boolean` | True if cue involves a dignitary |
| `dignitary_id` | `uuid null` | FK -> dignitary_profile.id if applicable |
| `cascade_strategy` | `enum[shift, compress, skip, manual]` | How downstream cues are adjusted on drift |
| `threshold_drift_s` | `int default 90` | Drift at which cascade fires |
| `on_scene_status` | `jsonb` | Structured FV update, e.g., `{ready: true, by: user_id, at: ts}` |

`variant_switch_log`:

| Field | Type | Notes |
|---|---|---|
| `switch_id` | `uuid` | PK |
| `ros_id` | `uuid` | FK -> run_of_show.id |
| `from_variant` | `enum[plan_a, plan_b, plan_c, contingency]` | Previous active variant |
| `to_variant` | `enum[plan_a, plan_b, plan_c, contingency]` | New active variant |
| `triggered_by` | `enum[csm_manual, ed_approval, drift_auto, crisis_mode]` | Why the switch happened |
| `approved_by_ed` | `boolean` | Required when `affects_dignitary = true` on any cue |
| `switched_at` | `timestamptz` | UTC |

### D. Business Logic & Edge Cases

The ROS engine enforces an explicit state machine for cues and a cascade policy for drift.

- **IF** a cue's `actual_start` is more than `threshold_drift_s` later than `scheduled_start` **AND** `cascade_strategy = 'shift'` **THEN** the System shifts all downstream cues' `scheduled_start` by the same delta, publishes a `ros.cue.drift_cascaded` event, and notifies all `responsible_party` owners whose cues moved by more than 30 seconds.
- **IF** `cascade_strategy = 'compress'` **THEN** the System redistributes the lost time across downstream cues proportionally to their `scheduled_duration_s`, never compressing any single cue below 50% of its planned duration. If compression is impossible, the System falls back to `shift` and alerts CSM.
- **IF** `cascade_strategy = 'skip'` **THEN** the System marks the next `skippable` cue (flagged at authoring time) as `skipped`, logs the skip, and notifies the responsible party.
- **IF** drift exceeds 5 minutes on any cue `affects_dignitary = true` **THEN** the System auto-creates an S2 incident and notifies PO and VL, regardless of cascade strategy.
- **IF** CSM activates a non-default variant (Plan B or Plan C) **AND** any cue in the new variant has `affects_dignitary = true` **THEN** the activation is held in `pending_approval` state until ED approves; rejection reverts to the previous variant.
- **IF** crisis mode is active **THEN** the ROS engine freezes all cue status transitions except those with `cue_type = 'security'` or `cue_type = 'protocol'`, and surfaces a "ROS frozen - crisis mode" banner to CSM.
- **IF** a session is cancelled mid-cue (e.g., a fire alarm forces evacuation during the third speaker) **THEN** the System: (a) marks the current cue as `skipped` with reason `session_cancelled`, (b) marks all remaining cues in the session as `skipped`, (c) publishes a `ros.session.cancelled` event, (d) triggers the cancellation handlers in Matchmaking (reschedules meetings), Commercial (refunds sponsor time), and Protocol (re-routes affected dignitaries). The ROS for downstream sessions is NOT automatically adjusted; OL must explicitly approve cascade.

**Non-obvious edge case:** A ministerial dignitary's arrival is delayed by 20 minutes due to an airport ground hold. The dignitary is scheduled as the keynote speaker in Session A (10:00-10:30) and is also expected at the start of Session B (10:45) for a joint photo call with another dignitary. The naive cascade would simply delay Session A by 20 minutes, but that pushes Session A's end into Session B's photo call, and protocol rules forbid a joint photo call with a delayed minister unless the second dignitary is also informed and consents.

The System's response: it computes three candidate variants in parallel and surfaces them to CSM and PO for a decision within 60 seconds:

1. **Variant "delay_a":** Shift Session A to 10:20-10:50, delay Session B photo call to 11:00, cascade the rest of the day. Cost: ~15 minutes of total day drift; risk: protocol impact if the second dignitary's departure is constrained.
2. **Variant "swap_order":** Move the second speaker of Session A into the keynote slot, keep Session A at 10:00, deliver the ministerial keynote at the end of Session A (10:20-10:30) when the dignitary arrives. Cost: minimal day drift; risk: the minister's speech is no longer the opening.
3. **Variant "stand_in":** Run Session A with a deputy minister (pre-approved stand-in) as opening, minister joins at 10:20 for a 10-minute closing remark. Cost: zero day drift; risk: visible demotion, requires minister's office approval.

The System surfaces all three variants with their tradeoffs, defaulting to the one with the least protocol risk (Variant 3 if a stand-in is approved, otherwise Variant 2). CSM and PO must jointly approve. If no decision is made within 90 seconds, the System auto-applies the default and notifies ED. The variant switch is logged in `variant_switch_log` with `triggered_by = 'drift_auto'` and the original Plan A is preserved for post-event review.

### E. Third-Party Integrations

- **Zoom and OBS:** AV cues carry deep links to the corresponding Zoom session and OBS scene. When a `cue_type = 'av'` cue moves to `in_progress`, the System pushes a "scene activate" command to OBS via the OBS WebSocket plugin and posts a "session live" status to Zoom via the Zoom API. Direction: bidirectional.
- **vMix:** Used for multi-camera productions in the Plenary Hall. The System sends scene-change triggers via the vMix TCP API based on cue start. Direction: System -> vMix.
- **Slack and Microsoft Teams:** Cue status changes for `affects_dignitary = true` cues push to a `#protocol-cues` channel. Drift-cascade events push to `#ros-cascades`. Direction: System -> Slack/Teams.
- **PagerDuty:** If drift on a dignitary cue exceeds 5 minutes and PO/VL do not acknowledge within 2 minutes, the System escalates via PagerDuty to the on-call PO. Direction: System -> PagerDuty.
- **Mapwize / Situm:** Used to track dignitary movement through the venue; the VL's phone location feeds the "dignitary on the move" cue status automatically. Direction: Mapwize/Situm -> System.
- **FlightAware:** Drives the "dignitary ETA" cue for inbound ministerial motorcades. Direction: FlightAware -> System.
- **AWS SNS:** Internal fan-out for `ros.cue.*` events to projection services and the Master Dashboard tile layer. Direction: System internal.
- **Twilio:** SMS alerts to CSM and PO when a variant-switch decision is pending. Direction: System -> Twilio.
- **Google Calendar and Microsoft Outlook:** A read-only derived calendar of the public agenda is published for ATT synchronization; internal cue-level ROS is never exported. Direction: System -> Calendar.

### F. UI/UX Notes

- **Live ROS view (War Room):** A horizontal swimlane layout. Each swimlane is a session; cues are color-coded blocks positioned on a time axis. The "now" line is a vertical red bar that scrolls leftward. The current cue in each active session is highlighted with a pulsing yellow border; the next 5 cues are outlined in blue. Drift is shown as a small `-2m` or `+1m30s` badge on each cue.
- **Cue detail card:** Clicking a cue opens a side drawer with: cue metadata, responsible party avatar, dependency graph (mini), actual vs. scheduled timing, on_scene_status updates from FVs, and a "force complete" button (gated by role).
- **Variant switcher:** A modal that shows the active variant prominently and the inactive variants as collapsed cards. Each inactive variant has a "Preview", "Activate (needs ED approval)" affordance and a "diff" view that highlights which cues change vs. the active variant.
- **Decision surface (for the non-obvious edge case above):** When a multi-variant decision is required, a modal pops up on CSM and PO screens simultaneously, showing the three variants side-by-side with their tradeoffs in a comparison table, a countdown timer (90 seconds), and "Approve" buttons per variant. A chat sidebar allows CSM and PO to confer in real time.
- **Mobile Staff App cue card:** FVs see a stack of cue cards for their zone, in order. The current cue is expanded; the next two are collapsed. Each card has a "Mark ready", "Mark complete", and "Report issue" action.
- **Kiosk mode (backstage):** A simplified full-screen view for green-room displays: large cue title, time to start countdown, responsible party avatar, and a 3-step "next up" list.

### G. Failure Modes & Offline Behavior

- **OBS plugin disconnected:** When a `cue_type = 'av'` cue tries to fire, the System detects the OBS WebSocket is unreachable, marks the cue as `delayed`, raises an S1 incident, and lets the AV team operate OBS manually. The ROS continues to track the manual operation via FV status updates.
- **Zoom API outage:** The System cannot start the live stream for a hybrid session. It marks the cue as `delayed`, raises an S1 incident, and posts a "going local-only" message to attendees via the Attendee App. The in-room portion of the session continues unaffected.
- **Mapwize / Situm offline:** Dignitary location tracking is lost. The VL is prompted to manually punch in location updates via the Shadow App. The "dignitary on the move" cue status becomes "MANUAL".
- **CSM client disconnect:** If CSM's laptop loses connection mid-show, the System does NOT auto-advance cues (no autonomous cue completion). Cues remain in their current status until CSM reconnects or OL takes over (OL can assume CSM role via a "take control" affordance that requires OL confirmation and produces an audit event).
- **Variant switch fails (ED rejection):** The System reverts to the previous variant and surfaces the rejection reason to CSM. Any cue status changes that were optimistic-applied during the pending-approval window are rolled back. The `variant_switch_log` records both the attempted switch and the rejection.
- **Drift cascade produces an impossible schedule (e.g., cue compressed below 50% or end time pushed past venue curfew):** The System halts the cascade, raises an S1 incident with `category = 'protocol'` if any dignitary is affected, and surfaces the conflict to CSM and OL for manual resolution. No cue is silently dropped.
- **Clock drift between server and client:** All cue timing is anchored to UTC server time. The client renders a countdown that adjusts for measured RTT every 5 seconds. A client clock that is more than 10 seconds off the server triggers a warning banner.

### H. Acceptance Criteria

- **Given** a cue's `actual_start` is more than 90 seconds after `scheduled_start` and `cascade_strategy = 'shift'`, **when** the drift is detected, **then** all downstream cues' `scheduled_start` are shifted by the same delta, affected responsible parties are notified within 5 seconds, and a `ros.cue.drift_cascaded` event is published.
- **Given** a dignitary cue drifts by more than 5 minutes, **when** the threshold is crossed, **then** an S2 incident is auto-created, PO and VL are notified via Slack and PagerDuty, and the cue is flagged `delayed` until acknowledged.
- **Given** CSM activates a non-default variant that contains cues with `affects_dignitary = true`, **when** the activation is requested, **then** the System holds the switch in `pending_approval` state, sends an approval request to ED, and reverts to the previous variant if ED does not respond within the configured SLA (default 5 minutes).
- **Given** a ministerial dignitary's arrival is delayed by 20 minutes in a way that conflicts with the next session's start, **when** the System computes the impact, **then** it surfaces at least three candidate variants (delay, swap, stand-in) to CSM and PO with a 90-second decision timer, defaults to the least-protocol-risk option if no decision is made, and records the switch in `variant_switch_log` with `triggered_by = 'drift_auto'`.
- **Given** a session is cancelled mid-cue (e.g., fire alarm during the third speaker), **when** the cancellation event is received, **then** the current cue is marked `skipped` with reason `session_cancelled`, all remaining cues in the session are marked `skipped`, the `ros.session.cancelled` event triggers cancellation handlers in Matchmaking, Commercial, and Protocol, but downstream sessions' ROS is NOT auto-adjusted without explicit OL approval.
