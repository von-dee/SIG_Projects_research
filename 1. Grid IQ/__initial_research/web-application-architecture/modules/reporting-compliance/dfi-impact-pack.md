# DFI Impact Pack

## Page Title & Description
Funder-facing reporting package combining ROI, ESG, reliability, gender, customer regularisation, and governance evidence for DFI programmes.

## User Roles & Access Control
- Management, finance, administrators, DFI viewers, and auditors can view.
- Only management can publish final packs externally.
- DFI viewers cannot edit source data.

## UI/UX Component Breakdown
- Impact period selector.
- Revenue recovery section.
- ESG and diesel-displacement estimates.
- Customer regularisation metrics.
- Reliability improvement charts.
- Governance and audit summary.
- Export package builder.

## User Actions & Interactions
- Select funder template.
- Include or exclude approved sections.
- Preview export.
- Publish or download pack.
- Open source metrics for drill-down.

## Data Requirements & State
- Fetches ROI metrics, outage indicators, regularisation outcomes, audit summary, ESG assumptions, gender-lens staffing data, and report approvals.
- Captures template selection, included sections, and publication approval.
- Stores final artifact metadata.

## Navigation & Routing
- `/dfi-impact-pack` links to `/roi`, `/reports`, `/regularisation`, `/internal-audit-log`, and `/pilot-controls`.
- Unapproved source reports block publication with clear checklist.

