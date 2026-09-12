> Module 10: Marketing, PR & Media Center -> 10.1 Campaign Orchestration

## Campaign Orchestration

### A. Purpose Statement

The Campaign Orchestration subsystem is the master control plane for all outbound demand-generation, brand, and conversion communications supporting the Future Minerals Forum. At FMF scale, marketing must convert 35,000+ prospects into 12,000+ confirmed registrations across 100+ sovereign delegations, in parallel with sponsor visibility obligations, ministerial speaker announcements, and content marketing feeds into at least 14 industry verticals (mining, refining, finance, sovereign wealth, energy transition, infrastructure, logistics, ESG, technology, government, academia, media, NGOs, and multilateral institutions). A single mistimed email blast referencing a withdrawn ministerial speaker becomes a diplomatic incident; an over-serving paid social ad set can quietly consume the marketing department's monthly budget in 48 hours. This subsystem exists so that every campaign - whether registration drive, sponsor promotion, speaker announcement, content marketing, or retargeting - is orchestrated across email, social (organic and paid), web, and SMS channels with unified audience segmentation, pixel- and server-to-server conversion tracking, and structural cross-checks against the rest of the platform (Module 4 speaker status, Module 5 sponsor tier, Module 6 registration funnel, Module 9 marketing budget line).

The subsystem is the write-side owner of the `campaign.*` Kafka topic prefix per the Module 0.1 bounded context table. It publishes `campaign.created`, `campaign.approved`, `campaign.scheduled`, `campaign.send_started`, `campaign.send_halted`, `campaign.completed`, `campaign.audience.computed`, `campaign.conversion.attributed`, `campaign.budget.pacing_alert`, `campaign.adset.auto_paused`, `campaign.speaker_link.invalidated`, and `campaign.retention.purged`. It subscribes to `speaker.onboarding.changed` and `speaker.session_started` (Module 4.2) to validate speaker-link integrity before send, to `sponsor.deal.signed`, `sponsor.deal.downgraded`, `sponsor.deal.restored` (Module 5.1) to gate sponsor promotion campaigns against the sponsor's effective tier, to `registration.confirmed`, `registration.cancelled`, `registration.attendee.upserted` (Module 6.1) to update segmentation membership and suppress already-converted prospects from registration-drive audiences, and to `budget.variance.threshold_breached` and `budget.pacing.alert` (Module 9.1) to pause campaigns whose spend exceeds the marketing department budget line pacing. Its non-negotiable contracts are: (1) no campaign may reference a speaker who is not in `onboarding_status = ready` or higher at send time, (2) no paid ad set may exceed 200% of its daily budget within any rolling 2-hour window without an auto-pause and MPL alert, and (3) every conversion event is attributed server-to-server to handle cross-device journeys where the click happens on a personal phone but the registration completes on a corporate laptop.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all campaigns. Write only via break-glass on emergency halt (e.g., a campaign with a factually wrong ministerial title that has already been sent) and on reallocation of marketing budget line per the Module 9.1 break-glass path.
- **Operations Lead (OL):** Read on campaign schedule to align with run-of-show (Module 1.3). No write.
- **Protocol Officer (PO):** Read-only on campaigns that reference dignitaries or speakers, to validate protocol compliance of the messaging copy (titles, forms of address, flag usage). No write.
- **VIP Liaison (VL):** No direct access. Receives delegated-registration drafts from campaigns via Module 6.1 only when their dignitary's data appears in the audience.
- **Registration Manager (RM):** Read on registration-drive campaign performance. No write; the registration funnel is downstream of campaigns.
- **Sponsorship Sales Lead (SSL):** Read/write on sponsor-promotion campaigns scoped to their sponsor portfolio. Cannot modify non-sponsor campaigns.
- **Exhibitor Portal User (EPU):** Read/write only on their sponsor's co-marketing assets uploaded into the sponsor-promotion campaign briefs. Cannot view the full campaign performance dashboard.
- **Content & Stage Manager (CSM):** Read-only on speaker-announcement campaigns to confirm the speaker referenced matches the Module 4.2 record. Writes speaker-announcement briefs into the system for MPL to schedule.
- **Matchmaking Concierge (MC):** No direct access.
- **Finance & Administration Lead (FAL):** Read-only on campaign spend against the marketing budget line (Module 9.1). No write on campaign creative.
- **Marketing & PR Lead (MPL):** Primary owner. Read/write on all campaigns, audiences, ad accounts, and conversion tracking. Cannot override an auto-pause without SSL co-sign on sponsor-promotion campaigns or ED co-sign on protocol-sensitive speaker announcements.
- **ESG & Sustainability Officer (ESGO):** Read-only on campaigns tagged `esg_themed` to verify messaging alignment with ESG claims. No write.
- **Field Volunteer (FV):** No access.
- **Attendee (ATT):** No direct access. Receives campaigns via opted-in channels and can manage consent preferences via the Attendee App (Module 7.1) preference center.

