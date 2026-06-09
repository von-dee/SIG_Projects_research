# Product Features

## Core Feature Modules

### 1. Conversational Intelligence ("Ask Minerva")
**Description**: Natural language interface for querying all platform data
**Key Capabilities**:
- Multi-turn conversations with context memory
- Multi-modal responses (text, charts, tables, maps)
- Source citation with clickable links
- Confidence scoring for each answer
- Follow-up suggestions based on query patterns

**User Flow**:
1. User types or speaks a question
2. Intent classifier routes to appropriate agents
3. Agents retrieve and process data
4. Synthesis agent generates response with citations
5. User can drill down, ask follow-ups, or export results

**Supported Query Types**:
- **Factual**: "What was Chile's copper production in 2025?"
- **Analytical**: "How does Escondida's C1 cost compare to the global median?"
- **Predictive**: "What's the probability of lithium prices exceeding $20K/t by Q4?"
- **Comparative**: "Compare the ESG profiles of BHP, Rio Tinto, and Vale"
- **Procedural**: "Generate a board presentation on copper market outlook"
- **Alert**: "Alert me when LME copper inventory drops below 100Kt"

---

### 2. Real-Time Market Dashboard
**Description**: Customizable dashboard for market monitoring
**Key Capabilities**:
- Live price tickers (LME, CME, SHFE, spot)
- Price charts with technical indicators
- News feed with sentiment scoring
- Inventory levels (LME, SHFE, COMEX)
- Forward curves and spreads
- Currency and macro indicators

**Widgets**:
- Price chart (candlestick, line, area)
- News ticker with sentiment
- Inventory gauge
- Cost curve snapshot
- Supply-demand balance meter
- ESG risk indicator

---

### 3. Cost Curve Explorer
**Description**: Interactive, stress-testable cost curve modeling
**Key Capabilities**:
- Global cost curves for 10+ commodities
- 150+ mines per commodity with detailed cost breakdowns
- Real-time recalculation with assumption toggles
- Peer comparison and benchmarking
- Historical trend analysis
- Export to Excel/PowerPoint

**Assumption Controls**:
- Energy prices (oil, gas, electricity)
- Labor inflation rates
- FX rates (USD, local currency)
- Reagent prices
- Carbon pricing
- Royalty and tax regimes

---

### 4. Supply-Demand Model Builder
**Description**: Build and customize supply-demand balances
**Key Capabilities**:
- Pre-built models for 15+ commodities
- 80+ producing assets, 40+ development projects
- Demand drivers (EV sales, grid storage, stainless steel, etc.)
- Scenario modeling (base, bull, bear)
- Sensitivity analysis
- Probability distributions
- Export to Excel with formulas

**Model Components**:
- Supply: Mine production, recycling, inventory drawdown
- Demand: End-use sectors, regional breakdowns
- Balance: Surplus/deficit with price elasticity
- Price forecast: Statistical models + AI predictions

---

### 5. ESG Intelligence Hub
**Description**: Comprehensive ESG monitoring and analysis
**Key Capabilities**:
- ESG incident tracking across 2,000+ assets
- Customizable ESG scoring frameworks
- Regulatory compliance tracking (EU Taxonomy, SEC, TCFD)
- Tailings dam risk assessment
- Community relations monitoring
- Carbon footprint tracking
- Peer benchmarking

**ESG Frameworks Supported**:
- MSCI ESG Ratings
- Sustainalytics
- GRI Standards
- SASB
- TCFD
- CDP
- Custom user-defined frameworks

---

### 6. Shipping & Trade Flow Tracker
**Description**: Real-time vessel tracking and trade flow analysis
**Key Capabilities**:
- Interactive map with 200,000+ vessel positions
- Filter by commodity, origin, destination, vessel type
- Port congestion indicators
- Estimated arrival times
- Cargo type inference
- Trade flow statistics by route

**Data Layers**:
- AIS positions (real-time)
- Port data (berthing, loading, discharge)
- Customs records (where available)
- Commodity-specific routes
- Historical trade flow trends

---

### 7. Alert Center
**Description**: Proactive, intelligent alerting system
**Key Capabilities**:
- Natural language alert creation
- Multi-channel delivery (in-app, email, Slack, SMS)
- Priority scoring and noise reduction
- Alert correlation (group related events)
- Escalation rules
- Alert history and analytics

