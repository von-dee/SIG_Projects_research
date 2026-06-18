# Digital Twin Viewer

## Page Title & Description
Interactive topology view of substations, feeders, transformers, meters, lines, and estimated relationships used for state estimation and scenario planning.

## User Roles & Access Control
- Engineering operations, administrators, and management can view.
- Only engineering administrators can edit topology.
- DFI/regulator viewers receive read-only aggregated topology.

## UI/UX Component Breakdown
- Graph or map-based topology canvas.
- Asset inspector panel.
- Confidence badges for physical, imported, estimated, and predicted relationships.
- Layer toggles for lines, meters, transformers, sensors, and outages.
- What-if simulation launcher.
- Version history timeline.

## User Actions & Interactions
- Select asset nodes to inspect real-time state.
- Compare topology versions.
- Flag suspected topology errors.
- Run permitted scenarios such as load growth, feeder fault, or new sensor placement.
- Export topology snapshot.

## Data Requirements & State
- Fetches grid nodes, edges, geometry, asset metadata, sensor readings, confidence scores, and topology versions.
- Captures topology flags, scenario parameters, and export preferences.
- Stores viewport, selected node, and selected topology version.

## Navigation & Routing
- `/digital-twin` links to `/asset-registry/:id`, `/zones/:id`, `/predictive-maintenance`, and `/gateway-connectivity`.
- Edit attempts without permission route to `/403`.
- Simulation errors show inline diagnostics and preserve inputs.

