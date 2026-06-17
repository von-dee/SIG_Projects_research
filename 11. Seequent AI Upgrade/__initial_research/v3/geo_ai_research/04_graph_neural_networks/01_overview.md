# Graph Neural Networks (GNNs) for Geological Modeling

## Overview

Geology is fundamentally a graph problem. Rock units, faults, veins, contacts, alteration zones, and mineral deposits all exist in a web of spatial, temporal, and genetic relationships. Traditional voxel-based modeling in Vulcan or Surpac treats each block as independent — missing the rich topological structure that defines geological systems.

Graph Neural Networks (GNNs) are uniquely suited to model this relational structure. They operate on graph-structured data where:
- **Nodes** represent geological entities (rock units, drill holes, mineral occurrences)
- **Edges** represent relationships (contacts, faults cutting, alteration overprinting, spatial proximity)
- **Node features** describe properties (lithology, grade, age, depth)
- **Edge features** describe relationship types (conformable, unconformable, faulted, intruded)

## Why This Disrupts Legacy Tools

**Vulcan and Surpac** use voxel-based or wireframe representations:
- Each block/voxel is independent
- Spatial relationships are implicit (proximity in grid)
- Cannot model long-distance geological connections
- No representation of genetic relationships (e.g., this vein is younger than this fault)

**GNNs enable:**
- **Explicit relationship modeling** between all geological features
- **Long-distance dependencies** (e.g., district-scale structural controls)
- **Genetic reasoning** (sequence of events, overprinting relationships)
- **Attention-driven feature importance** (which relationships matter most?)
- **Multi-scale integration** (outcrop -> deposit -> district -> belt)

## Key Technical Advances (2025-2026)

### KDCGAT: Knowledge-Data Collaboration Graph Attention Network (November 2025)

Published in a leading geoscience journal, KDCGAT integrates three critical data types for mineral prospectivity:

1. **Fracture structures** — Lineaments, faults, shear zones from remote sensing
2. **Remote sensing alteration** — ASTER/Landsat-derived alteration maps
3. **Geochemical anomalies** — Stream sediment, soil, rock geochemistry

**Architecture:**
- Input Graph: Nodes = grid cells or geological entities; Node features = alteration signature, geochemical anomaly, fracture density
- Knowledge Integration: Structural geology rules, magmatic activity timing, spatiotemporal deposit models
- Graph Attention: Self-attention learns which nodes are geologically correlated; attention weights interpretable as geological importance
- Output: Prospectivity score per node, Class A/B target classification, uncertainty quantification

**Performance on Eastern Tien Shan copper belt:**
- **85.9% copper deposit identification accuracy**
- Outperforms Weight of Evidence by **7%**
- Outperforms GCN by **11.3%**
- Outperforms CNN by **19.7%**
- Ablation: **21.1% improvement** over baseline GAT

### ADGCN: Attention-Driven Graph Convolutional Network (April 2025)

Published in Ore Geology Reviews, ADGCN addresses a critical GNN limitation: **direct geographic connections miss long-distance geological relationships**.

**Problem**: Standard GNNs connect nodes based on geographic proximity. But in geology, genetically related features may be kilometers apart (e.g., distal alteration halo around a porphyry center).

**Solution**: Attention mechanism dynamically selects highly correlated nodes for connection, regardless of geographic distance.

**Performance in Lhasa region:**
- **91.67% AUC** for mineral prospectivity
- Surpasses GAT by **2.65%**
- Successfully identifies district-scale structural controls invisible to CNNs

### Multisource Fusion with GNNs

A 2025 review in ScienceDirect evaluates deep learning architectures for distinct geological data characteristics:

| Data Type | Best Architecture | Why |
|-----------|------------------|-----|
| Spatial grids (seismic, gravity) | CNNs | Local spatial patterns |
| Sequences (drill logs, stratigraphy) | RNNs/Transformers | Temporal ordering |
| Graph topologies (faults, contacts) | GNNs | Relational structure |
| Multisource fusion | GNNs + CNNs + RNNs | Complementary strengths |

**Key insight**: GNNs are the natural integration layer because geological knowledge graphs can incorporate grid data (as node features), sequence data (as temporal edges), and topological data (as structural edges).

## Technical Architecture

### Graph Construction for Geology

**Step 1: Node Definition**
- Drill hole nodes: location, depth, lithology, assays
- Rock unit nodes: stratigraphic position, age, composition
- Fault nodes: orientation, displacement, timing
- Alteration zone nodes: type, intensity, spatial extent
- Mineral occurrence nodes: commodity, grade, tonnage

**Step 2: Edge Definition**
- Spatial edges: proximity within X meters
- Stratigraphic edges: conformable contact, unconformity
- Structural edges: fault cuts, fold hinge
- Genetic edges: intrusion emplaces, alteration overprints
- Temporal edges: older-than, younger-than, synchronous

