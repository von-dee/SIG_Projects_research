> Module 9: Finance & Administration Module -> 9.1 Budget Pacing Engine

## Budget Pacing Engine

### A. Purpose Statement

The Budget Pacing Engine is the authoritative financial control plane for the Future Minerals Forum. At FMF scale, the operating budget across pre-event, on-event, and post-event phases exceeds US$ 32M, distributed across 11 departments (Protocol, Production, Venue, Catering, Transport, Security, Marketing, Technology, Travel, Staffing, Contingency) and 280+ line items. Without real-time pacing, a single untracked commitment cascade (e.g., a motorcade upgrade, a premium caterer substitution, a last-minute helicopter dispatch) can quietly consume a department's contingency before the FAL notices. This subsystem exists so that every financial commitment, whether planned, committed via PO, or actually invoiced, is reconciled against a hierarchical budget structure in near real time, with multi-currency FX risk surfaced before it materializes.

The subsystem is the write-side owner of the `budget.*` Kafka topic prefix per the Module 0.1 bounded context table. It publishes `budget.allocation.confirmed`, `budget.commitment.posted`, `budget.actual.posted`, `budget.forecast.revised`, `budget.line.blocked`, `budget.line.unblocked`, `budget.fx.rate.updated`, `budget.pacing.alert`, and `budget.variance.threshold_breached`. It subscribes to `supplier.po.issued` and `supplier.payment.released` (Module 8.2) to post committed and actual amounts respectively, to `invoice.received` (Module 9.2) for actuals recognition, to `session.published` and `session.cancelled` (Module 4.1) to provision or release associated budget lines, and to `sponsor.deal.confirmed` (Module 5.1) to recognize sponsor-funded contra-budget lines. Its non-negotiable contract is that no PO above the US$ 10K threshold may be issued without a budget line with sufficient uncommitted runway, and that every FX-moved payment is recorded with both original and event-local amounts plus the realized gain/loss.

### B. User Roles & Permissions

- **Event Director (ED):** Read on the full budget hierarchy. Write only via break-glass on fund release for overspent lines (requires co-approval by FAL) and on contingency reallocation between departments (requires FAL co-sign).
- **Operations Lead (OL):** Read on departmental budgets for their own scope. Write on commitment forecasts (submitting expected POs), no write on planned amounts or approval thresholds.
- **Protocol Officer (PO):** Read-only on Protocol department budget lines (motorcade, banquet, gift program). No write.
- **VIP Liaison (VL):** Read-only on Protocol line items tied to their assigned dignitary. No write.
- **Registration Manager (RM):** Read on Registration and Badging line items only. No write.
- **Sponsorship Sales Lead (SSL):** Read on contra-budget lines funded by sponsorships (e.g., sponsor-funded AV upgrades). Write on contra-budget commitment forecasts, subject to FAL approval.
- **Exhibitor Portal User (EPU):** No access to the budget module.
- **Content & Stage Manager (CSM):** Read on Production and Stage department budgets. Write only on production commitment forecasts (e.g., staging equipment rental expectations).
- **Matchmaking Concierge (MC):** No direct access.
- **Finance & Administration Lead (FAL):** Primary owner. Read/write on the entire hierarchy: planned amounts, approval thresholds, FX rate overrides, forecast revisions, line-block overrides (with ED co-approval for overspent releases). The FAL is the secondary approver on all break-glass fund releases.
- **Marketing & PR Lead (MPL):** Read on Marketing department budget only. Write on campaign commitment forecasts.
- **ESG & Sustainability Officer (ESGO):** Read on all budget lines for ESG-tagged spend (e.g., carbon offset budget, supplier diversity premium). Write only on ESG cost attribution rubric.
- **Field Volunteer (FV):** No direct access.
- **Attendee (ATT):** No access.
- **Chief Financial Officer (CFO):** External co-signer referenced in approval thresholds above US$ 100K; consumes via exported approval packets, not a daily system user.

### C. Data Model

