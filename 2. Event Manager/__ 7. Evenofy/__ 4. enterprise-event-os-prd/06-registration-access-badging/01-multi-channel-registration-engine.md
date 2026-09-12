> Module 6: Registration, Access Control & Badging -> 6.1 Multi-Channel Registration Engine

## Multi-Channel Registration Engine

### A. Purpose Statement

The Multi-Channel Registration Engine is the front-door of the entire platform. Every attendee, dignitary, speaker, sponsor staff member, journalist, and volunteer who steps foot inside the venue is first created here as a `registration` record. The engine must absorb 35,000+ started registrations and 12,000+ confirmed registrations in the 90 days leading up to FMF, with a peak of 1,400 registrations per hour during the early-bird close window, while enforcing per-channel pricing rules, delegation-attached protocol rules, sponsor-quota limits, and host-country visa letter automation. A single misrouted dignitary registration (e.g., a Minister registered as a paid Attendee) is a diplomatic incident; the engine exists so that registration type is enforced structurally, not by operator discipline. The engine publishes `registration.*` events on Kafka; Module 6.2 (Access Control & Credentialing), Module 6.3 (Badging & Printing Pipeline), Module 6.4 (Onsite Check-In Kiosk), Module 3.1 (Smart Matchmaking Engine), Module 4.2 (Speaker Presentation Management), and Module 5.4 (Lead Capture & ROI Engine) all consume `registration.confirmed` as their trigger to materialize downstream records.

### B. User Roles & Permissions

The Registration context is owned by the Registration Manager (RM). Other personas interact with it through scoped surfaces (public site, sponsor portal, Shadow App, kiosk) and never see the full registration console.

- **Event Director (ED):** Read on all registrations and pricing config; write only via break-glass for comp overrides above US$ 5,000 value and for protocol-gated dignitary registration moves.
- **Operations Lead (OL):** Read on aggregate throughput, channel mix, and confirmation counts (War Room tile). No write.
- **Protocol Officer (PO):** Read/write on registrations flagged `registration_type = dignitary`; can create and edit dignitary registrations via the Registration Console; cannot modify payment records.
- **VIP Liaison (VL):** Read-only on assigned dignitary's registration summary fields (name, country, photo, banquets). Write only on a delegated-registration draft surface in the Shadow App, which on submit creates a `registration` with `source_channel = delegated_vl` and `status = pending_po_review`.
- **Registration Manager (RM):** Primary owner. Read/write on all registrations, pricing tiers, promo codes, form configurations, bulk import jobs, and refund approvals up to US$ 10,000. Refunds above that require ED co-approval.
- **Sponsorship Sales Lead (SSL):** Read on registrations where `source_channel = sponsor_portal` and the registration belongs to a sponsor under SSL's portfolio. Write only on the sponsor quota allocation per sponsor deal.
- **Exhibitor Portal User (EPU):** Read/write only on their own company's sponsor-portal invited registrations, within the staff_quota allocated by SSL. Cannot see other sponsors' registrations.
- **Content & Stage Manager (CSM):** Read-only on `registration_type = speaker` records, used to confirm speaker onboarding and passport details for travel.
- **Matchmaking Concierge (MC):** Read on confirmed attendee registrations (job title, company, declared interests, consent flags) for matchmaking graph materialization. No write.
- **Finance & Administration Lead (FAL):** Read-only on payment records, refunds, and tax invoice line items. No write on registration records.
- **Marketing & PR Lead (MPL):** Read on aggregate funnel metrics (visits, starts, completions by channel and campaign). Read/write on the Marketo nurture sync config. No PII access without break-glass.
- **ESG & Sustainability Officer (ESGO):** Read-only on the dietary_needs and accessibility_needs aggregate counts for ESG reporting on F&B sourcing.
- **Field Volunteer (FV):** No direct access to the registration engine. FVs interact with the Check-In Kiosk (Module 6.4) only.
- **Attendee (ATT):** Read/write on their own registration record (fields gated by form configuration). Cannot see other registrations.

### C. Data Model

