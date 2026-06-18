# Alert Detail

## Page Title & Description
Detailed case page for a single anomaly alert, showing evidence, customer context, AI explanation, assignment history, and recommended action.

## User Roles & Access Control
- Operations and administrators can update status and assign.
- Management and auditors can view.
- Field agents can view only assigned alert details.
- Customer-identifiable data is masked for external viewers.

## UI/UX Component Breakdown
- Alert summary header.
- Evidence timeline.
- Meter token history.
- Zone context chart.
- AI explanation panel.
- Recommended action checklist.
- Assignment and status controls.
- Related investigations and audit events.

## User Actions & Interactions
- Assign or reassign to field agent.
- Change status: new, assigned, investigating, confirmed theft, false positive, resolved.
- Create investigation.
- Escalate political-risk case.
- Add note or attach evidence.

## Data Requirements & State
- Fetches alert, meter, customer, zone, transactions, anomaly features, investigations, notes, attachments, and audit trail.
- Captures status changes, notes, attachments, escalation reasons, and assignment updates.
- Preserves full status history.

## Navigation & Routing
- `/alerts/:id` links to `/queue/:id`, `/zones/:id`, `/analytics/tokens`, `/political-risk`, and `/internal-audit-log`.
- Missing alert routes to `/404`.

