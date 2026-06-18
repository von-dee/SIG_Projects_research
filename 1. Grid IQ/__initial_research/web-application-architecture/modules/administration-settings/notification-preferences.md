# Notification Preferences

## Page Title & Description
Settings page for personal and role-based alerts across email, SMS, in-app, digest, and low-bandwidth channels.

## User Roles & Access Control
- All authenticated users can manage personal preferences.
- Administrators can configure role defaults and mandatory security notices.
- Auditors can view notification policy changes.

## UI/UX Component Breakdown
- Channel toggles.
- Alert category controls.
- Critical-alert escalation settings.
- Weekly digest options.
- Quiet-hours selector.
- Low-bandwidth/SMS preference.
- Test notification button.

## User Actions & Interactions
- Enable or disable notification categories where allowed.
- Set quiet hours.
- Subscribe to zones or teams.
- Send test notification.
- Restore role defaults.

## Data Requirements & State
- Fetches user preferences, role defaults, available channels, zone subscriptions, and mandatory categories.
- Captures toggles, quiet hours, subscriptions, and channel verification status.
- Logs changes to security-critical notification settings.

## Navigation & Routing
- `/settings/notifications` links to `/notifications`, `/settings/teams`, and `/profile-setup`.
- Mandatory notices cannot be disabled and show explanatory tooltip.

