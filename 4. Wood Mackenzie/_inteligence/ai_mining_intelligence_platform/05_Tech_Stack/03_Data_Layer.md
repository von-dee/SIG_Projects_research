# Data Layer Tech Stack

## Primary Databases

### Relational Database
| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 16+ | Primary transactional database |
| **TimescaleDB** | 2.15+ | Time-series extension for price data |
| **pgvector** | 0.7+ | Vector operations in PostgreSQL |
| **PostGIS** | 3.4+ | Geospatial extensions |

**Schema Design**:
- `companies` — Mining company profiles, financials
- `assets` — Mine-level data (production, costs, reserves)
- `commodities` — Commodity definitions, classifications
- `prices` — Time-series price data (TimescaleDB hypertable)
- `filings` — SEC/ASX/JSE filing metadata and extracted data
- `news` — News articles with embeddings and sentiment
- `esg_incidents` — ESG events and scoring
- `users` — User accounts, preferences, subscriptions
- `alerts` — Alert configurations and history
- `reports` — Generated reports and templates

### Time-Series Database
| Technology | Version | Purpose |
|------------|---------|---------|
| **ClickHouse** | 24+ | OLAP analytics, large-scale aggregations |
| **InfluxDB** | 2.7+ | Metrics and monitoring data (evaluating) |

**ClickHouse Use Cases**:
- Price history analytics (10B+ rows)
- Cost curve calculations
- Supply-demand model outputs
- User behavior analytics

### Vector Database
| Technology | Version | Purpose |
|------------|---------|---------|
| **Pinecone** | Serverless | Document embeddings, semantic search |
| **Weaviate** | 1.25+ | Self-hosted vector search (enterprise) |

**Collections**:
- `filings_embeddings` — SEC filing chunks (1M+ vectors)
- `news_embeddings` — News articles (5M+ vectors)
- `reports_embeddings` — Generated reports (100K+ vectors)
- `knowledge_graph` — Entity relationships (Neo4j)

### Graph Database
| Technology | Version | Purpose |
|------------|---------|---------|
| **Neo4j** | 5.20+ | Knowledge graph (companies, assets, people, relationships) |

**Graph Model**:
- Nodes: Company, Asset, Person, Commodity, Country, Event
- Relationships: OWNS, OPERATES, PRODUCES, LOCATED_IN, ACQUIRED, COMPETES_WITH

---

## Caching & Session Management

| Technology | Version | Purpose |
|------------|---------|---------|
| **Redis** | 7.2+ | Session cache, rate limiting, pub/sub |
| **Redis Cluster** | 7.2+ | Distributed caching |
| **Cloudflare Workers KV** | — | Edge caching for static content |

**Cache Strategy**:
- **L1**: In-memory (application level) — 5 min TTL
- **L2**: Redis — 1 hour TTL for query results
- **L3**: Cloudflare CDN — 24 hour TTL for static assets

---

## Message Queue & Streaming

| Technology | Version | Purpose |
|------------|---------|---------|
| **Apache Kafka** | 3.7+ | Event streaming, data pipeline backbone |
| **AWS Kinesis** | — | Real-time data ingestion |
| **Redis Pub/Sub** | 7.2+ | Real-time alerts, notifications |
| **RabbitMQ** | 3.13+ | Task queue for background jobs |

**Kafka Topics**:
- `prices.raw` — Raw price feeds from exchanges
- `prices.processed` — Cleaned, normalized price data
- `news.raw` — Raw news articles
- `news.processed` — Enriched news (sentiment, entities)
- `filings.raw` — Raw filing documents
- `filings.extracted` — Structured data from filings
- `alerts.triggered` — Alert events
- `reports.generated` — Report generation jobs
- `shipping.ais` — AIS vessel position updates
- `esg.incidents` — ESG event detections

---

## Object Storage

| Technology | Purpose |
|------------|---------|
| **AWS S3** | Primary object storage (documents, images, backups) |
| **MinIO** | Self-hosted S3-compatible storage (on-premise clients) |
| **Cloudflare R2** | Backup and archive (S3-compatible, zero egress fees) |

**Bucket Structure**:
- `minerva-documents/` — User uploads, reports, exports
- `minerva-filings/` — Raw filing documents (PDF, HTML)
- `minerva-images/` — Satellite imagery, site photos
- `minerva-backups/` — Database backups
- `minerva-ml-models/` — Trained model artifacts

---

## Data Pipeline Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Sources    │───▶│  Ingestion  │───▶│ Processing  │───▶│  Storage    │
│             │    │             │    │             │    │             │
│ • EDGAR     │    │ • Airflow   │    │ • Pandas    │    │ • PostgreSQL│
│ • SEDAR     │    │ • Prefect   │    │ • Polars    │    │ • Timescale │
│ • ASX       │    │ • Scrapy    │    │ • Spark     │    │ • ClickHouse│
│ • LME API   │    │ • Playwright│    │ • dbt       │    │ • Pinecone  │
│ • News APIs │    │ • Lambda    │    │ • Great     │    │ • Neo4j     │
│ • AIS       │    │             │    │   Expectations│   │ • S3        │
│ • Satellite │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## Data Governance

| Technology | Purpose |
|------------|---------|
| **dbt (data build tool)** | Data transformation, documentation, testing |
| **Great Expectations** | Data quality validation |
| **Apache Atlas** | Data catalog and lineage |
| **DataHub** | Metadata management |

---

*Document Version: 1.0 | Date: June 2026*
