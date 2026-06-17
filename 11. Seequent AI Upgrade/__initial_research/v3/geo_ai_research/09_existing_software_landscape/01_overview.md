# Existing Software Landscape: AI in Geoscience

## Overview

This document catalogs all existing software platforms already deploying AI technologies for geological modeling, exploration, and mining operations. The landscape is fragmented — no single platform integrates all seven technologies. Understanding this fragmentation is essential for identifying the convergence opportunity.

## Tier 1: Major Mining Companies — Internal AI Platforms

These are the most advanced but **not commercially available** — they build proprietary ecosystems for competitive advantage.

### BHP — Enterprise AI Ecosystem (Most Mature)

BHP has evolved from discrete pilots to a globally integrated AI hub. In May 2025, they launched the **Industry AI Hub in Singapore** as a nerve center for scaling solutions worldwide.

**Key achievements:**
- Proprietary ML models identified a **1.3 billion tonne copper-gold deposit** near Olympic Dam
- Digital twins with AI models for ore characteristic prediction (reduced SAG mill losses by ~70% at Escondida)
- Computer vision on conveyors (reduced 1,000+ hours of downtime at WAIO)
- Enterprise-wide AI Transformation Program with Microsoft partnership ($18.9M revenue uplift)

**Technologies deployed:**
- Digital Twins (foundation model layer)
- Machine Learning Discovery (transfer learning)
- Muon Tomography (physics-informed sensing)
- Quantum Sensing (Atomionics investment, September 2025)
- Computer Vision (multimodal LLM layer)

**Investment:** $100M+ annually in AI/ML

**Limitation:** Proprietary — not available to other companies

### Rio Tinto — RTVis + Fleet Space AI

Rio Tinto built **RTVis** (Rio Tinto Visualisation) with a 3D gaming engine — 1,700 users across 98% of mines. They partnered with **Fleet Space Technologies** for AI-powered geophysical imaging.

**Key achievements:**
- Creates 3D subsurface maps without drilling
- Identifies lithium drill targets **100x faster** than traditional methods
- Real-time tracking of 4,000+ vehicles with 30M geo-positions daily

**Technologies deployed:**
- 3D Visualization Engine (user interface)
- AI Geophysical Imaging (multimodal fusion)
- Digital Twins (foundation model layer)
- Real-time Analytics (physics-informed)

**Limitation:** Proprietary ecosystem, not standalone software

### BHP + Codelco — AI-Driven Seismic Surveys

$40M partnership (May 2025) for the Anillo Property in Chile, focusing on AI-driven seismic surveys for sulfide deposit mapping.

**Technologies:** AI Seismic Interpretation, Enterprise AI Hub, Digital Twins

---

## Tier 2: Commercial Geological Modeling Software with AI Integration

### Seequent Leapfrog 2025.1

The June 2025 release introduces "generational change" through integration with the **Seequent Evo platform** and applications **BlockSync** and **Driver**.

**AI-adjacent features:**
- Refreshed structural trends — faster modeling with fewer manual edits
- New clustering settings for automated domain generation
- Editable visual representations
- Streamlined model updates with face mapping using polylines
- Cross-section communication (orthogonal vs. illustrative)

**Critical assessment:**
- **No true AI** — algorithmic automation of implicit modeling, not machine learning
- The "AI" is in workflow speed, not predictive capability
- No natural language interface
- No literature integration
- No uncertainty quantification

**Status:** Industry standard for 3D implicit modeling, but AI integration is minimal

### Maptek Vulcan + DomainMCF + GeologyCore 2025

Maptek is the most AI-forward of the legacy modeling vendors.

**DomainMCF (Machine Learning Domain Generation):**
- Uses machine learning to generate domain boundaries directly from drillhole data
- Models available in minutes comparable to classical techniques
- Cloud compute framework (Maptek Compute Framework)

**GeologyCore 2025:**
- Full geological models: lithologies, intrusions, veins, stratigraphic surfaces
- Global RBF (Radial Basis Function) engine for smoother, geologically consistent surfaces
- Sandbox environment for alternate interpretation testing
- Tight integration between structural trends and domain modeling

**Real-world validation:**
Havilah Resources used DomainMCF at Mutooroo copper-cobalt — the AI model predicted extensions, and the first four drillholes successfully intersected mineralization close to AI-predicted depths.

**Status:** Most advanced AI integration in commercial geological modeling, but still limited to domain generation (not full AI modeling)

### Datamine Studio

