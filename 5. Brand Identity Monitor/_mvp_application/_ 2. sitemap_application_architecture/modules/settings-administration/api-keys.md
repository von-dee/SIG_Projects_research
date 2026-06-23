# API Keys

## Page Title & Description
API Keys allows authorized users to create and manage machine credentials for REST API access to mentions, community scores, trends, alerts, reports, and exports.

## User Roles & Access Control
- Admins, API Admins, Data Admins, and Platform Admins can manage API keys.
- Analysts can request keys if organization policy supports approval.
- API secret values are shown only once at creation.

## UI/UX Component Breakdown
- API key table with name, scope, owner, status, created date, last used, expiration, and rate limit.
- Create key modal with scopes, project restrictions, IP allowlist, expiration, and purpose.
- Secret reveal panel displayed once after creation.
- Usage chart for requests, errors, and rate-limit events.
- Rotate, revoke, and audit actions.

## User Actions & Interactions
- Creating key generates secret, stores hash, and displays secret once.
- Rotating key creates replacement and optional grace period.
- Revoking key immediately blocks requests and writes audit event.
- Updating scopes requires confirmation and may notify owner.
- Viewing usage filters request logs by key and endpoint.

## Data Requirements & State
- Fetch API keys, scopes, usage logs, rate limits, project list, IP allowlist policy, and permissions.
- Capture key name, scopes, restrictions, expiration, secret creation, rotation, and revocation.
- Store only hashed secret and encrypted metadata where required.

## Navigation & Routing
- Links to `/api/docs`, `/settings/audit-logs`, and `/settings/integrations`.
- Secret lost state directs user to rotate key.
- Unauthorized access routes to `/system/403`.
