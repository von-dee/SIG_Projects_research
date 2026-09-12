> Module 1: Master Dashboard & War Room Command Center → 1.2 Incident & Crisis Management

## Incident & Crisis Management

### A. Purpose Statement

The Incident & Crisis Management subsystem is the System's single authoritative workflow for logging, triaging, escalating, and resolving any event-day disruption, ranging from a broken badge printer to a sovereign-delegation medical emergency. It is used by every operational persona but owned by the Operations Lead (OL), with the Event Director (ED) holding the override authority to declare a Crisis. At FMF scale, where a single medical incident involving a Minister can trigger cross-government coordination, an unmanaged incident is not just a service failure but a diplomatic and reputational event. This subsystem exists to ensure that no incident is lost, no incident is double-handled, and no incident's escalation path depends on someone remembering a phone number.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all incidents; write on severity, status, and crisis-mode declarations. The only role that can declare Crisis Mode (which freezes non-critical writes across the System) and the only role that can close an S0 incident. Receives immediate PagerDuty page on any S0.
- **Operations Lead (OL):** Read on all incidents; write on triage, assignment, severity (down to S1), and resolution. Default on-call escalation target for S1. Can re-route an incident from one team to another. Cannot declare Crisis Mode.
- **Protocol Officer (PO):** Read on incidents tagged with `protocol_impact = true`; write on the protocol-impact assessment field only. Escalates to ED if a protocol-impacting incident is closed without PO review.
- **VIP Liaison (VL):** Read on incidents affecting their assigned dignitary; write on a structured "VIP context" comment block. Cannot change incident status.
- **Registration Manager (RM):** Read/write on incidents in zones owned by Registration (check-in hall, badge desk); can raise severity up to S2.
- **Sponsorship Sales Lead (SSL):** Read on incidents affecting sponsor booths or sponsor-facing spaces; cannot write status, can comment.
- **Exhibitor Portal User (EPU):** Can submit an incident via the Exhibitor Portal form (limited to category = `exhibitor_issue`); can read only their own submitted incidents and their resolution status.
- **Content & Stage Manager (CSM):** Read/write on incidents in stage and green-room zones; can raise severity up to S1 for stage-power or A/V failure.
- **Matchmaking Concierge (MC):** Read on incidents affecting meeting rooms; can comment.
- **Finance & Administration Lead (FAL):** Read on incidents with a budget impact (e.g., emergency supplier callout); writes the `cost_impact` field only.
- **Marketing & PR Lead (MPL):** Read on incidents flagged `external_visibility = true`; writes the `public_statement` field and the `social_response` plan. Cannot change status or severity.
- **ESG & Sustainability Officer (ESGO):** Read on ESG-tagged incidents (e.g., waste spill, energy spike); writes the `esg_impact` assessment.
- **Field Volunteer (FV):** Can create incidents and update the `on_scene_observation` field; cannot change severity or close. Submitting an incident auto-attaches their current zone from the Mobile App geolocation.
- **Attendee (ATT):** Can submit an incident via the Attendee App "Report a Problem" affordance (limited to categories `facility_issue`, `safety_concern`, `accessibility`); cannot see other incidents or their internal handling.

### C. Data Model

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC, set on report |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (FV, ATT, or service account for automated intake) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete (incidents are never deleted; only archived) |
| `ext_refs` | `jsonb` | External IDs (e.g., `{pagerduty_incident_id, zendesk_ticket_id}`) |
| `audit_log` | `jsonb[]` | Append-only local audit |

`incident` (extends shared columns above):

