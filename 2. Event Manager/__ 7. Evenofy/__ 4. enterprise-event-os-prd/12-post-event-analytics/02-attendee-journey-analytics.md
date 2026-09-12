> Module 12: Post-Event Analytics & Data Engine -> 12.2 Attendee Journey Analytics

## Attendee Journey Analytics

### A. Purpose Statement

The Attendee Journey Analytics subsystem reconstructs the full end-to-end experience of every individual who participates in the Future Minerals Forum, from the moment they first touch the registration page (sometimes 9 months before the event) through their post-event survey response (typically 7 to 14 days after closing). At FMF scale, this means producing a coherent, time-ordered, deduplicated journey for each of the 10,000+ attendees that stitches together their touchpoints across registration, check-in, session attendance, B2B and G2G meeting participation, mobile app engagement, F&B consumption, sponsor booth visits, content downloads, push notification taps, live-stream viewing, and post-event survey completion. A single minister-level attendee at FMF 2025 produced 1,847 discrete touchpoint events across 4 days; a casual investor attendee produced 184. The analytical value is in the comparison: the journey tells the platform team what engagement patterns differentiate a high-value repeat attendee from a one-time casual attendee, and what intervention points prevent drop-off.

The subsystem owns the `analytics.journey.*` Kafka topic prefix within the broader `analytics.*` bounded context established in Module 0.1. It publishes `analytics.journey.touchpoint.captured`, `analytics.journey.attendee.reconstructed`, `analytics.journey.engagement_score.computed`, `analytics.journey.dropoff.detected`, `analytics.journey.cohort.classified`, `analytics.journey.survey.imputed`, and `analytics.journey.followup.suggested`. It subscribes to `registration.confirmed` and `registration.cancelled` (Module 6.1), `checkin.completed` (Module 6.4), `session.scan` and `session.attendance` (Module 4.1), `meeting.scheduled`, `meeting.checked_in`, and `meeting.completed` (Modules 3.1 and 3.2), `app.screen_viewed` and `app.push_tapped` and `app.notification_received` (Module 7.1), `fnb.voucher.redeemed` and `fnb.staff_scan.logged` (Module 8.3), `booth.visit.entered` and `booth.visit.exited` and `lead.captured` (Modules 5.2 and 5.4), `session.rating.submitted` (Module 4.2), and `survey.response.submitted` (Module 6.1 post-event survey). Its non-negotiable contract is that every journey event row is traceable to a Kafka topic, a partition offset, and the upstream source event, and that every derived engagement score is reproducible from the underlying touchpoint events using the versioned scoring configuration captured in `audit_log`.

The subsystem consumes the `fct_attendee_journey_daily` mart produced by Module 12.1, enriches it with cross-touchpoint sequencing and engagement scoring, and produces a new set of analytical surfaces: a Sankey flow visualization showing the aggregate journey from touchpoint to touchpoint, a cohort analysis grid breaking down engagement by persona and registration type, a per-attendee timeline reconstructed for individual review, and a drop-off analysis highlighting where attendees disengage. These surfaces feed the ED's Executive Insights Dashboard (Module 12.4), the MPL's post-event campaign planning, and the RM's registration funnel optimization.

### B. User Roles & Permissions

