> Module 8: Operations, Logistics & F&B Management -> 8.2 Supplier & Vendor Management

## Supplier & Vendor Management

### A. Purpose Statement

The Supplier & Vendor Management subsystem is the authoritative registry, procurement workflow, compliance monitor, and performance ledger for every external company that provides goods or services to the Future Minerals Forum. At FMF scale this covers 300+ vendors across categories (catering, AV, security, transport, florists, cleaning, signage, translation, medical, waste handling, rigging, power generation), with combined contract value exceeding US$ 18M and a procurement cycle that begins 9 months before the event and closes 60 days after. A single lapsed insurance certificate on a security vendor two weeks before the event can ground the VIP motorcade program; a vendor delivering 80 of 100 promised microphones can shutter a breakout track. This subsystem exists so that vendor risk is codified, contractually enforced, and continuously verified.

The subsystem is the write-side owner of the `supplier.*` Kafka topic prefix per the Module 0.1 bounded context table. It publishes `supplier.registered`, `supplier.rfq.published`, `supplier.proposal.received`, `supplier.contract.signed`, `supplier.po.issued`, `supplier.delivery.confirmed`, `supplier.delivery.shortfall`, `supplier.compliance.flagged`, `supplier.compliance.restored`, `supplier.invoice.received`, `supplier.payment.released`, and `supplier.rating.submitted`. It subscribes to `resource.inventory.adjusted` (Module 8.1) to auto-trigger replenishment RFQs, to `fnb.event.confirmed` (Module 8.3) to auto-link caterer POs, to `transport.fleet.audit` (Module 8.4) to validate transport vendor compliance, and to `budget.allocation.confirmed` (Module 9.1) to gate PO issuance against approved budget lines. Its non-negotiable contract is that no PO may be issued against a vendor whose compliance status is not "current" and that every payment has a traceable chain from RFQ to contract to PO to delivery to invoice to GL posting.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all suppliers, contracts, POs, payments. Write only via break-glass on emergency vendor onboarding (e.g., a last-minute replacement vendor for a defaulted supplier), with two-person approval (ED + FAL).
- **Operations Lead (OL):** Primary operator. Read/write on supplier registry, RFQ authoring, proposal evaluation, contract approval (up to US$ 50K threshold; above requires FAL co-approval), PO issuance, delivery acceptance, and performance rating input. Can override a compliance block via break-glass with documented justification.
- **Protocol Officer (PO):** Read-only on vendors tagged `protocol_sensitive` (e.g., VIP transport, dignitary catering). Write only on protocol-specific compliance overrides (e.g., waiving a 30-day insurance lead for a foreign government-provided security detail).
- **VIP Liaison (VL):** Read-only on the assigned dignitary's transport and catering vendor assignments. No write.
- **Registration Manager (RM):** No direct access. Sees only "supplier confirmed" flags for badge printing vendors.
- **Sponsorship Sales Lead (SSL):** Read on sponsor- mandated vendors (e.g., a sponsor's preferred AV partner for their booth). Write only on sponsor-vendor matching proposals, subject to OL approval.
- **Exhibitor Portal User (EPU):** Read-only mirror of their own company's supplier profile (if they are also a vendor, e.g., a sponsor providing catering demos). No write on procurement records.
- **Content & Stage Manager (CSM):** Read on AV and staging vendor contacts and stage-hand rosters. Write only on delivery-timing confirmations for stage equipment.
- **Matchmaking Concierge (MC):** No direct access.
- **Finance & Administration Lead (FAL):** Read on all financial flows. Write on contract approval above OL's US$ 50K threshold, invoice approval, payment release, and GL posting codes. The FAL is the secondary approver for all vendor onboarding and replacement break-glass actions.
- **Marketing & PR Lead (MPL):** Read-only on signage, print, and brand-experience vendors. No write.
- **ESG & Sustainability Officer (ESGO):** Heavy user. Read/write on vendor ESG attributes: diversity flags (women-owned, minority-owned, SME, local-content percentage), sustainability certifications (ISO 14001, B-Corp), carbon footprint per service. Write on ESG scoring rubric and on the supplier diversity target configuration.
- **Field Volunteer (FV):** Read on assigned delivery acceptance tasks (e.g., accept a floral delivery at the VIP entrance) via Staff App (Module 7.2). No write on procurement.
- **Attendee (ATT):** No access.

### C. Data Model

`supplier` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL or ESGO |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{coupa_supplier_id, sap_vendor_id, avetta_id, duns_number, tax_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `legal_name` | `text` | Full registered name |
| `trading_name` | `text null` | If different |
| `country_of_incorporation` | `char(2)` | ISO 3166-1 alpha-2 |
| `primary_contact_id` | `uuid` | FK -> supplier_contact.id |
| `category_tags` | `text[]` | e.g., `["catering", "av", "security", "transport", "florist", "cleaning", "signage", "translation", "medical", "waste", "rigging", "power"]` |
| `capability_summary` | `jsonb` | e.g., `{max_simultaneous_covers: 5000, languages_supported: ["ar","en","fr","zh"], equipment_owned: ["led_wall_6m", "projectors_4k: 12"]}` |
| `insurance_status` | `enum[current, expiring_30d, expiring_7d, lapsed, not_on_file]` | Computed from `insurance_certificate.expiry_date` |
| `compliance_status` | `enum[compliant, non_compliant, remediation, blocked]` | Aggregated from insurance, safety records, payment terms |
| `payment_terms` | `enum[net_15, net_30, net_60, net_90, payment_on_delivery, milestone]` | Default per contract |
| `diversity_flags` | `jsonb` | e.g., `{women_owned: true, minority_owned: false, sme: true, local_content_pct: 35.0}` |
| `esg_certifications` | `text[]` | e.g., `["iso_14001", "b_corp", "iso_45001"]` |
| `esg_score` | `numeric(5,2)` | 0-100, computed from rubric maintained by ESGO |
| `preferred_vendor` | `bool` | Carries forward across events |
| `blacklisted` | `bool` | Default false; set true only via break-glass with ED + FAL + ESGO co-approval |
| `preferred_contact_method` | `enum[email, phone, portal]` | Used by Integration Hub for notifications |

`procurement_record` (extends shared columns; covers the RFQ -> proposal -> contract -> PO -> delivery -> invoice -> payment lifecycle):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL or auto-service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{coupa_po_id, docusign_envelope_id, workday_invoice_id, stripe_charge_id, sap_ariba_project_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `supplier_id` | `uuid` | FK -> supplier.id |
| `budget_line_id` | `uuid` | FK -> budget_line.id (Module 9.1) |
| `stage` | `enum[rfq_draft, rfq_published, proposal_received, evaluation, contract_pending, contract_signed, po_issued, in_delivery, delivery_confirmed, delivery_shortfall, invoice_received, invoice_approved, payment_released, closed, cancelled]` | Lifecycle |
| `stage_history` | `jsonb[]` | `[{stage, actor_id, timestamp, notes}]` for audit |
| `line_items` | `jsonb[]` | `[{sku, description, qty_contracted, qty_delivered, unit_price_usd, currency}]` |
| `total_contract_value_usd` | `numeric(12,2)` | Aggregated from line_items |
| `total_invoiced_usd` | `numeric(12,2)` | Aggregated from received invoices |
| `total_paid_usd` | `numeric(12,2)` | Aggregated from released payments |
| `currency` | `char(3)` | ISO 4217 |
| `contract_signed_at` | `timestamptz null` | From DocuSign webhook |
| `po_issued_at` | `timestamptz null` | |
| `expected_delivery_at` | `timestamptz null` | |
| `actual_delivery_at` | `timestamptz null` | |
| `shortfall_qty` | `numeric(10,2) null` | If delivered < contracted |
| `shortfall_penalty_usd` | `numeric(10,2) null` | Computed from contract penalty clause |
| `gl_posting_code` | `text null` | Workday Financials cost center |

`vendor_compliance_item` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL or auto-ingest |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{avetta_cert_id, complyworks_doc_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `supplier_id` | `uuid` | FK -> supplier.id |
| `compliance_type` | `enum[insurance_general_liability, insurance_workers_comp, insurance_vehicles, health_safety_record, iso_9001, iso_14001, iso_45001, food_hygiene, security_license, transport_license, diversity_cert, other]` | |
| `certificate_number` | `text` | Issuer-provided |
| `issuer` | `text` | e.g., "Lloyd's of London", "Saudi Central Bank", "Avetta" |
| `issue_date` | `date` | |
| `expiry_date` | `date` | Drives `supplier.insurance_status` computation |
| `document_url` | `text` | Encrypted S3 link; TTL 7 years for legal hold |
| `verification_status` | `enum[verified, pending, failed, expired]` | From ComplyWorks / Avetta webhook |
| `verified_at` | `timestamptz null` | |
| `remediation_deadline` | `timestamptz null` | If non-compliant, when supplier must restore by |

`vendor_rating` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL (post-event) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{linked_procurement_ids: [...]}` |
| `audit_log` | `jsonb[]` | Append-only |
| `supplier_id` | `uuid` | FK -> supplier.id |
| `quality_score` | `numeric(3,1)` | 0.0-5.0 |
| `timeliness_score` | `numeric(3,1)` | 0.0-5.0 |
| `cost_score` | `numeric(3,1)` | 0.0-5.0 |
| `esg_score` | `numeric(3,1)` | 0.0-5.0 |
| `overall_score` | `numeric(3,1)` | Weighted average; weights configurable per event |
| `narrative` | `text null` | Free-text qualitative feedback |
| `would_use_again` | `bool` | |
| `is_blocker_for_future` | `bool` | If true, supplier cannot be selected for future events without ED override |

### D. Business Logic & Edge Cases

- **IF** a `supplier` record is created without an `insurance_status = current` certificate on file, **THEN** the supplier's `compliance_status` is set to `non_compliant`, no PO may be issued, and the OL and FAL are notified via in-app alert.
- **IF** a `vendor_compliance_item.expiry_date` is within 30 days of the current date, **THEN** the supplier's `insurance_status` transitions to `expiring_30d`, a `supplier.compliance.flagged` event is published, and an automated reminder is sent to the supplier's primary contact via email + portal notification; if within 7 days, the status transitions to `expiring_7d` and the alert escalates to OL + FAL + ESGO.
- **IF** a `vendor_compliance_item.expiry_date` has passed, **THEN** the supplier's `insurance_status` becomes `lapsed`, `compliance_status` becomes `blocked`, any open PO in `stage = po_issued` or `in_delivery` is flagged for OL review, and new POs are blocked at the application layer with a "Vendor Non-Compliant" error naming the lapsed certificate.
- **IF** a delivery is recorded with `qty_delivered < qty_contracted` for any line item, **THEN** the engine computes `shortfall_qty`, computes `shortfall_penalty_usd` from the contract's penalty clause (default: 10% of the shortfall line value, configurable per contract), publishes `supplier.delivery.shortfall`, and adjusts the expected `total_invoiced_usd` accordingly; the OL must explicitly confirm acceptance of the partial delivery.
- **IF** a contract value exceeds US$ 50,000, **THEN** the OL cannot self-approve the contract; the FAL must co-approve before `stage` advances from `contract_pending` to `contract_signed`.
- **IF** a vendor is selected for procurement whose `overall_score` from the prior event is below 3.0 OR `is_blocker_for_future = true`, **THEN** the RFQ draft is flagged with a "Prior Performance Warning" and requires ED co-approval before `stage = rfq_published`.
- **IF** ESGO updates the ESG scoring rubric (e.g., raising the weight of `local_content_pct` from 20% to 35%), **THEN** all `supplier.esg_score` values are recomputed within 60 seconds and the change is recorded in `audit_log` with the rubric diff.
- **IF** a sponsor mandates a specific vendor (e.g., Sponsor A requires AV Company X for their booth), **THEN** SSL records the sponsor-vendor match; the OL still must validate compliance before PO issuance; if compliance fails, SSL is notified with the option to either remediate the vendor with the sponsor or propose an alternative.

**Edge case (non-obvious): vendor insurance lapses 2 weeks before event.** At T-14 days, the Integration Hub receives a ComplyWorks webhook indicating that the contracted security vendor's general liability insurance expired yesterday (the vendor's broker failed to renew on time). The engine immediately transitions `vendor_compliance_item.verification_status` to `expired`, recomputes `supplier.insurance_status = lapsed` and `supplier.compliance_status = blocked`, and publishes `supplier.compliance.flagged` with `severity = s1` (reusing the Module 1.2 scale). The OL and FAL receive a combined in-app alert + Twilio SMS + PagerDuty page. Three open POs against this vendor are flagged with a "Vendor Non-Compliant" badge and blocked from advancing to `po_issued`. The engine offers the OL three remediation paths: (1) extend a 72-hour grace period pending certificate renewal (requires FAL co-approval and a written commitment from the vendor's broker with target renewal date), (2) substitute an alternate compliant security vendor from the preferred vendor pool (the engine proposes the top 3 by `overall_score` and `category_tags` intersection), or (3) escalate to ED break-glass for emergency onboarding of a non-preferred vendor (requires ED + FAL + ESGO co-approval and a documented contingency plan). All actions are time-stamped in `audit_log` and a `supplier.compliance.restored` event fires when the certificate is renewed and verified.

**Edge case (non-obvious): vendor delivers 80 of 100 promised microphones.** At 18:00 on Day -1, the AV vendor delivers equipment to the venue. The FV accepting delivery scans 80 microphone barcodes into the Staff App (Module 7.2), expecting 100. The Integration Hub compares `qty_delivered` (80) against `qty_contracted` (100) and computes `shortfall_qty = 20`. The contract's penalty clause states 12% of the shortfall line value (unit_price_usd = US$ 85, line value = US$ 8,500, shortfall value = US$ 1,700, penalty = US$ 204). The engine publishes `supplier.delivery.shortfall` with the computed penalty, advances `procurement_record.stage` to `delivery_shortfall`, and alerts the OL with three options: (1) accept the partial delivery with the penalty applied and source 20 microphones from the backup vendor pool (Module 8.1 SKUVault integration auto-proposes the nearest available stock), (2) reject the delivery entirely and invoke the contract's default clause (the vendor must replace within 6 hours at no charge), or (3) accept partial without penalty if the FV notes "20 microphones were substitutable from existing inventory" (requires OL + FAL co-approval). The final invoice received from the vendor is auto-adjusted: `total_invoiced_usd` is reduced by the shortfall value plus penalty (US$ 1,904), and the GL posting to Workday Financials reflects the adjustment. The vendor's `vendor_rating` post-event will carry the shortfall in the `timeliness_score` rubric.

### E. Third-Party Integrations

- **Coupa / SAP Ariba (procurement system of record):** Bidirectional sync. The OL authors RFQs in the FMF platform; the Integration Hub mirrors them to Coupa via the Coupa Open API. Vendor proposals received in Coupa are mirrored back as `procurement_record.stage = proposal_received` events. Data flow: FMF -> Integration Hub -> Coupa; Coupa webhook -> Integration Hub -> FMF. POs issued in FMF create Coupa POs; Coupa PO acknowledgements propagate back.
- **DocuSign (contract execution):** When `stage = contract_pending`, the Integration Hub creates a DocuSign envelope from the contract template + supplier-specific clauses and emails it to the supplier's primary contact. Data flow: FMF -> Integration Hub -> DocuSign eSignature API -> supplier; DocuSign webhook (envelope-completed) -> Integration Hub -> `stage = contract_signed` with `contract_signed_at` and `ext_refs.docusign_envelope_id`.
- **Stripe (small supplier payments) and SWIFT wire transfer (large supplier payments):** When `stage = invoice_approved` and the FAL releases payment, the Integration Hub dispatches: Stripe Charge API for suppliers with `total_paid_usd <= US$ 25,000` and a verified Stripe Connect account; SWIFT MT103 file generation for suppliers above that threshold or without Stripe onboarding. Data flow: FMF -> Integration Hub -> Stripe / bank SWIFT gateway; webhook back -> `stage = payment_released`.
- **Workday Financials (ledger posting):** Every `payment_released` event triggers a GL posting to Workday Financials via the Workday REST API. Data flow: FMF -> Integration Hub -> Workday; `gl_posting_code` populated on `procurement_record` and visible to FAL.
- **ComplyWorks / Avetta (compliance tracking):** Continuous monitoring of vendor insurance, safety records, and certifications. Data flow: ComplyWorks/Avetta webhook -> Integration Hub -> `vendor_compliance_item.verification_status` updated; `supplier.compliance_status` recomputed. Real-time alerting to OL + FAL on any status regression.
- **Coupa Supplier Portal (vendor self-service):** Suppliers update their own contact info, upload new insurance certificates, and view PO and payment status. Data flow: Coupa portal -> Coupa API -> Integration Hub -> FMF `supplier` table.
- **Kafka topics:** Publishes `supplier.*` (full list above). Subscribes to `resource.inventory.adjusted` (Module 8.1), `fnb.event.confirmed` (Module 8.3), `transport.fleet.audit` (Module 8.4), `budget.allocation.confirmed` (Module 9.1).

### F. UI/UX Notes

The OL's primary screen is a four-quadrant layout. Top-left: a supplier directory list filterable by `category_tags`, `compliance_status`, `diversity_flags`, and `overall_score`. Each row shows a colored chip for `compliance_status` (green = compliant, amber = remediation, red = blocked). Top-right: the selected supplier's profile, with tabs for Overview, Compliance Items (each with a color-coded expiry countdown), Procurement History, ESG Profile, and Rating History. Bottom-left: the procurement pipeline Kanban with columns for each `stage` (rfq_draft, rfq_published, proposal_received, evaluation, contract_pending, contract_signed, po_issued, in_delivery, delivery_confirmed, invoice_received, invoice_approved, payment_released, closed); cards drag between columns with state-machine validation. Bottom-right: the compliance alert feed, sortable by severity.

The FAL's view adds a "Pending Approval" queue above the standard layout showing all contracts above the US$ 50K threshold awaiting FAL signature. The ESGO's view replaces the procurement Kanban with the ESG rubric editor and a diversity dashboard showing local-content percentage, women-owned spend, and SME spend against event targets.

The supplier self-service portal (Coupa-branded) shows the vendor their contracts, POs, delivery windows, invoices, and payment status, plus a "Compliance Documents" upload area.

### G. Failure Modes & Offline Behavior

- **Coupa API outage:** RFQs and POs are queued in the Integration Hub and replayed when Coupa returns; the OL sees a "Coupa sync delayed: N records queued" banner. Local FMF state remains authoritative for the OL's pipeline view.
- **DocuSign outage during contract execution:** The Integration Hub falls back to a manual PDF generation + email + countersign workflow; the contract is uploaded to the `procurement_record` and a DocuSign backfill is queued for when the service returns.
- **ComplyWorks webhook silent failure:** A daily reconciliation job pulls all `supplier` records whose `insurance_status` last refresh is >24h old and re-pulls verification status from ComplyWorks REST API; mismatches trigger manual OL review.
- **Stripe payment failure (card declined or account frozen):** The Integration Hub retries 3 times with 1-hour backoff; on final failure it auto-falls-back to SWIFT wire transfer and notifies the FAL; the supplier is notified via portal of the payment delay.
- **Workday Financials posting failure:** Payment remains in `payment_released` stage; the GL posting is queued with a 24-hour TTL and the FAL sees a "GL Posting Pending" tile on their dashboard; manual posting is available as a fallback.
- **OL mobile device offline during a delivery acceptance:** The FV's Staff App captures the delivery locally with photos; the Integration Hub waits for the FV's reconnect and the OL sees a "Delivery Awaiting Confirmation" placeholder; once confirmed offline-first per Module 7.4 the OL's view updates within 60 seconds.
- **Vendor portal offline (supplier cannot upload insurance renewal):** The supplier can email the certificate to a dedicated intake address; the Integration Hub's Workato recipe extracts via LLM-assisted OCR and creates a `vendor_compliance_item` draft pending OL verification.

### H. Acceptance Criteria

- **Given** a vendor with `insurance_status = current` and an open PO in `stage = po_issued`, **When** the ComplyWorks webhook reports the insurance certificate expired yesterday, **Then** the supplier's `compliance_status` transitions to `blocked`, the open PO is flagged with a "Vendor Non-Compliant" badge, new POs are blocked at the application layer, and the OL and FAL receive an in-app + Twilio SMS + PagerDuty alert within 60 seconds, with three remediation paths surfaced.
- **Given** a contract for 100 microphones at US$ 85 each, **When** the FV scans 80 microphones at delivery, **Then** the engine computes `shortfall_qty = 20`, `shortfall_penalty_usd = US$ 204` (12% of US$ 1,700 shortfall), publishes `supplier.delivery.shortfall`, advances `stage = delivery_shortfall`, and offers the OL three resolution paths (accept with penalty + backup sourcing, reject and invoke default, accept without penalty with FV-substantiated note requiring FAL co-approval).
- **Given** a contract value of US$ 75,000, **When** the OL attempts to advance `stage` from `contract_pending` to `contract_signed`, **Then** the save is blocked with a "FAL co-approval required above US$ 50K threshold" error, the FAL is notified, and the contract cannot be signed until the FAL explicitly approves with a timestamped record in `stage_history`.
- **Given** ESGO updates the ESG rubric to raise the weight of `local_content_pct` from 20% to 35%, **When** the rubric is saved, **Then** all `supplier.esg_score` values are recomputed within 60 seconds, the rubric diff is recorded in `audit_log`, and any supplier whose recomputed score crosses a threshold (e.g., drops below 60) is flagged for ESGO review.
- **Given** a vendor whose prior-event `overall_score` is 2.4 (below the 3.0 threshold), **When** the OL creates a new RFQ draft selecting this vendor, **Then** the draft is flagged with a "Prior Performance Warning" and the `stage` cannot advance to `rfq_published` without ED co-approval, with the prior rating narrative surfaced in the OL's confirmation modal.
