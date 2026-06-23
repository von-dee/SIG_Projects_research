# Account Registration

## Page Title & Description
Account Registration is the public entry point for new BrandWatch Africa customers, pilot participants, and invited organization owners. The page creates the first user identity, captures the organization context, and starts either a trial workspace or an invitation acceptance flow.

## User Roles & Access Control
- Guest users can create a new account, accept an invitation, or request enterprise access.
- Invited Member users can only register with the invited email and organization token.
- Existing authenticated users are redirected to the workspace dashboard.
- Suspended domains, expired invitations, and blocked email addresses cannot complete registration.

## UI/UX Component Breakdown
- BrandWatch Africa logo and concise product positioning for reputation and community intelligence.
- Registration form with name, work email, password, organization name, country, industry, and intended use case.
- Invite-token banner when the user arrives from an invitation link.
- Enterprise pilot request option for Chamber, regulator, or multi-company consortium users.
- Terms, privacy, data-processing, and consent checkboxes.
- Password strength meter, inline validation, and server error summary.

## User Actions & Interactions
- Submit registration creates the user, organization, default owner role, and starter workspace.
- Selecting "I was invited" opens a token/email validation state and pre-fills organization data.
- Selecting enterprise pilot records a sales-qualified onboarding request and routes to a pending review screen.
- Clicking terms or privacy opens the relevant public legal page in a new tab.
- Failed validation keeps form data in local state except password fields.

## Data Requirements & State
- Fetch valid invitation metadata when `invite_token` exists.
- Validate email uniqueness, domain policy, password strength, and country availability.
- Capture user profile fields, organization metadata, consent timestamp, marketing opt-in, and registration source.
- Create initial objects: `account`, `organization`, `workspace`, `user_role`, `audit_log`, and optional `pilot_request`.

## Navigation & Routing
- Success without MFA requirement redirects to `/onboarding/profile-setup`.
- Success with MFA requirement redirects to `/auth/mfa-setup`.
- Existing account redirects to `/auth/login?email=...`.
- Expired invite redirects to `/auth/invite-expired`.
- Server failure routes to inline retry state and logs registration error telemetry.
