# Alert Queue

## Page Title & Description
Alert Queue prioritizes active reputation, community, ESG, media, legal, and operational risk alerts so teams can review, assign, escalate, and resolve issues.

## User Roles & Access Control
- Community Relations, Communications, ESG, Legal, Executives, Analysts, and Admins can view alerts in their scope.
- Only owners, Admins, or users with response permission can change alert status.
- Critical alerts can be visible to executive roles by default.

## UI/UX Component Breakdown
- Alert list grouped by critical, high, medium, low, acknowledged, and resolved.
- Alert cards showing title, risk score, trigger rule, affected community/site, source channels, top evidence, age, owner, and SLA.
- Detail panel with timeline, mentions, recommended actions, related communities, and response notes.
- Assignment controls, escalation button, status dropdown, and SLA indicators.
- Notification delivery history for email, Slack, Teams, SMS, push, and PagerDuty.

## User Actions & Interactions
- Acknowledging alert records owner and stops repeated notifications according to policy.
- Assigning alert notifies owner and updates SLA timer.
- Escalating creates incident or executive notification based on severity.
- Resolving alert requires resolution note and optional outcome category.
- Linking mentions or reports adds evidence to the alert timeline.

## Data Requirements & State
- Fetch active alerts, trigger rules, evidence mentions, risk scores, owners, SLA policy, notification history, and related incidents.
- Capture acknowledgment, assignment, escalation, status changes, notes, and resolution outcomes.
- Maintain realtime updates for critical and high alerts.

## Navigation & Routing
- Links to `/alerts/detail/:id`, `/alerts/create`, `/alerts/incident/:id`, `/mentions/feed`, and `/community/:id`.
- Missing alert routes to `/system/404`.
- Status-change permission failure routes to `/system/403`.