`registration` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (ATT, EPU, VL, PO, or bulk_import service account) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete (cancellation) |
| `ext_refs` | `jsonb` | e.g., `{stripe_customer_id, marketo_id, salesforce_contact_id, cvent_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `registration_type` | `enum[attendee, dignitary, speaker, sponsor_staff, media, staff_volunteer]` | Drives form, pricing, badge template, credential baseline |
| `source_channel` | `enum[public_website, sponsor_portal, delegated_vl, protocol_console, bulk_import, kiosk_walkup]` | Provenance; gates dedup rules |
| `status` | `enum[draft, pending_po_review, pending_payment, confirmed, cancelled, refunded, transferred]` | Lifecycle |
| `form_snapshot_id` | `uuid` | FK -> form_configuration.id; pins the form version at submission |
| `submitted_payload` | `jsonb` | Encrypted (envelope, AWS KMS); contains PII fields |
| `confirmation_code` | `text` | Generated on confirmed; format `FMF-2026-XXXXXX`, unique per event |
| `pricing_tier_id` | `uuid null` | FK -> pricing_tier.id; null for comp types |
| `unit_price` | `numeric(18,3)` | Snapshot of tier price at confirmation, in `currency_code` |
| `currency_code` | `char(3)` | ISO 4217 |
| `promo_code_id` | `uuid null` | FK -> promo_code.id |
| `discount_amount` | `numeric(18,3)` | Default 0 |
| `tax_amount` | `numeric(18,3)` | VAT as applicable in host country |
| `payment_id` | `uuid null` | FK -> payment.id; null for comp registrations |
| `sponsor_deal_id` | `uuid null` | FK -> sponsor_deal.id; non-null when `source_channel = sponsor_portal` |
| `sponsor_quota_slot` | `int null` | Slot index within sponsor_deal.staff_quota; consumed on confirm |
| `dignitary_profile_id` | `uuid null` | FK -> dignitary_profile.id; non-null when `registration_type = dignitary` |
| `speaker_profile_id` | `uuid null` | FK -> speaker_profile.id; non-null when `registration_type = speaker` |
| `badge_id` | `uuid null` | FK -> badge.id; populated by Module 6.3 |
| `dedup_key` | `text` | Hash of normalized name + passport_number; unique per event |
| `language_pref` | `text[]` | ISO 639-1, ordered preference |
| `dietary_needs` | `jsonb` | e.g., `{vegetarian: true, allergies: ["nuts"], banquet: true}` |
| `accessibility_needs` | `jsonb` | e.g., `{wheelchair: true, interpreter: "ASL"}` |
| `visa_support_requested` | `bool` | True if international and opted in |
| `marketing_consent` | `bool` | GDPR/KSA PDPL consent flag |
| `photo_asset_id` | `uuid null` | FK -> content_asset.id; pre-event upload or kiosk capture |

`form_configuration` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | RM |
| `updated_by` | `uuid` | RM |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{marketo_form_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `registration_type` | `enum[attendee, dignitary, speaker, sponsor_staff, media, staff_volunteer]` | Form owner |
| `version_label` | `text` | e.g., "v3 - added ESG fields" |
| `is_active` | `bool` | Only one active per registration_type |
| `fields` | `jsonb[]` | Ordered field list, see schema below |
| `conditional_rules` | `jsonb[]` | IF/THEN rules for field visibility |

`fields` schema (jsonb element):

```json
{
  "key": "dietary_needs",
  "label_i18n": {"en": "Dietary needs", "ar": "الاحتياجات الغذائية"},
  "type": "multiselect",
  "required": false,
  "options": ["vegetarian", "vegan", "halal", "kosher", "gluten_free"],
  "pii_classification": "sensitive",
  "visible_if": {"field": "attending_banquet", "equals": true}
}
```

`pricing_tier` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | RM |
| `updated_by` | `uuid` | RM |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{stripe_price_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `tier_name` | `enum[early_bird, regular, late, onsite]` | Display name |
| `price_amount` | `numeric(18,3)` | In `currency_code` |
| `currency_code` | `char(3)` | ISO 4217 |
| `effective_from` | `timestamptz` | When tier becomes active |
| `effective_to` | `timestamptz` | When tier ceases; next tier auto-activates |
| `is_active` | `bool` | Derived from effective_from/to against now() |
| `group_min_size` | `int` | Default 1; >1 enables group discount |
| `group_discount_pct` | `numeric(5,2)` | e.g., 15.00 for 15% off |

`promo_code` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | RM or MPL |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{marketo_campaign_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `code` | `text` | Citext, unique per event |
| `discount_type` | `enum[percentage, fixed_amount, comp]` | comp = 100% off |
| `discount_value` | `numeric(18,3)` | Percentage (0-100) or fixed amount in `currency_code` |
| `currency_code` | `char(3) null` | Required if discount_type = fixed_amount |
| `max_redemptions` | `int` | Total cap |
| `redemptions_count` | `int` | Counter, incremented atomically |
| `valid_from` | `timestamptz` | UTC |
| `valid_to` | `timestamptz` | UTC |
| `allowed_registration_types` | `enum[]` | Subset of registration_type; empty = all |

`registration_import_batch` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | RM or service account |
| `updated_by` | `uuid` | Actor |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{source_org_name, source_file_s3_key}` |
| `audit_log` | `jsonb[]` | Append-only |
| `source_org_name` | `text` | Partner organization providing the list |
| `source_file_s3_key` | `text` | Encrypted-at-rest source CSV/XLSX |
| `total_rows` | `int` | Total parsed rows |
| `valid_rows` | `int` | Passed validation |
| `invalid_rows` | `int` | Failed validation |
| `status` | `enum[uploaded, validating, ready_to_confirm, partially_confirmed, completed, failed]` | Lifecycle |
| `default_registration_type` | `enum[attendee, dignitary, speaker, media]` | Applied to all rows |
| `default_pricing_tier_id` | `uuid null` | FK -> pricing_tier.id; null = comp |
| `error_report_s3_key` | `text null` | Per-row validation errors |

