# Operations Workspace

## Page Title & Description
Daily command center for utility operations teams monitoring live loss zones, active alerts, field assignments, connectivity health, and queue backlog.

## User Roles & Access Control
- Operations users and administrators have full access.
- Management can view read-only.
- Field agents see assigned case summaries only.

## UI/UX Component Breakdown
- Live map preview.
- Active critical alerts panel.
- Field-team availability and assignment board.
- Zone severity list.
- Connectivity status summary for sensors and gateways.
- Workload counters by investigation status.
- Quick filters for high-confidence and high-value alerts.

## User Actions & Interactions
- Open map or zone detail.
- Assign alerts to field agents.
- Escalate politically sensitive cases.
- Acknowledge connectivity incidents.
- Filter queue by severity, estimated loss, zone, or time in queue.

## Data Requirements & State
- Fetches zones, alerts, field agents, investigations, sensor health, gateway connectivity, and escalation flags.
- Captures assignment actions, acknowledgements, and operational notes.
- Maintains live-refresh state and last successful sync timestamp.

## Navigation & Routing
- `/workspace` links to `/map`, `/alerts`, `/queue`, `/sensor-fleet`, `/gateway-connectivity`, and `/political-risk`.
- Assignment completion stays in workspace with toast confirmation.
- Permission failures route to `/403`.

