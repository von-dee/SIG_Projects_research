# Webhook Management

## Page Title & Description
Webhook Management lets teams send BrandWatch Africa events to external systems when alerts trigger, reports publish, review tasks complete, or community risk changes.

## User Roles & Access Control
- Admins, Integration Admins, API Admins, and Platform Admins can manage webhooks.
- Analysts can view delivery logs if granted.
- Secrets and signing keys are restricted to Admins.

## UI/UX Component Breakdown
- Webhook endpoint table with URL, subscribed events, status, last delivery, failure count, and owner.
- Create/edit modal with endpoint URL, event types, filters, signing secret, retry policy, and active state.
- Delivery log with payload preview, response code, latency, and retry history.
- Test event sender with sample payloads.
- Signing secret rotation controls.

## User Actions & Interactions
- Creating webhook validates URL and sends verification challenge.
- Testing webhook sends sample event and shows response.
- Disabling webhook stops deliveries without deleting configuration.
- Retrying failed delivery queues one manual retry.
- Rotating signing secret supports optional overlap window.

## Data Requirements & State
- Fetch webhooks, event catalog, delivery logs, retry policy, signing metadata, and permissions.
- Capture endpoint URL, event subscriptions, filters, signing secret, active state, retries, and delivery outcomes.
- Store secrets securely and maintain delivery audit trail.

## Navigation & Routing
- Links to `/api/docs`, `/settings/integrations`, and `/alerts/create`.
- Invalid URL remains inline.
- Unauthorized management routes to `/system/403`.