### D. Business Logic & Edge Cases

- **IF** a `pricing_tier` reaches its `effective_to` timestamp, **THEN** the engine atomically activates the next tier (ordered by `effective_from`) and republishes the active tier via `registration.tier.activated`. Any registration in `draft` state at the cutover inherits the new tier's price; any registration in `pending_payment` retains the original tier snapshot in `pricing_tier_id`.
- **IF** a `promo_code.redemptions_count` is at `max_redemptions` at submission time, **THEN** the engine rejects the promo code with HTTP 409 and a localized message; the registration remains in `draft` with the un-discounted price visible.
- **IF** `registration_type = sponsor_staff` and the sponsor's `entitlement_snapshot.staff_quota` is exhausted at submit time, **THEN** the engine blocks the registration, displays the per-staff fee upsell (US$ 250 default, configurable per sponsor_deal), and on EPU acceptance creates a `payment_intent` for the per-staff fee and increments `entitlement_snapshot.staff_quota` by 1 via a break-glass event (see Edge Case 1).
- **IF** a registration with `source_channel = delegated_vl` is submitted, **THEN** the engine sets `status = pending_po_review` and notifies the PO via the War Room tile and the PO's mobile app. The PO has a 4-hour SLA to approve or reject; auto-approval is prohibited.
- **IF** two registrations with the same `dedup_key` (normalized name + passport_number) arrive within 5 minutes from different `source_channel` values (see Edge Case 2), **THEN** the engine merges them, keeping the most complete record (by field-count of non-null values), and flags the survivor for PO review with a `dedup_review` task.
- **IF** a `form_configuration.fields` entry has `visible_if` and the condition is not met, **THEN** the field is excluded from the submitted payload and any value present is silently dropped (defensive; protects against client-side tampering).
- **IF** `visa_support_requested = true` and the attendee's `country_code` requires a visa to the host country, **THEN** the engine queues a `visa_letter.requested` event consumed by the Integration Hub, which calls the host-country MFA visa-issuance API. Failure of that API places the request in a DLQ and notifies the PO.
- **IF** a `registration_import_batch` row fails validation (missing required field, invalid enum, malformed email), **THEN** the row is written to `error_report_s3_key` with a per-row reason code, the row is excluded from `valid_rows`, and the batch can still proceed to `ready_to_confirm` with the valid subset.
- **IF** an attendee cancels a confirmed paid registration more than 14 days before the event, **THEN** a full refund less a 5% processing fee is issued via Stripe. **IF** within 14 days, partial refund (50%). **IF** within 48 hours, no refund unless break-glass ED approval.

**Edge Case 1: Sponsor staff quota exceeded mid-registration (non-obvious).** A Platinum sponsor (staff_quota = 20) has 20 staff registered. The EPU admin starts registering the 21st staff member. The form is filled out, the EPU clicks "Submit", and the engine blocks at the server-side validation step (the client-side check is a convenience only; server is authoritative). The engine surfaces a modal: "Your Platinum package includes 20 staff registrations. You have reached this limit. To register additional staff, you may either upgrade to a custom Strategic package (contact SSL) or pay a per-staff fee of US$ 250." The EPU selects the per-staff fee; the engine creates a Stripe `payment_intent` for US$ 250, and only on successful payment does it increment `entitlement_snapshot.staff_quota` by 1 (via a `sponsor.quota.extended` event on the `sponsor.*` topic consumed by Module 5.1) and complete the registration. The break-glass audit trail captures the EPU's identity, the SSL-configured fee, and the Stripe charge ID. **IF** the EPU walks away mid-payment, the registration stays in `pending_payment` for 30 minutes, after which it is auto-cancelled and the quota slot is NOT incremented (no leakage).

