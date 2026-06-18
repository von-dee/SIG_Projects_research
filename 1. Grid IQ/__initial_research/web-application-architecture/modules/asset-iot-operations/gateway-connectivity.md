# Gateway Connectivity

## Page Title & Description
Connectivity operations page for LoRaWAN, NB-IoT, 4G/5G, mesh, satellite backup, and field gateway health.

## User Roles & Access Control
- Engineering, operations, administrators, and auditors can view.
- Engineering administrators can change gateway configuration.
- Field agents can view site instructions for assigned gateway tasks.

## UI/UX Component Breakdown
- Gateway status map.
- Connectivity uptime chart.
- Protocol health cards.
- Message backlog and latency panel.
- Offline sensor list.
- Gateway configuration drawer.
- Incident timeline.

## User Actions & Interactions
- Filter gateways by protocol, region, health, or uptime.
- Open gateway detail.
- Assign site visit.
- Switch supported backhaul preference.
- Acknowledge connectivity incident.

## Data Requirements & State
- Fetches gateways, linked sensors, protocol status, signal quality, message lag, battery state, and incidents.
- Captures configuration changes, acknowledgements, and field assignments.
- Maintains last-known-good state for offline periods.

## Navigation & Routing
- `/gateway-connectivity` links to `/sensor-fleet`, `/asset-registry/:id`, `/queue/:id`, and `/offline-low-bandwidth`.
- Configuration errors show rollback action.

