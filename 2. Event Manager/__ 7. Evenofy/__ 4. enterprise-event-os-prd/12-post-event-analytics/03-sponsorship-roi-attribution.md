> Module 12: Post-Event Analytics & Data Engine -> 12.3 Sponsorship ROI Attribution

## Sponsorship ROI Attribution

### A. Purpose Statement

The Sponsorship ROI Attribution subsystem is the commercial accountability engine of the Future Minerals Forum. For each sponsor (Platinum, Gold, Silver, Knowledge Partner, Innovation Pavilion at FMF scale), the subsystem computes a defensible, multi-touch attribution of value across five dimensions: brand exposure (impressions across the event app, on-site signage, social media, and the post-event press kit), lead generation (lead count and lead quality from the Module 5.4 Lead Capture tool, including lead scoring and conversion tracking), meeting conversions (B2B meetings where sponsor staff were participants, with deal-intent flags and estimated deal values), deal pipeline (meetings tagged with deal intent, sized and tracked through won/lost/in-progress states), and attendee engagement with sponsor content (booth dwell time, app sponsor profile views, sponsored session attendance, sponsored content downloads). The output is a per-sponsor ROI dashboard, benchmarked against the sponsor's tier average, delivered to each sponsor within 14 days of event close, and an aggregate ROI rollup that feeds the ED's Executive Insights Dashboard (Module 12.4) and the SSL's commercial performance review.

At FMF scale, this is the highest-scrutiny analytical surface in the entire platform. FMF 2024 announced US$ 9.3 billion in deals originating at or accelerated by the Forum; FMF 2025's target was US$ 12 billion. The deal pipeline is the headline number cited in the closing press conference, briefed to the host-country Ministry of Industry, and reported in the Forum's annual report. A 5% misattribution of deal value (e.g., attributing a deal to the wrong sponsor, double-counting a deal across two sponsorship tiers, or missing a deal that closed 60 days post-event) can shift the headline number by US$ 600 million. This subsystem codifies the attribution methodology, version-controls every weight and threshold, requires SSL sign-off for any manual attribution adjustment, and produces an audit trail that survives regulator or journalist scrutiny.

The subsystem owns the `analytics.roi.*` Kafka topic prefix within the broader `analytics.*` bounded context established in Module 0.1. It publishes `analytics.roi.touchpoint.captured`, `analytics.roi.attribution.computed`, `analytics.roi.deal.pipeline_updated`, `analytics.roi.benchmark.computed`, `analytics.roi.dashboard.published`, `analytics.roi.attribution.adjusted`, and `analytics.roi.lead_quality.flagged`. It subscribes to `sponsor.deal.signed` and `sponsor.onboarding.completed` (Modules 5.1 and 5.3), `booth.visit.entered` and `booth.visit.exited` and `lead.captured` (Modules 5.2 and 5.4), `meeting.scheduled` and `meeting.completed` (Modules 3.1 and 3.2), `app.sponsor_profile.viewed` and `app.sponsored_content.downloaded` (Module 7.1), `session.sponsored.attended` (Module 4.1), `press.release.distributed` and `social.mention.captured` (Modules 10.3 and 10.4), `registration.confirmed` (Module 6.1, for total attendee reach denominator), and `po.payment_released` for the sponsor's contracted spend (Module 9.3, for ROI denominator). Its non-negotiable contract is that every dollar of attributed value is traceable to one or more touchpoint events, every touchpoint event is traceable to a Kafka topic and offset, and every manual adjustment by the SSL is captured in `audit_log` with the justification text and the two-person approval (SSL + FAL).

### B. User Roles & Permissions