### C. Data Model

`campaign` (top-level orchestration record; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | MPL |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{marketo_program_id, hubspot_campaign_id, hootsuite_message_id, meta_adset_id, google_ads_campaign_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `campaign_type` | `enum[registration_drive, sponsor_promotion, speaker_announcement, content_marketing, retargeting]` | |
| `status` | `enum[draft, in_review, approved, scheduled, send_started, send_halted, completed, cancelled, failed]` | Lifecycle |
| `budget_line_id` | `uuid` | FK -> budget_line.id (Module 9.1 Marketing line) |
| `planned_spend_local` | `numeric(15,2)` | Total planned spend in event-local currency |
| `actual_spend_local` | `numeric(15,2)` | Aggregated from ad platforms and ESP invoices |
| `daily_budget_cap_local` | `numeric(10,2)` | Auto-pause threshold per ad set per rolling 24h |
| `rolling_window_minutes` | `int` | Default 120; auto-pause trigger window |
| `rolling_spend_cap_pct` | `numeric(5,2)` | Default 200.00; > 2x daily cap in window triggers pause |
| `primary_audience_id` | `uuid` | FK -> campaign_audience.id |
| `channels` | `text[]` | Subset of `[email, organic_social, paid_social, paid_search, web, sms]` |
| `speaker_id` | `uuid null` | FK -> speaker.id (Module 4.2) if campaign_type = speaker_announcement |
| `sponsor_deal_id` | `uuid null` | FK -> sponsor_deal.id (Module 5.1) if sponsor_promotion |
| `scheduled_send_at` | `timestamptz null` | For scheduled sends |
| `send_started_at` | `timestamptz null` | First message dispatched |
| `send_completed_at` | `timestamptz null` | Last message dispatched |
| `conversion_goal` | `enum[registration, meeting_request, app_install, content_download, sponsor_lead_capture]` | Goal for attribution |
| `s2s_tracking_enabled` | `boolean` | Server-to-server conversion API enabled |

`campaign_audience` (segment membership; extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{segment_profile_id, marketo_static_list_id, meta_custom_audience_id, google_ads_user_list_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `name` | `text` | Human-readable segment name |
| `segment_rules` | `jsonb` | Nested AND/OR predicates over registration profile fields, behavior events, persona tags |
| `membership_count` | `int` | Recomputed at each audience evaluation |
| `evaluation_window_days` | `int` | Lookback window (e.g., 30 days for behavior events) |
| `last_evaluated_at` | `timestamptz` | Last successful materialization |
| `suppression_list_ids` | `uuid[]` | FK -> campaign_suppression_list.id; unsubscribes, competitors, prior converted |
| `computed_member_ids` | `uuid[]` | Materialized audience; refreshed each evaluation |

`campaign_channel_dispatch` (per-channel execution record; extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{marketo_batch_id, sendgrid_message_id, meta_adset_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `campaign_id` | `uuid` | FK -> campaign.id |
| `channel` | `enum[email, organic_social, paid_social, paid_search, web, sms]` | |
| `vendor` | `enum[marketo, hubspot, sendgrid, hootsuite, buffer, meta_ads_manager, google_ads, twilio_sms, wordpress_cms]` | |
| `dispatch_status` | `enum[queued, in_flight, delivered, bounced, paused, halted, failed]` | |
| `dispatched_count` | `int` | Per-channel delivery count |
| `failed_count` | `int` | Bounces, undelivered |
| `vendor_spend_local` | `numeric(10,2)` | Spend reported by vendor API |
| `vendor_spend_pulled_at` | `timestamptz` | Last spend reconciliation pull |
| `conversion_count` | `int` | Attributed conversions per channel |
| `auto_pause_reason` | `enum[null, over_serving_budget, speaker_link_invalid, sponsor_downgraded, budget_line_blocked, manual_override]` | |

`campaign_conversion_event` (pixel- and s2s-attributed conversions; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Attribution service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{meta_click_id, gclid, segment_anonymous_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `campaign_id` | `uuid` | FK -> campaign.id |
| `channel_dispatch_id` | `uuid` | FK -> campaign_channel_dispatch.id |
| `conversion_type` | `enum[registration, meeting_request, app_install, content_download, sponsor_lead_capture]` | |
| `registration_id` | `uuid null` | FK -> registration.id (Module 6.1) when known |
| `attribution_method` | `enum[pixel_first_party, pixel_third_party, s2s_conversion_api, last_touch, multi_touch_position]` | |
| `attribution_window_hours` | `int` | Click-to-convert window (default 720 / 30d) |
| `conversion_value_local` | `numeric(12,2) null` | For ROI tracking; e.g., sponsor deal revenue |
| `device_fingerprint` | `text null` | Hashed; for cross-device stitching |

### D. Business Logic & Edge Cases

- **IF** a new `campaign` is created with `campaign_type = speaker_announcement` and references `speaker_id`, **THEN** the engine subscribes to `speaker.onboarding.changed` (Module 4.2) and validates that the speaker's `onboarding_status` is `ready`, `rehearsal_done`, or `qc_passed` at the moment of `send_started_at`. If the speaker's status regresses below `ready` between scheduling and send, the engine auto-halts the campaign and surfaces a "Speaker Link Invalidated" task to the MPL.
- **IF** a `campaign` of type `speaker_announcement` is scheduled to send at `T` and Module 4.2 publishes `speaker.onboarding.changed` with a status of `withdrawn` or `cancelled` at any time `<= T - 30 minutes`, **THEN** the engine sets `status = send_halted`, publishes `campaign.speaker_link.invalidated`, and creates a high-priority MPL task with two actions: "Rewrite copy without speaker reference" or "Cancel campaign".
- **IF** a campaign of type `registration_drive` selects an audience whose members include `registration_status = confirmed`, **THEN** the engine's `audience_evaluation` job applies the `suppression_list_ids` (which include `prior_converted` by default) and removes those members from `computed_member_ids` before dispatch, publishing `campaign.audience.computed` with `membership_count` reflecting the suppression.
- **IF** a `campaign_channel_dispatch` of `channel = paid_social` and `vendor = meta_ads_manager` reports `vendor_spend_local >= daily_budget_cap_local * (rolling_spend_cap_pct / 100.0)` within the `rolling_window_minutes` window, **THEN** the engine calls the Meta Ads API to pause the ad set, sets `dispatch_status = paused` and `auto_pause_reason = over_serving_budget`, publishes `campaign.adset.auto_paused`, and pages the MPL via the Module 7.3 push notification center plus a Twilio SMS.
- **IF** Module 5.1 publishes `sponsor.deal.downgraded` for a `sponsor_deal_id` referenced by an active `sponsor_promotion` campaign, **THEN** the engine halts the campaign, revalidates the entitlement snapshot (e.g., main stage branding is gone for a Platinum-to-Gold downgrade), and surfaces an "Asset Mismatch" task to the SSL and MPL with the choice to rewrite or cancel.
- **IF** Module 9.1 publishes `budget.variance.threshold_breached` for the marketing budget line referenced by `campaign.budget_line_id`, **THEN** all paid-channel dispatches on campaigns pointing at that line are paused with `auto_pause_reason = budget_line_blocked`, organic-channel dispatches continue, and the MPL is alerted.
- **IF** the attribution service receives a server-to-server conversion event for a `registration.confirmed` event (Module 6.1) and the registration was preceded within the attribution window by a click on a paid social ad with a known `meta_click_id` or `gclid`, **THEN** the engine records a `campaign_conversion_event` with `attribution_method = s2s_conversion_api`, increments `campaign_channel_dispatch.conversion_count`, and publishes `campaign.conversion.attributed` for downstream ROI analytics (Module 12).

**Edge case (non-obvious): speaker withdraws 2 hours before a personalized send.** At 11:00 on T-3 weeks, the MPL schedules a `speaker_announcement` email to 8,000 prospects announcing the Minister of Mines of Country X. Each personalized email contains a trackable link to the speaker's bio page on the event website. At 13:00 on the same day, the Minister's chief of staff emails the CSM (Module 4.2) that the Minister has been recalled to a Cabinet session and withdraws from the Forum. The CSM updates the speaker's `onboarding_status` to `withdrawn` in the Module 4.2 portal; Module 4.2 publishes `speaker.onboarding.changed` with `{speaker_id, onboarding_status: "withdrawn", reason: "ministerial_recall"}`. The Campaign Orchestration engine's consumer for `speaker.onboarding.changed` matches the event to `campaign.speaker_id` and notes that `scheduled_send_at - now()` is 2 hours (campaign scheduled for 15:00). The engine sets `campaign.status = send_halted`, publishes `campaign.speaker_link.invalidated`, calls Marketo's API to cancel the scheduled program send (so even if the local engine is overridden, Marketo does not fire), and opens an MPL task with two paths: (1) "Rewrite copy without speaker reference" - which loads a templated alternative version pre-approved by the CSM that focuses on the Forum's overall agenda instead of a specific speaker; or (2) "Cancel campaign" - which marks `status = cancelled`, releases the audience reservation, and refunds the planned spend to the marketing budget line (Module 9.1). The MPL chooses (1), edits the copy in the Marketo asset editor (Marketo is the source of truth for the email body), approves the revision via a co-sign with the CSM, and reschedules the send for 16:30 the same day. The original personalized links are invalidated by the website CMS (a flag in `ext_refs.wordpress_post_id` indicates the speaker bio page is hidden), so even if a stale email from a Marketo cache slips through, the link 404s gracefully and redirects to the agenda page.

**Edge case (non-obvious): paid social ad set burns US$ 5K in 2 hours against a US$ 5K/day target.** A `sponsor_promotion` campaign for a Platinum sponsor includes a paid social ad set on Meta Ads Manager with a daily budget of US$ 5,000 and a flight of 10 days (total US$ 50,000). At 09:00 the ad set goes live; by 11:00 Meta's API reports spend of US$ 5,300 due to a high-CPM placement on Reels and an unexpectedly high CTR from a placement-audience match. The Campaign Orchestration engine's spend-reconciliation job (polls Meta Ads API every 5 minutes) detects that `vendor_spend_local (5,300) >= daily_budget_cap_local (5,000) * rolling_spend_cap_pct / 100 (2.0) = 10,000` is not yet true, but `vendor_spend_local (5,300) >= daily_budget_cap_local (5,000) * 1.0 = 5,000` is true at only 2 hours into the window. The pacing algorithm uses a more conservative trigger: `rolling_2h_spend >= daily_budget_cap * (rolling_window_minutes / 1440) * rolling_spend_cap_pct / 100`, which evaluates `5,300 >= 5,000 * (120/1440) * 2.0 = 833.33`, well over the threshold. The engine calls Meta Ads API's `/{adset_id}` endpoint with `status = PAUSED`, sets `dispatch_status = paused` and `auto_pause_reason = over_serving_budget`, publishes `campaign.adset.auto_paused`, and pushes a Twilio SMS to the MPL: "Ad set paused: 2h spend US$ 5,300 vs US$ 833 cap. Tap to review." The MPL opens the dashboard, sees the spend chart, the placement breakdown (Reels CPM was 3.2x the News Feed CPM), and three remediation options: (1) resume with Reels placements excluded (a one-tap action that updates Meta ad set `targeting.device_platforms` and `publisher_platforms` via the API), (2) resume with a reduced daily budget (US$ 3,000/day, total flight extended to 17 days), or (3) keep paused and reallocate the budget to paid search. The MPL chooses (1), the engine records the change in `audit_log` with `actor_id`, `prior_targeting`, `new_targeting`, `justification`, and resumes the ad set; subsequent 2-hour windows are checked against the same formula but with the new targeting context.

### E. Third-Party Integrations

- **Marketo or HubSpot (email marketing and lead nurture automation):** Primary ESP for the email channel. Data flow: FMF `campaign` record -> Integration Hub -> Marketo Program creation with Smart Campaign referencing a static list synced from `campaign_audience.computed_member_ids`. Marketo unsubscribes propagate back as `marketing_consent = false` updates on the `registration` record (Module 6.1) within 5 minutes. Send start/complete webhooks from Marketo update `campaign_channel_dispatch.dispatch_status` and `dispatched_count`.
- **SendGrid (transactional email fallback):** Used for time-critical transactional sends (e.g., last-minute agenda change notifications) when Marketo is throttled. Data flow: FMF -> Integration Hub -> SendGrid Mail Send API; SendGrid event webhook -> Integration Hub -> `campaign_channel_dispatch.failed_count` for bounces.
- **Hootsuite or Buffer (organic social scheduling):** Cross-platform organic posts (X, LinkedIn, Instagram, Facebook, YouTube Community tab). Data flow: FMF `campaign` with `channel = organic_social` -> Integration Hub -> Hootsuite/Buffer message creation with per-platform variants (caption length, hashtag count, image aspect ratio). Hootsuite publish webhook updates `dispatch_status` and surfaces per-post engagement metrics.
- **Meta Ads Manager (paid social):** Programmatic ad buying on Facebook and Instagram. Data flow: FMF -> Integration Hub -> Meta Marketing API for ad set creation, audience sync via Custom Audiences from `campaign_audience.computed_member_ids` (hashed PII), and bid/budget config. Reverse: Meta Ads Insights API polled every 5 minutes updates `campaign_channel_dispatch.vendor_spend_local` and `conversion_count`.
- **Google Ads (paid search):** Search and Display campaigns. Data flow: FMF -> Integration Hub -> Google Ads API for campaign creation, keyword set, ad group config. Reverse: Google Ads API reporting every 15 minutes for spend and conversion data.
- **Google Analytics 4 (web analytics):** Pixel-based conversion tracking on the event website (Next.js). Data flow: ATT tag -> GA4 server -> Measurement Protocol ingestion -> Integration Hub -> `campaign_conversion_event` with `attribution_method = pixel_first_party`.
- **Segment (Customer Data Platform):** Unified tracking layer across web, app, and ESP events. Data flow: ATT web events, ATT mobile SDK events (Module 7), Marketo email open events, Twilio SMS delivery events -> Segment -> routed to GA4 (analytics), Mixpanel (product), and the FMF `campaign_conversion_event` table via webhook. Segment also handles cross-device stitching via `segment_anonymous_id`.
- **Twilio (SMS channel):** Time-sensitive SMS blasts (e.g., "Doors open in 1 hour"). Data flow: FMF -> Integration Hub -> Twilio Programmable Messaging. Reverse: Twilio status callback updates `dispatch_status` per message.
- **WordPress or Drupal (event website CMS):** Speaker bio pages, press room landing pages, registration landing pages. Data flow: FMF `campaign.speaker_id` references the WordPress post ID via `ext_refs.wordpress_post_id`. When a speaker withdraws, the engine calls WordPress REST API to set the post status to `draft` (unpublished) or to redirect to the agenda page.
- **Kafka topics:** Publishes `campaign.*` (full list above). Subscribes to `speaker.onboarding.changed` and `speaker.session_started` (Module 4.2), `sponsor.deal.signed`, `sponsor.deal.downgraded`, `sponsor.deal.restored` (Module 5.1), `registration.confirmed`, `registration.cancelled`, `registration.attendee.upserted` (Module 6.1), `budget.variance.threshold_breached`, `budget.pacing.alert` (Module 9.1).

### F. UI/UX Notes

The MPL's primary screen is a four-quadrant Kanban-plus-Gantt layout. Top-left: a Gantt-style timeline of all active campaigns across the next 90 days, color-coded by `campaign_type` (blue = registration drive, gold = sponsor promotion, purple = speaker announcement, green = content marketing, orange = retargeting), with a vertical red line at "now" and an amber zone 48 hours ahead indicating the "send-halt review window." Top-right: the selected campaign's detail panel, showing audience size, planned vs actual spend, channel-by-channel delivery progress, and a "Health" badge (green/amber/red) derived from `status`, `auto_pause_reason`, and `vendor_spend_local` pacing. Bottom-left: a real-time conversions widget showing `campaign_conversion_event` count over time, segmented by `attribution_method`, with a toggle between last-touch and multi-touch views. Bottom-right: an alerts queue with three lanes (speaker-link invalidated, ad-set auto-paused, budget-line blocked), each card carrying one-tap "Resume", "Rewrite", or "Cancel" actions.

The ED's War Room view (Module 1.1) consumes a marketing tile showing top 3 active campaigns by spend, total marketing budget pacing vs plan, and a red flag if any speaker-announcement campaign is in `send_halted` status referencing a dignitary speaker (escalates to ED given protocol risk). The SSL sees only sponsor-promotion campaigns scoped to their portfolio. The CSM sees speaker-announcement campaign briefs in their Kanban as a separate column ("Awaiting Speaker Confirmation") that mirrors `speaker.onboarding_status`.

### G. Failure Modes & Offline Behavior

- **Marketo API outage during a scheduled send:** The Integration Hub retries 3 times with 30-second exponential backoff; on final failure, the `campaign_channel_dispatch` is marked `failed` and the MPL is alerted. The MPL can fall back to SendGrid via a one-tap "Reroute to SendGrid" action that re-resolves the audience and dispatches the same creative. The original Marketo program is canceled once Marketo API recovers.
- **Meta Ads API unreachable during auto-pause trigger:** The engine continues polling every 5 minutes; if the ad set is still serving after 15 minutes of unreachable API, the MPL is paged via PagerDuty and a manual "Pause in Meta Business Manager" runbook is displayed with deep-link to the Meta Ads Manager UI.
- **Google Analytics 4 Measurement Protocol latency (conversions not landing):** The s2s attribution service buffers events in Redis for 24 hours with retry; if GA4 remains unreachable, the events still land in the FMF `campaign_conversion_event` table (which is the source of truth for ROI) and are reconciled to GA4 when connectivity resumes.
- **WordPress CMS unreachable when a speaker withdraws:** The engine records the desired post status change in a local `pending_cms_action` queue and applies it within 60 seconds of CMS recovery. The personalized links in emails already sent remain valid until the CMS state changes, which the MPL accepts as a known window of up to 60 seconds.
- **Segment CDP outage:** The engine falls back to direct web pixel ingestion into the FMF analytics warehouse via a queued webhook; cross-device stitching is degraded until Segment recovers, but first-party attribution continues.
- **Audience evaluation job failure (e.g., ClickHouse timeout):** The engine retains the prior `computed_member_ids` and surfaces a "Stale Audience" warning to the MPL; the campaign can proceed with the stale audience (with an audit flag) or be rescheduled.
- **Twilio SMS API outage:** SMS dispatches are queued in the Integration Hub DLQ with 7-day retention; the MPL can fall back to email-only via SendGrid with a one-tap action, accepting reduced conversion.
- **MPL offline (out of office, no mobile signal) when an ad-set auto-pause fires:** The engine routes the alert to the ED's War Room dashboard (Module 1.1) after 10 minutes of MPL non-acknowledgment, and the ED can act on the auto-pause with a co-sign from the FAL.

### H. Acceptance Criteria

- **Given** a `speaker_announcement` campaign scheduled to send at 15:00 referencing `speaker_id = S1` and at 13:00 Module 4.2 publishes `speaker.onboarding.changed` with `{onboarding_status: "withdrawn"}`, **When** the engine's consumer processes the event, **Then** the engine sets `campaign.status = send_halted`, calls Marketo's API to cancel the scheduled program, publishes `campaign.speaker_link.invalidated` within 60 seconds, and opens an MPL task with "Rewrite" and "Cancel" actions, each requiring the appropriate co-sign.
- **Given** a `sponsor_promotion` paid social ad set with `daily_budget_cap_local = US$ 5,000` and `rolling_window_minutes = 120`, **When** the spend reconciliation job polls Meta Ads API at 11:00 and finds `vendor_spend_local = US$ 5,300` in the first 2 hours, **Then** the engine calls the Meta Marketing API to pause the ad set, sets `campaign_channel_dispatch.dispatch_status = paused` and `auto_pause_reason = over_serving_budget`, publishes `campaign.adset.auto_paused`, and sends a Twilio SMS to the MPL within 60 seconds.
- **Given** a `registration_drive` campaign whose primary audience includes 500 attendees with `registration_status = confirmed`, **When** the `audience_evaluation` job runs at `scheduled_send_at - 30 minutes`, **Then** the engine removes those 500 from `computed_member_ids`, publishes `campaign.audience.computed` with `membership_count` reflecting the suppression, and the dispatch to the email channel excludes those attendees.
- **Given** a server-to-server conversion event for `registration_id = R1` (Module 6.1 confirmed) preceded within 30 days by a click with `meta_click_id = MCI_12345` on a paid social ad, **When** the attribution service processes the registration, **Then** a `campaign_conversion_event` is created with `attribution_method = s2s_conversion_api`, the corresponding `campaign_channel_dispatch.conversion_count` is incremented, and `campaign.conversion.attributed` is published for the ROI analytics projection.
- **Given** Module 5.1 publishes `sponsor.deal.downgraded` for a `sponsor_deal_id` referenced by an active `sponsor_promotion` campaign, **When** the engine's consumer processes the event, **Then** the campaign is halted, all paid-channel dispatches on that campaign are paused with `auto_pause_reason = sponsor_downgraded`, an "Asset Mismatch" task is created for the SSL and MPL, and the campaign cannot resume until either the creative is rewritten to match the downgraded entitlement snapshot or the sponsor's tier is restored via `sponsor.deal.restored`.
