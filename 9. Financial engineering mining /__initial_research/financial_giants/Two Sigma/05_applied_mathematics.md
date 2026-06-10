# Two Sigma — Applied Mathematics

## Overview

Two Sigma's mathematical approach is distinguished by its heavy emphasis on **machine learning** and **big data analytics**. While traditional quant firms rely on statistical arbitrage and signal processing, Two Sigma treats finance as a big data problem, applying techniques from computer science and artificial intelligence to extract predictive signals from massive datasets.

## Core Mathematical Frameworks

### 1. Machine Learning & Artificial Intelligence

**Application**: Predicting asset returns using advanced ML techniques

#### Supervised Learning
- **Linear Regression**: `y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε`
  - Baseline for factor modeling
  - Ridge/Lasso regularization for feature selection

- **Gradient Boosting**: `F_m(x) = F_{m-1}(x) + ν·h_m(x)`
  - XGBoost, LightGBM for return prediction
  - Handles non-linear relationships
  - Feature importance analysis

- **Neural Networks**:
  - **Feedforward**: `y = f(W₃ · f(W₂ · f(W₁ · x + b₁) + b₂) + b₃)`
  - **Recurrent (LSTM/GRU)**: For time-series prediction
  - **Transformers**: For sequence modeling

#### Unsupervised Learning
- **Clustering**: K-means, hierarchical clustering for stock grouping
- **Dimensionality Reduction**: PCA, t-SNE, UMAP
- **Anomaly Detection**: Isolation forests, autoencoders

#### Reinforcement Learning
- **Q-Learning**: `Q(s,a) = Q(s,a) + α[r + γ·max(Q(s',a')) - Q(s,a)]`
- **Policy Gradient**: Direct optimization of trading policies
- **Application**: Dynamic portfolio optimization, execution

### 2. Natural Language Processing (NLP)

**Application**: Extracting sentiment and information from text data

#### Techniques
- **Bag of Words**: `TF-IDF` weighting
- **Word Embeddings**: Word2Vec, GloVe
- **Contextual Embeddings**: BERT, GPT, RoBERTa
- **Sentiment Analysis**: Fine-tuned transformers

#### Data Sources
- **News Articles**: Bloomberg, Reuters, WSJ
- **Earnings Calls**: Transcripts, audio analysis
- **Social Media**: Twitter, Reddit, StockTwits
- **SEC Filings**: 10-K, 10-Q, 8-K
- **Analyst Reports**: Research notes, ratings changes

**Mathematical Pipeline**:
```
Raw Text → Tokenization → Embedding → Model → Sentiment Score → Signal
```

### 3. Computer Vision

**Application**: Analyzing satellite imagery and other visual data

#### Techniques
- **Convolutional Neural Networks (CNNs)**:
  - `feature_map = ReLU(convolution(input, kernel) + bias)`
  - ResNet, EfficientNet architectures

- **Object Detection**: YOLO, Faster R-CNN
  - Counting cars in parking lots
  - Measuring oil storage tank levels

- **Image Segmentation**: U-Net, Mask R-CNN
  - Crop yield estimation
  - Construction activity monitoring

#### Applications
| Data Type | Signal Extracted | Trading Application |
|-----------|-----------------|-------------------|
| **Parking Lot Imagery** | Retail traffic | Consumer discretionary |
| **Oil Storage Tanks** | Inventory levels | Energy commodities |
| **Crop Fields** | Yield estimates | Agricultural commodities |
| **Construction Sites** | Real estate activity | REITs, materials |

### 4. Time Series Analysis

**Application**: Modeling temporal patterns in financial data

#### ARIMA Models
- `ARIMA(p,d,q)`: Autoregressive Integrated Moving Average
- **Application**: Baseline forecasting, volatility modeling

#### GARCH Models
- `σ²_t = ω + α·ε²_{t-1} + β·σ²_{t-1}`
- **Application**: Volatility clustering, risk management

#### State Space Models
- **Kalman Filter**: `x̂_{k|k} = x̂_{k|k-1} + K_k(z_k - Hx̂_{k|k-1})`
- **Application**: Dynamic factor models, regime detection

