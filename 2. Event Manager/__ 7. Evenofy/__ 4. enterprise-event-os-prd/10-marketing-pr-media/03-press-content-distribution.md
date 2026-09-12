> Module 10: Marketing, PR & Media Center -> 10.3 Press & Content Distribution

## Press & Content Distribution

### A. Purpose Statement

The Press & Content Distribution subsystem is the production, embargo, and distribution pipeline for all formal communications from the Future Minerals Forum to media, partners, and the public. At FMF scale, the platform manages 60+ press releases (one per ministerial speaker plus deal-signing announcements), 1,200+ high-resolution photos, 80+ hours of b-roll video, 200+ fact sheets, and 60+ speaker bios across the 3-day event. A single botched distribution (e.g., a press release going live 10 minutes before the President of the host country begins speaking, or a 4 GB high-res photo emailed to a wire service and bouncing due to file-size limits) becomes both a press-relations failure and a diplomatic protocol incident. This subsystem exists so that every press asset is versioned, embargoed, distributed to the right channel with the right entitlement, and reachable from anywhere in the world via a CDN-backed download surface, with ED approval gating every public-facing release.

The subsystem is the write-side owner of the `press.*` Kafka topic prefix per the Module 0.1 bounded context table. It publishes `press.kit.created`, `press.release.drafted`, `press.release.approved`, `press.release.distribution_scheduled`, `press.release.distributed`, `press.release.embargo_lifted`, `press.release.pulled_back`, `press.asset.uploaded`, `press.asset.presigned_url_issued`, `press.asset.expired`, `press.breaking_triggered`, and `press.wire.delivered`. It subscribes to `accreditation.badge.tier_assigned` (Module 10.2) to scope embargoed distribution to the right journalist cohorts, to `deal.signed` and `sponsor.deal.signed` (Module 5.1) to trigger templated deal-announcement press releases, to `session.scheduled` and `session.published` (Module 4.1) to schedule speaker-announcement releases, and to `social.crisis.detected` (Module 10.4) to trigger clarification press releases when misrepresentation is detected. Its non-negotiable contracts are: (1) no press release with `embargo_lift_at > now()` may be posted publicly on the event website or social channels until the embargo lifts, (2) any asset exceeding 25 MB in size must be distributed via an S3 pre-signed URL with explicit expiry rather than via email attachment, and (3) every breaking announcement press release requires ED approval before distribution, even when the underlying deal or session event has already been confirmed.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all press content. Write only via approval gates (every `press.release` requires ED sign before distribution; every breaking announcement requires a second ED sign at distribution time). Can pull back a distributed press release via break-glass with MPL co-sign.
- **Operations Lead (OL):** Read on press release schedule for coordination with run-of-show (Module 1.3). No write.
- **Protocol Officer (PO):** Read-only on press releases referencing dignitaries or protocol-sensitive content (e.g., ministerial titles, bilateral meeting outcomes). Write on a "Protocol Review" gate that must be cleared before ED approval for protocol-tagged releases.
- **VIP Liaison (VL):** No direct access.
- **Registration Manager (RM):** No direct access.
- **Sponsorship Sales Lead (SSL):** Read on press releases that name a sponsor (e.g., sponsor-funded program announcements). Write on sponsor press kit submissions (subject to MPL approval).
- **Exhibitor Portal User (EPU):** Read-only on their sponsor's press kit assets. Cannot publish.
- **Content & Stage Manager (CSM):** Read on press releases tied to sessions they manage (e.g., speaker bios). Writes speaker bio drafts into the system for MPL and ED review.
- **Matchmaking Concierge (MC):** No direct access.
- **Finance & Administration Lead (FAL):** No direct access.
- **Marketing & PR Lead (MPL):** Primary owner. Read/write on press kits, releases, asset library, distribution lists, and embargo schedules. Cannot override an ED approval gate or pull-back action without ED co-sign.
- **ESG & Sustainability Officer (ESGO):** Read-only on press releases tagged `esg_themed` to verify messaging alignment with ESG claims. No write.
- **Field Volunteer (FV):** No direct access. May be dispatched to the Media Desk to assist with asset handoff.
- **Attendee (ATT):** Read-only on public press releases and publicly-listed press kit assets via the event website Press Room page once embargo lifts.

### C. Data Model

