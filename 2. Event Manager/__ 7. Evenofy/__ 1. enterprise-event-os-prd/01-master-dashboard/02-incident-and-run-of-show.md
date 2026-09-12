> Module 1: Master Dashboard & War Room Command Center → 1.2 Incident and Run-of-Show

## Incident and Run-of-Show Control
### Purpose and access
Coordinates decisions during disruption and turns programme intent into a timestamped operational plan. Incident Commanders may declare severity; stage managers edit assigned ROS items; only the Event Director approves a cross-stage replan.
### Data model
| Entity | Fields and relationships |
|---|---|
| `incident` | `id UUID`, `event_id FK`, `severity enum[P1-P4]`, `status enum`, `commander_id FK`, `location_id FK?`, `timeline jsonb` |
| `ros_item` | `id UUID`, `stage_id FK`, `planned_start timestamptz`, `duration_seconds int`, `status enum`, `owner_id FK`, `version int` |
| `decision_log` | `id UUID`, `incident_id FK`, `decision text`, `approver_id FK`, `at timestamptz` |
### Rules and integrations
- IF a P1 is declared, THEN page the on-call roster, open a command channel, and freeze public programme publishing until the commander releases it.
- IF an ROS update conflicts with a locked broadcast cue, THEN require Broadcast approval and show the affected downstream cues.
- Edge case: if concurrent edits share a base version, reject the later save and offer a diff; never silently overwrite.

Integrate Twilio/Teams for paging, ServiceNow for enterprise incidents, and broadcast systems through a queued cue adapter.
### UX, resilience, acceptance
The incident panel is a guided timeline with roles, checklist, and decisions; ROS is a swim-lane timeline with a published versus proposed view. Staff devices retain assigned checklists offline and queue notes with author time.

- P1 declaration creates one auditable notification fan-out.
- A conflicting ROS change cannot publish without required approval.
- Offline notes synchronize without replacing a newer server decision.
