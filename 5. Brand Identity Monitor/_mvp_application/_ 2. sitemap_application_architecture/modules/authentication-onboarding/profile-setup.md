# Profile Setup

## Page Title & Description
Profile Setup collects the user's operational role, team function, notification preferences, and initial product context so the platform can personalize dashboards and alerts.

## User Roles & Access Control
- Authenticated users with incomplete profiles can access this page.
- Organization Owners complete both personal profile and organization baseline steps.
- Invited Members can only edit their own profile fields and notification defaults.

## UI/UX Component Breakdown
- Profile form with name, job title, department, phone, country, and preferred language.
- Role intent selector for Community Relations, ESG, Communications, Legal, Executive, Analyst, or Admin.
- Notification preference controls for email, Slack or Teams, SMS, and mobile push.
- Local-language familiarity and review capability fields for human-in-the-loop workflows.
- Completion progress indicator and skip rules for optional fields.

## User Actions & Interactions
- Saving profile updates the user record and personalization settings.
- Choosing a role intent sets the default dashboard layout and sample widgets.
- Enabling SMS requires phone verification before critical alerts are sent.
- Language review selections add the user to eligible human review queues.
- Skipping optional fields routes forward but leaves onboarding checklist incomplete.

## Data Requirements & State
- Fetch authenticated user, organization role, profile completion status, available languages, and notification integrations.
- Capture role intent, contact details, language capabilities, alert preferences, and dashboard defaults.
- Persist onboarding checklist state and audit profile changes.

## Navigation & Routing
- Organization Owners continue to `/onboarding/organization-setup`.
- Invited Members continue to `/dashboard`.
- Phone verification routes to `/onboarding/verify-phone` when SMS is enabled.
- Save failure keeps user on page with inline retry.
