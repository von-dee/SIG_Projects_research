# Technical Deep Dive: Diffusion Models for Subsurface

## Mathematical Foundation

### Forward Diffusion Process

The forward process gradually adds Gaussian noise to a data sample x₀ over T timesteps:

```
q(x_t | x_{t-1}) = N(x_t; √(1-β_t) x_{t-1}, β_t I)

Where:
  β_t: noise schedule (small → large)
  x_t: noisy sample at timestep t
  x_0: original clean sample
```

The closed-form solution for any timestep:
```
q(x_t | x_0) = N(x_t; √ᾱ_t x_0, (1-ᾱ_t) I)

Where ᾱ_t = ∏(1-β_s) from s=1 to t
```

### Reverse Diffusion Process

Learn to reverse the noise corruption:
```
p_θ(x_{t-1} | x_t) = N(x_{t-1}; μ_θ(x_t, t), Σ_θ(x_t, t))
```

The neural network (typically a U-Net) predicts the noise ε that was added:
```
L_simple = E[||ε - ε_θ(x_t, t)||²]
```

### Conditioning for Geological Data

For subsurface modeling, we condition on observed data y:
```
p_θ(x_{t-1} | x_t, y) = N(x_{t-1}; μ_θ(x_t, t, y), Σ_θ(x_t, t, y))
```

**Classifier-free guidance** (most common approach):
- Train with random dropout of conditioning information
- At inference, combine conditional and unconditional predictions:
```
ε̃ = ε_uncond + s · (ε_cond - ε_uncond)
```
Where s > 1 is the guidance scale (higher = stronger conditioning)

## Physics-Informed Diffusion Architecture

### Loss Function with PDE Constraints

```
L_total = L_diffusion + λ_physics · L_physics + λ_data · L_data

Where:
  L_diffusion = standard diffusion loss (noise prediction)
  L_physics = ||PDE(x_0_pred)||² (physics residual on denoised sample)
  L_data = ||x_0_pred[observed] - y||² (data fidelity at well locations)
  λ_physics, λ_data: weighting hyperparameters
```

### Training-Free Physics Alignment (KADM)

Instead of modifying the training loss, steer the sampling process:

```
1. Generate unconditional sample: x_T ~ N(0, I)
2. For t = T down to 1:
   a. Predict x_0 from x_t: x_0_pred = (x_t - √(1-ᾱ_t) ε_θ(x_t, t)) / √ᾱ_t
   b. Check physics residual: r = PDE(x_0_pred)
   c. If ||r|| > threshold:
      - Compute gradient: ∇_x_t ||r||²
      - Adjust x_t: x_t ← x_t - η · ∇_x_t ||r||²
   d. Denoise: x_{t-1} ~ p_θ(x_{t-1} | x_t)
3. Return x_0
```

**Advantage**: Single pre-trained model, no retraining for new physics constraints.

## Implementation Details

### Network Architecture

**3D U-Net for subsurface diffusion:**
```
Input: (batch, channels, depth, height, width)
  ├─ Time embedding (sinusoidal positional encoding)
  ├─ Conditioning embedding (well data, seismic)
  └─ 3D convolutions with attention blocks

Encoder path:
  ├─ Block 1: (D, H, W) → (D/2, H/2, W/2), 64 channels
  ├─ Block 2: (D/2, H/2, W/2) → (D/4, H/4, W/4), 128 channels
  ├─ Block 3: (D/4, H/4, W/4) → (D/8, H/8, W/8), 256 channels
  └─ Bottleneck: (D/8, H/8, W/8), 512 channels

Decoder path (with skip connections):
  ├─ Up-block 3: + Block 3 skip → 256 channels
  ├─ Up-block 2: + Block 2 skip → 128 channels
  └─ Up-block 1: + Block 1 skip → 64 channels

Output: Predicted noise ε_θ(x_t, t), same shape as input
```

### Computational Requirements

| Model Scale | Parameters | VRAM | Training Time | Inference (100 realizations) |
|-------------|-----------|------|---------------|------------------------------|
| Small (64³) | 10M | 8 GB | 2-3 days | 5 minutes |
| Medium (128³) | 50M | 24 GB | 1 week | 15 minutes |
| Large (256³) | 200M | 80 GB | 2-3 weeks | 1 hour |
| Foundation (512³) | 1B+ | 320 GB | 1-2 months | 2-3 hours |

**Note**: Pre-trained foundation models eliminate training time; only inference matters for end users.

### Data Preprocessing

