# Community Heatmap

## Page Title & Description
Community Heatmap visualizes social license and reputation risk geographically across catchment communities, mining corridors, districts, and sector-wide regions.

## User Roles & Access Control
- Community Relations, ESG, Executives, Analysts, Chamber users, and Admins can view map data within their permitted scope.
- Field Teams see assigned communities and read-only risk context.
- Sensitive community-level detail can be restricted for Chamber or benchmark users.

## UI/UX Component Breakdown
- Interactive map with district, ward, village, mine site, radio coverage, and source availability layers.
- Color-coded community risk bands: green, amber, red, and critical.
- Side panel with selected community score, trend, dominant topics, source breakdown, confidence, and latest mentions.
- Layer controls for sentiment, urgency, source density, stakeholder group, language, and intervention history.
- Time slider for tracking risk movement over days, weeks, months, or quarters.
- Export map snapshot and GeoJSON buttons.

## User Actions & Interactions
- Clicking a community opens its detail panel and filters linked metrics.
- Drawing a region selects multiple communities and updates summary statistics.
- Toggling layers changes map visualization without changing underlying filters unless applied.
- Clicking a high-risk community can create an alert, assign action, or open mention feed.
- Exporting GeoJSON requires API/export permission.

## Data Requirements & State
- Fetch community registry, boundary GeoJSON, mine sites, risk scores, sentiment aggregates, source coverage, intervention events, and user permissions.
- Maintain selected geography, map bounds, active layers, time range, and comparison baseline.
- Use cached geospatial tiles and server-side aggregation for large workspaces.

## Navigation & Routing
- Links to `/community/:id`, `/mentions/feed?community=:id`, `/alerts/create`, `/reports/esg`, and `/sources/radio-stations`.
- No community registry routes to `/community/registry`.
- Export permission failure routes to `/system/403`.
