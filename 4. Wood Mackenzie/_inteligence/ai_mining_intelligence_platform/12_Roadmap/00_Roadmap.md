# Product & Engineering Roadmap

## Roadmap Philosophy
The roadmap is organized into 6-month phases, each with clear milestones, deliverables, and success criteria. Each phase builds on the previous, with early phases focused on validation and later phases on scale and enterprise readiness.

---

## Phase 1: Foundation (Months 1–6)

### Engineering Goals
- Build core data ingestion pipeline (5 primary sources)
- Deploy conversational AI with 3 specialized agents
- Launch web application with basic dashboard
- Establish CI/CD, monitoring, and security baselines

### Key Deliverables
| Deliverable | Owner | Due Date | Success Criteria |
|-------------|-------|----------|------------------|
| Data ingestion pipeline (EDGAR, LME, NewsAPI, USGS, AIS) | Data Eng | M3 | 99% uptime, < 1hr latency |
| PostgreSQL + TimescaleDB schema | Data Eng | M2 | Supports 10M+ rows, < 100ms query time |
| Vector DB (Pinecone) setup | ML Eng | M3 | 100K+ documents indexed |
| Conversational AI (Claude 3.5 Sonnet) | AI Eng | M4 | < 5s response time, > 80% accuracy |
| 3 specialized agents (Data, News, Cost) | AI Eng | M5 | Agent routing > 90% accuracy |
| Web app (Next.js) — chat + dashboard | Frontend | M5 | Lighthouse score > 90 |
| FastAPI backend + auth | Backend | M4 | 99.9% API uptime |
| AWS infrastructure (EKS, RDS, S3) | DevOps | M2 | SOC 2 readiness assessment |

### Product Goals
- Define MVP feature set with design partners
- Build 2 cost curves (copper, lithium)
- Launch basic alert system (5 alert types)
- Onboard 5 design partners

### Team
| Role | Count | Timing |
|------|-------|--------|
| CTO / Founding Engineer | 1 | M0 |
| AI Engineer | 2 | M0, M3 |
| Data Engineer | 1 | M0 |
| Frontend Engineer | 1 | M1 |
| Backend Engineer | 1 | M2 |
| DevOps Engineer | 1 | M3 |
| Product Manager | 1 | M1 |
| Domain Expert (Mining) | 1 | M0 |
| **Total** | **9** | |

### Budget
| Category | Amount |
|----------|--------|
| Salaries (9 FTE × 6 months) | $540K |
| Infrastructure | $30K |
| Data licenses | $50K |
| AI API costs | $15K |
| Tools & software | $10K |
| Marketing | $20K |
| Legal & accounting | $15K |
| **Total** | **$680K** |

### Milestone: MVP Launch (M6)
- 5 design partners actively using the platform
- > 1,000 chat queries processed
- > 90% user satisfaction score
- First paid customer (design partner conversion)

---

## Phase 2: Core Product (Months 7–12)

### Engineering Goals
- Expand to 15+ data sources
- Launch 3 additional agents (ESG, Shipping, Report)
- Build supply-demand model builder
- Launch mobile app (React Native)
- Implement advanced alerting with ML anomaly detection

### Key Deliverables
| Deliverable | Owner | Due Date | Success Criteria |
|-------------|-------|----------|------------------|
| 15+ data sources integrated | Data Eng | M9 | Coverage: copper, lithium, nickel, cobalt |
| ESG Agent (incident tracking, scoring) | AI Eng | M9 | > 500 assets monitored |
| Shipping Agent (AIS + port data) | AI Eng | M10 | Real-time vessel tracking |
| Report Agent (on-demand reports) | AI Eng | M10 | 10-page report in < 5 min |
| Supply-demand model builder | Backend | M10 | 5 commodities, user-adjustable |
| Mobile app (iOS + Android) | Frontend | M11 | Feature parity with web chat |
| Advanced alerting (ML anomaly detection) | AI Eng | M11 | < 5% false positive rate |
| API v1 (REST + GraphQL) | Backend | M11 | 50+ endpoints, documented |

