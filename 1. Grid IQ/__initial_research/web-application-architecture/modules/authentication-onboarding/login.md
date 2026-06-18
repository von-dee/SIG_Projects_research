# Login

## Page Title & Description
Secure sign-in page for GridIQ users. It authenticates utility staff, field agents, DFI viewers, regulators, auditors, and administrators before routing them to the correct workspace.

## User Roles & Access Control
- Guest users can view and submit the login form.
- Inactive, deactivated, or locked accounts are blocked with a support-oriented error.
- Authenticated users are redirected away from this page to their default route.

## UI/UX Component Breakdown
- GridIQ wordmark and selected utility workspace label.
- Email and password fields with inline validation.
- Remember-device checkbox.
- Login button with loading state.
- Demo credential quick-fill buttons for pilot environments only.
- Links to password recovery, utility registration, privacy, and terms.
- Security notice for critical-infrastructure data access.

## User Actions & Interactions
- Submit credentials to create a short-lived access token and refresh session.
- Toggle remember-device to extend refresh-token persistence.
- Click forgot-password to begin recovery.
- Click register-utility to request a new workspace.
- Failed attempts increment the rate-limit counter and may trigger temporary lockout.

## Data Requirements & State
- Captures email, password, remember-device flag, browser metadata, and IP address.
- Fetches user account status, MFA requirement, role, utility workspace, and last-login metadata.
- Writes `LOGIN_SUCCESS`, `LOGIN_FAILED`, and `MFA_REQUIRED` audit events.

## Navigation & Routing
- `operations` redirects to `/map`.
- `management` redirects to `/dashboard`.
- `auditor` redirects to `/audit-log`.
- `field_agent` redirects to `/queue`.
- `admin` redirects to `/settings/users`.
- MFA-enabled users redirect to `/mfa`.
- Locked users remain on `/login` with an account-state message.

