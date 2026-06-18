# Anomaly Intelligence

## Page Title & Description
Analytical workspace for reviewing AI-detected non-technical loss patterns, anomaly confidence, peer comparisons, and recommended actions.

## User Roles & Access Control
- Operations, management, data analysts, administrators, and auditors can view.
- Field agents see only anomaly explanations attached to assigned cases.
- Model configuration controls are restricted to data administrators.

## UI/UX Component Breakdown
- Anomaly summary cards by type: bypass, reconnection, token fraud, phase tap, internal fraud.
- Confidence distribution chart.
- Zone heatmap.
- Peer-group comparison chart.
- Recommended action panel.
- Explainability panel with contributing signals.
- False-positive feedback controls.

## User Actions & Interactions
- Filter anomalies by type, zone, tariff category, vendor, confidence, and date.
- Open alert detail from an anomaly.
- Mark false positive or promote to investigation.
- Export analytical results.
- Submit confirmed outcomes to model feedback.

## Data Requirements & State
- Fetches anomaly scores, model version, features, meter metadata, token patterns, zone metrics, peer medians, and investigation outcomes.
- Captures feedback, false-positive reasons, and investigation creation requests.
- Maintains model-version and threshold state.

## Navigation & Routing
- `/analytics/anomalies` links to `/alerts/:id`, `/meters/:id`, `/zones/:id`, and `/model-feedback`.
- Restricted meter records show masked identifiers.
- Model-service outage shows last successful scoring run.

