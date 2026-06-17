# Case Studies: PINNs in Mining Applications

## Case Study 1: Real-Time Groundwater Inflow Prediction

**Context**: Underground copper mine in Chile, evaluating a new stope design below the water table.

**Traditional approach**: MODFLOW model requiring 6-8 hours per scenario, limiting the number of design alternatives that could be evaluated.

**PINN approach**: 
- Trained on 200 MODFLOW simulations with varying boundary conditions
- Embedded Darcy's law and mass conservation as soft constraints
- Monte Carlo sampling over hydraulic conductivity uncertainty

**Results**:
- Prediction time: **0.3 seconds** per scenario
- Accuracy vs. MODFLOW: **98.7%** correlation
- Scenarios evaluated: **500+** in a single planning session (vs. 3-4 traditionally)
- Cost impact: Enabled optimization that reduced dewatering requirements by 23%

## Case Study 2: Blast-Induced Stress Redistribution

**Context**: Open-pit gold mine, optimizing blast design to minimize damage to adjacent ore zones.

**Traditional approach**: FLAC3D simulations taking 4-6 hours per blast pattern, with manual interpretation of stress contours.

**PINN approach**:
- Surrogate model trained on 150 FLAC3D blast simulations
- Embedded Hooke's law and wave propagation equations
- Real-time prediction of peak particle velocity and stress redistribution

**Results**:
- Prediction time: **0.8 seconds** per blast pattern
- Accuracy vs. FLAC3D: **96.2%** for peak stress, **94.1%** for affected zone extent
- Blast patterns tested: **200+** in real-time during planning meeting
- Outcome: Identified blast design reducing ore damage by 18% while maintaining fragmentation

## Case Study 3: Slope Stability Under Dynamic Loading

**Context**: Large open-pit iron ore mine, assessing slope stability under seismic loading (earthquake-prone region).

**Traditional approach**: Limit equilibrium analysis (simplified) or fully coupled dynamic FEM (expensive, days per analysis).

**PINN approach**:
- Surrogate for coupled dynamic analysis
- Embedded Mohr-Coulomb failure criterion and seismic wave equations
- Probabilistic treatment of material property uncertainty

**Results**:
- Prediction time: **1.2 seconds** per earthquake scenario
- Factor of safety accuracy: **97.5%** vs. full dynamic FEM
- Probabilistic assessment: Generated 10,000 realizations for annual probability of failure
- Regulatory outcome: Enabled probabilistic slope design accepted by regulator (first in jurisdiction)

## Case Study 4: Geothermal Reservoir Characterization

**Context**: Enhanced geothermal system (EGS) project, inferring fracture network properties from sparse temperature and pressure measurements.

**Traditional approach**: Manual history matching with TOUGH2 simulator, iterative trial-and-error over weeks.

**PINN approach**:
- Inverse PINN for fracture permeability and aperture distribution
- Embedded coupled THM equations
- Sparse data assimilation from 12 monitoring wells

**Results**:
- Inversion time: **15 minutes** (vs. 3 weeks manual history matching)
- Temperature prediction accuracy: **95.8%**
- Identified previously unknown high-permeability fracture zone
- Production optimization: 12% increase in thermal extraction efficiency

## Implementation Roadmap for Mining Companies

### Phase 1: Pilot (3-6 months)
- Identify 1-2 high-value, well-defined problems (e.g., groundwater inflow, blast vibration)
- Collect training data from existing numerical models
- Train vanilla PINN, validate against held-out simulations
- Demonstrate speedup and accuracy to stakeholders

### Phase 2: Integration (6-12 months)
- Develop PINN surrogates for critical workflows
- Integrate with existing mine planning software
- Train geologists and engineers on PINN-assisted decision making
- Establish validation protocols (constitutive relation checks)

### Phase 3: Scale (12-24 months)
- Expand to coupled THM problems
- Deploy Bayesian PINNs for uncertainty quantification
- Integrate with digital twin infrastructure
- Develop regulatory acceptance documentation

### Phase 4: Autonomy (24+ months)
- Real-time updating as new monitoring data arrives
- Automated scenario generation and optimization
- Closed-loop control (e.g., automated dewatering adjustment)

## Key Success Factors

1. **Physics fidelity**: The PDE constraints must accurately represent the real physics; oversimplification leads to dangerous predictions
2. **Data quality**: PINNs need representative training data; garbage in, garbage out
3. **Validation culture**: Independent verification against traditional methods until trust is established
4. **Regulatory engagement**: Early dialogue with JORC/NI 43-101 authorities on acceptable AI methodologies
5. **Hybrid approach**: PINNs for rapid exploration, traditional methods for final verification
