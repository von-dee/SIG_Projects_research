> Module 12: Post-Event Analytics & Data Engine -> 12.4 Executive Insights Dashboard

## Executive Insights Dashboard

### A. Purpose Statement

The Executive Insights Dashboard is the singular narrative surface that consolidates every commercial, operational, content, ESG, and brand metric from the Future Minerals Forum into a board-ready, sponsor-ready, and ministry-ready view. Its audience is not the platform team (who consume Module 12.1 warehouse health, Module 12.2 journey analytics, Module 12.3 sponsor ROI) but the ED, the ED's boss (the Forum's Secretary-General), the Board of the Future Minerals Forum Foundation, key sponsors (via a sponsor-facing subset of the dashboard, rendered from Module 12.3 data), and the host-country Ministry of Industry. At FMF scale, this dashboard is opened in the closing press conference, is exported as a PDF for the post-event board meeting within 14 days, is auto-rendered as a PowerPoint deck for the annual report briefing, and is exported on demand for ad-hoc ministerial briefings. The headline numbers it shows (US$ 12.4B deal pipeline, 11,247 attendees from 118 sovereign delegations, 4.6 NPS, 12,840 tCO2e with 100% offset coverage, 4.2 billion media reach) are the figures the Forum is judged by in the public domain.

The subsystem owns the `analytics.exec.*` Kafka topic prefix within the broader `analytics.*` bounded context established in Module 0.1. It publishes `analytics.exec.dashboard.rendered`, `analytics.exec.narrative.drafted`, `analytics.exec.narrative.edited`, `analytics.exec.narrative.approved`, `analytics.exec.export.pdf_generated`, `analytics.exec.export.pptx_generated`, `analytics.exec.live_mode.toggled`, `analytics.exec.filter.applied`, and `analytics.exec.benchmark.compared`. It subscribes to every analytical mart produced by Modules 12.1, 12.2, and 12.3 (`analytics.warehouse.mart.materialized`, `analytics.journey.attendee.reconstructed`, `analytics.roi.attribution.computed`), to the ESG snapshots from Module 11 (`esg.carbon.footprint.snapshot_published`, `esg.waste.diversion_rate.snapshot_published`, `esg.diversity.spend.snapshot_published`), to the brand performance signals from Module 10 (`press.release.distributed`, `social.mention.captured`, `campaign.performance.synced`), and to the live operational metrics from Module 1 (`incident.created`, `incident.resolved`, `ros.cue.completed`). Its non-negotiable contract is that every number on the dashboard is traceable through OpenLineage to a Kafka topic, that every narrative paragraph is editable by the MPL with version control and audit trail, that every export (PDF, PPTX) preserves the dashboard state at the moment of export with a hash, and that the live mode (used during the event) is clearly caveated about completeness.

The dashboard's distinguishing feature is its narrative layer. Each of the five sections (Commercial, Operational, Content, ESG, Brand) includes a 100-to-200 word narrative auto-drafted by an LLM (OpenAI GPT-4 or Anthropic Claude) summarizing the story behind the numbers ("Sponsorship revenue exceeded target by 8% driven by 3 new Platinum sponsors from the lithium value chain; deal pipeline of US$ 12.4B is 38% above the 2024 outcome, with 17% of deals classified as prior-initiated-event-accelerated; the ESG carbon footprint exceeded target by 16% due to higher ministerial private-jet travel, mitigated by an additional 1,840 tCO2e of permanent removal offsets"). The MPL edits the narrative before publication; the ED has final approval.

### B. User Roles & Permissions