| Field | Type | Notes |
|---|---|---|
| `reference` | `text` | Human-readable, e.g., `FMF25-INC-0421` |
| `severity` | `enum[S0, S1, S2, S3]` | S0 = life safety / security, S1 = operational impact, S2 = degraded experience, S3 = minor |
| `status` | `enum[reported, acknowledged, triaged, in_progress, resolved, closed, post_mortem]` | Lifecycle |
| `category` | `enum[medical, security, fire, av_failure, power, network, access, facility, protocol, transport, fnb, exhibitor, it_app, weather, other]` | Primary classification |
| `zone_id` | `uuid null` | FK -> zone.id, nullable for global incidents |
| `location_lat` | `numeric(10,7) null` | Geolocation if available |
| `location_lng` | `numeric(10,7) null` | Geolocation if available |
| `description` | `text` | Free-text report |
| `reporter_id` | `uuid` | FK -> user.id; for ATT reports, FK -> attendee.id |
| `reporter_role` | `enum[ED, OL, PO, VL, RM, SSL, EPU, CSM, MC, FAL, MPL, ESGO, FV, ATT, automated]` | Captured at intake |
| `assigned_team` | `enum[security, medical, av, it, facilities, protocol, transport, fnb, none]` | Current owner |
| `assigned_lead_id` | `uuid null` | FK -> user.id |
| `acknowledged_at` | `timestamptz null` | When status moved to `acknowledged` |
| `acknowledged_by` | `uuid null` | FK -> user.id |
| `resolved_at` | `timestamptz null` | When status moved to `resolved` |
| `closed_at` | `timestamptz null` | When status moved to `closed` |
| `pagerduty_incident_id` | `text null` | External reference |
| `protocol_impact` | `boolean` | True if incident affects any dignitary or protocol-sensitive flow |
| `external_visibility` | `boolean` | True if incident is visible to attendees or press (drives MPL notification) |
| `cost_impact` | `numeric(18,3) null` | Estimated cost in event currency |
| `merge_parent_id` | `uuid null` | FK -> incident.id, set when this incident is merged into another |
| `merge_reason` | `text null` | Explanation of auto-merge |
| `human_merge_confirmed` | `boolean null` | True after human confirms an auto-merge |
| `crisis_linked` | `boolean` | True if incident is part of an active Crisis declaration |
| `attachments` | `jsonb` | Array of `{url, type, uploaded_by}` for photos, audio, video |

`crisis_declaration`:

| Field | Type | Notes |
|---|---|---|
| `crisis_id` | `uuid` | PK |
| `event_id` | `uuid` | FK -> event.id |
| `declared_by` | `uuid` | FK -> user.id (must be ED) |
| `declared_at` | `timestamptz` | UTC |
| `root_incident_id` | `uuid` | FK -> incident.id |
| `scope` | `enum[zone, venue, event_wide]` | Breadth of write-freeze |
| `ended_at` | `timestamptz null` | Set when ED lifts the crisis |
| `ended_by` | `uuid null` | FK -> user.id |

### D. Business Logic & Edge Cases

Incident lifecycle is enforced by a state machine. Transitions that violate the state machine are rejected with a 409 Conflict and an explanatory error code.

- **IF** an incident is created with severity `S0` **THEN** the System immediately: (a) pages ED and on-call Security via PagerDuty, (b) sends an SMS via Twilio to ED and OL, (c) pushes a structured Slack and Teams message to the `#war-room-critical` channel, (d) sets `status = 'acknowledged'` automatically and starts a 60-second SLA timer for human acknowledgement of the page.
- **IF** an S0 incident is not acknowledged within 60 seconds **THEN** the System escalates to a secondary on-call (deputy ED) and posts a follow-up message to Slack with the word "UNACKNOWLEDGED" in red.
- **IF** an S1 incident is not acknowledged within 5 minutes **THEN** the System escalates to OL and the on-call for the relevant `assigned_team`.
- **IF** an incident's `category = 'medical'` AND `severity` is set below S1 **THEN** block the save and require the user to either confirm "non-emergency medical" or escalate.
- **IF** the ED declares Crisis Mode **THEN** the System: (a) writes a `crisis_declaration` row, (b) publishes a `crisis.declared` Kafka event consumed by all modules, (c) sets `crisis_linked = true` on the root incident and all incidents created during the crisis, (d) freezes non-critical writes (e.g., sponsor booth edits, agenda changes, ESG report runs) by rejecting writes with a 423 Locked response and a "Crisis Mode active" message.
- **IF** two incidents are created within 30 seconds of each other, by different reporters, in the same `zone_id`, with the same `category` **THEN** the System auto-merges the second into the first, sets `merge_parent_id` on the second, sets `merge_reason = 'auto: time+zone+category'`, sets `human_merge_confirmed = false`, and surfaces a "Review merge" notification to OL. The merged incident's status cannot advance past `in_progress` until `human_merge_confirmed = true`.
- **IF** an incident with `protocol_impact = true` is moved to `closed` without a PO review comment **THEN** block the transition and require PO acknowledgement.