Industry standard for resource estimation and 3D block modeling. **Limited native AI** — relies on third-party integration for machine learning capabilities.

**Status:** Traditional geostatistics leader, slowest to adopt AI

---

## Tier 3: Specialized AI Exploration & Targeting Platforms

### VRIFY AI

Mineral targeting software using **deep learning + computer vision**.

**Technology stack:**
- CNN for pattern recognition in geophysical data
- Random Forest for geochemical interpolation
- Feature engineering: vertical derivatives, tilt angle, Fourier filtering
- Probabilistic lithological mapping from outcrops
- Stochastic modeling with uncertainty quantification

**Kodiak Copper case study:**
- Analyzed MPD project data
- Confirmed known mineralization and existing targets
- Generated **new prospective areas** not identified by traditional methods

**Status:** Commercially available, focused on exploration targeting (not 3D modeling)

### KoBold Metals

AI-powered exploration company backed by BHP partnership (2021) for battery mineral discovery.

**Approach:**
- Big data analytics
- Proprietary algorithms for geological pattern recognition
- Deposit prediction from multi-source data fusion

**Status:** Not a software platform — more of an AI exploration service company

### SensOre

AI drilling target identification platform. BHP invested in March 2022.

**Achievements:**
- Data automation for exploration optimization
- Contributed to unlocking **$1 billion in value** from data automation

**Status:** Commercially available, focused on target identification

### Ideon REVEAL

Subsurface Intelligence platform with **proprietary hardware + software**.

**Technology:**
- Muon tomography for deep subsurface scanning
- AI interpretation of muon data
- 3D/4D subsurface models with quantified uncertainty
- Solution-as-a-service model

**Status:** Commercially available, hardware-dependent, expensive

---

## Tier 4: Satellite & Remote Sensing AI Platforms

### Farmonaut

Satellite mineral detection for early-stage exploration.

**Performance:**
- ~92% accuracy for alteration signature identification
- Up to **85% reduction** in early-stage exploration costs
- Rapid target generation from satellite data

**Status:** Commercially available, low-cost entry point

### LYRASENSE

AI-powered GEOINT marketplace with **agentic AI orchestration**.

**Innovation:**
- Multi-provider satellite data integration
- Natural language interface
- Edge deployment on satellite infrastructure (on-orbit processing)
- Agentic AI for autonomous task execution

**Status:** Emerging, defense/intelligence focus expanding to mining

### BlackSky Spectra AI

Real-time GEOINT with automated detection.

**Hardware:**
- Gen-3 satellites (35cm resolution)
- Hourly revisit capability
- NGA Luno A contract

**Technology:**
- AI object detection
- Automated alerts
- Persistent monitoring

**Status:** Commercially available, defense/intelligence focused

### ICEYE

SAR satellite constellation for all-weather monitoring.

**Scale:**
- 60+ satellites
- Gen4 at 16cm resolution
- EUR 1.7B German defense contract
- Achieved profitability in 2025

**Technology:**
- SAR imagery
- All-weather, day/night monitoring
- Defense-grade analytics

**Status:** Commercially available, expanding to civilian applications

---

## Tier 5: Core Scanning & Field AI Technologies

### GeologicAI

Multi-sensor core scanning with **five sensors**: hyperspectral (SWIR/VNIR), XRF, high-res RGB, LiDAR, magnetic susceptibility.

**Performance:**
- Robotic system scans 300-500m/day
- Pixel-level AI fusion generates mineral maps
- Automated RQD, sulfide identification, vein detection
- Added LIBS (Laser-Induced Breakdown Spectroscopy) in December 2025

**Investment:** BHP invested $44M Series B in July 2025

**Status:** Commercially available, mobile trailer units

### Datarock

AI core logging with automated rock typing, structure & mineralogy identification.

**Technology:** Computer vision, automated core logging, AI mineral identification

**Status:** Commercially available

### Imago

Geological image management with cloud-based repository and collaborative annotation.

**Technology:** Cloud image management, collaborative AI, feature identification

**Status:** Commercially available

### Veracio TruScan

Core scanning hardware with hyperspectral analysis (Minalyzer CS system).

**Status:** Field-deployable, competitor to GeologicAI

---

## Tier 6: Seismic & Subsurface AI Interpretation

### Eliis PaleoScan

Seismic interpretation platform with **Relative Geological Time (RGT) technology**.

**Features:**
- AI-assisted tools for horizon and fault interpretation
- Global standard for seismic interpretation
- Energy transition focus (CCS, geothermal)

