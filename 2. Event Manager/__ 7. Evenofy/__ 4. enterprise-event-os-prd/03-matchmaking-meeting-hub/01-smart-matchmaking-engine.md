> Module 3: B2B / G2G Matchmaking & Meeting Hub -> 3.1 Smart Matchmaking Engine

## Smart Matchmaking Engine

### A. Purpose Statement

The Smart Matchmaking Engine is the algorithmic core that pairs 10,000+ FMF attendees into 1:1 meetings worth an aggregate of US$ 9B+ in deal intent. It is used by the Matchmaking Concierge (MC) team to triage a daily queue of suggested pairings and by attendees (ATT) to opt into matchmaking and receive curated meeting proposals. At FMF scale, a purely algorithmic matcher produces diplomatic incidents (e.g., seating two Ministers from countries in active dispute across the same table); this engine enforces protocol and consent rules before any suggestion reaches a human, while still surfacing high-signal B2B opportunities at a volume no human team could scan manually.

### B. User Roles & Permissions

- **Event Director (ED):** Read on aggregate match stats (counts by state, acceptance rate, average score). No read on individual match payloads without a break-glass action that requires ED + MC co-approval.
- **Operations Lead (OL):** Read-only on aggregate counts; no access to individual match records.
- **Protocol Officer (PO):** Read on G2G matches affecting rank 1-3 dignitaries; write only to approve, block, or annotate a G2G suggestion. Cannot see B2B match payloads.
- **VIP Liaison (VL):** No direct access. If a match involves their assigned dignitary, they receive a notification through the Shadow App (Module 2.4) but cannot view the counterpart's profile until the meeting is confirmed.
- **Registration Manager (RM):** Read on the consent flag and "do not match with" lists; no read on match records.
- **Sponsorship Sales Lead (SSL):** Read on aggregate meeting counts involving sponsor booth leads; no access to individual match content.
- **Exhibitor Portal User (EPU):** Read/write on their own company's match preferences and lead-capture intent; no access to counterparty profiles until both sides accept.
- **Content and Stage Manager (CSM):** Read-only on session conflicts that block a meeting slot (for re-scheduling coordination).
- **Matchmaking Concierge (MC):** Primary user. Read on attendee profiles (subject to consent flags), conflict matrix summary, prior meeting history. Write on match records (state transitions, annotations, MC-level approval for rank 1-3 matches). Cannot modify protocol_rank or conflict_matrix records.
- **Finance and Administration Lead (FAL):** No access.
- **Marketing and PR Lead (MPL):** Read on aggregate anonymized stats only (matches by country, by industry).
- **ESG and Sustainability Officer (ESGO):** No access.
- **Field Volunteer (FV):** No access.
- **Attendee (ATT):** Heavy user. Read/write on their own consent flag, declared interests, "do not match with" list, and match requests they sent or received. Read on the match score and explanation for any suggestion they receive.

### C. Data Model

