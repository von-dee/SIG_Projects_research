# User Flow: From Data to Decision

## The 35-Minute Workflow

The geologist's workflow transforms from weeks to approximately 35 minutes:

### Step 1: Data Onboarding (~15 minutes)

**User actions:**
1. Upload drill logs (LAS, CSV, DHDB)
2. Ingest seismic volumes (SEGY)
3. Load satellite imagery (Sentinel-2, SAR)
4. Import historical reports (PDF)
5. Connect geochemical database

**Platform automation:**
- Auto-extract lithology, assays, RQD from drill logs
- Auto-interpret horizons, faults, velocity from seismic
- Auto-classify alteration zones from satellite imagery
- GeoGPT extracts entities and relations from PDF reports
- Auto-flag geochemical anomalies and correlations

**Output:** Unified Knowledge Graph + Normalized Feature Database

**Technology:** GeoGPT Reader & Extractor + Multimodal Ingestion

**Time savings:** ~15 minutes vs. 2-3 days manual

---

### Step 2: Natural Language Query (<30 seconds)

**User query:**
> "Show me all zones with alteration signatures similar to the Mingomba deposit"

**Platform processing:**
1. Parse intent using GeoGPT-R1-Preview
2. Retrieve similar EO patterns from Earth Foundation Model
3. Cross-reference with drill data, geochemistry, structural geology
4. Generate ranked prospectivity map with confidence intervals

**Output:** Ranked prospectivity map + supporting evidence chain

**Technology:** MineAgent / RingMo-Agent + GeoGPT-R1-Preview

**Time savings:** <30 seconds vs. weeks of manual interpretation

---

### Step 3: 3D Subsurface Generation (~2-3 minutes)

**User query:**
> "Generate 100 probabilistic realizations of the ore body from drill data"

**Platform processing:**
1. Diffusion model (KADM) generates facies realizations
2. Each realization conditioned on hard data (well logs) + seismic constraints
3. Physics alignment ensures all realizations obey Darcy flow and stress equations
4. Uncertainty quantification: P10, P50, P90 volumes automatically computed

**Output:** 100 geologically plausible 3D realizations + uncertainty envelope

**Technology:** Knowledge-Aligned Diffusion Model (KADM) + PINN Physics Constraints

**Time savings:** ~2-3 minutes vs. hours/days in Leapfrog/Surpac

---

### Step 4: Spatial Relationship Modeling (~5 minutes)

**User query:**
> "Model the structural controls on mineralization in this district"

**Platform processing:**
1. GNN (ADGCN/KDCGAT) builds graph of rock units, faults, veins, contacts
2. Attention mechanism identifies long-distance geological relationships
3. Integrates fracture structures + remote sensing alteration + geochemical anomalies
4. Delineates Class A/B prospecting targets with 85.9% accuracy

**Output:** Graph topology model + target delineation with spatial reasoning

**Technology:** Attention-Driven Graph Convolutional Network (ADGCN)

**Time savings:** ~5 minutes vs. weeks of structural analysis

---

### Step 5: Real-Time Simulation (<1 second)

**User query:**
> "What happens to pore pressure if we mine the eastern extension?"

**Platform processing:**
1. PINN surrogate model solves groundwater flow PDEs in <1 second
2. Stress redistribution computed with embedded Hooke's law constraints
3. Blast outcome predictions with physics-informed constraints
4. Monte Carlo sampling over boundary condition uncertainty space

**Output:** Real-time stress/flow fields + 95% confidence intervals

**Technology:** Physics-Informed Neural Networks (PINNs) + Surrogate Modeling

**Time savings:** <1 second per scenario vs. hours for FEM

---

### Step 6: Explainability & Validation (~2 minutes)

**User query:**
> "Why did the model flag this zone as high prospectivity?"

**Platform processing:**
1. SHAP values show contribution of each geological feature
2. Attention maps highlight which drill holes influenced the prediction
3. Constitutive relation checks verify PINN predictions obey physical laws
4. Full audit trail generated for JORC/NI 43-101 compliance

**Output:** Explainable prediction report + regulatory compliance documentation

**Technology:** SHAP + Attention Visualization + Constitutive Error Monitoring

**Time savings:** ~2 minutes vs. days of manual documentation

---

### Step 7: Decision & Export (~10 minutes)

**User actions:**
1. Review all outputs: 3D model, simulations, explanations, targets
2. Platform suggests optimal drill locations based on information gain theory
3. Export to legacy formats: Surpac STR, Leapfrog LFD, Vulcan TRI
4. Generate JORC-compliant resource report with AI-assisted drafting
5. Semi-supervised learning updates model as new data arrives

**Output:** Production-ready models + reports + updated training data

**Technology:** Transfer Learning + Legacy API Bridges + GeoGPT Report Generation

**Time savings:** ~10 minutes vs. days of report writing

---

## Total Workflow Comparison

| Metric | Traditional Workflow | Convergence Platform | Improvement |
|--------|---------------------|---------------------|-------------|
| **Total time** | 2-4 weeks | ~35 minutes | **~100x speedup** |
| **Models produced** | 1 deterministic | 100 probabilistic | **100x coverage** |
| **Uncertainty** | Subjective, manual | Automated, objective | **Quality transformation** |
| **Regulatory docs** | Days of writing | Auto-generated + human review | **10x faster** |
| **Scenario testing** | 3-4 scenarios | 500+ scenarios | **100x exploration** |
| **Cost** | $50K-200K per study | $5K-20K per study | **80% reduction** |