**Step 3: Feature Engineering**
- Node features: categorical (lithology_code, alteration_type), continuous (depth, grade, thickness), derived (distance_to_fault, alteration_index)
- Edge features: type (contact, fault, intrusion), distance, orientation, timing

### GNN Layer Design

**Message Passing Framework:**
For each node v in graph:
1. Aggregate messages from neighbors: m_v = AGGREGATE({h_u for u in N(v)})
2. Update node representation: h_v' = UPDATE(h_v, m_v)

Where h_v is the hidden state (embedding) of node v, N(v) are neighbors, AGGREGATE is sum/mean/max/attention, and UPDATE is a neural network.

**Attention Mechanism (GAT/KDCGAT):**
- Attention coefficient: e_vu = a(W*h_v, W*h_u)
- Normalized attention: alpha_vu = softmax_u(e_vu)
- Updated node state: h_v' = sigma(Sum_u alpha_vu * W * h_u)

Where W is a learnable weight matrix, a is an attention function, and alpha_vu is the interpretable attention weight.

### Multi-Scale Graph Construction

**Level 1: Outcrop scale**
- Nodes: Rock samples, structural measurements
- Edges: Physical contact, measured orientation

**Level 2: Deposit scale**
- Nodes: Drill holes, geological domains
- Edges: Stratigraphic correlation, structural control

**Level 3: District scale**
- Nodes: Deposits, prospects, alteration centers
- Edges: District-scale structures, metallogenic belts

**Level 4: Regional scale**
- Nodes: Tectonic domains, basins, belts
- Edges: Plate boundaries, terrane boundaries

Cross-scale edges connect levels: sample belongs to domain, deposit in district, district in region.

## Applications in Mining and Geology

| Application | Traditional Method | GNN Method | Improvement |
|-------------|-------------------|------------|-------------|
| Mineral prospectivity | Weight of Evidence | KDCGAT/ADGCN | +7-20% accuracy |
| Structural domain classification | Manual interpretation | GNN on fault network | Automated, consistent |
| Alteration zonation | Visual interpretation | GNN on geochemical graph | Objective, reproducible |
| Resource domaining | Geostatistical clustering | GNN on drill hole graph | Geologically informed |
| Metallogenic belt analysis | Expert synthesis | Multi-scale GNN | Systematic, scalable |
| Drill target ranking | Subjective scoring | GNN prospectivity | Evidence-based |

## Explainability: Why GNNs Are Critical for Trust

Unlike black-box CNNs, GNN attention weights are **directly interpretable**:

Example: Attention weight of 0.85 between a porphyry copper deposit node and a regional fault intersection node means the model believes this deposit is strongly controlled by the fault intersection. This is geologically plausible and verifiable by human experts.

**XAI techniques for GNNs:**
- Attention visualization: Heat maps of node-node importance
- Subgraph extraction: Which part of the graph influenced the prediction?
- Counterfactual analysis: What if this fault did not exist?
- GNNExplainer: Identify compact subgraph structures driving predictions

## Integration with Knowledge Graphs

GNNs and knowledge graphs are natural partners:

**Knowledge Graph (static, human-curated):**
- Ontology: Rock types, alteration types, deposit models
- Rules: Porphyry copper systems have potassic alteration
- Literature: Published relationships between geological features

**GNN (dynamic, learned):**
- Embeddings: Learned representations of geological concepts
- Attention: Discovered relationships not in knowledge graph
- Generalization: Transfer to new geological settings

**Integration:**
- Knowledge graph initializes GNN structure
- GNN learns from data, updates knowledge graph
- Feedback loop: Human experts validate, refine ontology

## Limitations and Challenges

- **Graph construction is hard**: Defining nodes, edges, and features requires geological expertise
- **Scale limitations**: Very large graphs (millions of nodes) challenge current GNN implementations
- **Dynamic graphs**: Geological understanding evolves; graphs must update as new data arrives
- **Heterogeneous graphs**: Different node types (drill holes, faults, rock units) require specialized architectures
- **Transferability**: GNNs trained on one deposit type may not generalize to novel geological settings

## Future Directions

- **Dynamic GNNs**: Graphs that update in real-time as new drill data arrives
- **Heterogeneous GNNs**: Specialized message passing for different node/edge types
- **Graph transformers**: Attention across entire graph (not just neighbors) for global geological reasoning
- **Neural-symbolic integration**: Combine GNN learning with symbolic geological rules
- **Cross-deposit transfer**: Pre-train on multiple deposit types, fine-tune on new targets

## References

- KDCGAT: Knowledge-Data Collaboration Graph Attention Network. November 2025.
- ADGCN: Attention-Driven Graph Convolutional Network. Ore Geology Reviews, April 2025.
- ScienceDirect. Deep learning architectures for geological data characteristics. 2025.
- Frontiers. GNN optimization with knowledge graph construction for mineral resources. 2025.
