# Report Library

## Page Title & Description
Report Library stores drafts, scheduled reports, approved exports, incident archives, ESG reports, board packs, and Chamber intelligence briefs.

## User Roles & Access Control
- Report Editors, Analysts, Executives, ESG, Communications, Admins, and permitted Members can access reports within scope.
- Draft visibility depends on author, workspace, and sharing settings.
- Approved reports can be locked against edits.

## UI/UX Component Breakdown
- Report table with title, type, owner, status, scope, date range, last updated, approval state, and export formats.
- Filters for report type, status, owner, project, site, date, and confidentiality level.
- Preview panel with abstract, included metrics, evidence count, and download links.
- Schedule manager for recurring reports.
- Archive and retention indicators.

## User Actions & Interactions
- Opening draft routes to Report Builder.
- Downloading approved export checks permission and records audit event.
- Duplicating report creates editable copy with same structure and updated date range prompt.
- Scheduling report sets cadence, recipients, filters, and approval rules.
- Archiving hides report from default views but keeps it searchable.

## Data Requirements & State
- Fetch reports, drafts, exports, schedule definitions, permissions, audit download status, and retention policy.
- Capture downloads, schedule edits, duplication, archive state, and sharing changes.
- Maintain immutable final export files and editable draft versions separately.

## Navigation & Routing
- Links to `/reports/builder`, `/reports/esg`, `/alerts/incident/:id`, and `/settings/audit-logs`.
- Missing report routes to `/system/404`.
- Download permission failure routes to `/system/403`.
