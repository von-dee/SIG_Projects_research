# Analyst Workspace

## Page Title & Description
The Analyst Workspace is the operational command center for users who investigate mentions, build queries, validate model outputs, export data, and convert raw signals into intelligence.

## User Roles & Access Control
- Analysts, Data Admins, Communications Leads, ESG Analysts, and Platform Admins can access this page.
- Executives can view a simplified read-only version when enabled.
- Users without export permission can inspect results but cannot download raw data.

## UI/UX Component Breakdown
- Saved query sidebar with folders for brands, sites, competitors, topics, and crisis watches.
- Main result pane showing mention stream, clustered stories, and transcript hits.
- Filter toolbar for source, sentiment, urgency, topic, stakeholder, language, location, and confidence.
- Detail drawer with original text, translation, AI explanation, entities, model version, and audit history.
- Bulk action bar for tagging, assigning, exporting, sending to review, or creating alerts.
- Workspace notes panel for analyst observations and briefing preparation.

## User Actions & Interactions
- Running a saved query updates result counts, feed ordering, charts, and map pins.
- Selecting a mention opens the detail drawer without losing scroll position.
- Bulk tagging updates multiple mentions and writes audit events.
- Sending to review creates human review tasks for low-confidence or sensitive classifications.
- Exporting data creates a permission-checked export job.

## Data Requirements & State
- Fetch saved queries, user permissions, mentions, clusters, sentiment results, topic tags, entities, and review status.
- Capture active filters, selected mentions, bulk actions, analyst notes, and export parameters.
- Keep query execution state, pagination cursor, and realtime subscription state.

## Navigation & Routing
- Links to `/search/query-builder`, `/mentions/detail/:id`, `/review/queue`, `/alerts/create`, and `/reports/builder`.
- Failed query syntax routes to inline parser errors.
- Export permission failure routes to `/system/403`.
- Missing source data links to `/sources/connect`.
