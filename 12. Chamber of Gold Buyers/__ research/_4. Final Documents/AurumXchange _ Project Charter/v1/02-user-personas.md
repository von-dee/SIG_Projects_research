# Document 2 — User Personas

## Ghana Gold Exchange Platform (AurumX)

**Document Type:** UX Research Artifact
**Persona Set Version:** 1.0
**Related Documents:** Charter §3, §7 · User Success Journeys (Doc 3) · User Flows (Doc 5)

---

## How to Read These Personas

Each persona below is fictional but anchored in real stakeholder archetypes observed in the Ghanaian gold-buying sector. They are deliberately specific — names, ages, frustrations, and quotes — so that engineering, design, and product decisions can be tested against concrete user models rather than abstract "user types." Where a persona implies a feature priority, that implication is listed explicitly so it can be traced to the backlog.

The four personas are:

1. **Kwame Asare** — Tier 1 Buyer (International Refiner Procurement Lead)
2. **Abena Owusu** — Tier 2 Buyer (Licensed Local Exporter)
3. **Ibrahim Toure** — Seller (Licensed Aggregator / Small-Scale Mining Cooperative)
4. **Efua Boateng** — Chamber Compliance Officer (Oversight & Audit)

These personas cover the four highest-impact user types and span the entire trade lifecycle: supply (Ibrahim), institutional demand (Kwame), local demand/export (Abena), and oversight (Efua). Secondary personas — assay lab technicians, vault operators, customs officers, partner bank escrow staff — are described in companion research notes but are out of scope for this document.

---

## Persona 1 — Kwame Asare

### Tier 1 Buyer · International Refiner Procurement Lead

| Attribute | Detail |
|---|---|
| **Name** | Kwame Asare |
| **Avatar description** | Man, early 50s, wearing a charcoal suit with an open-collar shirt, holding a phone showing a gold price chart; serious expression; seated at a desk with two monitors showing Bloomberg and an internal ERP. |
| **Age** | 52 |
| **Job title** | Head of West African Sourcing, **Helvetia Refining AG** (Swiss-based LBMA Good Delivery refiner) [ASSUMPTION: company name is illustrative] |
| **Technical skill level** | High. Daily user of Bloomberg Terminal, SAP ERP, internal trade-management tools; comfortable with APIs and data exports; skeptical of consumer-grade UX. |
| **Industry** | Precious metals refining & bullion trading |
| **Company size** | ~2,400 employees globally; West African sourcing team of 8 |
| **Annual procurement budget** | US$250M–$400M of doré and refined gold |
| **Education** | MBA, London Business School; BSc Metallurgical Engineering, KNUST |

### Goals

- Source 30–50 kg of gold per week from Ghanaian Tier 2 sellers and aggregators at or below the LBMA benchmark, with full provenance documentation for Swiss import compliance.
- Pre-qualify and maintain a vetted panel of 12–15 Ghanaian counterparties whose KYC, licensing, and AML status are continuously validated.
- Reduce per-deal administrative overhead — currently 6–8 hours of compliance paperwork per shipment — to under 1 hour.
- Receive early visibility of large lots (≥ 5 kg, ≥ 99.5% purity) before they hit the open market, with right of first refusal where possible.
- Maintain an audit trail defensible against Swiss FINMA and OECD Due Diligence Guidance reviews.

### Pain Points

- **Counterparty discovery is relationship-bound.** Most deals still happen through WhatsApp and personal phone calls to a handful of trusted aggregators. New sources are risky and slow to vet.
- **Documentation is paper-heavy and error-prone.** Export permits, assay certificates, and bills of lading arrive as PDFs or scanned faxes; reconciliation with internal ERP is manual and error-prone.
- **Provenance gaps create compliance risk.** When a seller cannot produce a clean chain-of-custody from mine of origin to vault, the entire shipment is exposed to OECD Annex II risks (conflict-affected and high-risk areas).
- **Price opacity at the local level.** Kwame's team often cannot tell whether the price quoted by an aggregator reflects a fair local premium or includes undisclosed mark-ups.
- **No early-warning on supply disruptions.** When a major artisanal mining region faces a security incident or regulatory crackdown, Kwame's team learns about it days late, after their logistics chain has already been booked.

### Behaviors