**Alert Types**:
- **Price alerts**: Threshold, percentage change, technical indicators
- **Event alerts**: News, filings, incidents, regulatory changes
- **Anomaly alerts**: Unusual price movements, inventory changes, shipping patterns
- **Portfolio alerts**: Position-level risk indicators
- **Custom alerts**: User-defined conditions via natural language

---

### 8. Report Generator
**Description**: On-demand AI-generated research reports
**Key Capabilities**:
- Natural language report specification
- Multi-section structure with automatic content generation
- Chart and table auto-generation
- Citation management
- Custom branding and templates
- Export to PDF, PowerPoint, Word

**Report Templates**:
- Market outlook (commodity + timeframe)
- Company deep-dive
- ESG assessment
- M&A target analysis
- Investment thesis
- Board presentation
- Regulatory compliance report

---

### 9. Portfolio Integration
**Description**: Connect internal portfolio data with public intelligence
**Key Capabilities**:
- Upload portfolio holdings (CSV, Excel, API)
- Automatic asset mapping to public data
- Portfolio-level risk dashboard
- Benchmarking against industry data
- Scenario stress-testing
- Custom alert rules per portfolio

**Supported Integrations**:
- CSV/Excel upload
- Bloomberg Portfolio API
- FactSet API
- Internal API (custom)
- Manual entry

---

### 10. Knowledge Graph Explorer
**Description**: Visual exploration of mining industry relationships
**Key Capabilities**:
- Interactive network graph
- Entity types: companies, assets, people, commodities, countries
- Relationship types: owns, operates, produces, competes with, supplies
- Path finding (e.g., "How is Company A connected to Commodity B?")
- Influence analysis
- M&A relationship mapping

**Use Cases**:
- Understand supply chain relationships
- Identify hidden connections between companies
- Track ownership changes
- Map geopolitical risk exposure

---

### 11. Scenario Builder
**Description**: Create and run custom market scenarios
**Key Capabilities**:
- Pre-built scenario templates (China hard landing, supply disruption, etc.)
- Custom variable definition
- Monte Carlo simulation
- Probability-weighted outcomes
- Portfolio impact analysis
- Sensitivity tornado charts

**Scenario Variables**:
- Commodity prices
- Demand growth rates
- Supply disruptions
- Currency movements
- Policy changes
- ESG events

---

### 12. API & Developer Platform
**Description**: Programmatic access to all platform data and capabilities
**Key Capabilities**:
- REST API for all data endpoints
- GraphQL for flexible queries
- WebSocket for real-time streaming
- Webhook subscriptions for events
- SDKs (Python, JavaScript, R)
- Comprehensive documentation

**API Endpoints**:
- `/prices` — Historical and real-time prices
- `/assets` — Mine-level data
- `/companies` — Company profiles and financials
- `/news` — News articles with sentiment
- `/cost-curves` — Cost curve data
- `/supply-demand` — Supply-demand models
- `/esg` — ESG scores and incidents
- `/shipping` — Vessel tracking and trade flows
- `/chat` — Conversational AI queries
- `/reports` — Report generation
- `/alerts` — Alert management

---

## Feature Roadmap

### Phase 1: MVP (Months 1–6)
- [ ] Conversational Intelligence (basic)
- [ ] Real-time Market Dashboard
- [ ] Cost Curve Explorer (copper, lithium)
- [ ] Alert Center (basic)
- [ ] Report Generator (basic)

### Phase 2: Core (Months 6–12)
- [ ] Supply-Demand Model Builder
- [ ] ESG Intelligence Hub
- [ ] Shipping & Trade Flow Tracker
- [ ] Portfolio Integration
- [ ] Advanced Alerting

### Phase 3: Scale (Months 12–18)
- [ ] Knowledge Graph Explorer
- [ ] Scenario Builder
- [ ] API & Developer Platform
- [ ] Mobile app
- [ ] Desktop app

### Phase 4: Enterprise (Months 18–24)
- [ ] White-label options
- [ ] On-premise deployment
- [ ] Advanced analytics (ML forecasting)
- [ ] Custom agent development
- [ ] Industry-specific modules

---

*Document Version: 1.0 | Date: June 2026*
