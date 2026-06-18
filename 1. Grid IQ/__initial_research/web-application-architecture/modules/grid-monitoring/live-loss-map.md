# Live Loss Map

## Page Title & Description
Geospatial operating view showing feeder and transformer zones colour-coded by current non-technical loss severity, refreshed from meter analytics and IoT readings.

## User Roles & Access Control
- Operations, management, administrators, and auditors can view.
- Field agents can view assigned zones only.
- DFI and regulator viewers see aggregated or delayed data where contractual rules require.

## UI/UX Component Breakdown
- Full-screen GIS map centred on the utility service area.
- Feeder polygons and transformer markers.
- Severity legend: normal, elevated, high, critical.
- Hover tooltip with NTL percentage, injected kWh, billed kWh, and last update.
- Side panel for selected zone.
- Summary bar by severity.
- Low-bandwidth map fallback.

## User Actions & Interactions
- Hover zones for summary metrics.
- Click a zone to open drill-down.
- Toggle layers for meters, sensors, outages, investigations, and political-risk overlays.
- Filter by severity, region, feeder, and update freshness.
- Refresh manually if live polling is stale.

## Data Requirements & State
- Fetches feeder zones, polygons, current injected and billed energy, NTL severity, sensor status, active alerts, and assigned investigations.
- Stores map viewport, selected layers, selected zone, and refresh cadence.
- Server computes NTL and severity; client never sends derived loss values.

## Navigation & Routing
- `/map` opens `/zones/:id` in side panel or dedicated route.
- Alert layer links to `/alerts/:id`.
- Investigation layer links to `/queue/:id`.
- Map failure routes to `/offline-low-bandwidth` fallback.

