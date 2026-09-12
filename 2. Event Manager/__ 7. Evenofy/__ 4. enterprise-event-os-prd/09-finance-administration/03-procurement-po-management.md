> Module 9: Finance & Administration Module -> 9.3 Procurement & PO Management

## Procurement & PO Management

### A. Purpose Statement

The Procurement & PO Management subsystem is the authoritative lifecycle owner for every Purchase Order issued by the Future Minerals Forum and the three-way match between PO, goods receipt note, and supplier invoice that gates payment release. At FMF scale, the procurement function processes 2,800+ POs across 11 departments and 300+ suppliers (per Module 8.2 supplier registry), with combined contract value exceeding US$ 18M. A single failed three-way match can stall a critical supplier payment (e.g., the motorcade fuel vendor on Day 0) or, worse, release payment for goods never received (e.g., a security vendor billing for 110 staff when only 100 were deployed). This subsystem exists so that every PO has a defined lifecycle from requisition through payment, every goods receipt is documented by an on-site FV via the Staff App, and every payment is released only after a three-way match validates quantity and price alignment.

The subsystem is the write-side owner of the `po.*` Kafka topic prefix per the Module 0.1 bounded context table. It publishes `po.requisition.submitted`, `po.rfq.published`, `po.quote_received`, `po.issued`, `po.amended`, `po.goods_received`, `po.invoice_received`, `po.three_way_match.passed`, `po.three_way_match.failed`, `po.payment_released`, `po.closed`, `po.reopened`, and `po.disputed`. It subscribes to `budget.allocation.confirmed` and `budget.line.blocked` (Module 9.1) to gate PO issuance against approved and unblocked budget lines, to `supplier.compliance.flagged` and `supplier.compliance.restored` (Module 8.2) to block or unblock PO issuance against non-compliant suppliers, to `supplier.invoice.received` (Module 9.2) to route invoices to the three-way match queue, and to `resource.inventory.adjusted` (Module 8.1) to auto-trigger replenishment requisitions when stock falls below threshold. Its non-negotiable contract is that no payment may be released without a passing three-way match (PO + GRN + invoice), and that every variance surfaces to the FAL for adjudication with the disputed portion withheld.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all POs. Write only via break-glass on emergency PO issuance above US$ 100K (requires FAL + CFO co-sign per Module 9.1 Tier-3 thresholds) and on PO reopen approvals (with FAL co-sign).
- **Operations Lead (OL):** Read on departmental POs. Write on requisition authoring, RFQ authoring, quote evaluation, PO issuance up to the US$ 50K threshold (above requires FAL co-approval), and goods receipt acknowledgment. Can override a three-way match failure via break-glass with documented justification (requires FAL co-approval).
- **Protocol Officer (PO):** Read-only on POs for `protocol_sensitive` suppliers (e.g., VIP catering, motorcade fuel, diplomatic gift vendors). No write.
- **VIP Liaison (VL):** Read-only on POs tied to their assigned dignitary's services. No write.
- **Registration Manager (RM):** Read on POs for badge printing and registration materials vendors. No write.
- **Sponsorship Sales Lead (SSL):** Read on sponsor-mandated vendor POs. No write on procurement records beyond sponsor-vendor matching proposals.
- **Exhibitor Portal User (EPU):** No direct access to POs except via the supplier portal (Coupa Supplier Portal) for vendors who are also exhibitors.
- **Content & Stage Manager (CSM):** Read on AV and staging POs. Write on delivery-timing confirmations for stage equipment and on requisition authoring for production equipment.
- **Matchmaking Concierge (MC):** No direct access.
- **Finance & Administration Lead (FAL):** Primary owner on the financial side. Read/write on POs above the US$ 50K threshold (co-approval), invoice approval, three-way match adjudication, payment release, and GL posting codes. The FAL is the secondary approver for all procurement break-glass actions.
- **Marketing & PR Lead (MPL):** Read on signage, print, and brand-experience POs. No write.
- **ESG & Sustainability Officer (ESGO):** Read on all POs for ESG-tagged spend; write only on ESG impact assessments appended to POs above US$ 100K.
- **Field Volunteer (FV):** Read on assigned goods receipt tasks via Staff App (Module 7.2). Write on goods receipt note entry (quantity received, condition, photos, signature), with offline-first sync per Module 7.4.
- **Attendee (ATT):** No direct access.

