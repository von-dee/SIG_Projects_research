# Utility Profile

## Page Title & Description
Settings page for utility identity, operating territory, tariff assumptions, baseline loss values, currency, and reporting defaults.

## User Roles & Access Control
- Administrators and management can edit approved fields.
- Finance users can edit tariff and currency assumptions if authorised.
- Auditors and DFI viewers can view history.

## UI/UX Component Breakdown
- Utility identity form.
- Country, region, and timezone selectors.
- Tariff and currency settings.
- Baseline NTL configuration.
- Service-area and customer-count fields.
- Reporting and EIS identifiers.
- Change-history panel.

## User Actions & Interactions
- Update utility metadata.
- Propose tariff or baseline changes.
- Lock reporting assumptions for a period.
- Upload supporting documents.
- View previous profile versions.

## Data Requirements & State
- Fetches utility profile, tariffs, baseline NTL, reporting IDs, regulatory identifiers, and change history.
- Captures edited settings, supporting documents, and approval notes.
- Version-controls changes affecting reports or ROI.

## Navigation & Routing
- `/settings/utility` links to `/analytics/revenue-loss`, `/eis`, `/pilot-controls`, and `/data-governance`.
- Assumption changes affecting locked reports require revision workflow.

