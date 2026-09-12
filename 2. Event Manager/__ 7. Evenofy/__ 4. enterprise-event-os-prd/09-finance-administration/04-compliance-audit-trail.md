> Module 9: Finance & Administration Module -> 9.4 Compliance & Audit Trail

## Compliance & Audit Trail

### A. Purpose Statement

The Compliance & Audit Trail subsystem is the authoritative, tamper-evident, and exportable record of every state-changing operation across all 12 bounded contexts of the Enterprise Event Management Operating System. At FMF scale, this encompasses 14 million+ audit events per event cycle (registration scans, badge prints, protocol rank changes, break-glass actions, PO approvals, GL postings, FX rate pulls, GDPR data subject requests, VIP meeting reassignments, sponsor entitlement downgrades). The subsystem exists for three reasons: regulatory (7-year retention for FMF-class events driven by Saudi NDMO data residency, GDPR, and diplomatic audit requirements), forensic (every break-glass action and privileged operation must be reconstructable with actor, action, approver, prior state, new state, and timestamp), and operational (auditors and the ED must be able to declare an "audit freeze" that locks the log from any modification while a regulatory inquiry is active). Without this subsystem, a single GDPR "right to be forgotten" request post-event could not be honored without destroying the audit chain, and a post-event inquiry into a protocol breach could not be reconstructed.

The subsystem is the write-side owner of the `audit.*` Kafka topic prefix per the Module 0.1 bounded context table (extended; the audit context is a cross-cutting concern that consumes from all other contexts). It publishes `audit.event.recorded`, `audit.export.completed`, `audit.freeze.declared`, `audit.freeze.lifted`, `audit.gdpr.request_received`, `audit.gdpr.deletion_completed`, `audit.gdpr.deletion_rejected`, `audit.break_glass.flagged`, and `audit.retention.policy_applied`. It subscribes to all `*.*.created`, `*.*.updated`, `*.*.deleted`, `*.*.cancelled`, `*.*.approved`, and `*.*.break_glass_invoked` events across all 12 bounded contexts (Master Dashboard, VIP & Protocol, Matchmaking, Content & Stage, Commercial, Registration, Mobile App, Ops & Logistics, Finance, Marketing & PR, ESG, and Analytics). Its non-negotiable contract is that the audit log is append-only, immutable post-write (with cryptographic chaining via SHA-256 hash of the prior event), 7-year retained, and exportable in three formats (CSV, JSON-LD for forensic tools, PDF for human-readable summaries) within 24 hours of any auditor request.

### B. User Roles & Permissions

- **Event Director (ED):** Read on the full audit log. Write only via break-glass on declaring an "audit freeze" (locks the log from any modification, including retention-policy-driven deletion, until the freeze is lifted) and on lifting the freeze (requires CFO co-sign if the freeze was active for more than 30 days).
- **Operations Lead (OL):** No direct access to the audit log. Reads only via the OL's incident timeline view (Module 1.2) which surfaces a filtered subset of audit events related to the OL's departmental scope.
- **Protocol Officer (PO):** No direct access except via subpoena or regulatory inquiry; audit reads are mediated by the FAL.
- **VIP Liaison (VL):** No direct access.
- **Registration Manager (RM):** No direct access except via the GDPR request workflow (RM initiates "right to be forgotten" requests for attendees).
- **Sponsorship Sales Lead (SSL):** No direct access.
- **Exhibitor Portal User (EPU):** No direct access; GDPR data subject access requests from exhibitors are mediated by the FAL.
- **Content & Stage Manager (CSM):** No direct access.
- **Matchmaking Concierge (MC):** No direct access.
- **Finance & Administration Lead (FAL):** Primary owner. Read on the full audit log. Write on export (CSV, JSON-LD, PDF), on GDPR request adjudication (approve or reject "right to be forgotten" requests), on retention policy enforcement, and on surfacing break-glass audit events to the ED for remediation.
- **Marketing & PR Lead (MPL):** No direct access.
- **ESG & Sustainability Officer (ESGO):** Read-only on ESG-tagged audit events (e.g., carbon footprint calculations, supplier diversity scoring).
- **Field Volunteer (FV):** No direct access.
- **Attendee (ATT):** No direct access except via the GDPR "right to be forgotten" self-service portal (initiates a request that flows to the FAL for adjudication).
- **External Auditor (read-only role, not in the standard 14 personas):** Read-only access to the audit log for the duration of an audit engagement, scoped to a specific date range and event; access expires automatically at the engagement end date; all auditor reads are themselves audited.