- **Event Director (ED):** Primary consumer. Read on all dashboard sections. Write on dimensional filter selections and saved view configurations. Final approval on narrative publication. Can toggle live mode during the event. Can trigger the PDF and PPTX exports.
- **Operations Lead (OL):** Read on the Operational Performance section only. Cannot see commercial, brand, or sponsor-specific data. Uses the dashboard for the post-event ops debrief.
- **Protocol Officer (PO):** Read on the Operational Performance section filtered to protocol-related incidents and dignitary engagement metrics. No access to commercial or brand sections.
- **VIP Liaison (VL):** No direct access to the executive dashboard. Receives a curated PDF extract of the Content Performance section filtered to their assigned dignitary's sessions.
- **Registration Manager (RM):** Read on the Operational Performance section filtered to registration and check-in metrics. No access to commercial data.
- **Sponsorship Sales Lead (SSL):** Read on the Commercial Performance section in full. Read on the Brand Performance section in aggregate (not per-sponsor). Cannot edit narratives. Receives the published PDF for sponsor briefings.
- **Exhibitor Portal User (EPU):** No direct access to the executive dashboard. Sees their sponsor-facing ROI dashboard (Module 12.3) only. The sponsor-facing subset of the executive dashboard (e.g., the aggregate deal pipeline headline, the tier benchmark) is rendered into the sponsor portal via Looker embedded with row-level security.
- **Content & Stage Manager (CSM):** Read on the Content Performance section in full. Uses it for the post-event content review and next-year agenda planning.
- **Matchmaking Concierge (MC):** Read on the Operational Performance section filtered to meeting participation metrics. No access to commercial data.
- **Finance & Administration Lead (FAL):** Read on the Commercial Performance section (revenue, sponsorship pacing, deal pipeline) and the Operational Performance section (cost-per-attendee, cost-per-session). Cannot edit narratives.
- **Marketing & PR Lead (MPL):** Read on all sections. Write on the narrative layer (draft, edit, submit for ED approval). Owns the narrative editing workflow. Cannot approve publication (ED-only gate).
- **ESG & Sustainability Officer (ESGO):** Read on the ESG Performance section in full. Contributes ESG narrative text to the MPL for inclusion. Cannot approve publication.
- **Field Volunteer (FV):** No access.
- **Attendee (ATT):** No direct access. The ATT sees a curated subset of the dashboard metrics (e.g., total attendance, average session rating, ESG carbon footprint per attendee) via the Mobile App post-event recap.

### C. Data Model

