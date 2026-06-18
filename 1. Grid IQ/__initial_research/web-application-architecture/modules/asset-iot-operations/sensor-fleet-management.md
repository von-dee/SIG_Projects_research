# Sensor Fleet Management

## Page Title & Description
Operational page for managing transformer, feeder, line, and smart-meter sensors deployed across the utility network.

## User Roles & Access Control
- Engineering, operations, administrators, and auditors can view.
- Engineering administrators can provision, retire, or reassign devices.
- Field agents can update installation and maintenance outcomes.

## UI/UX Component Breakdown
- Sensor fleet table.
- Health status badges.
- Battery, signal, firmware, and last-seen indicators.
- Installation workflow panel.
- Tamper and theft-detection alerts.
- Firmware update status.
- Spare-parts and maintenance queue.

## User Actions & Interactions
- Provision sensor.
- Assign to asset or zone.
- Mark installed, replaced, repaired, missing, or retired.
- Trigger firmware update where supported.
- Create maintenance work order.

## Data Requirements & State
- Fetches sensors, assets, installation records, telemetry summaries, firmware versions, tamper events, and maintenance history.
- Captures provisioning data, assignments, technician notes, and status changes.
- Writes audit events for device lifecycle changes.

## Navigation & Routing
- `/sensor-fleet` links to `/asset-registry/:id`, `/gateway-connectivity`, `/predictive-maintenance`, and `/alerts`.
- Offline sensors link to connectivity diagnostics.

