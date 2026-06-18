# API Integrations

## Page Title & Description
Integration management page for meter vendors, billing systems, GIS, SCADA, EIS, mobile money, and partner API credentials.

## User Roles & Access Control
- Administrators and integration engineers have full access.
- Auditors can view integration activity and credential-rotation history.
- Management can view high-level integration status.

## UI/UX Component Breakdown
- Integration status cards.
- Connector list by category.
- Credential vault status, with secrets masked.
- Schema mapping table.
- Sync history and error logs.
- Test connection button.
- Data-sharing agreement indicator.

## User Actions & Interactions
- Add or configure connector.
- Test connection.
- Rotate credentials.
- Map vendor fields to GridIQ schema.
- Pause or resume sync.
- Download integration error report.

## Data Requirements & State
- Fetches connectors, sync jobs, schema mappings, credential metadata, data-sharing agreements, and error logs.
- Captures connector settings, mappings, credential rotations, and sync controls.
- Never displays raw secrets after creation.

## Navigation & Routing
- `/settings/api-integrations` links to `/analytics/tokens`, `/eis`, `/data-governance`, and `/cybersecurity`.
- Failed sync links to remediation detail.

