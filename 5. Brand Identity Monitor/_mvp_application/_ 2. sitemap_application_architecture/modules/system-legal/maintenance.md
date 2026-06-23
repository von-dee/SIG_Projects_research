# Maintenance

## Page Title & Description
Maintenance communicates planned or emergency service downtime for the application, ingestion pipelines, transcription processing, alert delivery, or reporting exports.

## User Roles & Access Control
- Guests and authenticated users can view this page.
- Platform Admins can see additional diagnostic links when logged in.
- Critical alert delivery may remain active even when dashboard access is limited.

## UI/UX Component Breakdown
- Maintenance status title with affected services and expected recovery time.
- Component list for dashboard, ingestion, radio transcription, NLP processing, alerts, exports, API, and authentication.
- Link to status page and support contact.
- Read-only notice when users can view cached dashboards but cannot modify data.

## User Actions & Interactions
- Refresh checks service status again.
- Status page link opens public or authenticated status page.
- Support link opens incident contact path.
- Platform Admin diagnostic link routes to operations console if available.

## Data Requirements & State
- Fetch platform status, incident message, affected components, expected recovery time, and request ID.
- Cache maintenance payload independently from primary application APIs where possible.
- Log user attempts during downtime for reliability analysis.

## Navigation & Routing
- Recovery redirects users to originally requested route.
- If authentication is down, status page remains available publicly.
- Operations-only links route to restricted admin tools.
