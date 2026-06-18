# Executive Dashboard

## Page Title & Description
Management landing page summarising loss reduction, recovered revenue, EIS readiness, investigation throughput, outage reliability, and pilot performance.

## User Roles & Access Control
- Management, administrators, DFI viewers, regulator viewers, and auditors can view.
- Operations users can view if granted dashboard permission.
- Field agents are denied and routed to their queue.

## UI/UX Component Breakdown
- KPI cards for NTL percentage, revenue recovered, alerts generated, confirmed thefts, SAIDI, and SAIFI.
- Trend charts for injected versus billed energy.
- Severity distribution by feeder zone.
- Investigation funnel.
- EIS submission status panel.
- DFI impact summary.
- Risk and escalation widget for politically sensitive cases.

## User Actions & Interactions
- Change reporting month or comparison baseline.
- Click KPI cards to open filtered detail pages.
- Download management summary.
- Submit validated report to EIS if authorised.
- Open high-risk escalation cases from the dashboard widget.

## Data Requirements & State
- Fetches utility profile, monthly snapshots, alerts, investigations, ROI calculations, EIS submissions, and outage metrics.
- Requires server-computed NTL and revenue-recovery values.
- Stores selected month, comparison period, and dashboard filters in user preference state.

## Navigation & Routing
- `/dashboard` links to `/reports`, `/roi`, `/alerts`, `/eis`, `/pilot-controls`, and `/political-risk`.
- EIS action routes to `/eis`.
- Missing data routes to an empty-state onboarding checklist.

