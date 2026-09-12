> Module 5: Commercial & Exhibition Management -> 5.3 Exhibitor Portal & Onboarding

## Exhibitor Portal & Onboarding

### A. Purpose Statement

The Exhibitor Portal & Onboarding subsystem is the external-facing web application that gives every sponsor company a self-service workspace to prepare their event presence. At FMF scale, the portal serves 80+ sponsor companies with 1,200+ booth staff users across 6 weeks of pre-event onboarding, peaking at 200+ concurrent users during the final 14 days. The portal is the single touchpoint between the sponsor company's employees and the FMF operational backend; it abstracts away Modules 4, 5.1, 5.2, 6, and 8 behind a task-oriented UI so the EPU never has to learn the internal data model.

The subsystem is distinct from the internal Console (used by SSL, OL, CSM, etc.). The portal is a separate React SPA hosted on Microsoft Power Pages or Liferay DXP (tenant choice), served from a separate subdomain (`portal.fmf.sa`), and authenticated via Azure AD B2C with Twilio Verify MFA. The portal owns three primary workstreams: (1) the onboarding checklist driving the EPU through every required pre-event task; (2) staff management allowing the EPU to register booth staff and trigger badge issuance; and (3) configuration surfaces for booth graphics, accessories, and installation slots (which read/write to Module 5.2). The portal also exposes a read-only deal summary so the EPU can confirm their tier, entitlements, and payment status without contacting SSL.

At FMF scale, the portal must achieve > 95% checklist completion by T-14 days (after which SSL begins manual follow-up), support identity lifecycle events (admin transfer when an EPU leaves their company), enforce tier-based staff quotas (Platinum = 20 staff, Gold = 12, Silver = 6, Bronze = 3, Strategic Partner = negotiated), and produce an audit trail of every external user action for 7 years per regulatory requirement. The portal does NOT store passwords (Azure AD B2C owns credentials) but does store a per-user consent log for terms acceptance, MFA enrollment status, and permission scopes.

### B. User Roles & Permissions

