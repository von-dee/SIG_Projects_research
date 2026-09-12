> Module 1: Master Dashboard & War Room Command Center → 1.1 Real-Time Command Center

## Real-Time Command Center
### Purpose and access
Gives the Event Director and Ops Lead a role-filtered operational picture. Command users configure views; zone leads can acknowledge only their own alerts; executives receive read-only aggregates.
### Data model
| Entity | Fields and relationships |
|---|---|
| `metric_snapshot` | `id UUID`, `event_id FK`, `metric_key text`, `value numeric`, `source_at timestamptz`, `quality enum`, `zone_id FK?` |
| `alert` | `id UUID`, `rule_id FK`, `severity enum`, `status enum`, `owner_id FK`, `dedupe_key text`, `opened_at timestamptz` |
| `dashboard_layout` | `id UUID`, `user_id FK?`, `role text`, `widgets jsonb`, `version int` |
### Rules and integrations
- IF a source is older than its `stale_after_seconds`, THEN render its value as stale and exclude it from automated escalation.
- IF the same `dedupe_key` reoccurs within 10 minutes, THEN increment the existing alert rather than create another.
- Edge case: if a gate reports negative occupancy after a manual correction, retain the raw event, clamp the display to zero, and create a data-quality alert.

Ingest occupancy from HID/Genetec, ticket scans from access control, weather from Tomorrow.io, and task/incident events from internal APIs. Vendor webhooks enter through the integration hub.
### UX, resilience, acceptance
The wallboard has KPI tiles, venue map heat layer, ROS timeline, and an alert rail. Personal consoles allow drill-down but hide PII by default. Cached last-known values remain visible for 15 minutes; then widgets show `NO LIVE DATA`. 

- A zone lead can acknowledge, assign, and annotate an eligible alert.
- A stale source visibly identifies its timestamp.
- Duplicate source alarms produce one correlated incident candidate.