- **Daily routine:** 6:30 AM review of overnight LBMA fix and Asian market open; 7:00 AM call with Accra-based logistics coordinator; rest of day in SAP, email, Bloomberg.
- **Tools used:** Bloomberg Terminal, SAP S/4HANA, Outlook, WhatsApp Business for counterparties, Refinitiv Eikon, Excel for ad-hoc analysis.
- **Decision-making style:** Data-driven, consensus-seeking within his 8-person team but final decision authority for transactions under US$2M; escalates above to Zurich.
- **Mobile behavior:** Heavy email on phone; will not approve a transaction above US$500K from a mobile device. Expects full desktop-class functionality for any trade decision.

### Quote

> "I do not need another marketplace. I need a verified counterparty on the other side of every kilogram, with paper that survives a FINMA audit."

### Product Implications

| Implication | Feature Priority | Owner |
|---|---|---|
| Tier 1 buyers require enhanced due-diligence profiles on every counterparty, refreshed continuously | High — Phase 1: Verified counterparty directory with live license status | Backend · Compliance Eng |
| Right-of-first-offer workflow for large lots | High — Phase 2: Tier 1 pre-notification with optional RFQ exclusivity window | Product · Backend |
| Full provenance chain visible per lot, with hash-anchored documents | High — Phase 2: Lot provenance graph; Phase 3: Assay + vault integration | Backend · ML Eng |
| OECD Annex II red-flag indicator on counterparty profiles | High — Phase 1: AML/risk screening integrated into KYC | Compliance Eng |
| Export-grade document export bundle (PDF + structured JSON) | Medium — Phase 3: One-click compliance export | Backend |
| API access for SAP integration (push purchase orders, pull trade confirmations) | Medium — Phase 2: Tier 1 REST API, scoped OAuth | Platform · Backend |
| Desktop-first UX; mobile is read-only for trade review | High — Phase 1: Responsive PWA, no native app required in Phase 1 | Frontend |
| Price benchmarking widget showing LBMA fix + local premium/discount | Medium — Phase 2: Trading dashboard | Frontend · Data Eng |

---

## Persona 2 — Abena Owusu

### Tier 2 Buyer · Licensed Local Exporter

| Attribute | Detail |
|---|---|
| **Name** | Abena Owusu |
| **Avatar description** | Woman, mid-30s, wearing a smart-casual blouse and blazer, on a phone call while reviewing a shipment manifest on a tablet; expressive, energetic face; standing in a warehouse doorway with sealed boxes visible behind her. |
| **Age** | 34 |
| **Job title** | Managing Director, **GoldLink Exports Ltd.** (Accra-based licensed gold exporter) [ASSUMPTION: company name is illustrative] |
| **Technical skill level** | Medium-High. Power user of Excel, WhatsApp Business, and Google Workspace; comfortable with web apps; limited API literacy; relies on her accountant for ERP. |
| **Industry** | Gold export & aggregation |
| **Company size** | 12 employees (operations, finance, logistics) |
| **Annual export volume** | 80–150 kg/year, primarily to UAE and India |
| **License type** | Minerals Commission Licensed Gold Buyer (PMMC-registered) |
| **Education** | BSc Business Administration, University of Ghana; certificate in commodities trading, GIMPA |

### Goals

- Maintain a steady pipeline of 8–12 kg of gold per week for export, sourced from 4–6 trusted aggregators and small-scale mining cooperatives.
- Reduce the time from "gold in vault" to "export permit approved" from the current 10–14 days to under 5 days.
- Negotiate better margins by accessing multiple competing seller offers rather than relying on her three long-standing aggregator relationships.
- Manage export documentation, customs filings, and PMMC paperwork in one place rather than across five government portals and a folder of scanned PDFs.
- Build a track record that lets her access trade finance from her bank (currently constrained by lack of documented trade history).

### Pain Points

- **Liquidity is unpredictable.** When one of her three aggregator relationships falters (illness, regulatory issue, mine dispute), she has no fast way to find vetted alternatives. She has lost two export contracts due to supply gaps.
- **Documentation is exhausting.** Exporting one shipment requires 7 distinct documents across 4 agencies (PMMC, Minerals Commission, GRA Customs, Bank of Ghana FX approval). Each agency portal has different UX, and some only work in Internet Explorer.
- **Price discovery is opaque.** She often does not know if the price quoted by an aggregator is fair until she has already committed; she has no real-time view of competing Tier 2 buyer demand.
- **Bank credit is hard.** Despite a clean track record, her bank treats her as a "high-risk gold trader" and requires 100% cash collateral for any trade finance. Documentation of past trades is a pile of PDFs the bank will not accept as auditable evidence.
- **Cash flow timing is brutal.** She pays sellers in cash or bank transfer within 48 hours, but buyers (especially overseas) pay on T+7 to T+30 terms. Without escrow, she bears all the settlement risk.