### C. Data Model

`audit_event` (the append-only event record; extends shared columns where applicable):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id (the FMF event, not the audit event) |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC (same as created_at for immutable events) |
| `created_by` | `uuid` | Actor (user or service account) |
| `updated_by` | `uuid` | Same as created_by |
| `version` | `int` | Always 1 (immutable) |
| `deleted_at` | `timestamptz null` | Always null (audit events are never soft-deleted) |
| `ext_refs` | `jsonb` | e.g., `{cloudtrail_event_id, splunk_index_id, service_now_grc_ref}` |
| `audit_log` | `jsonb[]` | Meta-audit: who exported this event, when |
| `event_type` | `enum[created, updated, deleted, cancelled, approved, rejected, break_glass_invoked, break_glass_approved, break_glass_revoked, freeze_declared, freeze_lifted, gdpr_request_received, gdpr_deletion_completed, gdpr_deletion_rejected, retention_policy_applied, export_completed, login, logout, permission_granted, permission_revoked, fx_rate_override, manual_gl_posting, voice_print_logged]` | |
| `source_context` | `text` | e.g., "finance", "vip_protocol", "registration", "ops_logistics" |
| `source_topic` | `text` | Kafka topic, e.g., "supplier.po.issued" |
| `source_partition` | `int` | Kafka partition |
| `source_offset` | `bigint` | Kafka offset |
| `actor_id` | `uuid` | User or service account ID |
| `actor_role` | `text` | e.g., "FAL", "ED", "OL", "service_account" |
| `actor_ip_address` | `inet null` | If applicable (e.g., web actions) |
| `actor_user_agent` | `text null` | If applicable |
| `actor_device_id` | `uuid null` | If from Staff App / Attendee App (Module 7.2 / 7.1) |
| `actor_geopoint` | `jsonb null` | `{lat, lon}` if geolocation available |
| `target_entity_type` | `text` | e.g., "purchase_order", "registration", "dignitary_profile" |
| `target_entity_id` | `uuid` | FK to the affected entity (logical FK, not enforced) |
| `target_tenant_id` | `uuid null` | For cross-tenant operations |
| `target_event_id` | `uuid` | FMF event ID |
| `prior_state` | `jsonb null` | Full or delta snapshot before mutation |
| `new_state` | `jsonb null` | Full or delta snapshot after mutation |
| `state_diff` | `jsonb null` | Computed diff for human-readable display |
| `approver_id` | `uuid null` | If break-glass or co-approval was required |
| `approver_role` | `text null` | e.g., "FAL", "ED", "CFO" |
| `approval_tier` | `enum[none, tier1_fal, tier2_fal_ed, tier3_fal_ed_cfo, custom]` | Per Module 9.1 thresholds |
| `justification` | `text null` | Free text for break-glass actions |
| `break_glass` | `bool` | True if this event was a break-glass action |
| `break_glass_id` | `uuid null` | FK -> break_glass_session.id if applicable |
| `hash_prev` | `text` | SHA-256 hash of the prior audit_event in the chain (cryptographic chaining) |
| `hash_self` | `text` | SHA-256 hash of this event's canonical JSON (excluding hash_self) |
| `retention_until` | `timestamptz` | Default now() + 7 years for FMF-class events |
| `freeze_status` | `enum[active, frozen]` | Set to `frozen` if a freeze is declared |
| `freeze_id` | `uuid null` | FK -> audit_freeze.id if applicable |
| `gdpr_request_id` | `uuid null` | FK -> gdpr_request.id if this event is part of a GDPR workflow |

