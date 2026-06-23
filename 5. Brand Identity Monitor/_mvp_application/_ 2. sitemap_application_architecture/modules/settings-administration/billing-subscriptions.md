# Billing And Subscriptions

## Page Title & Description
Billing And Subscriptions manages pricing tier, pilot status, seats, add-ons, invoices, payment methods, usage limits, and enterprise commercial terms.

## User Roles & Access Control
- Organization Owners, Billing Admins, and Platform Admins can access billing controls.
- Admins can view plan usage if granted.
- Members cannot view invoices or payment methods.

## UI/UX Component Breakdown
- Current plan card for Starter, Professional, Enterprise, Custom, or Pilot.
- Usage meters for users, monitored sources, mentions, radio stations, reports, API calls, languages, storage, and export jobs.
- Add-on selector for radio monitoring, local-language tuning, ESG reporting, crisis support, historical backfill, managed analyst service, and API access.
- Invoice table and payment method panel.
- Enterprise contact and contract summary section.

## User Actions & Interactions
- Upgrading plan opens checkout or sales approval flow.
- Adding an add-on updates subscription estimate and requires confirmation.
- Downloading invoice records billing audit event.
- Updating payment method validates through payment provider.
- Requesting enterprise quote creates commercial workflow item.

## Data Requirements & State
- Fetch subscription, plan catalog, add-ons, usage metrics, invoices, payment methods, tax details, and contract terms.
- Capture plan changes, add-on changes, payment updates, invoice downloads, and quote requests.
- Sync billing state with payment processor and entitlement service.

## Navigation & Routing
- Links to `/settings/team`, `/sources/connect`, `/settings/api-keys`, and `/support`.
- Payment failure shows retry and dunning state.
- Permission failure routes to `/system/403`.
