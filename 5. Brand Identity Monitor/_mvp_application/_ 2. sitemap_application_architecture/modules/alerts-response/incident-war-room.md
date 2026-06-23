# Incident War Room

## Page Title & Description
Incident War Room is a focused response workspace for critical or escalating narratives, such as water pollution allegations, protests, safety incidents, regulatory action, or misinformation affecting the mining sector.

## User Roles & Access Control
- Executives, Communications, Community Relations, ESG, Legal, Analysts, and Admins can access incidents they are assigned to.
- Legal can mark evidence privileged or restrict visibility.
- External member-company users can be invited to a limited incident workspace.

## UI/UX Component Breakdown
- Incident header with severity, status, affected sites, communities, topics, owner, and active SLA.
- Live timeline of mentions, alerts, decisions, statements, tasks, and report exports.
- Evidence board with pinned mentions, transcripts, documents, screenshots, and field observations.
- Response task board for communications, community engagement, legal review, ESG evidence, and executive updates.
- Narrative spread chart showing velocity by channel and geography.
- Draft response area with approval status and version history.

## User Actions & Interactions
- Promoting an alert to incident creates the war room with linked evidence.
- Adding evidence pins items from mention feed, transcript browser, or uploads.
- Assigning tasks notifies owners and tracks due dates.
- Drafting a response sends it through approval workflow.
- Closing incident requires summary, outcome, lessons learned, and report archive.

## Data Requirements & State
- Fetch incident record, linked alerts, evidence, tasks, users, approvals, narrative metrics, and audit history.
- Capture incident status, severity changes, evidence pins, task updates, draft responses, approvals, closure notes, and report generation.
- Preserve immutable incident timeline for governance and postmortem review.

## Navigation & Routing
- Links to `/alerts/queue`, `/mentions/feed`, `/reports/incident/:id`, `/community/:id`, and `/settings/audit-logs`.
- Closed incidents route to read-only archive view.
- Restricted incident access routes to `/system/403`.
