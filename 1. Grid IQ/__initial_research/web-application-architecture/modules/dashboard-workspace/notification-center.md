# Notification Center

## Page Title & Description
Central inbox for alerts, EIS reminders, investigation updates, maintenance warnings, security notices, and administrative messages.

## User Roles & Access Control
- All authenticated users can view notifications addressed to them.
- Administrators can broadcast operational or maintenance notices.
- Auditors can view notification audit metadata but not private message content unless policy permits.

## UI/UX Component Breakdown
- Notification list grouped by unread, today, this week, and older.
- Type filters: alert, investigation, report, EIS, security, system.
- Read/unread toggles.
- Priority badges.
- Deep-link buttons to source pages.
- Broadcast composer for administrators.

## User Actions & Interactions
- Mark one or all notifications as read.
- Click a notification to navigate to the underlying alert, case, report, or setting.
- Mute notification category where allowed.
- Administrators send broadcast notices to roles or teams.

## Data Requirements & State
- Fetches user notifications, delivery status, source entity, priority, and expiration.
- Captures read status, mute preferences, and broadcast content.
- Writes audit events for security and broadcast notifications.

## Navigation & Routing
- `/notifications` deep-links to `/alerts/:id`, `/queue/:id`, `/reports`, `/eis`, `/cybersecurity`, or `/settings/notifications`.
- Deleted source entities show a safe unavailable-state message.