`analytics_exec_dashboard_section` (the registry of every dashboard section and its current render state):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Service account |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{looker_dashboard_id, tableau_view_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `section_name` | `enum[commercial_performance, operational_performance, content_performance, esg_performance, brand_performance]` | |
| `display_order` | `int` | Render order on the dashboard |
| `source_mart` | `text` | e.g., `fct_sponsor_roi_summary`, `fct_session_attendance_daily`, `fct_carbon_footprint_snapshot` |
| `filter_config` | `jsonb` | Default dimensional filters, e.g., `{"persona": null, "sponsor_id": null, "venue_id": null, "day": null}` |
| `is_live_mode_capable` | `boolean` | True if section has a live-data source |
| `last_rendered_at` | `timestamptz` | Last successful render |
| `render_state_hash` | `text` | SHA-256 of the rendered JSON payload, for export integrity |
| `is_published` | `boolean` | True if ED has approved the section for external sharing |

`analytics_exec_narrative` (the LLM-drafted and MPL-edited narrative per section):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Service account (LLM) or MPL |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{llm_provider: openai, llm_model: gpt-4-turbo, llm_run_id, prompt_version}` |
| `audit_log` | `jsonb[]` | Append-only |
| `section_name` | `enum[commercial_performance, operational_performance, content_performance, esg_performance, brand_performance]` | |
| `narrative_text` | `text` | The 100-200 word narrative |
| `draft_status` | `enum[llm_drafted, mpl_edited, mpl_submitted, ed_approved, ed_rejected]` | |
| `llm_provider` | `enum[openai_gpt4, anthropic_claude, manual_draft]` | |
| `llm_prompt` | `text` | The prompt sent to the LLM (for audit and reproducibility) |
| `llm_response_raw` | `text` | The raw LLM response before MPL editing |
| `mpl_edited_at` | `timestamptz null` | |
| `mpl_editor_id` | `uuid null` | |
| `ed_approved_at` | `timestamptz null` | |
| `ed_approver_id` | `uuid null` | |
| `rejection_reason` | `text null` | Required when draft_status = ed_rejected |
| `source_metric_snapshot` | `jsonb` | The metric values at the time the narrative was drafted |

`analytics_exec_export_artifact` (every PDF and PPTX export):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ED or service account |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{s3_object_key, sharepoint_url, docusign_envelope_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `export_format` | `enum[pdf, pptx, excel_data_export]` | |
| `export_scope` | `enum[full_dashboard, section_only, sponsor_subset, ministerial_briefing]` | |
| `sections_included` | `text[]` | Which sections were rendered |
| `narrative_version_hashes` | `jsonb` | Map of section_name -> narrative `version` and `render_state_hash` |
| `metric_snapshot_hash` | `text` | SHA-256 of the metric snapshot at export time |
| `filter_config_at_export` | `jsonb` | Dimensional filters applied at export |
| `exported_at` | `timestamptz` | |
| `exported_by` | `uuid` | |
| `recipient_list` | `text[]` | Email addresses the export was sent to |
| `s3_object_uri` | `text` | s3:// path |
| `retention_until` | `timestamptz` | 7 years per regulatory requirement |

`analytics_exec_benchmark_comparison` (vs prior year, vs target, vs benchmark events):

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
| `ext_refs` | `jsonb` | e.g., `{prior_event_id, benchmark_event_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `metric_name` | `text` | e.g., `deal_pipeline_value_usd`, `attendee_count`, `nps_score` |
| `current_event_value` | `numeric(18,2)` | |
| `prior_event_value` | `numeric(18,2) null` | |
| `target_value` | `numeric(18,2) null` | |
| `benchmark_event_value` | `numeric(18,2) null` | e.g., PDAC, Cape Town Mining Indaba |
| `variance_vs_prior_pct` | `numeric(8,2) null` | |
| `variance_vs_target_pct` | `numeric(8,2) null` | |
| `variance_vs_benchmark_pct` | `numeric(8,2) null` | |
| `comparison_methodology_note` | `text null` | Required when methodology differs across events |
| `computed_at` | `timestamptz` | |

### D. Business Logic & Edge Cases

- **IF** the ED applies a dimensional filter to the dashboard (e.g., "show me metrics for sponsor-facing sessions only"), **THEN** the filter propagates across all sections that support that dimension, every chart in every section re-renders with the filter applied, the narrative for each affected section is marked `stale` and a "Re-draft narrative for filtered view" prompt is surfaced to the MPL, and the export artifact's `filter_config_at_export` field captures the applied filter so the export is reproducible.
- **IF** the Board requests the dashboard to be live during the event (not just post-event), **THEN** the ED toggles `live_mode = true`, the dashboard sections with `is_live_mode_capable = true` switch from nightly-batch sources to streaming sources (with sub-10-second latency from event to dashboard per Module 12.1), each live-mode tile shows a "Live - data may be incomplete" caveat with the completeness percentage (e.g., "deal pipeline: 45 deals tracked, estimated 60-70 actual based on historical pattern; 23 meetings still in progress not yet tagged for deal intent"), and the narrative layer is suppressed for live mode (narratives require post-event reflection).
- **IF** the LLM-generated narrative for a section is rejected by the ED (e.g., the narrative overstates the carbon footprint mitigation), **THEN** the narrative's `draft_status` is set to `ed_rejected`, the `rejection_reason` text is captured (minimum 30 characters), the MPL is notified via Slack with the rejection reason, the LLM prompt is logged for prompt-engineering review, and the MPL must manually draft a revised narrative (the LLM re-draft is not automatic to avoid repeating the same overstatement).
- **IF** an export is generated while a dimensional filter is applied, **THEN** the export's PDF and PPTX include a "Filters Applied" footnote documenting the filter configuration, the export's `metric_snapshot_hash` reflects the filtered metric state, and the recipient sees a clear "Filtered View" header on every page of the export to prevent misinterpretation.
- **IF** a benchmark event's metric is computed using a different methodology (e.g., PDAC counts deals differently than FMF), **THEN** the `comparison_methodology_note` field captures the methodology difference (minimum 50 characters), the dashboard shows the benchmark value with an asterisk and a footnote linking to the methodology note, and the narrative explicitly acknowledges the methodological difference rather than presenting the comparison as apples-to-apples.
- **IF** the dashboard's data sources are partially degraded (e.g., a warehouse mart is in fallback mode per Module 12.1's edge case), **THEN** the affected section's tiles show a "Data gap [start time] to [end time]" annotation, the narrative for that section is auto-flagged with a "Data partial" caveat, and the ED is offered the choice to defer publication until the data is reconciled or to publish with the caveat.
- **IF** a metric in the dashboard is manually overridden (e.g., the SSL manually adjusts a deal's attribution_origin per Module 12.3), **THEN** the dashboard shows the adjusted value with a "Manual adjustment" annotation, the `audit_log` captures the adjustment, and the export's `metric_snapshot_hash` reflects the post-adjustment state with a note that the hash includes manual adjustments.
- **IF** the ED opens the dashboard in live mode during the event and a deal is announced on stage (e.g., a US$ 1.2B deal signing in the closing plenary), **THEN** the SSL or MC tags the deal in the Lead Capture tool, the warehouse streams the new deal into the `fct_deal_pipeline` mart within 10 seconds, the dashboard's deal pipeline headline number updates within the next 10-second refresh cycle, the ED sees the headline number tick up live during the closing press conference, and a "deal announcement live-captured" notification is posted to the MPL for inclusion in the post-event press release.

**Edge case (non-obvious): the ED's dimensional filter for sponsor-facing sessions breaks a narrative's coherence.** The ED filters the dashboard to "show me metrics for sponsor-facing sessions only" to brief a Platinum sponsor on their session's performance relative to other sponsor-facing sessions. The filter propagates across all sections: Commercial Performance (filtered to sponsors who hosted the filtered sessions), Operational Performance (filtered to incidents and queues in the venues where the filtered sessions were held), Content Performance (filtered to the filtered sessions' attendance and ratings), ESG Performance (filtered to the carbon footprint of the filtered sessions' venues), Brand Performance (filtered to social mentions of the filtered sessions' sponsors). The Content Performance section's narrative ("Sponsor-facing sessions attracted 4,200 attendees with an average rating of 4.5, exceeding the all-session average of 4.2") is now stale because the LLM originally drafted it without the filter. The dashboard surfaces a "Narrative stale for filtered view" prompt to the MPL. The MPL clicks "Re-draft narrative for filtered view", which sends a new prompt to the LLM with the filtered metric snapshot and the original narrative as reference, the LLM produces a filtered-view narrative ("Filtered to sponsor-facing sessions: 4,200 attendees, 4.5 average rating, exceeding all-session average of 4.2"), the MPL edits, the ED approves, and the filtered-view narrative is saved as a new `analytics_exec_narrative` version with `filter_config = {session_type: "sponsor_facing"}` captured in `ext_refs`. The original unfiltered narrative is retained and is the default when no filter is applied.

**Edge case (non-obvious): the Board wants the dashboard live during the event with caveats about deal pipeline completeness.** The Board of the Future Minerals Forum Foundation requests the dashboard be live during the event (not just post-event) to monitor real-time commercial performance. The ED toggles `live_mode = true`. The Commercial Performance section's deal pipeline tile switches from the nightly-batch `fct_deal_pipeline` mart to the streaming `fct_deal_pipeline_live` projection (sub-10-second latency from event to dashboard). At the moment of toggle, 45 deals are tracked in the pipeline with a total estimated value of US$ 9.8B. However, the system knows from historical pattern that ~30% of deals are tagged within 24 hours but ~15% are tagged up to 7 days post-event as sponsors' staff upload post-event notes. The tile shows "45 deals tracked, US$ 9.8B (estimated 60-70 actual deals, US$ 11.5-13.5B final based on historical pattern)". The tile includes a "Live - data may be incomplete" caveat with the completeness percentage (currently 70%). When a deal is tagged on stage during the closing plenary (e.g., a US$ 1.2B signing), the tile updates within 10 seconds to "46 deals, US$ 11.0B (estimated 61-71 actual, US$ 11.7-13.7B final)". The narrative layer is suppressed in live mode (narratives require post-event reflection); instead, a "Live commentary" surface shows real-time milestone callouts ("US$ 1.2B deal signed on stage by [Sponsor] and [Counterparty]") for the ED's verbal use during the press conference. The Board sees the same live dashboard via a Board-portal embed with the same caveats. Post-event, the ED toggles `live_mode = false`, the dashboard switches back to nightly-batch sources with complete data, the LLM drafts the post-event narrative for each section, and the standard narrative review workflow (MPL edit -> ED approve) resumes.

### E. Third-Party Integrations

- **Tableau Cloud (or Microsoft Power BI as alternative):** The BI rendering engine for the dashboard's visual sections. Data flow: ClickHouse marts -> Tableau Hyper extract (refreshed nightly post-event, or every 10 seconds in live mode via Tableau's real-time connection) -> Tableau dashboard -> embedded in the executive portal. The Board-portal embed uses Tableau's row-level security on `tenant_id` and `event_id`.
- **OpenAI GPT-4 (GPT-4-Turbo or GPT-4o) or Anthropic Claude (Claude 3 Opus):** Narrative generation. Data flow: dashboard section's metric snapshot -> prompt template (versioned in Git) -> LLM API call -> narrative text returned -> stored in `analytics_exec_narrative` with `llm_response_raw` preserved -> MPL edits -> ED approves. Prompt template includes the section name, the metric values, the prior-year and target comparisons, and a tone instruction ("Board-formal, third person, 100-200 words, no jargon, no em dashes, numbers spelled out for headlines and in digits for tables").
- **Microsoft PowerPoint (via Office Scripts or python-pptx):** Auto-generated board deck export. Data flow: dashboard state -> python-pptx script -> PPTX file (one slide per section, with the chart image, the metric table, and the narrative text in the speaker notes) -> saved to SharePoint -> Board distribution link emailed. The PPTX template is versioned in Git; the script runs in an AWS Lambda function triggered by the ED's "Export to PPTX" action.
- **Looker (Looker Cloud):** Embedded analytics for the sponsor-facing subset of the dashboard. Data flow: ClickHouse mart -> Looker LookML -> embedded Looker dashboard in the sponsor portal with row-level security on `sponsor_id`.
- **Amazon QuickSight (alternative to Tableau or Looker):** Used for ad-hoc analysis by the platform team and for the Board's self-service exploration of the underlying metrics.
- **AWS Lambda (for export generation):** Serverless execution of the PDF and PPTX export scripts. Data flow: ED clicks "Export to PDF" -> API Gateway -> Lambda function -> renders PDF via a headless Chromium instance -> uploads to S3 with KMS-CMK -> presigned URL returned to ED -> ED downloads or shares via SharePoint link.
- **SharePoint Online (or Google Drive as alternative):** Storage and distribution of exported PDFs and PPTXs. Data flow: Lambda -> S3 -> SharePoint via Microsoft Graph API -> Board distribution folder with version history.
- **DocuSign (or Adobe Sign):** ED sign-off on the published dashboard. Data flow: ED clicks "Publish Dashboard" -> DocuSign envelope created with ED as signer -> ED signs -> dashboard `is_published = true` for all sections -> external sharing links become valid.
- **Slack (alerting):** Live-mode milestone callouts posted to `#exec-dashboard-live`. Narrative rejection notifications posted to `#marketing-narrative-review`. Export completion notifications posted to `#exec-dashboard-exports`.
- **Microsoft Teams (alternative to Slack):** Used for the Board's communication channel; the executive dashboard bot posts milestone callouts to the Board's Teams channel in live mode.