### C. Data Model

`requisition` (the originating request for goods or services; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | OL, CSM, or auto-service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{coupa_requisition_id, sap_pr_number, resource_inventory_shortfall_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `department_code` | `text` | Requesting department |
| `budget_line_id` | `uuid` | FK -> budget_line.id (Module 9.1) |
| `requested_by` | `uuid` | OL or CSM |
| `priority` | `enum[p0_emergency, p1_high, p2_standard, p3_flex]` | Reuses Module 8.1 priority scale |
| `need_by_date` | `date` | Required delivery date |
| `line_items` | `jsonb[]` | `[{sku, description, qty_requested, unit_price_estimated, currency, supplier_preference_id}]` |
| `estimated_total_usd` | `numeric(12,2)` | For budget gate check |
| `status` | `enum[draft, submitted, rfq_published, quoted, awarded, cancelled]` | Lifecycle |
| `awarded_po_id` | `uuid null` | FK -> purchase_order.id once awarded |
| `auto_triggered_by` | `text null` | e.g., "resource_inventory_shortfall" if from Module 8.1 |

`purchase_order` (the issued PO; extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{coupa_po_id, sap_po_number, docusign_envelope_id, workday_invoice_id, stripe_charge_id, concur_expense_report_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `po_number` | `text` | Human-readable, e.g., "FMF2025-PO-01432" |
| `supplier_id` | `uuid` | FK -> supplier.id (Module 8.2) |
| `requisition_id` | `uuid null` | FK -> requisition.id |
| `budget_line_id` | `uuid` | FK -> budget_line.id (Module 9.1); gates issuance |
| `procurement_record_id` | `uuid null` | FK -> procurement_record.id (Module 8.2) |
| `stage` | `enum[requisition, rfq, quote_received, po_issued, goods_received, invoice_received, three_way_match, paid, closed, cancelled, reopened, disputed]` | Lifecycle |
| `line_items` | `jsonb[]` | `[{sku, description, qty_ordered, qty_received, qty_invoiced, unit_price_usd, currency, tax_rate, gl_account}]` |
| `total_value_usd` | `numeric(12,2)` | Aggregated |
| `currency` | `char(3)` | ISO 4217 |
| `fx_rate_at_issue` | `numeric(10,6) null` | Locked from Module 9.1 budget_fx_rate |
| `issued_at` | `timestamptz null` | |
| `expected_delivery_at` | `timestamptz null` | |
| `actual_delivery_at` | `timestamptz null` | |
| `delivery_location` | `text` | e.g., "RCC Loading Dock 3" |
| `assigned_fv_id` | `uuid null` | FK -> user.id; FV responsible for goods receipt |
| `approval_tier` | `enum[tier1_fal, tier2_fal_ed, tier3_fal_ed_cfo]` | Per Module 9.1 thresholds |
| `approved_by_fal_at` | `timestamptz null` | |
| `approved_by_ed_at` | `timestamptz null` | If tier 2 or 3 |
| `approved_by_cfo_at` | `timestamptz null` | If tier 3 |
| `three_way_match_status` | `enum[pending, passed, failed, partial_pass, overridden]` | |
| `three_way_match_variance` | `jsonb null` | e.g., `{qty_variance: 10, price_variance: 0, amount_withheld_usd: 850}` |
| `closed_at` | `timestamptz null` | |
| `reopened_at` | `timestamptz null` | If reopened post-close |
| `reopened_reason` | `text null` | e.g., "late_invoice_60_days_post_event" |
| `dispute_status` | `enum[none, open, resolved_in_favor_supplier, resolved_in_favor_fmf, escalated]` | |

`goods_receipt_note` (GRN; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | FV via Staff App (Module 7.2) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{sku_vault_receipt_id, fv_device_id, recorded_at_device}` |
| `audit_log` | `jsonb[]` | Append-only |
| `purchase_order_id` | `uuid` | FK -> purchase_order.id |
| `received_by_fv_id` | `uuid` | FK -> user.id |
| `received_at` | `timestamptz` | Settled timestamp |
| `received_at_device` | `timestamptz` | Original device timestamp for offline-first per Module 7.4 |
| `delivery_location` | `text` | Where received |
| `line_receipts` | `jsonb[]` | `[{sku, qty_received, condition: [good, damaged, short_dated, wrong_item], photo_urls: [], fv_signature_base64}]` |
| `delivery_document_url` | `text null` | Signed delivery receipt |
| `discrepancy_notes` | `text null` | Free text from FV |

`three_way_match_record` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Match Engine service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{netsuite_match_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `purchase_order_id` | `uuid` | FK -> purchase_order.id |
| `goods_receipt_note_id` | `uuid` | FK -> goods_receipt_note.id |
| `supplier_invoice_id` | `uuid` | FK -> invoice.id (Module 9.2) |
| `match_status` | `enum[pending, passed, failed, partial_pass, overridden]` | |
| `qty_variance` | `int` | Invoice qty - PO qty (per line) |
| `price_variance_usd` | `numeric(12,2)` | Invoice unit price - PO unit price |
| `amount_releasable_usd` | `numeric(12,2)` | Matched portion to pay |
| `amount_withheld_usd` | `numeric(12,2)` | Disputed portion withheld |
| `adjudicated_by` | `uuid null` | FAL |
| `adjudicated_at` | `timestamptz null` | |
| `adjudication_notes` | `text null` | |
| `override_justification` | `text null` | If status = overridden |

### D. Business Logic & Edge Cases

- **IF** a requisition is submitted for an `estimated_total_usd` exceeding the referenced `budget_line`'s remaining runway (`planned_local - committed_local`), **THEN** the engine blocks the requisition at the application layer with `BUDGET_RUNWAY_INSUFFICIENT`, surfaces a Tier-1 approval queue entry to the FAL, and the requisition cannot advance to `rfq_published` until the FAL approves (with ED co-sign if the requisition exceeds the Tier-1 threshold) or the OL reallocates from contingency per Module 9.1.
- **IF** a PO is issued for a `supplier_id` whose `compliance_status != compliant` (per Module 8.2), **THEN** the engine blocks the PO issuance at the application layer with `SUPPLIER_NON_COMPLIANT`, names the lapsed compliance item, and the OL must remediate the supplier per Module 8.2's three remediation paths before the PO can advance.
- **IF** a PO amount is below US$ 10K, **THEN** FAL-only approval is required (`approval_tier = tier1_fal`) and the engine advances `stage` to `po_issued` upon FAL signature.
- **IF** a PO amount is between US$ 10K and US$ 100K, **THEN** the engine requires `approval_tier = tier2_fal_ed` (FAL + ED co-sign), holds the PO in `pending_approval`, and the Integration Hub dispatches a DocuSign envelope for ED's signature.
- **IF** a PO amount exceeds US$ 100K, **THEN** the engine requires `approval_tier = tier3_fal_ed_cfo` (FAL + ED + CFO triple sign), the Integration Hub composes an approval packet (PO, supplier profile, budget_line context, ESG impact summary from ESGO), and dispatches a DocuSign envelope to the CFO.
- **IF** a GRN is recorded with `qty_received < qty_ordered` for any line item, **THEN** the engine updates `purchase_order.line_items[].qty_received`, computes the variance, and surfaces a "Short Receipt" alert to the OL with the Module 8.2 shortfall penalty workflow.
- **IF** a supplier invoice is received and the GRN is not yet recorded, **THEN** the engine holds the invoice in `pending_grn` status for 5 business days; on day 5 it alerts the FAL and OL to either expedite the GRN or dispute the invoice.
- **IF** the three-way match computes `qty_variance != 0` or `price_variance_usd != 0`, **THEN** the engine sets `match_status = partial_pass`, computes `amount_releasable_usd` (matched portion) and `amount_withheld_usd` (disputed portion), publishes `po.three_way_match.failed`, surfaces to the FAL for adjudication, and the matched portion is releasable upon FAL approval while the disputed portion is held in escrow.
- **IF** an invoice arrives 60+ days after the PO was closed, **THEN** the engine reopens the PO (`stage = reopened`), requires FAL approval to either post the invoice (with GL backdating noted) or dispute the invoice, and publishes `po.reopened` with `reopened_reason = "late_invoice_60_days_post_event"`.

**Edge case (non-obvious): supplier invoice arrives 60 days after event but PO was closed.** On T+60 days post-event, the Integration Hub receives a supplier invoice from the AV vendor (per Module 8.2) for SAR 42,000 (approximately US$ 11,200) for additional stage rigging labor that was approved verbally by the OL on Day 2 of the event but never formalized in a PO change order. The original PO `FMF2025-PO-01432` was closed at T+30 days during the FAL's post-event reconciliation sweep. The engine detects the closed PO at invoice ingest, transitions `purchase_order.stage` from `closed` to `reopened`, sets `reopened_at` and `reopened_reason = "late_invoice_60_days_post_event"`, publishes `po.reopened` with `severity = s1`, and pages the FAL. The FAL's modal offers three adjudication paths: (1) approve the invoice with GL backdating noted (requires FAL sign; the engine creates a GL journal entry dated to the actual service date with a `late_posting` flag in NetSuite, the FAL acknowledges the late-posting risk in `adjudication_notes`), (2) dispute the invoice on the basis that no formal change order was issued (the engine sends a dispute notice to the supplier via Coupa Supplier Portal, withholds the full amount, and the supplier's `vendor_rating` post-event will reflect the dispute), or (3) negotiate a reduced settlement (requires FAL + ED co-sign, the supplier must accept via DocuSign countersign, and the variance is recorded in `three_way_match_variance`). All actions are timestamped in `audit_log` and the late-posting is surfaced in the post-event P&L with a "Late Invoice Reconciliation" line item. If the FAL disputes, the supplier has 14 days to respond via Coupa; on no response, the dispute is auto-resolved in favor of FMF and the PO is re-closed with `dispute_status = resolved_in_favor_fmf`. If the supplier contests, the dispute escalates to legal review (per Module 9.4 audit trail).

**Edge case (non-obvious): three-way match fails because supplier billed for 110 units but only 100 received.** The security vendor (per Module 8.2) submits an invoice for SAR 220,000 (110 security staff x SAR 2,000 each) for Day 1 event coverage. The PO `FMF2025-PO-00871` was issued for 100 staff at SAR 2,000 each (total SAR 200,000). The FV's GRN (recorded via Staff App Module 7.2 at 22:00 on Day 1) confirms 100 staff scanned in and deployed, with no record of an additional 10 staff. The three-way match engine computes: PO qty = 100, GRN qty = 100, invoice qty = 110. The `qty_variance = 10`, `price_variance_usd = 0` (unit price matches), `amount_releasable_usd = SAR 200,000` (matched portion: 100 units at SAR 2,000), `amount_withheld_usd = SAR 20,000` (disputed portion: 10 units). The engine sets `match_status = partial_pass`, publishes `po.three_way_match.failed` with `severity = s1`, withholds the disputed SAR 20,000 in escrow, and surfaces to the FAL with three options: (1) release the matched SAR 200,000 to the supplier and open a dispute for the SAR 20,000 (default; the supplier is notified via Coupa Supplier Portal with a 14-day response window), (2) withhold the full SAR 220,000 pending dispute resolution (requires FAL explicit override), or (3) accept the additional 10 units if the supplier provides documentation (e.g., FV-supervisor sign-off that the 10 additional staff were verbally authorized by the OL; requires OL + FAL co-approval and a PO amendment to increase `qty_ordered` from 100 to 110). The default path (1) releases SAR 200,000 to the supplier within 24 hours (via Stripe if under US$ 25K, else SWIFT wire per Module 8.2 conventions), the disputed SAR 20,000 is held in escrow, the supplier's `vendor_rating` post-event carries the dispute in the `quality_score` rubric, and the dispute resolution workflow follows Module 9.4 audit trail. If the supplier contests with documentation within 14 days, the FAL re-adjudicates; if the supplier accepts the matched portion as final, the disputed portion is reversed and the PO is closed with `dispute_status = resolved_in_favor_fmf`.

### E. Third-Party Integrations

- **Coupa or SAP Ariba (procurement platform of record):** Bidirectional sync. Requisitions authored in FMF mirror to Coupa via the Coupa Open API. RFQs published in Coupa mirror back as `po.rfq.published`. Quotes received in Coupa mirror back as `po.quote_received`. POs issued in FMF create Coupa POs. Data flow: FMF -> Integration Hub -> Coupa; Coupa webhook -> Integration Hub -> FMF.
- **NetSuite (PO ledger and three-way match):** POs issued in FMF create NetSuite Purchase Orders; three-way match is performed natively in FMF but mirrored to NetSuite's Matched POs view; payment release creates a NetSuite Bill Payment. Data flow: FMF -> Integration Hub -> NetSuite; NetSuite webhook -> Integration Hub -> FMF.
- **DocuSign (PO sign-offs and CFO approval packets):** For Tier-2 and Tier-3 approvals, the Integration Hub creates a DocuSign envelope from the PO template + budget line context + ESG impact summary and emails it to the ED (Tier 2) or CFO (Tier 3). Data flow: FMF -> DocuSign eSignature API -> ED/CFO email; DocuSign envelope-completed webhook -> Integration Hub -> PO advances with `approved_by_ed_at` or `approved_by_cfo_at`.
- **Stripe (small supplier payments) and SWIFT MT103 wire transfer (large payments):** When `stage = paid` and the FAL releases payment, the Integration Hub dispatches: Stripe Charge API for POs with `total_value_usd <= US$ 25,000` and a verified Stripe Connect account on the supplier; SWIFT MT103 file generation for POs above that threshold or without Stripe onboarding (per Module 8.2 conventions). Data flow: FMF -> Integration Hub -> Stripe / bank SWIFT gateway; webhook back -> `stage = paid` with `payment.processor_ref` recorded.
- **Concur (expense report integration for staff reimbursements):** Staff expense reports (e.g., travel expenses for the OL attending a site visit) are submitted via SAP Concur. The Integration Hub receives Concur webhook events and creates `purchase_order` records with `po_number = "FMF2025-EXP-NNNNN"`, `supplier_id` mapped to the staff member's internal supplier record, and `budget_line_id` referencing the Travel department's budget. Data flow: Concur -> Integration Hub -> FMF.
- **SKUVault (inventory shortfall auto-requisition trigger):** Per Module 8.1, when `resource.inventory.adjusted` reports a shortfall below threshold, the Integration Hub auto-creates a requisition with `auto_triggered_by = "resource_inventory_shortfall"` and `priority = p1_high`. Data flow: Module 8.1 SKUVault webhook -> Integration Hub -> FMF requisition.
- **Workday Financials (GL posting):** Every `payment_released` event triggers a GL posting to Workday Financials via the Workday REST API; `gl_posting_code` populated on `purchase_order` and visible to FAL.
- **Kafka topics:** Publishes `po.*` (full list above). Subscribes to `budget.allocation.confirmed` and `budget.line.blocked` (Module 9.1), `supplier.compliance.flagged` and `supplier.compliance.restored` (Module 8.2), `supplier.invoice.received` (Module 9.2), `resource.inventory.adjusted` (Module 8.1).

### F. UI/UX Notes

The OL's primary screen is a procurement pipeline Kanban (similar to Module 8.2's supplier Kanban but PO-centric) with columns for each `stage` (requisition, rfq, quote_received, po_issued, goods_received, invoice_received, three_way_match, paid, closed, reopened, disputed). Cards drag between columns with state-machine validation. Each card shows PO number, supplier name, amount, priority chip, and an approval-tier badge. Clicking a card opens a detail drawer with: line items table (qty_ordered, qty_received, qty_invoiced, variance columns color-coded), GRN attachments (photos, FV signature), and the three-way match panel showing match_status, variance breakdown, and adjudication actions.

The FAL's view adds a "Pending Three-Way Match" queue above the standard Kanban showing all POs in `stage = invoice_received` with `three_way_match_status = pending`. Each card surfaces the variance breakdown and offers one-tap adjudication actions (release matched portion, withhold disputed portion, override with justification). The FV's Staff App view (Module 7.2) shows assigned GRN tasks with barcode scanning, photo capture, and signature pad, all offline-first per Module 7.4.

### G. Failure Modes & Offline Behavior

- **Coupa API outage:** Requisitions and POs are queued in the Integration Hub and replayed when Coupa returns; the OL sees a "Coupa Sync Delayed: N records queued" banner. Local FMF state remains authoritative for the OL's pipeline view.
- **NetSuite PO sync outage:** POs are queued locally with a 24-hour TTL; the FAL sees a "NetSuite Sync Delayed" banner; payment release is blocked until NetSuite confirms the PO exists.
- **DocuSign outage during CFO approval:** The Integration Hub falls back to a manual PDF + email + countersign workflow; the CFO's signature is captured on a PDF uploaded to the PO's `audit_log` and a DocuSign backfill is queued for when the service returns.
- **FV mobile device offline during goods receipt:** The FV's Staff App captures the GRN locally with photos and signature, queues per Module 7.4 Offline Sync Engine; the OL sees a "GRN Awaiting Confirmation" placeholder; once the FV reconnects, the GRN is replayed within 60 seconds and the three-way match can proceed.
- **Stripe payment failure:** The Integration Hub retries 3 times with 1-hour backoff; on final failure it auto-falls-back to SWIFT wire transfer and notifies the FAL.
- **Concur webhook delay (staff expense reports):** Expense reports received via Concur are queued; if a report arrives after the event's books are closed (T+30), the system reopens the relevant Travel PO per the late-invoice edge case workflow.
- **Three-way match engine deadlock under high concurrency:** The engine retries 3 times with 5-minute exponential backoff; on final failure it alerts the FAL and the OL; payment release is blocked until manual adjudication.

### H. Acceptance Criteria

- **Given** a closed PO `FMF2025-PO-01432` and a supplier invoice arriving on T+60 days, **When** the Integration Hub ingests the invoice, **Then** the engine transitions `purchase_order.stage` from `closed` to `reopened`, sets `reopened_at` and `reopened_reason = "late_invoice_60_days_post_event"`, publishes `po.reopened` with `severity = s1`, pages the FAL, and offers three adjudication paths (approve with GL backdating, dispute, or negotiate reduced settlement) with all actions recorded in `audit_log`.
- **Given** a PO for 100 security staff at SAR 2,000 each (total SAR 200,000) and a supplier invoice for 110 staff at the same unit price (total SAR 220,000), **When** the three-way match runs with GRN confirming 100 received, **Then** the engine computes `qty_variance = 10`, `amount_releasable_usd = SAR 200,000`, `amount_withheld_usd = SAR 20,000`, sets `match_status = partial_pass`, publishes `po.three_way_match.failed`, withholds the disputed portion in escrow, and offers the FAL three options (release matched portion + dispute the rest, withhold full, or accept additional units with documentation requiring OL + FAL co-approval).
- **Given** a PO for US$ 75,000 (Tier-2 approval required), **When** the OL submits the PO for approval, **Then** the engine requires both FAL and ED co-sign, holds the PO in `pending_approval`, dispatches a DocuSign envelope to the ED, and the PO cannot advance to `po_issued` until both signatures are recorded with timestamps in `audit_log`.
- **Given** a requisition for US$ 8,500 referencing a `budget_line` with remaining runway of US$ 7,000, **When** the OL submits the requisition, **Then** the engine blocks with `BUDGET_RUNWAY_INSUFFICIENT`, surfaces a Tier-1 approval queue entry to the FAL, and the requisition cannot advance to `rfq_published` until the FAL approves with ED co-sign or the OL reallocates from contingency per Module 9.1.
- **Given** a PO for a `supplier_id` whose `compliance_status = blocked` (insurance lapsed per Module 8.2), **When** the OL attempts to issue the PO, **Then** the engine blocks with `SUPPLIER_NON_COMPLIANT`, names the lapsed compliance item, and the OL must remediate the supplier per Module 8.2's three remediation paths before the PO can advance.
