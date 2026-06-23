# Password Recovery

## Page Title & Description
Password Recovery lets users securely request a reset link, verify reset eligibility, and create a new password without revealing whether an email address exists.

## User Roles & Access Control
- Guest users can request a reset link.
- Authenticated users changing a known password use Security Settings instead.
- Suspended users cannot reset access until an Admin restores the account.
- SSO-only users are directed to their identity provider.

## UI/UX Component Breakdown
- Email entry form with non-enumerating confirmation message.
- Reset-token form with new password, confirm password, and password strength meter.
- Expired token state with resend option.
- SSO-only state with identity provider contact guidance.
- Security notice about session invalidation after reset.

## User Actions & Interactions
- Submitting email sends reset instructions if the account is eligible.
- Opening reset link validates token and shows password creation form.
- Submitting new password invalidates existing sessions and refresh tokens.
- Resending reset creates a new token and invalidates older unused reset tokens.
- Returning to login routes back to the login page.

## Data Requirements & State
- Validate reset token, expiration, user status, organization status, and SSO policy.
- Capture password hash update, reset timestamp, IP metadata where allowed, and audit event.
- Track reset request rate limits and suspicious activity signals.

## Navigation & Routing
- Request success stays on confirmation state at `/auth/password-recovery`.
- Valid token uses `/auth/reset-password/:token`.
- Reset success redirects to `/auth/login?password_reset=success`.
- Expired token remains on page with resend option.
