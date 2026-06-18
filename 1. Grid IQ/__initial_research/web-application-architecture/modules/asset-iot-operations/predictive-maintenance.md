# Predictive Maintenance

## Page Title & Description
Maintenance prioritisation page identifying transformers, feeders, and sensors with early degradation, overload, voltage, phase imbalance, or power-factor risks.

## User Roles & Access Control
- Engineering, operations, management, administrators, and auditors can view.
- Engineering supervisors can create work orders.
- DFI viewers see aggregated reliability improvement metrics.

## UI/UX Component Breakdown
- Maintenance priority ranking.
- Health score cards.
- Risk-driver explanation panel.
- Voltage deviation, load factor, power factor, and phase imbalance charts.
- Work-order creation controls.
- Maintenance outcome history.

## User Actions & Interactions
- Filter by asset type, zone, risk driver, and urgency.
- Open asset detail.
- Create or assign maintenance work order.
- Record completed maintenance.
- Export monthly maintenance ranking.

## Data Requirements & State
- Fetches sensor telemetry, asset registry, outage history, maintenance records, model scores, and work orders.
- Captures work-order creation, completion notes, and maintenance outcome.
- Feeds completed outcomes into predictive model governance.

## Navigation & Routing
- `/predictive-maintenance` links to `/asset-registry/:id`, `/reliability`, `/sensor-fleet`, and `/reports`.
- Missing telemetry displays confidence warning and estimated-health label.

