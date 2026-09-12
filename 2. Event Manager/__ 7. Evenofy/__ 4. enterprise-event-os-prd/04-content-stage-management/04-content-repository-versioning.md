> Module 4: Content & Stage Management System -> 4.4 Content Repository & Versioning

## Content Repository & Versioning

### A. Purpose Statement

The Content Repository & Versioning subsystem is the canonical long-term store for every content artifact produced or consumed by the Forum: presentations, session recordings, transcripts, photographs, marketing assets, and derivative works. At FMF scale, the repository holds 12,000+ presentations, 3,500+ hours of recordings, 60,000+ photographs, and the full transcripts of every spoken word across 3 days of plenaries and breakouts. Retention is 7 years for FMF-class events (regulatory and diplomatic audit requirement), which means the repository must support retrieval of a specific slide from a specific ministerial keynote from 3 years ago within 30 seconds, with full provenance and access-control history.

This subsystem exists so that content access is governed by auditable rules, every file's history is recoverable, embargoed material is enforced with technical (not policy) controls, and the search experience for CSMs, MCs, and post-event analysts is sub-second across millions of artifacts. It is distinct from the Speaker & Presentation Management subsystem (4.2), which handles the operational upload and live projection workflow; this subsystem is the durable archive that receives assets from 4.2 (presentations), 4.3 (recordings and stream incidents), and from external sources (marketing assets, photographs).

### B. User Roles & Permissions

- **Event Director (ED):** Read on all content assets. Write only via break-glass to override an embargo or access list, with two-person approval (ED + CSM or ED + FAL for financial embargoes). Sees a "Content Repository Health" tile in the War Room showing total asset count, storage consumed, and count of active embargoes.
- **Operations Lead (OL):** Read-only on operational assets (run sheets, incident recordings); no access to speaker presentations or marketing assets.
- **Protocol Officer (PO):** Read-only on dignitary speaker presentations and recordings, gated by consent and embargo rules; cannot download.
- **VIP Liaison (VL):** Read-only on their assigned dignitary's presentation and recording, gated by consent; cannot download without watermark.
- **Registration Manager (RM):** No direct access.
- **Sponsorship Sales Lead (SSL):** Read-only on sponsor-branded marketing assets and sponsor-session recordings; no access to non-sponsor content.
- **Exhibitor Portal User (EPU):** Read-only on their own company's uploaded booth assets and lead-capture collateral; no access to other content.
- **Content & Stage Manager (CSM):** Primary owner. Read/write on all content assets, version metadata, access lists, and embargo configurations. Can approve watermark-required downloads within their permission scope. Cannot override a `do_not_distribute` embargo without ED co-approval.
- **Matchmaking Concierge (MC):** Read-only on session transcripts for context enrichment in matchmaking (e.g., surfacing "this attendee asked about lithium supply chains in the Day 2 Q&A"); cannot access presentation files.
- **Finance & Administration Lead (FAL):** Read-only on financial-embargoed assets (e.g., pre-announcement investor decks) within the post-announcement review window; no access to other content.
- **Marketing & PR Lead (MPL):** Read/write on marketing assets (campaigns, press kits, social media derivatives); read-only on session recordings and presentations per consent rules.
- **ESG & Sustainability Officer (ESGO):** Read-only on ESG report assets and session recording metadata for the carbon report; no access to raw presentation files.
- **Field Volunteer (FV):** No access.
- **Attendee (ATT):** Read-only on assets explicitly published to attendees (e.g., session recordings after the 24-hour review window, slides where `derivative_works_consent = granted`); cannot download without watermark.

### C. Data Model

