# Integrations

## Page Title & Description
Integrations manages outbound and inbound connections for notifications, collaboration, identity, data export, CRM, GIS, and reporting ecosystems.

## User Roles & Access Control
- Admins, Integration Admins, Data Admins, and Platform Admins can configure integrations.
- Analysts can view available integrations but cannot manage secrets unless granted.
- OAuth connection ownership follows organization policy.

## UI/UX Component Breakdown
- Integration catalog for Slack, Microsoft Teams, Email, SMS, WhatsApp Business, PagerDuty, SSO, GIS, PowerBI, Tableau, object storage, and webhooks.
- Connected integration cards with status, scopes, owner, last used, and error state.
- Setup modal for OAuth, API key, webhook URL, or credential-based integrations.
- Test notification or test export button.
- Integration logs and permission scopes.

## User Actions & Interactions
- Connecting integration starts OAuth or credential validation.
- Testing integration sends sample payload and displays result.
- Disconnecting integration disables related alert channels after confirmation.
- Rotating secret invalidates old credential and stores encrypted replacement.
- Viewing logs opens permission-scoped delivery or sync history.

## Data Requirements & State
- Fetch integration catalog, connected integrations, secrets metadata, scopes, delivery logs, and dependent alert rules.
- Capture credentials, OAuth tokens, webhook URLs, scopes, test results, and disconnect confirmation.
- Store secrets encrypted and audit all secret access or rotation events.

## Navigation & Routing
- Links to `/alerts/create`, `/settings/security`, `/settings/api-keys`, and `/sources/connect`.
- Missing required scope remains in setup modal.
- Unauthorized integration management routes to `/system/403`.
