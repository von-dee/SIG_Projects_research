# Data Governance

## Page Title & Description
Governance page defining data ownership, retention, residency, sharing, model-training rights, privacy obligations, and EIS disclosure rules.

## User Roles & Access Control
- Administrators, auditors, management, legal/compliance users, and DFI viewers can view.
- Only governance administrators can edit policy records.
- Operations users see applicable handling rules.

## UI/UX Component Breakdown
- Data classification matrix.
- Retention policy table.
- Residency and hosting status.
- Data-sharing agreements list.
- Model-training consent status.
- EIS disclosure policy.
- Policy version history.

## User Actions & Interactions
- Review data policies.
- Upload or update data-sharing agreements.
- Configure retention periods.
- Approve model-training use of utility data.
- Export governance pack for DFI review.

## Data Requirements & State
- Fetches policy versions, agreements, data categories, residency settings, retention schedules, consent records, and export history.
- Captures policy edits, approvals, and supporting documents.
- Version-controls all governance policy changes.

## Navigation & Routing
- `/data-governance` links to `/settings/api-integrations`, `/eis`, `/cybersecurity`, and `/internal-audit-log`.
- Missing agreement blocks production integration activation.