`content_asset` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete (tombstone retained per 7-year policy) |
| `ext_refs` | `jsonb` | e.g., `{s3_bucket, s3_key, box_archive_id, mediaconvert_job_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `asset_type` | `enum[presentation, recording, transcript, photo, marketing_asset, derivative_work, incident_buffer]` | Functional classification |
| `name` | `text` | Original filename |
| `content_hash` | `char(64)` | SHA-256 of file content; used for dedup |
| `mime_type` | `text` | e.g., `application/pdf`, `video/mp4`, `image/jpeg` |
| `size_bytes` | `bigint` | File size |
| `duration_s` | `int null` | For audio/video |
| `width_px` | `int null` | For image/video |
| `height_px` | `int null` | For image/video |
| `language_codes` | `text[]` | ISO 639-1 of contained content |
| `source_module` | `enum[mod04_2_speaker, mod04_3_stream, mod05_commercial, mod10_marketing, external_upload]` | Provenance |
| `source_entity_id` | `uuid null` | FK to the source entity (e.g., speaker_profile.id, stream_destination.id) |
| `session_id` | `uuid null` | FK -> session.id if session-scoped |
| `speaker_profile_id` | `uuid null` | FK -> speaker_profile.id if speaker-owned |
| `is_current_version` | `bool` | True for the current version of a versioned asset |
| `version_number` | `int` | 1-based within version chain |
| `parent_version_id` | `uuid null` | FK -> content_asset.id of prior version |
| `version_chain_root_id` | `uuid` | ID of the first version in the chain |
| `access_policy_id` | `uuid` | FK -> content_access_policy.id |
| `is_embargoed` | `bool` | True if under embargo |
| `embargoed_until` | `timestamptz null` | When embargo lifts |
| `watermark_required` | `bool` | True if downloads require identity watermarking |
| `ocr_text` | `text null` | Full OCR text of slides (Tesseract or Rekognition) |
| `transcript_text` | `text null` | Full transcript (AWS Transcribe or Whisper) |
| `label_tags` | `text[]` | ML labels from Rekognition or Cloud Vision |
| `search_vector` | `tsvector null` | PostgreSQL full-text search vector |

`content_access_policy` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | Empty typically |
| `audit_log` | `jsonb[]` | Append-only |
| `name` | `text` | e.g., "Speaker Confidential - Minister of Energy Keynote" |
| `policy_type` | `enum[open, attendee_restricted, named_list, embargoed, do_not_distribute]` | Increasing strictness |
| `allowed_persona_roles` | `text[]` | Empty for named_list and do_not_distribute |
| `allowed_user_ids` | `uuid[]` | Concrete user IDs for named_list and do_not_distribute |
| `download_requires_watermark` | `bool` | True by default for attendee_restricted and stricter |
| `download_watermark_template` | `text null` | e.g., "Confidential - {viewer_name} - {timestamp}" |
| `effective_from` | `timestamptz` | When policy takes effect |
| `effective_to` | `timestamptz null` | null = open-ended |
| `review_window_ends_at` | `timestamptz null` | For the 24-hour post-session CSM and ED review window |

`content_download_log` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Downloading user |
| `updated_by` | `uuid` | System |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{watermarked_s3_key}` |
| `audit_log` | `jsonb[]` | Append-only |
| `asset_id` | `uuid` | FK -> content_asset.id |
| `downloaded_by` | `uuid` | Same as created_by; explicit for index |
| `downloaded_at` | `timestamptz` | UTC |
| `downloaded_ip` | `inet` | Source IP |
| `watermark_text` | `text null` | Applied watermark string |
| `purpose_code` | `enum[personal_review, operational_use, press, legal, audit, archive]` | Declared purpose |

### D. Business Logic & Edge Cases

