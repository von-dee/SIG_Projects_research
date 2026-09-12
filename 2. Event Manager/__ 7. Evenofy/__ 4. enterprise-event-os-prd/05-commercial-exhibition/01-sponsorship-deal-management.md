> Module 5: Commercial & Exhibition Management -> 5.1 Sponsorship Deal Management

## Sponsorship Deal Management

### A. Purpose Statement

The Sponsorship Deal Management subsystem is the commercial backbone of the FMF-class event. It tracks every sponsor relationship from first prospecting touch through final post-event reconciliation, and it is the single source of truth for which sponsor has paid for which entitlements, who has signed which contract, and which visible branding, speaking slots, badge quotas, and meeting pods may be exposed across the rest of the platform. At FMF scale, sponsorship revenue is the largest single line of the event P&L (target US$ 38M for FMF 2026 across 80+ sponsors). Every downstream subsystem in Modules 4, 6, 7, and 9 consumes the entitlement snapshot produced here: booth allocation (5.2) reads the booth_count entitlement; the Exhibitor Portal (5.3) reads the staff_quota entitlement; the Lead Capture ROI Engine (5.4) reads the post_event_report_access flag; the Mobile App reads the branding_placement list to render sponsor logos in the right positions on the home screen and session detail pages; Finance (Module 9) reads the deal stage to drive invoice issuance and GL posting.

The subsystem is distinct from generic CRM. A CRM (Salesforce, HubSpot) owns the *sales pipeline* (contacts, opportunities, activities) but is not authoritative for entitlements or for the financial contract state. The Sponsorship Deal Management subsystem owns the *deal* as a domain object: a deal has a tier, a contracted fee, a signed contract artifact, a payment schedule, an entitlement snapshot, and a lifecycle that drives visible platform behavior. CRM sync is bidirectional but the deal state machine is canonical in this subsystem, not in CRM. The Integration Hub (MuleSoft Anypoint or Workato per Module 0.1) mediates all CRM writes to preserve idempotency and to land failed writes in a dead-letter queue visible to the War Room.

At FMF scale, the subsystem must handle 80-120 active deals across 5 tiers, 4-6 simultaneous negotiations during peak sales cycles (8-12 weeks before event), 4 bespoke "Strategic Partner" deals requiring ED-level custom clause negotiation, and 100% audit traceability for 7 years per regulatory and diplomatic audit requirement. Money fields are stored as `numeric(18,3)` with `currency_code` ISO 4217 per Module 0.1 conventions.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all deals. Write only via break-glass for category exclusivity overrides and Strategic Partner custom clause approval; two-person approval required (ED + FAL for financial overrides, ED + CSM for branding/speaking overrides). Sees the "Sponsor Revenue Pacing" tile in the War Room with target-vs-actual by tier.
- **Operations Lead (OL):** Read-only on the deal list (no financial fields). Sees entitlement summary only, used for floor staffing and F&B planning.
- **Protocol Officer (PO):** No direct access. Receives a derived "Sponsor-Dignitary Interaction" report when a sponsor's entitled VIP access overlaps a rank 1-3 dignitary's schedule; cannot modify deals.
- **VIP Liaison (VL):** No direct access. Sees only the "VIP sponsor breakfast attendee list" derived view for their assigned dignitary.
- **Registration Manager (RM):** Read-only on the `staff_quota` and `attendee_quota` entitlements for badge capacity planning. Cannot see financial fields.
- **Sponsorship Sales Lead (SSL):** Primary owner. Read/write on all deals in stages `lead` through `verbal_commit`; write on `contract_signed` and later stages requires FAL co-sign for financial finalization. Can create custom clauses with break-glass approval from ED. Cannot delete a deal (soft-delete only, with ED approval). Owns the deal pipeline Kanban view.
- **Exhibitor Portal User (EPU):** Read-only on their own company's deal summary (tier, entitlements, payment status). Cannot see the contracted fee. Cannot modify the deal.
- **Content & Stage Manager (CSM):** Read-only on the `speaking_slot_count` and `branding_placement` entitlements for stage run sheet and lower-third planning. Cannot modify deals.
- **Matchmaking Concierge (MC):** Read-only on `matchmaking_meeting_slot_count` per sponsor for meeting pod allocation. Cannot modify deals.
- **Finance & Administration Lead (FAL):** Read on all deals (including financial fields). Write only on stages `invoice_issued` and `payment_received` (GL posting). Co-signs financial break-glass approvals with ED. Cannot modify commercial terms or entitlements.
- **Marketing & PR Lead (MPL):** Read-only on the sponsor list and branding placements for press kit and partner announcement scheduling. Cannot modify deals.
- **ESG & Sustainability Officer (ESGO):** Read-only on sponsor company sustainability commitments (e.g., carbon offset pledge) captured in the deal record for the post-event ESG report.
- **Field Volunteer (FV):** No access.
- **Attendee (ATT):** No direct access. Sees sponsor logos in the Mobile App only after the deal stage has reached `contract_signed`.

