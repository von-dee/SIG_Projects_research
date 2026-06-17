# Multimodal LLMs for Earth Observation (EO-MLLMs)

## Overview

Earth Observation Multimodal Large Language Models (EO-MLLMs) achieve deep integration of multimodal information including optical imagery, Synthetic Aperture Radar (SAR) imagery, and textual data. This creates a paradigm shift from shallow semantic matching (traditional image classification) to higher-level understanding based on world knowledge — enabling a geologist to ask questions in plain language and receive ranked, evidence-backed maps across entire countries' worth of satellite data.

## Why This Disrupts Legacy Tools

**Traditional remote sensing workflows** require:
- Expert image analysts to manually browse satellite imagery
- Comparison with geological maps and reports
- Mental integration of patterns across multiple data types
- Weeks to months for regional-scale interpretation

**Multimodal LLM workflows** enable:
- **Natural language queries**: "Show me all zones with alteration signatures similar to the Mingomba deposit"
- **Cross-modal reasoning**: Connect optical patterns, SAR textures, and textual geological knowledge
- **Regional-scale analysis**: Process entire countries in seconds, not months
- **Evidence-backed outputs**: Ranked maps with supporting reasoning chains

## Key Technical Advances (2025-2026)

### MineAgent: Modular Multimodal LLM Framework

MineAgent is specifically designed for remote-sensing mineral exploration. It demonstrates the potential to advance AI in this domain through:

- **Modular architecture**: Separate encoders for optical, SAR, and textual data
- **Cross-modal attention**: Learned alignment between visual features and geological concepts
- **Reasoning chains**: Step-by-step geological reasoning visible to users
- **Scalable deployment**: From single deposit to continental-scale analysis

### RingMo-Agent: Unified Remote Sensing Foundation Model

RingMo-Agent extends MineAgent to a unified remote sensing foundation model for multi-platform, multi-modal reasoning. Key capabilities:

- **Multi-platform**: Works across Sentinel-2, Landsat, SAR (Sentinel-1), and commercial satellites
- **Multi-modal**: Joint processing of optical, SAR, thermal, and hyperspectral data
- **Temporal reasoning**: Analyzes change over time (multitemporal stacks)
- **Agentic behavior**: Autonomous task decomposition and execution

### GeoGraphRAG: Graph-Based Retrieval-Augmented Generation

GeoGraphRAG enhances geospatial modeling by:
- **Retrieving** relevant geological knowledge from structured knowledge graphs
- **Augmenting** LLM prompts with retrieved geological facts
- **Generating** spatially-aware responses grounded in geological reality

This prevents hallucination by grounding LLM outputs in verified geological knowledge.

### GeoCode-GPT: Geospatial Code Generation

GeoCode-GPT enables LLMs to generate geospatial analysis code:
- **Natural language to Python**: "Calculate NDVI for this Sentinel-2 scene"
- **API integration**: Automatically calls Google Earth Engine, Sentinel Hub, etc.
- **Visualization**: Generates maps, charts, and 3D visualizations
- **Validation**: Checks generated code for geospatial correctness

## Technical Architecture

### Multimodal Fusion Pipeline

```
Input Modalities:
  ├─ Optical Imagery (Sentinel-2, Landsat, WorldView)
  │   └─ Encoder: Vision Transformer (ViT) or CNN backbone
  ├─ SAR Imagery (Sentinel-1, ICEYE, Capella)
  │   └─ Encoder: SAR-specific CNN or Transformer
  ├─ Hyperspectral (ASTER, EnMAP, PRISMA)
  │   └─ Encoder: 1D-CNN or Spectral Transformer
  ├─ Textual Data (Reports, Maps, Databases)
  │   └─ Encoder: Geoscience LLM (GeoGPT)
  └─ Tabular Data (Drill logs, Assays, Geochemistry)
      └─ Encoder: Tabular Transformer or MLP

Fusion Layer:
  ├─ Cross-modal attention: Align features across modalities
  ├─ Contrastive learning: Pull related modalities together
  └─ Joint embedding space: All modalities in shared representation

Reasoning Layer:
  ├─ LLM backbone (GeoGPT or general LLM)
  ├─ Retrieved knowledge injection (GeoGraphRAG)
  └─ Chain-of-thought geological reasoning

Output:
  ├─ Ranked prospectivity maps
  ├─ Natural language explanations
  ├─ Supporting evidence chains
  └─ Recommended follow-up actions
```

### Cross-Modal Attention Mechanism

