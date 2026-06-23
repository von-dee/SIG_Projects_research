# API Documentation

## Page Title & Description
API Documentation is the developer-facing reference for integrating BrandWatch Africa data with GIS systems, BI tools, ESG platforms, internal dashboards, and incident workflows.

## User Roles & Access Control
- Authenticated users with API documentation access can view endpoint docs.
- API Admins and Developers can test endpoints using their own keys.
- Public guests cannot access tenant-specific API examples.

## UI/UX Component Breakdown
- Endpoint sidebar for mentions, communities, trends, alerts, queries, reports, exports, webhooks, and authentication.
- OpenAPI-powered endpoint detail with method, path, parameters, response schema, errors, and examples.
- Try-it console using selected API key and sandbox mode.
- Code examples for JavaScript, Python, curl, and BI connector patterns.
- Rate limit, pagination, filtering, and webhook verification guides.

## User Actions & Interactions
- Selecting endpoint updates detail panel and sample payloads.
- Running Try-it executes request against sandbox or permitted tenant data.
- Copying code sample records no audit event unless it includes live key metadata.
- Downloading OpenAPI spec creates a versioned docs artifact.
- Clicking create API key routes to API key settings.

## Data Requirements & State
- Fetch API schema version, endpoint metadata, user API permissions, sample data, and available keys.
- Capture selected endpoint, selected environment, test parameters, and Try-it result.
- Do not expose secrets in logs or examples.

## Navigation & Routing
- Links to `/settings/api-keys`, `/settings/integrations`, `/exports`, and `/system/status`.
- Try-it unauthorized response displays API error and docs guidance.
- Missing API entitlement routes to `/settings/billing`.