### C. Data Model

`sponsor_deal` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete (ED approval required) |
| `ext_refs` | `jsonb` | e.g., `{salesforce_opportunity_id, hubspot_deal_id, docusign_envelope_id, netsuite_invoice_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `sponsor_company_id` | `uuid` | FK -> sponsor_company.id |
| `tier` | `enum[platinum, gold, silver, bronze, strategic_partner]` | The contracted tier |
| `effective_tier` | `enum[platinum, gold, silver, bronze, strategic_partner]` | The tier actually applied (may be downgraded from `tier` for late payment; defaults equal to `tier`) |
| `contracted_fee` | `numeric(18,3)` | Total contracted sponsorship fee |
| `currency_code` | `char(3)` | ISO 4217, e.g., `USD`, `SAR` |
| `industry_category` | `text` | e.g., "Mining - Diversified", "Banking - Investment", "Energy - Renewables" |
| `category_exclusivity_approved` | `bool` | True if ED approved override on a category conflict |
| `stage` | `enum[lead, qualified, proposal_sent, negotiation, verbal_commit, contract_signed, invoice_issued, payment_received, fulfilled, closed]` | Lifecycle |
| `stage_history` | `jsonb[]` | Array of `{stage, actor, occurred_at, reason}` |
| `contract_signed_at` | `timestamptz null` | When contract e-signed |
| `payment_due_at` | `timestamptz null` | Net 30 from contract signature unless overridden |
| `payment_received_at` | `timestamptz null` | When full payment confirmed in NetSuite |
| `downgrade_applied_at` | `timestamptz null` | Set when auto-downgrade triggers (see Edge Case 1) |
| `restored_at` | `timestamptz null` | Set when payment received post-downgrade |
| `entitlement_snapshot_id` | `uuid` | FK -> entitlement_snapshot.id; the current effective snapshot |
| `custom_clauses` | `jsonb[]` | Array of `{clause_id, description, approved_by, approved_at}`; non-standard entitlements |
| `salesforce_opportunity_id` | `text` | Mirror of ext_refs.salesforce_opportunity_id for query convenience |

`sponsor_company` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{salesforce_account_id, hubspot_company_id, crunchbase_permalink}` |
| `audit_log` | `jsonb[]` | Append-only |
| `legal_name` | `text` | e.g., "BHP Group Limited" |
| `trading_name` | `text` | e.g., "BHP" |
| `industry_category` | `text` | Same enum domain as sponsor_deal.industry_category |
| `country_code` | `char(2)` | ISO 3166-1 alpha-2 |
| `website_url` | `text` | For branding link validation |
| `logo_asset_id` | `uuid` | FK -> content_asset.id (Module 4.4) |
| `sustainability_pledge` | `text null` | Free text captured for ESGO report |

