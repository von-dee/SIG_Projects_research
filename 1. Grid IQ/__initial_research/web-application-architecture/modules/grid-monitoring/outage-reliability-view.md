# Outage Reliability View

## Page Title & Description
Reliability monitoring page showing outage incidents, SAIDI/SAIFI performance, transformer loading, voltage deviation, and outage-prone zones.

## User Roles & Access Control
- Operations, engineering, management, administrators, and auditors can view.
- Field agents see outage context for assigned case zones.
- External viewers receive aggregated reliability indicators only.

## UI/UX Component Breakdown
- Reliability KPI cards for SAIDI, SAIFI, CAIDI, active outages, and customers affected.
- Map overlay for outage zones.
- Incident timeline.
- Transformer and feeder loading chart.
- Voltage deviation and phase imbalance widgets.
- Exportable reliability table.

## User Actions & Interactions
- Filter outages by active, resolved, planned, or unplanned.
- Open incident details.
- Link outage patterns to predictive-maintenance items.
- Add restoration notes.
- Export reliability data for monthly reporting.

## Data Requirements & State
- Fetches outage incidents, affected zones, sensor readings, customer counts, maintenance records, and monthly snapshots.
- Captures restoration notes and incident classifications.
- Maintains filter state, map layer selection, and reporting period.

## Navigation & Routing
- `/reliability` links to `/predictive-maintenance`, `/reports`, `/zones/:id`, and `/asset-registry/:id`.
- Missing sensor data shows estimated-state labels rather than blank charts.

