# Create Alert Rule

## Page Title & Description
Create Alert Rule lets teams define no-code or query-based conditions that convert monitoring signals into actionable notifications.

## User Roles & Access Control
- Admins, Analysts, Communications Leads, ESG Leads, and Community Relations Leads can create alert rules.
- Members can create personal alerts if organization policy allows.
- Critical executive channels require Admin approval.

## UI/UX Component Breakdown
- Rule builder with IF/AND/OR conditions for community risk score, sentiment, source, topic, urgency, velocity, location, stakeholder, query match, and confidence.
- Threshold inputs, comparison operators, time window controls, and deduplication settings.
- Notification channel selector for email, Slack, Teams, SMS, WhatsApp Business, push, and PagerDuty.
- Recipient and owner selector with escalation policy.
- Preview panel showing recent matches and projected alert volume.
- Test rule button and save/publish controls.

## User Actions & Interactions
- Adding conditions updates preview volume and validates rule completeness.
- Testing rule sends sample notification to selected test channel.
- Saving draft stores rule without activating notifications.
- Publishing activates rule and writes audit event.
- Editing an active rule creates a new version while preserving historical triggers.

## Data Requirements & State
- Fetch available fields, taxonomies, saved queries, notification integrations, user groups, escalation policies, and subscription limits.
- Capture condition tree, thresholds, channels, recipients, deduplication policy, active state, and rule owner.
- Store versioned alert rule with trigger history.

## Navigation & Routing
- Success routes to `/alerts/rules`.
- Query-based rule links to `/search/query-builder`.
- Missing integration links to `/settings/integrations`.
- Projected over-alerting shows warning but allows Admin override.
