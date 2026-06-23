# System Status

## Page Title & Description
System Status shows operational health for application services, ingestion connectors, radio transcription, NLP pipelines, alert delivery, API, exports, and scheduled reports.

## User Roles & Access Control
- Public or authenticated visibility depends on deployment policy.
- Authenticated users can see tenant-specific source freshness if permitted.
- Platform Admins can see internal diagnostics through separate restricted tooling.

## UI/UX Component Breakdown
- Overall status banner for operational, degraded, partial outage, or major outage.
- Component cards for web app, authentication, source ingestion, radio capture, transcription, translation, NLP, database, search, alerts, API, exports, and reports.
- Incident timeline with updates, affected components, start time, and resolution.
- Tenant data freshness summary for authenticated Admins.
- Subscribe-to-updates control.

## User Actions & Interactions
- Refreshing status fetches latest component health.
- Subscribing adds email or webhook notification for status updates.
- Clicking incident opens detail timeline.
- Authenticated Admins can navigate to Source Health for tenant-specific issues.

## Data Requirements & State
- Fetch platform component statuses, incidents, uptime history, maintenance windows, and optional tenant freshness metrics.
- Capture subscription request and notification preferences.
- Keep public status decoupled from primary app availability where possible.

## Navigation & Routing
- Links to `/sources/health`, `/system/maintenance`, `/support`, and external status subscription management.
- During outages, route users here from failed protected pages when appropriate.