**Non-obvious edge case:** Two Field Volunteers in adjacent zones report "lost child near Plenary East entrance" within 12 seconds of each other. The zones are different (Plenary East A vs. Plenary East B), but the categories match (`security` -> `lost_person`). The strict time+zone+category merge rule would NOT fire because the zones differ. To handle this, the System applies a secondary heuristic: if incidents are within 30 seconds, same category, and zones are within 50 meters (computed from `location_lat`/`location_lng` if present, or from a zone-adjacency table maintained by Ops), the merge is proposed but flagged as "low confidence" and routed to OL for confirmation. OL can confirm or split. If OL does not act within 90 seconds, both incidents proceed independently but the War Room dashboard surfaces them as a "possible duplicate" pair.

### E. Third-Party Integrations

- **PagerDuty:** Primary on-call paging vendor. The System pushes incident-create events outbound via PagerDuty REST API; PagerDuty returns `pagerduty_incident_id` which is stored on the incident. PagerDuty webhook pushes acknowledgement, escalation, and resolution events back inbound. Direction: bidirectional.
- **Twilio:** SMS fallback channel for S0 incidents and Crisis Mode declarations. Direction: System -> Twilio.
- **Slack and Microsoft Teams:** Incident create, severity change, and resolution events push structured messages (using Slack Block Kit and Teams Adaptive Cards) to role-specific channels. Acknowledgement buttons in the message call back into the System via webhook. Direction: System -> Slack/Teams, with Slack/Teams -> System for in-channel acknowledgement.
- **HID Global / Zebra scanner fleet:** Scanner alerts (e.g., badge tamper, forced entry attempt) generate incidents automatically via the integration hub. Direction: scanner -> System.
- **IoT sensor platform (e.g., AWS IoT Core):** Threshold breaches (temperature, smoke, occupancy, noise) generate `incident.suggested` events. The integration hub applies a deduplication window of 60 seconds per sensor ID to prevent alert storms. Direction: IoT -> System.
- **Datadog:** Infrastructure-monitoring alerts (Kafka lag, DB CPU, API 5xx rate) flow into the Incident module via Datadog webhook. Direction: Datadog -> System.
- **Email-to-incident gateway (SendGrid Inbound Parse):** A dedicated mailbox (`incidents@event.os`) parses inbound emails, creates an incident with `reporter_role = 'automated'`, attaches the email body and any images. Used by press and external partners who do not have System accounts. Direction: SendGrid -> System.
- **Zoom and OBS:** AV-failure incidents can carry a deep link to the affected Zoom session or OBS scene for the AV team. Direction: System -> Zoom/OBS (read-only embed).
- **AWS SNS:** Used to fan out crisis-mode declarations to all module projection services, which then enter "write-freeze aware" mode and reject non-critical writes locally. Direction: System internal.

### F. UI/UX Notes