```
1. Grid alignment: Interpolate all data to common voxel grid
2. Normalization: Scale each property to [-1, 1] or [0, 1]
3. Masking: Create binary mask for observed vs. unobserved voxels
4. Encoding: 
   - Categorical (facies): One-hot or learned embedding
   - Continuous (grade): Direct value or log-transform
5. Augmentation: Random rotations, flips for training data diversity
```

## Comparison with Traditional Geostatistics

| Aspect | Geostatistics (SGSIM) | Diffusion Models |
|--------|----------------------|------------------|
| **Variogram reproduction** | Exact | Approximate (learned) |
| **Geological realism** | Limited by variogram | High (learned from data) |
| **Non-stationarity** | Difficult | Natural (learned) |
| **Physical constraints** | None | Embedded (PINN hybrid) |
| **Conditioning** | Exact (kriging) | Approximate (guidance) |
| **Speed (100 realizations)** | Hours | Minutes |
| **Uncertainty quantification** | Ensemble variance | Ensemble + learned uncertainty |
| **Novel geology** | Requires new variogram | Requires retraining/fine-tuning |

## Code Skeleton (PyTorch)

```python
import torch
import torch.nn as nn

class SubsurfaceDiffusion(nn.Module):
    def __init__(self, in_channels=3, time_dim=256):
        super().__init__()
        self.time_mlp = nn.Sequential(
            SinusoidalPositionEmbeddings(time_dim),
            nn.Linear(time_dim, time_dim),
            nn.GELU(),
            nn.Linear(time_dim, time_dim),
        )
        self.encoder = nn.ModuleList([
            ConvBlock(in_channels, 64),
            ConvBlock(64, 128),
            ConvBlock(128, 256),
        ])
        self.bottleneck = ConvBlock(256, 512)
        self.decoder = nn.ModuleList([
            UpConvBlock(512, 256),
            UpConvBlock(256, 128),
            UpConvBlock(128, 64),
        ])
        self.final_conv = nn.Conv3d(64, in_channels, 1)

    def forward(self, x, t, conditioning=None):
        t_emb = self.time_mlp(t)
        if conditioning is not None:
            t_emb = t_emb + conditioning

        skips = []
        for block in self.encoder:
            x = block(x, t_emb)
            skips.append(x)
            x = nn.MaxPool3d(2)(x)

        x = self.bottleneck(x, t_emb)

        for block, skip in zip(self.decoder, reversed(skips)):
            x = nn.Upsample(scale_factor=2)(x)
            x = torch.cat([x, skip], dim=1)
            x = block(x, t_emb)

        return self.final_conv(x)

# Training loop
def train_step(model, optimizer, x_0, t, noise, conditioning):
    x_t = sqrt_alpha_t * x_0 + sqrt_one_minus_alpha_t * noise
    predicted_noise = model(x_t, t, conditioning)
    loss = F.mse_loss(predicted_noise, noise)

    # Optional: physics-informed loss
    x_0_pred = (x_t - sqrt_one_minus_alpha_t * predicted_noise) / sqrt_alpha_t
    physics_residual = pde_residual(x_0_pred)
    loss += lambda_physics * physics_residual.mean()

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    return loss

# Sampling loop
def sample(model, shape, conditioning, num_steps=1000):
    x = torch.randn(shape)
    for t in reversed(range(num_steps)):
        t_batch = torch.full((shape[0],), t)
        predicted_noise = model(x, t_batch, conditioning)

        # Physics alignment step (KADM)
        x_0_pred = (x - sqrt_one_minus_alpha_t * predicted_noise) / sqrt_alpha_t
        if physics_residual(x_0_pred) > threshold:
            x = x - eta * grad(physics_residual(x_0_pred), x)

        alpha_t = alphas[t]
        alpha_t_prev = alphas[t-1] if t > 0 else torch.tensor(1.0)
        beta_t = betas[t]

        x = (x - beta_t / sqrt_one_minus_alpha_t * predicted_noise) / sqrt(alpha_t)
        if t > 0:
            x = x + torch.sqrt(beta_t) * torch.randn_like(x)

    return x
```

## References

- Ho, J., Jain, A., & Abbeel, P. (2020). Denoising diffusion probabilistic models.
- Song, Y., et al. (2021). Score-based generative modeling through stochastic differential equations.
- Chung, H., et al. (2023). Diffusion posterior sampling for general noisy inverse problems.
- KADM Framework (2025). Knowledge-aligned diffusion for subsurface modeling.
