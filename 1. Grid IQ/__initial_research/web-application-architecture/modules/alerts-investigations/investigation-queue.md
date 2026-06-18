# Investigation Queue

## Page Title & Description
Prioritised field-work queue converting validated alerts into dispatchable investigations ranked by confidence, revenue impact, risk, and age.

## User Roles & Access Control
- Operations users can view and assign all cases.
- Field agents see only assigned cases.
- Management and auditors can view read-only.
- Administrators can configure queue rules.

## UI/UX Component Breakdown
- Card or table queue view.
- Sort controls for confidence, revenue impact, time in queue, and zone.
- Assignment panel.
- Map-link buttons for GPS coordinates.
- Status badges.
- Outcome progress indicators.
- Offline-ready field state indicator.

## User Actions & Interactions
- Assign case to agent or team.
- Mark dispatched, arrived, inspecting, resolved, inconclusive, or escalated.
- Open case detail.
- Batch reassign by zone or team.
- Export field manifest.

## Data Requirements & State
- Fetches investigations, linked alerts, zones, meters, agents, GPS coordinates, statuses, and risk flags.
- Captures assignments, dispatch timestamps, status changes, and queue filters.
- Maintains offline pending-state for field users.

## Navigation & Routing
- `/queue` links to `/queue/:id`, `/alerts/:id`, `/zones/:id`, and external map apps.
- Field users attempting all-queue access remain on their scoped queue.

