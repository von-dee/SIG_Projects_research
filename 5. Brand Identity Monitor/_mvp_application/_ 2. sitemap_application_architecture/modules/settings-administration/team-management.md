# Team Management

## Page Title & Description
Team Management controls users, invitations, roles, groups, member-company access, and cross-functional response teams.

## User Roles & Access Control
- Organization Owners and Admins can manage users and roles.
- Team Managers can invite users within allowed role limits.
- Platform Admins can assist under audited support access.
- Standard Members can view team directory if enabled.

## UI/UX Component Breakdown
- User table with name, email, role, team, organization, status, MFA state, last active, and invitation status.
- Invite user modal with email, role, group, project scope, company scope, and message.
- Role matrix showing permissions for Executive, Analyst, Community Relations, ESG, Communications, Legal, Field Team, Admin, and Viewer.
- Group management for response teams, reviewers, approvers, and field assignments.
- Seat usage and pending invitations panel.

## User Actions & Interactions
- Inviting user sends email and creates expiring invitation token.
- Changing role updates permissions after confirmation.
- Suspending user invalidates active sessions and disables alerts ownership.
- Reassigning ownership moves alerts, reports, and review tasks.
- Removing user preserves audit history and anonymizes where required by policy.

## Data Requirements & State
- Fetch users, roles, groups, invitations, seat limits, project scopes, company scopes, MFA status, and task ownership.
- Capture invitations, role changes, suspensions, group assignments, and ownership reassignment.
- Maintain audit logs for all access-control changes.

## Navigation & Routing
- Links to `/settings/security`, `/settings/audit-logs`, `/settings/billing`, and `/community/registry`.
- Seat limit routes to `/settings/billing`.
- Last owner removal blocked inline.
