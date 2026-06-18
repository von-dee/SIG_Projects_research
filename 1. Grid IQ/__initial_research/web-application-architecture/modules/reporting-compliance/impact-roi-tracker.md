# Impact ROI Tracker

## Page Title & Description
Accountability dashboard tracking cumulative recovered revenue, NTL reduction, avoided losses, and funder-facing impact evidence.

## User Roles & Access Control
- Management, finance, administrators, DFI viewers, and auditors can view.
- Finance administrators can approve assumptions.
- Operations users can view operational contribution metrics.

## UI/UX Component Breakdown
- Cumulative recovered revenue hero metric.
- Baseline versus current NTL cards.
- Monthly recovery bar and cumulative line chart.
- Formula explainer using approved tariff assumptions.
- Breakdown table by month, zone, and tariff class.
- Export controls for AfDB, EU, IFC, and internal formats.

## User Actions & Interactions
- Change reporting period.
- Drill into zone or tariff-class contribution.
- Export PDF or spreadsheet pack.
- Compare pilot and control zones.
- Flag disputed attribution for audit review.

## Data Requirements & State
- Fetches baseline NTL, current NTL, tariff rates, collection rates, confirmed recovery cases, monthly snapshots, control-zone data, and locked financial assumptions.
- Captures export format and attribution dispute notes.
- Server computes recovered revenue.

## Navigation & Routing
- `/roi` links to `/analytics/revenue-loss`, `/reports`, `/dfi-impact-pack`, and `/pilot-controls`.
- Missing baseline data routes to pilot setup guidance.

