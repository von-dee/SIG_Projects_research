> Module 3: B2B / G2G Matchmaking & Meeting Hub -> 3.3 Virtual & Hybrid Meeting Platform

## Virtual and Hybrid Meeting Platform

### A. Purpose Statement

The Virtual and Hybrid Meeting Platform provides the real-time video, audio, translation, and recording infrastructure for meetings that include at least one remote participant. It is used by attendees (ATT) joining from offsite, by Matchmaking Concierges (MC) monitoring room health, and by Content and Stage Managers (CSM) when a hybrid session involves a dignitary. At FMF scale, ~30 percent of 2,500+ meetings are hybrid (in-person + remote), and a meaningful share involve Ministers joining from their home country capital; the platform must deliver simultaneous interpretation in 30+ languages, sub-second video latency, and consented recording that flows into the Content Repository with diplomatic-grade access controls.

### B. User Roles & Permissions

- **Event Director (ED):** Read on aggregate platform health (active rooms, concurrent participants, translation minutes consumed). No read on meeting content without break-glass co-approval with MC and PO.
- **Operations Lead (OL):** Read on room health, concurrent participant counts, and platform incidents; no read on meeting content.
- **Protocol Officer (PO):** Read on hybrid meetings involving rank 1-3 dignitaries; can request translation language pair additions; no read on raw transcripts of g2g meetings.
- **VIP Liaison (VL):** Read-only on their dignitary's hybrid meeting join link and translation language; can trigger "remote dignitary joining" handoff from the Shadow App.
- **Registration Manager (RM):** No access to meeting content; reads only platform capacity utilization for capacity planning.
- **Sponsorship Sales Lead (SSL):** Read on aggregate virtual meeting counts for sponsor reporting; no access to content.
- **Exhibitor Portal User (EPU):** Read/write on virtual meeting rooms they have booked for sponsor-lead meetings; cannot start recording without counterparty consent.
- **Content and Stage Manager (CSM):** Read/write on recordings that flow to the Content Repository (Module 4); can clip and redistribute recordings subject to consent flags.
- **Matchmaking Concierge (MC):** Primary user. Read/write on room state, recording consent state, participant join/leave. Can forcibly eject a participant in case of misconduct (logged with reason). Can convert an in-person meeting to hybrid mid-meeting if a remote participant joins late.
- **Finance and Administration Lead (FAL):** Read on aggregate translation minutes and Zoom/Teams usage for cost allocation.
- **Marketing and PR Lead (MPL):** Read-only on recordings explicitly consented for press redistribution; no read on private meeting content.
- **ESG and Sustainability Officer (ESGO):** Read-only on virtual vs in-person meeting ratio for ESG reporting (carbon savings from avoided travel).
- **Field Volunteer (FV):** No direct access. Receives wayfinding instructions only for in-person participants arriving at hybrid meeting rooms.
- **Attendee (ATT):** Heavy user. Read on their own meeting join links and translation language selection. Write on consent state (grant or revoke recording). Can mute, disable camera, leave meeting.

### C. Data Model