### Product Goals
- Launch Pro tier ($499/mo)
- Launch Team tier ($2,499/mo)
- Build 10 cost curves
- Generate first 100 AI reports
- Achieve 50 paying customers

### Team Additions
| Role | Count | Timing |
|------|-------|--------|
| Senior AI Engineer | 1 | M7 |
| Data Engineer | 1 | M8 |
| Frontend Engineer | 1 | M8 |
| Backend Engineer | 1 | M9 |
| Sales Development Rep (SDR) | 1 | M9 |
| Customer Success Manager | 1 | M10 |
| **New Hires** | **6** | |
| **Total Team** | **15** | |

### Budget
| Category | Amount |
|----------|--------|
| Salaries (15 FTE × 6 months) | $900K |
| Infrastructure | $80K |
| Data licenses | $150K |
| AI API costs | $40K |
| Marketing | $100K |
| Sales | $50K |
| Events | $30K |
| **Total** | **$1.35M** |

### Milestone: Product-Market Fit (M12)
- 50 paying customers
- $500K ARR
- > 40% DAU/MAU ratio
- > 100 NPS score
- 2 case studies published

---

## Phase 3: Scale (Months 13–18)

### Engineering Goals
- Expand to 30+ data sources
- Launch Knowledge Graph Explorer
- Build Scenario Builder
- Implement portfolio integration
- Launch desktop app (Electron)
- Achieve SOC 2 Type II certification

### Key Deliverables
| Deliverable | Owner | Due Date | Success Criteria |
|-------------|-------|----------|------------------|
| 30+ data sources | Data Eng | M15 | 10 commodities covered |
| Knowledge Graph (Neo4j) | Data Eng | M14 | 10K+ entities, 50K+ relationships |
| Scenario Builder | Backend | M15 | 10 templates, Monte Carlo support |
| Portfolio Integration | Backend | M16 | CSV/Excel/API upload, risk dashboard |
| Desktop app (Electron) | Frontend | M16 | Feature parity with web |
| SOC 2 Type II certification | DevOps | M18 | Audit complete, certificate issued |
| Multi-region deployment (EU, APAC) | DevOps | M17 | < 100ms latency globally |
| Advanced analytics (ML forecasting) | AI Eng | M17 | > 70% directional accuracy |

### Product Goals
- Launch Enterprise tier
- White-label options for partners
- On-premise deployment pilot
- 250 paying customers
- Expand to copper, nickel, cobalt, gold

### Team Additions
| Role | Count | Timing |
|------|-------|--------|
| VP Engineering | 1 | M13 |
| Senior Backend Engineer | 1 | M13 |
| ML Engineer | 1 | M14 |
| Enterprise Sales Rep | 2 | M14 |
| Account Executive | 1 | M15 |
| Marketing Manager | 1 | M14 |
| Content Writer | 1 | M15 |
| **New Hires** | **8** | |
| **Total Team** | **23** | |

### Budget
| Category | Amount |
|----------|--------|
| Salaries (23 FTE × 6 months) | $1.38M |
| Infrastructure | $200K |
| Data licenses | $300K |
| AI API costs | $80K |
| Marketing | $200K |
| Sales | $150K |
| Events | $75K |
| SOC 2 audit | $50K |
| **Total** | **$2.435M** |

### Milestone: Scale Validation (M18)
- 250 paying customers
- $12M ARR
- 125% Net Revenue Retention
- 5 enterprise clients
- 10+ API integrations live

---

## Phase 4: Market Leadership (Months 19–24)

### Engineering Goals
- Expand to 50+ data sources
- Launch custom agent builder (enterprise)
- Build industry-specific modules (coal, rare earths)
- Implement advanced NLP (multilingual support)
- Launch marketplace for third-party agents

