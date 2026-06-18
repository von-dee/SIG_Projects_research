# Revenue Loss Model

## Page Title & Description
Financial modelling page translating NTL kWh into revenue loss, recovered revenue, tariff sensitivity, success-fee calculations, and DFI impact evidence.

## User Roles & Access Control
- Management, finance, administrators, DFI viewers, and auditors can view.
- Only finance administrators can edit approved tariff assumptions.
- Operations users can view zone-level revenue impact.

## UI/UX Component Breakdown
- Baseline versus current NTL calculator.
- Tariff and currency assumptions panel.
- Monthly recovered revenue chart.
- Zone and tariff-category breakdown table.
- Sensitivity analysis sliders.
- Success-fee and grant-reporting summary.

## User Actions & Interactions
- Change modelling period.
- Run sensitivity scenarios for tariff, collection rate, and confirmed-theft conversion.
- Export revenue model.
- Compare pilot zones with control zones.
- Lock a monthly model for reporting.

## Data Requirements & State
- Fetches monthly snapshots, tariff rates, collection rates, baseline NTL, current NTL, confirmed cases, recovered accounts, and currency settings.
- Captures scenario assumptions and locked-report approvals.
- Server stores money in smallest currency units and computes all derived values.

## Navigation & Routing
- `/analytics/revenue-loss` links to `/roi`, `/reports`, `/pilot-controls`, and `/billing-subscriptions`.
- Draft scenarios stay local until saved.
- Locked models are view-only unless reopened by authorised finance users.