`press_kit` (themed collection of press assets; extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{wordpress_press_room_category_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `name` | `text` | E.g., "FMF 2026 Day 1 Plenary Kit" |
| `theme` | `enum[ministerial_session, deal_announcement, sponsor_program, esg_report, fact_sheet_collection, speaker_bio_collection, b_roll_collection]` | |
| `visibility` | `enum[private, embargoed, public]` | |
| `embargo_lift_at` | `timestamptz null` | If visibility = embargoed |
| `asset_ids` | `uuid[]` | FK -> press_asset.id |
| `release_ids` | `uuid[]` | FK -> press_release.id |
| `tag_sponsor_deal_id` | `uuid null` | If sponsor_program |
| `tag_session_id` | `uuid null` | If ministerial_session |

`press_release` (formal release text with embargo and distribution; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | MPL or CSM (for speaker bios) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{businesswire_release_id, pr_newswire_distribution_id, wordpress_post_id, hootsuite_message_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `title` | `text` | Release headline |
| `subtitle` | `text null` | Subhead |
| `body_markdown` | `text` | Release body in markdown; rendered to HTML on distribution |
| `body_html_cached` | `text null` | Rendered HTML cached |
| `language_codes` | `char(2)[]` | ISO 639-1; e.g., ['en', 'ar', 'zh', 'fr'] for FMF |
| `release_type` | `enum[pre_event_announcement, speaker_announcement, deal_announcement, breaking, fact_sheet, esg_report, post_event_summary]` | |
| `is_embargoed` | `boolean` | True if release under embargo |
| `embargo_lift_at` | `timestamptz null` | Public publication time |
| `is_breaking` | `boolean` | True if triggered by deal/session event |
| `trigger_event_id` | `uuid null` | FK -> deal_event.id or session.id that triggered |
| `status` | `enum[draft, in_review, po_reviewed, approved, scheduled, distributed, pulled_back, expired]` | |
| `approved_by_ed_at` | `timestamptz null` | ED sign timestamp |
| `approved_by_po_at` | `timestamptz null` | PO protocol review sign (if protocol-tagged) |
| `distribution_scheduled_at` | `timestamptz null` | Scheduled distribution time |
| `distribution_actual_at` | `timestamptz null` | Actual distribution time |
| `distribution_channels` | `text[]` | Subset of `[email_accredited_media, ftp_wire_services, s3_wire_services, social_organic, website_press_room, app_push]` |
| `wire_service_vendors` | `text[] null` | Subset of `[businesswire, pr_newswire, ap, reuters, afp, bloomberg]` |
| `pulled_back_at` | `timestamptz null` | Pull-back timestamp |
| `pulled_back_reason` | `text null` | |
| `pulled_back_by` | `uuid null` | ED (break-glass) |

`press_asset` (high-res photo, b-roll video, fact sheet PDF, speaker bio; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | MPL or CSM |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{s3_object_key, cloudfront_distribution_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `asset_type` | `enum[photo_highres, photo_webres, broll_video, fact_sheet_pdf, speaker_bio_pdf, speaker_headshot, logo_pack]` | |
| `file_name` | `text` | E.g., "FMF_2026_Day1_Plenary_001.jpg" |
| `mime_type` | `text` | E.g., "image/jpeg", "video/mp4", "application/pdf" |
| `size_bytes` | `bigint` | File size |
| `s3_bucket` | `text` | E.g., "fmf-press-assets-2026" |
| `s3_object_key` | `text` | E.g., "day1/plenary/FMF_2026_Day1_Plenary_001.jpg" |
| `cloudfront_url` | `text` | CDN-backed URL for global distribution |
| `exif_caption` | `text null` | IPTC caption for photos |
| `credit_line` | `text null` | Photographer or source |
| `is_watermarked` | `boolean` | For preview/low-res versions |
| `visibility` | `enum[private, embargoed, public]` | |
| `embargo_lift_at` | `timestamptz null` | |
| `linked_release_id` | `uuid null` | FK -> press_release.id if part of a release |
| `linked_speaker_id` | `uuid null` | FK -> speaker.id (Module 4.2) if headshot or bio |
| `expires_at` | `timestamptz null` | For presigned URLs |

`press_distribution_log` (per-recipient per-channel delivery record; extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{sendgrid_message_id, ftp_transfer_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `press_release_id` | `uuid` | FK -> press_release.id |
| `channel` | `enum[email_accredited_media, ftp_wire_service, s3_wire_service, social_organic, website_press_room, app_push]` | |
| `recipient_press_badge_id` | `uuid null` | FK -> press_badge.id for email_accredited_media |
| `recipient_vendor_account` | `text null` | E.g., wire service FTP user |
| `delivered_at` | `timestamptz null` | Delivery timestamp |
| `delivery_status` | `enum[queued, in_flight, delivered, bounced, failed]` | |
| `presigned_url_id` | `uuid null` | FK -> press_asset_presigned_url.id if asset distribution |
| `delivery_payload_size_bytes` | `bigint null` | Total payload size |

`press_asset_presigned_url` (time-limited S3 download URL; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Integration Hub service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{aws_kms_key_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `press_asset_id` | `uuid` | FK -> press_asset.id |
| `press_badge_id` | `uuid null` | FK -> press_badge.id (requesting journalist) |
| `requested_by_email` | `text null` | If request came from a non-accredited outlet (with MPL approval) |
| `url` | `text` | The S3 presigned URL |
| `expires_at` | `timestamptz` | URL expiry (default 24h) |
| `download_count` | `int` | Number of times the URL was used |
| `max_downloads` | `int` | Default 5; cap to prevent abuse |

### D. Business Logic & Edge Cases

- **IF** a `press_release` is created with `is_embargoed = true` and `embargo_lift_at > now()`, **THEN** the engine blocks the `distribution_channels` from including `website_press_room` or `social_organic` until `embargo_lift_at`, but allows `email_accredited_media` and `s3_wire_services` to accredited journalists per Module 10.2 with an `embargo_receipt` record.
- **IF** Module 5.1 publishes `sponsor.deal.signed` for a deal with `contract_value_usd >= 500_000_000`, **THEN** the engine triggers a `press_release` of `release_type = deal_announcement` from a pre-approved template (`breaking_deal_template.md`), auto-fills the template with the sponsor name, deal value, and partner names, and routes through ED approval before distribution. The `trigger_event_id` is set to the deal event for traceability.
- **IF** a `press_release` of `is_breaking = true` is approved by ED and scheduled for `distribution_scheduled_at = T`, **THEN** the engine permits the MPL or ED to extend or pull back the release up to `T - 0 seconds` (the moment of distribution); after `T`, the release is `distributed` and pull-back requires a `pulled_back` action with ED + MPL co-sign, which triggers a "Recall" email to all recipients and removes the release from the website Press Room.
- **IF** an accredited journalist or a wire service requests a `press_asset` whose `size_bytes > 25_000_000` (25 MB), **THEN** the engine does NOT attach the asset to an email; instead it generates an S3 presigned URL with `expires_at = now() + 24 hours` and `max_downloads = 5`, stores it as a `press_asset_presigned_url`, and emails the URL to the recipient. The URL is logged in `press_distribution_log.presigned_url_id`.
- **IF** a `press_asset` of `asset_type = photo_highres` is uploaded, **THEN** the engine automatically generates a `photo_webres` derivative at 1600px max width via the AWS Lambda image processing pipeline, and links the two via `linked_release_id`. The high-res is for wire services; the web-res is for the website Press Room and social media.
- **IF** a `press_release` references a dignitary (Protocol Officer flag `is_protocol_sensitive = true`), **THEN** the engine requires `approved_by_po_at` to be set before ED can approve; without PO sign, the ED approval action returns `PROTOCOL_REVIEW_REQUIRED`.
- **IF** Module 10.4 publishes `social.crisis.detected` with `severity = s1` matching a published quote misrepresentation, **THEN** the engine surfaces a "Clarification Release" template to the MPL with the misrepresentation evidence (URL, original quote, misrepresentation context), pre-filled with a clarification body, and routes through expedited ED approval (15-minute SLA vs standard 2-hour).

**Edge case (non-obvious): ED wants to delay an approved release by 30 minutes for diplomatic coordination.** At 13:45 on Day 1 of FMF, a `press_release` announcing a US$ 1.5B copper mining investment by a Sovereign Wealth Fund in Country Y is approved by ED and scheduled for distribution at 14:30. The release has been queued to all distribution channels (BusinessWire, AP, Reuters, AFP, Bloomberg wire services; 220 accredited journalists via email; Hootsuite for social; WordPress for the Press Room). At 14:02, the ED receives a phone call from the Protocol Officer: the Finance Minister of Country Y has requested a 30-minute delay so they can notify their counterpart in Country Z (a regional neighbor with which Country Y has a delicate trade relationship) before the announcement goes public. The ED opens the Campaign Console, locates the press release in `approved` status with `distribution_scheduled_at = 14:30`, and clicks "Reschedule." The engine validates that `now() (14:02) < distribution_scheduled_at (14:30) - 0`, so rescheduling is permitted. The ED enters the new time of 15:00 and a justification ("Diplomatic coordination - Finance Minister Y to notify counterpart in Country Z"). The engine updates `distribution_scheduled_at = 15:00`, republishes `press.release.distribution_scheduled` with the new time, and the Integration Hub cancels the queued BusinessWire, AP, Reuters, AFP, and Bloomberg FTP transfers (within 30 seconds of cancellation), cancels the queued SendGrid email sends, cancels the Hootsuite scheduled messages, and does not post to WordPress. The release is now in `scheduled` status with the new time. The MPL and the wire services receive a notification ("Release FMF-2026-PR-047 rescheduled to 15:00; prior schedule canceled"). At 14:55, with 5 minutes to go, the ED decides to extend the delay further by 10 minutes (to 15:10) for the same diplomatic reason. The engine again permits the extension because `now() < distribution_scheduled_at - 0`. At 15:10 the release distributes normally. However, if at 15:08 the ED wanted to pull back entirely (cancel), the engine would permit a pull-back up to `T - 0 seconds` (i.e., before 15:10); at 15:08, with 2 minutes to go, the pull-back is permitted. The pull-back sets `status = pulled_back`, cancels all queued distributions, and the release never goes public. If the release has already distributed (e.g., at 15:10:01 a second after distribution), the pull-back requires ED + MPL co-sign, triggers a "Recall" email to all recipients with the original release and a recall notice, removes the WordPress post (sets to `draft`), and the Hootsuite social posts are deleted if not yet published. The `pulled_back_at`, `pulled_back_by`, and `pulled_back_reason` are recorded in `audit_log`. This entire flow is also visible in the Module 1.1 War Room dashboard as a tile showing the release lifecycle.

**Edge case (non-obvious): wire service requests a 4 GB high-res photo for a print front-page.** At 11:30 on Day 2 of FMF, the Bloomberg Pictures desk emails the FMF Media Desk requesting a high-resolution photo of the bilateral handshake between the host country's Crown Prince and the Minister of Mines of Country X. The photo (`press_asset` with `asset_type = photo_highres`, `size_bytes = 4_200_000_000` - 4.2 GB - because it is a 100-megapixel RAW converted to TIFF with embedded ICC profiles) exists in the press kit for the Day 2 plenary. The Media Desk FV opens the Press & Content Distribution console, locates the asset, and clicks "Send to Bloomberg." The engine checks `size_bytes > 25_000_000` (25 MB threshold) - yes, 4.2 GB far exceeds it. The engine does NOT attach the asset to an email. Instead, it generates an S3 presigned URL via AWS SDK for Java, with `expires_at = now() + 24 hours`, `max_downloads = 5`, and uses AWS KMS customer-managed key (CMK) to enforce SSL-only access and IP allow-listing (the Bloomberg Pictures desk IP range is in a allowlist config). The URL is stored as a `press_asset_presigned_url` with `press_badge_id = <Bloomberg journalist's press_badge.id>` and `requested_by_email = "pictures@bloomberg.net"`. The engine then emails the URL (via SendGrid) to the Bloomberg Pictures desk and to the requesting journalist, with the email body containing the asset metadata (caption, credit line "FMF 2026 / Photographer Name", expiry time in the recipient's local timezone). Bloomberg's photo editor clicks the URL at 13:15, downloads the 4.2 GB TIFF, and `download_count` is incremented. The URL is valid for 5 downloads and 24 hours. If Bloomberg attempts a 6th download, S3 returns 403 Forbidden. If Bloomberg attempts to download after expiry, S3 returns 403 Forbidden. If a different IP outside the allowlist attempts to use the URL (e.g., the URL is leaked), S3 returns 403 Forbidden and the engine logs a `press.asset.unauthorized_access` event, alerting the MPL. After 24 hours, the URL is marked `expired` and the asset is no longer downloadable; Bloomberg must request a new URL. The CloudFront CDN caches a lower-res preview (1600px) for the website Press Room, but the high-res is always S3-direct to avoid CDN cache poisoning with multi-GB files.

### E. Third-Party Integrations

- **BusinessWire or PR Newswire (wire distribution):** Primary wire service for global press release distribution to 100+ countries. Data flow: FMF `press_release` approved and scheduled -> Integration Hub -> BusinessWire API (or PR Newswire API) submission with embargo terms and distribution list (e.g., "Mining Industry," "Finance - Sovereign Wealth," "Middle East Business"). Reverse: Wire service confirmation webhook updates `press_distribution_log.delivery_status` and provides a `wire_release_id` stored in `ext_refs.businesswire_release_id`.
- **AP, Reuters, AFP, Bloomberg wire FTP/S3 drop:** Direct distribution to international wires via S3-to-S3 copy (preferred) or SFTP. Data flow: FMF -> Integration Hub -> S3 bucket `fmf-wire-drop-<wire>` with a manifest JSON listing the release and assets; the wire service's ingestion pipeline picks up the manifest within 60 seconds. For SFTP fallback (older wire endpoints), the Integration Hub uses a credentials-rotated SFTP user with key-based auth.
- **AWS S3 (asset storage):** All press assets stored in versioned S3 buckets with KMS-CMK encryption. Bucket lifecycle policy: transition to S3 Glacier after 90 days, delete after 7 years (matching the Kafka retention requirement for FMF-class events).
- **CloudFront (CDN for global downloads):** Distribution layer for the website Press Room and for low-res preview images. CloudFront signed URLs (different from S3 presigned URLs) are used for time-limited CDN access to public-but-rate-limited assets (e.g., a viral speaker photo to prevent hot-linking). Data flow: S3 origin -> CloudFront edge locations -> global downloaders.
- **Hootsuite (social distribution):** For organic social posts of press releases to X, LinkedIn, Instagram, Facebook, and YouTube Community tab. Data flow: FMF -> Integration Hub -> Hootsuite message creation with per-platform variants. Hootsuite publish webhook updates `press_distribution_log.delivery_status`.
- **WordPress or Drupal (event website CMS):** The Press Room page on the FMF website is a WordPress custom post type `press_release`. Data flow: FMF -> Integration Hub -> WordPress REST API creates the post in `draft` if embargoed, transitions to `publish` on `embargo_lift_at`. Reverse: WordPress webhook confirms publication and updates `ext_refs.wordpress_post_id`.
- **DocuSign (embargo agreement wrapper):** For high-sensitivity embargoed releases (e.g., ministerial speeches), the release distribution to accredited journalists is wrapped in a DocuSign envelope that contains the embargo terms (per Module 10.2 `embargo_receipt`). Data flow: FMF -> DocuSign -> journalist email; DocuSign Connect webhook -> Integration Hub -> release content delivered via S3 presigned URL only after envelope completion.
- **SendGrid (email distribution to accredited media):** Bulk email to the journalist cohort with the release body HTML and asset links. Data flow: FMF -> Integration Hub -> SendGrid Mail Send API with a templated email. SendGrid event webhook updates `press_distribution_log.delivery_status` (delivered, bounced, deferred).
- **Kafka topics:** Publishes `press.*` (full list above). Subscribes to `accreditation.badge.tier_assigned` (Module 10.2), `sponsor.deal.signed` and `deal.signed` (Module 5.1), `session.scheduled` and `session.published` (Module 4.1), `social.crisis.detected` (Module 10.4).

### F. UI/UX Notes

The MPL's primary screen is a four-panel layout. Top-left: a press release pipeline Kanban with columns `draft -> in_review -> po_reviewed -> approved -> scheduled -> distributed`, each card showing release title, type, embargo status (clock icon with countdown if embargoed), and a red "BREAKING" badge if `is_breaking = true`. Top-right: the selected release's detail drawer with markdown editor, language variant tabs, asset list (drag-and-drop from the asset library), distribution channel checklist, and an approval bar (PO sign, ED sign, Schedule, Distribute Now). Bottom-left: the asset library grid with filters by `asset_type`, `visibility`, and `linked_release_id`; thumbnails for photos and PDFs; a "Generate Presigned URL" action on each asset. Bottom-right: a distribution log table with per-recipient per-channel delivery status, sortable and filterable by channel, status, and timestamp.

The ED's approval surface is a focused modal showing the release title, body preview (rendered HTML), the proposed distribution channels, the scheduled time, and a single "Approve" button (plus a "Request Changes" button that returns the release to MPL draft with notes). The PO's protocol-review surface is similar but scoped to protocol-tagged releases only. The FV at the Media Desk sees a simplified "Asset Request" form for handling wire-service photo requests (single screen: search asset, select recipient, generate URL, email).

### G. Failure Modes & Offline Behavior

- **BusinessWire API outage during scheduled distribution:** The Integration Hub retries 3 times with 5-minute backoff; on final failure, the release distribution to BusinessWire is marked `failed`, the release can still proceed to other channels (SendGrid, Hootsuite, WordPress), and the MPL is alerted. The release can be manually re-submitted to BusinessWire once the API recovers.
- **S3 presigned URL generation failure (e.g., KMS key disabled):** The asset request fails with `ASSET_URL_GENERATION_FAILED`, the MPL is alerted, and the requesting journalist receives an "Asset temporarily unavailable - please retry" email. The MPL can fall back to a manual upload via a secure file share link.
- **CloudFront CDN edge location unreachable:** The website Press Room falls back to direct S3 access (slower but functional); the engine detects elevated latency on the Press Room page and alerts the MPL.
- **WordPress REST API outage during embargo lift:** The engine queues the publish transition; on WordPress recovery, the post transitions to `publish` within 60 seconds. The public Press Room shows "No releases yet" during the outage, which is acceptable since the release was embargoed anyway.
- **Hootsuite publish failure (e.g., API rate limit):** The Integration Hub retries with exponential backoff; on final failure, the social post is marked `failed`, and the MPL can manually compose and publish via the Hootsuite UI with the pre-rendered social copy and asset provided.
- **SendGrid bulk send throttled (e.g., 220-recipient send exceeds per-minute limit):** The Integration Hub batches the send into chunks of 50 recipients with 10-second spacing; the total send completes within 60 seconds. The `press_distribution_log` records per-recipient delivery status as they land.
- **DocuSign envelope for embargo agreement expires:** The Integration Hub re-issues with a 24-hour extension and alerts the journalist; the embargoed content is NOT delivered to that journalist until the agreement is signed, even if `embargo_lift_at` has passed (they simply receive the public release via the website Press Room like a non-accredited visitor).
- **Wire service SFTP endpoint unreachable:** The Integration Hub falls back to S3-to-S3 copy if the wire has an S3 ingestion bucket (most modern wires do); for legacy SFTP-only wires, the transfer is queued and retried every 30 minutes, and the MPL is alerted to phone the wire's news desk for manual delivery if the queue exceeds 2 hours.

### H. Acceptance Criteria

- **Given** a `press_release` approved by ED with `is_embargoed = true` and `embargo_lift_at = 16:00` on Day 1, **When** the distribution scheduler runs at 14:00 (2 hours before lift), **Then** the engine distributes the release to accredited media via SendGrid email and S3 wire services (creating `embargo_receipt` records per Module 10.2), does NOT publish to the website Press Room or Hootsuite, and at 16:00:00 the engine transitions the WordPress post to `publish` and triggers Hootsuite to publish the social posts within 30 seconds.
- **Given** a `press_release` approved and scheduled for `distribution_scheduled_at = 14:30`, **When** the ED clicks "Reschedule" at 14:02 with new time 15:00 and justification "Diplomatic coordination", **Then** the engine updates `distribution_scheduled_at`, cancels all queued wire service FTP transfers, SendGrid emails, Hootsuite messages, and WordPress publish within 30 seconds, republishes `press.release.distribution_scheduled`, and the release distributes at 15:00 with the prior schedule fully canceled.
- **Given** a `press_asset` with `size_bytes = 4_200_000_000` requested by a Bloomberg journalist's `press_badge_id`, **When** the Media Desk FV clicks "Send to Bloomberg", **Then** the engine does NOT attach the asset to an email, generates an S3 presigned URL with `expires_at = now() + 24 hours` and `max_downloads = 5`, stores it as a `press_asset_presigned_url`, emails the URL via SendGrid to the requesting journalist and the Bloomberg Pictures desk, and the URL is logged in `press_distribution_log.presigned_url_id`.
- **Given** Module 5.1 publishes `sponsor.deal.signed` for a deal with `contract_value_usd = US$ 1.5B`, **When** the engine's `deal.signed` consumer processes the event, **Then** the engine triggers a `press_release` of `release_type = deal_announcement` and `is_breaking = true` from the `breaking_deal_template.md` template, auto-fills with sponsor name, deal value, and partner names, sets `trigger_event_id` to the deal event, and routes through expedited ED approval (15-minute SLA) before distribution.
- **Given** Module 10.4 publishes `social.crisis.detected` with `severity = s1` matching a misrepresentation of a dignitary's quote, **When** the engine's `social.crisis.detected` consumer processes the event, **Then** the engine surfaces a "Clarification Release" template to the MPL with the misrepresentation evidence pre-filled, and on MPL submission the release routes through expedited ED approval (15-minute SLA vs standard 2-hour) before distribution via all configured channels.