- **IF** a new file is uploaded and `content_hash` matches an existing `content_asset.content_hash`, **THEN** the engine does NOT create a duplicate blob in S3; instead, it creates a new `content_asset` record referencing the same S3 key (storage deduplication) while keeping independent metadata records (name, owner, access policy, version chain). The two records are linked via `ext_refs.dedup_group_id` for forensic traceability.
- **IF** a `presentation` asset's `access_policy.policy_type = do_not_distribute`, **THEN** the engine enforces a strict access list: only users in `allowed_user_ids` (maximum 3 named individuals) can read; downloads require `watermark_required = true` with the viewer's identity and timestamp burned into every page (PDF watermarking via qpdf or PDFBox).
- **IF** an asset is under embargo (`is_embargoed = true` and `embargoed_until > now()`), **THEN** all read requests outside the `allowed_user_ids` list return 403 with a message "Asset under embargo until {embargoed_until}. Contact CSM for override." ED break-glass can lift the embargo early with two-person approval.
- **IF** a recording is created from a session where any speaker's `recording_consent = denied`, **THEN** the recording asset's `access_policy.policy_type = do_not_distribute` and `allowed_user_ids = [csm_user_id, ed_user_id]` only; the recording cannot be published to attendees.
- **IF** a recording is created from a session where all speakers' `recording_consent = granted`, **THEN** the recording's `access_policy` is `attendee_restricted` with `review_window_ends_at = session.ended_at + 24 hours`; before that window, only CSM and ED can read; after, attendees can read with watermark.
- **IF** a new version of an asset is uploaded, **THEN** the previous version's `is_current_version` flag is cleared atomically in the same transaction as the new version's `is_current_version = true` is set, ensuring exactly one current version per `version_chain_root_id` at all times.
- **IF** a user requests a download of a `watermark_required = true` asset, **THEN** the engine generates a watermarked copy on-the-fly (PDF: qpdf overlay; image: Pillow text burn-in; video: ffmpeg drawtext filter), stores it in a temporary S3 bucket with a 1-hour TTL, and returns a presigned URL; the `content_download_log` records the watermark text and the requesting user.
- **IF** a full-text search is performed, **THEN** the engine queries the PostgreSQL `search_vector` (built from `ocr_text`, `transcript_text`, `name`, and `label_tags`) with `ts_rank_cd` ordering; results are filtered through the user's access policy before returning.

**Edge case (non-obvious): a presentation marked "do not distribute" (e.g., embargoed financial announcement) is uploaded to the repository.** A minister is scheduled to announce a US$ 4 billion mining joint venture on Day 2 at 14:00. The investor relations deck is uploaded to the repository at 09:00 the day before. The CSM (or the speaker's authorized uploader) marks the asset with `access_policy.policy_type = do_not_distribute` and explicitly adds 3 named individuals (the speaker's chief of staff, the CSM, and the ED) to `allowed_user_ids`; `watermark_required = true`; `is_embargoed = true` with `embargoed_until = 2026-01-13T14:00:00Z` (the announcement time). The system enforces: any download request outside the named list returns 403; any download by a named user generates a watermarked copy with "Confidential - {user name} - {timestamp}" burned into every page footer, and the `content_download_log` captures the user, IP, timestamp, and purpose_code. At 14:00:00 the embargo lifts automatically; the asset's `access_policy` transitions to `attendee_restricted` (or `open` if the speaker consents); attendees can now read it via the mobile app. If a leak is suspected post-event (e.g., a slide appears on Twitter before 14:00), the `content_download_log` is the forensic source: every pre-14:00 download is enumerated with the downloader's identity, IP, watermark, and timestamp, providing an audit trail for the leak investigation.

**Edge case (non-obvious): two presentations share the same file name.** Two speakers from different delegations both upload `keynote_final.pdf`. The engine computes `content_hash` (SHA-256) for each: if the hashes are identical (the same file content), the engine stores one S3 blob and two `content_asset` records with independent metadata, linked via `ext_refs.dedup_group_id`. If the hashes differ (same name, different content), both are stored as separate blobs with their own `content_asset` records; the engine surfaces a "name conflict" advisory to the CSM in the upload confirmation, suggesting that the CSM rename one to disambiguate. In both cases, the speakers see only their own upload in their portal view; the deduplication is transparent to them. The CSM's repository view shows a "potential duplicate" indicator (icon) when two assets share a name, with a one-click action to view both side-by-side.

### E. Third-Party Integrations

