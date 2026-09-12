> Module 10: Marketing, PR & Media Center -> 10.2 Media Accreditation Center

## Media Accreditation Center

### A. Purpose Statement

The Media Accreditation Center is the single authoritative gateway through which journalists, photographers, broadcasters, and content creators gain press access to the Future Minerals Forum. At FMF scale, the platform receives 2,400+ accreditation applications across 60+ countries and 400+ outlets (including 80+ international wires and 200+ trade press) in the 120 days leading up to the event, with a peak of 300 applications in the final 72 hours. A misrouted accreditation (e.g., a blogger granted Full Access to a closed-door ministerial session, or a wire photographer without Photo Pit entitlement blocked at the entrance) is both a press-relations failure and a diplomatic protocol risk because the FMF plenary hosts Heads of State and Sovereign Wealth Fund chairs under embargoed terms. This subsystem exists so that every accreditation application is verified against the outlet of record, that access-zone entitlements are issued per a transparent tier policy, and that embargoed content distribution (per Module 10.3) can be tracked at the individual journalist level.

The subsystem is the write-side owner of the `accreditation.*` Kafka topic prefix per the Module 0.1 bounded context table. It publishes `accreditation.application.submitted`, `accreditation.application.verified`, `accreditation.application.approved`, `accreditation.application.rejected`, `accreditation.badge.tier_assigned`, `accreditation.badge.printed`, `accreditation.badge.revoked`, `accreditation.embargo.received`, `accreditation.embargo.violated`, `accreditation.embargo.lifted`, and `accreditation.fast_track.requested`. It subscribes to `registration.confirmed` and `registration.cancelled` (Module 6.1) so that accredited journalists are also attendees of `registration_type = media`, to `credential.issued` and `credential.revoked` (Module 6.2) so that press-zone entitlements are encoded on the badge QR, and to `press.release.distributed` and `press.embargo.lifted` (Module 10.3) so that the per-journalist embargo receipt ledger is updated. Its non-negotiable contracts are: (1) no accreditation may be granted without a verifiable outlet-of-record (editor confirmation or Cision/Muck Rack database match), (2) every press badge tier enforces a fixed zone entitlement set that is encoded on the badge QR and validated at every NFC reader, and (3) every embargoed content delivery is logged with recipient_id, delivery_timestamp, embargo_lift_time, and acknowledgement of the embargo agreement via DocuSign.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all accreditation records. Write only via break-glass on revocation overrides (e.g., restoring an embargo-violating journalist after diplomatic resolution) with co-sign by MPL and PO.
- **Operations Lead (OL):** Read on accreditation counts and badge-print queue status for coordination with the onsite Media Desk (Module 6.4 kiosk fleet). No write on accreditation decisions.
- **Protocol Officer (PO):** Read-only on accredited journalists from outlets covering specific dignitaries (e.g., the ministerial press pool from Country X). Write on "dignitary press pool" flag for zone restrictions during closed protocol sessions.
- **VIP Liaison (VL):** No direct access. Receives delegated press requests via the Shadow App for the dignitary's traveling press.
- **Registration Manager (RM):** Read on the registration-side record for accredited journalists (`registration_type = media`). No write on accreditation.
- **Sponsorship Sales Lead (SSL):** No direct access.
- **Exhibitor Portal User (EPU):** No direct access. (Sponsor press is handled via the sponsor's own staff registration, not via this Center.)
- **Content & Stage Manager (CSM):** Read-only on accredited photographers and videographers for Photo Pit and Mixed Zone access coordination during sessions. No write.
- **Matchmaking Concierge (MC):** No direct access.
- **Finance & Administration Lead (FAL):** Read-only on paid accreditation revenue (if applicable to certain trade press tiers). No write.
- **Marketing & PR Lead (MPL):** Primary owner. Read/write on applications, verification, approvals, badge tier assignment, embargo issuance, and revocation. Cannot override an embargo-violation revocation without ED + PO co-sign (protocol-sensitive cases).
- **ESG & Sustainability Officer (ESGO):** No direct access.
- **Field Volunteer (FV):** Read-only on the Media Desk check-in view (badge scan result, photo, name, outlet, tier) for onsite validation. No write.
- **Attendee (ATT):** No access. A journalist who registers as ATT does not see this Center; they must go through the accreditation application to gain press entitlements.

### C. Data Model

`accreditation_application` (journalist-submitted application; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Journalist self-service or MPL |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{cision_contact_id, muck_rack_journalist_id, docusign_envelope_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `journalist_registration_id` | `uuid` | FK -> registration.id (Module 6.1) |
| `outlet_name` | `text` | E.g., "Reuters", "Financial Times", "Mining Weekly" |
| `outlet_country_code` | `char(2)` | ISO 3166-1 alpha-2 |
| `outlet_type` | `enum[international_wire, national_broadsheet, trade_press, broadcaster, online_native, blogger, photo_agency]` | |
| `role` | `enum[staff_journalist, freelance_journalist, photographer, videographer, editor, producer, blogger]` | |
| `press_card_number` | `text null` | National press card if applicable |
| `press_card_issuer` | `text null` | E.g., "NUJ", "IFJ", "Saudi Journalists Association" |
| `work_samples_urls` | `text[]` | 3-5 URLs of prior coverage |
| `requested_access_zones` | `text[]` | Subset of `[press_area, mixed_zone, session_rooms, photo_pit, broadcast Booth, vip_press_pool]` |
| `application_status` | `enum[submitted, in_verification, verified, approved, rejected, withdrawn, expired]` | |
| `submitted_at` | `timestamptz` | Application submission timestamp |
| `verification_method` | `enum[editor_email, cision_lookup, muck_rack_lookup, prior_event_history, manual_override]` | |
| `verified_at` | `timestamptz null` | Verification completion |
| `verified_by` | `uuid null` | MPL or Integration Hub service |
| `approved_at` | `timestamptz null` | MPL approval timestamp |
| `approval_notes` | `text null` | Free-text rationale |
| `is_fast_track` | `boolean` | True if submitted within 48h of event |
| `fast_track_reason` | `text null` | Required if is_fast_track = true |

`press_badge` (issued badge with tier and zone entitlements; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | MPL |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{zebra_credential_id, badge_print_job_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `application_id` | `uuid` | FK -> accreditation_application.id |
| `journalist_registration_id` | `uuid` | FK -> registration.id |
| `badge_tier` | `enum[full_access, limited_access, photo_only]` | |
| `zone_entitlements` | `text[]` | Subset of zone codes; derived from badge_tier + PO overrides |
| `effective_from` | `timestamptz` | When entitlements become active |
| `effective_until` | `timestamptz` | Event end + 4 hours |
| `print_status` | `enum[pending, queued, printed, shipped, onsite_printed, failed]` | |
| `printed_at` | `timestamptz null` | |
| `revocation_status` | `enum[active, revoked, suspended]` | |
| `revocation_reason` | `enum[null, embargo_violation, misconduct, outlet_disaffiliation, duplicate, security_recall]` | |
| `revoked_at` | `timestamptz null` | |
| `revoked_by` | `uuid null` | MPL or ED (break-glass) |

`embargo_receipt` (per-journalist per-embargo content delivery; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Module 10.3 distribution service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{docusign_envelope_id, s3_presigned_url_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `press_badge_id` | `uuid` | FK -> press_badge.id |
| `press_release_id` | `uuid` | FK -> press_release.id (Module 10.3) |
| `embargo_lift_at` | `timestamptz` | When content can be published |
| `delivered_at` | `timestamptz` | When content was sent to the journalist |
| `delivery_channel` | `enum[email, secure_portal, s3_presigned_url]` | |
| `agreement_signed_at` | `timestamptz null` | DocuSign completion timestamp |
| `agreement_signed_by` | `uuid null` | Journalist registration_id |
| `acknowledgement_method` | `enum[docusign_electronic, clickwrap_portal, verbal_recorded]` | |
| `violation_status` | `enum[none, suspected, confirmed]` | Updated by Module 10.4 social listening if pre-lift publication detected |
| `violated_at` | `timestamptz null` | Detected publication timestamp |
| `violation_evidence_url` | `text null` | URL of premature publication |

### D. Business Logic & Edge Cases

- **IF** an `accreditation_application` is submitted with `outlet_type = international_wire` or `national_broadsheet` and the `verification_method` lookup in Cision or Muck Rack returns a positive match for `outlet_name + outlet_country_code + journalist_name`, **THEN** the engine sets `application_status = verified`, auto-assigns `badge_tier = full_access` on approval, and skips manual editor-email verification (still logged in `audit_log`).
- **IF** an application lists `role = photographer` and `requested_access_zones` includes `photo_pit` but not `session_rooms` or `press_area`, **THEN** the engine on approval assigns `badge_tier = photo_only` and `zone_entitlements = ['photo_pit', 'mixed_zone']`.
- **IF** an application is submitted with `submitted_at >= event.start_at - 48 hours`, **THEN** the engine sets `is_fast_track = true`, requires `fast_track_reason`, surfaces the application in an MPL "Fast-Track Queue" with a 4-hour SLA, and on approval sets `print_status = pending` with `badge_print_location = onsite_media_desk` (not pre-shipped).
- **IF** an accredited journalist with an active `press_badge` is detected by Module 10.4 (Social Listening) as having published embargoed content before `embargo_lift_at`, **THEN** the engine sets the corresponding `embargo_receipt.violation_status = confirmed`, sets `press_badge.revocation_status = suspended` (temporary, pending MPL review), publishes `accreditation.embargo.violated`, and creates a high-priority MPL task with two paths: (1) "Revoke accreditation" (requires PO co-sign if the journalist covers dignitary-related beats) or (2) "Suspend future embargo access" (the journalist retains badge access but is excluded from future `embargo_receipt` distributions).
- **IF** an accredited journalist's outlet is disaffiliated (e.g., a publication closes or a freelancer's contract is terminated), **THEN** the engine on receiving the outlet status update from Cision sets `press_badge.revocation_status = revoked` with `revocation_reason = outlet_disaffiliation`, publishes `accreditation.badge.revoked`, and the Module 6.2 credential revocation consumer mirrors this to the NFC reader access list.
- **IF** a `press_badge` is lost or stolen and reported by the journalist or MPL, **THEN** the engine issues a replacement badge with a new `id` and revokes the prior badge, with `revocation_reason = security_recall`; the prior badge QR is added to the Module 6.2 deny list.
- **IF** an application's `requested_access_zones` includes `vip_press_pool`, **THEN** the engine requires PO review and approval in addition to MPL approval, because the VIP Press Pool covers closed-door ministerial sessions subject to diplomatic protocol.

**Edge case (non-obvious): journalist applies 24 hours before the event.** At 16:00 on T-1 day, a freelance journalist from a major wire service submits an accreditation application for an FMF that opens at 09:00 the next day. The `submitted_at - event.start_at = 17 hours`, well below the 48-hour threshold, so the engine sets `is_fast_track = true` and requires `fast_track_reason`, which the journalist enters as "Editor assigned me to cover at the last minute after a colleague's visa was denied." The application enters the MPL Fast-Track Queue. The MPL reviews the application at 17:30, notes the journalist's Cision record shows 4 prior FMF coverages and a valid national press card, and approves with `verification_method = prior_event_history`. The engine sets `print_status = pending` with `badge_print_location = onsite_media_desk` (NOT pre-shipped, because there is no time), creates a `press_badge` with `badge_tier = full_access` and `zone_entitlements = ['press_area', 'mixed_zone', 'session_rooms']` (excluding `photo_pit` since the role is `staff_journalist`, not `photographer`), and publishes `accreditation.badge.tier_assigned`. The Integration Hub then triggers Twilio to send an SMS to the journalist: "Your FMF press accreditation is approved. Badge ready for pickup at the Media Desk (Gate 3) from 07:30. Bring passport and press card." At 07:45 the next day, the journalist presents at the Media Desk; an FV scans the journalist's passport (or the SMS QR code), the system displays the badge record, the desk printer (Module 6.3) prints the badge within 12 seconds with the encoded QR containing the `press_badge.id` and zone entitlements, and the FV hands the badge to the journalist. The `print_status` transitions to `onsite_printed` and `printed_at` is set. The whole flow from application to badge-in-hand is under 16 hours.

**Edge case (non-obvious): embargo violation triggers cascading restrictions.** At 14:30 on Day 1 of FMF, a major deal announcement (US$ 1.2B lithium refining joint venture) is distributed under embargo to 180 accredited journalists with `embargo_lift_at = 16:00`. At 15:12, Module 10.4 (Social Listening) detects a published article on a trade press website with the deal details and the headline "FMF Day 1: US$ 1.2B lithium JV announced" - 48 minutes before the embargo lifts. The engine's correlation job matches the article URL to a registered `accreditation_application` from the trade press outlet's staff journalist (the URL's byline and Cision-recorded email match). The engine sets the corresponding `embargo_receipt.violation_status = confirmed`, `violated_at = 15:12`, `violation_evidence_url = <article URL>`, and `press_badge.revocation_status = suspended`. It publishes `accreditation.embargo.violated` with the journalist's `press_badge_id`, the `press_release_id`, and the violation evidence. The Module 6.2 credential consumer picks up the suspension and pushes the badge ID to the NFC reader deny list within 60 seconds, so the journalist's badge will be denied at the next scan. The MPL receives a high-priority task with two paths: (1) "Revoke accreditation" - the journalist's badge is fully revoked, they are escorted out by security, and their outlet is flagged for potential exclusion from future embargoes (requires PO co-sign because the outlet covers dignitary-adjacent beats); or (2) "Suspend future embargo access" - the badge access is restored (the journalist can attend public sessions), but their `press_badge_id` is added to a `no_future_embargo` list that excludes them from any subsequent `embargo_receipt` distributions for the remainder of the event. The MPL chooses (2) after a phone call with the outlet's editor, and the suspension is lifted at 16:00 (when the embargo lifts anyway). The incident is recorded in `audit_log` with full evidence chain (article URL, byline, Cision match, MPL decision, editor call notes) for the post-event review and for any future accreditation application from the same journalist.

### E. Third-Party Integrations

- **Cision or Muck Rack (journalist and outlet database):** Used for outlet verification. Data flow: FMF `accreditation_application` -> Integration Hub -> Cision API lookup by `outlet_name + outlet_country_code`; reverse direction also used to enrich the application with the outlet's circulation, editorial focus, and prior FMF coverage. Cision also pushes outlet disaffiliation notices that trigger `press_badge.revocation_status = revoked` with `revocation_reason = outlet_disaffiliation`.
- **DocuSign (embargo agreement e-signature):** For high-sensitivity embargoes (e.g., ministerial speeches, major deal announcements), the engine composes a DocuSign envelope with the embargo terms (content description, `embargo_lift_at`, publication restrictions, penalty clauses) and sends it to the journalist's registered email. Data flow: FMF -> DocuSign -> journalist email; DocuSign Connect webhook (envelope-completed) -> Integration Hub -> `embargo_receipt.agreement_signed_at` and `agreement_signed_by` are set.
- **Twilio (badge-ready SMS notifications):** On `accreditation.badge.tier_assigned`, the Integration Hub triggers Twilio to send a localized SMS to the journalist's registered mobile with pickup instructions. Data flow: FMF -> Integration Hub -> Twilio Programmable Messaging. Twilio status callback updates `print_status` tracking.
- **Stripe (paid accreditation for some outlets):** For certain trade press and blogger tiers (where FMF charges an accreditation fee to recover Media Desk costs), the engine creates a Stripe Checkout session on application submission. Data flow: FMF -> Integration Hub -> Stripe Checkout; Stripe webhook (checkout.session.completed) -> Integration Hub -> application advances to `verified` only after payment confirmation.
- **Marketo or HubSpot (pre-event journalist nurture):** Accredited journalists are synced to a Marketo static list "FMF_Press_Cohort" for pre-event press kit announcements (per Module 10.3 distribution workflow). Data flow: FMF `accreditation.badge.tier_assigned` event -> Integration Hub -> Marketo custom object upsert.
- **Zebra ZD Series printer fleet (Media Desk badge printing):** The onsite Media Desk runs a fleet of 4 Zebra ZD621 card printers connected via CUPS to the Badging & Printing Pipeline (Module 6.3). Data flow: FMF `press_badge.print_status = queued` -> Module 6.3 printer queue -> Zebra printer; print completion callback -> `print_status = printed` or `onsite_printed`.
- **Kafka topics:** Publishes `accreditation.*` (full list above). Subscribes to `registration.confirmed` and `registration.cancelled` (Module 6.1), `credential.issued` and `credential.revoked` (Module 6.2), `press.release.distributed` and `press.embargo.lifted` (Module 10.3), and `social.violation.detected` (Module 10.4).

### F. UI/UX Notes

The MPL's primary screen is a four-panel layout. Top-left: an accreditation pipeline Kanban with columns `submitted -> in_verification -> verified -> approved -> printed`, each card showing the journalist's name, outlet, role, requested zones, and a thumbnail of their press card. A red flag indicates an outlet that has previously violated an embargo. Top-right: the selected application's detail drawer with full submission data, work samples preview, Cision match result, and an approval/rejection action bar with a "Notes" field. Bottom-left: an embargo receipt ledger showing all active embargoes with recipient count, lift time, and any `violation_status != none` highlighted in red. Bottom-right: a "Fast-Track Queue" with applications submitted within 48h of the event, sorted by `submitted_at` ascending, each card showing the time-to-event countdown and the SLA remaining.

The FV's Media Desk view (a tablet-form React Native screen) shows a search-by-passport-or-QR field, on match displays the badge record (photo, name, outlet, tier, zones), and a "Print Badge" button that triggers the Module 6.3 print job and confirms pickup. The PO sees a filtered view of accredited journalists covering specific dignitary press pools, with the ability to flag a journalist for `vip_press_pool` review.

### G. Failure Modes & Offline Behavior

- **Cision API outage during verification:** The engine falls back to `verification_method = editor_email` (the MPL emails the outlet's editor manually using a templated message) and surfaces a "Cision Unreachable - Manual Verification" banner. The application can still proceed to approval with the manual method, with an audit flag.
- **DocuSign envelope for embargo agreement expires:** The Integration Hub re-issues the envelope with a 24-hour extension and notifies the journalist and the MPL. The `embargo_receipt.agreement_signed_at` remains null, and the journalist is excluded from the embargo distribution until signed.
- **Twilio SMS delivery failure (e.g., journalist's mobile number invalid):** The engine retries once with a 5-minute delay; on second failure it falls back to email via SendGrid and alerts the MPL to phone the journalist.
- **Stripe payment for paid accreditation fails:** The application stays in `submitted` status with a "Payment Pending" flag. The journalist receives an email with a retry link; after 72 hours without payment, the application is auto-withdrawn.
- **Zebra printer offline at the Media Desk:** The Badging & Printing Pipeline (Module 6.3) detects the offline status and reroutes the print job to a backup printer or to a sister desk; the FV sees a "Rerouting to Printer N" toast. If all printers at the desk are offline, the badge can be issued as a temporary paper pass with a manual credential entry, and the plastic badge is mailed post-event.
- **NFC reader offline (badge suspension cannot propagate):** The Module 6.2 credential deny list is queued locally at the Media Desk and synced when connectivity resumes. During the offline window, the suspended badge may still work; the FV desk has a printed "today's suspensions" list as a manual fallback.
- **MPL offline (no mobile signal) when an embargo violation is detected:** The engine escalates the task to the ED's War Room dashboard (Module 1.1) after 15 minutes of MPL non-acknowledgment, and the ED can act on the revocation with a co-sign from the PO.

### H. Acceptance Criteria

- **Given** an accreditation application submitted 24 hours before the event with a valid Cision match for `outlet_name = "Reuters"`, `outlet_country_code = "GB"`, and `role = staff_journalist`, **When** the MPL approves the application via the Fast-Track Queue, **Then** the engine sets `badge_tier = full_access`, `zone_entitlements = ['press_area', 'mixed_zone', 'session_rooms']`, `print_status = pending` with `badge_print_location = onsite_media_desk`, publishes `accreditation.badge.tier_assigned`, and triggers Twilio to send a localized SMS to the journalist with pickup instructions.
- **Given** an accredited journalist with an active `press_badge` and an `embargo_receipt` for a US$ 1.2B deal announcement with `embargo_lift_at = 16:00`, **When** Module 10.4 detects at 15:12 a published article by the journalist's outlet containing embargoed details, **Then** the engine sets `embargo_receipt.violation_status = confirmed` and `violated_at = 15:12`, sets `press_badge.revocation_status = suspended`, publishes `accreditation.embargo.violated` within 60 seconds, and the Module 6.2 credential consumer pushes the badge ID to the NFC reader deny list within 60 seconds so the journalist's next scan is denied.
- **Given** a `press_release` distributed under embargo to 180 accredited journalists via DocuSign-wrapped agreement, **When** a journalist signs the DocuSign envelope, **Then** the engine sets `embargo_receipt.agreement_signed_at` and `agreement_signed_by` from the DocuSign Connect webhook within 30 seconds, the journalist receives access to the embargoed content via S3 pre-signed URL, and `accreditation.embargo.received` is published.
- **Given** a `photo_only` badge tier for an accredited photographer with `requested_access_zones = ['photo_pit']`, **When** the photographer scans into a `session_rooms` NFC reader, **Then** the Module 6.2 access control returns `scan_result = denied_no_entitlement`, the photographer is redirected to the Photo Pit entrance, and a `scan.denied` event is published to Module 8 (Ops) which can dispatch an FV to assist.
- **Given** an accreditation application with `requested_access_zones` including `vip_press_pool`, **When** the MPL approves the application, **Then** the engine requires an additional PO review and approval before `badge_tier` is finalized, and the `press_badge.zone_entitlements` cannot include `vip_press_pool` until the PO has signed off.
