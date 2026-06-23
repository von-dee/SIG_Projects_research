# Executive Dashboard

## Page Title & Description
The Executive Dashboard is the authenticated landing page for leaders who need a single view of reputation health, social license risk, emerging issues, and sector or peer benchmarks.

## User Roles & Access Control
- Executives, Organization Owners, ESG Directors, Chamber Sponsors, and Admins can view this page.
- Member Company users see only their company data plus anonymized sector benchmarks where permitted.
- Chamber users can view sector-wide summaries and anonymized member comparisons.
- Analysts can access underlying drill-downs but cannot see restricted member data unless granted.

## UI/UX Component Breakdown
- KPI cards for social license score, community risk score, sentiment balance, high-risk issues, alert response time, and report readiness.
- Trend charts for 7-day, 30-day, 90-day, and quarterly sentiment movement.
- Ghana map or regional map with risk heat overlay.
- Top narratives panel grouped by topic, stakeholder group, location, and channel.
- Peer benchmark table with anonymized or named display depending on permissions.
- Recommended actions list generated from risk and sentiment signals.
- Export buttons for board pack, weekly brief, and CSV snapshot.

## User Actions & Interactions
- Clicking a KPI drills into the relevant module, such as community risk, mentions, or reports.
- Changing time range refreshes all dashboard widgets and recalculates deltas.
- Selecting a region filters map, narratives, alerts, and benchmark panels.
- Exporting board pack generates a report job and shows progress state.
- Acknowledging a recommendation creates or updates an issue workflow item.

## Data Requirements & State
- Fetch aggregated sentiment, risk scores, SLO score, alert counts, narrative clusters, benchmark metrics, and report-generation status.
- Respect tenant boundaries, data-sharing rules, role permissions, and source visibility.
- Maintain dashboard filter state for organization, project, site, region, topic, stakeholder, and date range.
- Cache expensive aggregate queries with freshness indicators.

## Navigation & Routing
- Links to `/community/heatmap`, `/mentions/feed`, `/alerts/queue`, `/reports/builder`, and `/reports/esg`.
- Restricted drill-downs route to `/system/403`.
- Empty workspace routes to `/sources/connect`.
- Export job failure opens an inline retry and links to report job logs for Admins.
