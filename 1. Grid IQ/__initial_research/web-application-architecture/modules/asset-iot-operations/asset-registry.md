# Asset Registry

## Page Title & Description
Authoritative inventory for substations, feeders, transformers, poles, meters, sensors, gateways, and topology relationships.

## User Roles & Access Control
- Engineering, operations, administrators, and auditors can view.
- Engineering administrators can edit.
- Field agents can view asset context for assigned cases.

## UI/UX Component Breakdown
- Searchable asset table.
- Map and topology view toggle.
- Asset detail drawer.
- Import status panel.
- Data-quality indicators.
- Relationship editor for authorised users.
- Export control.

## User Actions & Interactions
- Search by asset ID, feeder code, meter serial, zone, or GPS coordinate.
- Open asset detail.
- Flag missing or incorrect asset data.
- Import GIS or CSV data.
- Link sensors, meters, and transformers.

## Data Requirements & State
- Fetches assets, coordinates, topology relationships, utility GIS imports, sensor links, meter links, and data-quality scores.
- Captures edit requests, flags, imports, and relationship updates.
- Version-controls topology changes.

## Navigation & Routing
- `/asset-registry` links to `/digital-twin`, `/zones/:id`, `/sensor-fleet`, `/gateway-connectivity`, and `/predictive-maintenance`.
- Invalid imports show row-level error reports.

