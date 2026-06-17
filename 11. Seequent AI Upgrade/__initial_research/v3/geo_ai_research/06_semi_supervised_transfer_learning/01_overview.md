# Semi-Supervised & Transfer Learning for Geology

## Overview

Semi-supervised methods and transfer learning are critical practical advances for mining, where labeled data is scarce and expensive. A typical deposit might have 50,000 meters of unlabeled drill core but only 500 meters with detailed mineralogy, geochemistry, and structural logging. Semi-supervised approaches learn from the unlabeled majority. Transfer learning enables models trained on one geology to be adapted to new regions with minimal additional data.

## Why This Disrupts Legacy Tools

**Traditional machine learning** requires:
- Large labeled datasets (thousands of examples per class)
- Expensive expert annotation (geologists logging every drill meter)
- Retraining from scratch for each new deposit or region
- Risk of overfitting to specific geological settings

**Semi-supervised and transfer learning** enable:
- **Learning from unlabeled data**: Use the 99% of data that lacks detailed labels
- **Cross-deposit transfer**: Apply models trained on Olympic Dam to a new IOCG target
- **Domain adaptation**: Adjust for different alteration styles, host rocks, or tectonic settings
- **Few-shot learning**: Adapt to new deposit types with just 10-50 labeled examples

## Key Technical Advances (2025-2026)

### Self-Supervised Pre-Training for Seismic Data (November 2025)

An AGU paper on seismic subsurface characterization identifies **unsupervised pre-training followed by supervised fine-tuning** as the key paradigm:

1. **Self-supervised learning** develops a "Seismic Data Feature Extraction Engine" (SDFEE) from massive unlabeled seismic volumes
2. The feature extractor is **frozen** and used as the backbone for specific geological targets
3. Only the task-specific head requires labeled data

**Performance**: Pre-trained models achieve **90%+ accuracy** on downstream tasks with **< 10% labeled data** compared to training from scratch.

### Domain-Adaptive Learning for Mining

A 2025 Springer review identifies **domain-adaptive learning** as a key emerging direction:

- **Source domain**: Well-studied deposit (e.g., Olympic Dam, Escondida)
- **Target domain**: New exploration target with different geology
- **Adaptation**: Align feature distributions between source and target

**Techniques:**
- **DANN (Domain-Adversarial Neural Networks)**: Train feature extractor to fool a domain classifier
- **MMD (Maximum Mean Discrepancy)**: Minimize statistical distance between domains
- **CORAL (Correlation Alignment)**: Align second-order statistics of feature distributions

### Bias Mitigation in Training Data

A Cleantech Group analysis highlights a critical challenge: **if AI models are trained only on data from known deposits, they risk reinforcing old exploration patterns**. Semi-supervised approaches help break this by:

- **Learning from unlabeled data**: Discover patterns not in labeled training sets
- **Negative sampling**: Explicitly learn what "non-deposit" looks like
- **Generative augmentation**: Create synthetic examples of underrepresented geology

## Technical Architecture

### Semi-Supervised Learning Pipeline

```
Stage 1: Unsupervised Pre-Training
  Input: Large unlabeled dataset (drill logs, seismic, satellite)
  Method: Contrastive learning, masked prediction, or clustering
  Output: Pre-trained feature extractor

Stage 2: Pseudo-Labeling
  Input: Pre-trained model + unlabeled data
  Method: Model predicts labels for unlabeled data; high-confidence predictions become pseudo-labels
  Output: Expanded labeled dataset

Stage 3: Supervised Fine-Tuning
  Input: Pseudo-labeled data + small true labeled dataset
  Method: Standard supervised training with class balancing
  Output: Task-specific model

Stage 4: Confidence Calibration
  Input: Fine-tuned model
  Method: Temperature scaling, Platt scaling
  Output: Well-calibrated uncertainty estimates
```

### Transfer Learning Strategies

| Strategy | When to Use | Method | Data Required |
|----------|-------------|--------|---------------|
| **Fine-tuning** | Source and target similar | Unfreeze all layers, small LR | 100-1000 labels |
| **Feature extraction** | Source and target very different | Freeze backbone, train new head | 50-200 labels |
| **Adapter layers** | Medium similarity | Add small adapter modules | 100-500 labels |
| **Prompt tuning** | LLM adaptation | Learn soft prompts | 10-50 labels |
| **Domain adaptation** | Different geology | Adversarial alignment | 100-500 labels + unlabeled target |