### Key Deliverables
| Deliverable | Owner | Due Date | Success Criteria |
|-------------|-------|----------|------------------|
| 50+ data sources | Data Eng | M21 | 15 commodities, global coverage |
| Custom agent builder | AI Eng | M22 | Enterprise clients build custom agents |
| Multilingual support (CN, ES, PT, FR) | AI Eng | M21 | > 90% translation accuracy |
| Third-party agent marketplace | Platform | M23 | 10+ third-party agents |
| Advanced ESG module (TCFD, EU Taxonomy) | Product | M22 | Full regulatory compliance tracking |
| Mobile app v2 (offline mode) | Frontend | M22 | Core features work offline |
| Real-time collaboration | Backend | M21 | Multi-user editing, comments |

### Product Goals
- 600+ paying customers
- $35M ARR
- 20 enterprise clients
- International expansion (APAC, LatAm)
- First acquisition (data provider or competitor)

### Team Additions
| Role | Count | Timing |
|------|-------|--------|
| VP Product | 1 | M19 |
| VP Sales | 1 | M19 |
| Data Science Lead | 1 | M19 |
| Solutions Engineer | 2 | M20 |
| Customer Success (Enterprise) | 2 | M20 |
| International Sales (APAC) | 1 | M21 |
| International Sales (LatAm) | 1 | M21 |
| Partnership Manager | 1 | M20 |
| **New Hires** | **10** | |
| **Total Team** | **33** | |

### Budget
| Category | Amount |
|----------|--------|
| Salaries (33 FTE × 6 months) | $1.98M |
| Infrastructure | $400K |
| Data licenses | $500K |
| AI API costs | $150K |
| Marketing | $350K |
| Sales | $300K |
| Events | $150K |
| International expansion | $100K |
| M&A diligence | $100K |
| **Total** | **$4.03M** |

### Milestone: Market Leadership (M24)
- 600+ paying customers
- $35M ARR
- 20 enterprise clients
- 3 international offices
- Industry recognition (awards, media coverage)

---

## Phase 5: Platform Expansion (Months 25–36)

### Long-Term Vision
- Expand beyond mining to oil & gas, agriculture, and energy
- Launch AI-powered trading signals
- Build predictive supply chain risk platform
- Become the "Bloomberg Terminal for Physical Commodities"

### Key Initiatives
| Initiative | Timeline | Investment |
|------------|----------|------------|
| Oil & Gas module | M25–M30 | $2M |
| Agriculture module | M27–M32 | $2M |
| AI Trading Signals (alpha generation) | M28–M33 | $3M |
| Supply Chain Risk Platform | M30–M36 | $4M |
| IPO Preparation | M30–M36 | $1M |

---

## Roadmap Visualization

```
2026                                    2027                                    2028
M1  M2  M3  M4  M5  M6  M7  M8  M9  M10 M11 M12 M13 M14 M15 M16 M17 M18 M19 M20 M21 M22 M23 M24
│───Foundation────────────────────────│───Core Product────────────────────────│───Scale─────────────────────────────│───Market Leadership───────────────────│
│ MVP Launch                          │ PMF Validation                        │ Scale Validation                      │ Market Leadership                     │
│ 5 design partners                     │ 50 customers, $500K ARR                 │ 250 customers, $12M ARR               │ 600 customers, $35M ARR               │
│ 3 agents                            │ 6 agents, mobile app                    │ 9 agents, portfolio integration         │ Custom agents, marketplace              │
│ 5 data sources                      │ 15 data sources                         │ 30 data sources                         │ 50+ data sources                        │
│ Copper, Lithium                     │ + Nickel, Cobalt                        │ + Gold, Rare Earths                     │ + Oil & Gas, Agriculture                │
```

---

## Risk-Adjusted Roadmap

### High-Risk Items & Mitigations
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data source reliability | High | Medium | Multiple redundant sources, fallback pipelines |
| LLM hallucination | High | Medium | RAG grounding, citation requirements, human review |
| Competitive response | Medium | High | Speed to market, differentiation, customer lock-in |
| Talent acquisition | Medium | High | Remote-first, equity-heavy, domain expertise |
| Regulatory changes | Medium | Low | Flexible architecture, legal monitoring |
| Economic downturn | Medium | Medium | Diversified customer base, essential data product |

---

*Document Version: 1.0 | Date: June 2026*
