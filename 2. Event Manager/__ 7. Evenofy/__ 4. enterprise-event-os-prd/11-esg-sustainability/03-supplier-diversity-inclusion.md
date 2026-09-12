> Module 11: ESG & Sustainability Tracker -> 11.3 Supplier Diversity & Inclusion

## Supplier Diversity & Inclusion

### A. Purpose Statement

The Supplier Diversity & Inclusion subsystem is the authoritative registry, certification tracker, and spend-attribution engine for every diverse supplier engaged by the Future Minerals Forum, alongside the broader inclusion metrics (speaker diversity, attendee diversity, staff and volunteer diversity) that together constitute the "social" pillar of the event's ESG report. At FMF scale, the procurement function awards 2,800+ POs across 300+ suppliers (per Module 8.2) with combined contract value exceeding US$ 18M. The Forum's published commitment is 25% diverse supplier spend by 2026 (against a 2024 baseline of 14%), where "diverse" spans women-owned, minority-owned, LGBTQ+-owned, disability-owned, veteran-owned, small business, and host-country local (per host-country Vision 2030 local-content framework). Beyond procurement, the subsystem tracks speaker panel composition against a target of 40% women speakers and 30% Global South representation, attendee cohort diversity for publication in the post-event impact report, and staff/volunteer workforce composition for the Forum's internal inclusion dashboard.

