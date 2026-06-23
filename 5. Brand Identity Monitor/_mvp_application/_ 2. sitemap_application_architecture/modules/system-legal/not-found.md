# Not Found

## Page Title & Description
Not Found handles invalid, deleted, or mistyped routes while helping users recover without exposing whether restricted resources exist.

## User Roles & Access Control
- Guests and authenticated users can view this page.
- Authenticated users receive workspace-aware navigation options.
- Restricted resources may intentionally resolve here instead of revealing object existence.

## UI/UX Component Breakdown
- Clear 404 title and short explanation.
- Primary action to return to dashboard for authenticated users or login for guests.
- Search field for authenticated users to find reports, mentions, communities, or settings.
- Support link and status page link.
- Request ID shown for troubleshooting.

## User Actions & Interactions
- Clicking return routes user to safe default page.
- Searching uses global search within permission scope.
- Contacting support opens support workflow with request ID attached.

## Data Requirements & State
- Fetch authentication state, safe default route, and optional request ID.
- Do not fetch or reveal restricted missing resource metadata.
- Capture 404 telemetry with route, referrer, and user/session identifiers where allowed.

## Navigation & Routing
- Authenticated primary route: `/dashboard`.
- Guest primary route: `/auth/login`.
- Search results route to valid resources or remain permission-scoped.
- Repeated 404s can surface support prompt.
