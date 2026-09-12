> Module 11: ESG & Sustainability Tracker -> 11.4 ESG Reporting Portal

## ESG Reporting Portal

### A. Purpose Statement

The ESG Reporting Portal is the authoritative generation, review, and publication surface for every external and internal ESG report produced by the Future Minerals Forum across the event lifecycle. It produces three primary report types: the pre-event ESG Commitment Report (baselines, targets, methodology declarations, and supplier-screening commitments), the live-event ESG Dashboard (real-time carbon, waste, and diversity metrics surfaced to internal stakeholders and selected external partners during the event window), and the post-event ESG Impact Report (final numbers, comparison to targets, narrative sections authored by the ESGO, press release authored by the MPL, and the regulatory filing where applicable). At FMF scale, the post-event impact report runs to 84 pages, draws data from 11 upstream subsystems across Modules 8, 9, and 11, is reviewed by 7 signatories (ED, FAL, ESGO, MPL, plus three board-level approvers), is published in English and Arabic, and must be on the FMF public website within 60 days of event close per the Forum's published commitment.

This subsystem exists because the post-event ESG report is the single most-quoted public artifact the Forum produces (referenced by BloombergNEF, S&P Global Commodity Insights, and the host-country Ministry of Investment in their post-event summaries), because three Strategic Partner sponsors condition renewal on the published ESG metrics, and because the post-event carbon footprint is now a regulatory filing in the host country under the Ministry of Energy's Environmental Disclosure Regulation. A methodology drift between the pre-event commitment report and the post-event impact report (e.g., changing the GHG Protocol scope boundary mid-cycle) is a material misstatement that requires public restatement. A mis-attributed metric to a sponsor (e.g., publishing a sponsor's carbon contribution that they consider confidential) is a contractual breach. This subsystem codifies the report templates, the framework alignments (GRI Standards, SASB, UN SDGs, ISO 20121), the access control matrix, and the audit trail of every number that appears in a published report.

The subsystem owns the `esg.report.*` Kafka topic prefix within the broader `esg.*` bounded context established in Module 0.1. It publishes `esg.report.template.created`, `esg.report.template.revised`, `esg.report.draft.created`, `esg.report.draft.section_submitted`, `esg.report.draft.reviewed`, `esg.report.draft.approved`, `esg.report.published`, `esg.report.erratum_issued`, `esg.report.custom_template.saved`, and `esg.report.access.granted`. It subscribes to `esg.carbon.footprint.snapshot_published` (Module 11.1) to pull carbon data into report drafts, `esg.waste.diversion_rate.snapshot_published` (Module 11.2) to pull waste data, `esg.diversity.spend.snapshot_published` (Module 11.3) to pull diversity metrics, `po.payment_released` (Module 9.3) to pull aggregate procurement spend, `supplier.compliance.flagged` (Module 8.2) to disclose supplier compliance deviations, and `press.release.distributed` (Module 10.3) to coordinate the report's press release timing. Its non-negotiable contract is that every number in a published report is traceable to a primary source snapshot with a version hash, and that every access to an unpublished draft is captured in the audit log with actor, timestamp, and section.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all reports at all stages. Write on pre-event report approval, post-event report approval, and erratum issuance. Co-approver (with ESGO) on methodology overrides and on regulator-facing custom reports.
- **Operations Lead (OL):** Read-only on the live-event dashboard sections relevant to operations (carbon by venue, waste by pickup zone). No write on reports.
- **Protocol Officer (PO):** Read-only on the ministerial briefing pack extract (one-page summary of the live dashboard), released only after ESGO sign-off. No write.
- **VIP Liaison (VL):** No access.
- **Registration Manager (RM):** Read-only on the attendee diversity section of the post-event report. No write.
- **Sponsorship Sales Lead (SSL):** Read-only on each sponsor's individual ESG contribution report (per-sponsor excerpt of the post-event report). No write on the consolidated report.
- **Exhibitor Portal User (EPU):** Read-only on their own company's ESG contribution report. No access to consolidated or other sponsors' data.
- **Content & Stage Manager (CSM):** Read-only on the speaker diversity section of the post-event report. Write on factual corrections to speaker-related narrative, with ESGO review.
- **Matchmaking Concierge (MC):** No access.
- **Finance & Administration Lead (FAL):** Read on all reports. Write on finance section approval and on the regulatory filing's financial disclosures. Co-approver on post-event report publication alongside ED and ESGO.
- **Marketing & PR Lead (MPL):** Read on internal reports. Write on the press release section of the post-event report and on the public-facing report's executive summary. Co-approver on external-facing publication (the MPL is the final gate before public release).
- **ESG & Sustainability Officer (ESGO):** Primary user. Read/write on all report templates, drafts, narrative sections, methodology declarations, framework alignments, and snapshot pulls. Approves section submissions from other contributors. Co-approver on report publication.
- **Field Volunteer (FV):** No access.
- **Attendee (ATT):** Read-only on the public-facing report once published, accessed via the event website (no Mobile App surface for the full report; a 1-page attendee-friendly summary tile is surfaced in the app).