- **AWS S3 (or compatible, e.g., Cloudflare R2 for egress-cost optimization):** Object storage for all asset blobs. Data flow: engine -> S3 (file upload); S3 -> engine (presigned URL for read); S3 -> AWS MediaConvert (input for transcoding).
- **AWS MediaConvert:** Video transcoding for recordings (e.g., 4K master to 1080p streaming, 720p mobile). Data flow: S3 source -> MediaConvert (job); MediaConvert -> S3 (outputs); MediaConvert -> engine (job completion webhook via EventBridge).
- **AWS Transcribe:** Automatic transcription of session recordings. Data flow: S3 audio -> Transcribe (job); Transcribe -> S3 (transcript JSON); engine -> content_asset.transcript_text (parsed).
- **OpenAI Whisper (self-hosted on a GPU instance or via OpenAI API):** Alternative transcription provider for higher accuracy on accented English and Arabic; used for ministerial sessions. Data flow: same as AWS Transcribe with a 5-minute timeout triggering fallback.
- **AWS Rekognition:** Image labeling for photographs (e.g., crowd density, brand detection). Data flow: S3 image -> Rekognition (DetectLabels); Rekognition -> engine (label list); engine -> content_asset.label_tags.
- **Google Cloud Vision:** Alternative image labeling, particularly for OCR on slides. Data flow: same as Rekognition.
- **Tesseract OCR (on-prem):** OCR on slide images for the `ocr_text` field. Data flow: image -> Tesseract; Tesseract -> engine (text).
- **Apache PDFBox / qpdf:** PDF watermarking for downloads. Data flow: engine -> qpdf (watermark overlay on original PDF); qpdf -> S3 (watermarked copy with 1-hour TTL).
- **ffmpeg:** Video watermarking (drawtext filter) for watermarked recording downloads. Data flow: engine -> ffmpeg (filter); ffmpeg -> S3.
- **Pillow (Python Imaging Library):** Image watermarking. Data flow: engine -> Pillow (text burn-in); Pillow -> S3.
- **Box (long-term archive tier):** Cold archive for assets older than 90 days post-event. Data flow: engine -> Box (file upload with 7-year retention policy); Box -> engine (metadata for audit retrieval).
- **AWS KMS:** Envelope encryption for `do_not_distribute` assets at rest. Data flow: KMS -> engine (DEK); engine -> S3 (encrypted blob with envelope).
- **PostgreSQL pg_trgm + tsvector:** Full-text search across `ocr_text`, `transcript_text`, `name`, and `label_tags`. Data flow: UI -> engine (search query); engine -> PostgreSQL (GIN index on `search_vector`).
- **OpenSearch:** Cross-event search (multiple FMF editions) with fuzzy matching and faceted navigation. Data flow: engine -> OpenSearch (index); OpenSearch -> engine (query results).
- **Kafka topics:** Publishes `content.asset.created`, `content.asset.version_added`, `content.asset.access_changed`, `content.asset.embargo_lifted`, `content.download.requested`. Subscribes to `speaker.presentation.uploaded` (Module 4.2), `stream.session.ended` (Module 4.3), `speaker.slide.advanced` (Module 4.2 for transcript sync).

### F. UI/UX Notes

The CSM's repository browser is a three-pane layout. Left pane: a faceted tree navigation by `asset_type`, `session_id`, `speaker_profile_id`, `event_day`, and `label_tags`. Center pane: a sortable list of assets with columns for name, type, version count, current version badge, access policy icon (green open, yellow attendee_restricted, orange embargoed, red do_not_distribute), size, and last-modified timestamp. Right pane: the selected asset's detail view, with: a preview pane (PDF page-flipper, video player, image viewer), the version history timeline (vertical, with uploader, timestamp, change summary, and "set as current" action), the access policy editor (drag-and-drop user picker, watermark toggle, embargo date picker), the OCR/transcript text view (collapsible), the label tags with manual-add capability, and the download log (most recent 20 entries with viewer name, IP, timestamp, watermark text, and purpose_code).