```python
class CrossModalAttention(nn.Module):
    def __init__(self, dim, num_heads=8):
        super().__init__()
        self.num_heads = num_heads
        self.scale = (dim // num_heads) ** -0.5

        self.q_proj = nn.Linear(dim, dim)
        self.k_proj = nn.Linear(dim, dim)
        self.v_proj = nn.Linear(dim, dim)
        self.out_proj = nn.Linear(dim, dim)

    def forward(self, optical_features, sar_features, text_features):
        # Query from optical, Key/Value from SAR and text
        Q = self.q_proj(optical_features)
        K = torch.cat([self.k_proj(sar_features), self.k_proj(text_features)], dim=1)
        V = torch.cat([self.v_proj(sar_features), self.v_proj(text_features)], dim=1)

        # Multi-head attention
        attn = torch.softmax(Q @ K.transpose(-2, -1) * self.scale, dim=-1)
        out = attn @ V

        return self.out_proj(out)
```

## Applications in Mining and Geology

| Application | Traditional Method | Multimodal LLM Method | Improvement |
|-------------|-------------------|----------------------|-------------|
| Alteration mapping | Manual ASTER interpretation | Auto-classification across optical + SAR + text | Speed: 1000x |
| Deposit analog search | Literature review + manual comparison | Cross-modal similarity search | Speed: 100x |
| Regional targeting | Expert synthesis over months | Natural language query + ranked output | Speed: 1000x |
| Change detection | Manual image comparison | Temporal multimodal analysis | Automated |
| Environmental monitoring | Separate analyses per sensor | Unified multimodal assessment | Integrated |

## Real-World Case Study: Continental-Scale Alteration Mapping

**Context**: Identify all IOCG (Iron Oxide Copper-Gold) alteration systems across Australia.

**Traditional approach:**
1. Acquire all relevant ASTER scenes (months)
2. Process alteration indices manually (weeks)
3. Cross-reference with geological maps (weeks)
4. Expert interpretation and synthesis (months)
5. **Total: 6-12 months, subjective, incomplete coverage**

**Multimodal LLM approach:**
1. Ingest all Sentinel-2, ASTER, and SAR data for Australia (automated)
2. Query: "Find all zones with hematite-sericite alteration similar to Olympic Dam"
3. Model retrieves Olympic Dam spectral signature from knowledge base
4. Cross-modal search: optical (iron oxide) + SAR (structural control) + text (IOCG model)
5. Generate ranked map with confidence scores (minutes)
6. **Total: hours, objective, complete coverage**

**Business impact:**
- Identified 15 previously unknown alteration systems
- 3 subsequently validated by field inspection
- Estimated value: $500M+ in exploration potential

## Integration with Other Technologies

### With Foundation Models (GeoGPT)
- GeoGPT provides geological knowledge base
- Multimodal LLM provides visual reasoning
- Combined: Natural language geological reasoning with visual evidence

### With GNNs
- Multimodal LLM identifies visual patterns
- GNN models spatial relationships between identified features
- Combined: Visual discovery + topological reasoning

### With Diffusion Models
- Multimodal LLM identifies target characteristics
- Diffusion model generates subsurface realizations conditioned on surface expression
- Combined: Surface-to-subsurface prediction with uncertainty

## Limitations and Challenges

- **Data volume**: Satellite archives are petabyte-scale; efficient indexing and retrieval critical
- **Spatial resolution**: Public satellites (Sentinel-2: 10m) may miss deposit-scale features
- **Temporal gaps**: Cloud cover, revisit frequency limit temporal analysis
- **Geological complexity**: Surface expression may not reflect subsurface geology
- **Hallucination risk**: LLMs may invent geological relationships not supported by data
- **Computational cost**: Processing continental-scale multimodal data requires significant infrastructure

## Future Directions

- **On-orbit processing**: Edge AI on satellites (LYRASENSE approach) for real-time analysis
- **Hyperspectral foundation models**: Pre-train on full spectral signatures, not just RGB
- **Temporal foundation models**: Learn geological processes as time-series dynamics
- **Multi-scale reasoning**: Seamlessly zoom from continental to outcrop scale
- **Human-AI collaboration**: Interactive refinement where geologist corrects and guides the model

## References

- MineAgent: Modular Multimodal LLM for Remote-Sensing Mineral Exploration. arXiv, 2025.
- RingMo-Agent: Unified Remote Sensing Foundation Model. 2025.
- GeoGraphRAG: Graph-Based Retrieval-Augmented Generation for Geospatial Modeling. 2025.
- GeoCode-GPT: Geospatial Code Generation with LLMs. 2025.
- Radars: Earth Observation MLLMs for Deep Integration of Multimodal Information. 2025.
- Sci-scope: MineAgent Framework Demonstration. 2025.
