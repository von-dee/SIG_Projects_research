# Team Management

## Page Title & Description
Administrative page for organising users into operations, field, engineering, finance, audit, community, and compliance teams.

## User Roles & Access Control
- Administrators have full access.
- Team managers can edit their own team membership where policy allows.
- Auditors can view team history.

## UI/UX Component Breakdown
- Team list.
- Team detail panel.
- Member table.
- Coverage-zone selector.
- Queue assignment rules.
- Escalation chain configuration.
- Team activity summary.

## User Actions & Interactions
- Create, rename, or archive team.
- Add or remove members.
- Assign zones or functions.
- Configure escalation chain.
- Set queue routing rules.

## Data Requirements & State
- Fetches teams, users, roles, zones, assignment rules, and escalation policies.
- Captures membership changes, zone coverage, and routing configuration.
- Logs team and permission-impacting changes.

## Navigation & Routing
- `/settings/teams` links to `/settings/users`, `/queue`, `/political-risk`, and `/settings/notifications`.
- Removing final administrator is blocked with validation error.