**Status:** Commercially available, oil & gas focused

### subsurfaceAI

AI-infused seismic interpretation **20-200x faster** than legacy software.

**Capabilities:**
- 2D/3D seismic + well data integration
- Core photo interpretation for litho-facies, Vshale, porosity, permeability
- 4D visualization and SRV estimation
- ML workflows for production data integration

**Status:** Commercially available, oil & gas bias but applicable to mining

### Ivanhoe Electric / CGI

**Typhoon Transmitter** with machine learning inversion for deep sulphide detection.

**Performance:**
- Sulphide detection at >1.5km depth
- BHP alliance partner
- Electrical geophysics AI

**Status:** Commercially available, specialized hardware required

### IBM / NASA Geospatial Foundation Model

Open-sourced on Hugging Face, trained on Harmonized Landsat Sentinel-2 data.

**Performance:**
- 15% better than state-of-the-art with half the labeled data
- Commercial version through **IBM watsonx**

**Applications:**
- Flood mapping
- Burn scar detection
- Land use classification

**Limitation:** Satellite-only, no subsurface integration

---

## Tier 7: Emerging AI Platforms (2025-2026 Startups)

### GeoMinerAI

Integrated data fusion and 3D geological model building with explainable mineral zone prediction.

**Performance:**
- 22% adoption rate
- 90% accuracy
- 60% cost efficiency

**Technology:** Multi-source data fusion, explainable AI, 3D geological modeling

### OreVision DeepNet

Ore grade prediction and resource estimation with Bayesian uncertainty bands.

**Performance:**
- 94% accuracy
- 70% cost efficiency
- Dynamic scenario reporting

**Technology:** Bayesian deep learning, uncertainty quantification

### MineOps RL Suite

Autonomous drilling and mining optimization with reinforcement learning.

**Technology:**
- Reinforcement learning for autonomous operations
- Predictive maintenance
- Field edge-AI
- Real-time anomaly detection

### EnviroPredict AI

Environmental impact prediction with integrated ESG analytics.

**Technology:**
- ESG analytics
- Tailings and closure risk management
- Satellite/field data fusion
- Sustainability focus

---

## Tier 8: BHP Xplor 2026 Cohort

BHP expanded to a **record 10 companies** in 2026, each receiving $500K equity-free funding, mentoring, and BHP specialist access.

### RadiXplore (Australia)
- Maximizing AI applications in mining sector

### Mineural (Canada)
- AI mineral exploration and target generation

### VectOres Science (US)
- Water and isotope chemistry platform for mining data

### Discovery Genomics (Canada)
- DNA sequencing as a new tool for mineral exploration

---

## Technology Maturity Matrix

| Platform | Foundation Models | Physics-Informed | Diffusion/Generative | Graph Neural Nets | Multimodal LLM | Semi-Supervised | XAI |
|----------|-------------------|----------------|---------------------|-------------------|----------------|-----------------|-----|
| **BHP Internal** | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| **Rio Tinto RTVis** | — | ✓ | — | — | ✓ | — | ✓ |
| **Leapfrog 2025.1** | — | — | — | — | — | — | — |
| **Maptek DomainMCF** | — | — | — | — | — | ✓ | ✓ |
| **VRIFY AI** | — | — | — | — | — | ✓ | ✓ |
| **KoBold Metals** | ✓ | — | — | — | — | ✓ | — |
| **GeologicAI** | — | — | — | — | ✓ | — | — |
| **subsurfaceAI** | — | ✓ | — | — | — | ✓ | — |
| **Farmonaut** | — | — | — | — | ✓ | ✓ | — |
| **LYRASENSE** | ✓ | — | — | — | ✓ | ✓ | — |
| **IBM/NASA Geo FM** | ✓ | — | — | — | ✓ | ✓ | — |
| **GeoMinerAI** | — | — | — | — | — | ✓ | ✓ |
| **OreVision** | — | — | — | — | — | ✓ | ✓ |

**Key finding**: No platform covers more than 4 of the 7 technologies. The convergence opportunity is wide open.

## References

- BHP AI Hub launch. May 2025.
- Rio Tinto RTVis and Fleet Space partnership. 2025.
- Seequent Leapfrog 2025.1 release notes. June 2025.
- Maptek DomainMCF and GeologyCore 2025. 2025.
- VRIFY AI platform documentation. 2025.
- GeologicAI Series B funding. July 2025.
- subsurfaceAI platform documentation. 2025.
- BHP Xplor 2026 cohort announcement. 2026.