### Behaviors

- **Daily routine:** 7 AM warehouse check; 8 AM–10 AM phone calls with aggregators; 10 AM–2 PM documentation + bank follow-up; 2 PM–5 PM new-buyer outreach; evenings on WhatsApp with international buyers.
- **Tools used:** Excel (master trade ledger), WhatsApp Business, PMMC online portal, GRA portal, Google Drive for documents, two separate bank apps, her accountant's Tally ERP.
- **Decision-making style:** Pragmatic, fast, trust-based; relies heavily on personal relationships and reputation; will pause for a day to validate a new counterparty.
- **Mobile behavior:** 70% of her platform interaction will be mobile. She manages the warehouse from her phone and reviews documents on a tablet.

### Quote

> "If I can move gold from vault to export permit in five days instead of fourteen, I can take three more shipments a month. That is the difference between surviving and growing."

### Product Implications

| Implication | Feature Priority | Owner |
|---|---|---|
| Mobile-first UX for trade review and document management | Critical — Phase 1: PWA with offline-tolerant document capture | Frontend |
| One-stop export documentation workflow integrating PMMC, GRA, BoG | High — Phase 3: Export Documentation VAS module | Backend · Compliance Eng |
| RFQ comparison view showing multiple seller offers side-by-side | High — Phase 2: RFQ engine | Product · Frontend |
| Escrow as the default settlement method, with bank integration | High — Phase 2: Escrow module; bank integration in Phase 3 | Backend · Compliance Eng |
| Trade history export (PDF + structured) for bank trade finance applications | High — Phase 2: Trade ledger export | Backend |
| Bidirectional SMS / WhatsApp notifications (not just email) | Medium — Phase 1: Notification service with Twilio + WhatsApp Business API | Backend |
| Lightweight financial dashboard showing cash flow, escrow balances, and per-shipment P&L | Medium — Phase 3: Member financial dashboard | Frontend · Data Eng |

---

## Persona 3 — Ibrahim Toure

### Seller · Licensed Aggregator / Small-Scale Mining Cooperative

| Attribute | Detail |
|---|---|
| **Name** | Ibrahim Toure |
| **Avatar description** | Man, late 40s, weathered face, wearing a high-visibility vest over a polo shirt, standing next to a sealed metal box of doré bars; phone in one hand, weighbridge ticket in the other; outdoor setting with a small office building behind him. |
| **Age** | 48 |
| **Job title** | General Secretary, **Banda Small-Scale Miners Cooperative** (licensed aggregator, Upper West Region) [ASSUMPTION: name illustrative] |
| **Technical skill level** | Low-Medium. Comfortable with basic smartphone apps (calls, SMS, WhatsApp, mobile money); struggles with complex forms; uses a shared laptop at the cooperative's office for email. |
| **Industry** | Artisanal and small-scale gold mining (ASM) and aggregation |
| **Organization size** | Cooperative of ~140 small-scale miners; ~3 kg/week throughput |
| **License type** | Minerals Commission Small-Scale Mining License + Inter-Regional Gold Buyer Permit |
| **Education** | Secondary school certificate; vocational training in mining safety |

### Goals

- Sell the cooperative's gold at the best available price without traveling to Accra or Tamale for every negotiation.
- Receive payment within 48 hours of delivery — currently, the cooperative waits 5–10 days and has been burned twice by buyer defaults.
- Build a verifiable, auditable record of the cooperative's production and sales to qualify for fair-trade premium certifications and future bank financing.
- Reduce the cooperative's dependence on a single aggregator-middleman who currently takes a 4–6% margin.
- Get proactive alerts when buyer demand spikes, so the cooperative can time sales to favorable market windows.

### Pain Points

- **Logistics are dangerous and expensive.** Transporting 2–3 kg of gold by road from Wa to Accra costs US$800–1,200 for armored transport — a fixed cost that eats margin on small lots.
- **Buyer default risk is real.** Twice in three years, the cooperative has delivered gold and not been paid. Legal recourse is theoretical; the gold is gone.
- **Price discovery is broken.** The cooperative gets a price from one middleman aggregator and has no way to know if it is fair. Sometimes prices are quoted in USD, sometimes in GHS, with FX rates that move against them between quote and settlement.
- **Documentation is hard to maintain.** Production records, miner rosters, and license renewals are paper-based; the cooperative's last license renewal took 11 weeks because of a missing form.
- **No access to finance.** Despite a 4-year clean track record, no bank will advance working capital against future sales, because the cooperative has no auditable trade history.