- **Event Director (ED):** Read on portal analytics (checklist completion rates, active users, MFA enrollment). No direct portal UI access.
- **Operations Lead (OL):** Read on portal-onboarded staff list for move-in planning. Sees aggregate per-sponsor staff counts.
- **Protocol Officer (PO):** No access. Receives derived "Sponsor Staff in Diplomatic Corridor" report from Module 2.
- **VIP Liaison (VL):** No access.
- **Registration Manager (RM):** Read on `portal_staff` records for badge issuance. Receives a `portal.staff.registered` event stream that triggers badge queue creation in Module 6.
- **Sponsorship Sales Lead (SSL):** Read on all sponsors' portal activity (aggregate progress, individual staff counts, last-login timestamps). Write on override actions: admin transfer override, staff-quota increase approval, manual checklist item approval (break-glass with ED co-sign).
- **Exhibitor Portal User (EPU):** Primary user. Two sub-roles within the portal: `epu_admin` (one per sponsor company; full read/write on their company's portal data) and `epu_staff` (read on checklist and staff list, write only on their own profile and lead capture if entitled). Admin can register and remove staff; staff cannot.
- **Content & Stage Manager (CSM):** Read on `booth_graphics_uploaded` events to schedule review of sponsor graphics for compliance with event branding guidelines.
- **Matchmaking Concierge (MC):** No access.
- **Finance & Administration Lead (FAL):** Read on `payment_of_booth_balance` checklist item status; receives notification when EPU marks payment complete for reconciliation against NetSuite.
- **Marketing & PR Lead (MPL):** Read on sponsor company logos uploaded via portal for press kit assembly.
- **ESG & Sustainability Officer (ESGO):** Read on `health_safety_compliance` form submission for ESG audit trail.
- **Field Volunteer (FV):** No portal access (FV uses the Mobile App Staff Console per Module 7).
- **Attendee (ATT):** No portal access. ATT uses the Mobile App; some ATTs are also booth staff (linked via `ext_refs.attendee_id`).

### C. Data Model

`portal_account` (extends shared columns):

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
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{azure_ad_b2c_object_id, liferay_company_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `sponsor_company_id` | `uuid` | FK -> sponsor_company.id (Module 5.1) |
| `sponsor_deal_id` | `uuid` | FK -> sponsor_deal.id (Module 5.1) |
| `portal_url` | `text` | e.g., "https://portal.fmf.sa/company/bhp" |
| `onboarding_started_at` | `timestamptz` | When portal_account created |
| `onboarding_completed_at` | `timestamptz null` | When all required checklist items approved |
| `mfa_enforcement_at` | `timestamptz` | When MFA became mandatory for this account |

`portal_user` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{azure_ad_b2c_user_id, attendee_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `portal_account_id` | `uuid` | FK -> portal_account.id |
| `email` | `citext` | Lowercased email; must match sponsor_company domain unless SSL override |
| `full_name` | `text` | Display name |
| `phone_e164` | `text` | E.164 format for MFA |
| `role` | `enum[epu_admin, epu_staff]` | Portal role |
| `mfa_enrolled_at` | `timestamptz null` | When Twilio Verify enrollment completed |
| `terms_accepted_at` | `timestamptz null` | When portal terms of service accepted |
| `status` | `enum[invited, active, suspended, transferred_out, removed]` | Lifecycle |
| `last_login_at` | `timestamptz null` | For SSL activity monitoring |
| `nominated_successor_of` | `uuid null` | FK -> portal_user.id; if this user is the nominated successor of a previous admin |
| `transfer_initiated_at` | `timestamptz null` | If admin transfer in progress |

`onboarding_checklist_item` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{related_content_asset_id, related_invoice_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `portal_account_id` | `uuid` | FK -> portal_account.id |
| `item_type` | `enum[company_logo, booth_graphics, staff_registration, payment_balance, certificate_of_insurance, health_safety_compliance, accessory_selection, installation_slot_booking]` | |
| `status` | `enum[not_started, in_progress, submitted, approved, rejected]` | |
| `required_by` | `timestamptz` | Deadline |
| `submitted_at` | `timestamptz null` | |
| `approved_at` | `timestamptz null` | |
| `approved_by` | `uuid null` | Actor (SSL or system auto-approve) |
| `rejection_reason` | `text null` | Free text |
| `payload` | `jsonb` | Item-specific data e.g., `{logo_asset_id}` or `{insurance_provider, policy_number, expiry_date}` |

`portal_staff_registration` (extends shared columns): junction table mapping `portal_user` (staff) to a booth badge entitlement.

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
| `ext_refs` | `jsonb` | e.g., `{badge_id, registration_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `portal_user_id` | `uuid` | FK -> portal_user.id |
| `portal_account_id` | `uuid` | FK -> portal_account.id |
| `booth_assignment_id` | `uuid` | FK -> booth_assignment.id (Module 5.2) |
| `booth_id` | `uuid` | FK -> booth.id (denormalized for badge encoding) |
| `badge_status` | `enum[pending, issued, reprinted, revoked]` | Lifecycle |
| `badge_issued_at` | `timestamptz null` | When badge printed or digital badge issued |
| `revoked_at` | `timestamptz null` | If staff removed or admin transfer |

### D. Business Logic & Edge Cases

- IF a `portal_account` is created (triggered by `sponsor_deal.stage = contract_signed` in Module 5.1) THEN the System auto-creates the first `portal_user` with `role = epu_admin` from the `sponsor_deal.created_by` SSL's designated contact, sends an Azure AD B2C invitation email with a one-time enrollment link, and instantiates the 8 standard `onboarding_checklist_item` records with `required_by` dates staggered across the pre-event timeline (logo at T-42, graphics at T-21, staff at T-14, payment at T-14, COI at T-7, H&S at T-7).
- IF an `epu_admin` invites a new staff user THEN the System validates the email domain matches `sponsor_company.website_url` domain (e.g., bhp.com.au for BHP); if mismatch, the System blocks the invite and surfaces an "SSL override required" prompt. SSL override requires SSL approval + audit log entry.
- IF the number of `portal_user` records with `status = active` and `role = epu_staff` for a given `portal_account` exceeds `entitlement_snapshot.staff_quota` THEN the System blocks the next registration with explanation: "Your {tier} sponsorship includes {staff_quota} booth staff badges. You currently have {count} active staff. To add more, please contact your SSL to upgrade your tier or purchase additional badges at US$ 250 per badge." The block persists until either an existing staff is removed (soft-deleted) or SSL approves a per-staff fee addition (auto-posts an invoice line item to NetSuite via Integration Hub).
- IF a `certificate_of_insurance` is uploaded THEN the System extracts the policy expiry date via AWS Textract, validates it is at least 30 days after `event.end_date`, and if valid auto-approves with `approved_by = system`; if invalid (expired, wrong coverage type), auto-rejects with `rejection_reason`.
- IF an `epu_admin` initiates an admin transfer (because they are leaving the company) THEN the System creates a new `portal_user` with `role = epu_admin` (the nominated successor), sends an enrollment email, and on the successor's first login + MFA enrollment, atomically transfers: `role = epu_admin` on the new user, `role = epu_staff` on the old user (or `status = transferred_out` if the old user should no longer have any access). The transfer is logged in `audit_log` of both users. If the successor does not enroll within 7 days, the transfer expires and the old admin remains admin.
- IF an `epu_admin` is removed by SSL override (because the admin left and did not nominate a successor) THEN SSL must provide a sponsor HR confirmation document (uploaded as `content_asset`); on ED break-glass approval + HR document, the System designates the next most-recently-active `epu_staff` as the new admin or creates a new `portal_user` from SSL-provided contact.
- IF an `epu_staff` is removed (soft-deleted) THEN their `portal_staff_registration` records are set to `badge_status = revoked`, the `revoked_at = now()`, and a `portal.staff.revoked` event is published on Kafka topic `portal.staff`. Module 6 receives the event and revokes the physical badge (or adds to the deny-list if already printed).
- IF MFA enrollment is not completed within 7 days of invitation THEN the `portal_user` is suspended; SSL is notified and the user is locked out until MFA is completed via an SSL-assisted re-enrollment flow.
- IF the EPU marks `payment_balance` checklist item as "Paid" THEN FAL receives a notification for reconciliation against NetSuite; only FAL can set `status = approved` for this item (after confirming payment in NetSuite).

**Edge Case 1 (Non-obvious): EPU staff registration exceeds tier quota.** A Platinum sponsor (staff_quota = 20) attempts to register their 21st booth staff member. The System blocks the registration with the explanation above. The EPU is offered two paths: (a) upgrade to Strategic Partner (negotiated fee, requires SSL outreach) or (b) purchase additional badges at US$ 250 per badge. If the EPU selects (b), the System creates a per-staff fee `sponsor_deal.custom_clauses` entry of `clause_id = "additional_staff_fee"` with the count and amount, auto-issues a NetSuite invoice line via Integration Hub, and on FAL-confirmed payment, increases the `entitlement_snapshot.staff_quota` by the purchased count. The EPU can then complete the registration. If the EPU does not respond within 72 hours, SSL is notified for follow-up.

**Edge Case 2 (Non-obvious): EPU admin leaves company 2 weeks before event.** A Gold sponsor's `epu_admin` leaves the company on T-14. They have not nominated a successor. The sponsor's HR contacts SSL. SSL initiates a break-glass admin transfer: (a) SSL uploads the HR confirmation letter (a `content_asset` of `asset_type = marketing_asset` with `access_policy = do_not_distribute`), (b) SSL provides the new admin contact (full name, email, phone), (c) ED reviews and approves the break-glass request with two-person approval (ED + SSL co-sign). On approval, the System creates a new `portal_user` with `role = epu_admin` and `nominated_successor_of = old_admin_id`, sends an enrollment email with a 48-hour deadline (compressed from 7 days due to urgency), and on enrollment atomically demotes the old admin to `status = transferred_out`. The transfer is fully logged in both users' `audit_log`. The new admin inherits all permissions and pending checklist items. If the new admin does not enroll within 48 hours, SSL is alerted for further escalation (potentially on-site enrollment at the registration desk on event day).

### E. Third-Party Integrations

- **Microsoft Power Pages or Liferay DXP:** Front-end host. Renders the portal React SPA, manages CDN distribution, and provides the public-facing subdomain. Choice between Power Pages and Liferay is per-tenant (configured in `tenant.portal_provider`).
- **Twilio Verify:** Outbound: enrollment SMS or voice call for MFA. Inbound: verify API call returns success/fail. Used for both initial MFA enrollment and per-login verification (step-up auth for sensitive actions like admin transfer or payment confirmation).
- **Azure AD B2C (or AWS Cognito for tenants configured to AWS):** Identity provider. Owns credentials, password resets, and OIDC token issuance. The portal validates JWTs at the API gateway. The `portal_user.ext_refs.azure_ad_b2c_user_id` is the link between portal_user and Azure AD B2C user object. B2C custom policies enforce email domain validation against sponsor_company domain.
- **AWS Cognito:** Alternative identity provider for tenants configured to AWS instead of Azure. Same OIDC pattern. Choice is per-tenant.
- **AWS Textract:** Outbound: COI (certificate of insurance) PDF is submitted to Textract for policy_number and expiry_date extraction. Inbound: Textract returns key-value pairs; the System validates expiry_date >= event.end_date + 30 days.
- **SendGrid:** Outbound email for invitations, deadline reminders (T-7, T-3, T-1 per checklist item), and SSL notifications.
- **Twilio (Programmable SMS):** Outbound SMS for time-sensitive notifications (admin transfer deadline, payment overdue reminder, badge issuance confirmation).
- **AWS KMS:** Envelope encryption for `payload` fields containing PII (e.g., COI policy numbers, HR confirmation document references).
- **Stripe:** Outbound: per-staff badge fee invoice creation via Stripe Invoicing API. Inbound: webhook confirms payment; on success, entitlement_snapshot.staff_quota is increased.
- **Salesforce / HubSpot (via Integration Hub):** Outbound: portal_user activity (last_login_at, checklist completion) syncs to CRM Contact record for SSL's commercial follow-up workflow.
- **Kafka:** Publishes `portal.user.invited`, `portal.user.enrolled`, `portal.staff.registered`, `portal.staff.revoked`, `portal.checklist.submitted`, `portal.checklist.approved`, `portal.admin.transferred` on topic prefix `portal.*` (extends the `sponsor.*` bounded context per Module 0.1, with `portal.*` as a sub-prefix).

### F. UI/UX Notes

- **Portal Home (EPU Admin):** Three-zone dashboard. Top: progress ring showing % checklist completion with deadline countdown (red < 7 days to required_by for any item). Middle: staff management quick-action card (showing X of staff_quota used). Bottom: deal summary card (tier badge, payment status, key entitlements). All actions accessible from this single page.
- **Onboarding Checklist View:** Vertical list of 8 checklist items, each a card with status pill (not_started = gray, in_progress = blue, submitted = amber, approved = green, rejected = red). Click expands item to show required fields, upload widget, and history. SSL override button (with break-glass icon) visible to SSL only.
- **Staff Management View:** Table of portal_user (staff) with full_name, email, phone, badge_status, last_login. "Invite Staff" button opens modal with email + phone fields. Domain mismatch warning inline. Quota bar at top showing 16/20 used.
- **Admin Transfer Modal:** Triggered by epu_admin from Settings page. Three-step wizard: (1) nominate successor (email + phone), (2) review permissions summary, (3) confirm + Twilio Verify step-up auth. On submit, the successor receives enrollment email with 7-day deadline (or 48-hour if SSL-initiated break-glass).
- **SSL Aggregate Dashboard:** Heatmap of all sponsor portal_account onboarding progress; sortable by tier, last_login_at, days_to_event. Click sponsor to drill into their portal activity log.
- **Mobile-responsive:** Portal is fully responsive for EPU on mobile (most EPUs complete staff registration from phones during pre-event site visits).

### G. Failure Modes & Offline Behavior

- IF Azure AD B2C is unavailable (Identity Provider outage) THEN the portal cannot authenticate new logins; already-issued JWTs remain valid until expiry (60 minutes). Active EPU sessions continue to function within their token validity. Azure AD B2C SLA is 99.9%; on rare outage, the portal shows a "Login temporarily unavailable" banner and SMS-notifies SSL.
- IF Twilio Verify is unavailable (MFA enrollment or step-up auth fails) THEN the System queues the MFA challenge for retry every 30 seconds for 5 minutes; on persistent failure, the user is offered voice-call fallback (also Twilio) or, after SSL break-glass, a temporary bypass code valid for 24 hours.
- IF AWS Textract is unavailable (COI extraction fails) THEN the checklist item is set to `status = submitted` with `payload.textract_pending = true` and routed to a manual SSL review queue; SSL can manually enter the policy_number and expiry_date after visual inspection of the uploaded PDF.
- IF the portal front-end (Power Pages or Liferay) is unavailable (CDN issue) THEN the API backend remains accessible via direct API calls (for SSL Console integration); EPU-facing UI is degraded. A static "Maintenance" page is served from a secondary CDN with SSL contact information.
- IF a portal_user's email domain changes mid-onboarding (sponsor company rebrands) THEN SSL must override the domain check; the new domain is captured in sponsor_company.ext_refs.historical_domains; portal_user.email is updated and a re-verification email is sent.
- IF the Integration Hub fails to sync `portal.user.enrolled` to Salesforce within 3 retries THEN the event lands in the DLQ; portal_user state remains canonical in this subsystem.
- IF the per-staff badge fee Stripe invoice fails (card declined) THEN the entitlement_snapshot.staff_quota is NOT increased; the EPU is notified; SSL is alerted; the portal_staff_registration remains blocked until payment is resolved.

### H. Acceptance Criteria

- **Given** a sponsor with `sponsor_deal.stage = contract_signed` and `entitlement_snapshot.staff_quota = 20`, **When** the daily onboarding initialization job processes the deal, **Then** a `portal_account` is created, the first `portal_user` with `role = epu_admin` is invited via Azure AD B2C, 8 `onboarding_checklist_item` records are instantiated with staggered `required_by` dates, and a `portal.user.invited` event is published on Kafka topic `portal.user` within 30 seconds.
- **Given** an `epu_admin` whose sponsor has 20 active `epu_staff` users (matching `entitlement_snapshot.staff_quota = 20`), **When** the EPU attempts to register a 21st staff member, **Then** the System blocks the registration with a message offering tier upgrade or per-staff fee at US$ 250, and the registration is not persisted.
- **Given** an `epu_admin` who initiates admin transfer 14 days before event with a nominated successor (email + phone) and Twilio Verify step-up auth succeeds, **When** the successor enrolls and completes MFA within 7 days, **Then** the System atomically sets the new user's `role = epu_admin` and `nominated_successor_of = old_admin_id`, sets the old admin's `status = transferred_out` (or `role = epu_staff` if they should retain access), and publishes `portal.admin.transferred` on Kafka.
- **Given** an `epu_admin` who has left the company without nominating a successor, **When** SSL initiates a break-glass admin transfer with HR confirmation document and ED approval, **Then** the System creates a new `portal_user` with `role = epu_admin` and `transfer_initiated_at = now()`, sends a 48-hour enrollment email, and on enrollment completes the transfer.
- **Given** an uploaded certificate_of_insurance PDF where AWS Textract extracts `expiry_date = 2026-03-15` and the event ends `2026-01-15`, **When** the validation rule runs (expiry_date >= event.end_date + 30 days), **Then** the checklist item is auto-approved with `approved_by = system` and `approved_at = now()`; the `payload` is updated with `{insurance_provider, policy_number, expiry_date}`.
