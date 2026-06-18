# Password Recovery

## Page Title & Description
Account recovery flow for users who forgot their password or need an administrator-enforced reset.

## User Roles & Access Control
- Guest users can request a reset link.
- Authenticated users should use profile settings instead.
- Deactivated accounts receive a neutral response without disclosing account state.

## UI/UX Component Breakdown
- Email input form.
- Reset-link confirmation state.
- New-password form reached from a signed token.
- Password strength meter.
- Password policy checklist.
- Success and expired-token states.

## User Actions & Interactions
- Submit email to request recovery.
- Open signed reset link and create a new password.
- Resend link after cooldown.
- Return to login after reset.

## Data Requirements & State
- Captures email, reset token, new password, user agent, and IP address.
- Fetches token validity, account lock state, and password policy.
- Writes `PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_COMPLETED`, and `PASSWORD_RESET_FAILED` audit events.

## Navigation & Routing
- Request success stays on `/password-recovery` with generic confirmation.
- Valid token opens `/password-recovery/reset`.
- Completed reset redirects to `/login`.
- Invalid or expired token shows a new-request action.

