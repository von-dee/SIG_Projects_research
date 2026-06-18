# Zone Drill-Down

## Page Title & Description
Detailed feeder or transformer-zone page explaining loss drivers, trends, anomalous accounts, alerts, and field activity for a selected zone.

## User Roles & Access Control
- Operations and management can view full zone detail.
- Field agents can view only zones tied to assigned cases.
- DFI/regulator viewers see aggregated customer data with account masking.

## UI/UX Component Breakdown
- Zone header with feeder code, severity badge, and update timestamp.
- KPI cards for injected kWh, billed kWh, NTL kWh, NTL percentage, and estimated revenue loss.
- Twelve-month injected versus billed chart.
- Top anomalous meters table.
- Active alerts list.
- Investigation history.
- Download zone report button.

## User Actions & Interactions
- Filter trend by date range.
- Open anomalous account or alert detail.
- Create investigation from selected anomaly.
- Download PDF or CSV.
- Add operational note if authorised.

## Data Requirements & State
- Fetches zone metadata, monthly snapshots, current readings, meters, token transactions, alerts, investigations, notes, and sensor coverage.
- Captures notes, report parameters, and investigation-creation requests.
- Maintains selected date range and table filters.

## Navigation & Routing
- `/zones/:id` links to `/map`, `/alerts?zone=:id`, `/alerts/:id`, `/queue/:id`, `/reports?zone=:id`, and `/asset-registry?zone=:id`.
- Missing zone ID routes to `/404`.
- Restricted account detail shows masked rows.