### C. Data Model

`esg_report_template` (the versioned template library):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ESGO |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{workiva_template_id, indesign_template_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `template_name` | `text` | e.g., "FMF 2026 Post-Event ESG Impact Report (GRI-aligned)" |
| `report_type` | `enum[pre_event_commitment, live_event_dashboard, post_event_impact, regulator_filing, custom]` | |
| `framework_alignment` | `text[]` | Subset of: `gri_standards, sasb, un_sdgs, iso_20121, iso_14064, tcfd` |
| `language_codes` | `text[]` | ISO 639-1 codes for translated variants |
| `section_definitions` | `jsonb` | Ordered list of section specs: `{section_id, title, type: narrative|metric_table|chart|sponsor_attribution, data_source: esg.carbon.snapshot_published|..., required: true|false, contributor_role: ESGO|MPL|FAL}` |
| `access_control_policy_id` | `uuid` | FK -> access_control_policy.id |
| `publication_workflow` | `enum[standard_two_step, board_review, regulator_filing, public_release]` | Determines the approval chain |
| `is_custom` | `bool` | True if created via the custom report wizard |
| `template_source_id` | `uuid null` | If `is_custom = true`, the parent template this was cloned from |

`esg_report_draft` (an instance of a template being filled out):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ESGO |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{workiva_document_id, salesforce_nzc_report_id, sharepoint_folder_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `template_id` | `uuid` | FK -> esg_report_template.id |
| `draft_state` | `enum[in_progress, internal_review, board_review, approved, published, superseded, erratum_pending]` | |
| `period_start` | `timestamptz` | Reporting period |
| `period_end` | `timestamptz` | |
| `data_snapshot_refs` | `jsonb` | Map of section_id -> snapshot UUID and version hash, e.g., `{carbon_footprint: {snapshot_id: "...", hash: "sha256:..."}}` |
| `narrative_sections` | `jsonb` | Map of section_id -> {author, content_md, status: draft|submitted|reviewed|approved} |
| `language_variants` | `jsonb` | Map of language_code -> translated content for narrative sections |
| `press_release_section` | `jsonb null` | Authored by MPL |
| `contributor_submissions` | `jsonb[]` | Log of section submissions with timestamps |
| `review_signoffs` | `jsonb[]` | Log of reviewer signoffs: `{reviewer_role, signed_at, decision, notes}` |
| `publication_target_date` | `timestamptz` | Planned publication |
| `published_at` | `timestamptz null` | Actual publication timestamp |
| `published_url` | `text null` | Public URL on the event website |
| `erratum_issued_at` | `timestamptz null` | If superseded by erratum |
| `erratum_reason` | `text null` |

`esg_report_access_log` (every read of a draft or published report):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | The actor who accessed the report |
| `updated_by` | `uuid` | Always equals created_by for this table |
| `version` | `int` | Always 1 (immutable) |
| `deleted_at` | `timestamptz null` | Soft-delete (never used; records are immutable) |
| `ext_refs` | `jsonb` | `{report_draft_id, ip_address, user_agent, device_id}` |
| `audit_log` | `jsonb[]` | Always empty (this table IS the audit log) |
| `report_draft_id` | `uuid` | FK -> esg_report_draft.id |
| `access_type` | `enum[read_draft, read_published, download, export_pdf, export_xlsx, share_link]` | |
| `accessed_at` | `timestamptz` | |
| `sections_viewed` | `text[]` | Section IDs accessed in this session |

`access_control_policy` (per-template access matrix):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ESGO or super_admin |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | |
| `audit_log` | `jsonb[]` | Append-only |
| `policy_name` | `text` | e.g., "Internal Post-Event Report Access" |
| `read_roles` | `text[]` | Persona codes permitted to read |
| `write_roles` | `text[]` | Persona codes permitted to write to specific sections |
| `approve_roles` | `text[]` | Persona codes required for approval |
| `publication_gate` | `text[]` | Ordered list of approvers required before publication |
| `external_share_policy` | `enum[no_external, sponsor_excerpt_only, public_release]` | |
| `embargo_until` | `timestamptz null` | If set, blocks external publication until this timestamp |

### D. Business Logic & Edge Cases

- **IF** a report template is revised after a draft has been created from the prior version, **THEN** the draft retains the original template version (immutable snapshot), a "template updated" notification is sent to the ESGO with a "clone to new template" option, and any new drafts must use the new template version. Existing drafts cannot be silently migrated.
- **IF** a data snapshot referenced in `data_snapshot_refs` is later superseded (e.g., the post-event carbon snapshot is revised due to a late hotel disclosure per Module 11.1 edge case), **THEN** the report draft's `data_snapshot_refs` continues to reference the original snapshot (immutable), but the system surfaces a "Source data superseded" alert to the ESGO with a one-click "Refresh snapshot" action that pulls the new snapshot and updates the section, with the prior value retained in the section's `audit_log`.
- **IF** a section is submitted by a contributor (CSM for speaker diversity, FAL for finance, MPL for press release) and the ESGO requests revisions, **THEN** the section's status moves from `submitted` back to `draft`, the prior submission is retained in `contributor_submissions` with timestamp and reviewer notes, and the contributor is notified via Twilio and email.
- **IF** a custom report is requested by a regulator that does not match any template in the library, **THEN** the ESGO uses the custom report wizard: (a) selects metrics from the metric catalog (each metric backed by an upstream snapshot query), (b) selects time period and breakdown dimensions (by venue, day, supplier category, sponsor, attendee cohort), (c) configures access control and publication workflow, (d) the system generates a draft from the wizard configuration, (e) on first save, the wizard offers to save the configuration as a reusable template via `is_custom = true` and `template_source_id` referencing the closest standard template.
- **IF** the post-event carbon footprint is 15% over target due to higher-than-expected attendee air travel, **THEN** the system surfaces a "Target Gap" section in the draft with the absolute and percentage gap, the ESGO authors a narrative section titled "Mitigation and Forward Commitments" that links to additional offset purchases (per Module 11.1) and a year-over-year commitment for the next event, the section is flagged as a "Material Variance" disclosure in the published report, and the regulator filing version (if applicable) includes the variance as a separately disclosed item.
- **IF** a reviewer (ED, FAL, MPL) rejects the report at internal review stage, **THEN** the draft reverts to `in_progress` state, the rejection reason is captured in `review_signoffs`, the ESGO is notified, and the report's `publication_target_date` is automatically pushed back by 5 business days unless the ESGO overrides.
- **IF** a sponsor's ESG contribution report (per-sponsor excerpt) is generated, **THEN** the system pulls only the sponsor-tagged line items from the upstream snapshots (carbon: sponsor-attributable emissions; waste: sponsor material footprint; diversity: sponsor's diverse-spend contribution), the report is access-controlled to the sponsor's EPU and SSL only, and any data point the sponsor has marked as "confidential" per their contract is redacted from the public-facing post-event report.
- **IF** the published report contains an error discovered post-publication (e.g., a mis-attributed sponsor name, a methodology drift), **THEN** the ESGO opens an erratum workflow: (a) the original `esg_report_draft` is marked `superseded` with `erratum_issued_at` populated, (b) a new draft is created as a clone with the corrected data, (c) the new draft follows an expedited approval workflow (ESGO + ED only, skipping board review), (d) on publication, the public URL is updated to show "Version 2 - Erratum issued YYYY-MM-DD" with a summary of the change, and (e) the original is archived but remains accessible at a versioned URL for transparency.
- **IF** a regulatory deadline (e.g., 90 days post-event for the host-country Ministry of Energy filing) approaches and the draft is not yet in `approved` state, **THEN** the system publishes `esg.report.deadline.at_risk` at the 14-day, 7-day, and 3-day marks, surfaces a "Filing Deadline Risk" alert to ESGO and FAL, and at T-3 days offers an "Expedited Filing" workflow that allows the ESGO to file the current draft state with a "subject to revision" footnote.

**Edge case (non-obvious): post-event carbon footprint 15% over target due to higher-than-expected attendee air travel.** The pre-event commitment report targeted 12,000 tCO2e total with a 75% offset coverage commitment. The post-event snapshot reveals 13,920 tCO2e (16% over) driven primarily by higher-than-expected ministerial delegations traveling by private jet (each private jet averaging 4.2 tCO2e per delegation vs the assumed 1.8 tCO2e). The system (a) surfaces a "Target Gap" section in the post-event draft with the absolute (1,920 tCO2e) and percentage (16%) gap, breaking down the drivers by source category (private jets: +840 tCO2e, scheduled flights: +680 tCO2e, hotel stays: +220 tCO2e, others: +180 tCO2e), (b) prompts the ESGO to author a narrative section titled "Mitigation and Forward Commitments" with three required elements: (1) additional offset purchases to maintain the 75% coverage commitment (260 tCO2e of additional Pachama or Climeworks offsets, with the linked offset IDs embedded in the narrative), (2) a year-over-year commitment for next year's event (e.g., "FMF 2027 will pilot a sustainable aviation fuel mandate for ministerial delegations"), (3) a methodology note acknowledging the variance, (c) flags the section as a "Material Variance Disclosure" with a distinct visual marker in the published report, (d) for the regulator filing version (if applicable), the variance is disclosed as a separately labelled item per the host-country Environmental Disclosure Regulation, (e) the press release section (authored by MPL) includes a one-paragraph summary of the variance and the mitigation, cleared by ESGO and ED before publication, and (f) the published report's "Year-over-Year Comparison" section highlights the gap as the leading narrative item rather than burying it in an appendix. The MPL's press release explicitly addresses the variance rather than spinning it, per the Forum's published transparency commitment.

**Edge case (non-obvious): a regulator requests a custom ESG report format not in the system's template library.** Sixty days post-event, the host-country Ministry of Energy requests a custom ESG report covering only Scope 1 and Scope 2 emissions, broken down by venue, by day, and by emission factor source authority, with a methodological justification in narrative form, in a 12-page format aligned with the Ministry's internal template. The system (a) the ESGO opens the custom report wizard, (b) selects metrics: Scope 1 emissions total, Scope 2 emissions total, broken down by `venue_id` and `period_start.date`, broken down by `emission_factor.source_authority`, (c) selects the reporting period (event days only, excluding prep and teardown), (d) selects the access control policy (Ministry of Energy internal review, restricted to ESGO + ED + FAL), (e) selects the publication workflow (`regulator_filing` with a single-step approval by ESGO + ED co-sign), (f) the system generates the draft from the wizard configuration, pulling data from the relevant `esg.carbon.snapshot_published` events, (g) the ESGO authors the methodological justification narrative section, (h) on first save, the wizard offers to save the configuration as a reusable template via `is_custom = true` with `template_source_id` referencing the closest standard template (the regulator_filing variant of the post-event impact report), (i) the new template is named "MoE Custom Scope 1+2 Filing" and becomes available for future Ministry filings, (j) the system publishes `esg.report.custom_template.saved`, and (k) the ESGO + ED co-sign the report, which is then exported as a PDF and delivered via the Ministry's secure portal. The custom template becomes part of the template library for future regulatory requests, reducing the time-to-draft for similar requests from days to hours.

### E. Third-Party Integrations

- **Workiva:** ESG reporting platform used as the primary drafting surface for board-review and regulator-filing reports. Data flow: `esg_report_draft` -> Workiva document (via Workiva API, hourly sync) -> reviewer markup in Workiva -> markup synced back into `narrative_sections` and `review_signoffs`. The Workiva document is the canonical surface for collaborative review; the system's `esg_report_draft` is the canonical record for audit and traceability.
- **Diligent (alternatively):** Board-ready ESG reporting platform, used by Forum tenants on Diligent instead of Workiva. Same integration pattern.
- **Microsoft Power BI:** Live-event dashboard visualization for internal stakeholders. Data flow: data snapshots published to Power BI semantic model (push API, 5-minute refresh) -> internal stakeholders view the live dashboard. Read-only via Power BI service accounts.
- **Tableau (alternatively):** Used by Forum tenants on Tableau instead of Power BI. Same integration pattern with Tableau Cloud.
- **Adobe InDesign:** Design surface for the polished post-event impact report PDF. Data flow: `esg_report_draft` with all approved narrative sections and metric tables -> exported as a structured JSON -> InDesign script (ExtendScript or UXP) populates an InDesign template -> designer polishes layout -> exported PDF uploaded to the system as `published_url` artifact.
- **Canva (alternatively for non-designer tenants):** Lighter-weight design surface for smaller events or for early-draft executive summaries. Same JSON-to-template pattern via Canva's API.
- **WordPress or Drupal:** Public event website CMS where the published report is hosted. Data flow: on `esg.report.published`, the Integration Hub pushes the report PDF and an HTML summary page to the WordPress/Drupal CMS via REST API, creates a public URL, and writes the URL back to `esg_report_draft.published_url`.
- **Salesforce Net Zero Cloud:** For Forum tenants consolidating year-round corporate ESG reporting, the post-event impact report's headline metrics are pushed to Net Zero Cloud for consolidation into the annual corporate ESG report.
- **DocuSign:** For regulator filings requiring a wet-equivalent signature, the published PDF is routed through DocuSign for ED + ESGO + FAL signatures before delivery to the regulator's secure portal.
- **AWS S3 (KMS-CMK):** Storage for report PDFs, design source files (InDesign, Canva), and the structured JSON exports. Bucket policy requires server-side encryption with the ESG service KMS key and lifecycle rules that retain published reports for 7 years per regulatory audit requirement.
- **Kafka topics:** Publishes the events enumerated in Section A. Subscribes to `esg.carbon.footprint.snapshot_published` (Module 11.1), `esg.waste.diversion_rate.snapshot_published` (Module 11.2), `esg.diversity.spend.snapshot_published` (Module 11.3), `po.payment_released` (Module 9.3) for procurement spend rollups, `supplier.compliance.flagged` (Module 8.2) for compliance deviation disclosure, `sponsor.deal.signed` (Module 5.1) for sponsor-attribution tagging, and `press.release.distributed` (Module 10.3) for coordinated press release timing on report publication day.

### F. UI/UX Notes

The ESGO's primary screen is a three-pane report authoring surface. Left pane: the report's table of contents, with each section showing its contributor, status (draft, submitted, reviewed, approved), and a freshness indicator for the underlying data snapshot. Center pane: the section editor (Markdown for narrative sections, a metric-table editor with snapshot pull-down for data sections, a chart configurator for visualization sections). Right pane: the review queue showing pending signoffs, reviewer comments, and the publication countdown.

The top of the screen carries a banner showing the report's `draft_state`, the `publication_target_date` countdown, the count of pending reviewer signoffs, and a "Methodology Version" indicator showing the GHG Protocol / DEFRA / GRI / SASB versions in effect.

The custom report wizard is a four-step modal: (1) metric selection from the catalog, (2) time period and breakdown dimensions, (3) access control and publication workflow, (4) preview and save-as-template option. Each step has inline validation and a live preview of the report's structure on the right side of the modal.

The ED's review surface is a read-only view of the report with comment-anchored markup, a one-click "Approve Section" button per section, and a "Publish Report" action gated by the full approval chain (ESGO + FAL + ED + MPL for public-release reports).

The ATT public surface is a single landing page on the event website with the published report PDF, a 1-page executive summary, and a deep-link to the year-over-year comparison. The Mobile App surfaces only a 1-page attendee-friendly summary tile with the headline numbers (total tCO2e, diversion rate, diverse spend %).

### G. Failure Modes & Offline Behavior

- **Workiva API unavailable during collaborative review:** The system continues to accept narrative section submissions internally and queues the Workiva sync for retry via the Integration Hub dead-letter queue. Reviewers can use the system's native review surface as a fallback, with markup synced back to Workiva when connectivity returns. A banner in the ESGO dashboard reads "Workiva sync stale; using native review surface."
- **Power BI push API failure (live-event dashboard):** The system falls back to a static dashboard refresh (15-minute interval via export-to-PDF and re-hosting), surfaces a "Live dashboard degraded" banner to internal stakeholders, and notifies the on-call SRE. The post-event impact report is unaffected because it pulls from snapshots, not from the live dashboard.
- **Adobe InDesign script failure (post-event report design):** The system falls back to a Markdown-to-PDF pipeline (using Pandoc with a styled template) for the published report PDF, with a banner noting "Designed PDF pending; Markdown version published." The InDesign pipeline retries nightly; once it succeeds, the polished PDF replaces the Markdown version at the same public URL.
- **WordPress or Drupal CMS publication failure:** The report is uploaded to S3 with a temporary CloudFront URL and the public-facing redirect is configured manually by the MPL's team. The system surfaces "CMS publication failed; temporary URL in place" and a Staff App task is dispatched to the web team for manual resolution within 4 hours.
- **DocuSign signature not returned before regulator filing deadline:** The system allows the regulator filing to be submitted with the ESGO + ED digital signatures (within the system) and a placeholder for the DocuSign wet-equivalent, with a commitment to deliver the signed version within 5 business days. The regulator's portal receives a "signature pending" note.
- **Reviewer offline during the approval window:** The system supports asynchronous review via email deep-link: the reviewer receives a one-time-token link to the report section, can approve or request revisions from a mobile browser without logging into the full console, and the action is captured in `review_signoffs` with the same audit fields as a console-based approval.
- **Sponsor-attribution data marked confidential is accidentally included in the public report:** This is a P0 incident. The system's pre-publication validator scans every published PDF and HTML for sponsor-attribution tags marked `confidential` in the sponsor record (Module 5.1); if any are detected, the publication is blocked, the ESGO is paged, and the report reverts to `internal_review` state. If the leak does reach the public website (rare, only via a manual override), the erratum workflow is invoked within 60 minutes, the published URL is pulled, the version is archived, and the sponsor is notified by SSL within 2 hours per the sponsor contract's breach-notification clause.

### H. Acceptance Criteria

- **Given** the post-event carbon footprint is 13,920 tCO2e against a 12,000 tCO2e target (16% over) due to higher-than-expected attendee air travel, **When** the ESGO opens the post-event impact report draft, **Then** the system surfaces a "Target Gap" section with the absolute (1,920 tCO2e) and percentage (16%) gap broken down by source category, prompts the ESGO to author a "Mitigation and Forward Commitments" narrative with the three required elements (additional offsets, year-over-year commitment, methodology note), flags the section as a "Material Variance Disclosure" in the published report, and surfaces the gap as the leading item in the Year-over-Year Comparison section.
- **Given** the host-country Ministry of Energy requests a custom ESG report 60 days post-event covering only Scope 1 and Scope 2 emissions broken down by venue, day, and emission factor source authority, **When** the ESGO uses the custom report wizard to configure the report, **Then** the system generates a draft from the wizard configuration pulling data from the relevant `esg.carbon.snapshot_published` events, offers to save the configuration as a reusable template on first save with `is_custom = true` and `template_source_id` referencing the closest standard template, publishes `esg.report.custom_template.saved`, and supports the ESGO + ED co-sign workflow via DocuSign for regulator delivery.
- **Given** the post-event impact report has been published to the public website, **When** a methodology drift is discovered (e.g., a Scope 3 attendee-travel line item was computed with a 2024 DEFRA factor instead of 2025), **Then** the ESGO opens the erratum workflow, the original `esg_report_draft` is marked `superseded` with `erratum_issued_at` populated, a new draft is created as a clone with the corrected factor and recomputed total, follows an expedited approval workflow (ESGO + ED only, skipping board review), and on publication the public URL shows "Version 2 - Erratum issued YYYY-MM-DD" with a one-paragraph summary of the change.
- **Given** a Strategic Partner sponsor's ESG contribution report is being generated, **When** the system pulls sponsor-tagged line items from the upstream snapshots, **Then** the report is access-controlled to the sponsor's EPU and SSL only, any data point the sponsor has marked "confidential" per their contract is redacted from the public-facing post-event report, and the pre-publication validator scans the published PDF for any sponsor-attribution tags marked confidential before publication, blocking the publication and paging the ESGO if any are detected.
- **Given** the regulator filing deadline (90 days post-event) is at T-3 days and the draft is not yet in `approved` state, **When** the deadline risk threshold is breached, **Then** the system publishes `esg.report.deadline.at_risk`, surfaces a "Filing Deadline Risk" alert to ESGO and FAL, and offers an "Expedited Filing" workflow that allows the ESGO to file the current draft state with a "subject to revision" footnote, with the filing timestamped and the ESGO's signature captured via DocuSign.
