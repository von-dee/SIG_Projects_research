> Module 3: B2B / G2G Matchmaking & Meeting Hub -> 3.4 Post-Meeting Relationship Tracker

## Post-Meeting Relationship Tracker

### A. Purpose Statement

The Post-Meeting Relationship Tracker converts completed meetings into a persistent relationship graph that captures follow-up actions, deal pipeline state, and the cumulative history of interactions between attendees and their companies. It is used by attendees (ATT) to exchange contact info and schedule follow-ups, by Matchmaking Concierges (MC) to surface "warm" relationships for re-introduction at future Forums, and by Sponsorship Sales Leads (SSL) to report on sponsor-attributed deal flow. At FMF scale, an attendee may meet three or four times with the same counterpart across the event and post-event follow-up cycle; without a consolidating graph, the relationship appears fragmented and deal value is under-counted, directly impacting the US$ 9B+ deal-impact reporting.

### B. User Roles & Permissions

- **Event Director (ED):** Read on aggregate deal pipeline totals (count and value by stage); no read on individual relationship edges or messages without break-glass.
- **Operations Lead (OL):** No direct access; reads only the aggregate "meetings completed" tile in the Master Dashboard.
- **Protocol Officer (PO):** Read on g2g relationship edges involving rank 1-3 dignitaries; cannot modify. Used to inform next-year invitation list and delegation composition.
- **VIP Liaison (VL):** Read-only on the assigned dignitary's post-meeting relationship summary (counterpart name, meeting count, last meeting date). No access to message content.
- **Registration Manager (RM):** No access to relationship data; reads only aggregate retention metrics.
- **Sponsorship Sales Lead (SSL):** Read on aggregate stats for meetings involving their sponsor's booth leads; can export aggregated deal pipeline (won/lost/in-progress with deal value ranges) to Salesforce or HubSpot. No access to individual meeting content without ATT consent.
- **Exhibitor Portal User (EPU):** Read/write on relationship edges originating from their own company's staff; can mark deals "won" or "lost" with reason codes; cannot see other exhibitors' relationships.
- **Content and Stage Manager (CSM):** No direct access.
- **Matchmaking Concierge (MC):** Primary user. Read/write on relationship edges, follow-up actions, deal pipeline states, and consolidated meeting instances. Can annotate edges for next-year reintroduction suggestions.
- **Finance and Administration Lead (FAL):** Read on aggregate deal pipeline totals for revenue recognition planning; no read on individual deals.
- **Marketing and PR Lead (MPL):** Read-only on aggregated anonymized stats (deals by country, by industry, by value band) for press releases.
- **ESG and Sustainability Officer (ESGO):** No access.
- **Field Volunteer (FV):** No access.
- **Attendee (ATT):** Heavy user. Read/write on their own relationship edges, follow-up actions, contact exchanges. Can mark deals, schedule follow-up calls, request deletion of their meeting history (GDPR right to be forgotten).

### C. Data Model