### Behaviors

- **Weekly routine:** Sunday cooperative meeting; Monday–Wednesday production at sites; Thursday–Friday aggregation, weighing, and sealing; Saturday transport to buyer (every 2 weeks).
- **Tools used:** Feature phone for personal calls, smartphone for WhatsApp and the cooperative's group chat, paper ledgers for production, the cooperative's shared laptop for email and the Minerals Commission portal (when it works).
- **Decision-making style:** Collective — the cooperative's executive committee decides together; secretarial approval needed for sales above 1 kg.
- **Mobile behavior:** 95% mobile. Will not use the desktop experience. Tolerates low-bandwidth connectivity (often on 3G, sometimes EDGE).

### Quote

> "We mine the gold. Someone else sets the price. If this platform lets me see three offers before I sell, and the money is in escrow before the gold leaves my hand, I will use it every week."

### Product Implications

| Implication | Feature Priority | Owner |
|---|---|---|
| Extremely low-bandwidth mobile UX; SMS fallback for critical notifications | Critical — Phase 1: PWA with offline capture + SMS notifications | Frontend · Backend |
| One-tap lot creation with photo + weight capture from phone | High — Phase 2: Mobile lot creation wizard | Frontend · Backend |
| Escrow visible to seller before gold leaves possession | Critical — Phase 2: Escrow status widget prominent in trade flow | Frontend · Backend |
| WhatsApp-based trade confirmations and document delivery | High — Phase 1: WhatsApp Business API integration | Backend |
| Localized pricing display (USD primary, GHS secondary with FX rate source disclosed) | High — Phase 2: Currency display module | Frontend |
| Voice-guided onboarding in English + Twi + Hausa | Medium — Phase 1: Multilingual onboarding with voice prompts | Frontend |
| Group/cooperative account structure with multi-user roles (Secretary, Treasurer, Chairman) | High — Phase 1: Organization accounts with role-based permissions | Backend |
| Production + sales history ledger (immutable) for fair-trade certification | High — Phase 2: Lot provenance chain | Backend · Data Eng |
| Demand-spike alerts via SMS when buyer RFQs target cooperative's region | Medium — Phase 2: AI matching + alerting | ML Eng · Backend |

---

## Persona 4 — Efua Boateng

### Chamber Compliance Officer

| Attribute | Detail |
|---|---|
| **Name** | Efua Boateng |
| **Avatar description** | Woman, mid-40s, wearing a dark blazer and glasses, sitting at a desk with three monitors showing dashboards, an audit log spreadsheet, and a regulatory reference library; calm, focused expression; notebook open beside her. |
| **Age** | 44 |
| **Job title** | Director of Compliance & Member Affairs, **Ghana Chamber of Gold Buyers** |
| **Technical skill level** | High. Former auditor (Big 4); comfortable with BI tools (Tableau, Power BI), SQL for ad-hoc queries, and regulatory reference databases; skeptical of "magic dashboard" promises. |
| **Industry** | Industry association / regulatory compliance |
| **Organization size** | Chamber staff of 18; Efua's team of 3 covers compliance, member onboarding, and dispute resolution |
| **Education** | MSc Forensic Accounting, University of Cape Coast; CA (Ghana); AML certification (ICA) |

### Goals

- Provide the Chamber's Executive Council with monthly compliance health metrics across all member trading activity, with drill-down to specific trades for any flagged anomaly.
- Reduce average time to onboard a new member from the current 4–6 weeks (paper-based) to under 5 business days, without compromising due diligence.
- Detect and investigate suspicious trading patterns (potential money laundering, collusion, price manipulation) within 24 hours of occurrence.
- Maintain an audit trail defensible against Bank of Ghana, Minerals Commission, and FATF mutual-evaluation review.
- Standardize and automate the Chamber's quarterly compliance reporting to government regulators.

### Pain Points

- **No real-time visibility into member trading activity.** Today, the Chamber learns of suspicious trades weeks or months after they occur, from after-the-fact bank filings or whistleblower complaints.
- **Onboarding is paper-bound.** Member license applications arrive as physical folders; verifying a single application involves 4–6 manual cross-checks across PMMC, GRA, and bank registries.
- **Dispute resolution is slow and opaque.** When a trade goes wrong (non-payment, quality dispute, breach of contract), the Chamber mediates manually. There is no shared view of trade facts, only conflicting accounts.
- **Regulatory reporting is a quarterly fire-drill.** Each quarter, Efua's team spends 3 weeks compiling reports across member submissions. Data quality is uneven, and reconciliations frequently surface errors.
| **Audit defensibility is shaky.** When the Chamber's records are audited, gaps in the paper trail create exposure. Efua has personally had to write explanations for missing documents that undermined the Chamber's credibility.

