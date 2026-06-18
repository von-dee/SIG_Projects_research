# Profile Setup

## Page Title & Description
First-login page where invited users complete their identity, security, notification, and operational profile before entering GridIQ.

## User Roles & Access Control
- Invited authenticated users with `profile_incomplete` status can access.
- Administrators can force profile re-completion after policy changes.
- Completed users are redirected to their dashboard.

## UI/UX Component Breakdown
- Personal information form.
- Role explanation panel.
- MFA setup component.
- Field-agent operational coverage selector.
- Notification channel preferences.
- Language and bandwidth preferences.
- Acceptable-use acknowledgement.

## User Actions & Interactions
- Save profile details.
- Enrol authenticator app or backup codes.
- Select zones, teams, and field coverage where applicable.
- Submit acknowledgement of critical-infrastructure data handling.

## Data Requirements & State
- Fetches invite metadata, assigned role, utility, available teams, available zones, and required policies.
- Captures full name, phone, job title, MFA secret confirmation, language, bandwidth mode, and notification preferences.
- Writes `PROFILE_COMPLETED` and `MFA_ENROLLED` audit events.

## Navigation & Routing
- Completion redirects by role to `/map`, `/dashboard`, `/audit-log`, `/queue`, or `/settings/users`.
- Missing MFA for required roles keeps the user on the page.
- Expired invite routes to `/login` with administrator-contact messaging.

