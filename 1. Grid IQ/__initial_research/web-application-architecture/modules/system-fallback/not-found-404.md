# Not Found

## Page Title & Description
Fallback page for invalid, deleted, or unavailable routes and resources.

## User Roles & Access Control
- Guests and authenticated users can see this page.
- Authenticated users see role-aware navigation actions.
- Sensitive deleted resources should not disclose prior existence.

## UI/UX Component Breakdown
- 404 title.
- Short recovery message.
- Search box for authorised users.
- Role-home button.
- Links to map, dashboard, reports, or help based on role.
- Support reference ID.

## User Actions & Interactions
- Search for accessible pages or records.
- Return to previous page.
- Navigate to role home.
- Report broken link.

## Data Requirements & State
- Fetches current auth state, role home, attempted URL, and safe search index if authenticated.
- Captures broken-link report and referrer.
- Logs repeated 404s for route-quality monitoring.

## Navigation & Routing
- `/404` links to `/login` for guests or the user’s role home.
- Search results route only to authorised resources.

