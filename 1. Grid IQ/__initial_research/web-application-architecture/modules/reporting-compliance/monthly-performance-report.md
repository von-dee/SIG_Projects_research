# Monthly Performance Report

## Page Title & Description
Monthly utility performance page generating management-ready reports on NTL, revenue recovery, investigations, outages, and operational progress.

## User Roles & Access Control
- Management, administrators, auditors, DFI viewers, and regulators can view.
- Only management and authorised administrators can approve reports.
- Operations can contribute operational notes.

## UI/UX Component Breakdown
- Month selector.
- KPI summary cards.
- Zone breakdown table.
- Alert resolution funnel.
- Injected versus billed trend chart.
- Narrative summary generator.
- Approval status panel.
- PDF download and EIS submission actions.

## User Actions & Interactions
- Select reporting month.
- Review calculated metrics and narrative.
- Add management commentary.
- Approve, lock, download, or submit report.
- Open zone, alert, or ROI detail from report rows.

## Data Requirements & State
- Fetches monthly snapshots, alerts, investigations, outage indicators, ROI metrics, utility profile, and approval history.
- Captures commentary, approval action, and report-lock status.
- Stores generated report metadata and PDF artifact reference.

## Navigation & Routing
- `/reports` links to `/roi`, `/eis`, `/zones/:id`, `/alerts`, and `/pilot-controls`.
- Locked report edits require reopen permission.

