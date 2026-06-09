# Use Cases: Commodity Analyst (Sarah Chen)

## UC-AN-001: Ad-Hoc Research Query
**Trigger**: Sarah needs to answer a PM's question during a morning meeting.
**Flow**:
1. Sarah opens Minerva chat and types: *"What's the 5-year copper supply outlook given current Chilean water stress and Chinese smelter capacity?"*
2. The AI agent queries structured databases (USGS, company filings, water stress indices) and unstructured sources (news, analyst notes).
3. A synthesized answer is generated with citations, charts, and confidence scores.
4. Sarah can drill down: *"Show me the specific mines affected by water stress"* or *"What was the Chinese smelter utilization rate last month?"*
5. She exports the response as a slide for her morning note.

**Success Criteria**: Answer generated in < 2 minutes with > 90% citation coverage.

---

## UC-AN-002: Cost Curve Benchmarking
**Trigger**: Sarah needs to update her copper cost curve model.
**Flow**:
1. Sarah navigates to the "Cost Curves" module and selects "Copper — C1 Cash Costs — 2026."
2. The platform displays an interactive cost curve with 150+ mines, color-coded by region and ownership.
3. She toggles assumptions: energy prices, labor inflation, FX rates.
4. The curve recalculates in real time. She identifies which mines move above/below the 90th percentile.
5. She downloads the data as CSV or exports a chart to PowerPoint.

**Success Criteria**: Cost curve updated with latest data in < 5 minutes; stress-testable with user-defined assumptions.

---

## UC-AN-003: Proactive Alert on Supply Disruption
**Trigger**: A labor strike begins at Escondida copper mine in Chile.
**Flow**:
1. Minerva's news monitoring agent detects the strike from 15+ news sources within 15 minutes.
2. The event correlation agent cross-references with Escondida's production data (1.2M tpa copper).
3. An alert is sent to Sarah: *"Labor strike at Escondida (BHP) — 1.2M tpa at risk. Estimated impact: 5,000 tpd. Alternative supply: Los Bronces, El Teniente."*
4. Sarah clicks through to a pre-generated scenario analysis showing price impact models.
5. She shares the alert with her PM via Slack integration.

**Success Criteria**: Alert delivered < 15 minutes from event; includes impact quantification and alternatives.

---

## UC-AN-004: Supply-Demand Model Building
**Trigger**: Sarah needs to build a lithium supply-demand model for a client presentation.
**Flow**:
1. Sarah opens the "Model Builder" and selects "Lithium Carbonate — 2026–2030."
2. The platform pre-populates with data from 80+ producing assets, 40+ projects in development, and demand forecasts from EV sales data.
3. She adjusts assumptions: EV penetration rates, battery chemistry shifts, recycling rates.
4. The model recalculates and shows surplus/deficit scenarios with probability distributions.
5. She exports the model to Excel with formulas intact for further customization.

**Success Criteria**: Model built in < 30 minutes vs. 2 weeks manually; assumptions fully transparent and adjustable.

---

## UC-AN-005: Competitor Intelligence Tracking
**Trigger**: Sarah wants to track what her competitors (other funds) are saying about nickel.
**Flow**:
1. Sarah sets up a "Competitor Watch" for nickel, specifying 10 peer funds.
2. Minerva's agent monitors public filings (13F, fund letters), conference transcripts, and social media.
3. Weekly digest: *"3 funds increased nickel exposure this quarter. Key thesis: Indonesian supply constraints."*
4. She drills into specific holdings and position changes.

**Success Criteria**: Competitor intelligence updated weekly with > 80% coverage of public disclosures.

---

## UC-AN-006: Report Generation On Demand
**Trigger**: Sarah's PM asks for a deep-dive report on cobalt supply chain risks.
**Flow**:
1. Sarah opens "Report Generator" and inputs: *"Cobalt supply chain risks — DRC concentration, artisanal mining, battery chemistry shifts — 20 pages."*
2. The AI agent gathers data, runs analysis, generates charts, and writes the report.
3. Report includes: executive summary, supply map, risk matrix, scenario analysis, recommendations.
4. Sarah reviews, edits, and exports as PDF or PowerPoint.
5. The report is automatically saved to her team's shared workspace.

**Success Criteria**: First draft generated in < 10 minutes; publication-ready in < 2 hours.

---

## UC-AN-007: Internal Model Benchmarking
**Trigger**: Sarah wants to compare her fund's copper price forecast with industry consensus.
**Flow**:
1. Sarah uploads her internal copper price forecast (Excel) to Minerva.
2. The platform extracts her assumptions and compares them with consensus forecasts from 20+ sources.
3. Visualization shows where her forecast diverges and why.
4. She identifies key assumption differences (e.g., Chinese demand growth 3.5% vs. consensus 2.8%).

**Success Criteria**: Benchmarking completed in < 5 minutes; divergence analysis with root-cause identification.

---

*Document Version: 1.0 | Date: June 2026*
