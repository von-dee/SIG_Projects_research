# Explainable AI (XAI) for Geology

## Overview

Explainable AI (XAI) is a major emerging research direction in geoscience, addressing the need for scientific transparency so geologists can validate and trust AI predictions. This is critical for regulatory reporting (JORC, NI 43-101) where the "competent person" must understand and take responsibility for all estimates. A black-box prediction — no matter how accurate — is useless if it cannot be explained, verified, and defended.

## Why This Is Critical for Adoption

**The trust barrier:**
- Geologists have decades of training and field experience
- They will not act on predictions they cannot understand or verify
- Regulators require transparent, auditable methodologies
- Insurance and financing require defensible technical bases

**XAI bridges the gap:**
- Shows *which* geological features drove the prediction
- Quantifies *how much* each feature contributed
- Enables *what-if* analysis (counterfactual reasoning)
- Generates *audit trails* for regulatory compliance

## Key Technical Advances (2025-2026)

### SHAP for Geological Feature Importance

SHAP (SHapley Additive exPlanations) values quantify each geological feature's contribution to a prediction:

```
Prediction = Base Value + SHAP(feature_1) + SHAP(feature_2) + ... + SHAP(feature_n)

Where:
  Base Value: Average prediction across all training samples
  SHAP(feature_i): Contribution of feature i to this specific prediction
```

**Example for mineral prospectivity:**
```
Prediction: 0.85 (high prospectivity)
Base value: 0.32 (average across region)

SHAP contributions:
  + Proximity to major fault: +0.18
  + Potassic alteration signature: +0.15
  + Magnetic anomaly (high): +0.12
  + Copper geochemical anomaly: +0.08
  - Distance to known deposit > 10km: -0.02
  - Sedimentary host rock: -0.01

Total: 0.32 + 0.18 + 0.15 + 0.12 + 0.08 - 0.02 - 0.01 = 0.82
(Plus small interaction terms)
```

**Interpretation**: The model believes this location is highly prospective primarily because of its proximity to a major fault (+0.18), potassic alteration (+0.15), and magnetic signature (+0.12). These are all geologically plausible controls for porphyry copper mineralization.

### Attention Maps for Drill Hole Influence

In transformer-based or attention-driven models, attention weights reveal which drill holes, seismic traces, or satellite pixels influenced the prediction:

```
For a 3D subsurface model prediction at location (x, y, z):
  Attention[drill_hole_1] = 0.35  <- Most influential
  Attention[drill_hole_2] = 0.28
  Attention[seismic_trace_A] = 0.15
  Attention[seismic_trace_B] = 0.12
  Attention[satellite_pixel] = 0.08
  Attention[regional_trend] = 0.02
```

**Interpretation**: The prediction is primarily driven by two nearby drill holes (35% and 28% attention). A geologist can verify these drill holes are high-quality, properly logged, and geologically representative.

### Constitutive Relation Monitoring for PINNs

A critical innovation for physics-based models: **constitutive relation checks** verify that PINN predictions strictly obey physical laws:

```
For each prediction:
  1. Compute stress tensor from PINN output
  2. Check: Does stress satisfy Hooke's law? (stress = C : strain)
  3. Check: Does fluid flux satisfy Darcy's law? (q = -K * grad(h))
  4. Check: Does energy flux satisfy Fourier's law? (q = -k * grad(T))

  If any check fails:
    - Flag prediction as "physics-violating"
    - Increase uncertainty bounds
    - Trigger model retraining or expert review
```

**Regulatory value**: Demonstrates that AI predictions are not just statistically likely but physically impossible to violate — a powerful argument for regulatory acceptance.

### Generalized Additive Models (GAM) for Interpretable Spatial Prediction

GAMs provide a middle ground between black-box neural networks and simple linear models:

```
Prediction = f_1(distance_to_fault) + f_2(alteration_intensity) + f_3(magnetic_anomaly) + ...

Where each f_i is a smooth, learnable function of a single feature.
```

**Advantage**: Each feature's contribution is visualizable as a smooth curve. Geologists can verify that "closer to fault = higher prospectivity" makes geological sense.

## XAI Techniques Comparison

| Technique | Model Type | Output | Best For | Limitation |
|-----------|-----------|--------|----------|------------|
| **SHAP** | Any | Feature importance scores | Global and local explanations | Computationally expensive for large models |
| **LIME** | Any | Local linear approximation | Quick, approximate explanations | Unstable for complex decision boundaries |
| **Attention maps** | Transformers, GNNs | Node/pixel importance | Visual, intuitive explanations | May not capture all reasoning |
| **Saliency maps** | CNNs | Pixel gradients | Image-based explanations | Noisy, may highlight irrelevant features |
| **Counterfactuals** | Any | "What if" scenarios | Decision support | Computationally expensive |
| **Constitutive checks** | PINNs | Physics compliance | Regulatory acceptance | Only for physics-based models |
| **GAM** | Linear models | Smooth feature curves | Interpretable spatial prediction | Limited expressiveness |

## Regulatory Compliance Framework

### JORC 2012 / NI 43-101 Requirements