`virtual_meeting_session` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (orchestrator service) |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{zoom_meeting_id, teams_chat_id, deepl_session_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `scheduled_meeting_id` | `uuid` | FK -> scheduled_meeting.id |
| `provider` | `enum[zoom, teams, internal_jitsi]` | Video bridge provider |
| `provider_meeting_id` | `text` | Provider's meeting identifier |
| `join_url` | `text` | Attendee-facing join URL (signed, expiry 1 hour post-meeting) |
| `format` | `enum[hybrid, virtual]` | hybrid = at least one in-person participant |
| `expected_participants` | `int` | Headcount at scheduling time |
| `peak_concurrent_participants` | `int` | Updated at meeting end |
| `translation_enabled` | `bool` | True if DeepL or Microsoft Translator is bridged |
| `translation_languages` | `text[]` | ISO 639-1 codes, e.g., `["en","ar","fr","zh"]` |
| `recording_consent_state` | `enum[pending, granted, denied, mixed]` | mixed = some participants granted, some denied |
| `recording_id` | `uuid null` | FK -> content_repository.recording.id; set when recording starts |
| `transcript_id` | `uuid null` | FK -> content_repository.transcript.id |
| `state` | `enum[pending, active, paused, completed, terminated]` | Lifecycle |
| `started_at` | `timestamptz null` | First participant joined |
| `ended_at` | `timestamptz null` | Last participant left or MC-terminated |
| `quality_metrics` | `jsonb` | e.g., `{avg_packet_loss: 0.4, avg_latency_ms: 180, video_downgrades: 2}` |

`participant_session` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{zoom_participant_id, device_fingerprint}` |
| `audit_log` | `jsonb[]` | Append-only |
| `virtual_session_id` | `uuid` | FK -> virtual_meeting_session.id |
| `attendee_id` | `uuid` | FK -> registration.id |
| `join_mode` | `enum[in_person, remote_video, remote_audio_only, remote_phone]` | remote_phone = PSTN dial-in |
| `camera_enabled` | `bool` | State at meeting end |
| `mic_enabled` | `bool` | State at meeting end |
| `selected_translation_lang` | `char(2) null` | ISO 639-1 |
| `joined_at` | `timestamptz` | UTC |
| `left_at` | `timestamptz null` | UTC; null if still in meeting |
| `connection_drops` | `int` | Number of disconnect events |
| `consent_recorded` | `enum[granted, denied, pending]` | Per-participant recording consent |
| `consent_at` | `timestamptz null` | UTC of consent decision |

`translation_session` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{deepl_session_id, ms_translator_conversation_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `virtual_session_id` | `uuid` | FK -> virtual_meeting_session.id |
| `provider` | `enum[deepl, microsoft_translator]` | Selected at meeting start based on language coverage |
| `source_lang` | `char(2)` | ISO 639-1, dominant speaker language |
| `target_langs` | `text[]` | ISO 639-1 array |
| `captions_stream_id` | `text` | Provider's caption stream identifier |
| `minutes_consumed` | `int` | Total billable minutes |
| `state` | `enum[active, paused, completed]` | Lifecycle |

### D. Business Logic & Edge Cases

Meeting lifecycle:

```text
pending
  |-- (first participant joins) --> active
  |-- (cancellation before start) --> terminated
active
  |-- (recording pause by MC) --> paused
  |-- (last participant leaves) --> completed
  |-- (MC terminate, e.g., misconduct) --> terminated
paused
  |-- (MC resume recording) --> active
completed
  |-- (post-meeting processing) --> recording and transcript land in Content Repository
```

Conditional rules:

- IF `scheduled_meeting.format` in `[hybrid, virtual]` THEN create a `virtual_meeting_session` at scheduling time with `provider` chosen by attendee org preference (Zoom for commercial, Teams for Microsoft-anchored, internal_jitsi as fallback).
- IF meeting includes any participant with `protocol_rank` in [1,2,3] THEN `translation_enabled` defaults to true AND `translation_languages` includes the dignitary's `language_pref` from Module 2.1.
- IF `recording_consent_state` = `pending` when first participant joins THEN prompt all participants in-meeting for consent; recording starts only when `consent_recorded` = `granted` for all current participants; later joiners are prompted individually.
- IF any participant denies consent THEN `recording_consent_state` = `mixed` AND recording is paused for the full meeting (FMF policy: no partial recordings of bilateral meetings).
- IF `join_mode` = `in_person` AND device has no camera detected AND meeting is `hybrid` THEN system prompts the in-person participant to either (a) join from their phone as `remote_video` while staying in the room, or (b) continue `in_person` with `audio_only` remote bridge for the other party.
- IF a remote participant's connection drops THEN system holds the meeting for 3 minutes with a "reconnecting" indicator; if the participant rejoins within 3 minutes, the meeting continues seamlessly; if not, the meeting continues `in_person` only with a "remote participant offline" banner and the recording (if consented) is annotated with the dropout timestamp.
- IF a remote participant's connection drops more than 3 times in a 5-minute window THEN system suggests the participant switch to `remote_phone` (PSTN dial-in via Twilio) as a fallback.
- IF meeting includes a rank 1-2 dignitary AND recording is consented THEN recording is encrypted at column level and access is restricted to the two participants, their VLs, and break-glass ED+PO+MC co-approval; press access is denied regardless of consent.
- IF a participant attempts to start screen share in a g2g meeting THEN system requires MC approval; screen share is blocked until MC clicks "Approve" in the MC console.
- IF a recording exists AND either participant later revokes consent post-meeting THEN the recording is purged from the Content Repository within 24 hours, the deletion is logged in `audit_log`, and a `recording.purged` event is emitted on the `meeting.*` topic.

Non-obvious edge case (in-person participant has no camera): A hybrid meeting is scheduled between ATT-A (in-person at the venue, joining from a meeting pod with a room TV) and ATT-B (remote, joining from London). The pod's TV has no camera; only a microphone and speaker. The system detects the missing camera at participant check-in (via the in-room device profile) and prompts ATT-A via the room TV: "Your meeting counterpart is remote. This room has no camera. Tap to (a) join from your phone as video while staying here, or (b) continue audio-only." If ATT-A selects (a), the orchestrator sends a join link to ATT-A's mobile app, which becomes the video device while the room TV remains the audio bridge; ATT-B sees ATT-A's phone camera feed. If ATT-A selects (b), the meeting proceeds audio-only and `participant_session.join_mode` for ATT-A is set to `in_person` while a separate `remote_audio_only` participant_session is created for the audio bridge. The MC console shows a "camera-less hybrid" badge so the MC can monitor for issues.

Edge case (remote participant drop mid-meeting): ATT-B's connection drops at minute 12 of a 30-minute meeting. The system displays a "reconnecting" indicator on ATT-A's screen and starts a 3-minute timer. ATT-B rejoins at minute 14; the meeting continues. The `connection_drops` counter increments to 1. If ATT-B had not rejoined within 3 minutes, the meeting would have continued with ATT-A in-person only, a "remote participant offline" banner would display, the recording (if consented) would continue, and a `participant.disconnected_permanent` event would emit. The MC would have the option to convert the meeting to `in_person` only or extend by 5 minutes if ATT-B reconnects late.

### E. Third-Party Integrations

- **Zoom Webinars API**: Outbound primary. Creates virtual meeting rooms, manages participant join URLs, captures recording and transcript webhooks. Direction: orchestrator -> Zoom; inbound webhooks for participant events and recording availability.
- **Microsoft Teams Graph API**: Outbound alternative. Creates Teams online meetings, manages chat ID, captures participant events. Direction: orchestrator -> Microsoft Graph; inbound webhooks for state changes.
- **DeepL API**: Outbound. Provides high-quality translation for captions in 30+ languages. Selected when source/target language pair is in DeepL's premium tier (better quality for Arabic, French, Chinese). Direction: orchestrator -> DeepL; caption stream inbound via WebSocket.
- **Microsoft Translator (Speech)**: Outbound alternative. Selected for language pairs not covered by DeepL or when budget constraints apply. Direction: orchestrator -> Microsoft Translator.
- **Twilio Programmable Voice**: Outbound. PSTN dial-in fallback for participants with persistent connection issues. Direction: orchestrator -> Twilio.
- **Twilio Conversations**: Outbound. In-meeting chat for participants who cannot or prefer not to speak (used for accessibility). Direction: orchestrator -> Twilio.
- **AWS Chime SDK**: Fallback internal video bridge when both Zoom and Teams are unavailable. Direction: orchestrator -> AWS Chime.
- **AWS KMS**: Outbound. Envelope encryption for recordings and transcripts at column level. Direction: orchestrator -> AWS KMS.
- **Module 4 Content Repository**: Outbound via Kafka topic `recording.*` and `transcript.*`. Recordings land in the Content Repository with access controls inherited from `virtual_meeting_session` consent state. Direction: platform -> Content Repository.
- **OpenAI Whisper**: Outbound. Generates transcripts from recordings for searchability; transcript text is encrypted and access-controlled per consent. Direction: orchestrator -> OpenAI Whisper.
- **Azure AD B2C**: Inbound. Identity and consent claim validation.

### F. UI/UX Notes

For the in-person ATT, the meeting room TV displays a "waiting room" screen with the meeting title, the counterpart's name and photo, a "Join" button, and a translation language dropdown. On join, the screen splits: top half is the remote participant's video feed, bottom half is the live captions strip with the selected language. A small picture-in-picture shows the in-person participant's own camera (if available) for self-check. For the remote ATT, the Zoom or Teams native app opens with the meeting; captions appear as an overlay strip controllable via a "Captions" toggle.

The MC console has a "Live Rooms" panel showing all active virtual_meeting_sessions as cards in a grid. Each card shows: meeting title, participant count with green/red dots indicating camera/mic state, provider badge (Zoom/Teams), translation language chips, recording state pill (Recording/Paused/Not Recording), and a "health" indicator (green = healthy, yellow = degraded, red = critical). Clicking a card opens a detail view with: live participant list with join mode and connection drops, a "Force Mute" / "Eject" action per participant, a "Pause Recording" / "Resume Recording" toggle, a "Switch Translation Provider" dropdown, and an event log showing all participant state changes in the last 5 minutes.

For dignitary meetings, a "Diplomatic Mode" banner appears across the top of the MC console card, indicating that recording requires MC + PO + ED co-approval to enable, screen share requires MC approval, and any eject action is logged to the diplomatic audit trail.

### G. Failure Modes & Offline Behavior

- **Zoom API outage**: Detected via 3 consecutive 5xx responses or health-check probe failure. Orchestrator falls back to Teams Graph; if Teams also fails, falls back to AWS Chime SDK. Participants see a 10-second reconnection with a "Switching provider" overlay. Join URLs are re-issued and pushed via push notification.
- **DeepL API rate limit (HTTP 429)**: Translation falls back to Microsoft Translator for the affected language pairs; captions may degrade in quality for ~5 minutes until DeepL quota resets. A `translation.degraded` event is emitted; MC console shows a yellow "Translation degraded" indicator on the affected meeting card.
- **Participant network drop < 3 minutes**: System holds the meeting, displays "reconnecting" indicator, plays hold music for the other participant. Auto-reconnect on participant recovery.
- **Participant network drop > 3 minutes**: Meeting continues for the remaining participant(s); disconnected participant is marked "offline" with a banner; recording (if active) continues with the dropout timestamp annotated.
- **Recording upload to Content Repository fails**: Retried with exponential back-off (1s, 2s, 4s, 8s, 16s, 32s, 60s) up to 24 hours. If still failing, the recording is held in the platform's local S3 bucket with a `recording.upload_pending` alert in the War Room; no data loss.
- **In-room device failure (no camera/mic detected)**: System prompts participant to use phone-based join; if participant declines, meeting proceeds audio-only with a "degraded experience" log.
- **Caption stream desync > 5 seconds**: System pauses captions, re-syncs from the latest audio segment, and resumes; participants see a 2-second caption gap. Repeated desyncs trigger a switch to the alternative translation provider.
- **PSTN fallback failure (Twilio)**: If a participant who was on PSTN also drops, the meeting continues with the remaining participants; the disconnected participant receives a follow-up email with a re-join link and an offer to reschedule.

### H. Acceptance Criteria

- Given a hybrid meeting scheduled with one in-person and one remote participant, when the in-person participant joins from a room with no camera, then within 10 seconds the room TV displays a prompt offering phone-based video join or audio-only mode, and the participant's selection is recorded in `participant_session.join_mode` accordingly.
- Given a remote participant's connection drops mid-meeting, when the disconnection lasts less than 3 minutes, then the meeting remains active with a "reconnecting" indicator for the other participant, the disconnected participant's `connection_drops` counter increments on rejoin, and the meeting continues without state loss.
- Given a remote participant's connection drops mid-meeting, when the disconnection lasts more than 3 minutes, then the meeting continues in-person only with a "remote participant offline" banner, the recording (if consented) is annotated with the dropout timestamp, and a `participant.disconnected_permanent` event is emitted on the `meeting.*` topic.
- Given a meeting includes a rank 1-2 dignitary and recording is requested, when any participant denies consent, then `recording_consent_state` transitions to `mixed`, recording is paused for the entire meeting, no partial recording is stored, and a `recording.paused_mixed_consent` event is emitted.
- Given a g2g meeting with translation enabled, when the source language is Arabic and DeepL returns 429, then within 30 seconds the orchestrator falls back to Microsoft Translator for Arabic captions, a `translation.degraded` event is emitted, and the MC console shows a yellow degradation indicator on the affected meeting card.