## User Personas

### Junior Geologist (1-5 years experience)
- Uses natural language queries extensively
- Relies on AI explanations to learn geological reasoning
- Validates AI outputs against field observations
- **Benefit**: Access to expert-level reasoning without decades of experience

### Senior Geologist (10+ years experience)
- Uses AI for rapid scenario exploration
- Validates and refines AI predictions
- Focuses on novel insights AI might miss
- **Benefit**: 10x productivity, more time for creative problem-solving

### Resource Geologist (JORC/NI 43-101 focus)
- Uses XAI dashboard for every prediction
- Generates regulatory reports with AI assistance
- Maintains human oversight and sign-off
- **Benefit**: Faster reporting, stronger audit trail, reduced regulatory risk

### Mine Planner (Operations focus)
- Uses real-time simulation for operational decisions
- Tests multiple scenarios before committing
- Integrates AI predictions with scheduling software
- **Benefit**: Better operational decisions, reduced risk, optimized sequencing

### Exploration Manager (Strategic focus)
- Uses prospectivity maps for portfolio prioritization
- Evaluates multiple targets simultaneously
- Tracks AI model performance across projects
- **Benefit**: Better capital allocation, faster discovery, competitive advantage

## Interface Design Principles

### Natural Language Interface
```
┌─────────────────────────────────────────────────────────────┐
│  Ask Geo-AI anything about your geology...                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ > Show me all zones with alteration signatures      │   │
│  │   similar to the Mingomba deposit                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  [Query] [Voice Input] [Visual Query] [Template]            │
│                                                             │
│  Suggested queries:                                         │
│  - "Generate 100 realizations of the ore body"            │
│  - "What is the probability of copper > 0.5% at 500m?"    │
│  - "Explain why Zone A is flagged as high prospectivity"  │
│  - "Compare this deposit to Olympic Dam"                  │
└─────────────────────────────────────────────────────────────┘
```

### 3D Visualization Interface
```
┌─────────────────────────────────────────────────────────────┐
│  [3D View] [Plan View] [Section View] [Time Series]        │
│                                                             │
│     ┌─────────────────────────┐                            │
│    /   ╔═══════════════╗      \                           │
│   /    ║  Ore Body     ║       \    P50 Model             │
│  /     ║  (probability  ║        \                         │
│  │     ║   envelope)   ║        │                         │
│  │     ╚═══════════════╝        │   Uncertainty:          │
│  │    /               \         │   P10: 12.5 Mt          │
│  │   /                 \        │   P50: 18.3 Mt          │
│  │  /                   \       │   P90: 24.1 Mt          │
│   \ /                     \  /                            │
│    └─────────────────────────┘                             │
│                                                             │
│  [Play Animation] [Export] [Cross-Section] [Query Point]  │
│  Layer: [Facies ▼] [Grade ▼] [Uncertainty ▼]              │
│  Realization: [1 / 100] [Prev] [Next] [Animate]            │
└─────────────────────────────────────────────────────────────┘
```

### XAI Dashboard Interface
```
┌─────────────────────────────────────────────────────────────┐
│  EXPLAINABILITY: Zone A Prospectivity = 0.87                │
├─────────────────────────────────────────────────────────────┤
│  FEATURE IMPORTANCE                    DATA INFLUENCE        │
│  ┌─────────────────────────────┐    ┌───────────────────┐ │
│  │ Proximity to fault    +0.22 │    │ [Map with drill    │ │
│  │ Potassic alteration   +0.18 │    │  holes highlighted │ │
│  │ Magnetic high         +0.15 │    │  by influence]     │ │
│  │ Cu geochem anomaly    +0.12 │    │                    │ │
│  │ Intrusion < 2km       +0.09 │    │ DH-045: 35%        │ │
│  │ Sedimentary host     -0.03 │    │ DH-032: 28%        │ │
│  └─────────────────────────────┘    └───────────────────┘ │
│                                                             │
│  PHYSICS COMPLIANCE              COUNTERFACTUALS            │
│  ✓ Hooke's law satisfied        What if 5km from fault?   │
│  ✓ Darcy's law satisfied        → Prospectivity: 0.42      │
│  ✓ Mass conservation            What if phyllic alteration?│
│  ⚠ Stress gradient near fault     → Prospectivity: 0.61    │
│                                                             │
│  [Export Report] [Request Review] [Flag for Retraining]     │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling and Edge Cases

### Low-Confidence Predictions
- **Detection**: Model outputs confidence < 0.6
- **Action**: Flag for human review, suggest additional data collection
- **Message**: "Low confidence prediction — consider additional drilling in this area"

### Physics Violations
- **Detection**: Constitutive relation check fails
- **Action**: Reject prediction, increase uncertainty bounds, alert user
- **Message**: "Physics violation detected — prediction may be unreliable near fault zone"

### Data Quality Issues
- **Detection**: Outlier flag, missing data, inconsistent measurements
- **Action**: Flag affected predictions, suggest data validation
- **Message**: "Data quality warning: 3 drill holes have anomalous assays — verify before using"

### Novel Geology
- **Detection**: Model uncertainty exceeds threshold, no similar training examples
- **Action**: Suggest transfer learning or active learning
- **Message**: "Novel geological setting detected — model may not generalize. Consider fine-tuning."

## References

- Convergence platform user flow from original research synthesis.
- Zhejiang Lab. GeoGPT natural language interface design. 2025.
- KADM Framework. Probabilistic subsurface generation workflow. 2025.
