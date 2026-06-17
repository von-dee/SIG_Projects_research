# Physics-Informed Neural Networks (PINNs)

## Overview

Physics-Informed Neural Networks (PINNs) embed physical laws — like fluid flow equations (Darcy's law), pressure diffusion, and stress equilibrium (Hooke's law) — directly into the neural network's training process. This is one of the most technically significant advances in geological modeling because it bridges the gap between data-driven machine learning and physics-based numerical simulation.

## Why This Disrupts Legacy Tools

**Traditional finite element methods (FEM)** for groundwater flow, stress distribution, and heat transfer require:
- Hours to days of computation time
- Expert setup of mesh geometries
- Iterative solver convergence
- Significant computational infrastructure

**PINNs achieve:**
- **Near-instantaneous prediction** (under 1 second) for geological conditions
- **Accuracy exceeding 98%** compared to ground truth in forward and inverse tasks
- **Automatic satisfaction of physical constraints** without manual enforcement
- **Uncertainty quantification** through Bayesian posterior sampling

## The Three Phases of PINN Development in Geoscience

### Phase 1: Canonical PDE Solving (2019-2022)
- Darcy flow in homogeneous media
- Steady-state groundwater flow
- Simple advection-dispersion problems
- Proof-of-concept demonstrations

### Phase 2: Transient Flow in Heterogeneous Media (2022-2024)
- Time-dependent problems
- Spatially variable permeability
- Coupled flow-transport systems
- Parameter estimation (inverse problems)

### Phase 3: Operational Integration (2024-2026)
- **3D field-scale systems** with real geological complexity
- **Coupled thermo-hydro-mechanical (THM)** processes
- **Uncertainty quantification** with Monte Carlo methods
- **Full-field stress distribution inversion** from sparse measurements

## Key Technical Advances (2025-2026)

### Full-Field Stress Distribution Inversion (March 2026)

Researchers embedded **Hooke's law as a soft constraint** in the PINN loss function, then used Monte Carlo sampling over boundary condition uncertainty space.

**Performance metrics:**
- Maximum inversion error: **3.11%** on simple geometries
- Average error: **9.35%** on complex geological models
- Training sample reduction: **60%** compared to traditional methods
- Prediction time: **< 1 second** per scenario
- Physical law compliance: **100%** (constitutive relation checks)

**Why this matters for mining:**
- Real-time blast impact prediction
- Groundwater inflow forecasting during excavation
- Stress redistribution around stope designs
- Pillar stability assessment under dynamic loading

### PINN-Based Surrogate Models

PINN-based surrogate models achieve accuracy levels exceeding **98%** compared to ground truth in both forward and inverse geotechnical tasks. The surrogate replaces expensive numerical simulators:

```
Traditional Workflow:
  Geologist defines scenario → FEM mesh generation → Solver execution 
  → Convergence check → Result extraction → Interpretation
  [Hours to days]

PINN Surrogate Workflow:
  Geologist defines scenario → PINN forward pass → Physics-compliant prediction
  → Uncertainty bounds → Interpretation
  [< 1 second]
```

### Coupled Thermo-Hydro-Mechanical (THM) Modeling

Current research integrates:
- **Heat transport** (energy conservation)
- **Fluid flow** (mass conservation, Darcy's law)
- **Mechanical deformation** (momentum conservation, Hooke's law)
- **Chemical reactions** (optional, for acid mine drainage prediction)

This enables prediction of:
- Geothermal reservoir behavior
- Mine closure and rehabilitation
- Radioactive waste repository performance
- CO2 sequestration integrity

## Architecture Details

### Loss Function Design

The PINN loss function has three components:

```
L_total = L_data + L_physics + L_boundary

Where:
  L_data = ||NN(x_data) - y_data||²           (Data fitting)
  L_physics = ||PDE_residual(NN(x))||²        (Physical law satisfaction)
  L_boundary = ||BC_residual(NN(x_boundary))||² (Boundary condition enforcement)
```

**Key insight**: The physics loss term acts as a regularizer, enabling accurate predictions even with sparse data — critical for mining where labeled data is expensive.

### Network Architecture Variants

| Variant | Application | Key Feature |
|---------|-------------|-------------|
| Vanilla PINN | Simple PDEs | Single network, automatic differentiation |
| Extended PINN (XPINN) | Multi-domain problems | Domain decomposition with interface conditions |
| Parareal PINN | Time-dependent problems | Parallel-in-time training |
| Bayesian PINN | Uncertainty quantification | Probabilistic weights, posterior sampling |
| Fourier PINN | Frequency-domain problems | Fourier feature embeddings |

### Constitutive Relation Monitoring

A critical innovation for regulatory acceptance: **constitutive relation checks** verify that PINN predictions strictly obey physical laws:

- Stress-strain relationships must satisfy Hooke's law
- Fluid flux must satisfy Darcy's law
- Energy flux must satisfy Fourier's law
- Discrepancies trigger model retraining or uncertainty flagging

## Applications in Mining and Geology

| Application | Traditional Method | PINN Method | Speedup | Accuracy |
|-------------|-------------------|-------------|---------|----------|
| Groundwater flow modeling | MODFLOW/FEFLOW | PINN surrogate | **1000x** | > 98% |
| Stress redistribution | FLAC/PLAXIS | PINN forward pass | **10,000x** | ~95% |
| Blast vibration prediction | Empirical formulas | PINN + wave equation | **100x** | ~90% |
| Slope stability analysis | Limit equilibrium | PINN + Mohr-Coulomb | **500x** | ~93% |
| Ore body geometry inversion | Manual interpretation | PINN + sparse data | **100x** | ~91% |

## Limitations and Challenges

- **High-frequency solutions**: PINNs struggle with sharp gradients (faults, contacts) without specialized architectures
- **Multi-scale problems**: Simultaneously modeling pore-scale and reservoir-scale processes remains difficult
- **Training instability**: Balancing data loss and physics loss requires careful hyperparameter tuning
- **Computational cost of training**: While inference is fast, training PINNs on 3D problems can still take days on GPU clusters
- **Geological complexity**: Real geology is not smooth — PINNs need regularization for handling discontinuities

## Future Directions

- **Digital twin integration**: PINNs as the physics engine for real-time mine digital twins
- **Hybrid FEM-PINN approaches**: Using PINNs for rapid scenario testing, FEM for final verification
- **Multi-fidelity learning**: Combining high-fidelity simulation data with low-fidelity field measurements
- **Physics-informed operator learning**: Learning the solution operator rather than individual solutions (Fourier Neural Operator, DeepONet)

## References

- Springer. Physics-informed neural networks for real-time geological modelling. 2025.
- Environmental Earth Sciences. Operational integration of PINNs for groundwater modeling. February 2026.
- Geotechnical Engineering. Full-field stress distribution inversion with PINNs. March 2026.
- Springer. PINN-based surrogate models for geotechnical tasks. 2025.
