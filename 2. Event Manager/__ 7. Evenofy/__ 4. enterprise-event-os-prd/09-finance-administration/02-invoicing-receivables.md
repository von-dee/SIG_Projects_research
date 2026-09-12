> Module 9: Finance & Administration Module -> 9.2 Invoicing & Receivables

## Invoicing & Receivables

### A. Purpose Statement

The Invoicing & Receivables subsystem is the authoritative system of record for every invoice the Future Minerals Forum issues to its customers (sponsors, exhibitors, attendees) and every supplier invoice the event receives. At FMF scale, the AR ledger runs to 4,000+ customer invoices totaling US$ 28M in sponsorship and exhibitor revenue and US$ 1.4M in registration fee revenue, while the AP side (handled in coordination with Module 9.3) receives 2,800+ supplier invoices totaling US$ 18M. Without disciplined AR aging and milestone tracking, a Platinum sponsor's missed milestone payment can quietly degrade the event's cash position, or an attendee's failed registration payment can leave them with a printed badge but no actual seat. This subsystem exists so that every issued invoice has a defined type, a defined customer, a defined contract milestone (where applicable), an aging bucket, and a tracked payment path with automated escalation.

The subsystem is the write-side owner of the `invoice.*` Kafka topic prefix per the Module 0.1 bounded context table. It publishes `invoice.issued`, `invoice.reminder_sent`, `invoice.payment_received`, `invoice.payment_failed`, `invoice.past_due`, `invoice.entitlements_downgraded`, `invoice.entitlements_restored`, `invoice.cancelled`, `invoice.refund_issued`, and `invoice.aging.advanced`. It subscribes to `sponsor.deal.confirmed` (Module 5.1) to auto-issue sponsorship invoices at contract signing, to `booth.allocated` (Module 5.2) to issue exhibitor booth invoices, to `registration.confirmed` (Module 6.1) to issue registration fee invoices, to `supplier.invoice.received` (Module 8.2) to receive and route supplier invoices to AP, and to `budget.line.blocked` (Module 9.1) to freeze further invoicing against blocked contra-budget lines. Its non-negotiable contract is that no sponsor entitlement activation may persist past 15 days of overdue payment without an automatic downgrade with restoration path, and that every refund has a documented reason traceable through the audit trail (Module 9.4).

### B. User Roles & Permissions

- **Event Director (ED):** Read on all invoices, payments, aging. Write only via break-glass on customer-facing refunds above US$ 10K (requires FAL co-sign) and on entitlement restoration overrides (requires FAL + ED co-sign).
- **Operations Lead (OL):** Read on departmental supplier invoices. No write on customer-facing invoices.
- **Protocol Officer (PO):** Read-only on invoices tied to protocol-sensitive sponsor relationships (e.g., a sovereign-aligned sponsor). No write.
- **VIP Liaison (VL):** No direct access.
- **Registration Manager (RM):** Read/write on registration fee invoices only (issue, refund, cancel). Cannot modify sponsorship invoices.
- **Sponsorship Sales Lead (SSL):** Read on all sponsorship invoices for their book of business. Write on milestone payment tracking notes and on customer communication templates; cannot modify invoice amounts or payment terms without FAL approval.
- **Exhibitor Portal User (EPU):** Read on their own company's invoices and payment history via the Exhibitor Portal (Module 5.3). No write.
- **Content & Stage Manager (CSM):** No direct access.
- **Matchmaking Concierge (MC):** No direct access.
- **Finance & Administration Lead (FAL):** Primary owner. Read/write on all invoices, AR aging, payment processing, refunds, and the General Ledger side (NetSuite / QuickBooks AR subledger). The FAL is the secondary approver for refund break-glass actions.
- **Marketing & PR Lead (MPL):** Read on sponsor and exhibitor invoice summaries for ROI reporting. No write.
- **ESG & Sustainability Officer (ESGO):** No direct access.
- **Field Volunteer (FV):** No direct access.
- **Attendee (ATT):** Read on their own registration invoices and payment status via the Attendee App (Module 7.1). Write only on initiating payment retry.