**Edge Case 2: Dignitary registered by both VL and Protocol Office within 5 minutes (non-obvious).** A Minister's delegation arrives in country. The assigned VL opens the Shadow App and starts a delegated registration (`source_channel = delegated_vl`), enters the Minister's passport number, name, country, and dietary needs, and clicks submit at 08:42:11. Concurrently, the Protocol Office, having received the note verbale, opens the Registration Console and enters the same Minister via `source_channel = protocol_console` at 08:45:38, including protocol_rank, delegation_id, and holding_room preference. Both submissions hit the registration write API within 3 minutes 27 seconds. The engine computes `dedup_key = sha256(upper(last_name) + passport_number)` for both; both hashes match. The engine's dedup worker (a Kafka consumer on `registration.submitted`) detects the collision within 60 seconds. Per policy, the protocol_console record is treated as more authoritative (PO-signed), so it becomes the canonical record; the VL record is marked `status = merged_into` with `merged_into_id = protocol_console_record.id`. The VL's submitted fields that are richer than the PO's (e.g., dietary_needs detail) are merged into the survivor's `submitted_payload` under a `merged_fields` sub-key, with provenance metadata. A `registration.dedup.review` task is created in the PO's queue with a 2-hour SLA; the VL is notified via Shadow App toast "Registration merged with Protocol Office record; your dietary notes were preserved." **IF** the PO's record is missing critical fields (e.g., photo_asset_id), the engine auto-requests them via the VL Shadow App rather than re-prompting the dignitary.

### E. Third-Party Integrations

- **Stripe (payments):** `registration -> Stripe Payment Intents API`. The engine creates a `payment_intent` on transition to `pending_payment` and confirms on webhook (`payment_intent.succeeded`). Stripe webhook signature verified via HMAC SHA-256. Refunds via `Refunds API` with idempotency key = `registration.id + version`. Bidirectional sync of `payment_id` and `stripe_customer_id` in `ext_refs`.
- **Twilio Verify (phone MFA):** On `pending_payment`, the engine triggers a Twilio Verify OTP to the registrant's mobile. Verification status stored in `submitted_payload.phone_verified_at`. Required for all paid registrations; optional for comp.
- **SendGrid (transactional email):** Confirmation, payment receipt, visa letter ready, cancellation. Templates versioned in SendGrid with dynamic data from `registration` + `event`. Idempotency key on `sendgrid_message_id` prevents duplicate sends on retry.
- **Marketo (marketing nurture sync):** Bi-directional via Integration Hub. `registration.confirmed` events sync to Marketo as custom object `FMF_Registration__c`. Marketo unsubscribes propagate back as `marketing_consent = false` updates. Field mapping table versioned in Git.
- **Salesforce (sponsor CRM sync):** For `source_channel = sponsor_portal` registrations, the `contact` is upserted into Salesforce under the sponsor's account. Fields mapped: `Contact.FMF_Attendee_ID__c = registration.id`, `Contact.AccountId = sponsor_company.salesforce_account_id`. Bi-directional with last-write-wins on `Title` and `Phone`.
- **Government visa-issuance API (host country MFA):** Outbound only. The engine POSTs a visa letter request to the host-country MFA REST API (mTLS with client certificate issued by MFA PKI). The MFA returns a tracking number and a PDF letter URL stored as `content_asset` with `access_policy = pii_visa_letter`. SLA: 72 hours. Failures go to the Integration Hub DLQ and notify PO + RM via PagerDuty.
- **Azure AD B2C:** Identity provider for the public website and sponsor portal. JWT issued by B2C is validated at the API gateway; the `sub` claim is stored as `created_by` for self-service registrations.
- **AWS KMS:** Envelope encryption for `submitted_payload` PII fields (passport, dietary, medical). DEK per `tenant_id`, rotated quarterly.

### F. UI/UX Notes

