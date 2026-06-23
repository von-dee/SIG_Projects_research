# User Profile Settings

## Page Title & Description
User Profile Settings lets each user manage personal details, role intent, notification preferences, language review capabilities, and dashboard defaults.

## User Roles & Access Control
- All authenticated users can edit their own profile.
- Admins can view profile summary for team management but cannot edit personal MFA secrets.
- Suspended users cannot change profile until restored.

## UI/UX Component Breakdown
- Personal information form for name, title, department, phone, country, and preferred language.
- Role intent selector for dashboard personalization.
- Notification preferences for email, Slack or Teams, SMS, WhatsApp Business, push, and digest cadence.
- Local-language review capability settings.
- Default workspace, project, and dashboard controls.

## User Actions & Interactions
- Saving profile updates user metadata and dashboard personalization.
- Changing phone triggers verification before SMS alerts are enabled.
- Updating notification preferences immediately affects future notifications.
- Adding review language can require Admin approval.
- Resetting dashboard defaults clears saved layout preferences.

## Data Requirements & State
- Fetch user profile, organization memberships, notification integrations, language list, and current preferences.
- Capture profile edits, notification settings, language review capabilities, and default workspace.
- Write audit events for sensitive contact or notification changes.

## Navigation & Routing
- Links to `/settings/security`, `/dashboard`, and `/review/queue`.
- Phone verification routes to `/settings/verify-phone`.
- Save failure remains inline with retry.
