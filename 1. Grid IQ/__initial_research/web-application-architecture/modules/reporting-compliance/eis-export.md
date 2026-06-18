# EIS Export

## Page Title & Description
ECOWAS Energy Information System export page for co-validating and submitting structured monthly performance data.

## User Roles & Access Control
- Management and authorised compliance administrators can submit.
- Auditors, DFI viewers, and regulators can view submission history.
- Operations can preview but cannot submit unless granted compliance permission.

## UI/UX Component Breakdown
- Month selector.
- Utility co-validation checklist.
- Structured JSON preview.
- PDF summary preview.
- Data-quality warnings.
- Submission button with disabled state until validation passes.
- Submission history table.

## User Actions & Interactions
- Review export payload.
- Complete validation checklist.
- Download JSON or PDF.
- Submit to mock or production EIS endpoint.
- Reconcile failed submissions.

## Data Requirements & State
- Fetches injected energy, technical and non-technical losses, revenue billed, revenue collected, SAIDI/SAIFI, customer connections, meter penetration, utility profile, and prior submissions.
- Captures checklist approvals and submitter identity.
- Writes `EIS_SUBMITTED` audit event and immutable submission ID before external delivery.

## Navigation & Routing
- `/eis` links to `/reports`, `/internal-audit-log`, `/api-integrations`, and `/data-governance`.
- Failed submission remains on page with retry and downloadable payload.