This subsystem exists because three Strategic Partner sponsors include supplier-diversity milestones as sponsorship-renewal clauses, because the host-country Ministry of Investment requires a local-content report as a regulatory filing within 90 days of event close, and because the post-event ESG impact report (Module 11.4) requires GRI 405 (Diversity and Equal Opportunity) and GRI 204 (Procurement Practices) alignment. A single misclassified supplier (e.g., a prime contractor whose subcontractor is women-owned being counted as the prime's diversity status) can inflate the reported diverse-spend ratio by 3-5 percentage points, triggering a material misstatement in the published ESG report. This subsystem codifies the diversity taxonomy, captures supplier self-attestations and third-party certifications with expiry tracking, attributes every PO to its prime-contractor diversity status, and surfaces gaps and pacing shortfalls to ESGO before they become public reporting failures.

The subsystem owns the `esg.diversity.*` Kafka topic prefix within the broader `esg.*` bounded context established in Module 0.1. It publishes `esg.diversity.supplier.self_attested`, `esg.diversity.supplier.verified`, `esg.diversity.supplier.certification.expired`, `esg.diversity.po.tagged`, `esg.diversity.spend.snapshot_published`, `esg.diversity.speaker.panel_composition.changed`, `esg.diversity.attendee.cohort_classified`, `esg.diversity.gap.detected`, and `esg.diversity.target.breached`. It subscribes to `supplier.registered` and `supplier.contract.signed` (Module 8.2) to seed diversity classification at supplier onboarding, to `po.issued` and `po.payment_released` (Module 9.3) to tag every procurement transaction with prime-contractor diversity status, to `speaker.onboarding.changed` and `session.scheduled` (Modules 4.1, 4.2) to track speaker panel composition, to `registration.confirmed` (Module 6.1) to classify attendee cohort diversity, and to `sponsor.deal.signed` (Module 5.1) to surface supplier diversity gaps in sponsor onboarding. Its non-negotiable contract is that every reported dollar of diverse spend is traceable to a PO with a tagged supplier whose diversity status was current at the PO issue date.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all diversity data, snapshots, and gap reports. Write only via break-glass on diversity target revisions (with ESGO co-approval) and on sponsor-level diversity-gap waivers. Sees the diverse-spend pacing tile in the War Room.
- **Operations Lead (OL):** Read on supplier diversity flags within the supplier registry. Write only on flagging a supplier for ESGO review during RFQ evaluation. Cannot modify the diversity taxonomy or the spend target.
- **Protocol Officer (PO):** No direct access. Receives only a one-line summary of delegation-level speaker diversity for ministerial briefing packs.
- **VIP Liaison (VL):** No access.
- **Registration Manager (RM):** Read on attendee cohort classification fields (gender, geography, age band) for the registration confirmation flow. Write only on the optional demographic self-attestation fields captured at registration, with explicit consent gating per host-country data protection law.
- **Sponsorship Sales Lead (SSL):** Read on per-sponsor diversity gap analysis. Write only on suggesting pre-vetted diverse alternatives to a sponsor whose contractor list lacks diversity. Sees the "Sponsor Diversity Gap" tile per sponsor record.
- **Exhibitor Portal User (EPU):** Read-only on their own company's diversity self-attestation status. Can submit a third-party certification document for ESGO verification via a structured upload form.
- **Content & Stage Manager (CSM):** Read on speaker panel composition per session. Write on session-level speaker demographics corrections (e.g., capturing a late-stage speaker substitution) with audit capture.
- **Matchmaking Concierge (MC):** No direct access. Receives only a one-line "diverse attendee cohort" summary for meeting-pairing equity checks.
- **Finance & Administration Lead (FAL):** Read on PO diversity tagging for finance reconciliation. Cannot modify supplier diversity status. Reviews the diverse-spend figure before regulatory filing.
- **Marketing & PR Lead (MPL):** Read-only on the externally shareable diversity snapshot. Cannot see certification documents or self-attestation details.
- **ESG & Sustainability Officer (ESGO):** Primary user. Read/write on diversity taxonomy, certification registry, verification workflow, spend target configuration, gap analysis rules, and snapshot publication. Owns the certification-expiry queue and the sponsor diversity-gap workflow.
- **Field Volunteer (FV):** No access. (Staff/volunteer diversity data is captured at HR onboarding, not by FV.)
- **Attendee (ATT):** Read-only on their own demographic self-attestation fields. Can edit their own gender, geography, and age-band declarations, with a "prefer not to say" option for every field.

### C. Data Model

`supplier_diversity_profile` (one record per supplier per event):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ESGO or supplier self-service account |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{supplier_id, weconnect_id, nglcc_id, nmsdc_id, coupa_supplier_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `supplier_id` | `uuid` | FK -> supplier.id (Module 8.2) |
| `diversity_categories` | `text[]` | Subset of: `women_owned, minority_owned, lgbtq_owned, disability_owned, veteran_owned, small_business, local_host_country` |
| `self_attestation` | `jsonb` | e.g., `{women_owned: true, signed_by: "CEO Jane Doe", signed_at: "2025-09-14T10:00:00Z"}` |
| `verification_status` | `enum[unverified, self_attested, third_party_verified, expired, revoked]` | |
| `verification_artifacts` | `jsonb[]` | e.g., `[{certifier: "WEConnect", cert_id: "WC-2025-04412", expires: "2026-08-01"}]` |
| `certification_expiry` | `date null` | Earliest expiry across all verification artifacts; null if unverified |
| `local_content_pct` | `numeric(5,2) null` | Host-country local content percentage (Vision 2030 reporting) |
| `workforce_diversity_summary` | `jsonb null` | Optional supplier-reported workforce composition |
| `in_flight_po_protection` | `bool` | When true, in-flight POs retain the supplier's prior diversity status even after certification expiry |
| `status_effective_at` | `timestamptz` | When current verification_status took effect |

`po_diversity_tag` (one record per PO, capturing diversity attribution at PO issue):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Service account (auto-tagged on po.issued) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{po_id, supplier_id, coupa_po_id, supplier_diversity_profile_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `po_id` | `uuid` | FK -> po.id (Module 9.3) |
| `supplier_id` | `uuid` | FK -> supplier.id |
| `po_issue_date` | `timestamptz` | From Module 9.3 |
| `po_amount` | `numeric(18,3)` | With `currency_code` per Module 9 conventions |
| `currency_code` | `char(3)` | ISO 4217 |
| `diversity_categories_at_issue` | `text[]` | Snapshot of supplier's diversity_categories at po_issue_date |
| `verification_status_at_issue` | `enum` | Snapshot of verification_status at po_issue_date |
| `is_diverse` | `bool` | True if diversity_categories non-empty AND verification_status in (self_attested, third_party_verified) |
| `is_local` | `bool` | True if `local_host_country` in diversity_categories |
| `tagged_at` | `timestamptz` | When the tag was created (always po_issue_date or later) |

`diversity_target_config` (per-event target configuration):

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
| `ext_refs` | `jsonb` | e.g., `{workiva_report_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `target_type` | `enum[diverse_spend_pct, women_speakers_pct, global_south_speakers_pct, attendee_diversity_pct, workforce_diversity_pct, local_content_pct]` | |
| `target_value` | `numeric(5,2)` | Percentage |
| `baseline_year` | `int` | Year of baseline measurement |
| `baseline_value` | `numeric(5,2)` | Percentage at baseline |
| `effective_from` | `timestamptz` | |
| `effective_to` | `timestamptz null` | null = current |

`speaker_diversity_record` (per speaker per session, captures panel composition):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | CSM or ESGO |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{speaker_id, session_id, agenda_item_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `speaker_id` | `uuid` | FK -> speaker.id (Module 4.2) |
| `session_id` | `uuid` | FK -> session.id (Module 4.1) |
| `gender_self_declared` | `enum[woman, man, non_binary, prefer_not_to_say]` | From speaker onboarding form |
| `geography_region` | `enum[north_america, latin_america, europe, mena, sub_saharan_africa, south_asia, east_asia, southeast_asia, oceania, prefer_not_to_say]` | From speaker onboarding form |
| `age_band` | `enum[under_30, thirty_to_45, forty_five_to_60, over_60, prefer_not_to_say]` | |
| `is_global_south` | `bool` | Derived from geography_region |
| `is_panel_moderator` | `bool` | |
| `recorded_at` | `timestamptz` | When composition was last captured |

`attendee_diversity_aggregate` (per-event rollup, no per-attendee PII stored in this table):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Service account (nightly rollup) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{rollup_run_id, source_query_hash}` |
| `audit_log` | `jsonb[]` | Append-only |
| `rollup_date` | `date` | The day this aggregate was computed |
| `total_attendees` | `int` | Confirmed registrations |
| `gender_distribution` | `jsonb` | e.g., `{woman: 32.4, man: 65.1, non_binary: 0.8, prefer_not_to_say: 1.7}` |
| `geography_distribution` | `jsonb` | Region -> count |
| `age_distribution` | `jsonb` | Age band -> percentage |
| `global_south_pct` | `numeric(5,2)` | Derived |

### D. Business Logic & Edge Cases

- **IF** a supplier's `certification_expiry` falls within 60 days of the event start, **THEN** the system publishes `esg.diversity.supplier.certification.expiring`, sends a Twilio SMS and email reminder to the supplier's registered contact requesting renewal, and surfaces the supplier in the ESGO's "Renewal Required" queue. New POs can still be issued against the supplier during this 60-day window.
- **IF** a supplier's `certification_expiry` passes without renewal and `in_flight_po_protection = true`, **THEN** the system publishes `esg.diversity.supplier.certification.expired`, sets `verification_status = expired`, retains the diversity attribution for all POs issued before the expiry date, but blocks new PO issuance against that supplier by surfacing a "Certification Expired" warning in the procurement workflow (Module 9.3) that requires ESGO break-glass override to bypass.
- **IF** a sponsor's contractor list (provided at sponsor onboarding per Module 5.3) contains zero diverse suppliers, **THEN** the system surfaces a "Supplier Diversity Gap" alert in the sponsor's ESG dashboard, suggests three pre-vetted diverse alternatives from the supplier registry matched by service category, and offers a one-click "request substitution" workflow that notifies the sponsor and the SSL.
- **IF** a prime contractor is non-diverse but a subcontractor is diverse (verified via the subcontractor disclosure captured at supplier onboarding), **THEN** the system tags the PO with `is_diverse = false` (per GRI 204 standard attribution rule) but records the subcontractor diversity in `ext_refs.subcontractor_diversity` for narrative disclosure in the post-event report. The system does NOT count the PO amount toward the diverse-spend target.
- **IF** a speaker substitution occurs within 48 hours of session start (Module 4.2) and the substitute breaks a panel's diversity composition target (e.g., replacing a woman speaker with a man on an otherwise all-woman panel), **THEN** the system publishes `esg.diversity.speaker.panel_composition.changed`, surfaces a "Panel Composition Alert" to CSM and ESGO with three suggested alternative speakers from the speaker registry who match the original diversity profile, and ESGO can either approve the substitution with a documented waiver or require the CSM to find an alternative.
- **IF** the diverse-spend pacing for a procurement category falls below 60% of the proportional target at the 50% mark of the procurement cycle, **THEN** the system publishes `esg.diversity.target.pacing_off`, surfaces the category in the ESGO's "Pacing Risk" queue, and auto-suggests RFQ routing to pre-vetted diverse suppliers in that category via the Module 8.2 RFQ workflow.
- **IF** an attendee does not self-declare gender at registration, **THEN** the system does not estimate or impute gender (per host-country data protection law); the attendee's record counts toward `prefer_not_to_say` in `attendee_diversity_aggregate.gender_distribution`, and the post-event report discloses the share of undisclosed gender as a methodology transparency note.
- **IF** a supplier self-attests a diversity category that is later contradicted by a third-party verifier (e.g., self-attests as women-owned but NMSDC verification returns not-certified), **THEN** the system sets `verification_status = revoked`, re-tags all in-flight POs from `is_diverse = true` to `is_diverse = false` with a `revocation_at` timestamp, recomputes the affected snapshot's diverse-spend ratio, and surfaces a "Diversity Status Revocation" alert to ESGO and FAL for finance reconciliation (any volume-based sponsor rebate that depended on the diverse-spend ratio is recalculated).

**Edge case (non-obvious): a supplier's diversity certification expires mid-event.** A women-owned catering supplier's WEConnect certification expires on Day 2 of the three-day event. Three POs are in flight: one completed on Day 1 (US$ 48,000), one in progress on Day 2 (US$ 32,000 for the Day-3 gala dinner), and one scheduled for Day 3 (US$ 18,000 for the closing lunch). When the certification expires, the system (a) publishes `esg.diversity.supplier.certification.expired`, (b) sets `in_flight_po_protection = true` for the two POs issued before the expiry timestamp, retaining their `is_diverse = true` tagging, (c) blocks the Day-3 scheduled PO from being issued via the procurement workflow (Module 9.3 surfaces a "Certification Expired" gate), (d) notifies the supplier via Twilio SMS that their certification has expired and the Day-3 PO cannot be released until renewal, (e) notifies ESGO and OL of the gap, and (f) offers three pre-vetted alternative women-owned catering suppliers from the registry. ESGO can break-glass override the block on the Day-3 PO if no alternative is available, with the override documented in `audit_log` and the post-event ESG report flagged with a "Diversity Compliance Deviation" disclosure.

**Edge case (non-obvious): a sponsor's booth construction contractor list includes zero diverse suppliers.** A Platinum sponsor submits their booth construction contractor list at sponsor onboarding (Module 5.3): the list contains four contractors (carpentry, electrical, AV rigging, signage), none of which are women-owned, minority-owned, or local-host-country. The system (a) classifies this as a "Supplier Diversity Gap" with severity proportional to the sponsor's tier (Platinum sponsors carry the highest threshold), (b) surfaces a "Supplier Diversity Gap" alert in the sponsor's ESG dashboard with the contract terms attached, (c) suggests three pre-vetted diverse alternatives per service category (carpentry: a women-owned local carpentry firm; electrical: a disability-owned GCC-based electrical contractor; AV rigging: a veteran-owned rigging firm), (d) offers a one-click "request substitution" workflow that notifies the sponsor's ESGO liaison and the SSL with a template email offering the alternatives, (e) tracks the sponsor's response (accept substitution, accept with documented waiver, refuse) in `audit_log`, and (f) if the sponsor refuses substitution, includes the deviation in the sponsor's post-event ESG contribution report with a "Sponsor Diversity Gap Not Addressed" disclosure that may affect renewal terms. The waiver path does not deduct from the overall diverse-spend target (which is measured at total procurement, not per sponsor), but the disclosure is material to the sponsor's individual ESG scorecard.

### E. Third-Party Integrations

- **WEConnect International:** Women-owned business certification registry. Data flow: supplier submits WEConnect certification ID at onboarding -> Integration Hub (Workato) calls WEConnect verification API -> returns certification status and expiry -> `supplier_diversity_profile.verification_artifacts` populated with certifier, cert_id, and expires.
- **NGLCC (National LGBT Chamber of Commerce):** LGBTQ+-owned business certification registry. Same integration pattern as WEConnect.
- **NMSDC (National Minority Supplier Development Council):** Minority-owned business certification registry. Same integration pattern.
- **SDVOSB / Vets First (US Department of Veterans Affairs):** Veteran-owned small business verification. Read-only public registry scrape via the VA's vendor search API.
- **Disability:IN:** Disability-owned business certification registry. Same integration pattern.
- **Host-country local-content registry (e.g., Saudi Vision 2030 Local Content & Government Procurement Authority - LCGPA):** Host-country-specific registry for local-content percentage verification. Read-only via LCGPA's vendor lookup API for FMF; for other host countries, the equivalent local authority is configured via a generic webhook.
- **Coupa:** Procurement platform that holds the supplier master record (per Module 8.2). Data flow: supplier diversity tag in Coupa -> bi-directional sync with `supplier_diversity_profile` -> PO diversity tag automatically derived at `po.issued` event from the Coupa-supplied `diversity_categories` snapshot.
- **Salesforce (HR module) or Workday HCM:** Workforce diversity metrics for Forum staff and volunteers. Data flow: nightly aggregate pull from Salesforce or Workday -> `attendee_diversity_aggregate`-equivalent rollup for staff and volunteer cohorts, stored in a separate `workforce_diversity_aggregate` table (same schema, different scope). Per-employee PII is never stored in this subsystem; only aggregate percentages.
- **Twilio:** SMS reminders to suppliers approaching certification expiry, and to ESGO on critical certification events.
- **SendGrid:** Email reminders and the sponsor substitution-request template.
- **AWS S3 (KMS-CMK):** Storage for certification documents, third-party verification artifacts, and sponsor correspondence around diversity gaps. Bucket policy requires server-side encryption with the ESG service KMS key.
- **Kafka topics:** Publishes the events enumerated in Section A. Subscribes to `supplier.registered` and `supplier.contract.signed` (Module 8.2) to seed the `supplier_diversity_profile` at supplier onboarding, `po.issued` and `po.payment_released` (Module 9.3) to create `po_diversity_tag` records at PO issue and to confirm spend at payment, `speaker.onboarding.changed` and `session.scheduled` (Modules 4.1, 4.2) to create and update `speaker_diversity_record` entries, `registration.confirmed` and `registration.cancelled` (Module 6.1) to update the `attendee_diversity_aggregate` rollup, and `sponsor.deal.signed` and `sponsor.onboarding.completed` (Modules 5.1, 5.3) to trigger sponsor diversity-gap analysis at sponsor onboarding.

### F. UI/UX Notes

The ESGO's primary screen is a four-quadrant dashboard. Top-left: the diverse-spend pacing gauge showing current % against target, broken down by diversity category (women-owned, minority-owned, etc.) as a stacked bar across procurement categories (catering, AV, transport, signage, security, etc.). Top-right: the "Certification Renewal Queue" listing every supplier whose certification expires within 60 days, sorted by expiry date, with a one-click "Send Reminder" Twilio SMS action. Bottom-left: the "Speaker Diversity" panel showing every session's gender and Global South composition with red/amber/green coding against target, sortable by deviation. Bottom-right: the "Sponsor Diversity Gap" queue listing every sponsor whose contractor list lacks diversity, with the suggested alternatives inline.

The SSL's sponsor ESG dashboard shows the sponsor's individual diverse-spend contribution, the gap analysis, and the substitution-request workflow with templated email drafts. The OL's surface shows the supplier registry filtered by diversity category, with a "Suggest Diverse RFQ Routing" action in the RFQ workflow.

The CSM's surface shows every session in a grid with the gender composition bar per session; clicking a session opens the speaker list with diversity tags and a "Find Alternative" search that filters the speaker registry by gender, geography, and topic expertise.

The ATT Mobile App surface has no direct diversity readouts. Attendee diversity data is captured at registration via opt-in fields and surfaced only in aggregate in the post-event ESG report. The Mobile App does show a "Diverse Supplier Spotlight" tile per day, highlighting one diverse supplier with a brief story and a deep-link to their booth or profile.

### G. Failure Modes & Offline Behavior

- **WEConnect or NGLCC verification API unavailable at supplier onboarding:** The system accepts the supplier's self-attestation, sets `verification_status = self_attested` with `verification_artifacts = []`, and queues the verification call for retry via the Integration Hub dead-letter queue. POs can be issued against `self_attested` suppliers, but the spend is flagged as "self-attested only" in the snapshot and disclosed in the post-event report.
- **Coupa supplier master sync failure:** The system falls back to the locally cached `supplier_diversity_profile` snapshot (refreshed nightly), with a banner in the ESGO dashboard reading "Coupa sync stale; diversity tags may be up to 24 hours behind." PO tags created during the outage are flagged `data_quality = self_attested` pending reconciliation.
- **Host-country LCGPA registry lookup failure:** The system defaults `local_content_pct = null` and surfaces a "Local content unverified" warning to ESGO. Suppliers with prior verified local-content percentages retain the cached value with a 90-day TTL; after 90 days the cached value expires and the supplier is flagged for re-verification.
- **Salesforce or Workday HCM aggregate pull failure (workforce diversity):** The system falls back to the prior week's aggregate, surfaces a "Workforce diversity rollup stale" banner, and defers the snapshot publication if workforce diversity is a required metric for the snapshot type.
- **Speaker substitution within 48 hours of session start with no diverse alternative available:** The CSM must accept the substitution with a documented waiver (captured in `speaker_diversity_record.audit_log`), the post-event report discloses the deviation, and the system offers a "Next Year Suggestion" follow-up task to ESGO to expand the speaker registry for that demographic profile.
- **Supplier self-attestation contradicted by later third-party verification:** Per the revocation logic in Section D, the system re-tags all in-flight POs, recomputes the affected snapshot, and surfaces the revocation to ESGO and FAL. Any sponsor rebate that depended on the diverse-spend ratio is flagged for finance reconciliation within 24 hours.
- **Sponsor refuses to address a diversity gap:** The waiver is captured in `audit_log`, the gap is disclosed in the sponsor's post-event ESG contribution report, and the SSL is notified that the gap may affect renewal terms per the sponsor's contract clause. The overall event diverse-spend target is not adjusted (the gap counts against the event target).

### H. Acceptance Criteria

- **Given** a women-owned catering supplier's WEConnect certification expires on Day 2 of the three-day event, **When** the certification expiry timestamp passes with two in-flight POs issued before expiry and one PO scheduled for Day 3, **Then** the system publishes `esg.diversity.supplier.certification.expired`, retains `is_diverse = true` tagging on the two in-flight POs, blocks the Day-3 PO from being issued, notifies the supplier via Twilio SMS, surfaces the gap to ESGO and OL, and offers three pre-vetted women-owned catering alternatives from the supplier registry.
- **Given** a Platinum sponsor's booth construction contractor list contains four contractors with zero diverse suppliers, **When** the diversity gap is detected at sponsor onboarding, **Then** the system surfaces a "Supplier Diversity Gap" alert with severity proportional to sponsor tier, suggests three pre-vetted diverse alternatives per service category, offers a one-click substitution-request workflow that notifies the sponsor and the SSL, and tracks the sponsor's response (accept, accept with waiver, refuse) in `audit_log` with the refusal path disclosed in the post-event report.
- **Given** a prime contractor is non-diverse but a verified women-owned subcontractor is disclosed, **When** a US$ 120,000 PO is issued against the prime contractor, **Then** the system tags the PO with `is_diverse = false` per GRI 204 attribution rule, records the subcontractor diversity in `ext_refs.subcontractor_diversity`, does not count the PO amount toward the diverse-spend target, and includes the subcontractor diversity in the post-event narrative disclosure.
- **Given** the diverse-spend pacing for the catering category falls to 12% against a 25% target at the 50% mark of the procurement cycle, **When** the pacing ratio drops below 60% of target, **Then** the system publishes `esg.diversity.target.pacing_off`, surfaces the catering category in the ESGO's "Pacing Risk" queue, and auto-suggests RFQ routing to pre-vetted diverse catering suppliers via the Module 8.2 RFQ workflow.
- **Given** a speaker substitution within 48 hours of session start replaces a woman speaker with a man on an otherwise all-woman panel, **When** the substitute breaks the panel's gender composition target, **Then** the system publishes `esg.diversity.speaker.panel_composition.changed`, surfaces a "Panel Composition Alert" to CSM and ESGO with three suggested alternative women speakers from the speaker registry who match the original topic expertise, and requires either an approved substitution with documented waiver or a search for an alternative before the session goes live.