**Competent Person requirements:**
- Must be a member of a recognized professional organization
- Must have relevant experience (typically 5+ years)
- Must take responsibility for the work
- Must understand the methods and assumptions

**XAI for compliance:**
```
1. Method transparency:
   - Full documentation of model architecture
   - Training data provenance and quality control
   - Hyperparameter selection rationale

2. Prediction explainability:
   - SHAP values for every resource estimate
   - Attention maps showing data influence
   - Uncertainty quantification with confidence intervals

3. Audit trail:
   - Version control for models and data
   - Automated logging of all predictions
   - Human override records with justification

4. Validation:
   - Independent verification against traditional methods
   - Cross-validation on held-out deposits
   - Sensitivity analysis on key assumptions
```

### Proposed AI-Assisted Reporting Standard

```
Section 1: Data Quality (AI-Assisted)
  - Automated data validation reports
  - Outlier detection and flagging
  - Missing data impact assessment

Section 2: Geological Model (AI-Generated + Human Verified)
  - 3D model with uncertainty envelope
  - SHAP-based feature importance for domain boundaries
  - Attention maps showing drill hole influence

Section 3: Resource Estimate (AI-Assisted)
  - Kriging + AI ensemble estimate
  - Uncertainty quantification (P10/P50/P90)
  - Sensitivity analysis on geological model variations

Section 4: Economic Analysis (Traditional)
  - Pit optimization, NPV analysis
  - No AI involvement (regulatory preference)

Appendix: AI Documentation
  - Model card with architecture, training data, performance metrics
  - XAI reports for all key predictions
  - Constitutive relation checks (for PINN-based predictions)
```

## Real-World Implementation: XAI Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  GEO-AI EXPLAINABILITY DASHBOARD                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PREDICTION: High prospectivity (0.87) at [X, Y, Z]        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FEATURE IMPORTANCE (SHAP)                          │   │
│  │  ▓▓▓▓▓▓▓▓▓▓ Proximity to major fault      +0.22   │   │
│  │  ▓▓▓▓▓▓▓▓▓ Potassic alteration            +0.18   │   │
│  │  ▓▓▓▓▓▓▓▓ Magnetic high anomaly            +0.15   │   │
│  │  ▓▓▓▓▓▓▓ Copper geochem anomaly             +0.12   │   │
│  │  ▓▓▓▓▓▓ Distance to intrusion < 2km       +0.09   │   │
│  │  ░░░░░░░ Sedimentary host rock             -0.03   │   │
│  │  ░░░░░░ Distance to water table > 100m     -0.02   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  DATA INFLUENCE (Attention Map)                     │   │
│  │  [Map showing drill holes and seismic traces with   │   │
│  │   heat map overlay indicating influence weight]     │   │
│  │                                                     │   │
│  │  Most influential: Drill Hole DH-045 (0.35)        │   │
│  │  Quality: A (complete logging, good recovery)        │   │
│  │  [Link to full drill log]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PHYSICS COMPLIANCE (Constitutive Checks)           │   │
│  │  ✓ Hooke's law: Stress-strain relationship valid     │   │
│  │  ✓ Darcy's law: Fluid flux direction consistent      │   │
│  │  ✓ Mass conservation: No artificial sources/sinks    │   │
│  │  ⚠ Warning: Stress gradient > threshold near fault   │   │
│  │    [Detailed report]                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  COUNTERFACTUAL ANALYSIS                            │   │
│  │  "What if this location was 5km from the fault?"   │   │
│  │  → Predicted prospectivity: 0.42 (moderate)          │   │
│  │  → Key change: Fault proximity contribution drops   │   │
│  │                                                     │   │
│  │  "What if alteration was phyllic instead of potassic?"│   │
│  │  → Predicted prospectivity: 0.61 (moderate-high)     │   │
│  │  → Key change: Alteration type contribution shifts  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Export Report] [Request Expert Review] [Flag for Retraining]│
└─────────────────────────────────────────────────────────────┘
```

## Limitations and Challenges

- **Explanation fidelity**: XAI approximations may not reflect true model reasoning
- **Computational cost**: SHAP for large models can take hours per prediction
- **Expert interpretation**: XAI outputs still require geological expertise to interpret
- **Regulatory evolution**: Standards for AI-assisted reporting are still emerging
- **Adversarial explanations**: XAI can be gamed to generate misleading explanations

## Future Directions

- **Interactive XAI**: Geologists can query the model in real-time, ask "why not" questions
- **Causal XAI**: Move from correlation-based to causation-based explanations
- **Multi-model consensus**: Compare explanations across different AI models
- **Regulatory templates**: Standardized XAI reports accepted by JORC/NI 43-101
- **Human-AI collaborative explanation**: AI suggests explanations, geologist validates and refines

## References

- Springer 2025. Explainable AI (XAI) as a major emerging research direction in geoscience.
- Springer 2025. XAI for scientific transparency and regulatory reporting.
- Lundberg, S.M. & Lee, S.I. A unified approach to interpreting model predictions. 2017.
- Ribeiro, M.T. et al. "Why should I trust you?": Explaining the predictions of any classifier. 2016.