- **Event Director (ED):** Read on aggregate journey analytics (Sankey, cohort, drop-off). No read on individual attendee journey timelines unless explicitly granted per-attendee via a two-person approval (ED + RM) for case-by-case investigation.
- **Operations Lead (OL):** Read on drop-off analysis filtered to operational touchpoints (check-in queues, F&B lines, venue congestion). No access to commercial or persona-cohort breakdowns.
- **Protocol Officer (PO):** Read on delegation-level aggregate journey metrics only. No individual attendee journey access; this preserves diplomatic discretion (a delegation's internal engagement patterns are sensitive).
- **VIP Liaison (VL):** Read on the individual journey timeline for their assigned dignitary only. The VL uses this surface to brief the dignitary on their engagement summary and to identify unmet follow-up actions.
- **Registration Manager (RM):** Read on registration-funnel touchpoints and the registration-to-check-in conversion cohort. Can trigger the follow-up outreach workflow for attendees flagged as "low-app-engagement" or "incomplete-survey".
- **Sponsorship Sales Lead (SSL):** Read on aggregate journey metrics filtered to attendees who visited their sponsors' booths or who attended sponsor-hosted sessions. No individual attendee journey access without consent.
- **Exhibitor Portal User (EPU):** Read on aggregate journey metrics for attendees who visited their booth; no individual attendee identity (only pseudonymized cohort aggregates).
- **Content & Stage Manager (CSM):** Read on session-attendance journey metrics (which sessions attendees went to in sequence, session-to-session retention). Used to optimize next year's agenda.
- **Matchmaking Concierge (MC):** Read on meeting participation journey metrics; used to identify attendees who accepted few meetings and may need proactive matchmaking next cycle.
- **Finance & Administration Lead (FAL):** Read on cost-per-engaged-attendee metrics derived from the journey and the finance mart. No access to individual attendee data.
- **Marketing & PR Lead (MPL):** Read on aggregate journey cohorts broken down by registration source campaign (e.g., "attendees from the LinkedIn campaign engaged at 1.4x the rate of attendees from the email campaign"). Used to optimize next year's channel mix.
- **ESG & Sustainability Officer (ESGO):** Read on journey cohorts correlated with ESG engagement (attendees who attended ESG sessions, visited ESG sponsors). No PII.
- **Field Volunteer (FV):** No direct access. Their scan events feed the journey but they do not consume it.
- **Attendee (ATT):** Read on their own personal journey timeline via the Mobile App post-event recap surface. Sees their own touchpoints, their engagement score, their percentile rank against their cohort, and their personal highlights (sessions attended, meetings held, booths visited).

### C. Data Model

`analytics_journey_touchpoint` (the atomic unit of one attendee's interaction with one touchpoint):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Service account (journey-builder) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{kafka_topic, kafka_partition, kafka_offset, source_event_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `attendee_id` | `uuid` | FK -> attendee.id |
| `touchpoint_type` | `enum[registration, checkin, session_attendance, meeting_participation, app_screen_view, push_tapped, fnb_consumption, booth_visit, lead_captured, content_download, livestream_view, survey_response]` | |
| `touchpoint_subtype` | `text` | e.g., "session_attendance.plenary_keynote", "app_screen_view.exhibitor_directory", "fnb_consumption.coffee_break" |
| `touchpoint_time` | `timestamptz` | The actual moment of interaction (UTC) |
| `venue_id` | `uuid null` | FK -> venue.id when applicable |
| `session_id` | `uuid null` | FK -> session.id when applicable |
| `meeting_id` | `uuid null` | FK -> meeting.id when applicable |
| `sponsor_id` | `uuid null` | FK -> sponsor.id when applicable |
| `engagement_weight` | `numeric(5,2)` | Configurable weight per touchpoint type, used in score computation |
| `depth_score` | `numeric(5,2)` | How deeply the attendee engaged (e.g., session attended for 90 minutes scores higher than 15 minutes) |
| `source_artifact_ref` | `text null` | URI to source artifact (e.g., scan record, app analytics event) |
| `is_imputed` | `boolean` | True if the touchpoint was inferred from indirect evidence rather than directly captured |
| `imputation_method` | `text null` | Required when is_imputed = true |

`analytics_journey_attendee_summary` (one row per attendee per event):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Service account |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{amplitude_user_id, segment_user_id, ga4_client_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `attendee_id` | `uuid` | FK -> attendee.id |
| `persona` | `enum[minister, investor, sponsor_rep, staff, press, volunteer, exhibitor]` | |
| `registration_type` | `text` | e.g., "VIP-Invited", "Investor-Paid", "Press-Accredited" |
| `touchpoint_count` | `int` | Total touchpoints captured |
| `touchpoint_types_covered` | `int` | Count of distinct touchpoint_type values |
| `engagement_score` | `numeric(5,2)` | Composite score 0-100 |
| `engagement_score_percentile` | `numeric(5,2)` | Rank within persona cohort |
| `first_touchpoint_time` | `timestamptz` | |
| `last_touchpoint_time` | `timestamptz` | |
| `active_days` | `int` | Count of distinct days with at least one touchpoint |
| `app_engagement_flag` | `enum[high, medium, low, none]` | Derived from app-specific touchpoint density |
| `dropoff_point` | `text null` | e.g., "after Day 1 plenary", "after registration" |
| `survey_completed` | `boolean` | |
| `survey_score_imputed` | `boolean` | True if survey score was imputed |
| `survey_imputation_confidence_interval` | `numeric(5,2) null` | +/- percentage when imputed |
| `follow_up_suggested` | `boolean` | |

`analytics_journey_cohort` (aggregated journey metrics by persona and registration type):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Service account |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{lookml_explore_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `cohort_key` | `text` | e.g., "persona=minister+registration_type=VIP-Invited" |
| `persona` | `text` | |
| `registration_type` | `text` | |
| `attendee_count` | `int` | |
| `avg_touchpoint_count` | `numeric(10,2)` | |
| `avg_engagement_score` | `numeric(5,2)` | |
| `median_engagement_score` | `numeric(5,2)` | |
| `app_engagement_high_pct` | `numeric(5,2)` | Percentage of cohort with high app engagement |
| `app_engagement_none_pct` | `numeric(5,2)` | |
| `avg_active_days` | `numeric(5,2)` | |
| `survey_completion_rate` | `numeric(5,2)` | |
| `dropoff_after_day1_pct` | `numeric(5,2)` | |
| `computed_at` | `timestamptz` | Materialization time |

`analytics_journey_sankey_edge` (the aggregate flow from one touchpoint to the next, used in the Sankey visualization):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Service account |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{looker_sankey_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `source_touchpoint_type` | `text` | |
| `source_touchpoint_subtype` | `text null` | |
| `target_touchpoint_type` | `text` | |
| `target_touchpoint_subtype` | `text null` | |
| `attendee_flow_count` | `int` | Number of attendees who followed this edge |
| `persona_filter` | `text null` | e.g., "minister", null = all personas |
| `computed_at` | `timestamptz` | |

### D. Business Logic & Edge Cases

- **IF** an attendee has session scan touchpoints but zero app touchpoints (no `app.screen_viewed`, no `push_tapped`), **THEN** the journey is reconstructed from session scans only, the `app_engagement_flag` is set to `none`, the attendee is flagged `low-app-engagement` in a follow-up outreach queue, and a `analytics.journey.followup.suggested` event is published with `follow_up_reason = "low-app-engagement"` for the RM to trigger an outreach workflow.
- **IF** an attendee did not complete the post-event survey within the 14-day window, **THEN** the `survey_score_imputed` flag is set to `true`, the survey response score is imputed from the mean score of attendees in the same `persona` and `registration_type` cohort, an `imputation_confidence_interval` of +/- 8 points is recorded (derived from the cohort standard deviation), and a follow-up outreach workflow is offered to the RM with a pre-drafted email acknowledging the missed survey and offering a 30-second one-question version.
- **IF** the same touchpoint is captured by two different sources (e.g., a session scan via the Staff App and the same scan via the Badge reader sensor at the door), **THEN** the deduplication logic uses `(attendee_id, touchpoint_type, touchpoint_subtype, touchpoint_time within 60 seconds)` as the deduplication key, keeps the touchpoint from the higher-fidelity source (Badge reader sensor > Staff App scan > app screen view inference), and records the duplicate in `audit_log` with the discarded source's `kafka_offset`.
- **IF** an attendee's journey shows a `booth_visit.entered` event without a corresponding `booth_visit.exited` event within 60 minutes, **THEN** the journey builder imputes a `booth_visit.exited` event 30 minutes after the entry (the median dwell time for that booth's tier), sets `is_imputed = true` and `imputation_method = "median_dwell_time"`, and the booth's dwell-time metric uses this imputed value with a confidence flag.
- **IF** an attendee attends a session but their scan event arrives more than 5 minutes after the session start time, **THEN** the journey attributes them as `late_arrival` for that session, the `depth_score` for that session is reduced by 20%, and the CSM sees a "session late-arrival rate" metric on their dashboard.
- **IF** an attendee's registration was cancelled and then re-confirmed within 24 hours (e.g., a payment issue resolved), **THEN** the journey includes both the cancellation touchpoint and the re-confirmation touchpoint, the `engagement_score` is not penalized for the cancellation, and the cohort view shows this attendee in a "recovered-registration" sub-cohort for funnel analysis.
- **IF** an attendee's first touchpoint is `session_attendance` (i.e., they were checked in but never explicitly registered, such as a delegate added to a delegation at the last minute), **THEN** the journey builder imputes a `registration` touchpoint retroactively with `is_imputed = true`, the persona is inferred from the delegation's persona mix, and the attendee is flagged for retrospective registration cleanup.
- **IF** an attendee's engagement score crosses the 75th percentile of their persona cohort mid-event (based on the live-streaming mart), **THEN** a `analytics.journey.engagement_score.computed` event is published with `is_high_engagement = true`, and the MC team receives a Slack alert suggesting proactive outreach for a next-cycle VIP upgrade.

**Edge case (non-obvious): the minister who never opened the app.** A senior minister from a GCC country attended all three plenary sessions, two bilateral G2G meetings, and the closing dinner, but never opened the FMF mobile app, never tapped a push notification, and never scanned into any booth. Their `touchpoint_count` is 47 (sessions, meetings, F&B, check-in), all in the `session_attendance`, `meeting_participation`, `fnb_consumption`, and `checkin` types. Their `touchpoint_types_covered` is 4. Without app touchpoints, the naive engagement score (weighted toward app activity by default configuration) would under-credit this attendee and rank them in the 30th percentile of the minister cohort. The journey scoring engine detects this pattern (high count, low type coverage, no app touchpoints) and applies the `diplomatic_no_app_persona` scoring profile, which excludes app-engagement weight for ministers and reweights toward meeting participation and protocol touchpoints. The minister's engagement score is recomputed to the 82nd percentile. The VL briefing for this dignitary's post-event summary explicitly notes "engagement measured via diplomatic protocol profile, app-engagement excluded" to prevent the metric from being misread.

**Edge case (non-obvious): the investor who skipped the post-event survey but rated every session.** An investor attendee attended 18 sessions and submitted a 5-star rating for each session within minutes of the session ending, but did not respond to the post-event survey despite three reminder emails. The survey's headline metric (overall event NPS) is missing. The journey subsystem uses imputation: the attendee's session-rating average (4.6 out of 5) is used as a proxy for the survey's overall satisfaction question, with a `survey_imputation_confidence_interval` of +/- 12 points (wider than the cohort-mean imputation because the session-rating signal is stronger but not directly equivalent to the survey NPS question). The imputation method is recorded as `session_rating_proxy`. The attendee summary surfaces `survey_completed = false` and `survey_score_imputed = true` transparently. The follow-up outreach workflow offers a one-question version: "We noticed you rated every session 5 stars. Would you recommend FMF to a colleague?" This 1-question version, when answered, replaces the imputation with a real response.

### E. Third-Party Integrations

- **Amplitude (or Mixpanel as alternative):** Product analytics for the mobile app and web touchpoints. Data flow: Mobile App (Segment SDK) -> Amplitude ingestion -> Amplitude dashboard (used by the platform product team for app engagement analysis). The warehouse also pulls Amplitude events nightly via the Amplitude Export API into the `analytics_journey_touchpoint` table for cross-channel stitching. Bidirectional: journey-derived cohort labels are pushed back to Amplitude as user properties for segmentation in product analytics.
- **Segment (Customer Data Platform):** Unified tracking layer across web, mobile, and server-side sources. Data flow: every touchpoint SDK (web, iOS, Android, server) -> Segment -> fanned out to Amplitude (product analytics), to Google Analytics 4 (web analytics), to the warehouse Kafka topic `analytics.journey.touchpoint.captured`, and to Salesforce Marketing Cloud (for post-event email outreach). Segment's identity-resolution graph is the canonical source for stitching anonymous web sessions to a known `attendee_id` after registration.
- **Looker (or Tableau Cloud as alternative):** BI consumption layer for the journey dashboards. Data flow: ClickHouse mart `fct_attendee_journey_daily` -> Looker LookML model -> Looker explores -> Sankey flow dashboard, cohort grid dashboard, drop-off funnel dashboard. The VL's individual dignitary journey timeline is rendered via a Looker embedded dashboard with a row-level filter on `attendee_id = <dignitary_id>`.
- **Google Analytics 4 (web touchpoints):** Captures the pre-registration web journey (which campaign source drove the attendee to the registration page, how many touchpoints on marketing pages before registration). Data flow: GA4 -> BigQuery export (nightly) -> warehouse `analytics_journey_touchpoint` table for cross-channel attribution with the GA4 `client_id` stitched to `attendee_id` via Segment's identity graph.
- **Salesforce Marketing Cloud (post-event outreach):** Consumes the follow-up outreach workflow suggestions. Data flow: `analytics.journey.followup.suggested` Kafka event -> Salesforce Marketing Cloud journey entry -> personalized email or SMS based on the follow-up reason (low-app-engagement, incomplete-survey, recovered-registration).
- **Slack (alerting):** High-engagement attendee alerts and drop-off cohort alerts posted to dedicated channels (`#high-engagement-alerts`, `#dropoff-analysis`).
- **Looker Embedded (in the Sponsor Portal):** Aggregate journey metrics for sponsors filtered to their booth visitors. Row-level security enforced via Looker's `sponsor_id` user attribute.

### F. UI/UX Notes

The ED's primary journey surface is the "Aggregate Journey Dashboard" with three panels. Panel 1: a Sankey flow diagram (rendered via ECharts or D3.js) showing the aggregate flow from registration through every subsequent touchpoint, with edge thickness proportional to `attendee_flow_count` and the ability to filter by persona, registration type, or day. Panel 2: a cohort heat map showing persona on the y-axis, registration type on the x-axis, and color intensity by `avg_engagement_score`. Panel 3: a drop-off funnel showing the percentage of attendees who reached each successive touchpoint stage, with the steepest drop-off highlighted in red.

The VL's primary surface is the "Individual Dignitary Journey" timeline view. A horizontal timeline spanning the event days shows every touchpoint as a colored dot (color by `touchpoint_type`), with hover tooltips showing the touchpoint detail. Below the timeline, a "Highlights" panel summarizes the dignitary's engagement score, percentile rank in their persona cohort, top 3 sessions attended (by `depth_score`), top 3 meetings held (by meeting counterparty rank), and any flagged follow-up actions. A "Download PDF briefing" button generates a one-page summary for the VL to share with the dignitary's office.

The RM's primary surface is the "Follow-up Outreach Queue" listing every attendee flagged `follow_up_suggested = true`, sorted by `engagement_score_percentile` (lowest first). Each row shows the attendee's pseudonymized ID (real name visible only on click with two-person approval for non-VL users), the follow-up reason, a pre-drafted outreach message customized to the reason, and a "Send via Salesforce Marketing Cloud" button.

The ATT's primary surface (in the Mobile App post-event recap, available 7 days after the event) shows their personal journey timeline (the same horizontal dot view as the VL's), their engagement score with a percentile-rank visualization ("You engaged more than 73% of investors at FMF 2025"), their top 3 sessions, their top 3 booth visits, and a "Save to my calendar" export of their schedule for personal records. The ATT view does not show their individual touchpoint raw data export (only the curated recap) to avoid overwhelming non-technical attendees; a "Request my data export" link is available for GDPR-style data portability requests.

The CSM's surface is the "Content Engagement Funnel" showing, for each session, the registration count, the actual attendance count, the average depth_score, the session-rating average, and the session-to-next-session retention rate (what percentage of attendees from session X also attended the immediately following session in the same track). The CSM uses this to optimize next year's agenda sequencing.

### G. Failure Modes & Offline Behavior

- **Amplitude ingestion lag during peak event hours:** If Amplitude's ingestion pipeline lags by more than 10 minutes (which historically occurs during the Day 1 plenary when 8,000+ attendees are simultaneously active), the warehouse continues to compute journey metrics from the in-app Segment fanout (which does not depend on Amplitude). Once Amplitude recovers, the night's batch backfill reconciles any drift. The journey dashboard shows a "Amplitude data lagging, using Segment fallback" banner.
- **Segment identity resolution fails for an anonymous session:** If an attendee browsed the registration page anonymously and Segment could not stitch the anonymous `client_id` to the post-registration `attendee_id`, the pre-registration touchpoints are attributed to the anonymous `client_id` and excluded from the attendee's journey summary. A nightly reconciliation job attempts to stitch anonymous sessions to known attendee IDs via the registration confirmation event's `anonymous_client_id` field; unmatched anonymous sessions remain in an "orphan journey" table for analyst review.
- **Looker Cloud outage:** The journey dashboards become unavailable. The ED and RM fall back to direct SQL queries against the ClickHouse mart via a curated SQL runner with read-only credentials. The ATT Mobile App recap is unaffected (it queries ClickHouse directly via the mobile BFF).
- **Google Analytics 4 BigQuery export delayed by more than 24 hours:** The pre-registration web journey touchpoints are missing from the night's batch. The journey dashboard shows a "GA4 data delayed" banner. When the export resumes, the next nightly batch backfills the missing touchpoints.
- **Salesforce Marketing Cloud outage during follow-up outreach window:** The RM's "Send via Marketing Cloud" action returns an error. The system queues the outreach in a local durable store with the message template and recipient preserved; once Marketing Cloud recovers, the queue drains in original-queue-order with idempotency keys to prevent duplicate sends.
- **Badge reader sensor outage in a hall:** Session scan touchpoints are missing for affected sessions. The journey builder imputes attendance from the meeting participation data (attendees who had a meeting in the same hall immediately after the session are presumed to have attended) with `is_imputed = true` and `imputation_method = "meeting_adjacency_inference"`. The affected sessions are flagged in the CSM dashboard with a "session attendance imputed from meeting adjacency" annotation.
- **An attendee requests GDPR data deletion mid-event:** The attendee's touchpoints are soft-deleted (set `deleted_at`) in the warehouse; downstream marts are recomputed at the next refresh cycle to exclude the deleted attendee. The attendee's cohort metrics shift accordingly. The deletion is recorded in `audit_log` with the deletion request artifact reference. The ATT Mobile App access is revoked immediately.
- **OpenAI GPT-4 narrative generation fails (used in Module 12.4 for the journey narrative):** The journey dashboard's auto-narrative panel shows a "Narrative unavailable, showing raw metrics" fallback with the underlying cohort numbers and a "Retry narrative" button.

### H. Acceptance Criteria

- **Given** a senior minister attends all three plenary sessions and two bilateral G2G meetings but never opens the mobile app, **When** the journey builder processes the minister's touchpoints, **Then** the `app_engagement_flag` is set to `none`, the `diplomatic_no_app_persona` scoring profile is applied, the engagement score is recomputed to a percentile rank above 75 in the minister cohort, and the VL's briefing explicitly notes "engagement measured via diplomatic protocol profile, app-engagement excluded".
- **Given** an investor attendee submits session ratings for all 18 sessions they attended but does not respond to the post-event survey within 14 days, **When** the journey subsystem runs the survey imputation pass, **Then** the overall satisfaction score is imputed using the `session_rating_proxy` method, the `survey_imputation_confidence_interval` is set to +/- 12 points, the `survey_completed = false` and `survey_score_imputed = true` flags are transparently displayed, and the RM sees a follow-up outreach suggestion offering a one-question survey variant.
- **Given** the Sankey flow dashboard is filtered to persona = "minister" and registration_type = "VIP-Invited", **When** the ED opens the dashboard, **Then** the Sankey edges show only ministers' flow counts between touchpoints, the cohort heat map highlights the minister cohort's average engagement score, and the drop-off funnel shows the steepest drop-off point for the minister persona (e.g., "35% of ministers did not attend the post-event reception").
- **Given** a Field Volunteer's scan of an attendee into Session 3 arrives 7 minutes after the session start time, **When** the journey builder processes the scan event, **Then** the attendee is flagged `late_arrival` for that session, the `depth_score` is reduced by 20%, and the CSM's "session late-arrival rate" metric for Session 3 reflects this attendee.
- **Given** an attendee requests GDPR deletion of their data mid-event, **When** the deletion request is processed, **Then** all touchpoint rows for that `attendee_id` are soft-deleted in `analytics_journey_touchpoint` with `deleted_at` set, the `analytics_journey_attendee_summary` row is soft-deleted, the next mart refresh excludes the attendee from cohort aggregates, and the deletion is recorded in `audit_log` with the request artifact reference for regulatory audit.