#### Wavelet Analysis
- **Continuous Wavelet Transform**: `W(a,b) = (1/√a) ∫ f(t) ψ*((t-b)/a) dt`
- **Application**: Multi-resolution signal decomposition

### 5. Bayesian Methods

**Application**: Probabilistic modeling, uncertainty quantification

#### Bayesian Linear Regression
- `P(β|y,X) ∝ P(y|X,β) · P(β)`
- **Application**: Factor modeling with uncertainty

#### Bayesian Neural Networks
- **Variational Inference**: Approximate posterior distributions
- **Application**: Uncertainty-aware return prediction

#### Bayesian Optimization
- **Acquisition Functions**: Expected Improvement, Upper Confidence Bound
- **Application**: Hyperparameter tuning, strategy optimization

### 6. Network Analysis

**Application**: Understanding relationships between securities

#### Graph Theory
- **Adjacency Matrix**: `A_{ij} = 1` if nodes i and j are connected
- **Centrality Measures**: PageRank, betweenness, eigenvector

#### Applications
- **Supply Chain Networks**: Mapping company relationships
- **Correlation Networks**: Identifying clusters of related stocks
- **Social Networks**: Analyzing insider trading patterns

## Alternative Data Integration

### Data Pipeline
```
Raw Data → Cleaning → Feature Engineering → Model Input → Signal → Portfolio
    ↓          ↓              ↓                ↓           ↓         ↓
  Satellite   Outlier      Technical        Neural      Alpha    Risk
  Imagery     Detection    Indicators       Network     Score    Model
```

### Feature Engineering
| Feature Type | Examples | Mathematical Basis |
|-------------|----------|-------------------|
| **Technical** | Moving averages, RSI, MACD | Time-series statistics |
| **Fundamental** | P/E, ROE, debt/equity | Financial ratios |
| **Alternative** | Parking lot counts, shipping volume | Computer vision, NLP |
| **Macro** | Interest rates, GDP, inflation | Econometric models |
| **Sentiment** | News sentiment, social media | NLP, sentiment analysis |

## Model Ensemble Architecture

```
Individual Models (1000s)
    ├── Linear Models (OLS, Ridge, Lasso)
    ├── Tree Models (Random Forest, XGBoost)
    ├── Neural Networks (MLP, LSTM, Transformer)
    ├── NLP Models (BERT, GPT)
    ├── Computer Vision (CNN, ResNet)
    └── Bayesian Models (Bayesian Regression, GP)
         ↓
    Meta-Learner (Stacking, Blending)
         ↓
    Risk Management Layer
         ↓
    Portfolio Construction
```

## Comparison with Other Firms

| Mathematical Focus | Two Sigma | Renaissance Technologies | Jane Street | Citadel |
|-------------------|-----------|-------------------------|-------------|---------|
| **Primary Math** | ML / Big Data | SDEs / Signal Processing | Probability / Game Theory | Risk Modeling / Calculus |
| **Data Emphasis** | Alternative data | Proprietary historical | Market microstructure | Real-time market data |
| **Model Type** | Deep learning, NLP | Statistical arbitrage | Market making | Multi-strategy pods |
| **Time Horizon** | Days to months | Hours to weeks | Microseconds to days | Microseconds to months |

## Key Mathematical Innovations

### 1. Multi-Modal Learning
- **Fusion of text, image, and numerical data**
- **Cross-modal attention mechanisms**
- **Application**: Combining satellite imagery with earnings call sentiment

### 2. Causal Inference
- **Difference-in-Differences**: `ATT = E[Y(1) - Y(0) | D=1]`
- **Instrumental Variables**: Addressing endogeneity
- **Application**: Identifying causal relationships in market data

### 3. Federated Learning
- **Distributed model training** across data centers
- **Privacy-preserving**: Data never leaves local servers
- **Application**: Training on sensitive alternative data

## Conclusion

Two Sigma's mathematical approach represents the cutting edge of quantitative finance. By combining machine learning, alternative data, and big data analytics, the firm has created a powerful toolkit for generating alpha. While this approach requires massive computational resources and data infrastructure, it offers the potential to discover signals invisible to traditional quantitative methods.

> *"Data is the new oil, but refined data is the new gasoline."* — Two Sigma Philosophy

---

*Report generated: May 2026*
*Sources: Academic literature, industry interviews, patent filings*