`budget_allocation` (top-level event budget envelope; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | FAL |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{netsuite_budget_id, sap_internal_order_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `event_local_currency` | `char(3)` | ISO 4217, e.g., "SAR" for FMF |
| `total_planned_local` | `numeric(15,2)` | Top-down approved envelope |
| `total_committed_local` | `numeric(15,2)` | Sum of POs issued |
| `total_actual_local` | `numeric(15,2)` | Sum of invoices received |
| `total_forecast_local` | `numeric(15,2)` | ETC projection to event close |
| `fx_rate_source` | `enum[currencycloud, wise, manual]` | Daily pull provider |
| `fx_rate_last_pull_at` | `timestamptz` | Most recent rate refresh |
| `contingency_reserve_pct` | `numeric(5,2)` | Default 8.0% reserved for unplanned |
| `approval_threshold_tier1_usd` | `numeric(10,2)` | FAL-only approval ceiling (default 10,000) |
| `approval_threshold_tier2_usd` | `numeric(10,2)` | ED co-sign ceiling (default 100,000) |
| `approval_threshold_tier3_usd` | `numeric(10,2)` | CFO co-sign ceiling (default 1,000,000) |

`budget_line` (hierarchical node; parent_id self-referencing for the event -> department -> category -> line item tree; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | FAL |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{netsuite_account_id, sap_cost_center}` |
| `audit_log` | `jsonb[]` | Append-only |
| `budget_allocation_id` | `uuid` | FK -> budget_allocation.id |
| `parent_id` | `uuid null` | Self-FK for hierarchy |
| `node_type` | `enum[event, department, category, line_item]` | Hierarchy level |
| `department_code` | `text null` | Required for node_type = department |
| `planned_local` | `numeric(15,2)` | Approved planned amount in event-local currency |
| `committed_local` | `numeric(15,2)` | Aggregated from POs (Module 9.3) |
| `actual_local` | `numeric(15,2)` | Aggregated from received invoices |
| `forecast_local` | `numeric(15,2)` | Projected final spend |
| `original_currency` | `char(3) null` | If line item in non-local currency, e.g., "USD", "EUR", "JPY" |
| `planned_original` | `numeric(15,2) null` | Planned in original currency |
| `committed_original` | `numeric(15,2) null` | Committed in original currency |
| `actual_original` | `numeric(15,2) null` | Actual in original currency |
| `fx_rate_at_commit` | `numeric(10,6) null` | Rate locked at PO issuance |
| `fx_rate_at_actual` | `numeric(10,6) null` | Rate locked at invoice receipt |
| `fx_gain_loss_local` | `numeric(15,2) null` | Realized gain/loss vs commit rate |
| `block_status` | `enum[open, soft_blocked, hard_blocked, override_released]` | Pacing control |
| `block_reason` | `text null` | e.g., "overspend_15pct" |
| `block_lifted_at` | `timestamptz null` | When override_released |
| `block_lifted_by` | `uuid null` | FAL or ED |
| `block_lifted_approver` | `uuid null` | Required co-signer |

`budget_fx_rate` (daily FX rate snapshot; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Integration Hub service account |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{currencycloud_rate_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `base_currency` | `char(3)` | Event-local currency |
| `quote_currency` | `char(3)` | Foreign currency |
| `rate` | `numeric(10,6)` | 1 base = N quote |
| `rate_date` | `date` | Effective business day |
| `source` | `enum[currencycloud, wise, manual_override]` | |
| `mid_rate` | `numeric(10,6)` | Mid-market reference |
| `buy_margin_bps` | `int` | Spread applied for payables |
| `sell_margin_bps` | `int` | Spread applied for receivables |

`budget_pacing_alert` (event-sourced pacing warnings; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Pacing Engine service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{pagerduty_incident_id, powerbi_dataset_row_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `budget_line_id` | `uuid` | FK -> budget_line.id |
| `alert_type` | `enum[overspend_threshold, burn_rate_exceeded, runway_short, fx_variance, forecast_drift, commitment_concentration]` | |
| `severity` | `enum[s0, s1, s2, s3]` | Reuses Module 1.2 scale |
| `threshold_breach_pct` | `numeric(5,2)` | e.g., 15.00 for 15% overspend |
| `burn_rate_per_day_local` | `numeric(12,2)` | actual / days_elapsed |
| `remaining_runway_days` | `int` | Days until forecast_local exhausts contingency |
| `acknowledged_by` | `uuid null` | FAL or ED |
| `acknowledged_at` | `timestamptz null` | |

### D. Business Logic & Edge Cases

- **IF** a new `budget_line` is created with `node_type = line_item` and a `parent_id` referencing a `category` node, **THEN** the engine validates that `planned_local <= parent.remaining_planned`, computes `remaining_planned = planned_local - SUM(children.planned_local)`, and rejects with `BUDGET_PARENT_EXHAUSTED` if exceeded.
- **IF** the Module 9.3 procurement service publishes `supplier.po.issued` for an amount exceeding the referenced `budget_line`'s `planned_local - committed_local` runway, **THEN** the engine blocks the PO issuance at the application layer with `BUDGET_RUNWAY_INSUFFICIENT`, publishes `budget.line.blocked`, and surfaces a Tier-1 approval queue entry to the FAL.
- **IF** a PO amount is below US$ 10,000, **THEN** FAL-only approval is required and the engine advances `committed_local` upon FAL sign.
- **IF** a PO amount is between US$ 10,000 and US$ 100,000, **THEN** the engine requires ED co-sign in addition to FAL approval, both approvals are recorded in `audit_log` with timestamped signatures, and the PO is held in `pending_approval` until both signatures are present.
- **IF** a PO amount exceeds US$ 100,000, **THEN** the engine requires CFO co-sign; the Integration Hub generates an approval packet (PO, supplier profile, budget_line context, ESGO impact summary if ESG-tagged) and emails it to the CFO via DocuSign; the PO cannot advance until the envelope completes.
- **IF** at any moment during the live event window `actual_local > planned_local * 1.15` for any `budget_line`, **THEN** the engine sets `block_status = hard_blocked`, publishes `budget.variance.threshold_breached` with `severity = s2`, pages the FAL via PagerDuty, and blocks all further PO issuances against that line until FAL and ED jointly sign a release that increments `planned_local` (contingency reallocation) or explicitly authorizes overspend against event contingency reserve.
- **IF** the daily FX rate pull moves more than 3% against the event-local currency for any open commitment (`committed_original > 0` and `actual_original = 0`), **THEN** the engine publishes `budget.fx.rate.updated` with `severity = s1` and recomputes `committed_local` at the new rate, surfacing FX exposure to the FAL.
- **IF** the burn rate for a department exceeds the planned burn rate by more than 20% at the halfway mark of the event timeline, **THEN** the engine publishes `budget.pacing.alert` with `alert_type = burn_rate_exceeded` and `severity = s1`, and the FAL's dashboard highlights the department in amber.

**Edge case (non-obvious): budget line overspent by 15% mid-event.** At 14:30 on Day 2 of FMF, the Catering department's "VIP Reception Beverages" line item, planned at SAR 480,000 (approximately US$ 128,000 at commit rate), has `actual_local = SAR 552,000` (15% over) due to three back-to-back dignitary additions per Module 8.3's last-minute-cover edge case. The Pacing Engine's hourly reconciliation job detects the breach, transitions `budget_line.block_status` from `open` to `hard_blocked`, publishes `budget.variance.threshold_breached` with `severity = s2`, pages FAL via PagerDuty, and within 60 seconds surfaces on the ED's War Room tile (Module 1.1) a red "Catering - VIP Reception Beverages - Blocked" card. The block applies at the application layer: any new PO referencing this `budget_line_id` returns `BUDGET_LINE_HARD_BLOCKED` from the procurement service (Module 9.3). The FAL's modal offers three remediation paths: (1) reallocate contingency from the Protocol department's unspent "Gift Program" line (requires FAL + ED co-sign; engine validates that the donor line retains >= 10% runway after reallocation), (2) negotiate a revised scope with the caterer (requires OL + FAL co-sign and a Caterer Change Order via Coupa per Module 8.2), or (3) escalate to ED break-glass for explicit overspend authorization against event contingency reserve (requires FAL + ED + CFO triple sign if the cumulative contingency draw exceeds 50%). All actions are recorded in `audit_log` with `actor_id`, `approver_id`, `prior_planned_local`, `new_planned_local`, `prior_block_status`, `new_block_status`, and `justification`. On release, `block_status` transitions to `override_released`, `block_lifted_at` is set, and the engine publishes `budget.line.unblocked`.

**Edge case (non-obvious): sponsor pays in non-budget currency and FX moves 8% between invoice and payment.** A Platinum sponsor's contract stipulates payment in JPY 33,000,000 (approximately US$ 220,000 at contract signing). The sponsor_deal is mirrored as a contra-budget line in `budget_line` with `original_currency = "JPY"`, `planned_original = 33,000,000`, and the FX rate at signing (JPY/USD = 0.00667) is locked in `fx_rate_at_commit`. The invoice is issued on T-90 (Module 9.2). At payment receipt on T-30, the FX rate has moved 8% (JPY weakened to JPY/USD = 0.00613), meaning the same JPY 33,000,000 now translates to US$ 202,290. The engine computes `fx_gain_loss_local = (fx_rate_at_actual - fx_rate_at_commit) * actual_original`, posts `actual_local` at the new rate, publishes `budget.fx.rate.updated` with `alert_type = fx_variance` and `severity = s1`, and surfaces to the FAL a realized FX loss of US$ 17,710 (8% adverse). The post-event P&L view (Module 9.4 audit trail and the post-event analytics Module 12.2) reports this as a separate "FX Realized Gain/Loss" line, distinct from the original sponsorship revenue recognition, so ESGO and the CFO can attribute it correctly. The FAL has the option (within 5 business days post-event) to hedge future sponsor contracts of similar currency exposure via CurrencyCloud Forward Contract API, which the engine surfaces as a recommendation.

### E. Third-Party Integrations

- **NetSuite or SAP S/4HANA (general ledger system of record):** Bidirectional sync. The FMF budget hierarchy maps to NetSuite Budgets or SAP Internal Orders. Data flow: FMF -> Integration Hub -> NetSuite/SAP (planned amounts and reclassifications); NetSuite/SAP GL actuals webhook -> Integration Hub -> `budget_line.actual_local` updates. Every `budget.commitment.posted` and `budget.actual.posted` event triggers a corresponding GL journal entry.
- **CurrencyCloud or Wise (FX rate provider):** Daily scheduled pull at 06:00 event-local time via the CurrencyCloud Rates API or Wise Business API. Data flow: Provider -> Integration Hub -> `budget_fx_rate` table. Real-time rate pull on demand when a new PO is issued with `original_currency != event_local_currency` (locks `fx_rate_at_commit` for that line).
- **Microsoft Power BI or Tableau (budget dashboards):** The Pacing Engine streams a denormalized `budget_pacing_fact` view to Power BI via push datasets (or Tableau via Hyper file extract every 5 minutes). Data flow: FMF -> Integration Hub -> Power BI / Tableau. Read-only dashboards surface burn rate, remaining runway, FX exposure, and departmental pacing for the FAL, ED, and (read-only filtered) departmental OLs.
- **DocuSign (CFO co-sign packets):** For Tier-3 approvals (PO > US$ 100K), the engine composes an approval packet (PO summary, supplier profile, budget_line context, ESG impact if tagged) and dispatches via the DocuSign eSignature API. Data flow: FMF -> DocuSign -> CFO email; DocuSign webhook (envelope-completed) -> Integration Hub -> PO advances.
- **PagerDuty (severe pacing alerts):** `budget.variance.threshold_breached` with `severity >= s2` triggers PagerDuty page to the FAL and ED.
- **Workday Financials (HR-side cost center reconciliation):** Cross-checks staff cost allocations from Workday HCM against `budget_line.actual_local` for the Staffing department; mismatches trigger a reconciliation task in the FAL queue.
- **Kafka topics:** Publishes `budget.*` (full list above). Subscribes to `supplier.po.issued` and `supplier.payment.released` (Module 8.2), `invoice.received` (Module 9.2), `session.published` and `session.cancelled` (Module 4.1), `sponsor.deal.confirmed` (Module 5.1).

### F. UI/UX Notes

The FAL's primary screen is a four-panel layout. Top-left: a treemap of the budget hierarchy (event -> department -> category -> line item), each cell color-coded by pacing health (green = on plan, amber = burn rate exceeding plan by 10-20%, red = hard blocked or > 20% variance). Clicking a cell drills into the line item detail. Top-right: the selected line item's pacing chart with planned (gray), committed (blue), actual (green), and forecast (dashed orange) curves over the event timeline; a horizontal red dashed line marks the planned ceiling; a yellow band marks the 15% overspend threshold. Bottom-left: a live "Pending Approvals" queue organized by Tier (Tier-1 FAL-only, Tier-2 ED co-sign, Tier-3 CFO co-sign), each card showing PO amount, supplier, budget line, and pacing impact. Bottom-right: an FX exposure panel listing open commitments with non-local currency, their locked rate, current rate, and unrealized gain/loss.

The ED's War Room view (Module 1.1) consumes a budget pacing tile showing the top 5 most-over-budget lines across the event, with one-tap drill-down to the FAL's detail view. The OL's per-department view is read-only on planned amounts but allows commitment forecasts to be submitted. The ESGO view overlays ESG-tagged spend as a green tint on the treemap.

### G. Failure Modes & Offline Behavior

- **NetSuite API outage:** The Integration Hub queues GL journal entries locally with a 24-hour TTL; the FAL sees a "GL Sync Delayed: N entries queued" banner. Local FMF state remains authoritative for pacing decisions.
- **CurrencyCloud / Wise API outage at 06:00 daily pull:** The engine retains the prior day's rate and surfaces a "Stale FX Rates" warning to the FAL; mid-day manual override is available via `fx_rate_source = manual_override` with FAL + ED co-sign and a `justification` entry in `audit_log`.
- **Power BI push dataset failure:** The dashboard falls back to a 5-minute-refresh cached view; pacing alerts continue to flow via PagerDuty and in-app notifications independent of the BI tool.
- **DocuSign envelope for CFO co-sign expires:** The Integration Hub re-issues the envelope with a 48-hour extension and notifies the FAL; the PO remains in `pending_approval` and cannot advance.
- **Pacing Engine reconciliation job failure (e.g., database deadlock):** The job retries 3 times with 5-minute exponential backoff; on final failure it alerts the FAL and falls back to a per-event `budget_line.actual_local` trigger from the `supplier.payment.released` consumer.
- **OL mobile device offline during a commitment forecast submission:** The OL's forecast is queued locally in the Staff App (Module 7.2) per the Module 7.4 Offline Sync Engine and replays within 60 seconds of reconnect; the forecast is marked `submitted_at_offline` so the FAL can see it landed late.
- **FX rate manipulation attempt (manual_override with anomalous rate):** The engine rejects any `manual_override` that deviates more than 5% from the mid_rate and requires ED + CFO triple sign for any override above 5% deviation.

### H. Acceptance Criteria

- **Given** a `budget_line` with `planned_local = SAR 480,000` and `actual_local = SAR 552,000` (15% over), **When** the hourly reconciliation job runs, **Then** the engine transitions `block_status` to `hard_blocked`, publishes `budget.variance.threshold_breached` with `severity = s2`, pages the FAL via PagerDuty within 60 seconds, surfaces a red card on the ED's War Room tile, and blocks any further PO issuance against that line with `BUDGET_LINE_HARD_BLOCKED` until FAL and ED jointly sign an override release recorded in `audit_log`.
- **Given** a sponsor contract denominated in JPY 33,000,000 with `fx_rate_at_commit = 0.00667`, **When** the payment is received 60 days later with `fx_rate_at_actual = 0.00613`, **Then** the engine computes `fx_gain_loss_local = -US$ 17,710` (8% adverse), publishes `budget.fx.rate.updated` with `alert_type = fx_variance` and `severity = s1`, records the realized loss in a separate "FX Realized Gain/Loss" P&L line, and surfaces a hedging recommendation to the FAL via CurrencyCloud Forward Contract API.
- **Given** a PO for US$ 75,000 referencing a budget_line with sufficient runway, **When** the OL submits the PO for approval, **Then** the engine requires both FAL and ED co-sign, holds the PO in `pending_approval`, and the `committed_local` is not incremented until both signatures are recorded with timestamps in `audit_log`.
- **Given** a PO for US$ 250,000 requiring Tier-3 approval, **When** the FAL approves the PO, **Then** the engine generates a DocuSign envelope to the CFO containing PO, supplier profile, budget line context, and ESG impact summary, the PO cannot advance to `committed` until the DocuSign envelope completes, and the envelope ID is recorded in `ext_refs.docusign_envelope_id`.
- **Given** the daily FX rate pull reports a 4% adverse movement on EUR/SAR with EUR 500,000 in open commitments, **When** the new rate is written to `budget_fx_rate`, **Then** the engine publishes `budget.fx.rate.updated` with `severity = s1`, recomputes `committed_local` for all affected lines, and surfaces FX exposure to the FAL within 5 minutes.
