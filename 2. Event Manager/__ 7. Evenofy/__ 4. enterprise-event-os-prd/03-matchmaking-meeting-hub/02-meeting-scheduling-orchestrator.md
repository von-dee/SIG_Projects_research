> Module 3: B2B / G2G Matchmaking & Meeting Hub -> 3.2 Meeting Scheduling Orchestrator

## Meeting Scheduling Orchestrator

### A. Purpose Statement

The Meeting Scheduling Orchestrator converts accepted matches into calendar-confirmed, room-assigned meetings across a finite inventory of physical pods, VIP suites, and virtual rooms over three FMF event days. It is used by the Matchmaking Concierge (MC) to manage slot inventory and re-flow meetings when conflicts arise, and by attendees (ATT) to see their meeting schedule and receive relocation notifications. At FMF scale, 2,500+ scheduled meetings across 144 slots per room create combinatorial pressure that no manual calendar can absorb; this orchestrator finds the next mutually-available slot, handles room-tier and protocol constraints, and propagates changes through wayfinding and mobile notifications within seconds.

### B. User Roles & Permissions

- **Event Director (ED):** Read on aggregate room utilization and slot fill rates. Write via break-glass only for VIP suite override (e.g., extending a ministerial bilat beyond the standard 30-minute block).
- **Operations Lead (OL):** Read on room inventory and slot occupancy; write on room status (taking a room offline for AV failure). Cannot modify meeting assignments.
- **Protocol Officer (PO):** Read on VIP suite assignments; write to approve VIP suite allocation for any meeting involving rank 1-3 dignitaries.
- **VIP Liaison (VL):** Read on their dignitary's meeting schedule (next meeting time, room, counterpart name) and receives push notifications 10 minutes before each VIP meeting.
- **Registration Manager (RM):** Read-only on aggregate counts for capacity planning.
- **Sponsorship Sales Lead (SSL):** Read on sponsor-attributed meeting counts and aggregate room utilization for sponsor reporting; no access to individual meeting assignments.
- **Exhibitor Portal User (EPU):** Read/write on meeting room bookings associated with their sponsor booth (e.g., booking a pod for their company's lead meetings); cannot book VIP suites.
- **Content and Stage Manager (CSM):** Read on attendee schedules to detect conflicts with panel assignments; write to surface session-vs-meeting conflicts back to the MC.
- **Matchmaking Concierge (MC):** Primary user. Read/write on meeting records, room assignments, slot reservations. Approves VIP suite allocations. Can override no-show grace period via break-glass with reason capture.
- **Finance and Administration Lead (FAL):** No direct access. Reads room utilization cost-recovery data via the Finance module.
- **Marketing and PR Lead (MPL):** Read-only on aggregate anonymized meeting counts by venue zone for press releases.
- **ESG and Sustainability Officer (ESGO):** Read-only on physical vs virtual meeting ratio for ESG reporting.
- **Field Volunteer (FV):** Read on meeting room locations and current status; directs attendees to rooms via the Staff App.
- **Attendee (ATT):** Heavy user. Read on their own meeting schedule. Write to cancel their own meetings (subject to cancellation windows). Receives push notifications for confirmations, relocations, and no-show alerts.

### C. Data Model

`meeting_room` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{mapwise_zone_id, hid_door_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `code` | `text` | Human label, e.g., "POD-12", "VIP-SUITE-3", "VROOM-A" |
| `tier` | `enum[pod, vip_suite, virtual]` | Drives availability and assignment rules |
| `capacity_min` | `int` | Pod = 4, VIP = 8, Virtual = 2 |
| `capacity_max` | `int` | Pod = 6, VIP = 12, Virtual = 50 |
| `venue_zone_id` | `uuid null` | FK -> ops.zone.id; null for virtual rooms |
| `status` | `enum[available, occupied, offline, reserved]` | Real-time state |
| `offline_reason` | `enum[av_failure, cleaning, security_hold, refurb, n_a]` | n_a when status != offline |
| `offline_until` | `timestamptz null` | Expected return to service |
| `zoom_room_id` | `text null` | For virtual rooms; FK reference to Zoom Webinars API room ID |
| `teams_chat_id` | `text null` | For virtual rooms backed by Teams; mutually exclusive with zoom_room_id |
| `equipment` | `jsonb` | e.g., `{tv: true, whiteboard: true, interpreter: "AR/EN"}` |

`meeting_slot` (extends shared columns):

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
| `ext_refs` | `jsonb` | External refs |
| `audit_log` | `jsonb[]` | Append-only |
| `room_id` | `uuid` | FK -> meeting_room.id |
| `start_at` | `timestamptz` | Slot start, aligned to 15-min boundary |
| `end_at` | `timestamptz` | start_at + 15 minutes |
| `state` | `enum[open, held, blocked, reserved]` | held = booked meeting; reserved = MC hold; blocked = room offline |
| `block_reason` | `text null` | Reason when state = blocked |
| `day_index` | `int` | 1, 2, or 3 (event day number) |

`scheduled_meeting` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (MC or scheduler service) |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{google_calendar_event_id, outlook_event_id, zoom_meeting_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `match_id` | `uuid` | FK -> match.id |
| `room_id` | `uuid` | FK -> meeting_room.id |
| `start_at` | `timestamptz` | Scheduled start |
| `end_at` | `timestamptz` | start_at + duration |
| `duration_minutes` | `int` | 15, 30, 45, 60, or 90 (90 only for VIP suites) |
| `format` | `enum[in_person, hybrid, virtual]` | Drives platform handoff |
| `involves_vip` | `bool` | True if any participant has protocol_rank in [1,2,3] |
| `po_approval_id` | `uuid null` | FK -> po_approval.id; required when involves_vip = true |
| `check_in_state` | `enum[expected, partial, checked_in, no_show]` | Updated by room presence sensor |
| `no_show_detected_at` | `timestamptz null` | When grace period expired |
| `relocation_history` | `jsonb[]` | Each relocation: `{from_room, to_room, reason, occurred_at}` |

`po_approval` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | PO actor |
| `updated_by` | `uuid` | PO actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | External refs |
| `audit_log` | `jsonb[]` | Append-only |
| `scheduled_meeting_id` | `uuid` | FK -> scheduled_meeting.id |
| `decision` | `enum[pending, approved, rejected]` | Default pending |
| `decision_reason` | `text null` | PO free-text rationale |
| `decided_at` | `timestamptz null` | UTC of decision |

### D. Business Logic & Edge Cases

Slot grid generation (runs 7 days pre-event):

```text
FOR day in [1..3]:
  FOR hour in [09:00..17:00]:
    FOR minute in [0, 15, 30, 45]:
      FOR each room in meeting_room WHERE status = 'available':
        INSERT meeting_slot (room_id, start_at, end_at, state='open')
-- Total: 3 days * 8 hours * 4 slots * (30 pods + 8 VIP suites + N virtual rooms)
-- Physical pods:  3 * 32 * 38 = 3,648 slots
-- VIP suites:     3 * 32 * 8  = 768 slots
-- Virtual rooms:  effectively unbounded; created on demand
```

Conditional rules:

- IF `scheduled_meeting.involves_vip` = true THEN `room_id` MUST be a `vip_suite` tier AND `po_approval_id` MUST be non-null with `decision` = `approved` BEFORE the meeting slot is locked.
- IF `match.match_type` = `g2g` THEN default `duration_minutes` = 30; if `involves_vip` AND protocol_rank in [1,2] THEN default `duration_minutes` = 45.
- IF two attendees have accepted a match (`match.state` = `accepted_by_b`) THEN the scheduler finds the next mutually-available slot by intersecting both attendees' calendar free-busy (sourced from Module 4 sessions, Module 3 meetings, and any explicitly blocked time) and a room of appropriate tier.
- IF no mutually-available slot exists in the next 48 hours THEN the match is transitioned to `declined` with `reason_code` = "no_slot_available" and surfaced to the MC queue.
- IF a participant is added to a panel (Module 4 emits `speaker.assigned` on Kafka topic `speaker.*`) THEN the scheduler finds all `scheduled_meeting` records overlapping the panel window, transitions each to `pending_relocation`, computes the next available slot for each, and notifies both participants via push notification with the proposed new time.
- IF a meeting is within 30 minutes of start AND the assigned `meeting_room.status` transitions to `offline` THEN the orchestrator automatically: (a) finds the next available room of the same tier within 200 meters (Mapwise walking distance) or any virtual room fallback, (b) updates `scheduled_meeting.room_id` and appends to `relocation_history`, (c) sends push notifications to both participants with new room code and walking direction, (d) updates the mobile app wayfinding SDK with the new destination, (e) emits a `meeting.relocated` event on Kafka topic `meeting.*`.
- IF a meeting reaches `start_at + 10 minutes` without either participant's badge scanning at the room's HID reader (or Zoom join for virtual) THEN `check_in_state` transitions to `no_show`, the room slot is freed for re-booking, and the other participant (if present) receives a notification with options to wait or reschedule.
- IF exactly one participant scans in THEN `check_in_state` = `partial`; the system waits an additional 5 minutes before triggering `no_show` for the absent party.
- IF `meeting_room.offline_until` is set AND a meeting is scheduled during the offline window THEN the orchestrator pre-emptively relocates using the same algorithm as the 30-minute edge case above.

Non-obvious edge case (room AV failure 30 minutes before start): A VIP suite (VIP-SUITE-3) scheduled for a 13:00 ministerial bilat between two rank-2 dignitaries reports AV failure at 12:30. The orchestrator runs the relocation algorithm: it first tries to find another `vip_suite` with `status` = `available` and `equipment.interpreter` matching the AR/EN requirement. If no VIP suite is free, it falls back to a pod with interpreter equipment (sub-optimal capacity but functional) and flags the meeting with `tier_downgrade` = true in the relocation record, surfacing a yellow warning to the MC. The MC is paged via Twilio SMS with the proposed relocation; if MC does not respond within 90 seconds, the auto-relocation is committed. Both VLs (Liaisons for the two dignitaries) receive push notifications with the new room code and a Mapwise walking route. The original `meeting_room.status` is set to `offline` with `offline_reason` = `av_failure` and `offline_until` set to the vendor's ETA (sourced from the AV vendor's status feed). All of this is captured in `relocation_history` and emitted as `meeting.relocated` on the `meeting.*` topic for downstream consumers (mobile app, dashboard, audit log).

Edge case (participant no-show): A meeting between ATT-A and ATT-B is scheduled at 14:00 in POD-7. ATT-A scans in at 13:58. ATT-B does not arrive by 14:10. The system transitions `check_in_state` from `partial` to `no_show`, frees the room slot (state reverts to `open`), and sends ATT-A a push notification: "Your meeting counterpart has not arrived. The room is now released. Tap to reschedule." ATT-B receives a "You missed your 14:00 meeting" notification 15 minutes later (grace for late walk-up). The MC dashboard shows a no-show counter tile; if any single attendee accrues 3 no-shows in a day, the MC receives an alert to review whether their matchmaking capacity should be reduced.

### E. Third-Party Integrations

- **Zoom Webinars API**: Outbound. For `virtual` tier rooms, the orchestrator calls Zoom to create a meeting instance and stores the join URL in `meeting_room.zoom_room_id`. On meeting confirmation, the join URL is pushed to both participants via the mobile app. Direction: orchestrator -> Zoom; join URL inbound via webhook.
- **Microsoft Teams Graph API**: Outbound. Alternative virtual room provider when participants' organizations are Teams-anchored. Creates a Teams online meeting; stores chat ID in `meeting_room.teams_chat_id`. Direction: orchestrator -> Microsoft Graph.
- **Google Calendar API**: Outbound. For attendees who have linked their Google account, the scheduled meeting appears in their calendar with the room code and walking directions in the location field. Direction: orchestrator -> Google Calendar via OAuth.
- **Microsoft Outlook Graph API**: Outbound. Same as Google Calendar but for Exchange-hosted attendees. Direction: orchestrator -> Microsoft Graph.
- **Calendly**: Inbound (limited). For pre-event matchmaking scheduling by attendees who prefer a self-service slot picker, Calendly webhooks push confirmed bookings into the orchestrator via the Integration Hub. Direction: Calendly -> Integration Hub -> orchestrator.
- **Mapwise**: Outbound query, inbound route. The orchestrator queries Mapwise for walking distance between rooms to optimize relocation choice and pushes new destinations to the wayfinding SDK on attendee devices. Direction: bidirectional.
- **HID Global Origo**: Inbound. Badge scan events at meeting room doors are emitted via HID Origo webhooks; the orchestrator consumes them to update `check_in_state`. Direction: HID Origo -> orchestrator.
- **Twilio**: Outbound. SMS notifications to MC for VIP relocations and no-show alerts where push delivery has failed or is not opted in. Direction: orchestrator -> Twilio.
- **Brevo (Sendinblue)**: Outbound. Email notifications for meeting confirmations, relocations, and post-meeting follow-up nudges. Direction: orchestrator -> Brevo.
- **SendGrid**: Outbound. Alternative email provider for sponsor-domain email routing; used when Brevo daily quota is exhausted. Direction: orchestrator -> SendGrid.
- **Module 4 Content and Stage**: Inbound via Kafka topic `speaker.*` and `session.*`. Speaker assignment changes trigger meeting re-flow.
- **Module 7 Mobile App**: Outbound via Kafka topic `notif.*` and direct APNs/FCM push. Push notifications for meeting state changes.

### F. UI/UX Notes

The MC scheduling console has three views toggleable by tabs: "Room Grid", "Attendee Schedule", and "Conflicts". The Room Grid view is a Gantt-style heatmap with rooms on the y-axis and 15-minute slots on the x-axis across all three days (collapsible to single day). Cells are color-coded: green = open, blue = held, yellow = reserved (MC hold), red = blocked (offline), gray = past. Clicking a held cell opens a pop-over with both attendee names, meeting duration, format badge (in-person/hybrid/virtual), and a "Relocate" action. The Attendee Schedule view shows a single attendee's timeline with sessions, meetings, and travel-time buffers stacked; the MC can drag a meeting to a new slot (subject to constraint validation, with red drop-zones for invalid targets). The Conflicts view is a queue of meetings needing attention: pending relocations, no-shows, PO-pending approvals, and slot-overflow items. Each conflict card has a one-click resolve button where possible (auto-relocate, auto-reschedule, escalate to PO).

For ATT, the mobile app shows a "My Meetings" tab with a vertical timeline for the current day and a horizontal swipe for day 2/3. Each meeting card shows the counterpart name and photo, time, room code, format, and a "Get Directions" button that opens the Mapwise wayfinding SDK. A countdown chip ("starts in 12 min") appears 30 minutes before start. Tapping a card opens a detail view with the agenda description, cancel/reschedule buttons (with cancellation window warnings), and the counterpart's LinkedIn headline if available.

### G. Failure Modes & Offline Behavior

- **Zoom API unavailable**: When a virtual room is needed and Zoom API returns 5xx or times out (3-second timeout, 3 retries with 1s back-off), the orchestrator falls back to Teams Graph API; if both fail, the meeting is created as `in_person` with a notification to the MC and both attendees that "virtual bridge unavailable; meeting converted to in-person at room X".
- **HID Origo webhook delay > 30 seconds**: The orchestrator falls back to a manual check-in via the mobile app (attendee scans a QR code on the room door); the grace period for no-show is extended by the same delay.
- **Mapwise routing unavailable**: Relocation algorithm uses straight-line distance as a fallback heuristic; wayfinding in the mobile app shows "Indoor navigation unavailable, follow signs to [room code]" with the building/zone label only.
- **Outlook Graph rate limit**: Outbound calendar sync retries with exponential back-off; if still failing after 5 retries, the meeting confirmation is sent via Brevo email with an .ics attachment as fallback.
- **Mobile app offline**: ATT meeting list is cached in SQLite; the app shows a "Last synced at HH:MM" indicator and queues any local meeting cancellations for replay on reconnect. Push notifications sent during offline are stored server-side and replayed as in-app alerts on next sync.
- **MC console disconnect**: Console uses optimistic local state with conflict detection via the `version` field; if a meeting changed server-side, the MC is prompted to re-load before applying their local edit.
- **PostgreSQL write contention on `meeting_slot`**: Optimistic concurrency via `version` field; on contention (HTTP 409), the orchestrator retries the slot reservation up to 3 times with a 200ms delay before surfacing to the MC as a "Slot contention, retry" toast.

### H. Acceptance Criteria

- Given an accepted B2B match between two attendees, when the orchestrator runs the auto-scheduler, then within 5 seconds a `scheduled_meeting` record is created with `room_id` set to an available `pod` tier room, `start_at` aligned to a 15-minute boundary, both attendees' calendars show no conflict, and a confirmation push notification is sent to both.
- Given a VIP suite meeting scheduled at 13:00 between two rank-2 dignitaries, when the assigned room reports AV failure at 12:30, then within 90 seconds the orchestrator auto-relocates to another `vip_suite` (or falls back to a pod with `tier_downgrade` = true), updates `relocation_history`, sends push notifications to both VLs with the new room code and walking route, and emits a `meeting.relocated` event on the `meeting.*` Kafka topic with both old and new room IDs in the payload.
- Given a meeting at 14:00 in POD-7 where ATT-A scans in at 13:58 and ATT-B does not arrive by 14:10, when the 10-minute no-show grace period expires, then `check_in_state` transitions to `no_show`, the room slot reverts to `open`, ATT-A receives a "counterpart not arrived, room released" notification, and ATT-B receives a "missed meeting" notification 15 minutes later.
- Given a meeting requires PO approval (involves_vip = true), when the MC attempts to lock the slot without a `po_approval` with `decision` = `approved`, then the system blocks the lock, returns a 422 error with message "PO approval required for VIP meeting", and the MC console highlights the meeting in the Conflicts queue.
- Given a participant is added to a panel overlapping a scheduled meeting, when Module 4 emits `speaker.assigned` on the `speaker.*` topic, then the orchestrator transitions the affected `scheduled_meeting` to `pending_relocation`, computes the next mutually-available slot within 30 seconds, sends both attendees a proposed new time push notification, and the MC console surfaces the conflict in the Conflicts queue with the proposed resolution.
