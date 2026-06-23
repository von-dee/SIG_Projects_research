# Onboarding Checklist

## Page Title & Description
The Onboarding Checklist guides new organizations from an empty workspace to a usable reputation intelligence platform by tracking setup across profile, sources, taxonomy, users, alerts, and first report.

## User Roles & Access Control
- Organization Owners, Admins, and Implementation Managers can complete checklist tasks.
- Members can view tasks assigned to them, such as reviewing sentiment examples or connecting a channel.
- Platform Admins can mark implementation milestones and add notes.

## UI/UX Component Breakdown
- Checklist cards for profile setup, organization setup, source connections, topic taxonomy, community registry, alert rules, team invitations, and first report.
- Progress meter with setup percentage and blocking items.
- Recommended next action panel based on incomplete configuration.
- Implementation notes and support contact panel.
- Task ownership selectors and due dates for enterprise pilots.

## User Actions & Interactions
- Clicking a task routes to the relevant setup page.
- Assigning a task notifies the selected user and updates onboarding status.
- Marking a manual task complete records an audit event and implementation note.
- Skipping an optional task requires a reason and may reduce readiness score.

## Data Requirements & State
- Fetch onboarding state, completed setup events, source health, team members, and subscription capabilities.
- Capture task assignments, due dates, skip reasons, support notes, and completion events.
- Derive readiness score from required configuration objects and source activity.

## Navigation & Routing
- Links to `/onboarding/profile-setup`, `/onboarding/organization-setup`, `/sources/connect`, `/community/registry`, `/alerts/create`, `/settings/team`, and `/reports/builder`.
- Completed setup redirects default login to `/dashboard`.
- Blocked tasks display inline guidance and support escalation.
