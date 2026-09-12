> Module 10: Marketing, PR & Media Center -> 10.4 Social Listening & Analytics

## Social Listening & Analytics

### A. Purpose Statement

The Social Listening & Analytics subsystem is the platform's perceptual cortex for public discourse around the Future Minerals Forum. At FMF scale, the event generates 250,000+ social posts across X, LinkedIn, Instagram, TikTok, and YouTube over the 5-day window (T-1 through post-event), plus 8,000+ news articles from 600+ outlets via Google News API and Meltwater, and 4,000+ forum threads on Reddit and industry communities. A misrepresentation of a ministerial quote, a viral TikTok taken out of context, or a coordinated disinformation campaign against a sovereign delegation can each escalate into a diplomatic or commercial crisis within 30 minutes of first publication. This subsystem exists so that every public mention is ingested, sentiment-scored, influencer-attributed, and crisis-flagged in near real time, with a human-in-the-loop override path for nuanced diplomatic language that automated NLP consistently mis-classifies.

The subsystem is the write-side owner of the `social.*` Kafka topic prefix per the Module 0.1 bounded context table. It publishes `social.post.ingested`, `social.post.sentiment_scored`, `social.influencer.identified`, `social.crisis.detected`, `social.crisis.acknowledged`, `social.crisis.resolved`, `social.share_of_voice.computed`, `social.sentiment.overridden`, `social.violation.detected`, and `social.trend.surfaced`. It subscribes to `press.release.distributed` and `press.embargo.lifted` (Module 10.3) to baseline expected mention volume and detect anomalies against the post-distribution lift, to `session.session_started` and `speaker.session_started` (Module 4.2) to correlate social spikes with on-stage moments, to `accreditation.embargo.violated` (Module 10.2) for cross-validation of detected premature publications, and to `campaign.conversion.attributed` (Module 10.1) for share-of-voice and campaign ROI correlation. Its non-negotiable contracts are: (1) every ingested post is sentiment-scored within 90 seconds of ingestion, (2) any post matching the crisis detection criteria (high reach + negative sentiment + keyword match against the dignitary quote database OR a 4x volume spike in any 15-minute window) triggers an alert to MPL and ED within 5 minutes, and (3) every sentiment classification on a post mentioning a dignitary is eligible for human review and override, with the override logged for model retraining.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all listening data, dashboards, and crisis alerts. Write only via break-glass on crisis acknowledgment override (e.g., to silence a known false-positive alert during a sensitive moment) with co-sign by MPL.
- **Operations Lead (OL):** Read on crisis alerts that intersect with operational risk (e.g., a viral post about a venue safety issue). No write on sentiment data.
- **Protocol Officer (PO):** Read-only on social posts that mention specific dignitaries (filtered by a dignitary-name watchlist maintained by the PO). Write on the dignitary-name watchlist configuration.
- **VIP Liaison (VL):** No direct access. Receives delegated alerts via the Shadow App if a post mentions their assigned dignitary.
- **Registration Manager (RM):** No direct access.
- **Sponsorship Sales Lead (SSL):** Read-only on social listening data filtered to mentions of their sponsor portfolio. No write.
- **Exhibitor Portal User (EPU):** No direct access. Sponsor mentions are surfaced via SSL.
- **Content & Stage Manager (CSM):** Read on social listening data filtered to mentions of speakers and sessions they manage. No write on sentiment.
- **Matchmaking Concierge (MC):** No direct access.
- **Finance & Administration Lead (FAL):** No direct access.
- **Marketing & PR Lead (MPL):** Primary owner. Read/write on all listening data, sentiment overrides, influencer lists, crisis acknowledgment, and alert configuration. Cannot silence a crisis alert without ED co-sign.
- **ESG & Sustainability Officer (ESGO):** Read-only on social listening data filtered to mentions of ESG themes (carbon, sustainability, supply chain ethics). No write.
- **Field Volunteer (FV):** No direct access.
- **Attendee (ATT):** No direct access to the listening dashboard; their own social posts (if they tag the event) are ingested like any other public post.

