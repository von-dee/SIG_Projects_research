# Foundation Models for Geoscience

## Overview

Foundation models represent the biggest paradigm shift in geoscience AI. Rather than training separate models for each task, these models are pre-trained on massive, diverse geoscientific datasets and fine-tuned for specific applications. This approach mirrors the success of GPT and BERT in natural language processing, but adapted for the unique multimodal nature of geological data.

## Why This Disrupts Legacy Tools

**Surpac and Leapfrog** require expert geologists to manually interpret and input data. Foundation models can automate that interpretation pipeline end-to-end:

- **Drill log interpretation**: Auto-extract lithology, assays, RQD from LAS/CSV files
- **Report analysis**: Parse PDF geological reports for entities, relations, and concepts
- **Cross-domain reasoning**: Connect geological concepts across literature, maps, and databases
- **Knowledge graph construction**: Build mineral-prospecting knowledge graphs in minutes instead of months

## Key Models and Platforms

### GeoGPT (Zhejiang Lab, April 2025)

The flagship geoscience foundation model. Ships with three open-weight variants:

| Variant | Parameters | Focus |
|---------|-----------|-------|
| `Llama3.1-70B-GeoGPT` | 70B | General geoscience reasoning |
| `Qwen2.5-72B-GeoGPT` | 72B | Chinese-language geoscience |
| `GeoGPT-R1-Preview` | 70B | Reasoning model with four core functions |

**Four core functions of GeoGPT-R1-Preview:**

1. **Deep Discovery** — Iterative research agent that autonomously explores geoscience literature
2. **Reader & Extractor** — Automated entity recognition and relation extraction from geological texts
3. **Map Chat & Map Generator** — Conversational GIS interface for spatial queries
4. **My Library** — Personal knowledge management for geoscientists

**Governance**: Independent international governance committee oversees the model, which matters for regulatory credibility in JORC/NI 43-101 contexts.

### BB-GeoGPT (January 2025)

A smaller, specialized model built on LLaMA-2-7B with three purpose-built corpora:

- **BB-GeoPT** — Pretraining corpus for general geoscience knowledge
- **BB-GeoSFT** — Supervised fine-tuning corpus for task-specific performance
- **BB-GeoEval** — Evaluation benchmark for geoscience reasoning tasks

**Key insight**: Even smaller, domain-adapted models can outperform general LLMs on geoscience reasoning tasks through careful corpus construction.

### Earth Foundation Models

Foundation models pre-trained on satellite imagery (optical, SAR, multitemporal) are creating a paradigm shift from shallow semantic matching to higher-level geological understanding based on world knowledge. These can be fine-tuned on a mine's specific geology with relatively little data.

**IBM / NASA Geospatial Foundation Model** (open-sourced on Hugging Face):
- Trained on Harmonized Landsat Sentinel-2 (HLS) satellite data
- **15% improvement over state-of-the-art** with half the labeled data
- Commercial version through **IBM watsonx Environmental Intelligence Suite**
- Applications: flood mapping, burn scar detection, land use classification

### Geoscience Knowledge Graphs

GeoGPT automates the construction of high-quality mineral-prospecting knowledge graphs by performing:
- **Ontology definition** — Structured geological taxonomies
- **Entity recognition** — Identifying rock types, minerals, structures, deposits
- **Relation extraction** — Mapping spatial, temporal, and genetic relationships

This process previously took expert teams **months** of manual curation.

## Technical Architecture

```
Input Layer:
  ├─ Geoscience Literature (1M+ papers)
  ├─ Drill Logs & Assays
  ├─ Satellite Imagery
  ├─ Historical Reports (PDF)
  └─ Geochemical Databases

Pre-training:
  ├─ Tokenization on 5.5B geoscience tokens
  ├─ Masked language modeling
  ├─ Contrastive learning (text-image pairs)
  └─ Knowledge graph embedding

Fine-tuning:
  ├─ Task-specific adapters (LoRA)
  ├─ Domain-specific instruction tuning
  └─ Reinforcement learning from human feedback

Output:
  ├─ Natural language geological reasoning
  ├─ Automated knowledge graph construction
  ├─ Cross-modal retrieval (text -> map, image -> report)
  └─ Regulatory-compliant report drafting
```

## Real-World Applications

| Application | Traditional Time | Foundation Model Time | Improvement |
|-------------|-----------------|----------------------|-------------|
| Literature review for new project | 2-3 weeks | 2-3 hours | **50x** |
| Knowledge graph construction | 3-6 months | 15-30 minutes | **~500x** |
| Report entity extraction | 1-2 days per report | < 1 minute | **~1000x** |
| Cross-deposit analog reasoning | Expert consultation | Instant query | **Continuous** |

## Limitations and Challenges

- **Hallucination risk**: Geological reasoning requires factual precision; models may generate plausible-sounding but incorrect geological relationships
- **Data bias**: Training on published literature over-represents well-studied deposits; under-represents frontier terranes
- **Multilingual gaps**: Most models trained on English/Chinese literature; limited coverage of Spanish, Portuguese, Russian geological literature
- **Regulatory acceptance**: JORC and NI 43-101 require transparent, auditable methodologies; black-box foundation models face adoption barriers without XAI integration

## Future Directions

- **Multimodal foundation models** that jointly process text, imagery, seismic, and drill data in a single architecture
- **Real-time updating** as new drill data arrives, enabling living knowledge graphs
- **Collaborative reasoning** across multiple foundation models (ensemble approaches)
- **Edge deployment** for field geologists with limited connectivity

## References

- Zhejiang Lab. GeoGPT: Open-Weight Geoscience Foundation Model. April 2025.
- BB-GeoGPT: Building Blocks for Geoscience Language Models. January 2025.
- IBM / NASA. Geospatial Foundation Model. Hugging Face, 2023-2025.
- Nature. Earth Foundation Models: From Shallow Semantic Matching to Higher-Level Understanding.