### F. UI/UX Notes

The ED's primary surface is a single-page dashboard with five sections stacked vertically, each section occupying a full viewport. Section 1 (Commercial Performance) at the top: revenue vs target gauge, sponsorship pacing chart, deal pipeline headline number (the largest font on the dashboard), tier benchmark scatter plot, and the narrative paragraph below the charts. Section 2 (Operational Performance): incident count by severity, attendee satisfaction trend, NPS gauge, queue time heatmap by venue, and the narrative. Section 3 (Content Performance): top sessions by attendance, top sessions by rating, content downloads, live-stream viewership, and the narrative. Section 4 (ESG Performance): carbon footprint vs target, waste diversion rate, supplier diversity spend, and the narrative. Section 5 (Brand Performance): media reach gauge, social sentiment trend, top social mentions, and the narrative.

A top-right toolbar offers: a "Filters" button (opens a side drawer with dimensional filters: persona, sponsor_id, venue_id, day, session_type), a "Live Mode" toggle (with confirmation modal explaining the caveats), a "Compare" button (opens a year-over-year and benchmark comparison overlay), a "Narratives" button (opens the narrative review workflow for the MPL), an "Export" dropdown (PDF, PPTX, Excel data export), and a "Publish" button (gated on ED approval; triggers the DocuSign workflow).