`match` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (MC or algorithm service account) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{salesforce_campaign_id, hubspot_deal_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `attendee_a_id` | `uuid` | FK -> registration.id |
| `attendee_b_id` | `uuid` | FK -> registration.id |
| `match_type` | `enum[b2b, g2g, hybrid]` | hybrid = one government, one commercial |
| `score` | `numeric(5,2)` | 0.00 to 100.00 |
| `score_breakdown` | `jsonb` | Per-factor scores, see code block below |
| `explanation` | `text` | Human-readable rationale, LLM-generated |
| `state` | `enum[suggested, accepted_by_a, accepted_by_b, scheduled, held, completed, declined, archived]` | Lifecycle state machine |
| `requires_mc_review` | `bool` | True if either attendee has protocol_rank in [1,2,3] |
| `requires_po_approval` | `bool` | True for all g2g matches |
| `po_approval_status` | `enum[pending, approved, blocked, n_a]` | n_a for non-g2g |
| `mc_review_status` | `enum[pending, approved, returned_to_algorithm, blocked]` | MC decision |
| `conflict_warning` | `jsonb null` | e.g., `{type: "commercial_dispute", case_ref: "..."}` |
| `deal_intent_flag` | `bool` | Set true after held state if either party indicates a deal |
| `estimated_deal_value` | `numeric(18,3) null` | Estimate in declared currency |
| `currency_code` | `char(3) null` | ISO 4217 |
| `consent_version` | `text` | Snapshot of both attendees' consent_version at match time |

`attendee_match_profile` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{linkedin_handle, crunchbase_permalink}` |
| `audit_log` | `jsonb[]` | Append-only |
| `attendee_id` | `uuid` | FK -> registration.id, unique per event |
| `consent_flag` | `enum[opted_in, opted_out, pending]` | Default pending; opt-in required before any match suggestion |
| `consent_version` | `text` | Increments on any consent-related mutation |
| `declared_interests` | `text[]` | e.g., `["copper","lithium","refining","ssa_investment"]` |
| `geographic_focus` | `text[]` | ISO 3166-1 alpha-2 codes |
| `deal_size_signal` | `enum[<10M, 10M_100M, 100M_1B, >1B, unspecified]` | Used in scoring but never surfaced to counterparty |
| `do_not_match_companies` | `uuid[]` | FK -> company.id |
| `do_not_match_countries` | `char(2)[]` | ISO 3166-1 alpha-2 |
| `match_capacity_per_day` | `int` | Default 6; max 12 |
| `protocol_rank_snapshot` | `enum[1,2,3,4,5,null]` | Mirrors Module 2.1 for fast filtering; null = non-dignitary |
| `is_sovereign_representative` | `bool` | True if attendee represents a state entity; triggers g2g path |
| `last_match_run_at` | `timestamptz null` | Used for daily queue computation |

`match_score_factor_weights` (per-event configuration):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (ED or MC admin role) |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | External refs |
| `audit_log` | `jsonb[]` | Append-only |
| `factor_name` | `enum[role_complementarity, interest_overlap, company_complementarity, prior_meeting_penalty, geographic_alignment, deal_size_signal]` | The six scoring factors |
| `weight` | `numeric(5,2)` | 0.00 to 1.00; sum of all weights must equal 1.00 |
| `description` | `text` | Human-readable purpose |

Score breakdown JSON shape:

```json
{
  "role_complementarity": { "raw": 92, "weighted": 18.4 },
  "interest_overlap": { "raw": 78, "weighted": 15.6 },
  "company_complementarity": { "raw": 85, "weighted": 17.0 },
  "prior_meeting_penalty": { "raw": 100, "weighted": 15.0 },
  "geographic_alignment": { "raw": 60, "weighted": 9.0 },
  "deal_size_signal": { "raw": 90, "weighted": 18.0 },
  "composite": 92.0
}
```

### D. Business Logic & Edge Cases

State machine:

```text
suggested
  |-- (either party accepts) --> accepted_by_a  OR  accepted_by_b
  |-- (either party declines) --> declined --> archived (after 30 days)
  |-- (MC blocks) --> archived
accepted_by_a
  |-- (other party accepts) --> accepted_by_b  (both must accept for scheduled)
  |-- (other party declines) --> declined
accepted_by_b
  |-- (scheduler confirms slot + room) --> scheduled
  |-- (either party cancels pre-schedule) --> declined
scheduled
  |-- (room checked-in at start time) --> held
  |-- (either party cancels > 2h before) --> declined
  |-- (no-show 10 min grace) --> declined  (and frees room)
held
  |-- (end time reached) --> completed
completed
  |-- (T+30 days post-event cleanup) --> archived
```

Conditional rules:

- IF `attendee.consent_flag` != `opted_in` THEN exclude attendee from any match suggestion.
- IF `match.match_type` = `g2g` THEN set `requires_po_approval` = true AND set `requires_mc_review` = true; the suggestion cannot surface to either ATT until PO approval is recorded.
- IF either attendee has `protocol_rank_snapshot` in `[1,2,3]` THEN set `requires_mc_review` = true regardless of match_type.
- IF a `conflict_matrix_entry` exists between the two attendees' `country_code` values with `severity` = `prohibited` THEN do not create a match; emit a `match.suppressed` event on the `match.*` topic for audit.
- IF `severity` = `restricted` THEN create the match but force `mc_review_status` = `pending` and surface a `conflict_warning` payload to the MC queue.
- IF `attendee.do_not_match_companies` or `do_not_match_countries` contains the counterparty THEN suppress the match silently (no event emitted to either party); log to audit only.
- IF both attendees have already met at this event AND `prior_meeting_penalty` would push composite < 40 THEN suppress the suggestion (a re-match is not valuable at FMF's density).
- IF `match.score` >= 90 AND no conflict or do-not-match rule fires AND `requires_mc_review` = false THEN auto-surface the suggestion to both attendees (no MC gate).
- IF `match.score` >= 90 AND a `conflict_warning` of type `commercial_dispute` is present THEN do NOT auto-surface; route to the MC review queue with `conflict_warning` highlighted; MC decides whether to release, decline, or hold for human negotiation.

Non-obvious edge case (commercial dispute between companies): Two attendees from Company X (a mining major) and Company Y (a refining consortium) mutually match with composite scores of 94.2 and 91.7 respectively. Both companies are opted in, no country-level conflict flag exists, and both attendees have declared overlapping interests in lithium refining. However, Crunchbase API returns a flag indicating active litigation between X and Y in a jurisdictional court (case reference captured in `conflict_warning.case_ref`). The system surfaces this match to the MC with a warning banner rather than auto-releasing it to the attendees. The MC can either (a) decline the match, (b) release it with a "proceed with caution" note that is visible only to the MC's log, or (c) escalate to ED for a strategic decision if the deal size signal exceeds US$ 500M. The attendees never see the suppressed suggestion, protecting both commercial reputations and the Forum's neutral posture.

Edge case (mid-event consent withdrawal): An attendee opts out of matchmaking mid-event via the mobile app. Any `suggested` or `accepted_by_a` state match involving them is automatically transitioned to `declined` with `reason_code = "consent_withdrawn"`; already `scheduled` matches remain on the calendar but are flagged with a "consent withdrawn post-schedule" banner visible only to the MC and the other attendee.

### E. Third-Party Integrations

- **LinkedIn Talent Solutions API** (limited scope): Inbound. Pulls current role, employer, and headline for profile enrichment pre-event. Data flow: LinkedIn -> Integration Hub (MuleSoft) -> attendee_match_profile. Used only with explicit ATT consent; token-scoped; no profile writes back to LinkedIn.
- **Crunchbase API**: Inbound. Pulls company category, funding stage, employee count, industry tags, and a litigation/dispute signal flag. Cached nightly into a `company_enrichment` table; refreshed 24h before event doors open. Direction: Crunchbase -> Integration Hub -> match scoring service.
- **OpenAI GPT-4 (match scoring explainability)**: Outbound request, inbound response. Given the six-factor score breakdown, the engine calls a templated prompt to generate a 1-2 sentence human-readable `explanation` (e.g., "Both parties declared copper and refining interests; company sizes complement; no prior meeting at this Forum"). No PII is sent in the prompt, only factor labels and score values. Response is cached; identical factor inputs return the cached explanation.
- **HubSpot CRM**: Outbound. When `deal_intent_flag` = true, a deal record is created in HubSpot via the Integration Hub with idempotency key derived from `match.id`. Direction: match service -> HubSpot.
- **Salesforce**: Outbound. For sponsor-attributed matches (where one attendee is a sponsor booth lead), the match metadata syncs to the sponsor's Salesforce instance via the Integration Hub. Direction: match service -> Salesforce.
- **Snowflake**: Outbound. Nightly load of anonymized match stats into the analytics warehouse for post-event ROI reporting. Direction: match service -> Snowflake via Snowpipe.
- **Pimcore MDM**: Inbound. Master company records (canonical name, industry classification, country HQ) flow from Pimcore into `company_enrichment` to resolve name disambiguation (e.g., "BHP" vs "BHP Group Ltd").
- **Module 2 Geo-Political Conflict Matrix**: Inbound via internal GraphQL federation. The MC reads `conflict_matrix_entry` records to gate g2g suggestions; changes propagate within 60 seconds (per Module 2.1 SLA).
- **Module 6 Registration**: Inbound via Kafka topic `registration.attendee.upserted`. Attendee profile changes (employer, role, declared interests) trigger match re-scoring; the consumer is idempotent on `attendee_id` + `consent_version`.
- **Azure AD B2C**: Inbound. Identity and consent claim validation at API gateway.

### F. UI/UX Notes

The MC console opens to a "Today's Queue" view: a two-pane layout with a sortable match list on the left and a detail panel on the right. Each list row shows both attendee names, country flags, match_type badge (B2B / G2G / Hybrid), composite score as a colored chip (green 80-100, yellow 60-79, gray < 60), and a state pill. Conflict warnings are surfaced as a red left-border on the row plus a warning icon. Clicking a row opens the detail panel showing the score breakdown as a horizontal stacked bar (each factor color-coded and labeled with its raw and weighted contribution), the LLM-generated explanation in plain English, the prior-meeting history between the two parties, and three primary action buttons: "Release to Attendees", "Hold for Negotiation", "Decline". The MC can annotate the match with a free-text note (encrypted at column level) and tag it for ED escalation if `estimated_deal_value` > US$ 500M.

For ATT, the matchmaking surface in the mobile app is a "Suggestions" tab: a card stack where each card shows the counterparty's name, role, company, declared interests overlap as chips, the composite score as a circular progress indicator, and "Accept" / "Decline" / "Later" buttons. A long-press on a card reveals a "Why this match?" expandable panel with the LLM explanation. G2G suggestions to ATT include an additional banner: "This meeting is subject to protocol approval; you will be notified once confirmed."

### G. Failure Modes & Offline Behavior

- **Crunchbase API unavailable**: Match scoring falls back to the last cached `company_enrichment` row (max 30 days stale). A `match.scoring.degraded` event is emitted; the MC console shows a "Company data: stale (cached N days ago)" banner. Scoring continues; only the `company_complementarity` factor may be less accurate.
- **OpenAI API timeout**: Set a 3-second timeout. On timeout or error, the `explanation` field is set to a templated fallback ("Score based on role, interest, company, geographic, and deal-size factors."). The match is still surfaced; no human-readable explanation is lost at the data level.
- **LinkedIn API rate limit (HTTP 429)**: Back off exponentially (1s, 2s, 4s, 8s, max 60s) up to 5 retries; if still failing, profile enrichment is skipped and the attendee is matched using registration-supplied data only. An alert is sent to the Integration Hub DLQ if DLQ depth exceeds 50 messages.
- **Mobile app offline (ATT)**: Suggestions are cached locally in SQLite for 24 hours; accept/decline actions queue locally and replay on reconnect with original timestamps. A "Synced at HH:MM" indicator is shown; if a suggestion was released by the MC during offline, the ATT sees it as "new" on next sync with a 5-second stagger to avoid UI thrash.
- **MC console network drop**: Console uses optimistic local state with a 60-second reconnect timer; on reconnect, the version field detects conflicts and the MC is prompted to re-review if a match state changed server-side.
- **Snowflake Snowpipe failure**: Outbound analytics load retries for 24 hours; if still failing, a `match.analytics.backlog` alert is raised in the War Room. No data is lost; the load resumes from the last watermark.
- **Module 2 conflict matrix propagation delay > 60s**: Match scoring treats the conflict matrix as eventually consistent; if propagation exceeds 60s, the MC console shows a yellow "Conflict matrix may be stale" warning and the engine blocks all g2g auto-release until fresh data is confirmed.

### H. Acceptance Criteria

- Given two attendees with overlapping interests and no conflict, when the nightly match run executes, then a `match` record is created in `suggested` state with `score` between 0 and 100, `score_breakdown` populated with all six factors, and `explanation` is a non-empty human-readable string.
- Given a g2g suggestion between two attendees whose `country_code` values have an active `conflict_matrix_entry` with `severity` = `prohibited`, when the matching service attempts to create the suggestion, then no `match` row is persisted, a `match.suppressed` event is emitted on the `match.*` Kafka topic with both attendee IDs and the conflict entry ID in the payload, and neither attendee sees a suggestion card in the mobile app.
- Given two attendees with composite scores 94.2 and 91.7 respectively where Crunchbase returns an active commercial dispute flag, when the suggestion is generated, then `requires_mc_review` = true, `conflict_warning.type` = "commercial_dispute", the suggestion does not auto-release, and the MC console displays the row with a red left-border and warning icon.
- Given an attendee sets `consent_flag` = `opted_out` mid-event, when three `suggested` and one `accepted_by_a` matches exist for them, then all four are transitioned to `declined` with `reason_code` = "consent_withdrawn" within 10 seconds, and the other attendees receive a "meeting no longer available" notification without revealing the opting-out attendee's identity.
- Given the OpenAI API times out for a match with composite score 88.5, when the scoring service falls back to the templated explanation, then the match is still surfaced to the MC with `explanation` set to the fallback template, `score_breakdown` populated, and a `match.scoring.explanation_degraded` audit event recorded.