`entitlement_snapshot` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{quote_revision_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `sponsor_deal_id` | `uuid` | FK -> sponsor_deal.id |
| `tier` | `enum[platinum, gold, silver, bronze, strategic_partner]` | Tier this snapshot represents |
| `booth_count` | `int` | e.g., Platinum = 2, Gold = 1, Silver = 1, Bronze = 0, Strategic Partner = negotiated |
| `booth_sqm_total` | `numeric(8,2)` | Sum of booth sizes |
| `branding_placements` | `jsonb[]` | Array of `{placement_code, asset_id}` e.g., `[{placement_code: "main_stage_backdrop", asset_id: "..."}, {placement_code: "lanyard_logo", asset_id: "..."}]` |
| `speaking_slot_count` | `int` | e.g., Platinum = 1 keynote (15 min), Gold = 1 panel seat |
| `attendee_quota` | `int` | Complimentary attendee passes |
| `vip_access_count` | `int` | VIP lounge access passes |
| `matchmaking_meeting_slot_count` | `int` | Reserved meeting pods per day |
| `post_event_report_access` | `bool` | Whether sponsor receives the post-event ROI report (Platinum/Gold/Strategic only) |
| `staff_quota` | `int` | Booth staff badges |

`entitlement_template` (extends shared columns): canonical tier-to-entitlement matrix used at deal creation; not modified per deal.

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{salesforce_pricebook_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `tier` | `enum[platinum, gold, silver, bronze, strategic_partner]` | Unique per event |
| `fee_min` | `numeric(18,3)` | e.g., Platinum min 2,000,000; Gold min 750,000 |
| `fee_max` | `numeric(18,3)` | e.g., Platinum max null (no upper); Gold max 2,000,000 |
| `default_entitlements` | `jsonb` | Default snapshot of entitlements for this tier |

### D. Business Logic & Edge Cases

- IF `stage` transitions to `contract_signed` THEN set `contract_signed_at = now()`, set `payment_due_at = now() + interval '30 days'` (unless overridden in custom_clauses), set `effective_tier = tier`, freeze `tier` (further tier changes require break-glass), and publish `sponsor.deal.signed` on Kafka topic `sponsor.deal`.
- IF `stage` is `invoice_issued` THEN FAL triggers NetSuite GL posting via Integration Hub; on success, set `ext_refs.netsuite_invoice_id` and publish `sponsor.deal.invoiced` on `sponsor.deal`.
- IF `payment_received_at` is set THEN `stage` transitions to `payment_received`, `effective_tier` is restored to `tier` if previously downgraded (see Edge Case 1), publish `sponsor.deal.payment_received`.
- IF `payment_due_at < now() AND payment_received_at IS NULL AND tier = 'platinum' AND now() - payment_due_at > interval '30 days'` THEN trigger auto-downgrade: set `effective_tier = 'gold'`, set `downgrade_applied_at = now()`, rebuild `entitlement_snapshot` from `entitlement_template` for `gold` tier, publish `sponsor.deal.downgraded` on `sponsor.deal` with payload `{from: platinum, to: gold, reason: payment_overdue_30d}`. The downgrade is *visible* (branding, speaking slot, booth count adjusted to Gold entitlements) but the *contract* tier remains `platinum` so contractual obligations are unaffected; only visible entitlements are gated. SSL and EPU are notified via Twilio SMS and email (SendGrid). On `payment_received_at` set, `effective_tier = tier` and `restored_at = now()`; the entitlement snapshot is rebuilt to Platinum values, and a `sponsor.deal.restored` event is published.
- IF a new deal is created with `sponsor_company.industry_category` matching an existing `contract_signed` deal in the same `industry_category` THEN raise a `category_exclusivity_conflict` warning at deal creation. The conflict requires ED break-glass approval (with ED + FAL co-sign for deals > US$ 500K) to override. The conflict is captured in `custom_clauses` with `clause_id = "category_exclusivity_override"`. Without approval, the deal cannot progress beyond `qualified`.
- IF `tier = 'strategic_partner'` THEN `contracted_fee` and all entitlements are negotiated individually; `entitlement_template` is not applied. Every custom entitlement must be captured in `custom_clauses` with ED approval. No two Strategic Partner deals may overlap on `branding_placements` (e.g., only one Strategic Partner may have the "main_stage_backdrop" placement per event).
- IF a deal is in stage `closed` THEN no further mutations are permitted except via ED break-glass. The deal record remains in the System for 7 years per regulatory audit requirement (per Module 0.1).
- IF an EPU views their deal summary THEN the System masks `contracted_fee`, `fee_min`, `fee_max`, and `payment_due_at`; only `tier`, `effective_tier`, `stage` (mapped to a public label), and entitlements are visible.
- IF the Integration Hub fails to sync a deal update to Salesforce within 3 retries THEN the failed payload lands in the DLQ and an on-call integration engineer is paged; the deal state in this subsystem remains canonical.
- IF the DocuSign envelope for a contract is voided THEN the deal reverts from `contract_signed` back to `negotiation` with `stage_history` capturing the void reason; branding, speaking slots, and booth allocations based on this deal are released back to inventory.
- IF `currency_code != 'USD'` THEN the contracted fee is converted to USD at the exchange rate on `contract_signed_at` for revenue pacing tiles in the War Room; the source currency amount remains canonical in the deal record.

**Edge Case 1 (Non-obvious): Platinum sponsor payment 30 days past due.** A Platinum sponsor (contracted US$ 2.5M) signs 60 days before event. Payment is due 30 days after signature. The sponsor's AP department delays payment by 31 days. The System automatically downgrades `effective_tier` to `gold`, rebuilds the entitlement snapshot (booth_count 2 -> 1, speaking_slot_count 1 keynote -> 1 panel seat, branding_placements main_stage_backdrop removed, vip_access_count 20 -> 8, matchmaking_meeting_slot_count 12 -> 6), and notifies SSL + EPU via Twilio SMS + SendGrid email. The CSM is notified to remove the main_stage_backdrop asset from the Module 4.1 stage run sheet. The Mobile App (Module 7) hides the sponsor logo from the home screen sponsor carousel. The booth allocation (5.2) automatically releases the second booth back to inventory. On payment receipt (confirmed via NetSuite webhook), `effective_tier` is restored to `platinum`, the entitlement snapshot is rebuilt, and the CSM and Mobile App receive `sponsor.deal.restored` events. The window for restoration closes at `event.start_time - interval '24 hours'`; after that, restoration requires ED break-glass approval because floor operations have frozen.

**Edge Case 2 (Non-obvious): Category exclusivity conflict.** Two major diversified mining companies (e.g., Company A and Company B) are both prospects in the pipeline. SSL moves Company A to `contract_signed` at Platinum tier with category exclusivity on "Mining - Diversified". Two weeks later, SSL begins negotiating Company B at Gold tier. At deal creation, the System detects that `sponsor_company.industry_category = "Mining - Diversified"` matches Company A's signed deal and raises a `category_exclusivity_conflict`. The deal cannot progress beyond `qualified` without ED break-glass approval. ED reviews: Company A's contract explicitly grants category exclusivity; the override is denied. SSL must either (a) move Company B to a different industry sub-category (e.g., "Mining - Precious Metals" if accurate), (b) negotiate a waiver from Company A, or (c) decline Company B. The conflict and resolution are logged in `audit_log` and surfaced in the post-event commercial review.

### E. Third-Party Integrations

- **Salesforce Sales Cloud:** Bidirectional sync of `sponsor_deal` <-> Salesforce Opportunity. Outbound: deal stage transitions create or update Opportunity stage, Amount, CloseDate. Inbound: Opportunity Owner changes sync back to `sponsor_deal.assigned_ssl_id`. Sync mediated by Integration Hub (MuleSoft Anypoint or Workato). Idempotency key derived from `sponsor_deal.id + version`.
- **HubSpot CRM:** Same bidirectional sync pattern as Salesforce; only one of Salesforce or HubSpot is active per tenant (configured via `tenant.crm_provider`). Used for tenants whose sales team is on HubSpot.
- **DocuSign:** Outbound: contract PDF generated from template (Module 0.1 document service) is uploaded as a DocuSign envelope with signer roles for EPU (Sponsor) and SSL. Inbound: DocuSign Connect webhook posts envelope status changes; on `Completed`, `sponsor_deal.contract_signed_at` is set and `stage` advances to `contract_signed`. On `Voided`, deal reverts to `negotiation`. Webhook signed with HMAC SHA-256; Integration Hub verifies signature before processing.
- **Stripe:** Outbound: invoice creation via Stripe Invoicing API. Inbound: Stripe webhook posts `invoice.payment_succeeded` and `invoice.payment_failed`. On success, `payment_received_at = now()` and `stage` advances. Idempotency key: `sponsor_deal.id + invoice_number`. Stripe is the payment processor for card and ACH payments; wire transfers are reconciled manually in NetSuite and posted via FAL.
- **NetSuite (or SAP S/4HANA Finance):** Outbound: `sponsor_deal.contracted_fee` and `currency_code` post to NetSuite as a Sales Order on `invoice_issued`. Inbound: NetSuite REST webhook posts payment application; on success, `payment_received_at` is set and Integration Hub reconciles against the Stripe webhook (cross-check) before advancing stage to `payment_received`. GL postings flow to the Finance module (Module 9).
- **Twilio:** Outbound SMS to SSL and EPU on `sponsor.deal.downgraded`, `sponsor.deal.restored`, `sponsor.deal.signed`. SMS body templated and localized to EPU's preferred language (from sponsor_company record).
- **SendGrid:** Outbound email to EPU on stage transitions, payment receipts, and contract signature. Templates versioned in Git; rendered with deal-specific variables.
- **AWS KMS:** Envelope encryption for `custom_clauses` field (which may contain commercially sensitive terms).
- **OpenSearch:** Full-text search across `sponsor_deal`, `sponsor_company`, and `entitlement_snapshot` for SSL pipeline search ("show me all Mining sponsors in negotiation stage").

### F. UI/UX Notes

- **SSL Pipeline Kanban:** 10 columns matching `stage` enum. Each card shows sponsor_company legal_name, tier (color-coded: platinum = slate, gold = amber, silver = gray, bronze = brown, strategic_partner = purple), contracted_fee (masked for non-FAL viewers), and days-since-last-stage-change. Drag-and-drop with server-side validation (rejects illegal transitions with toast).
- **Deal Detail View:** Tabs: Overview | Entitlements | Contract | Payments | Audit Log | Custom Clauses. Entitlements tab shows side-by-side `tier` (contracted) vs `effective_tier` (currently applied) with diff highlights when downgraded.
- **ED War Room Tile:** "Sponsor Revenue Pacing" with target line, actual line, and tier breakdown. Flashes red if pacing projects < 90% of target at T-30 days.
- **EPU Portal Summary:** Single read-only card showing tier badge, entitlement list (icon-per-entitlement), and payment status pill (paid / pending / overdue).
- **Mobile App (ATT-facing):** Sponsor logos render in two positions only if deal stage >= `contract_signed`: home screen carousel (rotates through Platinum and Strategic Partner sponsors) and session detail page footer (rotates through Gold and Silver sponsors associated with that session's track). Bronze sponsors appear only in the "All Sponsors" list view.

### G. Failure Modes & Offline Behavior

- IF Stripe webhook is delayed > 5 minutes THEN the Integration Hub polls Stripe API as a fallback every 60 seconds; on detection, `payment_received_at` is backdated to the actual payment timestamp returned by Stripe, not the webhook arrival time.
- IF NetSuite is unreachable during `invoice_issued` transition THEN the deal is held in `contract_signed` with a `finance_hold` flag; FAL sees a reconciliation queue item; the System retries every 5 minutes for 24 hours then alerts FAL.
- IF DocuSign webhook signature verification fails THEN the payload is rejected and logged with `security_event` severity s2; SSL is notified.
- IF the Integration Hub is fully offline (regional outage) THEN deal state mutations are still permitted in this subsystem (canonical) and queued for CRM sync in a Redis-backed outbox; on Hub recovery, queued mutations replay with original timestamps. The deal stage machine is the source of truth, not CRM.
- IF the EPU portal is offline (CDN issue) THEN EPU cannot view their deal summary; the entitlement snapshot remains authoritative in the backend, and booth staff badges continue to scan correctly (Module 6) because they were issued from the snapshot at badge-print time.
- IF a sponsor company is acquired mid-cycle (M&A) THEN SSL creates a new `sponsor_company` record for the acquirer, links the old company via `ext_refs.acquired_by_company_id`, and ED approves a deal transfer. Old contracts are NOT modified (audit trail preserved); new deal created under acquirer.

### H. Acceptance Criteria

- **Given** a Platinum sponsor with `payment_due_at` 31 days in the past and `payment_received_at IS NULL`, **When** the daily downgrade job runs at 02:00 UTC, **Then** `effective_tier` transitions from `platinum` to `gold`, `downgrade_applied_at` is set, the entitlement snapshot is rebuilt from the Gold `entitlement_template`, and a `sponsor.deal.downgraded` event is published on Kafka topic `sponsor.deal` with payload `{from: "platinum", to: "gold", reason: "payment_overdue_30d"}`.
- **Given** a sponsor in stage `contract_signed` with `industry_category = "Mining - Diversified"` and another sponsor_company with the same industry_category, **When** SSL creates a new deal for the second company, **Then** the System raises a `category_exclusivity_conflict` warning, blocks deal progression beyond `qualified`, and surfaces an "ED approval required" badge in the SSL Kanban with the conflict reason code.
- **Given** a deal in stage `contract_signed` with DocuSign envelope in `Sent` status, **When** DocuSign Connect posts a `Completed` webhook with valid HMAC signature, **Then** `contract_signed_at` is set to the webhook's `completedDateTime`, `stage` advances to `contract_signed` (if not already), `payment_due_at` is computed as `contract_signed_at + interval '30 days'`, and a `sponsor.deal.signed` event is published within 5 seconds.
- **Given** a deal with `effective_tier = 'gold'` due to prior downgrade and a NetSuite webhook confirming full payment, **When** the Integration Hub processes the webhook, **Then** `effective_tier` is restored to `tier` (platinum), `restored_at = now()`, `payment_received_at = now()`, the entitlement snapshot is rebuilt to Platinum values, and `sponsor.deal.restored` is published.
- **Given** the SSL pipeline Kanban view with 80 active deals across 5 tiers, **When** SSL drags a Bronze deal card from `negotiation` to `contract_signed`, **Then** the System rejects the transition with a toast "Contract signature requires DocuSign envelope; please use the 'Send Contract' action", and the deal remains in `negotiation`.
