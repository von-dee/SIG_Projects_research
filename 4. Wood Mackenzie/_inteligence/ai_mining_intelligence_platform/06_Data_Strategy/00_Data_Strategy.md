# Data Strategy

## Data Philosophy
Minerva's competitive moat is built on **data breadth, freshness, and synthesis** — not on proprietary data collection. We aggregate public and licensed data sources, apply AI to extract structured insights, and deliver them through an interactive interface that incumbents cannot match.

## Data Source Taxonomy

### Tier 1: Real-Time Price & Market Data
| Source | Frequency | Coverage | Cost |
|--------|-----------|----------|------|
| LME | Real-time | Base metals (Cu, Al, Zn, Pb, Ni, Sn) | $2K–$5K/mo |
| CME | Real-time | Futures & options | $1.5K–$3K/mo |
| SHFE | Real-time | Chinese metals | $1K–$2K/mo |
| Fastmarkets | Daily | Price assessments (lithium, cobalt, rare earths) | $3K–$8K/mo |
| SMM | Daily | Chinese battery metals | $1K–$3K/mo |
| Benchmark Mineral Intelligence | Weekly | Lithium, graphite, cobalt | $2K–$5K/mo |

### Tier 2: Company & Asset Data
| Source | Frequency | Coverage | Method |
|--------|-----------|----------|--------|
| EDGAR (SEC) | Daily | US-listed mining companies | API + scraping |
| SEDAR+ | Daily | Canadian-listed companies | API + scraping |
| ASX Announcements | Daily | Australian companies | API |
| JSE SENS | Daily | South African companies | RSS + API |
| Company IR websites | Daily | All public companies | Scraping |
| Annual/Quarterly reports | Quarterly | All public companies | PDF extraction |

### Tier 3: Government & Public Data
| Source | Frequency | Coverage | Method |
|--------|-----------|----------|--------|
| USGS Mineral Commodity Summaries | Annual | Global production, reserves | Bulk download |
| World Bank Commodity Price Data | Monthly | 70+ commodities | API |
| UN Comtrade | Monthly | Trade statistics | API |
| National mining ministries | Variable | Country-specific | Scraping + API |
| IEA Critical Minerals Reports | Quarterly | Supply chain analysis | PDF extraction |

### Tier 4: News & Sentiment
| Source | Frequency | Coverage | Method |
|--------|-----------|----------|--------|
| NewsAPI | Real-time | 30,000+ news sources | API |
| GDELT | Daily | Global news events | BigQuery |
| RavenPack | Real-time | Financial news analytics | API |
| Twitter/X API | Real-time | Social sentiment | API |
| Reddit | Hourly | Community discussions | API |
| Mining-specific publications | Daily | Mining.com, S&P Global, CRU | RSS + scraping |

### Tier 5: Shipping & Trade Flows
| Source | Frequency | Coverage | Method |
|--------|-----------|----------|--------|
| MarineTraffic AIS | Real-time | Global vessel positions | API + WebSocket |
| ImportGenius / Panjiva | Daily | Customs records | API |
| Port authority data | Daily | Major ports | Scraping |
| Drewry shipping indices | Weekly | Freight rates | API |

### Tier 6: Satellite & Geospatial
| Source | Frequency | Coverage | Method |
|--------|-----------|----------|--------|
| Sentinel-2 (ESA) | 5-day revisit | Global, free | API |
| Planet Labs | Daily | Commercial, high-res | API |
| Maxar | On-demand | Very high-res | API |
| Google Earth Engine | On-demand | Analysis platform | Python API |

### Tier 7: ESG & Sustainability
| Source | Frequency | Coverage | Method |
|--------|-----------|----------|--------|
| MSCI ESG Ratings | Quarterly | Public companies | API |
| Sustainalytics | Quarterly | Public companies | API |
| NGO reports (Earthworks, Amnesty) | Variable | Incident-based | Scraping |
| UN Global Compact | Annual | Participant data | API |
| GRI Sustainability Reports | Annual | Voluntary disclosures | Scraping |

---

## Data Pipeline Architecture

