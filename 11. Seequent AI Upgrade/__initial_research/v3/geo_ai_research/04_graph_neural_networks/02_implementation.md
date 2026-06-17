# Implementation Guide: GNNs for Mineral Exploration

## Step-by-Step Pipeline

### Step 1: Data Preparation

**Required data sources:**

**Geological:**
- Drill hole database (collar, survey, lithology, assays)
- Geological map (polygons with lithology, age, structure)
- Structural data (faults, folds, lineaments)
- Alteration data (zones, types, intensity)

**Geophysical:**
- Magnetic data (reduced-to-pole, derivatives)
- Gravity data (Bouguer anomaly, derivatives)
- Radiometric data (K, Th, U)
- EM/conductivity data

**Geochemical:**
- Stream sediment surveys
- Soil geochemistry
- Rock chip samples
- Drill hole assays

**Remote Sensing:**
- ASTER/Landsat alteration indices
- Sentinel-2 multispectral
- DEM/topographic derivatives

### Step 2: Graph Construction (PyTorch Geometric)

```python
import torch
import numpy as np
from torch_geometric.data import Data

class GeologicalGraphBuilder:
    def __init__(self, grid_size=1000):
        self.grid_size = grid_size

    def build_grid_graph(self, data_dict):
        # Create grid nodes
        x_coords = np.linspace(data_dict['xmin'], data_dict['xmax'], self.grid_size)
        y_coords = np.linspace(data_dict['ymin'], data_dict['ymax'], self.grid_size)
        xx, yy = np.meshgrid(x_coords, y_coords)

        # Node features: stack all raster layers
        node_features = []
        for layer in ['magnetic', 'gravity', 'alteration', 'geochemistry']:
            interpolated = self.interpolate_to_grid(data_dict[layer], xx, yy)
            node_features.append(interpolated)
        node_features = np.stack(node_features, axis=-1)

        # Edges: 8-connectivity
        edge_index = self.grid_8_connectivity(self.grid_size)

        # Known deposits as labels
        labels = self.mark_deposit_cells(data_dict['deposits'], xx, yy)

        return Data(
            x=torch.FloatTensor(node_features),
            edge_index=torch.LongTensor(edge_index),
            y=torch.FloatTensor(labels)
        )

    def build_geological_graph(self, drill_data, fault_data, alteration_data):
        nodes = []
        edges = []

        # Drill hole nodes
        for hole in drill_data:
            nodes.append({
                'type': 'drill_hole',
                'features': [hole['depth'], hole['avg_grade'], hole['lithology_diversity']]
            })

        # Fault nodes
        for fault in fault_data:
            nodes.append({
                'type': 'fault',
                'features': [fault['length'], fault['displacement'], fault['orientation']]
            })

        # Alteration zone nodes
        for zone in alteration_data:
            nodes.append({
                'type': 'alteration',
                'features': [zone['area'], zone['intensity'], zone['type_code']]
            })

        # Edges: spatial proximity + geological relationships
        for i, node_i in enumerate(nodes):
            for j, node_j in enumerate(nodes):
                if i == j: continue

                # Spatial edge
                dist = self.geographic_distance(node_i, node_j)
                if dist < 5000:  # 5km threshold
                    edges.append([i, j, {'type': 'spatial', 'distance': dist}])

                # Geological edge (if known)
                if self.geological_relationship(node_i, node_j):
                    edges.append([i, j, {'type': 'geological'}])

        return self.to_pyg_data(nodes, edges)
```

### Step 3: Model Definition

```python
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GATConv, global_mean_pool

class MineralProspectivityGNN(nn.Module):
    def __init__(self, in_channels, hidden_channels=64, num_layers=3, heads=4):
        super().__init__()

        self.convs = nn.ModuleList()
        self.batch_norms = nn.ModuleList()

        # First layer
        self.convs.append(GATConv(in_channels, hidden_channels, heads=heads, concat=False))
        self.batch_norms.append(nn.BatchNorm1d(hidden_channels))

        # Hidden layers
        for _ in range(num_layers - 1):
            self.convs.append(GATConv(hidden_channels, hidden_channels, heads=heads, concat=False))
            self.batch_norms.append(nn.BatchNorm1d(hidden_channels))

        # Output layers
        self.classifier = nn.Sequential(
            nn.Linear(hidden_channels, hidden_channels // 2),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_channels // 2, 1),
            nn.Sigmoid()
        )

    def forward(self, x, edge_index, edge_attr=None, batch=None):
        # Message passing
        for conv, bn in zip(self.convs, self.batch_norms):
            x = conv(x, edge_index, edge_attr=edge_attr)
            x = bn(x)
            x = F.relu(x)
            x = F.dropout(x, p=0.2, training=self.training)

        # Global pooling if batched
        if batch is not None:
            x = global_mean_pool(x, batch)

        # Classification
        out = self.classifier(x)
        return out

    def get_attention_weights(self, x, edge_index, edge_attr=None):
        attention_weights = []
        for conv in self.convs:
            x, attn = conv(x, edge_index, edge_attr=edge_attr, return_attention_weights=True)
            attention_weights.append(attn)
        return attention_weights
```

