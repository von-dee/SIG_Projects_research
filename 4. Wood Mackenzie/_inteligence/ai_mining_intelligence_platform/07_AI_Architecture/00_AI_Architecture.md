# AI Architecture

## AI Philosophy
Minerva's AI system is designed around **agentic workflows** — specialized AI agents that collaborate to answer complex questions, monitor conditions, and generate insights. The system is:
- **Grounded**: All outputs cite sources and are traceable to original data
- **Transparent**: Users can see which agents contributed and how conclusions were reached
- **Controllable**: Users can adjust agent behavior, override conclusions, and provide feedback
- **Extensible**: New agents can be added without disrupting existing workflows

## Multi-Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                               │
│  Chat, Dashboard, Alerts, Reports                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                  ORCHESTRATION LAYER                              │
│              LangGraph + LangChain + LangSmith                   │
│  • Intent Classification  • Agent Routing  • State Management    │
│  • Human-in-the-Loop     • Error Recovery  • Citation Tracking │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                   SPECIALIZED AGENTS                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Data Agent  │  │  News Agent  │  │  Cost Agent  │        │
│  │  (SQL/NoSQL) │  │  (NLP/RAG)   │  │  (Financial) │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  ESG Agent   │  │  Ship Agent  │  │ Report Agent │        │
│  │  (Compliance)│  │  (Geospatial)│  │  (Generation)│        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Alert Agent  │  │  Model Agent │  │  Chart Agent │        │
│  │  (Monitoring)│  │  (Forecast)  │  │  (Viz)       │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                   SYNTHESIS LAYER                                   │
│              Claude 3.5 Sonnet / Claude 3 Opus                   │
│  • Answer Generation  • Citation  • Formatting  • Confidence    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Agent Specifications

### 1. Data Agent
**Purpose**: Query structured databases and return precise data
**Tools**:
- SQL generation for PostgreSQL/TimescaleDB
- ClickHouse OLAP queries
- API calls to external data sources
- Time-series aggregation and windowing

**Prompt Strategy**:
```
You are a data analyst specializing in mining and commodities.
Given a user question, generate the appropriate SQL query to retrieve
relevant data from the database. Return results with metadata including
source, last updated timestamp, and data quality score.

Database schema:
- prices (symbol, timestamp, open, high, low, close, volume)
- assets (name, country, commodity, production_2025, c1_cost, reserves)
- companies (name, ticker, market_cap, ev_ebitda)
```

**Example**:
- **Input**: "What was the average C1 cash cost for Chilean copper mines in Q1 2026?"
- **Action**: Generates SQL → queries database → returns $2.34/lb with list of mines
- **Output**: Structured data with chart suggestion

---

### 2. News Agent
**Purpose**: Monitor, analyze, and summarize news and events
**Tools**:
- News API queries
- RSS feed monitoring
- Twitter/X stream analysis
- Sentiment analysis (VADER, FinBERT)
- Named Entity Recognition (spaCy, Hugging Face)
- Event extraction (custom fine-tuned model)

**Capabilities**:
- Real-time event detection (strikes, accidents, policy changes)
- Sentiment scoring (-1 to +1) per article and aggregate
- Entity linking (company → asset → commodity)
- Impact assessment (production, price, ESG)

**Example**:
- **Input**: "Any news about Escondida today?"
- **Action**: Queries 15 news sources → finds 3 articles about labor negotiations
- **Output**: Summarized timeline with sentiment trend and impact assessment

---

### 3. Cost Agent
**Purpose**: Model and analyze mine-level cost structures
**Tools**:
- Financial model templates
- Monte Carlo simulation
- Sensitivity analysis engine
- Peer benchmarking algorithms

**Capabilities**:
- Build cost curves from company filings
- Stress-test with user-defined assumptions
- Compare against historical trends
- Forecast cost inflation (energy, labor, reagents)

**Example**:
- **Input**: "How would a 20% energy price increase affect the global copper cost curve?"
- **Action**: Loads current cost data → applies energy sensitivity → recalculates curve
- **Output**: New cost curve with mines shifting above/below 90th percentile

---

### 4. ESG Agent
**Purpose**: Monitor and analyze ESG risks and compliance
**Tools**:
- ESG incident database queries
- Regulatory text analysis
- Satellite imagery comparison (change detection)
- NGO report parsing
- ESG scoring models

**Capabilities**:
- Real-time ESG incident alerts
- ESG score calculation (customizable frameworks)
- Regulatory compliance gap analysis
- Tailings dam risk assessment
- Community relations monitoring

**Example**:
- **Input**: "What's the ESG risk profile of cobalt mines in the DRC?"
- **Action**: Queries ESG database → analyzes 25 assets → cross-references with NGO reports
- **Output**: Risk matrix with specific incidents, scores, and improvement recommendations

---

### 5. Shipping Agent
**Purpose**: Track commodity flows via vessel movements
**Tools**:
- AIS data API queries
- Port database lookups
- Route optimization algorithms
- Cargo estimation models

**Capabilities**:
- Real-time vessel tracking on interactive map
- Port congestion analysis
- Trade flow estimation by commodity
- Inventory arrival forecasting

**Example**:
- **Input**: "Show me copper concentrate shipments from Chile to China in the last 30 days"
- **Action**: Queries AIS data → filters by commodity, origin, destination
- **Output**: Interactive map with 45 vessels, estimated tonnage, arrival dates

---

### 6. Report Agent
**Purpose**: Generate structured, publication-ready research reports
**Tools**:
- Document templates (Markdown → PDF/PPTX)
- Chart generation (matplotlib, plotly)
- Table formatting
- Citation management

**Capabilities**:
- Multi-section report generation
- Automatic chart and table insertion
- Source citation and bibliography
- Executive summary extraction
- Custom branding and formatting