`relationship_edge` (extends shared columns, persisted in Neo4j as the canonical source with PostgreSQL projection for query convenience):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC of first meeting between these two attendees |
| `updated_at` | `timestamptz` | UTC of last edge mutation |
| `created_by` | `uuid` | Actor (orchestrator service) |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete; for GDPR full purge, see `purge_state` |
| `ext_refs` | `jsonb` | e.g., `{neo4j_edge_id, salesforce_opportunity_id, hubspot_deal_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `attendee_a_id` | `uuid` | FK -> registration.id (alphabetically first by uuid for canonical direction) |
| `attendee_b_id` | `uuid` | FK -> registration.id |
| `company_a_id` | `uuid null` | FK -> company.id |
| `company_b_id` | `uuid null` | FK -> company.id |
| `edge_type` | `enum[b2b, g2g, hybrid]` | Mirrors match_type of originating matches |
| `first_meeting_at` | `timestamptz` | UTC of first completed meeting |
| `last_meeting_at` | `timestamptz` | UTC of most recent completed meeting |
| `meeting_count` | `int` | Cumulative count of completed meetings between these two attendees |
| `cumulative_estimated_deal_value` | `numeric(18,3)` | Sum of `estimated_deal_value` across meetings with `deal_intent_flag` = true |
| `currency_code` | `char(3)` | ISO 4217; locked at first deal tag, FX-converted on display |
| `pipeline_state` | `enum[none, in_progress, won, lost, stalled]` | Deal pipeline state, default none |
| `pipeline_state_changed_at` | `timestamptz null` | UTC of last pipeline transition |
| `pipeline_reason_code` | `text null` | Required when state = lost or stalled |
| `consent_contact_exchange` | `enum[granted, denied, pending]` | Both attendees must grant for contact info to be visible |
| `follow_up_actions` | `jsonb[]` | Array of `{type, scheduled_at, status, notes}` |
| `purge_state` | `enum[n_a, requested, in_progress, completed]` | GDPR right to be forgotten state |
| `purge_requested_at` | `timestamptz null` | UTC of GDPR purge request |
| `purge_completed_at` | `timestamptz null` | UTC of purge completion |

`meeting_instance` (extends shared columns, each row = one held meeting):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (orchestrator) |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{zoom_recording_id, content_repo_meeting_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `relationship_edge_id` | `uuid` | FK -> relationship_edge.id |
| `scheduled_meeting_id` | `uuid` | FK -> scheduled_meeting.id |
| `match_id` | `uuid` | FK -> match.id |
| `held_at` | `timestamptz` | UTC of meeting start |
| `duration_minutes` | `int` | Actual duration |
| `format` | `enum[in_person, hybrid, virtual]` | |
| `deal_intent_flag` | `bool` | Set true if either party indicated a deal |
| `estimated_deal_value` | `numeric(18,3) null` | Estimated deal value in declared currency |
| `currency_code` | `char(3) null` | ISO 4217 |
| `tags` | `text[]` | e.g., `["mou_draft","joint_venture","offtake_agreement"]` |
| `notes_shared` | `jsonb` | e.g., `{contact_cards_exchanged: true, documents_shared: ["term_sheet_v1.pdf"]}` |
| `consent_broad_access` | `bool` | True if both participants consented to broader sponsor/press access (default false) |
| `recording_ref` | `uuid null` | FK -> content_repository.recording.id; null if no recording |

`follow_up_action` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (ATT or MC) |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{calendly_event_id, hubspot_activity_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `relationship_edge_id` | `uuid` | FK -> relationship_edge.id |
| `action_type` | `enum[call, video_call, email, in_person_meeting, document_share, none]` | |
| `scheduled_at` | `timestamptz null` | Scheduled time, null if immediate |
| `status` | `enum[pending, completed, cancelled, missed]` | |
| `notes` | `text null` | ATT-private notes, encrypted at column level |
| `initiator_id` | `uuid` | FK -> registration.id |
| `target_id` | `uuid` | FK -> registration.id |

`purge_request` (extends shared columns, GDPR right to be forgotten):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ATT requesting purge |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{gdpr_ticket_id, dpo_review_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `attendee_id` | `uuid` | FK -> registration.id |
| `scope` | `enum[full, pii_only]` | full = remove all edges; pii_only = preserve anonymized aggregates |
| `state` | `enum[requested, dpo_review, in_progress, completed, rejected]` | |
| `reason` | `text null` | Free text from ATT |
| `dpo_decision` | `enum[pending, approved, rejected]` | Data Protection Officer gate |
| `dpo_decision_at` | `timestamptz null` | UTC |
| `completed_at` | `timestamptz null` | UTC of purge completion |

### D. Business Logic & Edge Cases

Edge consolidation (Cypher-style pseudo-query):

```text
WHEN a meeting_instance is created (state -> held):
  MATCH (a:Attendee)-[r:RELATIONSHIP]-(b:Attendee)
    WHERE a.id = meeting.attendee_a_id AND b.id = meeting.attendee_b_id
  IF r EXISTS:
    UPDATE r.meeting_count += 1, r.last_meeting_at = meeting.held_at,
           r.cumulative_estimated_deal_value += meeting.estimated_deal_value
    APPEND meeting_instance to r.meeting_instances
  ELSE:
    CREATE (a)-[r:RELATIONSHIP {
      first_meeting_at: meeting.held_at,
      last_meeting_at: meeting.held_at,
      meeting_count: 1,
      cumulative_estimated_deal_value: meeting.estimated_deal_value,
      pipeline_state: 'none'
    }]->(b)