The search bar at the top of the center pane supports: free-text (queries `search_vector`), `speaker:John Smith` (metadata), `session:"Day 2 Plenary"` (metadata), `tag:mining` (label_tags), `type:recording` (asset_type). Results are filtered through the user's access policy before display; a "show all" toggle reveals count-only entries (no preview, no download) for assets the user cannot read.

The ED's War Room tile shows: total assets, storage consumed (with cost-to-date), count of active embargoes with their lift times, count of do_not_distribute assets, and the most-recent download activity feed (top 5).

The MC's specialized transcript search is a focused surface: full-text across all `transcript_text` fields filtered to sessions where matchmaking is in scope; clicking a result opens the transcript at the matching timestamp with the speaker identified.

### G. Failure Modes & Offline Behavior

- **S3 outage in primary region:** The engine has a cross-region replication policy to a secondary region (per the architecture overview, `me-central-1` and `eu-west-1`); reads fall back to the secondary region within 30 seconds. Uploads during the outage queue locally in the engine's PostgreSQL `pending_uploads` table and replay to S3 on recovery.
- **AWS MediaConvert queue backlog (peak post-event transcoding):** The engine prioritizes ministerial session recordings (highest priority), then plenary sessions, then breakouts. The CSM sees a "transcoding queue depth: N jobs, ETA: M hours" tile and can manually promote a job to high priority.
- **AWS Transcribe failure on a critical session:** The engine falls back to OpenAI Whisper; if both fail, the transcript is queued for manual transcription by a contracted transcription service within 24 hours, and the `content_asset.transcript_text` field is marked `pending_manual` with a red flag.
- **PostgreSQL search_vector index corruption (rare):** The engine detects query performance degradation (a query taking > 5 seconds triggers an alert) and automatically initiates a `REINDEX` on the affected partition; searches during reindex fall back to OpenSearch with a "fallback search" banner.
- **OpenSearch cluster unavailable:** Searches fall back to PostgreSQL `ILIKE` queries with degraded performance; the UI surfaces "Search degraded - using fallback mode."
- **Watermark generation failure (qpdf crash on a malformed PDF):** The engine refuses the download, alerts the CSM, and offers the user a "request manual watermark" workflow that queues the asset for CSM-manual processing within 4 business hours.
- **KMS key unavailable for `do_not_distribute` assets:** The engine refuses all reads of the encrypted blobs; the access policy remains visible but the asset content is inaccessible; an S0 incident is raised and the ED is paged.

### H. Acceptance Criteria

- **Given** two speakers uploading files with identical filenames but different content, **When** the engine computes `content_hash` and finds them different, **Then** both assets are stored as separate blobs with independent `content_asset` records, the CSM sees a "name conflict" advisory in the upload confirmation, and a one-click side-by-side comparison view is offered.
- **Given** a presentation marked `do_not_distribute` with 3 named individuals in `allowed_user_ids`, **When** a user outside the named list attempts to read, **Then** the engine returns 403 with the message "Asset access restricted. Contact CSM for override," and the attempt is logged in `audit_log` but no `content_download_log` entry is created.
- **Given** a session recording where one of three speakers has `recording_consent = denied`, **When** the recording asset is created, **Then** the asset's `access_policy.policy_type = do_not_distribute`, `allowed_user_ids = [csm_user_id, ed_user_id]`, the recording is not publishable to attendees, and a "consent conflict" flag is surfaced on the asset detail view.
- **Given** a do_not_distribute asset with `watermark_required = true`, **When** a named user downloads the asset, **Then** a watermarked copy with "Confidential - {user name} - {timestamp}" is generated via qpdf, stored in a 1-hour-TTL S3 bucket, a presigned URL is returned, and the `content_download_log` records the user, IP, timestamp, watermark text, and purpose_code.
- **Given** an embargoed asset with `embargoed_until = 2026-01-13T14:00:00Z`, **When** the system clock reaches 14:00:00Z, **Then** the asset's `is_embargoed` flag auto-clears, the `access_policy` transitions to the post-embargo policy (e.g., `attendee_restricted`), attendees can read via the mobile app, and an `content.asset.embargo_lifted` event is published on Kafka.