- **War Room incident board:** A Kanban-style board with columns per status (`reported`, `acknowledged`, `triaged`, `in_progress`, `resolved`, `closed`). Each card shows reference, severity color bar, category icon, zone, age timer, and assigned lead avatar. S0 incidents render with a pulsing red border.
- **Incident detail drawer:** Opens from any board card. Sections: timeline (every state transition with actor and timestamp), assignment, severity slider (gated by role), comment thread with role-tagged messages, attachments, linked incidents (from merge or shared root), and a "linked crisis" banner if `crisis_linked = true`.
- **Mobile Staff App incident form:** Big red "Report Incident" button on the home screen. Opens a 4-step wizard: category (icon grid), severity (with descriptions), description (voice-to-text supported), photo capture. Geolocation and zone are auto-attached. Submit confirms with the assigned reference number.
- **Attendee App "Report a Problem":** A small "Report a Problem" link in the footer. Limited category set. ATT reports are quarantined in a separate intake queue and require RM or OL triage before appearing on the main board.
- **Crisis dashboard:** When crisis mode is active, the entire War Room dashboard collapses to a single-column view: the root incident at top, all `crisis_linked = true` incidents below, a live activity feed, and a single "END CRISIS" button at the bottom right (ED-only).
- **Post-mortem workspace:** A separate canvas view, accessible only after an incident is `closed`, that pulls in the full timeline, the audit log, attached evidence, and a structured "5 Whys" form.

### G. Failure Modes & Offline Behavior

- **PagerDuty API outage:** The System maintains a local on-call schedule mirror (refreshed hourly). If PagerDuty is unreachable at S0 incident-create time, the System falls back to direct SMS via Twilio and Slack/Teams push, and queues the PagerDuty creation for retry (exponential backoff, max 5 retries over 10 minutes). A "PagerDuty degraded" warning surfaces on the Master Dashboard.
- **Slack outage:** Slack push is fire-and-forget; failure does not block incident creation. Twilio SMS remains the authoritative S0 channel.
- **Twilio outage:** For S0, the System additionally attempts a direct in-app push notification to ED and OL devices via the Mobile BFF, and falls back to email via SendGrid.
- **Scanner fleet offline:** Scanner-originated incidents obviously cannot be raised. The War Room dashboard surfaces a "scanner fleet: N/M offline" warning tile; the OL manually dispatches a runner to affected zones.
- **Field Volunteer offline (no signal):** The Mobile App queues incident reports locally in SQLite with a write-ahead log. On reconnect, reports are submitted in timestamp order; the server re-evaluates auto-merge rules at submission time. A "delayed report" badge is shown on the incident card.
- **Email-to-incident gateway delay:** SendGrid Inbound Parse can lag by 30-90 seconds under load. The gateway timestamps incidents at email-received time, not at email-sent time, but preserves the sent time in `audit_log` for forensic accuracy.
- **Crisis Mode declared while a non-critical write is in flight:** The System uses a 2-second grace window. A write that arrived before the crisis declaration but commits after is allowed; subsequent writes are rejected with 423. The audit log captures the exact millisecond of declaration.
- **Postgres replication lag to read replica:** Incident reads are pinned to the primary for 5 seconds after any write to ensure the reporter sees their own incident. After 5 seconds, reads fall back to the replica.

### H. Acceptance Criteria

- **Given** two Field Volunteers submit incidents in the same zone with the same category within 30 seconds, **when** the second incident is persisted, **then** the second incident is auto-merged into the first with `merge_reason = 'auto: time+zone+category'` and `human_merge_confirmed = false`, and a "Review merge" notification is sent to OL.
- **Given** an S0 incident is created by any reporter, **when** the incident is persisted, **then** PagerDuty, Twilio SMS, and Slack/Teams notifications are dispatched within 5 seconds, and the incident appears on the War Room board with a pulsing red border and a 60-second acknowledgement SLA timer.
- **Given** the ED declares Crisis Mode scoped to `venue`, **when** a non-critical write (e.g., a sponsor editing their booth graphics) arrives at any module, **then** the write is rejected with HTTP 423 and a message "Crisis Mode active - non-critical writes are frozen", and the audit log records the rejection.
- **Given** an incident with `protocol_impact = true`, **when** a non-PO user attempts to move the status to `closed`, **then** the transition is blocked with an error requiring PO review, and a notification is sent to the PO.
- **Given** the PagerDuty API is unreachable at the moment an S0 incident is created, **when** the System detects the failure, **then** it falls back to direct Twilio SMS to ED and on-call Security, queues the PagerDuty creation for retry, and surfaces a "PagerDuty degraded" warning on the Master Dashboard, without losing the incident or delaying the human notification.