### Step 4: Training

```python
from sklearn.metrics import roc_auc_score

def train_model(model, train_loader, val_loader, epochs=100, lr=0.001):
    optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=1e-5)
    criterion = nn.BCELoss()
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=10)

    best_val_auc = 0
    for epoch in range(epochs):
        model.train()
        train_loss = 0
        for data in train_loader:
            optimizer.zero_grad()
            out = model(data.x, data.edge_index, data.edge_attr, data.batch)
            loss = criterion(out, data.y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()

        # Validation
        model.eval()
        val_auc = evaluate(model, val_loader)
        scheduler.step(val_auc)

        if val_auc > best_val_auc:
            best_val_auc = val_auc
            torch.save(model.state_dict(), 'best_model.pt')

        print(f'Epoch {epoch}: Train Loss = {train_loss:.4f}, Val AUC = {val_auc:.4f}')

    return model

def evaluate(model, loader):
    model.eval()
    y_true, y_pred = [], []
    with torch.no_grad():
        for data in loader:
            out = model(data.x, data.edge_index, data.edge_attr, data.batch)
            y_true.extend(data.y.cpu().numpy())
            y_pred.extend(out.cpu().numpy())
    return roc_auc_score(y_true, y_pred)
```

### Step 5: Explainability and Visualization

```python
def visualize_attention(graph_data, model, deposit_indices):
    model.eval()
    with torch.no_grad():
        attention_weights = model.get_attention_weights(
            graph_data.x, graph_data.edge_index, graph_data.edge_attr
        )

    # Aggregate attention across layers
    final_attention = attention_weights[-1]

    # For each deposit node, find highest-attention neighbors
    for deposit_idx in deposit_indices:
        mask = graph_data.edge_index[1] == deposit_idx
        neighbor_attention = final_attention[mask]
        neighbor_indices = graph_data.edge_index[0][mask]

        top_k = 10
        top_indices = torch.topk(neighbor_attention, top_k).indices

        print(f"Deposit {deposit_idx} top geological controls:")
        for idx in top_indices:
            neighbor = neighbor_indices[idx]
            attn = neighbor_attention[idx]
            print(f"  Node {neighbor}: attention = {attn:.3f}")

    # Create visualization
    import matplotlib.pyplot as plt
    plt.figure(figsize=(12, 10))
    pos = {i: (graph_data.x[i, 0], graph_data.x[i, 1]) for i in range(len(graph_data.x))}

    # Draw edges with attention-weighted colors
    for i, (src, tgt) in enumerate(graph_data.edge_index.T):
        weight = final_attention[i].item()
        plt.plot([pos[src][0], pos[tgt][0]], [pos[src][1], pos[tgt][1]], 
                'b-', alpha=weight, linewidth=weight*2)

    # Draw nodes
    deposit_mask = np.zeros(len(graph_data.x), dtype=bool)
    deposit_mask[deposit_indices] = True
    plt.scatter(graph_data.x[~deposit_mask, 0], graph_data.x[~deposit_mask, 1], 
               c='gray', s=10, alpha=0.5)
    plt.scatter(graph_data.x[deposit_mask, 0], graph_data.x[deposit_mask, 1], 
               c='red', s=100, marker='*')

    plt.title('GNN Attention Visualization: Deposit Controls')
    plt.show()
```

## Performance Benchmarks

| Dataset | Method | AUC | Accuracy | F1-Score |
|---------|--------|-----|----------|----------|
| Eastern Tien Shan | Weight of Evidence | 0.78 | 72% | 0.68 |
| Eastern Tien Shan | CNN | 0.66 | 58% | 0.55 |
| Eastern Tien Shan | GCN | 0.74 | 68% | 0.65 |
| Eastern Tien Shan | GAT | 0.78 | 73% | 0.70 |
| Eastern Tien Shan | KDCGAT | 0.86 | 86% | 0.84 |
| Lhasa Region | GAT | 0.89 | 85% | 0.83 |
| Lhasa Region | ADGCN | 0.92 | 90% | 0.88 |

## Deployment Considerations

### Computational Requirements
- Small graph (10K nodes): 8 GB GPU, training ~1 hour
- Medium graph (100K nodes): 24 GB GPU, training ~6 hours
- Large graph (1M nodes): Multi-GPU, training ~2 days
- Inference: Seconds to minutes depending on graph size

### Data Quality
- Critical: Graph quality directly impacts model performance
- Node features: Must be geologically meaningful and consistently measured
- Edge definitions: Must capture true geological relationships, not just spatial proximity
- Label quality: Deposit labels must be accurate and consistently defined

### Maintenance
- Retraining: As new deposits are discovered, retrain to update patterns
- Graph updates: New drill holes, new geophysical surveys -> update graph
- Model drift: Monitor performance degradation over time

## References

- KDCGAT Paper. November 2025.
- ADGCN Paper. Ore Geology Reviews, April 2025.
- PyTorch Geometric Documentation
- Graph Neural Networks: A Review of Methods and Applications. Zhou et al., 2020.