```

Conditional rules:

- IF two attendees meet three times across the event THEN system consolidates into a single `relationship_edge` with `meeting_count` = 3 and three `meeting_instance` records linked; the relationship detail view in the UI surfaces the cumulative relationship timeline rather than three disconnected meetings.
- IF `meeting_instance.deal_intent_flag` = true AND `estimated_deal_value` > 0 THEN `relationship_edge.pipeline_state` defaults to `in_progress` and `cumulative_estimated_deal_value` is incremented.
- IF either ATT updates `pipeline_state` to `won` or `lost` THEN `pipeline_reason_code` is required (non-empty string), the change is logged to `audit_log`, and a `pipeline.state_changed` event is emitted on the `meeting.*` topic for sponsor CRM sync.
- IF `consent_contact_exchange` = `granted` for both attendees THEN contact info (email, phone, LinkedIn handle) becomes visible in the relationship detail view; otherwise only name and company are visible.
- IF a sponsor booth lead is the originating context for the meeting THEN `relationship_edge` is tagged with `sponsor_id` and aggregate stats flow to the sponsor's Salesforce/HubSpot via the Integration Hub; individual meeting content does NOT sync without `consent_broad_access` = true.
- IF an ATT submits a `purge_request` with `scope` = `full` THEN the request enters `dpo_review` state and the Data Protection Officer (or delegate) must approve within 30 days per GDPR Article 17.
- IF `purge_request.state` = `completed` AND `scope` = `full` THEN all `relationship_edge` rows involving the ATT are deleted (hard delete with audit trail); all `meeting_instance` records involving the ATT are deleted; the Neo4j edges are removed; aggregate anonymized stats (e.g., total meetings count, total deal value band) are preserved in the analytics warehouse with the ATT's contribution subtracted but not re-identifiable.
- IF `scope` = `pii_only` THEN names, contact info, and meeting notes are deleted; aggregate deal value and meeting count contributions are preserved (anonymized).
- IF a meeting's `recording_ref` exists AND a purge is requested THEN the recording in the Content Repository is purged and a `recording.purged` event is emitted on the `meeting.*` topic.

Non-obvious edge case (multiple meetings consolidated): ATT-A and ATT-B meet on Day 1 (15 min, deal_intent = false), Day 2 (30 min, deal_intent = true, estimated_deal_value = US$ 25M), and Day 3 (45 min, deal_intent = true, estimated_deal_value = US$ 40M, tags = ["mou_draft"]). The system creates a single `relationship_edge` on Day 1 with `meeting_count` = 1; on Day 2 it appends the second `meeting_instance`, increments `meeting_count` to 2, sets `pipeline_state` = `in_progress`, and updates `cumulative_estimated_deal_value` to US$ 25M; on Day 3 it appends the third instance, increments `meeting_count` to 3, and updates `cumulative_estimated_deal_value` to US$ 65M. The relationship detail view in the UI surfaces a single card with the timeline of all three meetings stacked, the total cumulative deal value, and the latest tags. This avoids double-counting in the US$ 9B+ deal-impact report (which sums `cumulative_estimated_deal_value` across unique edges, not across meetings).

Edge case (GDPR right to be forgotten): ATT-C attends FMF, has 12 meetings with 8 unique counterparts (8 relationship_edges), and post-event submits a `purge_request` with `scope` = `full`. The request enters `dpo_review`; the DPO verifies identity and approves within 14 days. The system: (a) hard-deletes all 8 `relationship_edge` rows involving ATT-C (preserving audit trail in `audit_log` and a separate `purge_audit` table), (b) hard-deletes all 12 `meeting_instance` records involving ATT-C, (c) removes the corresponding Neo4j edges, (d) subtracts ATT-C's deal value contributions from the cumulative totals on each counterpart's remaining edges (or sets `cumulative_estimated_deal_value` = 0 if all deals were with ATT-C alone), (e) preserves the aggregate anonymized stat in the analytics warehouse ("12 meetings occurred, total estimated deal value US$ X") but with no PII link back to ATT-C. ATT-C receives email confirmation via Brevo within 24 hours of completion. The aggregate stats used in FMF's post-event impact report are not reduced; the report explicitly notes "X attendees exercised GDPR right to be forgotten; aggregate stats are anonymized."

### E. Third-Party Integrations

- **Salesforce CRM**: Outbound. When a `relationship_edge` is tagged with a `sponsor_id` (sponsor-attributed meeting), the edge and its deal pipeline state sync to the sponsor's Salesforce instance via the Integration Hub. Direction: tracker -> Salesforce; sync is bidirectional for pipeline_state changes initiated in Salesforce by the sponsor's sales team.
- **HubSpot CRM**: Outbound alternative. Same data flow as Salesforce; selection based on sponsor's CRM of record. Direction: tracker -> HubSpot.
- **Calendly**: Outbound scheduling. When an ATT schedules a follow-up call from the relationship detail view, Calendly is invoked to find a slot. Direction: tracker -> Calendly; inbound webhook for confirmation.
- **Microsoft Graph / Google Calendar**: Outbound. Follow-up calls appear in ATT's calendar with the relationship context (counterpart name, prior meeting summary). Direction: tracker -> Microsoft Graph / Google Calendar.
- **Brevo (Sendinblue)**: Outbound. Follow-up email sequences and post-event nudge emails ("You met 8 people at FMF; tap to view your relationship graph") are sent via Brevo. Direction: tracker -> Brevo.
- **SendGrid**: Outbound alternative email provider. Direction: tracker -> SendGrid.
- **Twilio**: Outbound. SMS reminders for follow-up calls 10 minutes before scheduled time. Direction: tracker -> Twilio.
- **Snowflake**: Outbound. Nightly load of anonymized relationship stats and deal pipeline aggregates into the analytics warehouse. Direction: tracker -> Snowflake via Snowpipe.
- **Neo4j**: Persistence (canonical). The relationship graph is persisted in Neo4j per the System Architecture Overview (Module 0.1). Reads for graph traversal (e.g., "find all attendees connected to ATT-A within 2 hops") go directly to Neo4j.
- **Pimcore MDM**: Inbound. Company canonical records for relationship edges that span companies (vs individuals). Direction: Pimcore -> tracker.
- **Module 4 Content Repository**: Inbound via Kafka topic `recording.*`. Recording references are linked to `meeting_instance.recording_ref` for in-context playback from the relationship detail view.
- **OpenAI**: Outbound. Generates a 1-2 sentence "relationship summary" (e.g., "You first met on Day 1 around lithium refining, deepened discussions on Day 2 with a US$ 25M intent, and reviewed an MoU draft on Day 3.") for display in the UI. No PII is sent; only aggregate labels and meeting counts.

### F. UI/UX Notes

For ATT, the "My Network" tab in the mobile app shows a vertical list of relationship cards sorted by `last_meeting_at` descending. Each card displays: counterpart name and photo, company, edge_type badge, meeting_count chip ("3 meetings"), cumulative_deal_value (if any, displayed as a band like "US$ 25M-50M"), pipeline_state pill (In Progress / Won / Lost), and a "Summary" expandable section with the LLM-generated summary. Tapping a card opens the relationship detail view: a stacked timeline of all meeting_instances with date, duration, format, and a thumbnail of any shared documents; a "Follow Up" button that opens a sheet to schedule a call (via Calendly), send an email (via Brevo), or share a document; and a "Manage Relationship" section to update pipeline_state with required reason code for lost/stalled.

For the MC, the "Relationship Graph" view is a force-directed Neo4j visualization (Bloom or neovis.js) centered on a selected attendee or company. Nodes are sized by meeting_count and colored by attendee role; edges are thickness-scaled by cumulative_deal_value. Hovering an edge shows a tooltip with the meeting instances and tags. A sidebar lets the MC filter by date range, deal value band, pipeline_state, and edge_type. A "Suggest Reintroduction" button on a stale edge (last_meeting_at > 6 months) flags the edge for the next-year event's MC queue.

For SSL, the "Sponsor Insights" view shows aggregate stats: total meetings involving sponsor booth leads (count and value band), pipeline_state distribution (won/lost/in-progress), top 10 counterpart companies by cumulative value, and a CSV export button that generates a Salesforce-importable CSV with the sponsor's attribution tag.

### G. Failure Modes & Offline Behavior

- **Neo4j unavailable**: Reads fall back to the PostgreSQL projection (less graph-traversal capable but supports the common case of listing relationships for a single attendee). Writes are queued in Kafka on the `meeting.*` topic and replayed when Neo4j recovers; SLA for replay is 5 minutes. MC console shows a "Graph database degraded" banner.
- **Salesforce sync failure**: Retried with exponential back-off; if still failing after 24 hours, the change is held in a `sync_pending` queue and the sponsor sees a "Last sync 24h ago" warning in the Sponsor Insights view. No data loss.
- **HubSpot rate limit (HTTP 429)**: Back off exponentially; if persistent, throttle sync to sponsor-tier-based priority (Platinum sponsors sync first).
- **Calendly API timeout**: Follow-up scheduling falls back to an in-app slot picker that queries both attendees' calendars via Microsoft Graph / Google Calendar directly.
- **OpenAI summary generation failure**: Falls back to a templated summary ("You met N times between [first_meeting_at] and [last_meeting_at]. Total estimated deal value: [band]."); no relationship data is lost.
- **Mobile app offline**: Relationship cards cached in SQLite for 30 days; follow-up actions queue locally and replay on reconnect with original timestamps. The "My Network" tab shows "Last synced at HH:MM" indicator.
- **Snowflake Snowpipe failure**: Outbound analytics load retries for 24 hours; if still failing, a `tracker.analytics.backlog` alert is raised in the War Room. No data lost; load resumes from last watermark.
- **DPO review SLA breach**: If `purge_request` is in `dpo_review` state for more than 25 days, an automated alert escalates to the ED and the System's DPO delegate. GDPR Article 17 requires completion within 30 days; the SLA watchdog fires at day 25 to leave a 5-day buffer.
- **Recording purge cascade failure**: If a `recording.purged` event fails to consume in the Content Repository, the tracker retries with exponential back-off; if still failing after 24 hours, the recording is forcibly marked `purge_failed` and surfaced in the War Room for manual intervention.

### H. Acceptance Criteria

- Given ATT-A and ATT-B meet on Day 1, Day 2, and Day 3, when the Day 3 meeting transitions to `held`, then a single `relationship_edge` exists with `meeting_count` = 3, three `meeting_instance` records linked, `cumulative_estimated_deal_value` = sum of all three meetings' deal_intent values, and the UI surfaces a single relationship card with the timeline of all three meetings stacked.
- Given ATT-C submits a `purge_request` with `scope` = `full` and the DPO approves, when the purge completes, then all `relationship_edge` and `meeting_instance` records involving ATT-C are hard-deleted, the audit trail is preserved in `purge_audit`, the Neo4j edges are removed, aggregate anonymized stats in the analytics warehouse are preserved with no PII link to ATT-C, and ATT-C receives email confirmation via Brevo within 24 hours.
- Given a meeting tagged with `sponsor_id` and `deal_intent_flag` = true, when `pipeline_state` transitions to `won`, then within 60 seconds a `pipeline.state_changed` event is emitted on the `meeting.*` topic, the change syncs to the sponsor's Salesforce (or HubSpot) instance via the Integration Hub, and the SSL Sponsor Insights view reflects the new state on next refresh.
- Given an ATT requests deletion of their meeting history but the DPO rejects the request (e.g., legal hold), when the rejection is recorded, then `purge_request.state` = `rejected`, `dpo_decision` = `rejected` with `dpo_decision_at` populated, the ATT receives a rejection notification via Brevo with the DPO's reason, and no relationship data is modified.
- Given a relationship_edge has `last_meeting_at` > 6 months prior to the next-year FMF event, when the MC opens the Relationship Graph view for the upcoming event, then the edge is visually marked as "stale" with a "Suggest Reintroduction" action button that flags the edge for the next-year MC queue.
