# Backend Tech Stack

## API Layer

### Primary API Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.111+ | High-performance async Python API |
| **Pydantic** | 2.7+ | Data validation and serialization |
| **Uvicorn** | 0.30+ | ASGI server |
| **Gunicorn** | 22+ | Production WSGI/ASGI server |

### Secondary Services
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js + NestJS** | 20+ | Real-time services, WebSocket handling |
| **Go** | 1.22+ | High-throughput microservices (ingestion, streaming) |
| **GraphQL (Apollo Server)** | 4.x | Flexible data fetching for complex queries |

### Authentication & Authorization
| Technology | Purpose |
|------------|---------|
| **Auth0 / Clerk** | Identity management, SSO |
| **JWT** | Stateless authentication |
| **RBAC (Role-Based Access Control)** | Tiered permissions |
| **OAuth 2.0 + OpenID Connect** | Enterprise SSO integration |

### API Gateway & Middleware
| Technology | Purpose |
|------------|---------|
| **Kong Gateway** | API management, rate limiting, auth |
| **AWS API Gateway** | Serverless API endpoints |
| **Redis** | Rate limiting, session caching |
| **Cloudflare** | DDoS protection, CDN, edge caching |

---

## AI & ML Layer

### LLM Orchestration
| Technology | Version | Purpose |
|------------|---------|---------|
| **LangGraph** | 0.1+ | Multi-agent workflow orchestration |
| **LangChain** | 0.2+ | LLM application framework |
| **LangSmith** | Latest | Observability, tracing, evaluation |
| **LlamaIndex** | 0.10+ | RAG pipeline, document indexing |

### LLM Providers
| Provider | Models | Use Case |
|----------|--------|----------|
| **Anthropic Claude** | Claude 3.5 Sonnet, Claude 3 Opus | Primary reasoning, report generation, complex analysis |
| **OpenAI** | GPT-4o, GPT-4o-mini | Secondary, cost-optimized tasks, embeddings |
| **Cohere** | Command R+ | Reranking, multilingual tasks |
| **Local (future)** | Llama 3.1 70B, Mistral Large | On-premise deployment for sensitive data |

### Embeddings & Vector Search
| Technology | Purpose |
|------------|---------|
| **OpenAI text-embedding-3-large** | Document embeddings (3072-dim) |
| **Cohere embed-english-v3** | Alternative embeddings |
| **Pinecone** | Managed vector database (primary) |
| **Weaviate** | Self-hosted vector search (backup) |
| **pgvector** | PostgreSQL extension for simple vector ops |

### ML Models
| Technology | Purpose |
|------------|---------|
| **scikit-learn** | Traditional ML (regression, clustering) |
| **XGBoost / LightGBM** | Gradient boosting for price prediction |
| **Prophet** | Time-series forecasting |
| **PyTorch** | Deep learning models (NLP, anomaly detection) |
| **Hugging Face Transformers** | Fine-tuned models for mining-specific NLP |

### Model Serving
| Technology | Purpose |
|------------|---------|
| **BentoML** | Model serving and deployment |
| **MLflow** | Experiment tracking, model registry |
| **Ray Serve** | Distributed model serving at scale |

---

## Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    COORDINATOR AGENT                         │
│  (Claude 3.5 Sonnet — intent classification, routing)       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Data Agent  │  │ News Agent  │  │ Cost Agent  │        │
│  │ (PostgreSQL │  │ (News APIs  │  │ (Financial  │        │
│  │  + API)     │  │  + RSS)     │  │  models)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ ESG Agent   │  │ Ship Agent  │  │ Report Agent│        │
│  │ (ESG DB     │  │ (AIS +      │  │ (Claude     │        │
│  │  + NLP)     │  │  port data) │  │  + templates)│       │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    SYNTHESIS AGENT                           │
│  (Claude 3 Opus — answer generation, citation, formatting)   │
└─────────────────────────────────────────────────────────────┘
```

### Agent Types
| Agent | Data Sources | Capabilities |
|-------|--------------|--------------|
| **Data Agent** | PostgreSQL, TimescaleDB, ClickHouse | SQL generation, time-series queries, aggregations |
| **News Agent** | News APIs, RSS, Twitter/X, SEC filings | Real-time monitoring, sentiment analysis, event extraction |
| **Cost Agent** | Company filings, USGS, industry reports | Cost curve modeling, benchmarking, scenario analysis |
| **ESG Agent** | NGO reports, regulatory filings, satellite | Incident tracking, scoring, compliance monitoring |
| **Shipping Agent** | AIS data, port databases, customs records | Vessel tracking, trade flow analysis, inventory monitoring |
| **Report Agent** | All sources | Structured report generation with citations |
| **Alert Agent** | All sources | Proactive monitoring, threshold-based notifications |

---

## Backend Architecture

```
services/
├── api-gateway/           # Kong + AWS API Gateway config
├── auth-service/          # Authentication & authorization
├── chat-service/          # Conversational AI (LangGraph)
├── data-service/          # Structured data API (FastAPI)
├── ingestion-service/     # Data pipeline orchestration
├── alert-service/         # Alerting & notifications
├── report-service/        # Report generation
├── cost-service/          # Cost curve modeling
├── esg-service/           # ESG data & scoring
├── shipping-service/      # AIS & port data
├── ml-service/            # Model serving & inference
└── notification-service/ # Email, Slack, push notifications
```

---

*Document Version: 1.0 | Date: June 2026*