- **Event Director (ED):** Read on all sponsor ROI dashboards and the aggregate commercial performance rollup. Cannot modify attribution. Sees the deal pipeline headline number in the War Room and in the Executive Insights Dashboard (Module 12.4).
- **Operations Lead (OL):** No direct access. OL's operational data (booth dwell times, session attendance) feeds the ROI computation but OL does not consume the ROI dashboard.
- **Protocol Officer (PO):** No access. Protocol touchpoints are excluded from the ROI attribution to prevent diplomatic engagement from being commercially monetized in sponsor dashboards.
- **VIP Liaison (VL):** No access.
- **Registration Manager (RM):** Read-only on the aggregate attendee-reach denominator (used to compute per-sponsor impression rates).
- **Sponsorship Sales Lead (SSL):** Primary commercial user. Read on all sponsor ROI dashboards. Write on manual attribution adjustments (with two-person approval from FAL). Write on lead quality flag overrides. Owns the sponsor-facing dashboard publication gate.
- **Exhibitor Portal User (EPU):** Read-only on their own sponsor's ROI dashboard. Cannot see other sponsors' data. Cannot see benchmark averages by name (only their sponsor's tier-relative position).
- **Content & Stage Manager (CSM):** Read-only on sponsored-session attendance metrics attributed to sponsors (used to validate sponsor session deliverables against contracted KPIs).
- **Matchmaking Concierge (MC):** Read on meeting participation counts attributed to sponsors (used to validate sponsor meeting quotas against contracted KPIs). No financial data.
- **Finance & Administration Lead (FAL):** Read on all sponsor ROI dashboards and the contracted spend denominator. Write (with SSL) on manual attribution adjustments requiring financial sign-off.
- **Marketing & PR Lead (MPL):** Read on the brand exposure dimension (impressions, social reach, sentiment) attributed to sponsors, used to brief sponsors on the brand value delivered.
- **ESG & Sustainability Officer (ESGO):** Read on the ESG-attributed portion of sponsor ROI (e.g., sponsor's booth carbon footprint, sponsor's diversity procurement spend) which is included as a "Sustainability Co-Benefit" line in the sponsor-facing dashboard.
- **Field Volunteer (FV):** No direct access. FV booth-visit scans feed the booth dwell time computation.
- **Attendee (ATT):** No direct access. ATT touchpoints (booth visits, app profile views) feed the sponsor ROI computation but the ATT does not see the commercial outputs.

### C. Data Model

`analytics_roi_touchpoint` (the atomic unit of a sponsor-attributed value touchpoint):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Service account (roi-builder) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{kafka_topic, kafka_offset, source_touchpoint_id, journey_touchpoint_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `sponsor_id` | `uuid` | FK -> sponsor.id |
| `touchpoint_type` | `enum[brand_impression_app, brand_impression_signage, brand_impression_social, brand_impression_press, lead_captured, meeting_held, deal_initiated, booth_visit, app_profile_view, sponsored_session_attended, sponsored_content_download]` | |
| `touchpoint_time` | `timestamptz` | UTC |
| `attendee_id` | `uuid null` | FK -> attendee.id when an attendee is involved |
| `meeting_id` | `uuid null` | FK -> meeting.id when applicable |
| `session_id` | `uuid null` | FK -> session.id when applicable |
| `impression_count` | `int` | For impression-type touchpoints |
| `deal_value_usd` | `numeric(18,2) null` | For deal-initiated touchpoints |
| `lead_quality_score` | `numeric(5,2) null` | 0-100 for lead-captured touchpoints |
| `attribution_weight` | `numeric(5,4)` | Fractional credit assigned to this touchpoint (e.g., 0.333 for one of three touches in a multi-touch chain) |
| `attribution_model_version` | `text` | e.g., "multi-touch-v3" |
| `tier_attribution` | `enum[primary, secondary, tertiary]` | Whether this sponsor is the primary, secondary, or tertiary attribution recipient |

`analytics_roi_attribution_summary` (one row per sponsor per event):

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
| `ext_refs` | `jsonb` | e.g., `{salesforce_opportunity_id, hubspot_deal_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `sponsor_id` | `uuid` | FK -> sponsor.id |
| `sponsor_tier` | `enum[platinum, gold, silver, knowledge_partner, innovation_pavilion]` | |
| `contracted_spend_usd` | `numeric(18,2)` | Total contracted sponsorship spend (denominator) |
| `brand_exposure_value_usd` | `numeric(18,2)` | Computed: impressions x CPM by channel |
| `lead_count` | `int` | Total leads captured by sponsor staff |
| `lead_quality_avg` | `numeric(5,2)` | Average lead quality score 0-100 |
| `meeting_count` | `int` | B2B meetings involving sponsor staff |
| `deal_pipeline_count` | `int` | Meetings tagged with deal intent |
| `deal_pipeline_value_usd` | `numeric(18,2)` | Sum of estimated deal values |
| `deal_won_count` | `int` | Deals closed post-event |
| `deal_won_value_usd` | `numeric(18,2)` | Sum of closed deal values |
| `deal_in_progress_count` | `int` | |
| `deal_lost_count` | `int` | |
| `booth_visit_count` | `int` | |
| `booth_avg_dwell_seconds` | `numeric(10,2)` | |
| `app_profile_view_count` | `int` | |
| `sponsored_session_attendance_count` | `int` | |
| `sponsored_content_download_count` | `int` | |
| `computed_roi_multiple` | `numeric(10,2)` | (Deal Won Value + Lead Value + Brand Value) / Contracted Spend |
| `tier_benchmark_avg_roi` | `numeric(10,2)` | Average ROI multiple for sponsors in the same tier |
| `tier_percentile_rank` | `numeric(5,2)` | This sponsor's percentile within the tier |
| `dashboard_publication_status` | `enum[draft, internal_review, approved, published_to_sponsor]` | |
| `published_at` | `timestamptz null` | |

`analytics_roi_deal_pipeline` (every deal tracked through the pipeline):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | SSL or MC |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{salesforce_opportunity_id, hubspot_deal_id, meeting_id, source_meeting_kafka_offset}` |
| `audit_log` | `jsonb[]` | Append-only |
| `deal_name` | `text` | e.g., "Saudi Arabia - Ma'aden Lithium Offtake Agreement" |
| `sponsor_id` | `uuid` | Primary sponsor attribution |
| `secondary_sponsor_ids` | `uuid[]` | Co-attributed sponsors (e.g., a deal co-brokered by two Platinum sponsors) |
| `deal_type` | `enum[offtake_agreement, joint_venture, mou, equity_investment, supply_contract, licensing, other]` | |
| `estimated_value_usd` | `numeric(18,2)` | Pre-close estimate |
| `actual_value_usd` | `numeric(18,2) null` | Post-close actual |
| `currency` | `text` | ISO 4217, default "USD" |
| `deal_initiated_at` | `timestamptz` | When the deal was first tagged (typically the meeting date) |
| `deal_closed_at` | `timestamptz null` | When the deal moved to "won" status |
| `pipeline_stage` | `enum[initiated, qualified, negotiated, won, lost, deferred]` | |
| `attribution_origin` | `enum[event_originated, event_accelerated, event_venue_only, prior_initiated_adjusted]` | See edge case for prior_initiated_adjusted |
| `attribution_adjustment_reason` | `text null` | Required when attribution_origin = prior_initiated_adjusted |
| `approved_by_ssl` | `uuid null` | SSL who approved any manual adjustment |
| `approved_by_fal` | `uuid null` | FAL who co-approved |
| `adjustment_artifact_ref` | `text null` | URI to the adjustment justification document |

`analytics_roi_attribution_model_config` (versioned weights per sponsor tier):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | SSL |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{git_commit_hash}` |
| `audit_log` | `jsonb[]` | Append-only |
| `model_version` | `text` | e.g., "multi-touch-v3" |
| `sponsor_tier` | `enum[platinum, gold, silver, knowledge_partner, innovation_pavilion]` | |
| `brand_impression_weight` | `numeric(5,4)` | |
| `lead_capture_weight` | `numeric(5,4)` | |
| `meeting_conversion_weight` | `numeric(5,4)` | |
| `deal_pipeline_weight` | `numeric(5,4)` | |
| `content_engagement_weight` | `numeric(5,4)` | |
| `lead_quality_threshold_for_attribution` | `numeric(5,2)` | Leads below this quality score are excluded from attribution |
| `cpm_app_usd` | `numeric(10,2)` | Cost per mille for app impressions |
| `cpm_signage_usd` | `numeric(10,2)` | |
| `cpm_social_usd` | `numeric(10,2)` | |
| `cpm_press_usd` | `numeric(10,2)` | |
| `lead_value_usd_by_score_band` | `jsonb` | e.g., `{"0-30": 5, "31-60": 50, "61-80": 200, "81-100": 500}` |
| `valid_from` | `timestamptz` | |
| `valid_to` | `timestamptz null` | null = current |

### D. Business Logic & Edge Cases

- **IF** a sponsor's lead count exceeds 1,000 but their deal conversion rate is below 3% (the disconnect threshold), **THEN** the system flags the sponsor in the SSL's "Leads Quality Deep Dive" queue, publishes an `analytics.roi.lead_quality.flagged` event with `flag_reason = "high_volume_low_conversion_disconnect"`, and the sponsor-facing dashboard shows a "Lead Quality Opportunity" callout with a one-click "Generate Deep Dive Report" action that produces a PDF breaking down leads by source, by lead quality score band, by sponsor staff member who captured the lead, and by meeting conversion rate.
- **IF** a deal attributed to the event was actually initiated 6 months prior at a different forum (e.g., a US$ 500M mining offtake agreement first discussed at the PDAC convention in Toronto), **THEN** the SSL can manually adjust the `attribution_origin` from `event_originated` to `prior_initiated_adjusted`, must record an `attribution_adjustment_reason` text (minimum 50 characters), the adjustment requires co-approval from the FAL, the `audit_log` captures the original attribution, the adjustment, the actors, the timestamp, and the justification, and the deal's value remains in the pipeline but is tagged with a "prior-initiated, event-accelerated" footnote in the sponsor-facing dashboard and in the Executive Insights Dashboard's deal pipeline headline (with footnote disclosure to the Ministry of Industry).
- **IF** two sponsors co-broker a deal (e.g., a Platinum mining company and a Gold logistics provider both present in the same B2B meeting that led to a US$ 200M deal), **THEN** the system applies multi-touch attribution with `tier_attribution = primary` for the Platinum sponsor (weight 0.65) and `tier_attribution = secondary` for the Gold sponsor (weight 0.35) per the model config for that tier combination, the deal value is split accordingly in each sponsor's ROI summary, and the deal pipeline headline number counts the full US$ 200M once (not double-counted) but the sponsor-facing dashboards each see their fractional share.
- **IF** a sponsor's contracted spend is partially paid and partially outstanding at the time of dashboard publication (e.g., 80% paid, 20% outstanding per the milestone schedule), **THEN** the `contracted_spend_usd` field reflects the full contracted amount (the denominator for the ROI multiple), but the dashboard shows a "Spend collected to date" tile with the 80% figure, and the SSL sees a flag to follow up on the outstanding 20% before the dashboard is published to the sponsor.
- **IF** a deal that was tagged `won` in the dashboard is later reversed (e.g., the deal falls through 30 days post-publication), **THEN** the SSL can update the `pipeline_stage` to `lost` or `deferred`, the system recomputes the `deal_won_count`, `deal_won_value_usd`, and `computed_roi_multiple`, the sponsor-facing dashboard is republished with the revised figures, and a "Revised dashboard" notification is sent to the sponsor's primary contact with a summary of the change.
- **IF** a lead captured by a sponsor's staff is later identified as a duplicate of a lead already captured by a different sponsor staff member within 60 minutes (same attendee, same sponsor, different staff), **THEN** the deduplication logic keeps the lead with the higher `lead_quality_score` (or the earlier one if tied), the duplicate is soft-deleted with `deleted_at` set, the sponsor's `lead_count` is decremented accordingly, and the duplicate is recorded in `audit_log` with both staff member IDs for sales coaching.
- **IF** a sponsor's booth visit count is below the tier benchmark by more than one standard deviation (e.g., 340 visits vs tier average of 890 with std dev 180), **THEN** the dashboard flags the sponsor in the SSL's "Underperforming Booth Traffic" queue with possible causes (booth location, signage, staff activity, no sponsored session) surfaced from the operational data, and the SSL receives a suggested follow-up for next year's contract negotiation.
- **IF** the brand impression count from the social listening integration (Module 10.4) exceeds the sponsor's contracted KPI by more than 200% (a viral moment), **THEN** the dashboard highlights the surplus in a "Brand Value Surplus" callout with the source breakdown (which hashtags, which influencer, which day), and the MPL team receives a Slack alert suggesting proactive PR amplification.

**Edge case (non-obvious): the Platinum sponsor with 1,200 leads and 2 closed deals.** A Platinum sponsor captured 1,200 leads via their booth staff and via the Lead Capture tool, but only 2 deals closed post-event (a 0.17% conversion rate, vs the Platinum tier benchmark of 4.2%). The naive interpretation (low-quality sponsor) is wrong; the actual cause is that the sponsor's booth staff were incentivized on lead count and accepted business cards from anyone passing by without qualifying. The system flags this disconnect via the `high_volume_low_conversion_disconnect` rule, generates a Leads Quality Deep Dive Report that breaks down the 1,200 leads by source (887 from "booth walk-by" with lead_quality_score < 30; 240 from "sponsored session Q&A" with score 60-80; 113 from "pre-booked B2B meeting" with score 80-100), and shows that of the 2 closed deals, both came from the "pre-booked B2B meeting" subset. The SSL uses this report in the post-event debrief with the sponsor, recommends a "lead qualification script" for next year's booth staff training, and the sponsor-facing dashboard's "Lead Quality Opportunity" callout offers the sponsor a download of the deep-dive report and a 30-minute consultation with the SSL on lead qualification improvements.

**Edge case (non-obvious): the US$ 500M offtake deal that was actually initiated at PDAC six months prior.** A US$ 500M lithium offtake agreement was announced at the FMF 2025 closing press conference as one of the headline deals. The deal pipeline entry was created when a B2B meeting at FMF between the mining company's CEO and the offtake buyer's CFO was tagged with `deal_intent = true` and `estimated_value_usd = 500000000`. Post-event due diligence reveals that the same two parties had signed an MOU at the PDAC convention in Toronto six months prior, with the FMF meeting serving as the formal signing venue rather than the origination venue. The SSL manually adjusts the deal's `attribution_origin` from `event_originated` to `prior_initiated_adjusted`, records the `attribution_adjustment_reason` as "MOU signed at PDAC Toronto March 2025; FMF served as formal signing venue; deal value unchanged but attribution reflects acceleration rather than origination", the FAL co-approves, the audit trail captures both the original and adjusted attribution, and the deal remains in the FMF 2025 deal pipeline headline but with a footnote in the Executive Insights Dashboard disclosing "X deals valued at US$ Y were prior-initiated, event-accelerated; full attribution methodology in Appendix B". This footnote is critical for maintaining credibility with the Ministry of Industry and with journalists who scrutinize the headline number.

### E. Third-Party Integrations

- **Salesforce Sales Cloud (or HubSpot CRM as alternative):** The canonical deal pipeline system of record. Data flow: deal created in Salesforce (by MC at meeting, or by SSL post-event) -> Salesforce -> Kafka topic `deal.pipeline.updated` (via Salesforce Platform Events) -> warehouse -> sponsor ROI summary. Bidirectional: when a deal moves to "won" in Salesforce (sometimes 60-180 days post-event), the warehouse recomputes the sponsor's `deal_won_count` and `deal_won_value_usd` and triggers a "Dashboard Refresh Available" notification to the SSL.
- **Tableau Cloud (or Microsoft Power BI as alternative):** The BI consumption layer for the SSL's internal commercial performance dashboard (the "all sponsors" view). Data flow: ClickHouse mart -> Tableau Hyper extract -> Tableau dashboard. Not embedded in the sponsor portal (Looker handles that for embedded analytics consistency).
- **Looker (Looker Cloud, embedded):** The sponsor-facing dashboard rendering layer. Data flow: ClickHouse mart -> Looker LookML model -> Looker embedded dashboard with row-level security on `sponsor_id` -> sponsor portal iframe. The EPU sees only their sponsor's data; benchmark averages are computed but displayed as "Tier Average" without naming other sponsors.
- **Snowflake (or Google BigQuery as alternative):** External data warehouse federation for FMF stakeholders (e.g., the Ministry of Industry) that maintain their own Snowflake account. Data flow: ClickHouse mart -> S3 (Parquet) -> Snowpipe -> Snowflake table. One-way. The Ministry uses this to cross-reference FMF deal pipeline with their own industrial-investment tracking.
- **Brandwatch (or Meltwater as alternative, integrating with Module 10.4):** Social listening impression counts. Data flow: Module 10.4 social listening captures mentions of the sponsor's brand -> Module 10.4 publishes `social.mention.captured` to Kafka -> warehouse -> sponsor ROI brand impression touchpoint. Sentiment analysis (positive/neutral/negative) is included in the touchpoint.
- **Cision (or Muck Rack as alternative, integrating with Module 10.3):** Press impression counts. Data flow: Module 10.3 press release distribution tracking -> Cision API pull of publication reach -> warehouse -> sponsor ROI brand impression touchpoint.
- **Slack (alerting):** Disconnect flags, underperforming booth traffic alerts, brand value surplus alerts posted to `#sponsor-roi-alerts`.
- **DocuSign (or Adobe Sign as alternative):** Sponsor dashboard sign-off. When the SSL approves the dashboard for publication to the sponsor, the publication is recorded with a DocuSign envelope capturing the SSL's signature, the publication timestamp, and the dashboard version hash.
- **Amplitude (or Mixpanel):** App profile view counts and sponsored content download counts. Data flow: Mobile App -> Amplitude -> warehouse -> sponsor ROI content engagement touchpoint.
- **Adobe Analytics (alternative to Amplitude for web touchpoints):** For the sponsor's web profile page views if the sponsor maintains a dedicated landing page on the FMF site.

### F. UI/UX Notes

The SSL's primary surface is the "All Sponsors ROI Dashboard" with three panels. Panel 1: a sponsor-by-sponsor table sorted by `computed_roi_multiple` descending, with columns for sponsor name, tier, contracted spend, brand value, lead count, meeting count, deal pipeline count, deal won count, deal won value, computed ROI multiple, and tier percentile rank. Each row is clickable to drill into the sponsor's individual dashboard. Panel 2: a tier-benchmark scatter plot with X-axis = contracted spend and Y-axis = computed ROI multiple, with each sponsor plotted as a point colored by tier. Panel 3: a "Flags and Actions" queue listing every sponsor with an active flag (high-volume-low-conversion disconnect, underperforming booth traffic, brand value surplus, outstanding spend collection), each with a one-click action button.

The EPU's sponsor-facing dashboard (rendered via Looker embedded in the sponsor portal) has four sections. Section 1: "Your Event ROI Summary" with the headline ROI multiple, the tier percentile rank, and the contracted spend vs delivered value chart. Section 2: "Brand Exposure" with the impression breakdown by channel (app, signage, social, press), the CPM applied, and the brand value in USD. Section 3: "Lead Generation and Meeting Conversions" with the lead count, the lead quality score distribution histogram, the meeting count, and the meeting-to-deal conversion funnel. Section 4: "Deal Pipeline" with the deal count, the deal pipeline value, the won/lost/in-progress breakdown, and the deal-level table (deal name, type, estimated value, status). The dashboard's footer notes the attribution methodology version and a "Methodology" link to a one-pager explaining the multi-touch model.

The ED's War Room sees a single tile: "Deal Pipeline Headline Number" with the total deal value across all sponsors, broken down by attribution_origin (event-originated vs prior-initiated-event-accelerated), refreshed every 15 minutes during the event and nightly post-event. Clicking the tile opens the SSL's all-sponsors dashboard in read-only mode.

The FAL's surface focuses on the financial reconciliation: contracted spend vs collected spend per sponsor, outstanding invoices, and any deal value adjustments pending FAL co-approval.

The ATT has no direct surface in this subsystem. Their touchpoints (booth visits, app profile views) feed the computation but the ATT does not see the commercial outputs.

### G. Failure Modes & Offline Behavior

- **Salesforce Sales Cloud API outage during deal pipeline update:** The warehouse cannot pull new deal updates from Salesforce. The deal pipeline headline number freezes at the last successful sync, the ED's War Room tile shows a "Salesforce sync lagging" banner with the lag in minutes, and a Slack alert fires to the SSL. Once Salesforce recovers, the next sync backfills the missed updates. Any deal created during the outage in Salesforce is captured via the Salesforce Platform Events replay mechanism.
- **Looker Cloud outage (sponsor-facing dashboard unavailable):** The EPU's sponsor portal dashboard returns a "Dashboard temporarily unavailable" message. Sponsors are notified via email that their dashboard will be available within 24 hours. The internal SSL dashboard falls back to direct SQL queries against the ClickHouse mart via a curated SQL runner.
- **Brandwatch social listening ingestion fails for a sponsor:** The brand exposure dimension for that sponsor is computed with a "social listening data incomplete" flag, the brand value is computed from the available channels (app, signage, press) with the social channel set to zero, and the sponsor-facing dashboard shows a "Social listening data not yet captured" callout in the Brand Exposure section. Once Brandwatch recovers, the backfill recomputes the brand value.
- **Deal value currency conversion rate stale (FX API outage):** Deals denominated in non-USD currencies (e.g., a SAR-denominated deal) are converted using the last successful FX rate from the European Central Bank's reference rates. The dashboard shows a "FX rate as of [date]" annotation. Once FX rates are refreshed, deals are revalued.
- **Sponsor dashboard published with an error (e.g., a deal value typo):** The SSL can issue a "Revised Dashboard" publication. The sponsor receives a notification email with the revised figures and a summary of the change. The prior dashboard version is retained in the audit log. If the error affected the deal pipeline headline number, the ED and MPL are notified and a revised press statement is prepared if the error was already publicly disclosed.
- **Lead Capture tool mobile outage during event peak:** Sponsors' booth staff cannot capture leads via the Lead Capture app. The staff fall back to paper business card collection; the sponsor's primary contact uploads a CSV of business card data within 7 days post-event via the sponsor portal; the CSV is parsed and matched against existing attendee records; the leads are created with `lead_quality_score = 50` (default) and `capture_method = "post_event_csv_upload"` for attribution transparency.
- **Manual attribution adjustment co-approval workflow fails (FAL unavailable):** The SSL cannot publish the adjusted attribution without FAL co-approval. The adjustment is held in a "Pending Co-Approval" queue with a 48-hour SLA. If FAL is unavailable beyond 48 hours, the ED can break-glass approve on FAL's behalf with an explicit override recorded in `audit_log`. This break-glass path is audited quarterly.
- **Sponsor objects to their dashboard's numbers:** The sponsor portal offers a "Request Review" workflow. The sponsor submits a justification; the SSL reviews within 5 business days; if the sponsor's justification is valid, the SSL issues a revised dashboard. If the dispute cannot be resolved, the dispute is escalated to the ED for adjudication.

### H. Acceptance Criteria

- **Given** a Platinum sponsor captures 1,200 leads but only 2 deals close (0.17% conversion vs tier benchmark 4.2%), **When** the ROI computation runs the disconnect-detection rule, **Then** the sponsor is flagged in the SSL's "Leads Quality Deep Dive" queue, an `analytics.roi.lead_quality.flagged` event is published with `flag_reason = "high_volume_low_conversion_disconnect"`, and the sponsor-facing dashboard's "Lead Quality Opportunity" callout offers a one-click "Generate Deep Dive Report" that produces a PDF breaking down leads by source, quality band, and conversion rate.
- **Given** a US$ 500M lithium offtake deal was actually initiated at PDAC Toronto six months prior to FMF, **When** the SSL manually adjusts the deal's `attribution_origin` from `event_originated` to `prior_initiated_adjusted` with a justification text and FAL co-approval, **Then** the deal remains in the pipeline at full value, the audit trail captures the original attribution, the adjustment, the actors, the timestamp, and the justification, the sponsor-facing dashboard tags the deal as "prior-initiated, event-accelerated", and the Executive Insights Dashboard's deal pipeline headline includes a footnote disclosing the proportion of prior-initiated deals.
- **Given** two sponsors co-broker a US$ 200M deal in a single B2B meeting, **When** the multi-touch attribution model processes the deal, **Then** the Platinum sponsor receives `tier_attribution = primary` with 65% weight (US$ 130M) and the Gold sponsor receives `tier_attribution = secondary` with 35% weight (US$ 70M), the deal pipeline headline counts the full US$ 200M once, and each sponsor's individual dashboard reflects their fractional share.
- **Given** a sponsor's dashboard is published to the sponsor portal and the deal pipeline headline number is US$ 12.4B, **When** a journalist requests the attribution methodology, **Then** the system produces an attribution methodology report (auto-generated from the `analytics_roi_attribution_model_config` table) that documents the multi-touch model, the weights per tier, the CPM values per channel, the lead value score bands, the manual adjustment count and total adjustment value, and the prior-initiated deal count and total value, with the SSL's signature captured via DocuSign.
- **Given** a deal moves to "won" status in Salesforce 120 days post-event, **When** the Salesforce Platform Event reaches the warehouse, **Then** the sponsor's `deal_won_count` and `deal_won_value_usd` are recomputed, the `computed_roi_multiple` is refreshed, the sponsor-facing dashboard is republished, the sponsor receives a "Dashboard Refresh Available" notification, and the ED's deal pipeline headline number is updated with the new won value.
