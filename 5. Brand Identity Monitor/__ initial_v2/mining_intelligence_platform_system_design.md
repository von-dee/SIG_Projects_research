# Mining Intelligence Platform — System Design

> A comprehensive media and community intelligence system purpose-built for mining companies, drawing on the best of Brand24, Meltwater, and Brandwatch, extended with rural community sentiment capabilities that none of those platforms offer.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Competitive Positioning](#2-competitive-positioning)
3. [System Architecture Overview](#3-system-architecture-overview)
4. [Layer 1 — Data Ingestion](#4-layer-1--data-ingestion)
5. [Layer 2 — NLP and AI Processing Pipeline](#5-layer-2--nlp-and-ai-processing-pipeline)
6. [Layer 3 — Data Storage and Indexing](#6-layer-3--data-storage-and-indexing)
7. [Layer 4 — Analytics and Intelligence Engine](#7-layer-4--analytics-and-intelligence-engine)
8. [Layer 5 — Dashboard and User Interface](#8-layer-5--dashboard-and-user-interface)
9. [Layer 6 — Alerts and Outputs](#9-layer-6--alerts-and-outputs)
10. [The Rural Community Sentiment Module](#10-the-rural-community-sentiment-module)
11. [Radio Transcription Pipeline — Technical Deep Dive](#11-radio-transcription-pipeline--technical-deep-dive)
12. [Data Models and Schema](#12-data-models-and-schema)
13. [Technology Stack](#13-technology-stack)
14. [Infrastructure and Deployment](#14-infrastructure-and-deployment)
15. [Security and Compliance](#15-security-and-compliance)
16. [Build Roadmap](#16-build-roadmap)
17. [Cost Model](#17-cost-model)

---

## 1. Executive Summary

Existing media monitoring platforms — Brand24, Meltwater, and Brandwatch — were built for consumer brands operating in well-connected, predominantly English-speaking markets. They are structurally blind to the information environments where mining companies actually face their greatest reputational and operational risks: rural communities, local FM radio, community Facebook groups, regulatory proceedings, and NGO reports.

This system design describes a platform that combines:

- **The ease of use and speed of Brand24** — clean dashboards, fast setup, immediate alerts
- **The breadth of Meltwater** — covering broadcast, radio transcripts, print, social, and podcasts
- **The analytical depth of Brandwatch** — Boolean queries, historical analysis, AI-driven trend prediction, and API-first data exports

And adds what none of them have:

- **Community radio transcription** — capturing and indexing FM radio broadcasts in local languages using speech-to-text AI
- **Rural community sentiment scoring** — a geographic community index keyed to wards and villages in the mine's catchment area
- **Offline and low-connectivity ingestion** — SMS hotlines, WhatsApp monitoring, and field agent voice capture
- **Mining-domain NLP** — sentiment models fine-tuned on land rights, water, resettlement, employment, and safety discourse

The platform is designed to serve Heads of Sustainability, Community Relations Managers, ESG teams, Legal Affairs, and Communications — across junior and senior analyst levels.

---

## 2. Competitive Positioning

### What we borrow from each incumbent

| Feature | Source of inspiration | Our implementation |
|---|---|---|
| Clean dashboard, fast onboarding | Brand24 | Role-based views, pre-built mining topic templates |
| Broadcast and radio transcript coverage | Meltwater | Own radio capture infrastructure + Whisper STT |
| Boolean query engine | Brandwatch | Full Boolean + proximity operators, saved query library |
| AI trend prediction | Brandwatch | Time-series anomaly detection on community index |
| PR workflow integration | Meltwater | Slack, email, and REST API outputs |
| Influencer / stakeholder discovery | Brand24 | Journalist, activist, and community leader tracking |
| Historical data depth | Brandwatch | 5-year rolling archive; exportable to Tableau/PowerBI |

### Our unique advantages

1. **Community radio as a first-class data source** — no incumbent indexes FM community radio in local African languages
2. **Village/ward-level sentiment geography** — catchment community risk scoring mapped to actual administrative boundaries
3. **Mining-specific NLP taxonomy** — topics, entities, and sentiment calibrated for extractive industry discourse
4. **Offline-first community ingestion** — SMS, USSD, WhatsApp, and field agent capture for communities without internet access
5. **Regulatory document intelligence** — automatic ingestion and NLP of EIA filings, EPA reports, and minerals commission documents
6. **Parliamentary Hansard monitoring** — surfaces legislative risk months before it becomes media coverage

---

## 3. System Architecture Overview

The platform is organized into six functional layers. Data flows top-to-bottom from raw sources through processing and storage to user-facing intelligence.

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1 — DATA INGESTION                                       │
│  Broadcast · Digital · Community Voice · Documents · Passive    │
└────────────────────────────┬────────────────────────────────────┘
                             │ raw content (audio, text, images)
┌────────────────────────────▼────────────────────────────────────┐
│  LAYER 2 — NLP & AI PROCESSING                                  │
│  STT · Translation · Sentiment · Entity · Topic Classification  │
└────────────────────────────┬────────────────────────────────────┘
                             │ structured signals
┌────────────────────────────▼────────────────────────────────────┐
│  LAYER 3 — DATA STORAGE & INDEXING                              │
│  Mentions DB · Community Index · Time Series · Vector Store     │
└────────────────────────────┬────────────────────────────────────┘
                             │ queryable data
┌────────────────────────────▼────────────────────────────────────┐
│  LAYER 4 — ANALYTICS & INTELLIGENCE ENGINE                      │
│  Boolean Search · Trend Detection · Community Scoring · Reports │
└────────────────────────────┬────────────────────────────────────┘
                             │ insights
┌────────────────────────────▼────────────────────────────────────┐
│  LAYER 5 — DASHBOARD & UI                                       │
│  Mention Feed · Geo Heatmap · Trend Charts · Query Builder      │
└────────────────────────────┬────────────────────────────────────┘
                             │ actions
┌────────────────────────────▼────────────────────────────────────┐
│  LAYER 6 — ALERTS & OUTPUTS                                     │
│  Slack/Email · PDF Reports · REST API · Mobile App · GIS Feed   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Layer 1 — Data Ingestion

### 4.1 Broadcast media

#### Community radio (FM/AM)
The single highest-value unlocked source for rural mining community intelligence.

**Online streams** — many African FM stations stream via Icecast or Shoutcast. Capture using FFmpeg:

```bash
ffmpeg -i http://stream.station.com/live \
  -acodec pcm_s16le -ar 16000 -ac 1 \
  -f segment -segment_time 3600 \
  /audio/raw/station_name_%Y%m%d_%H%M.wav
```

**Offline stations** — deploy an RTL-SDR dongle (~$25) + Raspberry Pi at a location within broadcast range of the mine area. The Pi captures the FM frequency and uploads hourly WAV chunks to cloud storage automatically.

**Station coverage target** — for each mine operation, identify all FM stations broadcasting to the catchment population. In Ghana's Western Region mining belt, this typically means 8–15 stations covering Tarkwa, Bogoso, Bibiani, and surrounding communities.

#### Television news
Capture via satellite receiver and DVB-T2 tuner. Record national news bulletins (GTV, TV3, JoyNews in Ghana; ZNBC in Zambia; SABC in South Africa). Run same STT pipeline as radio.

#### Podcasts and internet radio
Pull RSS feeds from Apple Podcasts and Spotify. Parse audio via the same Whisper pipeline. Focus on mining, environment, and advocacy podcasts.

### 4.2 Digital and online sources

#### Social media
| Platform | Method | Notes |
|---|---|---|
| X (Twitter) | Filtered Stream API v2 | Keyword + account tracking |
| Facebook | Meta Content Library API | Requires approved research access |
| Reddit | Pushshift + Reddit API | Focus on r/mining, r/ghana, etc. |
| LinkedIn | Unofficial scraper or Sales Navigator API | Company and executive monitoring |
| YouTube | YouTube Data API v3 | Comments on mining-related videos |
| TikTok | TikTok Research API | Emerging community voice channel |

#### News aggregators
- **GNews API** / **NewsAPI** — broad English-language coverage
- **GDELT Project** — free, massive global news database including African press
- **AllAfrica.com** — dedicated African news aggregation; scrape permitted with attribution
- **Custom RSS scrapers** — for local newspapers (Graphic Online, Daily Guide Ghana, Zambia Daily Mail) using Scrapy

#### Web forums and blogs
Scrapy spiders targeting mining industry forums (e.g. IntelligenceMine, Mining Weekly comments, local community blogs). Use Playwright for JavaScript-rendered pages.

### 4.3 Community voice (the rural-first channels)

#### SMS and USSD hotlines
Deploy a dedicated shortcode or long number via **Africa's Talking** (Ghana, Kenya, Nigeria, Zambia coverage). Community members text grievances, questions, or feedback. Each message is tagged with the sender's mobile network cell tower location (approximate GPS).

```python
# Africa's Talking inbound SMS webhook
@app.route('/sms/inbound', methods=['POST'])
def receive_sms():
    sender = request.values.get('from')
    text = request.values.get('text')
    timestamp = request.values.get('date')
    # push to ingestion queue
    queue.publish('community_sms', {
        'source': 'sms',
        'sender': anonymize(sender),
        'text': text,
        'timestamp': timestamp
    })
```

#### WhatsApp monitoring
Use the **WhatsApp Business API** (via Twilio or 360dialog) to create a community reporting number. Users send voice notes or text. Optionally, with community consent, monitor specific community group chats by having a field agent device joined to the group and forwarding messages via a local relay app.

#### Field agent mobile app
A lightweight Android app (React Native, works offline) for community liaisons to log:
- Text observations
- Voice memos (transcribed on-device with Whisper.net)
- Photos with GPS tags
- Structured forms (mood assessment, issue category, urgency level)

Data syncs to the cloud when connectivity is available. Offline-first architecture using SQLite locally.

#### Structured community surveys
Periodic pulse surveys sent via SMS (USSD format for feature phones) or delivered by field agents on tablets. Results feed directly into the community sentiment index.

### 4.4 Structured documents

#### Regulatory and environmental filings
Automatically scrape and parse:
- Environmental Protection Agency (EPA) databases
- Minerals Commission permit registers
- Environmental Impact Assessment (EIA) public notices
- Mine closure plans and social management plans

Use `pdfminer` or `pypdf2` for text extraction; fall back to `pytesseract` OCR for scanned documents.

#### Parliamentary Hansard records
Ghana, Zambia, South Africa, and DRC all publish Hansard online. Scrape weekly. Index all mentions of mining companies, mine names, and community names. Parliamentary debates often surface issues 6–18 months before they reach mainstream media.

#### Community meeting minutes
Accept uploads from community relations teams. Parse with OCR if scanned, direct text extraction if digital. Tag by community, date, and attendees.

#### Legal and court records
Monitor mining-related court filings via GhanaLII (Ghana Legal Information Institute) and equivalent portals. Flag injunctions, land disputes, and class action filings.

### 4.5 Passive and indirect signals

#### NGO and civil society reports
Monitor publication pages of key organizations:
- Wacam (Western NangriNe Akanfoor Modzaase) — Ghana artisanal mining advocacy
- SARW (Southern Africa Resource Watch)
- Business & Human Rights Resource Centre
- Global Witness
- Oxfam extractives program

Auto-download new PDFs and run through the document NLP pipeline.

#### Academic and survey data
Ingest pre-existing community perception surveys (e.g., from ICMM Social Progress Index, or university research partnerships). These provide baseline calibration for the sentiment model.

---

## 5. Layer 2 — NLP and AI Processing Pipeline

All ingested content passes through a sequential processing pipeline regardless of source type.

### 5.1 Audio preprocessing (broadcast and voice sources)

```
Raw audio (.wav/.mp3)
    → Noise reduction (noisereduce library)
    → Voice activity detection (WebRTC VAD)
    → Chunking into 30-minute segments
    → Speaker diarization (pyannote-audio 3.1)
    → Speech-to-text (OpenAI Whisper large-v3)
    → Language identification (lingua-py)
    → Output: timestamped transcript with speaker labels
```

### 5.2 Language detection and translation

After STT, detect language and translate to English for unified NLP processing, while preserving the original transcript for archive.

```python
from transformers import pipeline
from lingua import Language, LanguageDetectorBuilder

# Detect language
detector = LanguageDetectorBuilder.from_all_languages().build()
language = detector.detect_language_of(text)

# Translate to English
if language != Language.ENGLISH:
    translator = pipeline("translation",
        model=get_translation_model(language))  # routes to correct Helsinki-NLP model
    english_text = translator(text, max_length=512)[0]['translation_text']
```

**Translation model routing by language:**

| Language | Model |
|---|---|
| Twi (Akan) | `Helsinki-NLP/opus-mt-tw-en` |
| Hausa | `Helsinki-NLP/opus-mt-ha-en` |
| French | `Helsinki-NLP/opus-mt-fr-en` |
| Swahili | `Helsinki-NLP/opus-mt-sw-en` |
| 200+ languages fallback | `facebook/nllb-200-distilled-600M` |

### 5.3 Named entity recognition

Identify and link entities specific to the mining context:

- **Mine names** — custom entity list per client (mine names, project names, concession references)
- **Company names** — parent company, subsidiaries, JV partners, contractors
- **People** — executives, community leaders, activists, journalists, politicians
- **Locations** — villages, wards, districts, river systems, concession boundaries
- **Regulatory bodies** — EPA, Minerals Commission, Water Resources Commission, etc.

Use spaCy with a custom mining NER model fine-tuned on domain text, plus a rule-based lookup table for mine-specific entities.

### 5.4 Sentiment analysis

**The core challenge:** Generic sentiment models fail badly on mining discourse. "The mine has created 500 jobs" scores positive, but if the surrounding context is "while 2,000 farmers lost their land," the net sentiment is strongly negative.

**Approach:**
1. Fine-tune a base model (`xlm-roberta-base` or `afro-xlmr-large`) on a labeled mining-community corpus
2. Label training data across 5 sentiment classes: strongly negative, negative, neutral, positive, strongly positive
3. Also classify *who* the sentiment is directed at: the company, the government, the mine, a specific project, or the community itself

**Training data sources for fine-tuning:**
- Wacam community reports (labeled manually)
- ICMM community grievance case studies
- Mined historical community meeting minutes from mining clients
- Synthesized examples covering key topic areas

**Minimum viable labeled dataset:** 3,000–5,000 examples for initial model; improve with active learning as production data accumulates.

### 5.5 Topic classification

Classify each mention into one or more mining-specific topics:

| Topic | Description |
|---|---|
| Land and resettlement | Forced relocation, compensation disputes, farm loss |
| Water and environment | Contamination, acid mine drainage, river impact |
| Employment and local content | Hiring practices, contractor local quotas |
| Health and safety | Accidents, dust, noise, occupational disease |
| Revenue and royalties | Community development funds, royalty sharing |
| Regulatory compliance | Permits, EIA violations, government oversight |
| Artisanal mining conflict | Galamsey disputes, illegal mining interactions |
| Infrastructure and services | Roads, clinics, schools built or promised |
| Protest and direct action | Demonstrations, blockades, strikes |
| Legal and human rights | Court cases, rights violations, FPIC |

### 5.6 Urgency scoring

Score each mention 1–10 for operational urgency based on:
- Sentiment strength (strongly negative = higher urgency)
- Topic criticality (protest/blockade > infrastructure complaint)
- Source authority (community leader statement > anonymous comment)
- Velocity (mention spike in last 2 hours = elevated urgency)
- Geographic proximity to active operations

### 5.7 Deduplication and clustering

Group near-identical mentions (same story republished across outlets) using MinHash LSH to avoid inflating mention counts. Cluster related mentions into story threads using DBSCAN on embedding similarity.

---

## 6. Layer 3 — Data Storage and Indexing

### 6.1 Primary mentions database

**PostgreSQL** as the core relational store for all processed mentions.

```sql
CREATE TABLE mentions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type     TEXT NOT NULL,         -- 'radio', 'sms', 'news', 'social', 'document'
    source_name     TEXT,                  -- 'Adom FM', 'Daily Graphic', 'X'
    raw_text        TEXT,
    original_lang   TEXT,
    english_text    TEXT,
    published_at    TIMESTAMPTZ NOT NULL,
    ingested_at     TIMESTAMPTZ DEFAULT NOW(),
    sentiment_score FLOAT,                 -- -1.0 to 1.0
    sentiment_class TEXT,                  -- 'strongly_negative' to 'strongly_positive'
    urgency_score   INT,                   -- 1 to 10
    topics          TEXT[],
    entities        JSONB,                 -- {mines: [], companies: [], people: [], locations: []}
    location_ward   TEXT,
    location_district TEXT,
    location_coords GEOGRAPHY(POINT, 4326),
    mine_ids        TEXT[],                -- which client mines this is tagged to
    audio_file_path TEXT,                  -- for radio/voice sources
    metadata        JSONB
);

CREATE INDEX idx_mentions_published ON mentions(published_at DESC);
CREATE INDEX idx_mentions_mine ON mentions USING GIN(mine_ids);
CREATE INDEX idx_mentions_topics ON mentions USING GIN(topics);
CREATE INDEX idx_mentions_sentiment ON mentions(sentiment_score);
CREATE INDEX idx_mentions_location ON mentions USING GIST(location_coords);
```

### 6.2 Community index

A separate table maintaining rolling sentiment scores per geographic unit:

```sql
CREATE TABLE community_index (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_name  TEXT NOT NULL,
    ward_code       TEXT,
    district        TEXT,
    country         TEXT,
    mine_id         TEXT NOT NULL,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    period_type     TEXT,              -- 'daily', 'weekly', 'monthly'
    sentiment_score FLOAT,            -- -1.0 to 1.0 composite
    mention_count   INT,
    topic_breakdown JSONB,            -- {land: -0.8, water: -0.6, employment: 0.3, ...}
    source_breakdown JSONB,           -- {radio: 40%, sms: 30%, social: 30%}
    trend_direction TEXT,             -- 'improving', 'stable', 'deteriorating'
    alert_triggered BOOLEAN DEFAULT FALSE,
    coords          GEOGRAPHY(POINT, 4326),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.3 Time-series store

**TimescaleDB** (PostgreSQL extension) for efficient time-series queries on sentiment trends:

```sql
CREATE TABLE sentiment_timeseries (
    time            TIMESTAMPTZ NOT NULL,
    mine_id         TEXT NOT NULL,
    community_id    TEXT,
    topic           TEXT,
    source_type     TEXT,
    sentiment_avg   FLOAT,
    mention_count   INT,
    urgency_max     INT
);

SELECT create_hypertable('sentiment_timeseries', 'time');
CREATE INDEX ON sentiment_timeseries(mine_id, time DESC);
```

### 6.4 Vector store for semantic search

**pgvector** extension on PostgreSQL for semantic search ("find mentions similar to this grievance"):

```sql
CREATE EXTENSION vector;

ALTER TABLE mentions ADD COLUMN embedding VECTOR(1536);
CREATE INDEX ON mentions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

Generate embeddings using `text-embedding-3-small` (OpenAI) or `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` for multilingual content.

### 6.5 Raw audio archive

**Object storage** (AWS S3 / Cloudflare R2) for raw audio files:
- Retain raw audio for 30 days (storage cost management)
- Retain transcripts permanently
- Archive significant segments (high urgency, broadcast during incidents) indefinitely

File naming convention: `{station_slug}/{YYYY}/{MM}/{DD}/{HH}_{segment_id}.wav`

---

## 7. Layer 4 — Analytics and Intelligence Engine

### 7.1 Boolean query engine

Full-featured query language for power users, matching Brandwatch's capability:

**Supported operators:**
- `AND`, `OR`, `NOT`
- `NEAR/n` — terms within n words of each other
- `"exact phrase"` — phrase matching
- Wildcards: `mine*` matches mining, miner, mineral
- Field scoping: `source:radio AND topic:water AND sentiment:<-0.5`

**Implementation:** Parse query into an AST, translate to PostgreSQL full-text search + pgvector for semantic components. Save named queries to a query library.

### 7.2 Trend detection and anomaly alerts

Use statistical process control (SPC) to detect sentiment anomalies:

```python
import numpy as np
from scipy import stats

def detect_anomaly(time_series: list[float], window: int = 14) -> dict:
    """
    Compares latest period to rolling baseline.
    Returns z-score, is_anomaly flag, and direction.
    """
    baseline = time_series[-window-1:-1]
    current = time_series[-1]
    
    mean = np.mean(baseline)
    std = np.std(baseline)
    z_score = (current - mean) / (std + 1e-9)
    
    return {
        'z_score': z_score,
        'is_anomaly': abs(z_score) > 2.5,
        'direction': 'deteriorating' if z_score < -2.5 else 'improving' if z_score > 2.5 else 'stable',
        'baseline_mean': mean,
        'current_value': current
    }
```

Run this nightly per mine, per community, and per topic. Trigger alerts when `is_anomaly=True` with a deteriorating direction.

### 7.3 Community risk scoring

Composite risk score (0–100) per community, updated daily:

```
risk_score = (
    sentiment_weight    × normalized_sentiment_score    +   # 40%
    velocity_weight     × mention_velocity_change       +   # 20%
    topic_weight        × critical_topic_proportion     +   # 20%
    source_weight       × radio_sms_proportion          +   # 10% (offline sources = more credible)
    historical_weight   × trend_direction_score             # 10%
)
```

Risk bands:
- 0–30: Green — stable community relations
- 31–55: Amber — monitor closely
- 56–75: Red — proactive engagement required
- 76–100: Critical — immediate escalation

### 7.4 Report generation

Automated reports using a template engine (Jinja2 + WeasyPrint for PDF):

- **Daily digest** — top 10 mentions, community risk summary, overnight radio highlights
- **Weekly intelligence brief** — trend analysis, emerging issues, competitor activity
- **Incident report** — auto-generated when urgency score ≥ 8 sustained for 2+ hours
- **Monthly board report** — community index trends, regulatory status, stakeholder sentiment by group

---

## 8. Layer 5 — Dashboard and User Interface

### 8.1 Role-based views

| Role | Default view | Key features |
|---|---|---|
| Community Relations Manager | Geo heatmap + community index | Village-level scores, radio transcript feed |
| Communications / PR | Mention feed + media sources | Journalist tracking, crisis timeline |
| Sustainability / ESG | Topic trend charts + regulatory feed | EIA tracker, compliance mentions |
| Legal | Court and regulatory monitoring | Injunction alerts, Hansard feed |
| Executive | Executive summary dashboard | KPI cards, risk score, peer benchmarking |
| Analyst | Full query builder + data exports | Boolean search, API access, raw data |

### 8.2 Core dashboard components

**Mention feed** — real-time stream of incoming mentions with sentiment color coding, source icon, topic tags, and urgency badge. Filterable by source type, sentiment, topic, date range, and community.

**Geo heatmap** — choropleth map of the mine's catchment area, colored by community risk score. Drill down from district → ward → village. Click any area to see underlying mentions. Powered by Mapbox GL JS with administrative boundary GeoJSON.

**Sentiment trend charts** — time-series line charts per mine, per topic, or per community. Configurable period (7d, 30d, 90d, 1y). Overlay key events (EIA submission dates, community meetings, incidents).

**Community index table** — tabular view of all monitored communities with current score, trend arrow, dominant topic, and source breakdown. Sortable and exportable.

**Boolean query builder** — visual query builder for non-technical users, with raw Boolean mode for analysts. Results show in mention feed with match highlighting.

**Radio transcript browser** — dedicated view for audio-sourced content. Shows station, timestamp, language, speaker (where diarized), transcript, and translated text side-by-side. Audio playback of the original segment.

**Regulatory tracker** — timeline of all EIA filings, permit renewals, and compliance deadlines for the client's operations, with associated media and community sentiment.

### 8.3 Alert configuration UI

Users configure alert rules through a no-code interface:

```
IF  [community risk score]  [rises above]  [65]
AND [source]                [includes]     [radio OR SMS]
THEN notify [Slack: #community-alerts] + [Email: team@company.com]
     with [urgency: HIGH]
     and  [include: top 5 triggering mentions]
```

---

## 9. Layer 6 — Alerts and Outputs

### 9.1 Alert channels

- **Slack** — rich message blocks with mention cards, sentiment indicators, and direct links
- **Microsoft Teams** — adaptive card format
- **Email** — HTML digest with summary + top mentions
- **SMS** — plain-text critical alerts for field teams without smartphones (via Africa's Talking)
- **PagerDuty** — for integration into existing incident management workflows

### 9.2 REST API

Full API for integration with GIS, ERP, and reporting tools:

```
GET  /api/v1/mentions              # query mention feed
GET  /api/v1/community/{id}/score  # current community risk score
GET  /api/v1/community/{id}/trends # time-series sentiment data
GET  /api/v1/alerts                # active alerts
POST /api/v1/queries               # save and run Boolean queries
GET  /api/v1/reports/{type}        # generate on-demand reports
```

Authentication via OAuth 2.0 with JWT bearer tokens. Rate limiting at 1,000 requests/hour per API key.

### 9.3 GIS integration

Export community index scores as GeoJSON for integration into:
- ArcGIS / QGIS (used by mining environmental teams)
- Mine management GIS systems
- ESG reporting platforms

### 9.4 Mobile application

React Native app for field teams and executives:
- Push notifications for critical alerts
- Read-only mention feed and community scores
- Field agent voice/text submission (offline-capable)
- GPS-tagged observation logging

---

## 10. The Rural Community Sentiment Module

This module is the platform's primary differentiator. It addresses the fundamental problem that rural catchment communities generate most of their discourse in channels that existing monitoring tools cannot see.

### 10.1 The coverage gap

Standard monitoring tools cover:
- Online news: ~15% of community grievance expression in rural mining areas
- Social media (Twitter/X): ~5% — extremely low smartphone and Twitter penetration
- What they miss: radio (dominant), in-person meetings, SMS, WhatsApp, traditional authority communications

This module covers the 80% that is invisible to Brand24, Meltwater, and Brandwatch.

### 10.2 Community registry

Maintain a structured registry of all communities in the mine's catchment area:

```json
{
  "community_id": "gh-wr-tarkwa-nsuaem-manso",
  "name": "Manso",
  "administrative_unit": {
    "district": "Tarkwa-Nsuaem",
    "region": "Western Region",
    "country": "Ghana"
  },
  "coordinates": { "lat": 5.3021, "lon": -1.9874 },
  "population_estimate": 4200,
  "primary_language": "Twi",
  "proximity_to_mine_km": 3.2,
  "radio_stations_received": ["Adom FM 106.3", "Radio Univers 105.7"],
  "field_agent_assigned": "agent_id_042",
  "monitoring_channels": ["radio", "sms_hotline", "field_agent", "facebook_group"],
  "baseline_sentiment": -0.12,
  "baseline_date": "2024-01-01"
}
```

### 10.3 Multi-source fusion for community score

Each community's score fuses signals across all available channels, weighted by source reliability and volume:

```python
def compute_community_score(community_id: str, period: tuple) -> float:
    """
    Weighted average sentiment across all ingestion sources for a community
    """
    weights = {
        'radio':        0.30,  # High weight — public, broadcast, trusted voice
        'sms_hotline':  0.25,  # Direct community voice
        'field_agent':  0.20,  # Structured, expert-observed
        'whatsapp':     0.15,  # Community group sentiment
        'social_media': 0.05,  # Low weight — unrepresentative of rural community
        'news_media':   0.05,  # External view, not community voice
    }
    
    scores = fetch_source_scores(community_id, period)
    
    weighted_sum = sum(
        weights.get(source, 0) * score 
        for source, score in scores.items()
    )
    confidence = compute_confidence(scores)  # lower if few sources available
    
    return {'score': weighted_sum, 'confidence': confidence}
```

### 10.4 Early warning indicators

Beyond sentiment, track structural early warning signals:
- Sudden spike in SMS volume from a community (even if sentiment is neutral)
- Radio call-in shows generating more mining-related calls than baseline
- Field agent flagging escalated language in community meetings
- Facebook group posts increasing without a corresponding news trigger
- Community leader stopping engagement with company liaison

These leading indicators often precede a sentiment deterioration by 2–4 weeks.

---

## 11. Radio Transcription Pipeline — Technical Deep Dive

### 11.1 Infrastructure components

```
FM Station Broadcast
        │
        ▼
┌───────────────────┐      ┌───────────────────┐
│  RTL-SDR Receiver │  OR  │  Online Stream URL │
│  (Raspberry Pi)   │      │  (Icecast/HLS)     │
└────────┬──────────┘      └────────┬───────────┘
         │                          │
         └──────────┬───────────────┘
                    ▼
         ┌─────────────────────┐
         │  FFmpeg Capture     │
         │  WAV, 16kHz, mono  │
         │  Hourly segments    │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │  Cloud Object Store │
         │  (S3 / R2)          │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │  Celery Worker      │
         │  (Batch overnight)  │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │  pyannote-audio     │
         │  Speaker Diarize    │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │  Whisper large-v3   │
         │  Speech-to-Text     │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │  Language ID        │
         │  + Translation      │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │  NLP Pipeline       │
         │  (Sentiment/Topic)  │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │  PostgreSQL Index   │
         └─────────────────────┘
```

### 11.2 Capture script (production)

```python
import subprocess
import boto3
from datetime import datetime
from pathlib import Path

def capture_radio_segment(station: dict, duration_seconds: int = 3600):
    """
    Capture one hour of audio from a radio station stream.
    Uploads to S3 and queues for STT processing.
    """
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M')
    filename = f"{station['slug']}_{timestamp}.wav"
    local_path = f"/tmp/{filename}"
    s3_key = f"radio/{station['slug']}/{datetime.utcnow().strftime('%Y/%m/%d')}/{filename}"
    
    cmd = [
        'ffmpeg', '-i', station['stream_url'],
        '-acodec', 'pcm_s16le',
        '-ar', '16000',
        '-ac', '1',
        '-t', str(duration_seconds),
        local_path
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    
    s3 = boto3.client('s3')
    s3.upload_file(local_path, 'mining-intel-audio', s3_key)
    
    # Queue for overnight STT processing
    queue.publish('audio_transcription', {
        's3_key': s3_key,
        'station_id': station['id'],
        'timestamp': timestamp,
        'expected_language': station['primary_language']
    })
    
    Path(local_path).unlink()  # delete local temp file
```

### 11.3 Transcription worker

```python
import whisper
from pyannote.audio import Pipeline as DiarizePipeline

whisper_model = whisper.load_model("large-v3")
diarize_pipeline = DiarizePipeline.from_pretrained("pyannote/speaker-diarization-3.1")

def transcribe_segment(s3_key: str, station_id: str, expected_language: str) -> dict:
    
    # Download from S3
    local_path = download_from_s3(s3_key)
    
    # Speaker diarization
    diarization = diarize_pipeline(local_path)
    speaker_turns = [
        {'speaker': speaker, 'start': turn.start, 'end': turn.end}
        for turn, _, speaker in diarization.itertracks(yield_label=True)
    ]
    
    # Speech-to-text
    result = whisper_model.transcribe(
        local_path,
        language=expected_language if expected_language != 'auto' else None,
        task='transcribe',
        word_timestamps=True
    )
    
    # Merge transcript with speaker turns
    transcript_segments = merge_diarization_with_transcript(
        result['segments'], speaker_turns
    )
    
    return {
        'detected_language': result['language'],
        'full_text': result['text'],
        'segments': transcript_segments,
        'duration_seconds': result['segments'][-1]['end'] if result['segments'] else 0
    }
```

### 11.4 Scheduling strategy

```
06:00–23:00 local time    — Continuous FM capture (all monitored stations)
23:00–06:00 local time    — Batch STT processing runs (cheaper GPU spot instances)
06:30 each morning        — Overnight transcripts indexed and available in dashboard
Hourly                    — Real-time STT for high-priority stations during incidents
```

### 11.5 Handling call-in shows

Call-in shows (live community member phone-ins) are the highest-value radio content. The diarization pipeline separates host from callers. Flag segments where:
- A caller-identified segment mentions a mine name or mining topic
- The caller segment has strongly negative sentiment
- Multiple callers in one segment share the same topic (indicates coordinated grievance)

These segments are automatically elevated to high urgency and surfaced first in the radio transcript browser.

---

## 12. Data Models and Schema

### 12.1 Core entities

```
mines ──────────< mine_communities >────────── communities
  │                                                 │
  │                                                 │
  ├──< mentions >──────────────────────────────────>│ (location_community_id)
  │      │
  │      ├── entities (JSONB)
  │      ├── topics (ARRAY)
  │      └── sentiment_score (FLOAT)
  │
  ├──< community_index >───────────────────────────>communities
  │
  ├──< radio_stations >──< broadcasts >
  │                            │
  │                            └──< transcript_segments >
  │
  └──< alert_rules >──< alert_events >
```

### 12.2 Key relationships

- One mine has many associated communities (geographic coverage)
- One mention can be tagged to multiple mines (if it references multiple operations)
- One community has many community_index records (one per time period)
- One broadcast has many transcript segments (chunked and diarized)
- Transcript segments join to mentions via a one-to-one relationship after NLP processing

---

## 13. Technology Stack

### 13.1 Backend services

| Component | Technology | Rationale |
|---|---|---|
| API framework | FastAPI (Python) | Async, fast, OpenAPI docs auto-generated |
| Task queue | Celery + Redis | Reliable async processing for STT and NLP |
| Database | PostgreSQL 16 + TimescaleDB + pgvector | One engine, three capabilities |
| Object storage | AWS S3 / Cloudflare R2 | Audio file archive |
| Search | PostgreSQL FTS + pgvector | Avoids Elasticsearch complexity at this scale |
| Cache | Redis | Query results, session data, rate limiting |

### 13.2 AI and ML components

| Component | Technology | Notes |
|---|---|---|
| Speech-to-text | OpenAI Whisper large-v3 | Self-hosted on GPU instances |
| Speaker diarization | pyannote-audio 3.1 | Requires HuggingFace token |
| Translation | Helsinki-NLP OPUS-MT + NLLB-200 | Self-hosted, no per-call cost |
| Sentiment model | XLM-RoBERTa fine-tuned | Requires labeled training data |
| NER | spaCy + custom mining model | Domain-specific entity recognition |
| Embeddings | sentence-transformers multilingual | For semantic search |
| Text classification | FastText (topic) | Lightweight, fast inference |

### 13.3 Infrastructure

| Component | Technology |
|---|---|
| Container orchestration | Kubernetes (EKS or GKE) |
| GPU instances | AWS G4dn (Whisper) — spot instances overnight |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana |
| Logging | ELK stack (Elasticsearch + Logstash + Kibana) |
| Secrets management | AWS Secrets Manager |
| CDN | Cloudflare |

### 13.4 Frontend

| Component | Technology |
|---|---|
| Framework | React + TypeScript |
| Maps | Mapbox GL JS |
| Charts | Recharts + D3.js |
| UI components | shadcn/ui |
| State management | Zustand |
| API client | React Query (TanStack) |
| Mobile app | React Native |

---

## 14. Infrastructure and Deployment

### 14.1 Deployment topology

```
Internet
    │
    ▼
Cloudflare (DDoS, CDN, WAF)
    │
    ▼
Load Balancer (AWS ALB)
    │
    ├──► API Pods (FastAPI) ×3
    ├──► Frontend Pod (Nginx serving React build)
    │
    ├──► Worker Pods (Celery) ×4  ──► GPU Node Pool (Whisper STT)
    │
    └──► PostgreSQL (RDS + TimescaleDB) + Redis (ElastiCache)
         └──► S3 (audio archive)
```

### 14.2 Environment strategy

- **Development** — local Docker Compose; smaller Whisper model (medium)
- **Staging** — single-node Kubernetes; full model suite; anonymized production data
- **Production** — multi-AZ Kubernetes; auto-scaling worker pools; GPU spot instances for batch STT

### 14.3 Disaster recovery

- PostgreSQL: automated daily snapshots to S3, 30-day retention; cross-region replication for production
- Redis: AOF persistence; standby replica
- Audio files: S3 with versioning; Glacier archive for segments older than 30 days
- RTO target: 4 hours; RPO target: 1 hour

---

## 15. Security and Compliance

### 15.1 Data handling

- All community member data (SMS senders, WhatsApp users) is pseudonymized at ingestion. Phone numbers are hashed; original numbers are never stored in the mentions table.
- Field agent observations involving named individuals require explicit consent flags before storage.
- Audio recordings of community members are subject to retention limits (30 days raw audio) and are not used for any purpose other than transcription.

### 15.2 Access control

- Role-based access control (RBAC) with five roles: Viewer, Analyst, Manager, Admin, Super Admin
- All API calls authenticated via OAuth 2.0
- Mine-level data segregation — a user with access to Mine A cannot see Mine B's data
- Audit log of all data access and exports

### 15.3 Compliance considerations

- GDPR-equivalent data subject rights supported (deletion, portability)
- Ghana Data Protection Act 2012 compliance for community data
- ICMM Responsible Mining principles alignment for community engagement data use
- UN Guiding Principles on Business and Human Rights — community data not used for surveillance

---

## 16. Build Roadmap

### Phase 1 — Foundation (months 1–3)

- Online news and social media ingestion (standard Brand24-equivalent coverage)
- Basic sentiment model (pre-trained, not yet fine-tuned)
- PostgreSQL schema and core API
- Simple mention feed dashboard
- Slack and email alerts

**Deliverable:** Working Brand24-equivalent for one pilot mine client

### Phase 2 — Radio and community voice (months 4–6)

- Radio stream capture for top 5 stations in pilot area
- Whisper STT pipeline (batch overnight)
- SMS hotline via Africa's Talking
- Language detection and translation
- Field agent mobile app (MVP)

**Deliverable:** First radio transcripts appearing in dashboard; SMS community voice operational

### Phase 3 — Community intelligence (months 7–9)

- Community registry setup for pilot mine catchment
- Community index scoring model
- Geo heatmap in dashboard
- Mining-specific NLP fine-tuning (requires labeled data collection in Phase 1–2)
- Document ingestion (EIA, Hansard, NGO reports)

**Deliverable:** Community risk scores live; first geo heatmap view

### Phase 4 — Enterprise features (months 10–12)

- Boolean query builder
- Historical data archive (5 years via GDELT backfill)
- REST API for external integrations
- GIS data export
- Automated report generation
- Multi-mine multi-client architecture

**Deliverable:** Enterprise-grade platform; ready for commercial launch

---

## 17. Cost Model

### 17.1 Infrastructure costs (per mine operation, monthly)

| Component | Cost estimate |
|---|---|
| Compute (API + workers) | $400–600/month |
| GPU instances (Whisper, overnight batch) | $200–400/month (spot pricing) |
| PostgreSQL (RDS) | $300–500/month |
| Redis (ElastiCache) | $100–150/month |
| S3 storage (audio + data) | $80–150/month |
| Cloudflare (CDN + security) | $50–100/month |
| Africa's Talking (SMS gateway) | $0.01–0.04 per SMS received |
| RTL-SDR hardware (one-time, per station) | $35–80 per unit |
| Raspberry Pi per capture point (one-time) | $60–100 per unit |

**Estimated total infrastructure:** $1,200–1,900/month per mine operation

### 17.2 Suggested pricing tiers

| Tier | Target | Features | Price |
|---|---|---|---|
| Starter | Junior mine (<5,000 community members) | Online sources only, 3 alerts | $800/month |
| Professional | Mid-size operation | + Radio (up to 5 stations), SMS hotline, geo heatmap | $2,500/month |
| Enterprise | Large mine, multiple operations | Full suite, unlimited sources, API access, custom NLP | $6,000+/month |

At Professional pricing with ~40% gross margin, break-even is approximately 4–5 Professional clients covering infrastructure for a team of 5 engineers.

---

*Document version 1.0 — Mining Intelligence Platform System Design*
*All third-party tool references are for architectural guidance. Verify current pricing, API terms, and licensing before implementation.*
