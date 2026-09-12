> Module 4: Content & Stage Management System -> 4.2 Speaker & Presentation Management

## Speaker & Presentation Management

### A. Purpose Statement

The Speaker & Presentation Management subsystem handles the full lifecycle of every speaker at the Forum, from invitation through on-stage delivery and post-event archive. At FMF scale, this means onboarding 350+ speakers across 3 days, including 60+ ministerial speakers whose presentations carry diplomatic and market-moving weight. A ministerial financial announcement leaked 90 minutes early can move commodities markets and trigger regulatory inquiries; a Mac-to-HDMI compatibility failure during a Minister's keynote can become a viral protocol incident.

This subsystem exists so that speaker onboarding is consistent, presentation assets are version-controlled and quality-checked, consent is explicitly captured for recording and derivative works, and the live presentation confidence monitor can recover from any speaker-laptop failure within 30 seconds. It is distinct from the Stage Run-Sheet Engine (4.1), which orchestrates operator cues, and from the Content Repository (4.4), which is the long-term asset store. This subsystem is the operational workflow surface between those two: getting the right presentation, on the right screen, at the right time, with the speaker confident and the operator prepared.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all speaker profiles and presentation assets. Write only via break-glass to unlock a live-locked presentation, with two-person approval (ED + CSM). Sees a "Speaker Readiness" tile in the War Room showing onboarding completion % per session.
- **Operations Lead (OL):** Read-only on speaker profiles and presentation metadata. Cannot edit assets or consent records.
- **Protocol Officer (PO):** Read-only on speaker profiles for dignitary speakers (rank 1-3); used to validate stage precedence. Cannot modify presentations.
- **VIP Liaison (VL):** Read-only on their assigned dignitary's speaker profile, including rehearsal schedule and confidence monitor setup notes. Cannot modify.
- **Registration Manager (RM):** Read-only on the speaker_profile.attendee_id link for badge entitlement synchronization (speakers get a Speaker badge class). Cannot edit presentations.
- **Sponsorship Sales Lead (SSL):** Read-only on the speaker list for sponsor keynote slot verification. No access to presentation files.
- **Exhibitor Portal User (EPU):** No access.
- **Content & Stage Manager (CSM):** Primary owner. Read/write on speaker profiles, presentation versions, consent records, rehearsal logs, QC results, and the live-lock override queue. Can approve post-lock uploads with reason.
- **Matchmaking Concierge (MC):** No direct access. Receives `speaker.session_started` events to suppress conflicting meeting requests during a speaker's session.
- **Finance & Administration Lead (FAL):** No access.
- **Marketing & PR Lead (MPL):** Read-only on speaker bio, headshot, and presentation title for press kit assembly. No access to slide content or consent records.
- **ESG & Sustainability Officer (ESGO):** No access.
- **Field Volunteer (FV):** Read-only on "speaker green room ready in N minutes" tile in the Staff App for usher coordination.
- **Attendee (ATT):** For ATT who is a speaker, read/write on their own profile, presentation upload, and consent forms; read-only on their own rehearsal schedule. No access to other speakers.

### C. Data Model

