# Meter Token Analytics

## Page Title & Description
Meter-level analytics page focused on prepaid token purchase behaviour from Conlog, Hexing, Mojec, GridIQ, or vendor-agnostic adapters.

## User Roles & Access Control
- Operations, management, administrators, auditors, and authorised analysts can view.
- Field agents can view token summaries for assigned cases.
- External viewers cannot access customer-identifiable token records.

## UI/UX Component Breakdown
- Meter search and account lookup.
- Token transaction timeline.
- Purchase-frequency chart.
- Consumption-versus-peer comparison.
- Vendor adapter status indicator.
- Fraud signal panel.
- Customer/account metadata panel.

## User Actions & Interactions
- Search by account, meter serial, customer name, or feeder zone.
- Filter transactions by date, vendor, vending agent, or tariff category.
- Open related alert or investigation.
- Flag suspicious vending-agent patterns.
- Export masked transaction history if authorised.

## Data Requirements & State
- Fetches meters, customers, token transactions, vending agents, tariff categories, anomaly scores, and vendor ingestion status.
- Captures search query, filters, manual flags, and export parameters.
- Writes audit events for customer-identifiable record access.

## Navigation & Routing
- `/analytics/tokens` links to `/alerts/:id`, `/queue/:id`, `/zones/:id`, `/api-integrations`, and `/internal-audit-log`.
- No vendor access displays data-sharing remediation guidance.

