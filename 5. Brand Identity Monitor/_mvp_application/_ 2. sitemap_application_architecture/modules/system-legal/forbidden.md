# Forbidden

## Page Title & Description
Forbidden explains that the user is authenticated but does not have permission to access the requested page, record, field, export, or action.

## User Roles & Access Control
- Authenticated users without required permission see this page.
- Guests are redirected to login instead of this page.
- Admins may see permission diagnostics when debug mode is enabled for support.

## UI/UX Component Breakdown
- 403 title with non-sensitive explanation.
- Required access category summary, such as export permission, admin role, restricted member data, or PII access.
- Primary action to return to dashboard.
- Request access button where organization policy allows.
- Support/request ID panel.

## User Actions & Interactions
- Requesting access creates an access request for Admin review.
- Returning to dashboard routes user to safe workspace default.
- Contacting support includes route, permission key, and request ID.

## Data Requirements & State
- Fetch user role summary, organization access request policy, and request ID.
- Capture access request reason, target resource, and requester metadata.
- Do not expose confidential object names if user lacks visibility.

## Navigation & Routing
- Return link to `/dashboard`.
- Request access submission routes to confirmation state.
- Admin review links appear later in `/settings/team` or notification inbox.