- **Public website (Next.js):** Registration wizard with 4 steps (Personal, Professional, Preferences, Review). Each step saves a draft to the engine every 30 seconds; the user can resume from any device via the confirmation link emailed at step 1. The pricing tier is shown live with a countdown to the next tier cutover ("Regular pricing starts in 3d 4h").
- **Sponsor portal (React):** EPU sees a quota gauge ("18 / 20 staff registered") and a per-staff fee upsell modal. Staff registrations use a simplified form (company pre-filled, no payment step).
- **Delegated registration (Shadow App):** VL sees a 2-step wizard (Identity, Logistics) optimized for one-handed phone use. Required fields only; photo upload optional (kiosk will capture). Submit button label is "Send to Protocol Office for review."
- **Registration Console (RM/PO):** Tabbed admin with All, Pending Review, VIPs, Speakers, Sponsor Staff, Media, Staff/Volunteer, Bulk Imports. Inline edit, break-glass buttons, audit trail drawer on the right.
- **Bulk import (RM):** Drag-and-drop CSV/XLSX. Live preview of first 10 rows. Per-row validation summary on the right ("187 valid, 13 invalid"). Confirm button creates registrations in `draft` status, with a follow-up "Send confirmations" button that transitions them to `confirmed` in batches of 100.
- **Form configuration (RM):** Visual form builder with drag-and-drop fields. Conditional rules edited via a rule editor. Version diff viewer comparing v(n) to v(n-1) before publish.
- **Accessibility:** All forms WCAG 2.1 AA; RTL layout for Arabic; large-text mode toggled via URL param `?large_text=1`.

### G. Failure Modes & Offline Behavior

- **Stripe API down:** Payment intents cannot be created. The engine surfaces a "Payments temporarily unavailable" banner and queues submissions in `pending_payment` for up to 4 hours. Stripe status polled every 60 seconds; on recovery, queued intents are processed in FIFO order.
- **Azure AD B2C outage:** Public website login fails. Fallback: a magic-link email flow backed by SendGrid + a short-lived JWT signed by the engine itself (rate-limited to 100 logins/min). The fallback is documented in the runbook and toggled by LaunchDarkly flag `auth_b2c_fallback`.
- **Host-country visa API unreachable:** Visa letter requests queue in the Integration Hub DLQ with 7-day retention. The PO is notified and may print a manual letter via the Registration Console (break-glass), with the manual letter's PDF stored as `content_asset` with `access_policy = pii_visa_letter_manual`.
- **Kafka producer failure (engine cannot publish `registration.confirmed`):** The write to PostgreSQL rolls back. The user sees a 500 error with a retry button. No partial state is persisted.
- **Read replica lag during peak:** The public site's "My Registration" page may lag up to 30 seconds. A toast informs the user. Critical paths (payment, confirmation) always read from primary.
- **Bulk import S3 unavailability:** Import job moves to `failed` with a retry button; no partial state is written.
- **Twilio Verify outage:** Phone MFA degrades to email-based OTP (SendGrid) as a fallback for up to 2 hours, after which new registrations are blocked until Twilio recovers (RM decision).

### H. Acceptance Criteria

- **Given** a public-website visitor in Saudi Arabia, **when** they complete the attendee registration form during the early-bird window and pay via Stripe, **then** a `registration` record with `status = confirmed`, `pricing_tier_id` = early_bird tier, and `payment_id` non-null is persisted within 5 seconds, and a confirmation email is dispatched via SendGrid within 30 seconds.
- **Given** a Platinum sponsor with 20 staff quota already filled, **when** the EPU submits a 21st staff registration, **then** the engine blocks the submission, displays the per-staff fee upsell (US$ 250), and on EPU payment of the fee, increments `entitlement_snapshot.staff_quota` by 1, completes the registration, and emits a `sponsor.quota.extended` event on Kafka with the original quota value and the new value.
- **Given** a dignitary registered by the VL via Shadow App at T=0 and by the PO via Protocol Console at T+3m27s with matching passport and name, **when** the dedup worker processes both submissions, **then** the protocol_console record is canonical, the VL record is marked `merged_into`, dietary_needs from the VL record are preserved under `merged_fields`, a `registration.dedup.review` task is created in the PO queue within 60 seconds, and the VL receives a Shadow App toast notification of the merge.
- **Given** an early-bird tier with `effective_to = 2026-09-15T23:59:59Z`, **when** the clock crosses that timestamp, **then** the engine atomically activates the regular tier, republishes via `registration.tier.activated`, and any new draft created after the cutover inherits the regular tier's price; existing `pending_payment` registrations retain their early-bird snapshot.
- **Given** a bulk import CSV of 1,000 rows from a partner organization with 13 malformed rows, **when** the RM clicks "Validate", **then** the engine persists the batch with `total_rows = 1000`, `valid_rows = 987`, `invalid_rows = 13`, writes the 13 errors to `error_report_s3_key` with per-row reason codes, and the RM can confirm the 987 valid rows in a single action that batches registrations 100 at a time.