**Example**:
- **Input**: "Generate a 20-page report on lithium supply chain risks"
- **Action**: Delegates to Data, News, ESG, Cost agents → synthesizes findings
- **Output**: PDF report with charts, tables, citations, and executive summary

---

### 7. Alert Agent
**Purpose**: Proactively monitor conditions and notify users
**Tools**:
- Rule engine (threshold-based alerts)
- ML anomaly detection
- Pattern matching
- User preference profiles

**Capabilities**:
- Price threshold alerts
- Event-based alerts (strikes, accidents, policy changes)
- Anomaly detection (unusual price movements, inventory changes)
- Portfolio-specific alerts
- Custom alert creation via natural language

**Example**:
- **User Setting**: "Alert me when lithium carbonate spot price diverges more than 15% from the 30-day moving average"
- **Action**: Continuous monitoring → detects 18% divergence → sends alert with context
- **Output**: Push notification + email with chart and analysis

---

### 8. Model Agent
**Purpose**: Run predictive models and scenario analyses
**Tools**:
- Time-series forecasting (Prophet, ARIMA, LSTM)
- Monte Carlo simulation
- Regression models
- Scenario templates

**Capabilities**:
- Commodity price forecasting (1-month to 5-year horizons)
- Supply-demand balance modeling
- Scenario stress-testing
- Probabilistic outcome distributions

**Example**:
- **Input**: "What's the probability that copper prices exceed $12,000/t by end of 2026?"
- **Action**: Runs ensemble model → generates probability distribution
- **Output**: "42% probability. Key drivers: Chinese stimulus (60% weight), supply disruptions (25%), USD weakness (15%)."

---

### 9. Chart Agent
**Purpose**: Generate data visualizations on demand
**Tools**:
- Chart specification engine
- D3.js/Plotly code generation
- Image rendering service
- Interactive widget generation

**Capabilities**:
- Generate any chart type from natural language description
- Style matching (corporate branding)
- Export to PNG, SVG, PDF
- Embed in reports and chat responses

**Example**:
- **Input**: "Show me a cost curve for lithium producers with Chinese mines highlighted in red"
- **Action**: Queries cost data → generates interactive chart
- **Output**: Embedded chart with hover details, zoom, and export options

---

## RAG (Retrieval-Augmented Generation) Pipeline

### Document Ingestion
```
Raw Documents → Text Extraction → Chunking → Embedding → Vector Store
     (PDF/HTML)   (PyMuPDF)     (Recursive)  (OpenAI     (Pinecone)
                                   Splitter)   text-embed
                                               -3-large)
```

### Query Flow
```
User Query → Query Expansion → Vector Search → Re-ranking → Context Assembly
                (HyDE)         (Pinecone)    (Cohere)    (Top-K chunks)
                                                              │
                                                              ▼
                                                   LLM Generation
                                                   (Claude 3.5 Sonnet)
                                                              │
                                                              ▼
                                                   Cited Response
```

### Retrieval Strategies
| Strategy | Use Case | Implementation |
|----------|----------|----------------|
| **Dense Retrieval** | Semantic similarity | Pinecone vector search |
| **Sparse Retrieval** | Keyword matching | BM25 on PostgreSQL |
| **Hybrid Retrieval** | Best of both | Reciprocal Rank Fusion (RRF) |
| **Graph Retrieval** | Relationship queries | Neo4j Cypher queries |
| **Structured Retrieval** | Precise data | SQL generation |

---

## LLM Strategy

### Model Selection Matrix
| Task | Primary Model | Fallback | Rationale |
|------|--------------|----------|-----------|
| Complex reasoning | Claude 3 Opus | GPT-4o | Best reasoning, longest context |
| General Q&A | Claude 3.5 Sonnet | Claude 3 Haiku | Speed/cost balance |
| Simple tasks | Claude 3 Haiku | GPT-4o-mini | Cost optimization |
| Embeddings | text-embedding-3-large | Cohere embed | Quality vs. cost |
| Reranking | Cohere Rerank | Custom model | Specialized for ranking |
| Code generation | Claude 3.5 Sonnet | GPT-4o | Best code quality |

### Cost Optimization
- **Caching**: Common queries cached in Redis (30% hit rate target)
- **Prompt compression**: LLMLingua for long context compression
- **Model routing**: Simple queries → cheaper models; complex → premium
- **Batching**: Non-urgent tasks batched for lower per-token costs
- **Fine-tuning**: Custom models for repetitive tasks (cost curve analysis, filing extraction)

### Estimated AI Costs (Monthly)
| Category | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|
| LLM API calls (Claude) | $3,000 | $8,000 | $20,000 |
| Embeddings (OpenAI) | $500 | $1,500 | $4,000 |
| Vector DB (Pinecone) | $500 | $1,500 | $4,000 |
| Fine-tuning & training | $1,000 | $3,000 | $6,000 |
| LangSmith observability | $200 | $500 | $1,000 |
| **Total** | **$5,200** | **$14,500** | **$35,000** |

---

## Evaluation Framework

### Automated Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Response relevance | > 4.0/5.0 | LLM-as-judge evaluation |
| Citation accuracy | > 95% | Manual spot-checks |
| Hallucination rate | < 2% | Fact-checking against sources |
| Latency (p95) | < 5 seconds | End-to-end query time |
| Cost per query | < $0.10 | Average across all queries |

### Human Evaluation
- **Weekly**: 100 random queries reviewed by domain experts
- **Monthly**: User satisfaction survey (NPS target: > 50)
- **Quarterly**: Blind comparison against Wood Mackenzie responses

---

*Document Version: 1.0 | Date: June 2026*