`speaker_profile` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{cvent_speaker_id, zoom_panelist_id, onedrive_folder_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `attendee_id` | `uuid` | FK -> registration.id |
| `full_name` | `text` | Display name |
| `title` | `text` | e.g., "Minister of Energy of Saudi Arabia" |
| `bio` | `text` | For press kit and emcee introduction |
| `headshot_asset_id` | `uuid` | FK -> content_asset.id (Module 4.4) |
| `session_ids` | `uuid[]` | FK -> session.id; a speaker may speak in multiple sessions |
| `onboarding_status` | `enum[invited, profile_complete, presentation_uploaded, consent_signed, qc_passed, rehearsal_done, ready]` | Lifecycle |
| `is_remote` | `bool` | True if joining via Zoom Webinars |
| `dignitary_profile_id` | `uuid null` | FK -> dignitary_profile.id if rank 1-5 |
| `preferred_clicker` | `enum[logitech_usb, presenter_view_touch, manual_advance]` | Hardware preference |
| `venue_laptop_test_status` | `enum[pending, passed, failed, fallback_to_venue_pdf]` | Per the venue hardware test |
| `language_pref` | `text[]` | ISO 639-1, ordered |
| `accessibility_needs` | `jsonb` | e.g., `{captioner: true, slide_contrast: "high"}` |
| `consent_record_id` | `uuid` | FK -> speaker_consent.id |

`presentation` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (speaker or CSM) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{onedrive_file_id, box_archive_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `speaker_profile_id` | `uuid` | FK -> speaker_profile.id |
| `session_id` | `uuid` | FK -> session.id |
| `title` | `text` | Slide-deck title |
| `source_format` | `enum[pdf, pptx]` | Original upload format |
| `source_asset_id` | `uuid` | FK -> content_asset.id (original) |
| `normalized_pdf_asset_id` | `uuid` | FK -> content_asset.id (PDF normalized for projection) |
| `thumbnail_asset_ids` | `uuid[]` | FK -> content_asset.id (one per slide) |
| `slide_count` | `int` | Total slides in normalized PDF |
| `aspect_ratio` | `enum[16_9, 4_3, other]` | 16_9 mandatory; 4_3 and other rejected |
| `version_number` | `int` | 1-based; increments per upload |
| `is_live_version` | `bool` | Only one version per (speaker, session) can be true |
| `locked_at` | `timestamptz null` | When this version became the live-locked version |
| `lock_window_minutes` | `int` | Default 60; configurable per event |
| `qc_status` | `enum[pending, passed, failed, waiver]` | Virus scan, format validation, font embedding |
| `qc_details` | `jsonb` | e.g., `{virus_scan: "clean", fonts_embedded: true, font_list: [...]}` |
| `slide_advance_log_id` | `uuid null` | FK -> slide_advance_log.id (active during session) |

`speaker_consent` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Speaker or CSM |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{docusign_envelope_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `speaker_profile_id` | `uuid` | FK -> speaker_profile.id |
| `recording_consent` | `enum[granted, denied, partial]` | partial = audio only, no video |
| `photography_consent` | `enum[granted, denied, editorial_only]` | editorial_only = no commercial use |
| `derivative_works_consent` | `enum[granted, denied, attribution_required]` | Whether slides can be redistributed post-event |
| `embargoed_until` | `timestamptz null` | If set, presentation not distributable until this time |
| `signed_at` | `timestamptz null` | When the consent form was e-signed |
| `signed_ip` | `inet null` | Source IP for forensic audit |

`slide_advance_log` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{clicker_serial}` |
| `audit_log` | `jsonb[]` | Append-only |
| `presentation_id` | `uuid` | FK -> presentation.id |
| `session_id` | `uuid` | FK -> session.id |
| `advance_events` | `jsonb[]` | Array of `{slide: int, advanced_at: timestamptz, source: enum[clicker, touch, manual]}` |
| `started_at` | `timestamptz` | First slide on screen |
| `ended_at` | `timestamptz null` | Last slide cleared |

### D. Business Logic & Edge Cases

- **IF** a speaker uploads a file with `aspect_ratio = 4_3` or `other`, **THEN** the upload is rejected with guidance: "Presentation must be 16:9. Your file is 4:3. Please re-export in 16:9 or use the provided template," and a link to the speaker template pack in OneDrive.
- **IF** a speaker uploads a new version, **THEN** the previous version's `is_live_version` flag is cleared only after the new version passes QC; the previous version remains the live version until QC passes to prevent a broken file from going on stage.
- **IF** the speaker's session starts within `lock_window_minutes` (default 60), **THEN** the upload is held in a "post-lock upload queue" requiring CSM approval with a `reason_code` (e.g., "ministerial editorial change", "fact correction") before re-queuing for QC.
- **IF** the CSM approves a post-lock upload, **THEN** the new version is re-queued for QC (virus scan, format validation, font embedding check); on QC pass the new version becomes the live version; on QC fail the previous version remains live and the speaker is notified.
- **IF** `venue_laptop_test_status = failed`, **THEN** the engine arms the fallback plan: the normalized PDF runs on the venue laptop, the speaker's clicker is paired with the venue laptop, and a CSM-operated confidence monitor shows the speaker the same view. The speaker is notified: "Your laptop is not compatible with the venue system. We will run your PDF on the venue laptop with your clicker."
- **IF** a slide advance event occurs (clicker or touch), **THEN** the event is appended to `slide_advance_log.advance_events` within 200 milliseconds and published on the `speaker.slide.advanced` Kafka topic for downstream caption sync (Module 4.3).
- **IF** a speaker's session is in progress and the slide-advance log's last event is older than 90 seconds, **THEN** the Stage Manager's confidence monitor shows a gentle pulse on the current slide to indicate "speaker may be stuck"; this is informational only and does not interrupt.
- **IF** consent for `recording_consent = denied` is captured, **THEN** the live stream module (4.3) is notified and the speaker's session is excluded from the on-demand recording (with a "Recording consent: denied" badge visible to the broadcast director).

**Edge case (non-obvious): speaker uploads a new version 30 minutes before the session, after the lock.** A minister's chief of staff emails a corrected slide 27 minutes before stage time with a critical factual update. The speaker uploads via the portal; the engine detects that `now() > session.start_at - lock_window_minutes` and routes the upload to the post-lock queue. The CSM receives a push notification and sees the upload in a "Post-Lock Upload Review" tile with the speaker's name, the version delta (a slide-by-slide diff against the previous version auto-generated by comparing normalized PDFs), and the speaker's entered reason. The CSM taps "Approve with reason" and selects from a controlled vocabulary (ministerial_editorial, fact_correction, regulatory_update, other_with_text). The new version re-queues for QC, which on a fast-track lane completes in 35 seconds (virus scan via ClamAV, format validation via Apache PDFBox, font embedding via pdf-parser). If QC passes, the new version becomes live; the Stage Manager's confidence monitor and the projection system both auto-reload the new PDF; a `speaker.presentation.replaced` event is published with both version IDs for the audit trail. If QC fails, the previous version remains live and the speaker is notified within 60 seconds with the failure reason.

**Edge case (non-obvious): speaker's Mac laptop doesn't display on the venue's HDMI system.** During rehearsal, the speaker's MacBook Pro with USB-C output is connected to the venue's HDMI matrix via a USB-C to HDMI adapter. The image flickers and drops every 5 seconds. The rehearsal log captures `venue_laptop_test_status = failed` for this speaker with detail `{issue: "mac_hdmi_flicker", adapter_brand: "Anker A8382", firmware_version: "1.2"}`. The engine immediately arms the fallback plan: the speaker's PDF is preloaded onto the venue's primary laptop (a Dell Latitude with known-good HDMI output); the speaker's Logitech USB clicker is paired with the venue laptop (the clicker uses a 2.4 GHz USB dongle, no driver install required, so pairing completes within 4 seconds); the speaker is briefed: "We will run your slides on our venue laptop. Your clicker will work the same way." On stage day, the speaker's Mac is not connected to the projection system at all; the speaker stands at the lectern with the clicker and sees the confidence monitor. If the speaker insists on using their own Mac, a CSM can override the fallback with a break-glass approval that records the speaker's written acknowledgment of the risk.

### E. Third-Party Integrations

- **Zoom Webinars API:** Used for remote speakers (panelists). Data flow: speaker_profile -> Zoom (panelist invitation via REST); Zoom -> engine (panelist join webhook, recording completion webhook). The remote speaker's slides are screen-shared through Zoom, captured via the OBS Zoom source, and routed to the program bus by Module 4.3.
- **Microsoft OneDrive for Business:** File exchange for speaker presentations during onboarding. Data flow: speaker -> OneDrive folder (shared with CSM); OneDrive webhook -> engine (file created/modified); engine -> OneDrive (download for normalization).
- **Box:** Long-term archive of speaker presentations post-event (7 years for FMF-class). Data flow: engine -> Box (file upload via Box SDK with retention policy applied); Box -> engine (file metadata for audit retrieval).
- **DocuSign:** E-signature capture for `speaker_consent`. Data flow: engine -> DocuSign (envelope creation with template); DocuSign -> engine (signed webhook).
- **ClamAV (on-prem cluster):** Virus scan of all uploaded presentations. Data flow: engine -> ClamAV (file scan via REST); ClamAV -> engine (clean/infected result).
- **Apache PDFBox / LibreOffice headless:** PPTX-to-PDF normalization and slide thumbnail generation. Data flow: engine -> LibreOffice (file conversion); engine -> PDFBox (slide extraction for thumbnails).
- **Logitech Presentation software (via HID):** Clicker events captured via USB HID. Data flow: clicker -> HID driver on venue laptop -> engine (slide_advance event via WebSocket).
- **AWS KMS:** Column-level encryption for consent signatures and signed_ip fields.
- **Kafka topics:** Publishes `speaker.onboarding.changed`, `speaker.presentation.uploaded`, `speaker.presentation.qc_passed`, `speaker.presentation.replaced`, `speaker.consent.signed`, `speaker.session_started`, `speaker.slide.advanced`. Subscribes to `session.scheduled` (from Module 4 scheduling), `registration.attendee.upserted` (from Module 6).

### F. UI/UX Notes

The speaker-facing portal is a single-page wizard with five steps displayed as a progress bar: Profile (name, title, bio, headshot) -> Presentation (upload, format check) -> Consent (three toggles with plain-language descriptions) -> Rehearsal (book a slot) -> Ready (confirmation). Each step's completion updates the onboarding_status; the Ready step shows a green check and the session start time in the speaker's local timezone.

The CSM's primary screen is a Kanban board: columns are onboarding_status states, cards are speakers. Clicking a card opens a detail drawer with the full profile, the version history (a vertical timeline with upload timestamp, uploader, QC status, and a "diff" link showing slide-by-slide changes), the consent record (read-only with re-sign button), and the rehearsal log. A red flag on a card means blocked; a yellow flag means pending CSM action (e.g., post-lock upload awaiting approval, QC fail).

The Stage Manager's confidence-monitor control is a separate full-screen surface intended to be displayed on a 24-inch monitor at stage-side. It shows the current slide large, the next slide thumbnail in the corner, the elapsed time, the slide count, and the clicker battery level. A subtle pulse on the slide if no advance for 90 seconds.

The "Speaker Readiness" War Room tile shows: total speakers, count by onboarding_status, count of post-lock uploads awaiting CSM action, and count of venue_laptop_test failures with fallback plans armed.

### G. Failure Modes & Offline Behavior

- **OneDrive sync failure during upload:** The speaker's browser uploads directly to the engine via multipart upload; the engine writes to S3 and asynchronously syncs to OneDrive. If OneDrive sync fails, the engine retries 3 times then logs a warning visible only to the CSM; the speaker's upload is NOT blocked because the canonical copy is in S3.
- **ClamAV cluster overload during peak upload window (typical 2 hours pre-session):** The engine queues scans; the speaker sees "QC in progress" with an estimated wait time. If the queue exceeds 10 minutes, the CSM can issue a "manual QC override" with a captured justification, allowing the upload to proceed with `qc_status = waiver` and an audit flag.
- **Venue laptop failure during session (rare but critical):** The fallback of the fallback: a second venue laptop is hot-standing with the same PDF preloaded; the CSM taps "Switch to backup laptop" on the confidence monitor control, the HDMI matrix switches input within 1.5 seconds, and the clicker is re-paired to the backup laptop within 4 seconds. The speaker sees a 5-second blank screen at most.
- **DocuSign outage:** Consent can be captured via a locally-rendered PDF form with a typed signature (legal in most jurisdictions per eIDAS and ESIGN); the engine records the typed signature, the source IP, and the timestamp, and queues a DocuSign re-sign for retroactive compliance within 48 hours.
- **Clicker battery dies mid-session:** The Stage Manager's confidence monitor shows "Clicker battery low" warning at 20% battery (the Logitech R500 reports battery via HID). At 5% the CSM is alerted to swap the clicker (a backup is always staged at the lectern). If the clicker dies mid-advance, the Stage Manager can advance slides via a manual control on the confidence monitor UI.
- **Speaker portal offline:** The speaker portal is a static Next.js app cached on Cloudflare; if the origin is unreachable, the portal shows "Offline mode: your changes will sync when connectivity returns." LocalStorage holds in-progress profile edits and queued uploads.

### H. Acceptance Criteria

- **Given** a speaker uploading a 4:3 PPTX file, **When** the upload completes, **Then** the file is rejected with the message "Presentation must be 16:9. Your file is 4:3. Please re-export in 16:9 or use the provided template," and a link to the template pack is displayed.
- **Given** a speaker whose session starts in 27 minutes (within the 60-minute lock window), **When** they upload a new version, **Then** the upload enters the post-lock queue, the CSM receives a push notification within 30 seconds, and the previous version remains live until the CSM approves and QC passes.
- **Given** a speaker's rehearsal reveals a Mac-to-HDMI flicker, **When** the rehearsal log captures `venue_laptop_test_status = failed`, **Then** the engine arms the fallback plan (venue laptop with preloaded PDF, clicker pairing), the speaker is notified with a plain-language explanation, and the CSM sees the speaker flagged on the Kanban board with a "fallback armed" badge.
- **Given** a live session with the speaker advancing slides via Logitech clicker, **When** each click occurs, **Then** a `slide_advance_log.advance_events` entry is appended within 200 milliseconds and a `speaker.slide.advanced` event is published on Kafka for downstream caption sync.
- **Given** a speaker whose `recording_consent = denied` and the live stream module is initialized for their session, **When** the session starts, **Then** the live stream module excludes the session from on-demand recording, the broadcast director sees a "Recording consent: denied" badge, and the post-event archive does not include this session's video.
