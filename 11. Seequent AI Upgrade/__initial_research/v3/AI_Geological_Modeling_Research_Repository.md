# AI in Geological Modeling: Research Repository Expansion Guide

> **Status:** Living Document | **Last Updated:** 2026-05-22 | **Version:** 1.0
> 
> This repository documents the most valuable additions to advance AI-driven geological modeling research, organized by category. Each section contains actionable research directions, known data points, and open questions.

---

## Table of Contents

1. [🔬 Technical Deep-Dives](#-technical-deep-dives)
2. [🏭 Industry & Market Intelligence](#-industry--market-intelligence)
3. [💰 Business & Strategy](#-business--strategy)
4. [🧪 Validation & Evidence](#-validation--evidence)
5. [🌍 Domain-Specific Extensions](#-domain-specific-extensions)
6. [🔗 Integration & Ecosystem](#-integration--ecosystem)
7. [📊 Visual & Interactive Assets](#-visual--interactive-assets)
8. [🎯 Priority Roadmap](#-priority-roadmap)

---

## 🔬 Technical Deep-Dives

### 1.1 Computational Benchmarks

**Current Gap:** Most performance claims in the literature are theoretical or derived from small-scale experiments. Production-scale GPU memory footprints, training times, and inference latencies are rarely reported.

**Required Benchmarks:**

| Technology | Metric | Current State | Target |
|-----------|--------|---------------|--------|
| **PINNs** | GPU Memory (24GB vs 48GB vs 80GB) | Mostly 2D/3D toy problems | 500×500×500 voxel reservoir |
| **Diffusion Models** | Inference time per 256³ volume | Not standardized | <30s on A100 |
| **GNNs** | Training time per 10k nodes | Varies wildly | Standardized graph sizes |
| **Transformers** | Attention memory scaling | O(n²) theoretical | Measured on 1M tokens |
| **NeRF/Plenoxels** | Render time per view | Academic benchmarks | Production drillhole density |

**Standardized Test Conditions:**
- **Hardware baselines:** NVIDIA A100 80GB, H100 80GB, RTX 4090 (consumer reference)
- **Dataset sizes:** 1k, 10k, 100k drillholes; 1GB, 10GB, 100GB seismic volumes
- **Voxel resolutions:** 128³, 256³, 512³, 1024³
- **Batch configurations:** Single GPU, multi-GPU (2/4/8), distributed

**Deliverable:** A reproducible benchmark suite with `benchmark.yml` configs and automated reporting.

---

### 1.2 Failure Modes and Edge Cases

**Critical Research Gap:** Literature overwhelmingly reports success cases. Understanding when AI *violates* geological principles is essential for trust and regulatory acceptance.

| Technology | Known Failure Mode | Severity | Detection Method |
|-----------|-------------------|----------|------------------|
| **PINNs** | Violation of mass conservation when λ_physics is too low | 🔴 High | Residual monitoring |
| **PINNs** | Spectral bias—fails on high-frequency geological boundaries | 🔴 High | Fourier analysis of residuals |
| **Diffusion Models** | Generates geologically impossible cross-cutting relationships | 🔴 High | Topological validation |
| **Diffusion Models** | Stratigraphic inversions (younger layers below older) | 🔴 High | Age constraint checking |
| **GNNs** | Misses deposits when graph connectivity is sparse | 🟡 Medium | Sensitivity analysis on edge threshold |
| **GNNs** | Over-smoothing in deep layers loses local structure | 🟡 Medium | Layer-wise feature variance |
| **CNNs/Segmentation** | Hallucinates ore shoots in homogeneous host rock | 🟡 Medium | Uncertainty quantification |
| **Transformers** | Position bias—attends to drillhole spacing not geology | 🟡 Medium | Attention visualization |

**Recommended Documentation Format:**
```
Failure Case ID: PINN-001
Technology: Physics-Informed Neural Networks
Trigger: λ_physics < 0.01 in 3D Darcy flow
Symptom: Negative permeability values in low-gradient regions
Root Cause: PDE residual dominates over data fidelity term
Mitigation: Adaptive loss weighting (NTK-based or gradient statistics)
Reference: [Paper/Internal Test]
```

---

### 1.3 Data Requirements Specification

**Current Problem:** "Pre-train on 10,000 synthetic models" is insufficiently specified for procurement or experimental design.

**Required Specifications by Technology:**

#### PINNs
| Parameter | Minimum | Recommended | Production |
|-----------|---------|-------------|------------|
| Voxel dimensions | 64³ | 256³ | 512³ |
| Boundary condition points | 1,000 | 10,000 | 100,000 |
| Collocation points | 100,000 | 1,000,000 | 10,000,000 |
| PDE formulation complexity | Single physics | Coupled (flow+transport) | Multi-phase + geomechanics |

#### Diffusion Models
| Parameter | Minimum | Recommended | Production |
|-----------|---------|-------------|------------|
| Training samples | 1,000 | 10,000 | 100,000 |
| Sample resolution | 128³ | 256³ | 512³ |
| Conditioning channels | 1 (elevation) | 3 (drillholes, faults, topography) | 10+ (multi-physics) |
| Seismic trace density | 1 trace / 100m | 1 trace / 25m | 1 trace / 10m |

#### GNNs
| Parameter | Minimum | Recommended | Production |
|-----------|---------|-------------|------------|
| Number of drill holes | 50 | 500 | 5,000 |
| Nodes per graph | 1,000 | 10,000 | 100,000 |
| Edge connectivity | k=4 nearest neighbors | k=8 + geological distance | Adaptive threshold |
| Feature dimensions per node | 3 (x,y,z,grade) | 10 (geochemistry + geophysics) | 50+ (multi-sensor) |

#### Satellite/Remote Sensing
| Parameter | Minimum | Recommended | Production |
|-----------|---------|-------------|------------|
| Scene count | 100 | 1,000 | 10,000 |
| Resolution (Sentinel-2) | 10m | 10m | 10m |
| Spectral bands | RGB | 10 bands | 13 bands + SAR |
| Temporal coverage | Single date | 1 year | 5+ years |

---

### 1.4 Hyperparameter Sensitivity

**High-Impact Parameters ("Knobs That Matter"):**

| Technology | Parameter | Working Range | Breaking Range | Notes |
|-----------|-----------|---------------|----------------|-------|
| **PINNs** | λ_physics (PDE weight) | 0.1 – 10.0 | <0.01 or >100 | Adaptive strategies preferred |
| **PINNs** | Network depth | 4 – 8 layers | <3 or >12 | Deeper networks show spectral bias |
| **Diffusion** | Guidance scale (w) | 1.0 – 4.0 | >10.0 | Higher = more realistic but less diverse |
| **Diffusion** | Number of denoising steps | 50 – 250 | <20 | Quality vs. speed tradeoff |
| **Diffusion** | Conditioning dropout | 0.1 – 0.3 | >0.5 | Prevents over-reliance on sparse data |
| **GNN** | Attention heads | 4 – 8 | 1 or >16 | Diminishing returns after 8 |
| **GNN** | Message passing steps | 3 – 6 | >10 | Over-smoothing risk |
| **GNN** | Learning rate | 1e-3 – 1e-4 | >1e-2 | Very sensitive for sparse geological graphs |
| **Transformer** | Context window | 2,048 – 8,192 | >32k (memory) | Geological sequences are long-range |
| **Transformer** | Positional encoding | Sinusoidal | Learned | Geospatial coordinates need special handling |

**Recommended:** Publish sensitivity analysis as parallel coordinate plots and ablation studies.

---

## 🏭 Industry & Market Intelligence

### 2.1 Pricing Intelligence

**Current Status:** Limited public pricing data. Most vendors operate on quote-based enterprise sales.

#### Seequent (Bentley Subsurface)

| Product | Pricing Model | Rate (USD) | Monthly Cap |
|---------|-------------|------------|-------------|
| **Leapfrog Geo** | Consultants Daily | $156/day | $2,340 (15 days) |
| **Leapfrog Energy** | Consultants Daily | $267/day | $4,005 (15 days) |
| **Leapfrog Edge** | Extension Daily | $66.50/day | $997.50 (15 days) |
| **Geophysics Extension** | Extension Daily | $41.25/day | $618.75 (15 days) |
| **Hydrogeology Extension** | Extension Daily | $41.25/day | $618.75 (15 days) |
| **ioGAS Link** | Extension Daily | $15.00/day | $225.00 (15 days) |
| **Maptek Link** | Extension Daily | $6.50/day | $97.50 (15 days) |
| **Activation Fee** | One-time | $400 | N/A |

*Source: Seequent official pricing page, 2026* [cite: web_search:1#0]

**Subscription Types Available:**
- **Shared:** Floating licenses for teams
- **Named:** Dedicated user licenses
- **Consultants Daily:** Pay-per-use for variable workloads
- **Daily Seats:** 24-hour access periods, unlimited concurrent users

#### Maptek Vulcan
- **Pricing Model:** Quote-based; not publicly disclosed
- **Options:** One-time purchase or subscription-based
- **Contact:** Sales team required for all pricing [cite: web_search:1#5]

#### VRIFY
- **Pricing Model:** Not publicly disclosed
- **Funding:** $12.5M Series B (February 2025) for DORA AI-assisted mineral discovery platform [cite: web_search:1#3]
- **Status:** Enterprise SaaS; likely quote-based

#### GeologicAI
- **Pricing Model:** Not publicly available
- **Service:** Core scanning and AI analysis
- **Status:** Private company; pricing by negotiation

**Research Action Items:**
1. ☐ Submit RFQ to Maptek for Vulcan subscription pricing (1-year, 5-seat)
2. ☐ Request VRIFY pricing deck via sales contact
3. ☐ Contact GeologicAI for scanning rates per meter and AI analysis fees
4. ☐ Survey 10 mid-tier mining companies on actual annual software spend

---

### 2.2 Customer Interview Synthesis

**Target Personas:**

| Role | Organization Type | Key Pain Points | AI Adoption Barriers |
|------|-------------------|-----------------|---------------------|
| **Exploration Geologist** | Junior mining company | Manual wireframing is slow; data integration painful | Trust in AI-generated structures; liability concerns |
| **Resource Geologist** | Major (BHP, Rio Tinto) | Model updates take weeks; version control chaos | Regulatory acceptance; QP sign-off requirements |
| **Mine Geologist** | Underground operation | Daily model updates needed; limited compute | Real-time inference requirements; data connectivity |
| **VP Exploration** | Mid-tier producer | Budget pressure; need faster target generation | ROI uncertainty; integration with legacy workflows |
| **Data Scientist** | In-house AI team | Geological domain knowledge gap; messy data | Communication with geologists; data quality issues |

**Recommended Interview Protocol:**
1. **Screening:** 5-10 working geologists, mix of majors and juniors
2. **Format:** 45-minute structured interviews + follow-up
3. **Questions:**
   - Current tool stack and annual spend
   - Time spent on manual tasks vs. interpretation
   - Biggest frustration with current 3D modeling workflow
   - What would make you trust an AI-generated geological model?
   - What would make you refuse to use AI entirely?
   - Priority stack: speed, accuracy, compliance, cost, integration

**Deliverable:** Synthesis report with persona profiles, pain point prioritization matrix, and feature request frequency analysis.

---

### 2.3 Regulatory Precedent

**Critical Gap:** No confirmed public cases of AI-assisted JORC or NI 43-101 reports accepted by regulators.

#### Regulatory Framework Overview

| Standard | Jurisdiction | Governing Body | AI Relevance |
|----------|-------------|----------------|--------------|
| **JORC Code** | Australia, New Zealand, ASX | Australasian Joint Ore Reserves Committee | Mineral Resource reporting |
| **NI 43-101** | Canada, TSX | Canadian Securities Administrators (CSA) | Technical report disclosure |
| **SAMREC** | South Africa, JSE | South African Mineral Resource Committee | Resource/reserve reporting |
| **PERC** | Europe | Pan-European Reserves & Resources Committee | Harmonized reporting |
| **CBRR** | China | Ministry of Natural Resources | Chinese reporting standard |

**Key Differences:**
- **NI 43-101** requires a **Qualified Person (QP)** with specific education/experience credentials [cite: web_search:1#12]
- **JORC Code** requires a **Competent Person (CP)** recognized by a professional organization
- Both are often considered interchangeable for dual-listed entities [cite: web_search:1#7]
- NI 43-101 technical reports may be subject to review by securities regulatory authorities [cite: web_search:1#9]

**Open Questions for Regulatory Research:**
1. ☐ Has any TSX-listed company filed an NI 43-101 where AI assisted in variogram modeling or domain boundary definition?
2. ☐ What was the QP's statement regarding AI involvement?
3. ☐ Did the regulator (CSA/OSC) raise questions about AI methodology?
4. ☐ Are there any written guidance documents on AI/ML in mineral resource estimation?
5. ☐ What is the liability framework if an AI-assisted model is later found materially incorrect?

**Research Strategy:**
- Search SEDAR/ASX filings for keywords: "machine learning," "artificial intelligence," "algorithmic," "automated interpretation"
- Contact CSA directly for guidance requests
- Interview 3-5 QPs/CPs on their current stance toward AI tools

---

### 2.4 Competitive Response Scenarios

#### Seequent (Bentley Systems)

**Current AI Position:**
- **Seequent Evo** launched March 2025: Cloud-based platform with open APIs, opt-in AI/ML functionality [cite: web_search:1#17]
- **PDAC 2026 Announcements:**
  - AI-driven structural insights via machine learning and computer vision [cite: web_search:1#1]
  - Partnership with Orica Digital Solutions for drill-to-model workflows [cite: web_search:1#1]
  - Leapfrog Geo desktop and cloud updates [cite: web_search:1#2]
- **Architecture:** Evo provides centralized data + AI-ready foundation; desktop tools (Leapfrog) enhanced with cloud compute

**Likely Response to Full AI Integration:**
- **Strengths:** Massive installed base, regulatory trust, deep domain integration
- **Likely Architecture:** AI as augmentation layer within Evo; not replacement of QP judgment
- **Patent Portfolio:** Unknown; requires IP search on "geological modeling AI" patents assigned to Bentley/Seequent
- **Risk:** Slow to disrupt own cash-cow licensing model

#### Maptek
- **Position:** Strong in mine design and production; less in exploration AI
- **Likely Response:** Acquisition or partnership with AI startup; API integration with Vulcan
- **Patent Portfolio:** Requires investigation

#### VRIFY
- **Position:** Pure-play AI mineral discovery; $12.5M Series B [cite: web_search:1#8]
- **Product:** DORA (AI-assisted mineral discovery)
- **Threat:** Most direct competitor if they expand from target generation to full 3D modeling

**Scenario Planning Matrix:**

| Scenario | Probability | Impact | Recommended Response |
|----------|-------------|--------|----------------------|
| Seequent announces AI auto-modeling in Leapfrog | Medium | 🔴 High | Differentiate on commodity-specific models |
| Maptek acquires AI startup | Medium | 🟡 Medium | Accelerate partnership discussions |
| VRIFY raises Series C ($50M+) | Medium | 🟡 Medium | Lock in early customers before scaling |
| Regulator bans AI in resource reports | Low | 🔴 High | Build regulatory compliance as core competency |
| Open-source geological AI toolkit emerges | High | 🟡 Medium | Contribute to community; monetize enterprise features |

---

## 💰 Business & Strategy

### 3.1 Detailed Financial Model

**Beyond TAM/SAM: Required Unit Economics**

#### Revenue Model Options

| Model | Description | Pros | Cons |
|-------|-------------|------|------|
| **SaaS Subscription** | Monthly/annual per-seat or per-project | Predictable revenue; scalable | High churn risk; long sales cycles |
| **Usage-Based** | Per model, per voxel, per drillhole processed | Aligns with value; low barrier | Revenue lumpy; hard to predict |
| **Professional Services** | Custom model building + training | High margin; deep customer relationships | Not scalable; talent bottleneck |
| **Hybrid** | Base SaaS + usage overages + services | Balanced predictability and growth | Complex pricing; customer confusion |

#### Required Metrics

| Metric | Definition | Target Benchmark |
|--------|------------|-----------------|
| **Customer Acquisition Cost (CAC)** | Sales + marketing spend / new customers | <$50K for enterprise mining |
| **Lifetime Value (LTV)** | ARPU × gross margin × customer lifetime | >3× CAC |
| **LTV:CAC Ratio** | Standard SaaS health metric | >3:1 |
| **Churn by Segment** | Monthly logo churn % | <5% annual for enterprise |
| **Sales Cycle Length** | First contact to signed contract | 6-12 months for major mining |
| **Professional Services Margin** | (Revenue - COGS) / Revenue | >40% |
| **Net Revenue Retention** | (Starting ARR + expansion - churn) / Starting ARR | >120% |
| **Payback Period** | CAC / monthly gross margin | <18 months |

**Model Structure:**
```
Year 1-3 Assumptions:
- Initial customers: 5 pilot programs
- Average contract value (ACV): $150K/year
- Expansion revenue: 30% YoY from existing customers
- Services attach rate: 60% of new deals
- Headcount: 15 → 40 → 80
- Burn rate: $2M → $5M → $8M/year
```

---

### 3.2 Partnership Landscape

**Build vs. Buy vs. Partner Matrix**

| Capability | Build | Buy | Partner | Partner Candidates |
|------------|-------|-----|---------|-------------------|
| **Cloud Infrastructure** | ❌ | ❌ | ✅ | AWS (SageMaker), Azure (ML Studio), GCP (Vertex AI) |
| **GPU Compute** | ❌ | ❌ | ✅ | NVIDIA (Omniverse, CUDA), CoreWeave, Lambda Labs |
| **Satellite Data** | ❌ | ❌ | ✅ | Sentinel Hub (Copernicus), Planet Labs, Maxar |
| **Legacy Software APIs** | ❌ | ❌ | ✅ | Seequent Evo API, Maptek Vulcan SDK, Micromine API |
| **Drillhole Data** | ❌ | ❌ | ✅ | WAMEX, NSGD, government geological surveys |
| **Domain Expertise** | ❌ | ✅ | ✅ | Hire ex-BHP/Rio geologists; partner with universities |
| **AI Core (Diffusion/GNN)** | ✅ | ❌ | ❌ | Internal R&D team |
| **Regulatory Compliance** | ✅ | ❌ | ✅ | Consulting firms (SRK, AMC, CSA Global) |

**Partnership Priorities:**
1. **Immediate:** Cloud provider credits (startup programs: AWS Activate, Azure for Startups)
2. **Short-term:** Satellite data API integration (Sentinel Hub has free tier)
3. **Medium-term:** Legacy software interoperability (Seequent Evo API is new and open)
4. **Long-term:** Co-development with major mining company (joint venture for data access)

---

### 3.3 Talent Map

**Target Profiles: The 20 People Who Could Build This**

| Category | Known Individuals/Teams | Location | Expertise |
|----------|------------------------|----------|-----------|
| **Geological AI Research** | Zhejiang Lab GeoGPT team | Hangzhou, China | LLMs for geology |
| **GNN for Mineral Exploration** | KADM authors (Korea) | South Korea | Knowledge-aware deep mining |
| **Attention Mechanisms** | KDCGAT researchers | Various | Knowledge-driven contextual GAT |
| **Industry Veterans** | ex-BHP AI team members | Melbourne/Perth | Production ML in mining |
| **Visualization** | ex-Rio Tinto RTVis engineers | Various | Real-time 3D geological visualization |
| **PINNs for Geoscience** | Prof. Kamyar Azizzadenesheli (Purdue) | USA | Physics-informed ML |
| **Diffusion Models** | Stability AI / OpenAI alumni | Various | Generative modeling |
| **Geostatistics + ML** | Prof. Jef Caers (Stanford) | USA | Geostatistical learning |
| **Structural Geology AI** | Seequent AI team (Alexander Wilson) | Toronto/Christchurch | ML for structural interpretation |
| **Remote Sensing** | Prof. Ribana Roscher (Jülich) | Germany | Deep learning for Earth observation |

**Recruitment Strategy:**
- **Tier 1:** Full-time hires from major mining company AI teams (high comp, but domain expertise is irreplaceable)
- **Tier 2:** Academic partnerships (PhD co-supervision, research grants)
- **Tier 3:** Advisory board (2-3 renowned professors for credibility and network)

---

### 3.4 Technical Debt Assessment

**Lock-in Risks and Migration Paths**

| Current Choice | Lock-in Risk | Migration Path | Trigger |
|---------------|--------------|----------------|---------|
| **PyTorch** | Medium | JAX, TensorFlow | If PyTorch ecosystem declines |
| **Diffusion Models** | High | Flow Matching (Rectified Flow), Consistency Models | If sampling speed becomes critical |
| **Transformers** | Medium | State Space Models (Mamba, RWKV), Linear Attention | If O(n²) scaling blocks context windows |
| **CUDA** | High | ROCm, oneAPI, Triton | If NVIDIA pricing/availability changes |
| **Specific GNN Library** | Medium | PyG → DGL → Custom | If library maintenance stops |
| **Cloud Provider** | Medium | Multi-cloud (Kubernetes) | If single provider pricing increases |

**Mitigation Strategies:**
1. **Abstraction layers:** Wrap PyTorch models in framework-agnostic interfaces
2. **Model export:** Standardize on ONNX for deployment; avoid framework-specific ops
3. **Modular architecture:** Swappable components (diffusion ↔ flow matching; transformer ↔ Mamba)
4. **Cloud-agnostic:** Kubernetes + Terraform for multi-cloud portability

---

## 🧪 Validation & Evidence

### 4.1 Reproducible Benchmarks

#### Dataset 1: WAMEX (Western Australia)

**Overview:**
- **Repository:** Western Australian Mineral Exploration reports (WAMEX) [cite: web_search:1#11]
- **Size:** 120,000+ reports; 105,000+ publicly available with raw data
- **Data Types:** Drilling data, geochemistry results, 3D models, gravity surveys, structural maps
- **Access:** Free via WAMEX search portal; bulk download available on hard drive from Perth/Kalgoorlie [cite: web_search:1#14]
- **Confidentiality:** 5-year embargo under Mining Act 1978 [cite: web_search:1#10]
- **Update Cycle:** May and November each year [cite: web_search:1#14]

**Known Data Quality Issues:**
- WAMEX geochemical data may contain spurious results (unit reporting errors, incorrect analyte assignment) [cite: web_search:1#6]
- Automated compilation loses ~15% of data; low/high cuts remove another 7-20% (including valid data) [cite: web_search:1#6]
- Multiple analytical techniques combined in same table—not all directly comparable [cite: web_search:1#6]
- Historical gravity data requires rigorous harmonization due to varying contractors, methods, and datums [cite: web_search:1#15]

**Benchmark Protocol:**
1. Select 5 open-file reports with complete drillhole data + assay results
2. Define task: 3D grade interpolation from drillholes only
3. Run baseline: Ordinary Kriging (OK) in commercial software (Leapfrog, Micromine)
4. Run AI methods: PINN, GNN, Diffusion-based infill
5. Metrics: RMSE, MAE, correlation coefficient at cross-validation locations
6. Compute cost: GPU hours, training time, inference time per model
7. Publish: Code, data, results on GitHub with DOI

#### Dataset 2: NSGD (Nevada Geothermal)

**Status:** Search did not return specific open dataset information. Requires further investigation.

**Alternative Open Datasets:**
- **USGS National Geologic Map Database**
- **Geoscience Australia (GA) datasets**
- **British Geological Survey Open Data**
- **Natural Resources Canada Geospatial Data**

**Deliverable:** Public benchmark leaderboard with standardized train/test splits and evaluation scripts.

---

### 4.2 Blind Test Protocol

**Objective:** Measure geologist trust, actionability, and perceived quality of AI-generated models without disclosure of AI origin.

**Protocol Design:**

```
Phase 1: Model Generation
- Select 5 real deposits with known geology (but not widely published)
- Generate 3D models using: (a) Human expert, (b) AI method A, (c) AI method B
- Render consistent visualizations (same color scheme, orientation, scale)

Phase 2: Blind Evaluation
- Recruit 20 geologists (mix of experience levels)
- Randomize model presentation order
- Ask evaluators to score each model on:
  1. Geological plausibility (1-10)
  2. Structural consistency (1-10)
  3. Usefulness for drill planning (1-10)
  4. Trustworthiness for resource estimation (1-10)
  5. Overall quality vs. their own work (1-10)
- Open comment: "What concerns you about this model?"

Phase 3: Disclosure & Follow-up
- Reveal which models were AI-generated
- Measure change in trust scores (before/after disclosure)
- Identify specific features that triggered suspicion or confidence
```

**Ethical Considerations:**
- IRB approval required for human subjects research
- Debriefing must include full disclosure of AI involvement
- No evaluative consequences for participants (not a hiring test)

---

### 4.3 Economic Validation

**Case Study Template:**

```markdown
## Case Study: [Deposit Name] — [Commodity]

### Project Context
- Operator: [Company]
- Location: [Jurisdiction]
- Deposit Type: [Porphyry/IOCG/etc.]
- Exploration Budget: $[X]M
- Timeline: [Years]

### Counterfactual Analysis
"If we had [AI Platform] for the [Project Name]:"

| Metric | Without AI (Actual) | With AI (Simulated) | Delta |
|--------|---------------------|---------------------|-------|
| Drill meters required | 50,000m | 35,000m | -30% |
| Drill cost (@$150/m) | $7.5M | $5.25M | **-$2.25M** |
| Modeling person-weeks | 40 weeks | 10 weeks | -75% |
| Modeling cost (@$5K/week) | $200K | $50K | **-$150K** |
| Time to first resource | 24 months | 18 months | -6 months |
| Opportunity cost (discount) | $[X]M | $[Y]M | **-$[Z]M** |

### Key Assumptions
- AI model accuracy within 15% of final resource
- Drilling reduction achieved through better targeting
- No additional data collection costs

### Validation Required
- [ ] Operator interview to confirm actual costs
- [ ] Drill plan comparison (actual vs. AI-recommended)
- [ ] Model accuracy assessment vs. subsequent drilling
```

---

## 🌍 Domain-Specific Extensions

### 5.1 Commodity-Specific Models

**Rationale:** A generic platform is less valuable than commodity-specialized models. Each commodity has distinct geological controls, data types, and modeling priorities.

| Commodity | Deposit Type | Key Geological Controls | Priority Data | AI Opportunities |
|-----------|-----------|------------------------|---------------|-----------------|
| **Copper** | Porphyry | Alteration zonation, stockwork density, sulfide assemblage | Hyperspectral, geochemistry, magnetics | Alteration classification from drill core imagery |
| **Copper** | IOCG | Structural control, breccia zones, iron oxide alteration | Gravity, magnetics, EM | Structural control prediction from geophysics |
| **Gold** | Orogenic | Shear zones, alteration halos, sulfide association | Structural maps, geochemistry, gravity | Shear zone prediction from sparse drill data |
| **Gold** | Carlin | Host rock chemistry, realgar/stibnite, decarbonatization | Geochemistry, hyperspectral, seismic | Host rock prediction from regional geochemistry |
| **Lithium** | Pegmatite | Spodumene abundance, tantalite association, fractionation | Handheld XRF, hyperspectral, magnetics | Pegmatite texture classification from core photos |
| **Lithium** | Brine | Aquifer geometry, evaporation rate, source rock leaching | Geophysics (TEM/MT), isotopes, well logs | Brine aquifer prediction from EM data |
| **REE** | Carbonatite | REE mineralogy, weathering profile, gangue composition | Geochemistry, mineralogy, radiometrics | REE grade prediction from portable XRF |
| **Nickel** | Magmatic Sulfide | Sulfide fraction, chalcopyrite/pentlandite ratio, PGE | Geochemistry, petrology, EM | Sulfide texture classification |
| **Uranium** | Unconformity | Graphite basement, alteration clay, redox boundary | EM, gravity, radiometrics, geochemistry | Basement graphitic unit prediction |
| **Zinc-Lead** | VMS | Volcanic stratigraphy, hydrothermal alteration, stockwork | Geochemistry, magnetics, EM | Volcanic facies prediction from geophysics |

**Recommended Approach:**
- Start with **2-3 commodities** (e.g., Porphyry Cu, Orogenic Au, Lithium Pegmatite)
- Develop commodity-specific loss functions and geological constraints
- Build training datasets from WAMEX/NSGD filtered by deposit type
- Partner with commodity specialists for validation

---

### 5.2 Jurisdiction-Specific Regulations

**Compliance Requirements by Jurisdiction**

| Standard | Jurisdiction | Key Requirements | AI Implications |
|----------|-------------|------------------|-----------------|
| **JORC Code 2012** | Australia, New Zealand, ASX | Competent Person (CP) sign-off; transparent assumptions; materiality | AI can assist but CP must take responsibility; need explainability |
| **NI 43-101** | Canada, TSX | Qualified Person (QP); specific education + experience; filing on SEDAR | QP must supervise AI; methodology disclosure required |
| **SAMREC 2016** | South Africa, JSE | Competent Person; reasonable prospects for eventual economic extraction | Similar to JORC; AI as tool, not substitute for judgment |
| **PERC 2021** | Europe | Harmonized with CRIRSCO; public reporting of exploration results | Emerging standard; less precedent on AI |
| **CBRR** | China | Ministry of Natural Resources oversight; resource reserve classification | Rapidly evolving; potential for AI-first regulation |

**Research Deliverables:**
1. ☐ Side-by-side comparison matrix of AI disclosure requirements
2. ☐ Template "AI Methods Statement" for inclusion in technical reports
3. ☐ Precedent search: Has any AI/ML language appeared in filed NI 43-101 or JORC reports?
4. ☐ Interview 3 QPs/CPs on their willingness to sign off AI-assisted work

---

### 5.3 Climate and ESG Integration

**Growth Markets with Regulatory Tailwinds**

| Application | Market Driver | Data Types | AI Opportunity |
|-------------|--------------|------------|----------------|
| **Carbon Sequestration Site Characterization** | CCS mandates; 45Q tax credits | Seismic, well logs, caprock integrity | Reservoir seal prediction; injection plume monitoring |
| **Critical Mineral Supply Chain Mapping** | IRA, EU Critical Raw Materials Act | Satellite, trade data, geological surveys | Prospectivity mapping + supply chain risk |
| **Tailings Dam Monitoring** | Global Tailings Standard; investor pressure | InSAR, geotechnical sensors, drone imagery | Failure prediction; deformation anomaly detection |
| **Mine Closure Planning** | Progressive closure bonds; regulatory requirements | Topography, hydrology, geochemistry, vegetation | Closure scenario optimization; long-term monitoring |
| **Geothermal Resource Assessment** | Renewable energy targets | Temperature gradients, geophysics, well tests | Resource temperature prediction; drilling target optimization |

**Strategic Value:** These applications have shorter regulatory paths and less liability risk than Mineral Resource estimation.

---

## 🔗 Integration & Ecosystem

### 6.1 API Specifications

**Proposed REST API Design**

```yaml
openapi: 3.0.0
info:
  title: Geological AI Platform API
  version: 1.0.0
  description: |
    RESTful API for AI-driven geological modeling.
    All endpoints require Bearer token authentication.

paths:
  /v1/projects:
    post:
      summary: Create new geological modeling project
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, jurisdiction, commodity_type]
              properties:
                name: { type: string, example: "Pilbara Iron Project" }
                jurisdiction: { type: string, enum: [JORC, NI_43_101, SAMREC, PERC, CBRR] }
                commodity_type: { type: string, example: "iron_ore" }
                crs: { type: string, example: "EPSG:28350" }
      responses:
        '201':
          description: Project created
          content:
            application/json:
              schema:
                type: object
                properties:
                  project_id: { type: string, format: uuid }
                  created_at: { type: string, format: date-time }

  /v1/projects/{project_id}/data/drillholes:
    post:
      summary: Upload drillhole data
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file: { type: string, format: binary, description: "CSV/CSVZ/OMF format" }
                data_format: { type: string, enum: [csv, csvz, omf, deswik] }
      responses:
        '202':
          description: Data upload accepted for processing
          content:
            application/json:
              schema:
                type: object
                properties:
                  upload_id: { type: string, format: uuid }
                  status: { type: string, enum: [pending, processing, completed, failed] }

  /v1/projects/{project_id}/models:
    post:
      summary: Generate 3D geological model
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [model_type, parameters]
              properties:
                model_type:
                  type: string
                  enum: [pinns, diffusion, gnn, ensemble]
                parameters:
                  type: object
                  properties:
                    resolution: { type: integer, example: 256 }
                    physics_constraints: { type: boolean, default: true }
                    uncertainty_quantification: { type: boolean, default: true }
      responses:
        '202':
          description: Model generation queued
          content:
            application/json:
              schema:
                type: object
                properties:
                  model_id: { type: string, format: uuid }
                  status: { type: string, enum: [queued, running, completed, failed] }
                  estimated_completion: { type: string, format: date-time }

  /v1/models/{model_id}/export:
    get:
      summary: Export model in standard format
      parameters:
        - name: format
          in: query
          schema:
            type: string
            enum: [omf, gocad, leapfrog, vtk, csv]
      responses:
        '200':
          description: Model file
          content:
            application/octet-stream:
              schema:
                type: string
                format: binary

  /v1/models/{model_id}/lineage:
    get:
      summary: Retrieve full data and model lineage
      responses:
        '200':
          description: Lineage graph
          content:
            application/json:
              schema:
                type: object
                properties:
                  model_version: { type: string }
                  training_data_version: { type: string }
                  drill_programs: { type: array, items: { type: string } }
                  model_parameters_hash: { type: string }
                  created_by: { type: string }
                  created_at: { type: string, format: date-time }
```

**Authentication:** OAuth 2.0 + JWT; role-based access control (viewer, modeler, admin, QP)
**Rate Limiting:** 100 requests/minute for standard; 1000/minute for enterprise
**Versioning:** URL path versioning (`/v1/`, `/v2/`); 12-month deprecation cycle

---

### 6.2 Data Lineage and Versioning

**Critical for Regulatory Compliance**

**Provenance Model:**

```
Model v3.2.1
├── Trained on: Dataset v2.1.4
│   ├── Drill Program 2024-Q3 (v1.0.2)
│   │   ├── Holes DH-1001 to DH-1050
│   │   ├── Assay lab: ALS Chemex (certificate #2024-AL-4451)
│   │   └── QA/QC: 5 blanks, 10 standards, 5 duplicates
│   ├── Drill Program 2024-Q2 (v1.0.1)
│   ├── Satellite imagery: Sentinel-2 (2024-06-15, tile T50HMK)
│   └── Topography: SRTM 30m (public, v3.0)
├── Model architecture: Diffusion-UNet v2.3
│   ├── Base checkpoint: Diffusion-Base v1.0 (trained on 10k synthetic models)
│   ├── Fine-tuning: 500 epochs on Dataset v2.1.4
│   └── Hyperparameters: config_hash 0x8f3a2b...
├── Validation: Cross-validation fold 3
│   ├── RMSE: 0.42% Cu
│   └── MAE: 0.31% Cu
└── Signed off by: QP Jane Smith (license #12345)
    └── Date: 2024-12-15
```

**Technical Implementation:**
- **Data versioning:** DVC (Data Version Control) or LakeFS for large files
- **Model versioning:** MLflow or Weights & Biases with artifact tracking
- **Lineage graph:** Neo4j or Apache Atlas for relationship queries
- **Immutable audit log:** Append-only blockchain or signed hash chain
- **Export format:** W3C PROV standard for interoperability

---

### 6.3 MLOps for Geology

**Unique Challenges vs. Consumer Tech MLOps**

| Challenge | Consumer Tech Approach | Geological Adaptation |
|-----------|----------------------|----------------------|
| **Sparse data** | Massive datasets, abundant labels | Few-shot learning; active learning; synthetic data generation |
| **Expensive labels** | Crowdsourcing, weak supervision | Expert-in-the-loop; transfer learning from synthetic geology |
| **Non-stationary distributions** | Concept drift monitoring | Geological domain shift (different terrane = different statistics) |
| **Long feedback loops** | Real-time A/B testing | Months/years until drill validation; proxy metrics needed |
| **Regulatory compliance** | Minimal | Full audit trail; QP sign-off; immutable records |
| **Compute at edge** | Cloud-only | Mine sites often offline; edge deployment required |

**Recommended MLOps Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT PIPELINE                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Data    │→ │  Train   │→ │ Validate │→ │  Stage   │   │
│  │ Ingest   │  │  Model   │  │  Model   │  │  Model   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         ↑                                    ↓              │
│    ┌──────────┐                      ┌──────────┐        │
│    │  WAMEX   │                      │  MLflow  │        │
│    │  NSGD    │                      │ Registry │        │
│    └──────────┘                      └──────────┘        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PIPELINE                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  A/B     │  │  Shadow  │  │  Canary  │  │  Full    │   │
│  │  Test    │→ │  Mode    │→ │  Deploy  │→ │ Deploy   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│       ↓            ↓            ↓            ↓            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Geologist│  │ Compare  │  │ 5% Prod  │  │ 100%     │   │
│  │ Feedback │  │ vs. Human│  │ Traffic  │  │ Traffic  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    MONITORING & RETRAINING                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  New     │  │  Trigger │  │  Retrain │  │  Validate│   │
│  │ Drill    │→ │  Check   │→ │  Model   │→ │  & Sign  │   │
│  │ Data     │  │ (drift?) │  │  vN+1    │  │  Off     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                              ↓                              │
│                       ┌──────────┐                          │
│                       │  QP      │                          │
│                       │  Review  │                          │
│                       └──────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

**Retraining Triggers:**
1. **New drill program completed** (>10% increase in data volume)
2. **Concept drift detected** (distribution shift in new assays vs. training set)
3. **Quarterly schedule** (regardless of data volume)
4. **Model performance degradation** (proxy metric drift >10%)

---

## 📊 Visual & Interactive Assets

### 7.1 Interactive Technology Matrix

**Concept:** Filterable table where user selects data situation → recommended AI stack.

**Filter Dimensions:**
- Data availability: [Sparse drillholes / Dense drillholes / Seismic / Satellite / Multi-physics]
- Budget: [Low (<$50K) / Medium ($50K-$500K) / High (>$500K)]
- Timeline: [Rapid (<1 month) / Standard (1-6 months) / Extended (>6 months)]
- Compliance requirement: [None / Internal / JORC / NI 43-101 / SAMREC]
- Commodity: [Generic / Porphyry Cu / Orogenic Au / Lithium / etc.]

**Output:**
- Recommended primary technology
- Recommended secondary/ensemble approach
- Expected accuracy range
- Estimated compute cost
- Key risks and mitigations

**Implementation:** React/Vue component with state-based filtering; embed in documentation site.

---

### 7.2 Decision Tree Flowchart

```
START: What is your data situation?
│
├─→ I have only sparse drillholes (<50 holes)
│   ├─→ With geochemistry only → GNN + Kriging ensemble
│   ├─→ With geophysics coverage → PINN-constrained inversion
│   └─→ With satellite imagery → Multi-modal fusion (GNN + CNN)
│
├─→ I have dense drillholes (>500 holes)
│   ├─→ Need rapid updates → Diffusion model infill
│   ├─→ Need uncertainty quantification → Ensemble of PINNs
│   └─→ Need structural geology → Transformer-based sequence model
│
├─→ I have seismic data
│   ├─→ 2D seismic lines → CNN segmentation + interpretation
│   ├─→ 3D seismic volume → 3D U-Net + geophysical inversion
│   └─→ Time-lapse (4D) → LSTM/Transformer temporal model
│
├─→ I have remote sensing only
│   ├─→ Regional prospectivity → Random Forest / XGBoost
│   ├─→ Alteration mapping → CNN on Sentinel-2 / ASTER
│   └─→ Structural mapping → U-Net on DEM + SAR
│
└─→ I need JORC/NI 43-101 compliance
    ├─→ Assistive AI (human-in-the-loop) → All technologies with audit trail
    └─→ Autonomous AI → NOT RECOMMENDED for current regulations
```

---

### 7.3 Comparison Tables

#### Platform Feature Comparison

| Feature | Leapfrog Geo | Maptek Vulcan | VRIFY DORA | Micromine | GeologicAI | [Your Platform] |
|---------|-------------|---------------|------------|-----------|------------|----------------|
| **Pricing Model** | Daily/Sub | Quote | Quote | Quote | Quote | SaaS/Usage |
| **Pricing (indicative)** | $156/day | Undisclosed | Undisclosed | Undisclosed | Undisclosed | TBD |
| **3D Modeling** | ✅ Implicit | ✅ Explicit | ❌ Target gen | ✅ Explicit | ❌ Scanning | ✅ AI-gen |
| **AI/ML Features** | 🟡 Emerging | ❌ None | ✅ Core | ❌ None | ✅ Core imagery | ✅ Core |
| **Data Formats** | CSV, OMF, DXF | Vulcan native | Proprietary | CSV, OMF | Core photos | OMF, CSV, VTK |
| **Cloud** | Evo (new) | ❌ On-prem | ✅ Cloud | ❌ Desktop | ✅ Cloud | ✅ Cloud |
| **API** | ✅ Evo API | 🟡 Limited | ❌ None | ❌ None | ❌ None | ✅ Full REST |
| **JORC/NI 43-101** | ✅ Industry std | ✅ Industry std | 🟡 Unclear | ✅ Industry std | ❌ N/A | 🟡 Building |
| **Export Options** | OMF, VTK, CSV | Vulcan, CSV | PDF, Web | OMF, CSV | PDF, Images | OMF, VTK, CSV |
| **Support Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | TBD |
| **On-premise Option** | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ Enterprise |

---

## 🎯 Priority Roadmap

### Immediate Actions (Next 30 Days)

| Priority | Action | Owner | Deliverable |
|----------|--------|-------|-------------|
| 🔴 **1** | Compile real pricing data via RFQs | Business | Pricing intelligence matrix |
| 🔴 **2** | Search SEDAR/ASX for AI in NI 43-101/JORC | Research | Regulatory precedent report |
| 🔴 **3** | Design WAMEX benchmark protocol | Technical | Benchmark specification doc |
| 🔴 **4** | Interview 5 working geologists | Product | Customer insight synthesis |

### Short-Term (Next 90 Days)

| Priority | Action | Owner | Deliverable |
|----------|--------|-------|-------------|
| 🟡 **5** | Execute WAMEX benchmark on 5 reports | Technical | Reproducible results + leaderboard |
| 🟡 **6** | Draft API specification v0.1 | Engineering | OpenAPI YAML + documentation |
| 🟡 **7** | Build commodity-specific model (Porphyry Cu) | Technical | Trained model + evaluation |
| 🟡 **8** | Develop financial model v1.0 | Business | Spreadsheet with assumptions |

### Medium-Term (Next 6 Months)

| Priority | Action | Owner | Deliverable |
|----------|--------|-------|-------------|
| 🟢 **9** | Run blind test protocol with 20 geologists | Research | Trust assessment report |
| 🟢 **10** | Complete economic validation case study | Business | ROI analysis for 1 deposit |
| 🟢 **11** | Implement data lineage system | Engineering | Provenance tracking demo |
| 🟢 **12** | Develop MLOps pipeline for geology | Engineering | CI/CD for model retraining |

### Highest-Value Additions (Ranked)

1. **Real pricing data** from existing vendors — *Hard to get but transformative for business case validation*
2. **Regulatory precedent** — *Even one example of an AI-assisted report accepted by a regulator would de-risk the entire market*
3. **Reproducible benchmark** on an open geological dataset — *Establishes credibility and technical differentiation*
4. **Customer interview synthesis** — *Even 5-10 conversations with working geologists would validate product-market fit*

---

## Appendix A: Data Sources and References

### Search Results Summary

| Query | Results | Key Finding |
|-------|---------|-------------|
| Leapfrog Geo pricing 2025 | ✅ Found | Consultants Daily: $156/day, cap $2,340/month |
| Maptek Vulcan pricing | ⚠️ Partial | Quote-based only; no public pricing |
| VRIFY pricing | ❌ None | $12.5M Series B funding confirmed; pricing undisclosed |
| Seequent AI integration | ✅ Found | Evo platform launched 2025; AI features at PDAC 2026 |
| AI in JORC/NI 43-101 | ⚠️ Partial | No confirmed AI-assisted report acceptance found |
| WAMEX dataset | ✅ Found | 120K reports; 105K public; 5-year confidentiality |
| NSGD Nevada | ❌ None | No specific open dataset identified |

### Key URLs
- Seequent Pricing: https://www.seequent.com/help-support/seequent-id/consultants-daily/
- Seequent Evo Announcement: https://www.bentley.com/news/introducing-seequent-evo/
- Seequent PDAC 2026: https://www.seequent.com/seequent-brings-ai-and-cloud-enabled-geoscience-to-pdac-2026/
- WAMEX Portal: https://wamex.dmp.wa.gov.au/Wamex/Home/HomePage
- VRIFY Funding: https://ca.finance.yahoo.com/news/vrify-lands-12-5m-series-150000659.html
- NI 43-101 Standards: https://mrmr.cim.org/media/1017/national-instrument-43-101.pdf
- JORC/NI 43-101 Comparison: https://www.miningdoc.tech/question/what-are-jorc-ni-43-101-what-are-they-for/

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **PINN** | Physics-Informed Neural Network — neural network trained with physical law constraints |
| **GNN** | Graph Neural Network — operates on graph-structured data (e.g., drillhole networks) |
| **Diffusion Model** | Generative model that learns to reverse a noise-corruption process |
| **NeRF** | Neural Radiance Field — implicit 3D scene representation |
| **QP** | Qualified Person — NI 43-101 requirement for technical report authorship |
| **CP** | Competent Person — JORC Code equivalent of QP |
| **WAMEX** | Western Australian Mineral Exploration reports database |
| **NSGD** | Nevada State Geothermal Database (proposed; requires verification) |
| **TAM/SAM** | Total Addressable Market / Serviceable Addressable Market |
| **LTV/CAC** | Lifetime Value / Customer Acquisition Cost |
| **MLOps** | Machine Learning Operations — DevOps practices for ML systems |
| **DVC** | Data Version Control — Git-like system for data and models |

---

## Appendix C: Contributing Guidelines

To contribute to this research repository:

1. **Fork** the repository and create a feature branch
2. **Add** your research in the appropriate section using the established format
3. **Cite** all sources with inline citations and add to Appendix A
4. **Update** the Priority Roadmap if your contribution changes priorities
5. **Submit** a pull request with a clear description of additions

**Research Quality Standards:**
- All pricing claims must include source and date
- All technical benchmarks must be reproducible (code + data)
- All regulatory claims must reference specific filings or official guidance
- All customer insights must be anonymized and include sample size

---

*Document generated: 2026-05-22*
*License: CC BY-SA 4.0*
*Maintainers: [To be assigned]*
