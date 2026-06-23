# MFA Verification

## Page Title & Description
MFA Verification validates a user's second authentication factor after login, high-risk action, sensitive export, or policy-triggered reauthentication event.

## User Roles & Access Control
- Users with MFA enabled must complete this page after primary authentication.
- Users performing sensitive actions may be routed here for step-up authentication.
- Admins cannot bypass another user's MFA challenge.

## UI/UX Component Breakdown
- Six-digit authenticator code input with paste support and auto-submit option.
- Recovery code fallback link.
- Remember this device checkbox when organization policy allows.
- Error states for invalid code, expired challenge, locked account, and recovery code consumed.
- Return-to-login and contact-admin links.

## User Actions & Interactions
- Entering a valid code completes authentication and creates or updates the session.
- Using a recovery code consumes that code and prompts regeneration later.
- Remembering device stores a trusted-device token subject to policy.
- Too many failed attempts locks the challenge and may lock the account temporarily.

## Data Requirements & State
- Fetch pending authentication challenge, organization MFA policy, trusted-device policy, and remaining attempt count.
- Capture verified method, challenge completion, trusted-device decision, recovery code usage, and audit event.
- Maintain requested return URL after MFA success.

## Navigation & Routing
- Success redirects to requested route or `/dashboard`.
- Failed attempts remain inline until lock threshold.
- Expired challenge redirects to `/auth/login`.
- Recovery code success redirects to `/settings/security?recovery_codes=rotate`.