`gdpr_request` (GDPR data subject requests; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ATT (self-service) or RM (on behalf) |
| `updated_by` | `uuid` | FAL or auto-service |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete (the request record itself; never the audit events) |
| `ext_refs` | `jsonb` | e.g., `{service_now_gdpr_ticket_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `request_type` | `enum[right_to_access, right_to_be_forgotten, right_to_rectification, right_to_portability, right_to_object]` | |
| `data_subject_type` | `enum[attendee, speaker, sponsor_contact, exhibitor_contact, staff, supplier_contact]` | |
| `data_subject_id` | `uuid` | FK -> the subject's record (e.g., registration.id) |
| `data_subject_email` | `text` | Verified email |
| `data_subject_pii_fields` | `jsonb` | e.g., `{name, email, phone, nationality, passport_last_4, dietary, photo_url, biometric_template_id}` |
| `request_payload` | `jsonb` | Free-form details of the request |
| `request_status` | `enum[submitted, identity_verified, in_review, approved, rejected, completed, cancelled]` | |
| `identity_verified_at` | `timestamptz null` | |
| `identity_verified_by` | `uuid null` | FAL or auto (ID document check) |
| `adjudicated_by` | `uuid null` | FAL |
| `adjudicated_at` | `timestamptz null` | |
| `adjudication_notes` | `text null` | e.g., "Retained meeting participation record per diplomatic audit requirement" |
| `retention_overrides` | `jsonb[]` | e.g., `[{field: "meeting_participation_count", retention_until: "2032-01-01", reason: "diplomatic_audit"}]` |
| `deletion_completed_at` | `timestamptz null` | |
| `completion_summary` | `jsonb null` | e.g., `{pii_fields_deleted: 8, aggregate_records_preserved: 3, audit_event_id_recorded}` |
| `legal_basis_for_retention` | `text null` | If rejection, e.g., "Saudi NDMO Article 18 retention" |

`audit_freeze` (when the ED declares an audit freeze; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ED |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{service_now_grc_investigation_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `declared_by` | `uuid` | ED |
| `declared_at` | `timestamptz` | |
| `reason` | `text` | e.g., "Regulatory inquiry from Saudi NDMO", "Post-event diplomatic audit" |
| `scope` | `enum[full_event, specific_context, specific_date_range, specific_entity]` | |
| `scope_filter` | `jsonb null` | e.g., `{context: "vip_protocol", date_range: ["2025-01-10", "2025-01-15"]}` |
| `status` | `enum[active, lifted]` | |
| `lifted_by` | `uuid null` | ED |
| `lifted_at` | `timestamptz null` | |
| `lifted_approver` | `uuid null` | CFO if active > 30 days |
| `affected_event_count` | `int` | Count of audit_events with `freeze_status = frozen` under this freeze |

`audit_export` (each export job; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | FAL or External Auditor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{s3_export_url, splunk_index_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `requested_by` | `uuid` | FAL or External Auditor |
| `requested_at` | `timestamptz` | |
| `scope_filter` | `jsonb` | e.g., `{date_range: [...], context: "finance", actor_id: "..."}` |
| `export_format` | `enum[csv, json_ld, pdf_summary]` | |
| `record_count` | `int` | Number of audit events in the export |
| `file_size_mb` | `numeric(10,2)` | |
| `s3_url` | `text` | Pre-signed URL with 24-hour TTL |
| `completed_at` | `timestamptz null` | |
| `completed_by` | `uuid null` | Integration Hub service |
| `delivery_method` | `enum[secure_download, sftp, splunk_push]` | |
| `delivery_status` | `enum[pending, completed, failed, expired]` | |

### D. Business Logic & Edge Cases

- **IF** any state-changing event is published on any Kafka topic across all 12 bounded contexts (e.g., `supplier.po.issued`, `registration.confirmed`, `dignitary_profile.rank_changed`, `sponsor_deal.entitlements_downgraded`), **THEN** the audit consumer service writes an `audit_event` with `event_type` mapped from the source event, `prior_state` and `new_state` captured from the event payload, `actor_id` and `actor_role` extracted from the event headers, and the cryptographic chain updated (`hash_prev` = prior event's `hash_self`, `hash_self` = SHA-256 of this event's canonical JSON).
- **IF** a break-glass action is invoked (e.g., ED + FAL co-sign to override a budget line block per Module 9.1, ED + FAL + ESGO co-sign for emergency vendor onboarding per Module 8.2), **THEN** the audit event records `break_glass = true`, `break_glass_id` references the break-glass session, `approver_id` and `approver_role` are populated for each co-signer, and `justification` is captured as free text; the event is flagged for the ED's morning review queue.
- **IF** an ED declares an audit freeze (via `audit_freeze.declared`), **THEN** all `audit_event` records within the freeze scope have `freeze_status` set to `frozen`, retention policy deletion is suspended for frozen events, and any attempt to modify a frozen event (e.g., GDPR deletion) is blocked with `AUDIT_EVENT_FROZEN` error; the freeze can only be lifted by the ED with CFO co-sign if the freeze has been active for more than 30 days.
- **IF** a GDPR "right to be forgotten" request is received (via self-service portal from ATT or via RM on behalf), **THEN** the engine creates a `gdpr_request` with `request_type = right_to_be_forgotten`, `request_status = submitted`, identity verification is required (ID document upload with LLM-assisted OCR via the Integration Hub), and on verification the FAL adjudicates within 30 days per GDPR Article 17.
- **IF** the FAL approves a "right to be forgotten" request, **THEN** the engine deletes PII fields from the subject's records (e.g., `registration.name`, `registration.email`, `registration.passport_last_4`, `attendee.photo_url`, `biometric_template`), preserves anonymized aggregate data (e.g., `meeting_participation_count`, `scan_events_count` with identity stripped, `dietary_category` without name), records a `gdpr_deletion_completed` audit event with `completion_summary` listing the deleted fields and preserved aggregates, and the deletion is reflected in the source system within 24 hours.
- **IF** the FAL rejects a "right to be forgotten" request (e.g., because the subject participated in diplomatic meetings that are under a 7-year retention requirement per Saudi NDMO), **THEN** the engine records a `gdpr_deletion_rejected` audit event with `legal_basis_for_retention` populated, the subject is notified via SendGrid email with the legal basis cited, and the subject has the right to escalate to the supervisory authority.
- **IF** an audit finds that a break-glass action was taken without proper authorization (e.g., the ED's morning review queue surfaces a break-glass action where the co-signer was the same person as the actor, violating two-person rule), **THEN** the engine publishes `audit.break_glass.flagged` with `severity = s2`, surfaces the audit event to the ED with full context (actor, action, approver, prior state, new state, justification, timestamp), the ED can require remediation (e.g., re-train the actor, revoke specific permissions, escalate to legal review), and the remediation action itself is audited.
- **IF** the 7-year retention period elapses for an audit event, **THEN** the retention policy engine publishes `audit.retention.policy_applied`, the event is securely deleted (cryptographic erasure of the underlying storage), and a meta-audit event records the deletion timestamp and the cryptographic attestation; frozen events are exempt from deletion until the freeze is lifted.

**Edge case (non-obvious): GDPR "right to be forgotten" arrives post-event for an attendee who participated in meetings and was scanned.** On T+45 days post-event, an attendee (Dr. M.) submits a "right to be forgotten" request via the self-service portal, requesting deletion of all her PII. The engine creates a `gdpr_request` with `request_type = right_to_be_forgotten` and `data_subject_id` pointing to Dr. M.'s `registration.id`. Dr. M. uploads her ID document for verification; the Integration Hub's LLM-assisted OCR (per the Module 8.2 vendor portal pattern) verifies her identity against the registration record within 4 hours. The FAL's adjudication queue receives the request with a full data inventory: `data_subject_pii_fields` lists 14 PII fields (name, email, phone, nationality, passport_last_4, dietary, photo_url, biometric_template_id, employer, title, meeting preferences, etc.). The FAL's review screen surfaces that Dr. M. participated in 7 B2B meetings (Module 3.1-3.4) and was scanned at 23 access points (Module 6.2), and that her participation in 2 of those meetings was with protocol_rank 1-2 dignitaries (per Module 2.1). The engine's compliance check determines: (a) the 2 meetings with protocol_rank 1-2 dignitaries are under a 7-year retention requirement per Saudi NDMO Article 18 for diplomatic audit; (b) the other 5 meetings, the 23 scans, and all 14 PII fields are eligible for deletion; (c) aggregate counts of meetings and scans must be preserved (anonymized) for the event's analytics (Module 12.2). The FAL approves partial deletion with `retention_overrides` listing the 2 retained meeting records with `retention_until = "2032-01-15"` and `reason = "diplomatic_audit"`. The engine deletes the 14 PII fields from Dr. M.'s records (across all 12 bounded contexts), preserves the 2 meeting records with the dignitary references but strips Dr. M.'s identity (replaced with `anonymized_subject_id`), preserves aggregate counts (`meeting_participation_count = 7`, `scan_events_count = 23` with no identity linkage), records a `gdpr_deletion_completed` audit event with `completion_summary = {pii_fields_deleted: 14, aggregate_records_preserved: 3, retained_meetings_with_anonymized_identity: 2, retention_overrides: 2}`. Dr. M. is notified via SendGrid email that her request was partially completed: 14 PII fields deleted, 2 meeting records retained under diplomatic audit legal basis with identity anonymized, aggregate counts preserved without identity linkage. The deletion propagates across all 12 bounded contexts within 24 hours (per context's own GDPR consumer service). The audit trail records the entire workflow: the request, the identity verification, the FAL's adjudication, the deletion actions across each context, the retention overrides, and the notification to Dr. M. If Dr. M. escalates, the supervisory authority can request a full audit export via the FAL.

**Edge case (non-obvious): audit finds break-glass action taken without proper authorization.** During the post-event internal audit on T+30 days, the FAL runs a "break-glass review" report in the compliance dashboard, filtering `audit_event.break_glass = true` for the event period. The report surfaces an anomaly: at 14:32 on Day 2, a break-glass action was invoked to override a `budget_line.blocked` status (per Module 9.1) with `actor_id = FAL_xxx` and `approver_id = FAL_xxx` (same person). The two-person rule was violated: the FAL self-approved their own break-glass action. The engine's compliance check (running nightly) detected the violation and published `audit.break_glass.flagged` with `severity = s2`. The ED's morning review queue on T+30 surfaces the flagged audit event with full context: `actor_id` and `actor_role` (FAL), `approver_id` and `approver_role` (FAL, same person), `target_entity_type = "budget_line"`, `target_entity_id`, `prior_state = {block_status: "hard_blocked"}`, `new_state = {block_status: "override_released"}`, `justification = "Emergency caterer substitution for VIP reception"`, `approval_tier = tier1_fal` (which the FAL self-approved). The ED's review modal offers four remediation paths: (1) acknowledge and document (the ED records a note that the action was necessary but the two-person rule was violated; the FAL is required to complete a refresher training on break-glass protocols within 14 days; the remediation action itself is audited); (2) revoke the override (the engine reverts `budget_line.block_status` to `hard_blocked` and the FAL must re-take the action with proper ED co-sign; this may cause downstream reconciliation issues with the caterer's PO); (3) escalate to legal review (if the action's financial impact exceeds US$ 50K or if there's a pattern of similar violations by the same actor); (4) refer to the audit committee for formal remediation plan (used for repeat violations or material financial impact). The ED selects path (1) with a documented note, the FAL is enrolled in refresher training (tracked in Workday Learning), and the remediation action is recorded as a new audit event (`event_type = break_glass_revoked` is not applicable here; instead a `break_glass_approved` audit event with `actor_id = ED` and `approver_id = ED` is recorded documenting the post-hoc review and remediation). The pattern of break-glass violations is tracked across events; if the same actor accumulates 3+ violations within a 12-month period, the ED's review modal auto-escalates to path (4) and notifies the audit committee.

### E. Third-Party Integrations

- **AWS CloudTrail (infrastructure-level audit):** All AWS API calls (e.g., S3 reads/writes of audit_event exports, KMS key usage for envelope encryption per Module 02, IAM role assumption by service accounts) are captured by CloudTrail and mirrored to the `audit_event` table via the Integration Hub's CloudTrail-to-Kafka consumer. Data flow: AWS CloudTrail -> S3 bucket -> Lambda consumer -> Integration Hub -> `audit_event` records with `source_context = "infrastructure"`.
- **AWS Config (configuration drift detection):** Configuration changes to AWS resources (e.g., S3 bucket policy changes, KMS key policy changes, IAM policy changes) are captured by AWS Config and mirrored as `audit_event` records with `event_type = updated` and `source_context = "infrastructure_config"`. Data flow: AWS Config -> SNS -> Integration Hub -> `audit_event`.
- **ServiceNow GRC or MetricStream (external GRC tools):** Compliance officers use external GRC tools for cross-event compliance management. The Integration Hub exposes a standard export API (REST + SFTP) that GRC tools poll for new audit events matching their scope filters. Data flow: FMF -> Integration Hub -> ServiceNow GRC / MetricStream via REST API or scheduled SFTP export; remediation actions from GRC tools -> Integration Hub -> FMF (e.g., a remediation plan created in ServiceNow GRC is mirrored to the FMF audit trail as a new audit event).
- **Splunk or OpenSearch (log search and SIEM):** All `audit_event` records are streamed in near real time to Splunk (via HEC) or OpenSearch (via the bulk API) for forensic search, anomaly detection (e.g., the break-glass two-person rule violation pattern), and correlation with security events. Data flow: FMF -> Integration Hub -> Splunk HEC / OpenSearch; Splunk alert -> PagerDuty -> FAL/ED on anomaly detection.
- **W3C JSON-LD forensic export format:** When an auditor requests an export in JSON-LD, the Integration Hub serializes each `audit_event` as a W3C JSON-LD node with a defined vocabulary (`@context` pointing to the FMF audit ontology), enabling ingestion into standard forensic tools like EnCase, FTK, or open-source alternatives like TheHive.
- **SendGrid (GDPR request notifications):** The data subject is notified via SendGrid templated emails at each stage of the GDPR workflow (request received, identity verified, request adjudicated, deletion completed/rejected). Data flow: FMF -> Integration Hub -> SendGrid API.
- **Workday Learning (break-glass remediation training):** When the ED enrolls the FAL in refresher training per the break-glass violation remediation, the Integration Hub creates a Workday Learning course assignment via the Workday REST API. Data flow: FMF -> Integration Hub -> Workday Learning; completion webhook -> Integration Hub -> audit_event with `event_type = updated` recording the training completion.
- **Kafka topics:** Publishes `audit.*` (full list above). Subscribes to all `*.*.created`, `*.*.updated`, `*.*.deleted`, `*.*.cancelled`, `*.*.approved`, `*.*.break_glass_invoked` events across all 12 bounded contexts (a wildcard subscription pattern).

### F. UI/UX Notes

The FAL's primary screen is a four-panel layout. Top-left: a date-range and context filter panel (filters by date range, source_context, actor_role, event_type, break_glass flag, freeze status). Top-right: the filtered audit event timeline, each event rendered as a horizontal card showing timestamp, actor, action, target entity, and a colored severity chip (green = routine, amber = break-glass, red = violation-flagged). Clicking a card expands the `prior_state` -> `new_state` diff in a side drawer with syntax-highlighted JSON. Bottom-left: the GDPR request queue showing pending, in-review, and recently-completed requests with the data inventory and adjudication modal. Bottom-right: the audit freeze management panel showing active freezes with scope, reason, declared_by, and lift action (with CFO co-sign modal if freeze > 30 days).

The ED's view adds a "Morning Break-Glass Review" queue at the top showing all `break_glass = true` events from the prior 24 hours with one-tap approve-and-document or escalate-to-legal actions. The External Auditor's view is read-only with a scoped filter (date range, context, target entity types) and a "Request Export" button that triggers the export workflow with format selection (CSV, JSON-LD, PDF summary). The compliance dashboard (a Power BI report consuming the `audit_event` table via the Module 9.1 Power BI integration) shows trend charts of break-glass invocations, GDPR request volumes, and freeze declarations across events.

### G. Failure Modes & Offline Behavior

- **Kafka audit consumer lag:** If the audit consumer falls behind (e.g., a burst of registration scans during peak check-in), the Integration Hub alerts the FAL with "Audit Consumer Lag: N seconds behind"; the audit log remains eventually-consistent and the lag does not affect source-system operations.
- **AWS CloudTrail delivery delay (typically 5-15 minutes):** Infrastructure-level audit events may lag application-level events; the FAL's view shows a "CloudTrail Sync Pending" indicator if lag exceeds 30 minutes.
- **Splunk HEC outage:** Audit events are queued in the Integration Hub with a 7-day TTL; Splunk backfill is automatic when HEC returns; the FAL sees a "Splunk Sync Delayed: N events queued" banner.
- **ServiceNow GRC export API outage:** Exports are queued with a 72-hour TTL; the GRC tool can also pull via SFTP as a fallback.
- **GDPR request identity verification failure (OCR misread):** The Integration Hub retries with a manual review fallback; the FAL can manually verify the ID document and mark `identity_verified = true` with a documented note in `audit_log`.
- **Audit freeze lift attempt without proper authorization (e.g., the ED attempts to lift a >30-day freeze without CFO co-sign):** The engine blocks with `AUDIT_FREEZE_LIFT_REQUIRES_CFO_COSIGN` error and surfaces a DocuSign envelope to the CFO.
- **Cryptographic chain break (e.g., a `hash_prev` does not match the prior event's `hash_self`):** The engine detects the break on the next event write, blocks all subsequent writes with `AUDIT_CHAIN_BROKEN`, pages the FAL and ED via PagerDuty, and the breach triggers a forensic investigation per the incident response plan (Module 1.2).
- **Retention policy engine attempts to delete a frozen event:** Blocked with `AUDIT_EVENT_FROZEN` error; the deletion is queued for after the freeze is lifted.

### H. Acceptance Criteria

- **Given** a state-changing event `supplier.po.issued` published on the `po.*` Kafka topic, **When** the audit consumer service processes the event, **Then** an `audit_event` record is written with `event_type = created`, `source_topic = "supplier.po.issued"`, `actor_id` and `actor_role` extracted from the event headers, `prior_state` and `new_state` captured, `hash_prev` set to the prior event's `hash_self`, `hash_self` computed as SHA-256 of the canonical JSON, and `retention_until` set to `now() + 7 years`, within 5 seconds of the source event.
- **Given** an attendee Dr. M. who participated in 7 B2B meetings (2 with protocol_rank 1-2 dignitaries) and was scanned at 23 access points submits a GDPR "right to be forgotten" request on T+45, **When** the FAL adjudicates and approves partial deletion, **Then** the engine deletes the 14 PII fields from Dr. M.'s records across all 12 bounded contexts, preserves the 2 meeting records with protocol_rank 1-2 dignitaries with `retention_until = "2032-01-15"` and `reason = "diplomatic_audit"` with identity replaced by `anonymized_subject_id`, preserves aggregate counts (`meeting_participation_count = 7`, `scan_events_count = 23`) without identity linkage, records a `gdpr_deletion_completed` audit event with `completion_summary`, notifies Dr. M. via SendGrid email of the partial completion, and the deletion propagates across all 12 contexts within 24 hours.
- **Given** a break-glass action invoked at 14:32 on Day 2 with `actor_id = FAL_xxx` and `approver_id = FAL_xxx` (same person, two-person rule violated), **When** the nightly compliance check runs, **Then** the engine publishes `audit.break_glass.flagged` with `severity = s2`, surfaces the flagged event to the ED's morning review queue on T+30 with full context (actor, action, approver, prior state, new state, justification), and the ED's review modal offers four remediation paths (acknowledge and document, revoke the override, escalate to legal, refer to audit committee).
- **Given** an active `audit_freeze` declared by the ED with `scope = full_event`, **When** the retention policy engine attempts to delete an audit_event under the freeze scope, **Then** the deletion is blocked with `AUDIT_EVENT_FROZEN` error, the event retains `freeze_status = frozen`, and the deletion is queued for after the freeze is lifted (which requires ED action with CFO co-sign if the freeze has been active for more than 30 days).
- **Given** an auditor requests an export of all `audit_event` records for the Finance context between T-180 and T+30 in JSON-LD format, **When** the FAL initiates the export job, **Then** the Integration Hub serializes each event as a W3C JSON-LD node with `@context` pointing to the FMF audit ontology, uploads the file to S3 with a pre-signed URL (24-hour TTL), records an `audit_export` record with `record_count`, `file_size_mb`, `s3_url`, and `completed_at`, and the FAL (or External Auditor with scoped access) can download the export within 24 hours.
