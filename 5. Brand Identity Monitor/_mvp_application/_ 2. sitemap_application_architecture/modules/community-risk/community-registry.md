# Community Registry

## Page Title & Description
Community Registry defines the monitored catchment communities, administrative boundaries, source coverage, baseline sentiment, languages, and field ownership used by the risk engine.

## User Roles & Access Control
- Admins, Data Admins, Community Relations Leads, and Implementation Managers can edit registry records.
- Analysts and Executives can view registry coverage.
- Field Agents can view assigned communities and suggest updates.

## UI/UX Component Breakdown
- Registry table with community name, district, region, country, coordinates, population, language, mine proximity, sources, assigned owner, and baseline score.
- Add/edit community form with geocoding support.
- Bulk import for CSV or GeoJSON community lists.
- Map preview for coordinates and boundary validation.
- Coverage completeness panel highlighting missing radio, field, SMS, or language coverage.

## User Actions & Interactions
- Adding a community creates a registry record and initializes risk score baselines.
- Bulk import validates duplicates, missing coordinates, and administrative hierarchy.
- Assigning field agent updates observation routing and mobile app task lists.
- Linking radio stations changes source weighting for the community score.
- Deactivating a community preserves historical scores but removes it from active monitoring.

## Data Requirements & State
- Fetch community records, mine sites, users, station coverage, administrative boundaries, languages, and source weighting rules.
- Capture community metadata, coordinates, boundaries, source links, baseline sentiment, owner assignment, and active status.
- Update geospatial indexes and community score calculation inputs.

## Navigation & Routing
- Links to `/community/heatmap`, `/sources/radio-stations`, `/settings/team`, and `/community/:id`.
- Import errors remain on page with downloadable validation file.
- Duplicate community opens merge review workflow.