### Behaviors

- **Daily routine:** 7 AM review of overnight regulatory news and sanction list updates; 8 AM team standup; 9 AM–12 PM onboarding reviews and member queries; 1 PM–4 PM investigations and audit prep; 4 PM–5 PM Executive Council briefings.
- **Tools used:** Tableau (compliance dashboards built manually from exports), Excel (master member ledger), SharePoint (document repository), email-heavy, the Chamber's legacy Access-based member database.
- **Decision-making style:** Risk-averse, evidence-driven, requires two independent sources for any finding; will not approve onboarding of a flagged entity without executive sign-off.
- **Mobile behavior:** Tablet for review of dashboards and approval queues; will not perform investigations on a phone.

### Quote

> "I am not asking for magic. I am asking for one source of truth, with timestamps, that I can hand to a Bank of Ghana examiner at 9 AM on a Monday."

### Product Implications

| Implication | Feature Priority | Owner |
|---|---|---|
| Real-time compliance dashboard with drill-down from aggregate to individual trade | High — Phase 1 (member view) → Phase 4 (full trade view) | Frontend · Data Eng |
| Workflow engine for member onboarding with parallel cross-checks (PMMC, GRA, bank) | High — Phase 1: Onboarding workflow module | Backend · Compliance Eng |
| Sanction list screening integrated with daily refresh (OFAC, EU, UN, Ghana MoF list) | Critical — Phase 1: AML screening service | Compliance Eng |
| Anomaly detection with explainable alerts (rule-based + ML) | High — Phase 2: Fraud detection rules; Phase 4: ML model | ML Eng · Compliance Eng |
| Immutable audit log with hash-anchored records (legal defensibility) | Critical — Phase 1: Append-only audit log backed by hash chain | Backend |
| Dispute resolution module with shared trade fact view | Medium — Phase 3: Dispute workflow | Product · Backend |
| Automated quarterly regulatory report generation (BoG, MinCom, GRA) | High — Phase 4: Regulatory reporting module | Data Eng · Backend |
| Role-based access: Efua and her team see all trades; members see only their own | Critical — Phase 1: RBAC implementation | Backend · Security Eng |

---

## Persona Summary Matrix

| Dimension | Kwame Asare (Tier 1) | Abena Owusu (Tier 2) | Ibrahim Toure (Seller) | Efua Boateng (Compliance) |
|---|---|---|---|---|
| **Primary device** | Desktop (dual monitor) | Tablet + phone | Smartphone (low-end) | Desktop + tablet |
| **Connectivity** | High bandwidth | Medium | Low/intermittent (3G/EDGE) | High bandwidth |
| **Session length** | Long (deep work) | Medium (bursty) | Short (transactional) | Long (analytical) |
| **Tolerance for friction** | Low (expects enterprise-grade) | Medium (will tolerate if valuable) | Very low (will abandon) | Medium (will work around) |
| **Primary value sought** | Verified counterparties + provenance | Speed + liquidity + escrow | Price discovery + payment security | Oversight + audit defensibility |
| **Phase 1 critical features** | Verified counterparty directory | Mobile member portal | WhatsApp + SMS notifications | Compliance dashboard + audit log |
| **Phase 2 critical features** | Right-of-first-offer workflow | RFQ comparison + escrow | Mobile lot creation + escrow status | Anomaly detection |
| **Phase 3 critical features** | Provenance + document bundle | Export documentation VAS | Cooperative ledger | Dispute module |
| **Phase 4 critical features** | API access for ERP integration | Financial dashboard | Demand-spike alerts | Regulatory reporting |

---

## Cross-References

- **Document 1 — Project Charter:** §3.2 SMART objectives and §10 KPIs are derived from these personas' success definitions.
- **Document 3 — User Success Journeys:** Each persona's critical goal is mapped as a journey in the next document.
- **Document 5 — User Flows & System Flows:** RFQ, Auction, Escrow, and Onboarding flows are designed around Kwame, Abena, and Ibrahim's needs.
- **Document 4 — System Architecture:** The compliance officer persona directly drives the design of the audit log, RBAC, and AML screening subsystems.
