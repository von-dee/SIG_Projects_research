# Tech Stack Overview

## Architecture Philosophy
Minerva is built on a **cloud-native, event-driven, microservices architecture** designed for:
- **Scalability**: Handle 10M+ data points/day with sub-second query latency
- **Reliability**: 99.99% uptime with multi-region failover
- **Extensibility**: Add new data sources, commodities, and AI capabilities without rewrites
- **Security**: SOC 2 Type II, GDPR, and mining-industry data protection standards
- **Cost Efficiency**: Serverless-first to minimize idle compute costs

## Stack Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                          │
│  React 19 + Next.js 15 + Tailwind CSS + shadcn/ui          │
│  React Native (iOS/Android) + Electron (Desktop)             │
├─────────────────────────────────────────────────────────────┤
│                    API GATEWAY LAYER                           │
│  Kong Gateway + AWS API Gateway + GraphQL (Apollo)           │
│  Rate Limiting, Auth, Caching, Analytics                     │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                           │
│  Python (FastAPI) + Node.js (NestJS) + Go (microservices)  │
│  LangGraph + LangChain + Claude API + OpenAI API             │
├─────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                  │
│  PostgreSQL 16 + TimescaleDB + ClickHouse + Redis          │
│  Pinecone + Neo4j + MinIO + Apache Kafka                    │
├─────────────────────────────────────────────────────────────┤
│                    INGESTION LAYER                             │
│  Apache Airflow + Prefect + Scrapy + Playwright              │
│  AWS Lambda + EventBridge + S3 + Kinesis                    │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                        │
│  AWS (Primary) + GCP (DR) + Terraform + Kubernetes         │
│  Datadog + PagerDuty + GitHub Actions + ArgoCD              │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Technology Decisions

### Why Python for AI/Backend
- Dominant ecosystem for ML/AI (LangChain, PyTorch, scikit-learn)
- FastAPI provides async performance comparable to Node.js
- Rich data science libraries (pandas, polars, numpy)

### Why Next.js for Frontend
- Server-side rendering for SEO and initial load performance
- API routes for serverless backend functions
- Excellent TypeScript support and developer experience
- Vercel deployment for edge caching

### Why TimescaleDB for Time-Series
- Native PostgreSQL extension — no separate database to manage
- Hypertables for automatic partitioning
- Continuous aggregates for pre-computed analytics
- Excellent compression ratios (90%+ for financial data)

### Why ClickHouse for Analytics
- Columnar storage optimized for OLAP queries
- Real-time ingestion at 2M+ rows/second
- Advanced window functions and materialized views
- Cost-effective at scale vs. Snowflake/BigQuery

### Why LangGraph for Agent Orchestration
- Stateful multi-agent workflows with persistence
- Built-in human-in-the-loop capabilities
- Visual debugging and monitoring
- Native integration with LangChain ecosystem

---

*Document Version: 1.0 | Date: June 2026*
