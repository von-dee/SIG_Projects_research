# Login

## Page Title & Description
Login authenticates returning users into BrandWatch Africa and routes them to the correct organization, workspace, and role-based dashboard.

## User Roles & Access Control
- Guest users can authenticate with email/password or SSO where enabled.
- Invited but unregistered users are routed to registration.
- Suspended users receive a locked-account message and cannot proceed.
- Users with multiple organizations must select an organization after authentication.

## UI/UX Component Breakdown
- Email and password form with remember-device checkbox.
- SSO buttons for configured enterprise identity providers.
- Forgot-password link, registration link, and invitation acceptance link.
- Inline error states for invalid credentials, locked user, inactive organization, and required MFA.
- Device trust and session timeout messaging.

## User Actions & Interactions
- Submit credentials validates identity and creates a short-lived authentication challenge.
- Successful password authentication either completes login or starts MFA verification.
- SSO button redirects to the configured OAuth/SAML provider and returns to the app callback.
- Forgot-password sends the user to password recovery.
- Organization selector appears after login when the user belongs to more than one tenant.

## Data Requirements & State
- Fetch identity provider configuration by email domain.
- Validate credentials, account status, organization status, MFA policy, and device trust.
- Store session token, refresh token, selected organization, selected workspace, and last-login audit record.
- Capture failed login attempts for rate limiting and suspicious activity monitoring.

## Navigation & Routing
- Success redirects to `/dashboard` or the originally requested protected route.
- MFA required redirects to `/auth/mfa-verify`.
- Password reset required redirects to `/auth/reset-password`.
- No organization redirects to `/onboarding/organization-setup`.
- Unauthorized attempts remain on `/auth/login` with non-enumerating error copy.
