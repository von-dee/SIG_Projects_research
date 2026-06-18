# User Management

## Page Title & Description
Administrative page for inviting, activating, deactivating, and governing individual GridIQ user accounts.

## User Roles & Access Control
- Administrators have full access.
- Auditors can view user history and role changes.
- Management can request users but cannot grant privileged roles unless authorised.

## UI/UX Component Breakdown
- User table with search, filters, sorting, and pagination.
- Invite-user modal.
- Role assignment dropdown.
- Account status controls.
- MFA status indicator.
- Last-login and activity summary.
- Role-change history panel.

## User Actions & Interactions
- Invite user by email and role.
- Activate, deactivate, or unlock account.
- Require MFA reset.
- Change role with justification.
- Export user list if authorised.

## Data Requirements & State
- Fetches users, roles, permissions, teams, utility workspace, MFA status, invite status, and activity metadata.
- Captures invite details, status changes, role changes, and admin justification.
- Writes audit events for all identity changes.

## Navigation & Routing
- `/settings/users` links to `/settings/teams`, `/internal-audit-log`, and `/data-governance`.
- Privileged role changes require MFA re-confirmation.

