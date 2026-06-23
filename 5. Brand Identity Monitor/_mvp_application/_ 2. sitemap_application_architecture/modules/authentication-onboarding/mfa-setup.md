# MFA Setup

## Page Title & Description
MFA Setup enrolls users in multi-factor authentication before they access sensitive reputation, community, and ESG data. It supports authenticator apps first, with recovery codes as a required fallback.

## User Roles & Access Control
- Newly registered users in organizations requiring MFA must complete this page.
- Existing users can revisit the page from security settings to rotate MFA.
- Organization Owners and Security Admins can enforce MFA but cannot view another user's secrets.

## UI/UX Component Breakdown
- Stepper with method selection, QR code scan, code verification, and recovery code download.
- QR code and manual setup key for authenticator apps.
- Six-digit verification input with paste support.
- Recovery code list with download and copied-confirmation state.
- Security explanation panel for regulated mining and ESG data protection.

## User Actions & Interactions
- User scans QR code or copies the manual key into an authenticator app.
- Submitting a valid one-time code activates MFA for the account.
- Downloading recovery codes marks them as viewed and records an audit event.
- Regenerating setup key invalidates the previous unverified enrollment secret.
- Cancel returns to login only if organization policy allows non-MFA users.

## Data Requirements & State
- Fetch user MFA policy, organization security policy, and existing enrollment status.
- Generate temporary MFA secret, QR payload, and recovery codes.
- Capture verified MFA method, recovery-code hash set, device metadata, and audit log.
- Do not store plain recovery codes after the user leaves the page.

## Navigation & Routing
- Success redirects to `/onboarding/profile-setup` for new users or `/settings/security` for existing users.
- Invalid code remains on the page with retry count.
- Too many failed attempts redirects to `/auth/login?reason=mfa_locked`.
- Expired setup session redirects to `/auth/login`.
