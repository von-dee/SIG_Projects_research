# Community Engagement

## Page Title & Description
Planning page for community outreach, education, local partner coordination, and enforcement-sensitive communication around loss reduction.

## User Roles & Access Control
- Community teams, management, operations, administrators, and auditors can view.
- Community programme managers can create activities.
- Field agents can view scheduled outreach for their areas.

## UI/UX Component Breakdown
- Engagement calendar.
- Community area map.
- Partner and stakeholder directory.
- Activity plan form.
- Attendance and outcome tracker.
- Risk notes.
- Message library.

## User Actions & Interactions
- Schedule outreach meeting.
- Assign staff and partner organisations.
- Record attendance and feedback.
- Link engagement activity to regularisation campaign or risk escalation.
- Export engagement summary.

## Data Requirements & State
- Fetches communities, zones, campaigns, stakeholders, activities, attendance, feedback, and risk classifications.
- Captures activity plans, participants, notes, outcomes, and attachments.
- Feeds outcomes into DFI impact reporting.

## Navigation & Routing
- `/community-engagement` links to `/regularisation`, `/political-risk`, `/dfi-impact-pack`, and `/zones/:id`.
- High-risk areas prompt escalation workflow before field activity.