The ED's live-mode experience during the event shows a slimmer dashboard: only the Commercial Performance (deal pipeline headline, sponsorship pacing) and Operational Performance (incident count, attendee satisfaction) sections, with live-mode caveats on every tile. The "Live commentary" surface is a real-time feed of milestone callouts rendered as a vertical scroll on the right side of the dashboard.

The Board's portal embed shows the same dashboard in read-only mode (no edit, no export, no filter unless explicitly granted per-Board-member). The Board sees the post-event published version; the live-mode version is gated to the ED and the ED's direct reports during the event.

The ATT Mobile App recap shows a curated subset: total attendance number, average session rating, ESG carbon footprint per attendee, and a single narrative paragraph from the ESG Performance section (the only section relevant to attendees at the personal level). The ATT does not see commercial or sponsor-specific data.

The sponsor-facing subset (rendered via Looker embedded in the sponsor portal) shows: the aggregate deal pipeline headline (without naming other sponsors), the tier benchmark scatter plot (with this sponsor highlighted, others anonymized), and this sponsor's individual ROI summary (mirroring Module 12.3). The narrative is suppressed for the sponsor-facing view (sponsor-facing narratives are curated by the SSL on a per-sponsor basis).

### G. Failure Modes & Offline Behavior

- **LLM API outage during narrative drafting:** The narrative drafting workflow falls back to a template-based narrative generator (a deterministic template that fills in the metric values into a pre-written sentence structure). The template narrative is flagged `llm_provider = manual_draft` with a "LLM unavailable, template narrative" callout visible to the MPL. The MPL can manually draft over the template. Once the LLM recovers, the MPL can request a fresh LLM draft for any section still using the template.
- **Tableau Cloud outage:** The dashboard's visual sections become unavailable. The ED falls back to a curated SQL runner against ClickHouse with pre-built queries for each metric. The PDF and PPTX exports are unavailable until Tableau recovers. The Board-portal embed shows a "Dashboard temporarily unavailable" message.
- **Office Scripts / python-pptx export failure:** The PPTX export Lambda function fails (e.g., the PPTX template is corrupted after a Git push). The ED receives a fallback "Excel data export" containing the metric tables and narrative text in spreadsheet form, with a note that the formatted PPTX will be regenerated within 24 hours once the template is fixed.
- **Live mode streaming pipeline backpressure:** If the streaming mart's lag exceeds 30 seconds (per Module 12.1's failure mode), the live-mode dashboard shows a "Live data lagging by [N] seconds" banner, the affected tiles fall back to "last known good" values with a stale timestamp, and the "Live commentary" feed pauses new callouts until the lag recovers.
- **DocuSign outage during publication:** The ED cannot complete the DocuSign sign-off workflow. The system offers a "break-glass publish" path that requires two-person approval (ED + FAL) and records the break-glass decision in `audit_log` for quarterly review. Once DocuSign recovers, the ED can retroactively sign the DocuSign envelope for the published version.
- **SharePoint distribution failure:** The exported PDF is uploaded to S3 successfully but the SharePoint sync fails. The ED receives an S3 presigned URL as a fallback distribution mechanism, with a note that the SharePoint link will be added within 24 hours. Recipients can access the PDF via the S3 URL immediately.
- **Benchmark event data unavailable (e.g., PDAC's published numbers are delayed):** The dashboard's benchmark comparison column shows "Benchmark data not yet published" for the affected metrics. The variance-vs-benchmark percentage is suppressed. The narrative explicitly notes "Benchmark comparison unavailable; will be added in next refresh once PDAC publishes."
- **An exported PDF is later found to contain an error (e.g., a deal value typo that was already distributed to the Board):** The ED issues a "Revised Export" with a clear "Revised [date], supersedes prior export [date]" header on every page. The prior export's `analytics_exec_export_artifact` row is marked `superseded_by_export_id` (added to `ext_refs`) but retained for audit trail. The Board receives a notification email summarizing the revision.

### H. Acceptance Criteria

- **Given** the ED applies a dimensional filter "session_type = sponsor_facing" to the dashboard, **When** the filter is applied, **Then** all sections that support the `session_type` dimension re-render with the filter, the affected sections' narratives are marked stale with a "Re-draft narrative for filtered view" prompt surfaced to the MPL, and any subsequent export's `filter_config_at_export` field captures the applied filter for reproducibility.
- **Given** the Board requests the dashboard be live during the event, **When** the ED toggles `live_mode = true`, **Then** the dashboard sections with `is_live_mode_capable = true` switch to streaming sources with sub-10-second latency, every live-mode tile shows a "Live - data may be incomplete" caveat with the completeness percentage, the deal pipeline tile shows "45 deals tracked, US$ 9.8B (estimated 60-70 actual, US$ 11.5-13.5B final based on historical pattern)", and the narrative layer is suppressed with a "Live commentary" surface showing real-time milestone callouts instead.
- **Given** the LLM drafts a narrative for the ESG Performance section that overstates the carbon footprint mitigation, **When** the ED reviews the narrative and clicks "Reject", **Then** the narrative's `draft_status` is set to `ed_rejected`, the `rejection_reason` text is captured (minimum 30 characters), the MPL is notified via Slack with the rejection reason, the LLM prompt is logged for prompt-engineering review, and the MPL must manually draft a revised narrative (the LLM re-draft is not automatic).
- **Given** the ED clicks "Export to PDF" with a dimensional filter applied, **When** the PDF is generated, **Then** the PDF includes a "Filters Applied" footnote documenting the filter configuration on every page, the export's `metric_snapshot_hash` reflects the filtered metric state, every page shows a "Filtered View" header, and the export's `analytics_exec_export_artifact` row captures the `filter_config_at_export` and `metric_snapshot_hash` for reproducibility.
- **Given** a deal is signed on stage during the closing plenary and the SSL tags it in the Lead Capture tool, **When** the warehouse streams the new deal into the `fct_deal_pipeline_live` mart within 10 seconds, **Then** the dashboard's deal pipeline headline number updates within the next 10-second refresh cycle to reflect the new deal (e.g., from "45 deals, US$ 9.8B" to "46 deals, US$ 11.0B" for a US$ 1.2B signing), and the "Live commentary" surface posts a "US$ 1.2B deal signed on stage by [Sponsor] and [Counterparty]" callout to the ED's dashboard and to the `#exec-dashboard-live` Slack channel for the MPL's real-time press release drafting.