### Contrastive Learning for Geology

```python
class GeologicalContrastiveLearner(nn.Module):
    def __init__(self, encoder, projection_dim=128):
        super().__init__()
        self.encoder = encoder
        self.projector = nn.Sequential(
            nn.Linear(encoder_dim, projection_dim),
            nn.ReLU(),
            nn.Linear(projection_dim, projection_dim)
        )

    def forward(self, x1, x2):
        # x1, x2 are two augmented views of the same geological sample
        z1 = F.normalize(self.projector(self.encoder(x1)), dim=1)
        z2 = F.normalize(self.projector(self.encoder(x2)), dim=1)

        # NT-Xent loss (Normalized Temperature-scaled Cross Entropy)
        similarity = torch.mm(z1, z2.T) / temperature
        loss = -torch.log(torch.diag(torch.exp(similarity)) / torch.sum(torch.exp(similarity), dim=1))
        return loss.mean()
```

**Augmentations for geological data:**
- **Spatial**: Random crops, flips, rotations of drill log segments or seismic patches
- **Spectral**: Random noise, amplitude scaling for geophysical data
- **Temporal**: Time shifts for time-series data (monitoring wells)
- **Geological**: Synthetic faulting, folding, erosion (physics-based augmentation)

## Applications in Mining and Geology

| Application | Labeled Data | Unlabeled Data | Semi-Supervised Benefit |
|-------------|-------------|----------------|------------------------|
| Drill log lithology classification | 500m logged | 50,000m unlogged | 50x data utilization |
| Alteration mapping | 10 mapped zones | 1000km2 unmapped | 100x coverage |
| Mineral prospectivity | 5 known deposits | 10,000 grid cells | 2000x spatial coverage |
| Geochemical anomaly detection | 100 assays | 10,000 stream samples | 100x sensitivity |
| Seismic facies classification | 100 interpreted sections | 10,000km of seismic | 100x training data |

## Real-World Case Study: Cross-Deposit Transfer

**Context**: Gold exploration company with data from 3 producing mines, exploring 10 new greenfield targets across different geological settings.

**Traditional approach:**
- Hire geologists to log all drill holes at each new target (expensive, slow)
- Build separate models for each deposit type (inefficient)
- **Result**: 2-3 years to build reliable models per target

**Transfer learning approach:**
1. Pre-train on 3 mines (orogeny gold, intrusion-related, epithermal)
2. Fine-tune on 50-100 labeled drill meters per new target
3. Use semi-supervised learning on remaining unlabeled drill data
4. **Result**: 2-3 months to deploy reliable models per target

**Performance metrics:**
- Lithology classification accuracy: 85% (vs. 92% for fully supervised on same deposit)
- Alteration identification: 78% (vs. 88% fully supervised)
- **Trade-off**: 10-15% accuracy reduction for 10x speed and 100x cost reduction

## Limitations and Challenges

- **Domain gap**: Large geological differences (e.g., Archean greenstone vs. Cenozoic porphyry) may defeat transfer learning
- **Negative transfer**: Pre-training on inappropriate geology can hurt performance
- **Pseudo-label quality**: Low-quality pseudo-labels propagate errors
- **Class imbalance**: Mineral deposits are rare; semi-supervised methods may miss subtle signals
- **Temporal drift**: Geological models trained on old data may not reflect current understanding

## Future Directions

- **Foundation model pre-training**: Pre-train on all available geological data, fine-tune for specific tasks
- **Continual learning**: Update models as new data arrives without catastrophic forgetting
- **Active learning**: Model selects which unlabeled samples to annotate next (information gain)
- **Multi-task learning**: Joint training on lithology, alteration, structure, mineralization simultaneously
- **Cross-modal transfer**: Transfer from satellite imagery to subsurface geology

## References

- AGU 2025. Self-supervised pre-training for seismic subsurface characterization.
- Springer 2025. Semi-supervised methods and domain-adaptive learning for mining.
- Cleantech Group 2025. Bias in training data and semi-supervised approaches.
- Minerals 2025. Transfer learning, unsupervised learning, and multi-source data fusion.