### Ingestion Layer
```
┌──────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                               │
│  APIs  │  RSS  │  Scraping  │  Webhooks  │  Bulk Upload    │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│              INGESTION ORCHESTRATION                          │
│         Apache Airflow + Prefect + AWS Lambda                 │
│  • Scheduling  │  • Retry logic  │  • Monitoring  │  • Alerts│
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│              RAW DATA LAKE (S3)                               │
│  • JSON  │  • Parquet  │  • CSV  │  • PDF  │  • Images     │
│  • Partitioned by source, date, commodity                     │
└────────────────────┬─────────────────────────────────────────┘
```

### Processing Layer
```
┌──────────────────────────────────────────────────────────────┐
│              PROCESSING ENGINE                                │
│              Apache Spark + dbt + Great Expectations        │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Cleaning   │  │ Normalization│  │  Enrichment │        │
│  │  Validation │  │  Deduplication│  │  Entity Link│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  NLP/NER    │  │ Sentiment   │  │  Forecasting│        │
│  │  Extraction │  │  Analysis   │  │  Models     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

### Storage Layer
```
┌──────────────────────────────────────────────────────────────┐
│              STRUCTURED DATA                                  │
│  PostgreSQL + TimescaleDB                                    │
│  • Companies, assets, prices, production, costs             │
│                                                              │
│              TIME-SERIES ANALYTICS                            │
│  ClickHouse                                                  │
│  • Price history, aggregates, cost curves                  │
│                                                              │
│              VECTOR SEARCH                                    │
│  Pinecone + Weaviate                                         │
│  • Document embeddings, semantic search                    │
│                                                              │
│              KNOWLEDGE GRAPH                                  │
│  Neo4j                                                       │
│  • Entity relationships, supply chains                       │
│                                                              │
│              OBJECT STORAGE                                   │
│  S3 + MinIO                                                  │
│  • Documents, images, reports, model artifacts               │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Quality Framework

### Dimensions
| Dimension | Metric | Target |
|-----------|--------|--------|
| **Accuracy** | % of records matching source of truth | > 99.5% |
| **Completeness** | % of required fields populated | > 98% |
| **Timeliness** | Median data latency from source | < 15 min (real-time), < 24h (batch) |
| **Consistency** | % of records with no cross-field conflicts | > 99% |
| **Uniqueness** | % of records with no duplicates | > 99.9% |
| **Validity** | % of records conforming to schema | > 99.5% |

### Quality Checks
- **Automated**: Great Expectations suites run on every pipeline execution
- **Manual**: Weekly data quality review by data engineering team
- **User-reported**: In-app "flag data issue" button for users to report anomalies
- **AI-assisted**: Anomaly detection models flag unusual data patterns

---

## Data Freshness SLAs

| Data Type | Target Freshness | Current Capability |
|-----------|-----------------|-------------------|
| Exchange prices | < 1 minute | Real-time via WebSocket |
| News articles | < 5 minutes | Real-time via streaming |
| Company filings | < 1 hour from publication | API polling + scraping |
| Production reports | < 24 hours from release | Automated extraction |
| Cost data | < 1 week from quarter end | Batch processing |
| Satellite imagery | < 5 days (Sentinel), < 1 day (Planet) | Scheduled ingestion |
| ESG incidents | < 1 hour from public reporting | Multi-source monitoring |

---

## Data Retention & Privacy

| Data Category | Retention Period | Encryption |
|---------------|-----------------|------------|
| Price data | 10 years | AES-256 at rest |
| User queries | 2 years | AES-256 at rest |
| User documents | Until account deletion | AES-256 at rest |
| Raw source data | 3 years | AES-256 at rest |
| Processed analytics | 5 years | AES-256 at rest |
| System logs | 1 year | AES-256 at rest |

---

## Estimated Data Costs (Monthly)

| Category | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|
| Exchange data APIs | $8,000 | $15,000 | $25,000 |
| News & sentiment APIs | $5,000 | $8,000 | $12,000 |
| Shipping & AIS | $3,000 | $5,000 | $8,000 |
| Satellite imagery | $2,000 | $5,000 | $10,000 |
| ESG data | $2,000 | $4,000 | $6,000 |
| Storage (S3) | $1,500 | $3,000 | $6,000 |
| Compute (processing) | $3,000 | $5,000 | $8,000 |
| **Total** | **$24,500** | **$45,000** | **$75,000** |

---

*Document Version: 1.0 | Date: June 2026*
