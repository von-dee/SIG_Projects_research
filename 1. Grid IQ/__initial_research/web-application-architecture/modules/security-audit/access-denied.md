# Access Denied

## Page Title & Description
Authorisation failure page shown when an authenticated user attempts to access a page, action, or record outside their permissions.

## User Roles & Access Control
- All authenticated users may encounter this page.
- Guests are redirected to login rather than shown this page.
- Sensitive resource existence is not disclosed when policy requires concealment.

## UI/UX Component Breakdown
- Clear 403 status title.
- Plain-language reason where safe.
- Current role and workspace indicator.
- Return-to-dashboard button.
- Request-access button if enabled.
- Support reference ID.

## User Actions & Interactions
- Return to role home.
- Request access with justification.
- Contact administrator.
- Sign out.

## Data Requirements & State
- Fetches current user, role, attempted route, safe denial reason, and support reference ID.
- Captures access request justification if submitted.
- Writes `ACCESS_DENIED` audit event.

## Navigation & Routing
- `/403` links to role home, `/settings/profile`, and `/login` for sign-out.
- Approved access requests notify administrators and return user to safe page.