### C. Data Model

`invoice` (extends shared columns; covers all four invoice types via the `invoice_type` enum):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | FAL, SSL, RM, or auto-service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{netsuite_invoice_id, quickbooks_invoice_id, stripe_charge_id, stripe_invoice_id, plaid_link_token, avalara_transaction_id, sap_customer_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `invoice_type` | `enum[sponsorship, exhibitor_booth, registration_fee, supplier, credit_note, refund]` | |
| `direction` | `enum[receivable, payable]` | AR vs AP |
| `customer_id` | `uuid null` | FK -> customer.id (sponsor, exhibitor, or attendee) for receivables |
| `supplier_id` | `uuid null` | FK -> supplier.id (Module 8.2) for payables |
| `sponsor_deal_id` | `uuid null` | FK -> sponsor_deal.id (Module 5.1) if sponsorship |
| `registration_id` | `uuid null` | FK -> registration.id (Module 6.1) if registration_fee |
| `budget_line_id` | `uuid null` | FK -> budget_line.id (Module 9.1) if payable or contra-budget |
| `invoice_number` | `text` | Human-readable, e.g., "FMF2025-SP-0042" |
| `po_reference` | `text null` | Customer PO number if provided |
| `issue_date` | `date` | |
| `due_date` | `date` | Computed from payment terms |
| `subtotal_local` | `numeric(15,2)` | Pre-tax |
| `tax_amount_local` | `numeric(15,2)` | From Avalara or Stripe Tax |
| `total_local` | `numeric(15,2)` | Subtotal + tax |
| `currency` | `char(3)` | ISO 4217 |
| `total_original` | `numeric(15,2)` | If non-local currency |
| `payment_terms` | `enum[due_on_receipt, net_15, net_30, net_60, net_90, milestone_3_stage, milestone_4_stage, custom]` | |
| `milestone_schedule` | `jsonb[] null` | For milestone_3_stage: `[{stage: "signing", pct: 40, due_offset_days: 0, status, amount, due_date, paid_at}, {stage: "t_minus_60", pct: 30, due_offset_days: -60, ...}, {stage: "event_day", pct: 30, ...}]` |
| `payment_status` | `enum[draft, issued, partially_paid, paid, past_due, disputed, cancelled, refunded]` | |
| `amount_paid_local` | `numeric(15,2)` | Aggregated from payment events |
| `amount_refunded_local` | `numeric(15,2)` | Aggregated from refund events |
| `aging_bucket` | `enum[current, d_0_30, d_31_60, d_61_90, d_90_plus]` | Computed daily |
| `aging_as_of` | `timestamptz` | Last aging computation |
| `payment_method` | `enum[credit_card, bank_transfer, check, wire, ach, milestone]` | |
| `stripe_charge_id` | `text null` | If paid via Stripe |
| `plaid_account_verified` | `bool` | If bank transfer via Plaid |
| `tax_jurisdiction` | `text null` | e.g., "SA-RUH" for Riyadh |
| `tax_exemption_certificate` | `text null` | If customer claims exemption |
| `downgraded_entitlements` | `bool` | True if auto-downgrade has fired |
| `downgrade_lifted_at` | `timestamptz null` | When entitlements restored |

`payment` (each payment event against an invoice; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | FAL or auto-service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{stripe_balance_txn, plaid_transfer_id, bank_txn_ref}` |
| `audit_log` | `jsonb[]` | Append-only |
| `invoice_id` | `uuid` | FK -> invoice.id |
| `payment_method` | `enum[credit_card, bank_transfer, check, wire, ach, milestone]` | |
| `amount_local` | `numeric(15,2)` | |
| `amount_original` | `numeric(15,2) null` | If non-local currency |
| `fx_rate_applied` | `numeric(10,6) null` | |
| `paid_at` | `timestamptz` | Settled timestamp |
| `processor` | `enum[stripe, plaid, manual_check, swift_wire]` | |
| `processor_ref` | `text` | Processor transaction ID |
| `failure_reason` | `text null` | e.g., "card_declined", "insufficient_funds", "bank_account_unverified" |
| `retry_count` | `int` | Stripe Smart Retries counter |
| `next_retry_at` | `timestamptz null` | Next scheduled retry |
| `linked_milestone_stage` | `text null` | For milestone payments |

`ar_aging_snapshot` (daily AR aging rollup per customer; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Aging service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{netsuite_aging_report_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `customer_id` | `uuid` | FK -> customer.id |
| `as_of_date` | `date` | Snapshot date |
| `current_local` | `numeric(15,2)` | Not yet due |
| `d_0_30_local` | `numeric(15,2)` | 0-30 days past due |
| `d_31_60_local` | `numeric(15,2)` | 31-60 days past due |
| `d_61_90_local` | `numeric(15,2)` | 61-90 days past due |
| `d_90_plus_local` | `numeric(15,2)` | 90+ days past due |
| `total_outstanding_local` | `numeric(15,2)` | Sum of all buckets |
| `reminder_count_sent` | `int` | Automated reminders to date |
| `escalation_level` | `enum[none, soft_reminder, firm_reminder, final_notice, legal_referral]` | |

### D. Business Logic & Edge Cases

- **IF** a `sponsor_deal.confirmed` event arrives from Module 5.1, **THEN** the engine auto-creates an `invoice` with `invoice_type = sponsorship`, `payment_terms = milestone_3_stage` (default for Platinum; configurable per sponsor tier), `customer_id` set to the sponsor's customer record, and `milestone_schedule` populated with three stages (40% signing, 30% T-60, 30% event day); `invoice.issued` is published; the first milestone (signing) becomes immediately due.
- **IF** a `registration.confirmed` event arrives from Module 6.1, **THEN** the engine auto-creates an `invoice` with `invoice_type = registration_fee`, `payment_terms = due_on_receipt`, `total_local` computed from the registration fee schedule (with early-bird or VIP surcharges applied), and `payment_method = credit_card` defaulted; the Stripe checkout session is initiated via Stripe Checkout API and the URL returned to the Attendee App.
- **IF** a customer's `ar_aging_snapshot.d_31_60_local > 0` for the first time, **THEN** the engine publishes `invoice.past_due`, sends a firm reminder email via SendGrid and SMS via Twilio, and the FAL sees the customer flagged amber in the AR aging view.
- **IF** a customer's `ar_aging_snapshot.d_61_90_local > 0`, **THEN** the engine escalates `escalation_level` to `final_notice`, sends a final demand email and SMS, and pages the FAL and the SSL (if sponsor) via PagerDuty.
- **IF** an attendee's registration `payment.payment_status = failed` and the `payment_method = credit_card`, **THEN** the engine enrolls the invoice in Stripe Smart Retries with up to 4 retries over 14 days, sends an email to the attendee with a one-tap retry deep link via the Attendee App (Module 7.1), and after 7 days of non-payment with no successful retry, cancels the registration, publishes `invoice.cancelled` and `registration.cancelled` (consumed by Module 6.1), and refunds any partial payment (e.g., if the attendee had paid a deposit).
- **IF** a sponsor's invoice is past due by 15 days (`ar_aging_snapshot.d_0_30_local > 0` and `total_outstanding_local >= milestone_amount_due`) AND the sponsor has an active sponsorship entitlement, **THEN** the engine publishes `invoice.entitlements_downgraded`, auto-downgrades the sponsor's entitlements to the next lower tier per Module 5.1's tier-downgrade matrix (e.g., Platinum -> Gold: VIP invitations reduced, booth size reduced, speaking slot retracted), notifies the SSL with a restoration path (payment in full + FAL reactivation), and the downgrade is recorded in `invoice.audit_log` and the sponsor_deal's `audit_log` (Module 5.1).
- **IF** a sponsor invoice is paid in full after a downgrade, **THEN** the engine publishes `invoice.entitlements_restored` only after FAL explicit approval (to prevent gaming), restores entitlements, and the restoration is timestamped in `downgrade_lifted_at`.
- **IF** a supplier invoice arrives (via `supplier.invoice.received` from Module 8.2), **THEN** the engine creates an `invoice` with `direction = payable`, `supplier_id` set, `budget_line_id` set from the procurement record's `budget_line_id`, and routes it to the 3-way match workflow in Module 9.3.
- **IF** a tax-exempt customer (sovereign delegation, government entity) provides a `tax_exemption_certificate`, **THEN** the engine zeros `tax_amount_local`, validates the certificate via Avalara or against a sovereign exemption registry, and the FAL sees the exemption flagged for periodic re-validation.

**Edge case (non-obvious): sponsor invoice past due 15 days with active entitlement triggers auto-downgrade.** A Platinum sponsor (Sponsor A) signed at US$ 1.2M with milestone_3_stage payments: 40% (US$ 480,000) due at signing on T-180 (paid on time), 30% (US$ 360,000) due at T-60 (now 15 days past due), 30% (US$ 360,000) due on event day. Sponsor A's active entitlements include 25 VIP invitations, a 72 sqm booth in the Platinum zone, a 30-minute speaking slot, and 4 bilateral meeting rooms. At 09:00 on T-45 (15 days past the T-60 milestone), the daily AR aging job detects `ar_aging_snapshot.d_0_30_local = US$ 360,000`, confirms `downgraded_entitlements = false`, and triggers the auto-downgrade workflow. The engine publishes `invoice.entitlements_downgraded` with `severity = s2`, sends a final demand email + SMS to the sponsor's primary contact, alerts the SSL via PagerDuty, and within 60 seconds the Module 5.1 Sponsorship subsystem executes the Platinum -> Gold downgrade matrix: VIP invitations reduced from 25 to 12, booth reduced from 72 sqm to 48 sqm (with the released 24 sqm returned to the Module 5.2 booth pool), speaking slot retracted and the freed agenda time reallocated to a Gold-tier speaker, and 2 of the 4 bilateral meeting rooms released back to the Module 3.2 scheduling pool. The sponsor's portal (Module 5.3) shows a red banner: "Platinum entitlements suspended due to past-due payment. Pay US$ 360,000 to restore." The restoration path requires: (1) payment in full via Stripe or wire transfer, (2) FAL explicit reactivation (to prevent gaming where a sponsor pays late deliberately and expects automatic restoration), (3) the SSL re-confirms the sponsor's intent. Upon restoration, the engine publishes `invoice.entitlements_restored`, the Module 5.1 subsystem re-activates the Platinum entitlements, the released 24 sqm booth is re-allocated (and any interim Gold-tier exhibitor who claimed it is relocated by Module 5.2), and the speaking slot is re-added only if the agenda allows (otherwise, the slot remains retracted with a credit note offered to the sponsor).

**Edge case (non-obvious): attendee registration payment fails and is retried, then cancelled with partial refund.** An attendee (Dr. K.) registers for FMF at the standard rate of US$ 1,200. At registration confirmation, the engine issues `invoice` with `total_local = US$ 1,200`, `payment_method = credit_card`, and initiates a Stripe checkout. The attendee's card is declined at 14:32 (insufficient_funds). The engine publishes `invoice.payment_failed`, enrolls the invoice in Stripe Smart Retries with 4 retries scheduled over 14 days (Stripe's adaptive retry logic), and sends an email via SendGrid + SMS via Twilio with a one-tap retry deep link to the Attendee App. The registration is held in `pending_payment` status (Module 6.1) for 7 days; the badge is not printed (Module 6.3 gating). On Day 5, the attendee pays US$ 600 (partial) using a different card via the deep link, but the card is flagged for fraud and the charge is reversed by Stripe. The engine records the partial payment, then the reversal, and updates `amount_paid_local = 0` and `amount_refunded_local = US$ 600` (the reversal). On Day 7 (the cancellation deadline), no successful payment has been recorded, the engine publishes `invoice.cancelled` and `registration.cancelled` (consumed by Module 6.1), the attendee receives a cancellation confirmation email with a refund of any partial payment held in escrow (in this case, US$ 0 because the partial charge was reversed), and the registration slot is released back to the registration pool. If the attendee had paid a non-refundable deposit of US$ 200 separately and that payment succeeded, the deposit is retained per the registration terms and conditions and the refund is US$ 0; the attendee is notified of the deposit retention with the legal clause reference.

### E. Third-Party Integrations

- **Stripe (credit card payments and Smart Retries):** Primary processor for registration fees, small sponsor payments, and exhibitor booth invoices below US$ 25,000. Data flow: FMF -> Integration Hub -> Stripe Checkout API / Stripe PaymentIntent API; Stripe webhook -> Integration Hub -> `payment.paid_at` and `payment.processor_ref` updates. Smart Retries configured with up to 4 retries over 14 days.
- **Stripe Tax or Avalara (tax calculation):** Real-time tax calculation at invoice issuance based on customer's tax jurisdiction. Data flow: FMF -> Integration Hub -> Stripe Tax API / Avalara AvaTax API; response includes `tax_amount_local` and `tax_jurisdiction`. Sovereign exemptions validated against Avalara Exemption Registry.
- **Plaid (bank account verification):** For bank-transfer payments (large sponsor milestones, wire refunds). Data flow: Customer -> Plaid Link (embedded in sponsor portal or Attendee App) -> Plaid verifies account ownership; Integration Hub stores `plaid_account_verified = true` and `plaid_account_token` (encrypted via AWS KMS per Module 02 conventions) on the customer record before payment is initiated.
- **NetSuite or QuickBooks (AR ledger):** Bidirectional sync. Every `invoice.issued` creates a NetSuite Invoice (or QuickBooks Invoice); every `payment.paid_at` creates a NetSuite Payment applied to the invoice. Data flow: FMF -> Integration Hub -> NetSuite/QuickBooks; webhook back -> reconciliation.
- **Twilio (payment reminder SMS):** Automated reminders at d_0_30, d_31_60, d_61_90 thresholds. Data flow: FMF -> Integration Hub -> Twilio SMS API with anonymized numbers where applicable (e.g., for attendee-facing reminders via Twilio Proxy).
- **SendGrid (email reminders):** Templated emails for invoice issuance, payment confirmation, past-due reminders, and cancellation notices. Data flow: FMF -> Integration Hub -> SendGrid Email API.
- **SWIFT MT103 (large wire payments):** For sponsor payments above US$ 25,000 received via wire transfer, the Integration Hub parses SWIFT MT103 messages from the bank's daily statement file and matches to open invoices.
- **Kafka topics:** Publishes `invoice.*` (full list above). Subscribes to `sponsor.deal.confirmed` (Module 5.1), `booth.allocated` (Module 5.2), `registration.confirmed` (Module 6.1), `supplier.invoice.received` (Module 8.2), `budget.line.blocked` (Module 9.1).

### F. UI/UX Notes

The FAL's primary screen is a five-panel layout. Top-left: a customer directory with search and filters by `aging_bucket`, `invoice_type`, `customer_segment` (sponsor, exhibitor, attendee, supplier). Each row shows total outstanding and a colored aging chip (green = current, yellow = d_0_30, amber = d_31_60, orange = d_61_90, red = d_90_plus). Top-right: the selected customer's invoice ledger, with each invoice's milestone schedule visualized as a horizontal progress bar (signed/paid/unpaid segments). Middle-left: an AR aging heatmap (customers x aging buckets), highlighting concentration risk. Middle-right: a "Downgraded Entitlements" watchlist showing sponsors whose entitlements are currently auto-downgraded with a one-tap "Restore" action (gated by FAL approval). Bottom: a payment processor feed showing real-time Stripe charge events, Plaid verifications, and SWIFT MT103 receipts.

The SSL's view is filtered to their own book of business with a "Past-Due Sponsors" panel showing countdown timers to the 15-day auto-downgrade trigger. The RM's view is filtered to registration_fee invoices with a "Failed Payments Retry" queue. The Attendee App (Module 7.1) shows the attendee their invoice status with a "Retry Payment" deep link and a countdown to the 7-day cancellation deadline.

### G. Failure Modes & Offline Behavior

- **Stripe API outage during checkout:** The Integration Hub falls back to a "Pay Later" workflow where the attendee's registration is held in `pending_payment` for 24 hours and a payment link is emailed via SendGrid; the attendee can complete payment when Stripe returns.
- **Avalara / Stripe Tax API outage:** The engine computes tax using a fallback rate table (last-known-good rates per jurisdiction) and flags the invoice with `tax_calculation_method = fallback`; the FAL is alerted to re-validate tax once the API returns.
- **Plaid verification failure:** Bank-transfer payment is blocked; the customer is offered Stripe credit card or SWIFT wire as alternatives.
- **NetSuite AR sync outage:** Invoices and payments are queued locally with a 24-hour TTL; the FAL sees a "NetSuite Sync Delayed: N entries queued" banner; local FMF state remains authoritative for aging computation.
- **Twilio SMS delivery failure:** The Integration Hub falls back to SendGrid email + in-app push notification via Module 7.3; the failure is logged in the payment's `audit_log`.
- **Stripe Smart Retries exhausted with no successful payment:** The engine transitions `payment_status` to `cancelled` after the configured 7-day window (for attendee registration) or escalates to FAL + SSL for sponsor invoices (no automatic cancellation for sponsors; the auto-downgrade workflow is the primary lever).
- **SWIFT MT103 statement file delayed:** Bank wire payments received but not yet parsed are held in a "Pending Wire Matching" queue; the FAL can manually match a wire to an invoice.

### H. Acceptance Criteria

- **Given** a Platinum sponsor with US$ 360,000 outstanding on the T-60 milestone and 15 days past due, **When** the daily AR aging job runs, **Then** the engine publishes `invoice.entitlements_downgraded` with `severity = s2`, the Module 5.1 subsystem downgrades the sponsor to Gold (VIP invitations 25 -> 12, booth 72 -> 48 sqm, speaking slot retracted, 2 of 4 meeting rooms released), the sponsor's portal shows a restoration banner, the SSL is paged via PagerDuty within 60 seconds, and the downgrade is recorded in both `invoice.audit_log` and the sponsor_deal's `audit_log`.
- **Given** an attendee's registration invoice with `payment_method = credit_card` and the first charge declined (insufficient_funds), **When** the Stripe webhook reports the failure, **Then** the engine publishes `invoice.payment_failed`, enrolls the invoice in Stripe Smart Retries with up to 4 retries over 14 days, sends an email + SMS to the attendee with a retry deep link, and holds the registration in `pending_payment` for 7 days; if no successful payment by Day 7, the engine cancels the registration and refunds any partial payment held in escrow.
- **Given** a `sponsor.deal.confirmed` event arrives for a Platinum sponsor at US$ 1.2M, **When** the engine processes the event, **Then** it auto-creates an `invoice` with `invoice_type = sponsorship`, `payment_terms = milestone_3_stage`, `milestone_schedule` populated with three stages (40% signing, 30% T-60, 30% event day), the first milestone becomes immediately due, and `invoice.issued` is published within 60 seconds.
- **Given** a tax-exempt sovereign delegation customer with a `tax_exemption_certificate`, **When** the engine issues an invoice to this customer, **Then** `tax_amount_local` is set to 0, the certificate is validated against Avalara's Exemption Registry, the exemption is flagged for periodic re-validation (default 12 months), and the FAL sees the exemption in the AR ledger.
- **Given** a past-due sponsor invoice that has been auto-downgraded, **When** the sponsor pays the outstanding milestone in full, **Then** the engine publishes `invoice.entitlements_restored` only after the FAL explicitly approves the reactivation, the Module 5.1 subsystem re-activates Platinum entitlements, the released booth space is re-allocated (with any interim Gold-tier exhibitor relocated by Module 5.2), and `downgrade_lifted_at` is timestamped.
