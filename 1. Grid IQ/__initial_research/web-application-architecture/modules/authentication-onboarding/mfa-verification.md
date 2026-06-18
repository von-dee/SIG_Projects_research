# MFA Verification

## Page Title & Description
Second-factor verification page that protects sensitive grid, revenue, and regulator-facing data after primary credential validation.

## User Roles & Access Control
- Required for administrators, auditors, management users, DFI viewers, and any user accessing export or security modules.
- Optional but recommended for operations and field-agent users.
- Guest users cannot access this page without a pending login challenge.

## UI/UX Component Breakdown
- One-time code input.
- Authenticator-app prompt.
- Backup-code link.
- Resend or regenerate challenge control where policy allows.
- Device trust checkbox for approved roles.
- Countdown timer and expired-code state.

## User Actions & Interactions
- Enter code to complete authentication.
- Request a new code if the current challenge expires.
- Use backup code and force backup-code regeneration after successful login.
- Cancel to return to `/login` and invalidate the pending challenge.

## Data Requirements & State
- Fetches pending challenge ID, masked delivery channel, allowed MFA methods, expiry timestamp, and trust-device eligibility.
- Captures verification code and trust-device preference.
- Writes `MFA_SUCCESS`, `MFA_FAILED`, and `TRUSTED_DEVICE_ADDED` audit events.

## Navigation & Routing
- Success follows the role-based redirect from login.
- Too many failed attempts routes to `/login` with lockout messaging.
- Expired challenges remain on `/mfa` with a regenerate action.

