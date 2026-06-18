# Alert Feed

## Page Title & Description
Operational table of NTL, tamper, token-fraud, internal-fraud, and maintenance alerts requiring triage, assignment, or dismissal.

## User Roles & Access Control
- Operations and administrators can triage and assign.
- Management and auditors can view.
- Field agents see assigned alerts only through their queue.

## UI/UX Component Breakdown
- Sortable, filterable alert table.
- Columns for timestamp, zone, meter/account, type, confidence, estimated loss, status, assignee, and actions.
- Confidence bar and severity badge.
- Bulk action toolbar.
- Saved filters.
- CSV export button.

## User Actions & Interactions
- Filter by zone, type, status, confidence threshold, assignee, and date range.
- Open alert detail.
- Bulk assign selected alerts.
- Mark selected alerts false positive with required reason.
- Export visible records.

## Data Requirements & State
- Fetches alerts, zones, meters, assignees, statuses, estimated losses, and permissions.
- Captures filters, selected rows, assignment choices, and false-positive reasons.
- Writes audit logs for views, assignments, exports, and status changes.

## Navigation & Routing
- `/alerts` links to `/alerts/:id`, `/zones/:id`, `/queue/:id`, and `/analytics/anomalies`.
- Unauthorised bulk actions return inline permission errors.

