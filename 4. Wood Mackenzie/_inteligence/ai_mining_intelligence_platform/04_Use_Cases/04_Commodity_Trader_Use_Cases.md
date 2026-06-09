# Use Cases: Commodity Trader (James O'Brien)

## UC-TR-001: Real-Time Shipping Flow Intelligence
**Trigger**: Jimmy needs to know where copper concentrate cargoes are heading.
**Flow**:
1. Jimmy opens the "Shipping Tracker" module.
2. Interactive map shows real-time AIS positions of 200+ bulk carriers carrying copper concentrate.
3. He filters by origin (Chile, Peru, Indonesia), destination (China, Europe), and cargo type.
4. He identifies 3 vessels diverting from China to India — potential demand shift.
5. He sets an alert: *"Notify me when any vessel from Chile changes destination to India."*

**Success Criteria**: Shipping data updated every 15 minutes; alert latency < 1 hour from route change.

---

## UC-TR-002: Inventory Level Monitoring
**Trigger**: Jimmy needs to track LME and SHFE copper warehouse inventories.
**Flow**:
1. Jimmy opens "Inventory Monitor" and selects "Copper — Global Warehouses."
2. Real-time dashboard shows: LME (rotterdam, New Orleans, Busan), SHFE, COMEX inventory levels with 30-day trends.
3. AI-generated insight: *"LME copper inventories down 12% in 7 days. Fastest decline since March 2025. Likely drivers: Chinese restocking, Chilean supply constraints."*
4. He correlates inventory changes with price movements and forward curves.
5. He exports the data to his trading system via API.

**Success Criteria**: Inventory data updated daily; trend analysis with causal attribution generated automatically.

---

## UC-TR-003: News-Price Correlation Analysis
**Trigger**: Nickel spikes 5% in 30 minutes. Jimmy needs to know if it's noise or signal.
**Flow**:
1. Jimmy gets a push alert: *"Nickel +5% in 30 min. Correlated events: (1) Indonesian export ban rumors, (2) Russian Norilsk production cut, (3) Large options expiry."*
2. He opens the event correlation view: news timeline, order flow data, social sentiment, options positioning.
3. AI assessment: *"60% probability of sustained move. Key risk: ban rumors unconfirmed. Recommend: wait for confirmation before adding size."*
4. He sets a conditional order based on the analysis.

**Success Criteria**: Event correlation completed in < 5 minutes; includes probability assessment and trading recommendation.

---

## UC-TR-004: Arbitrage Opportunity Detection
**Trigger**: Jimmy is looking for copper arbitrage between LME and SHFE.
**Flow**:
1. Jimmy opens "Arbitrage Monitor" for copper.
2. Platform shows: LME cash vs. SHFE front month, adjusted for FX, freight, and duties.
3. AI identifies: *"Arbitrage window open: $85/t spread vs. $45/t historical average. Window likely closes in 2–3 days."*
4. He views the trade structure: buy LME, sell SHFE, logistics requirements, capital needed.
5. He executes via his trading system or saves for later review.

**Success Criteria**: Arbitrage opportunities identified in real time; includes execution logistics and risk factors.

---

## UC-TR-005: Supply Disruption Early Warning
**Trigger**: A tropical storm is forming near key mining regions.
**Flow**:
1. Minerva's weather agent detects a Category 3 cyclone forming near Queensland, Australia.
2. Cross-references with coal and bauxite mine locations in the path.
3. Alert to Jimmy: *"Cyclone forming — 4 coal mines and 2 bauxite operations in potential impact zone. Estimated production at risk: 2.5Mt coal, 800Kt bauxite. Historical precedent: Cyclone Debbie (2017) — 15-day shutdown, $1.2B impact."*
4. Jimmy assesses position exposure and decides to add coal calls.

**Success Criteria**: Weather-based supply risk alert delivered < 6 hours before impact; includes historical precedent and quantified risk.

---

## UC-TR-006: Counterparty Risk Assessment
**Trigger**: Jimmy is negotiating a $50M copper concentrate offtake with a new counterparty.
**Flow**:
1. Jimmy opens "Counterparty Intelligence" and searches the company.
2. Platform shows: financial health (credit rating, recent filings), operational track record, ESG incidents, legal disputes, parent company exposure.
3. AI-generated risk score: 72/100 (moderate risk). Key concerns: (1) recent debt restructuring, (2) labor dispute at flagship asset, (3) limited trading history.
4. Jimmy uses this data to negotiate payment terms and credit limits.

**Success Criteria**: Counterparty assessment completed in < 10 minutes; includes quantified risk score and specific concerns.

---

*Document Version: 1.0 | Date: June 2026*