### C. Data Model

`social_post` (ingested public mention; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Ingestion service account |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{x_tweet_id, linkedin_urn, instagram_media_id, tiktok_video_id, youtube_comment_id, reddit_post_id, meltwater_news_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `source` | `enum[x, linkedin, instagram, tiktok, youtube, google_news, meltwater_news, reddit, forum_other]` | |
| `author_handle` | `text` | E.g., "@MiningWeekly", "Reuters" |
| `author_display_name` | `text` | |
| `author_follower_count` | `int` | At time of post |
| `author_is_verified` | `boolean` | Platform-verified |
| `author_influencer_tier` | `enum[nano, micro, mid, macro, mega] null` | Computed per `social_influencer` table |
| `post_url` | `text` | Canonical URL |
| `post_text` | `text` | Truncated to platform limit; full text in S3 if exceeds |
| `post_language_code` | `char(2)` | ISO 639-1; auto-detected |
| `post_published_at` | `timestamptz` | Original publish time per platform |
| `ingested_at` | `timestamptz` | When the system ingested |
| `reach_estimate` | `int` | Estimated impressions (from platform API or modeled) |
| `engagement_count` | `int` | Likes + comments + shares |
| `mentions_dignitary_ids` | `uuid[] null` | FK -> dignitary.id (Module 2.1) if matching watchlist |
| `mentions_speaker_ids` | `uuid[] null` | FK -> speaker.id (Module 4.2) |
| `mentions_sponsor_deal_ids` | `uuid[] null` | FK -> sponsor_deal.id (Module 5.1) |
| `mentions_session_ids` | `uuid[] null` | FK -> session.id (Module 4.1) |
| `mentions_campaign_ids` | `uuid[] null` | FK -> campaign.id (Module 10.1) if tracking link |
| `asset_url` | `text null` | Image or video URL |
| `is_embargo_violation_suspect` | `boolean` | True if post text matches embargoed content hash before lift |

`social_sentiment_score` (NLP-driven sentiment per post; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | NLP service account |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{openai_completion_id, anthropic_message_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `social_post_id` | `uuid` | FK -> social_post.id |
| `sentiment_label` | `enum[positive, neutral, negative]` | Auto-classification |
| `sentiment_score` | `numeric(4,3)` | Confidence 0.000 to 1.000 |
| `model_provider` | `enum[openai_gpt4, anthropic_claude, internal_roberta, manual_override]` | |
| `model_version` | `text` | E.g., "gpt-4-0613", "claude-3-opus-20240229" |
| `topics` | `text[]` | E.g., ["lithium", "saudi_arabia", "investment"] |
| `entities` | `jsonb` | Named entities extracted (ORG, PERSON, GPE, MONEY) |
| `is_diplomatic_language` | `boolean` | True if post mentions dignitary names or protocol terms |
| `override_label` | `enum[null, positive, neutral, negative]` | Human override |
| `overridden_by` | `uuid null` | MPL or delegated reviewer |
| `overridden_at` | `timestamptz null` | |
| `override_reason` | `text null` | Free-text justification |

`social_influencer` (high-reach account tracking; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Influencer identification job |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{brandwatch_author_id, sprout_social_profile_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `author_handle` | `text` | Stable platform handle |
| `source` | `enum[x, linkedin, instagram, tiktok, youtube, reddit]` | |
| `tier` | `enum[nano, micro, mid, macro, mega]` | Computed: nano <1K, micro 1K-10K, mid 10K-100K, macro 100K-1M, mega >1M |
| `total_reach_estimate` | `int` | Sum of reach across all posts mentioning the event |
| `total_engagement_count` | `int` | Sum of engagement |
| `post_count` | `int` | Number of posts |
| `avg_sentiment_label` | `enum[positive, neutral, negative]` | From `social_sentiment_score` aggregation |
| `is_friendly` | `boolean null` | MPL-tagged: friendly / hostile / neutral |
| `first_mention_at` | `timestamptz` | Earliest post |
| `last_mention_at` | `timestamptz` | Latest post |

`social_crisis_alert` (crisis detection events; extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Crisis detection service |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{slack_channel_id, pagerduty_incident_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `alert_type` | `enum[negative_sentiment_spike, volume_spike, dignitary_misrepresentation, embargo_violation, competitor_share_of_voice, viral_negative_post, coordinated_disinformation]` | |
| `severity` | `enum[s0, s1, s2, s3]` | Reuses Module 1.2 scale |
| `trigger_post_ids` | `uuid[]` | FK -> social_post.id |
| `trigger_window_start_at` | `timestamptz` | Rolling window start |
| `trigger_window_end_at` | `timestamptz` | Window end |
| `volume_in_window` | `int` | Posts in window |
| `baseline_volume` | `int` | Expected volume from prior 7-day rolling average |
| `volume_ratio` | `numeric(5,2)` | e.g., 4.50 for 4.5x baseline |
| `avg_sentiment_score_in_window` | `numeric(4,3)` | |
| `dignitary_id` | `uuid null` | If alert is dignitary-related |
| `acknowledged_by` | `uuid null` | MPL or ED |
| `acknowledged_at` | `timestamptz null` | |
| `resolution_action` | `enum[null, clarification_issued, ignored_as_false_positive, escalated_to_protocol, escalated_to_security, monitored]` | |
| `resolved_at` | `timestamptz null` | |
| `linked_clarification_release_id` | `uuid null` | FK -> press_release.id (Module 10.3) if clarification_issued |

### D. Business Logic & Edge Cases

- **IF** a new `social_post` is ingested from any source, **THEN** the engine publishes `social.post.ingested` and within 90 seconds invokes the NLP sentiment service (default OpenAI GPT-4 for English and major languages; Anthropic Claude for nuanced diplomatic language) to create a `social_sentiment_score` with `sentiment_label`, `sentiment_score`, `topics`, and `entities`.
- **IF** a `social_post` matches a dignitary-name watchlist (maintained by the PO) OR mentions protocol terms ("His Excellency", "Her Royal Highness", ministerial titles), **THEN** the engine sets `social_sentiment_score.is_diplomatic_language = true` and the post is routed to a "Diplomatic Review" queue for human review even if the automated sentiment is neutral.
- **IF** the rolling 15-minute window post volume for any topic or hashtag exceeds 4x the 7-day rolling baseline (`volume_ratio >= 4.00`), **THEN** the engine creates a `social_crisis_alert` with `alert_type = volume_spike`, `severity = s1` (or `s2` if `volume_ratio >= 8.00`), publishes `social.crisis.detected`, and pages the MPL via the Module 7.3 push notification center and a Slack message to `#fmf-pr-war-room`.
- **IF** a `social_post` mentions a dignitary AND has `sentiment_label = negative` AND `reach_estimate >= 100_000`, **THEN** the engine creates a `social_crisis_alert` with `alert_type = dignitary_misrepresentation` (if quote-matching suggests misrepresentation) or `viral_negative_post`, `severity = s1`, and pages both MPL and ED.
- **IF** an `accreditation.embargo.violated` event is received from Module 10.2, **THEN** the engine cross-validates by searching for `social_post` records matching the embargoed content hash (via a normalized text similarity search), and if a match is found, sets `social_post.is_embargo_violation_suspect = true`, publishes `social.violation.detected`, and links the post to the `social_crisis_alert`.
- **IF** the MPL or a delegated reviewer overrides a `social_sentiment_score.sentiment_label`, **THEN** the engine sets `override_label`, `overridden_by`, `overridden_at`, and `override_reason`, and publishes `social.sentiment.overridden` with the prior and new labels. The override is fed back to the NLP model fine-tuning pipeline weekly.
- **IF** a `social_post` ingested from a competitor event (e.g., a concurrent mining forum) exceeds the FMF post volume in a 1-hour window, **THEN** the engine surfaces a `social_crisis_alert` with `alert_type = competitor_share_of_voice` and `severity = s2`, and computes a share-of-voice ratio for the MPL dashboard.

**Edge case (non-obvious): viral post misrepresents a minister's quote.** At 14:20 on Day 2 of FMF, the Minister of Mines of Country X delivers a plenary speech in which she says: "We are committed to responsible mineral supply chains, and we welcome investment partnerships that align with our ESG principles and our national priorities." At 14:35, a viral post on X by a mid-tier influencer (60,000 followers, semi-anonymous account) quotes the Minister out of context as: "We welcome investment partnerships, full stop. ESG is optional." The post includes a 15-second clip of the speech that has been edited to cut off the second half of the sentence. The post receives 1,800 retweets and 4,200 likes in the first 45 minutes. The Social Listening engine ingests the post via the X Firehose (or the X API v2 filtered stream on the event hashtag and dignitary names) at 14:36. Within 90 seconds (14:37:30), the NLP service has sentiment-scored the post as `negative` (because the comments are critical of the perceived walk-back on ESG), with `topics = ["ESG", "Country X", "mining investment"]` and `entities = {PERSON: "Minister of Mines Country X", GPE: "Country X"}`. The engine matches `mentions_dignitary_ids = [<Minister's dignitary_id>]` (from the PO's watchlist) and `is_diplomatic_language = true`. The post's `reach_estimate = 240_000` (modeled from retweet velocity and follower count) and `engagement_count = 6,000`. The crisis detection engine evaluates: `mentions_dignitary_id` (yes) AND `sentiment_label = negative` (yes) AND `reach_estimate >= 100_000` (yes) - all three criteria met. The engine also runs the post text against a quote-matching service (a vector-embedding-based search against the official speech transcript stored in Module 4.2/4.3) and finds a 0.62 similarity (below the 0.85 threshold for "exact match"), with a 0.71 similarity to a partial quote (above the 0.65 threshold for "misrepresentation suspect"). The engine creates a `social_crisis_alert` with `alert_type = dignitary_misrepresentation`, `severity = s1`, `trigger_post_ids = [<post_id>]`, `dignitary_id = <Minister's id>`, and `volume_ratio = 12.5` (the post is generating 12.5x the baseline volume for that Minister's name). At 14:38, the engine publishes `social.crisis.detected`, sends a Slack message to `#fmf-pr-war-room` with the alert details and a deep-link to the post, and pushes a high-priority notification to the MPL's Module 7.3 push notification center (with a Twilio SMS fallback). The MPL opens the alert, sees the post, the quote comparison (the Minister's full sentence alongside the post's edited excerpt), the engagement metrics, and the influencer profile. The MPL reviews the post at 14:42 and determines it is a misrepresentation requiring clarification. The MPL taps "Trigger Clarification Release" which opens the Module 10.3 Press & Content Distribution workflow pre-filled with a clarification template: "Minister X's full quote at FMF Day 2 Plenary: 'We are committed to responsible mineral supply chains, and we welcome investment partnerships that align with our ESG principles and our national priorities.' Recent social media posts have selectively quoted this statement." The MPL reviews, edits if needed, and routes to the ED for expedited approval (15-minute SLA per Module 10.3). The ED approves at 14:51, and the clarification release distributes at 14:52 via the configured channels (BusinessWire, accredited media email, website Press Room, Hootsuite social). The crisis alert is set to `resolution_action = clarification_issued` and `linked_clarification_release_id = <release_id>`. The engine continues to monitor the original post's engagement for 24 hours; if engagement continues to grow, the alert re-escalates. The misrepresentation evidence (post URL, original speech transcript, similarity scores, MPL review notes, ED approval, clarification release ID) is recorded in `audit_log` and is available for the post-event review.

**Edge case (non-obvious): competitor event generates more social buzz.** During FMF Day 2 (a Tuesday), a competing mining investment forum - the "Indo-Pacific Mining Summit" (IPMS) - is running concurrently in Singapore. The IPMS has paid social campaigns and a strong influencer program. The Social Listening engine tracks both `#FMF2026` and `#IPMS2026` hashtags (and their variants) on X, LinkedIn, and Instagram. At 11:00 on Day 2, the engine's hourly share-of-voice computation reports: FMF posts in the past hour = 1,200 (down from 1,800 at the same hour on Day 1, a 33% drop), IPMS posts = 1,600 (up from 900 the prior hour, a 78% spike driven by a keynote at IPMS at 10:30). The share-of-voice ratio for FMF drops from 0.66 (66% of combined mentions) to 0.43 (43%). The engine creates a `social_crisis_alert` with `alert_type = competitor_share_of_voice`, `severity = s2` (medium-severity, not a diplomatic crisis but a marketing concern), `trigger_window_start_at = 10:00`, `trigger_window_end_at = 11:00`, `volume_in_window = 1_200` (FMF), `baseline_volume = 1_800` (prior day same hour), `volume_ratio = 0.67` (FMF's own ratio, showing the drop). The alert is published and sent to the MPL's dashboard with comparative metrics: hashtag performance (FMF's `#FMF2026` has 4.2M impressions in 24h vs IPMS's `#IPMS2026` at 5.8M impressions), top 5 influencers on each side, sentiment comparison (FMF sentiment is 0.62 positive vs IPMS's 0.58 positive), and a "share of voice" trend chart over the past 24 hours. The MPL reviews at 11:10 and assesses three options: (1) amplify organic content - the engine suggests the top 3 FMF posts by engagement from the past 2 hours for MPL to retweet/share; (2) boost a paid social campaign - the engine suggests the most-engaged speaker clip from Day 1 as a boost candidate (links to Module 10.1 Campaign Orchestration); (3) coordinate with the CSM to schedule an unannounced ministerial photo op to generate fresh content. The MPL chooses (1) and (3): amplifies 2 organic posts via the official FMF channels and asks the CSM to schedule the host country's Minister of Investment for a 10-minute press availability at 12:30 in the Mixed Zone. The crisis alert is set to `resolution_action = monitored` and `resolved_at = 12:30` (when the press availability begins and is expected to generate new FMF-focused content). The comparative metrics remain on the MPL dashboard for the rest of the event, with the share-of-voice recomputed every hour.

### E. Third-Party Integrations

- **Brandwatch or Sprout Social or Sprinklr (enterprise social listening):** Primary listening platform for X, LinkedIn, Instagram, YouTube, Reddit, and forum crawling. Data flow: Brandwatch/Sprout/Sprinklr -> webhook or scheduled API pull -> Integration Hub -> `social_post` records with `source`, `author_handle`, `post_text`, `reach_estimate`, `engagement_count`. The vendor's own sentiment scoring is captured as a secondary signal alongside the in-house NLP classification.
- **Meltwater or Cision (media monitoring):** News article ingestion across 600+ outlets. Data flow: Meltwater/Cision API -> Integration Hub -> `social_post` with `source = meltwater_news` or `google_news`. Includes outlet authority score and journalist attribution.
- **Google News API (search volume and news mentions):** Real-time news search for the event name, speaker names, and deal keywords. Data flow: Google News API -> Integration Hub -> `social_post` records with `source = google_news`.
- **Google Trends (search volume baseline):** Hourly search volume for the event name and key topics. Data flow: Google Trends -> Integration Hub -> `social_share_of_voice` projection (consumed by the analytics warehouse, not stored as `social_post`).
- **X API v2 filtered stream (real-time X ingestion):** Real-time stream of public X posts matching the event hashtag, dignitary names, and keyword watchlists. Data flow: X Firehose (or filtered stream) -> Integration Hub -> `social_post` records within 30 seconds of publication.
- **LinkedIn Engagement API (post ingestion for company page and hashtags):** Limited to the FMF company page and tracked hashtags. Data flow: LinkedIn -> Integration Hub -> `social_post` records.
- **Meta Graph API (Instagram and Facebook post ingestion):** Public posts on the FMF Instagram and Facebook pages, plus tracked hashtags. Data flow: Meta -> Integration Hub -> `social_post` records.
- **OpenAI GPT-4 or Anthropic Claude (NLP sentiment analysis):** The NLP service is invoked per `social_post` for sentiment scoring, topic extraction, and entity recognition. Data flow: FMF `social_post` -> Integration Hub -> OpenAI Chat Completions API or Anthropic Messages API -> response -> `social_sentiment_score`. For diplomatic-language posts, Claude is preferred for nuance; GPT-4 is preferred for high-volume batch processing.
- **Slack (alert routing):** Crisis alerts route to `#fmf-pr-war-room` Slack channel via Slack Incoming Webhooks. Data flow: FMF `social.crisis.detected` -> Integration Hub -> Slack webhook -> channel message with deep-link to the FMF console.
- **PagerDuty (severe crisis escalation):** `social.crisis.detected` with `severity = s0` or `s1` triggers PagerDuty page to the MPL and ED.
- **Vector database (Pinecone or Weaviate) for quote matching:** Stores embeddings of dignitary speech transcripts (from Module 4.3 live captioning) and press releases (from Module 10.3). Data flow: ingested `social_post.post_text` -> embedding generation -> vector similarity search against the transcript DB -> `misrepresentation_suspect` flag if similarity is in the 0.65-0.85 band (above "no match", below "exact match").
- **Kafka topics:** Publishes `social.*` (full list above). Subscribes to `press.release.distributed` and `press.embargo.lifted` (Module 10.3), `session.session_started` and `speaker.session_started` (Module 4.2), `accreditation.embargo.violated` (Module 10.2), `campaign.conversion.attributed` (Module 10.1).

### F. UI/UX Notes

The MPL's primary screen is a five-panel layout. Top-left: a real-time volume chart of mentions per source over the past 24 hours, with a baseline overlay (7-day rolling average) and the current volume_ratio displayed per source. Top-center: a sentiment gauge showing the share of positive/neutral/negative sentiment in the past hour, with a sparkline of the past 24 hours. Top-right: a crisis alert feed sorted by severity (s0 red, s1 amber, s2 yellow, s3 blue), each card showing alert type, severity, trigger window, volume ratio, and one-tap "Acknowledge" and "View Detail" actions. Bottom-left: an influencer leaderboard with top 20 accounts by reach, color-coded by `is_friendly` flag (green = friendly, red = hostile, gray = neutral). Bottom-right: a share-of-voice comparison chart (FMF vs competitor events) if any competitor alert is active.

The ED's War Room view (Module 1.1) consumes a social listening tile showing: total mentions in the past hour, current sentiment split, count of active crisis alerts by severity, and a one-tap drill-down to the MPL's alert feed. The PO's view is filtered to mentions of specific dignitaries with a "Dignitary Watchlist" configuration panel. The CSM's view is filtered to mentions of speakers and sessions they manage.

### G. Failure Modes & Offline Behavior

- **Brandwatch/Sprout/Sprinklr API outage:** The engine falls back to direct X API v2 filtered stream, LinkedIn Engagement API, and Meta Graph API for primary ingestion; news monitoring falls back to Google News API. The volume metrics are degraded (some sources missing) and a "Listening Degraded" banner is shown to the MPL.
- **OpenAI API outage (or Anthropic API outage):** The engine routes sentiment scoring to the alternate provider (Claude if OpenAI is down, GPT-4 if Anthropic is down). If both are down, the engine falls back to the internal RoBERTa-based sentiment classifier (lower accuracy, especially for diplomatic language) and queues the affected posts for re-scoring when the primary providers recover.
- **Vector database unreachable (quote matching service down):** The misrepresentation detection is degraded; the engine still flags posts matching `mentions_dignitary_ids` AND `sentiment_label = negative` AND `reach_estimate >= 100_000` for human review but cannot auto-correlate against speech transcripts. The MPL can manually compare against the transcript stored in Module 4.3.
- **Slack outage (crisis alerts cannot route):** The engine falls back to PagerDuty for severe alerts (s0, s1) and to Twilio SMS for medium alerts (s2). In-app notifications via Module 7.3 push notification center are always available as a primary channel.
- **X API rate limit exceeded (filtered stream throttled):** The engine's ingestion buffer retains the post IDs that could not be hydrated in real time and re-fetches them within 15 minutes via the batch API; `ingested_at` is delayed but the post is captured.
- **Sentiment override by a non-authorized reviewer (e.g., a delegated reviewer exceeds their scope):** The engine rejects the override with `OVERRIDE_SCOPE_EXCEEDED` and alerts the MPL. The reviewer's scope is configured by the MPL per reviewer (e.g., "reviewer can only override posts mentioning Sponsor X").
- **Crisis alert storm (e.g., a true crisis triggers 50+ related alerts in 10 minutes):** The engine's deduplication job groups alerts by `dignitary_id` + `alert_type` + 15-minute window into a single parent alert with child references, so the MPL sees one consolidated card rather than 50 individual alerts.
- **Competitor event hashtag collision (e.g., a competitor uses a similar hashtag):** The engine's hashtag disambiguation job uses the entity extraction (ORG, GPE) to attribute posts to the correct event. False attributions are surfaced to the MPL for manual correction and feed back into the disambiguation model.

### H. Acceptance Criteria

- **Given** a viral X post at 14:35 on Day 2 quoting a Minister out of context with `reach_estimate = 240_000` and `engagement_count = 6_000`, **When** the engine ingests the post at 14:36 and the NLP service scores it as `negative` at 14:37:30 with `is_diplomatic_language = true` and `mentions_dignitary_ids = [<Minister's id>]`, **Then** the engine creates a `social_crisis_alert` with `alert_type = dignitary_misrepresentation`, `severity = s1`, `trigger_post_ids` containing the post, publishes `social.crisis.detected` within 5 minutes of ingestion (by 14:41), and routes a Slack message and a Twilio SMS to the MPL.
- **Given** a `social_crisis_alert` with `alert_type = dignitary_misrepresentation` and `severity = s1`, **When** the MPL taps "Trigger Clarification Release", **Then** the engine opens the Module 10.3 Press & Content Distribution workflow with a pre-filled clarification template containing the Minister's full quote from Module 4.3 and the post URL as misrepresentation evidence, and routes through expedited ED approval (15-minute SLA).
- **Given** an hourly share-of-voice computation at 11:00 on Day 2 reporting FMF at 1,200 posts (33% drop from prior day) and competitor IPMS at 1,600 posts (78% spike), **When** the engine's share-of-voice job runs, **Then** the engine creates a `social_crisis_alert` with `alert_type = competitor_share_of_voice`, `severity = s2`, `volume_ratio = 0.67` for FMF, publishes `social.crisis.detected`, and surfaces comparative metrics (hashtag performance, top 5 influencers per side, sentiment comparison) to the MPL dashboard.
- **Given** an `accreditation.embargo.violated` event from Module 10.2 for a journalist's `press_badge_id` with evidence URL, **When** the engine's `accreditation.embargo.violated` consumer processes the event, **Then** the engine cross-validates by searching `social_post` records matching the embargoed content hash, sets `is_embargo_violation_suspect = true` on matching posts, publishes `social.violation.detected` with the post IDs, and links the posts to the `social_crisis_alert` with `alert_type = embargo_violation`.
- **Given** a `social_sentiment_score` for a diplomatic-language post auto-classified as `neutral` but the human reviewer determines it is `negative` due to nuanced diplomatic context, **When** the reviewer overrides the sentiment, **Then** the engine sets `override_label = negative`, `overridden_by`, `overridden_at`, and `override_reason`, publishes `social.sentiment.overridden` with the prior and new labels, and the override is queued for the weekly NLP fine-tuning pipeline.
