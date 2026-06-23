# Community Detail

## Page Title & Description
Community Detail is the operational profile for one monitored community, combining risk score history, dominant issues, source evidence, stakeholder context, and engagement actions.

## User Roles & Access Control
- Community Relations, ESG, Analysts, Field Teams, Legal, Executives, and Admins can view permitted communities.
- Field Teams can add observations only for assigned communities.
- Chamber users see aggregated or anonymized detail depending on data-sharing agreements.

## UI/UX Component Breakdown
- Community profile header with district, region, country, population estimate, primary languages, proximity to mine, assigned field agent, and coverage sources.
- Risk score chart with trend bands and confidence indicator.
- Topic breakdown for land, water, employment, compensation, safety, local content, regulation, CSR, and protest signals.
- Source evidence tabs for radio, SMS, WhatsApp, field reports, social, news, documents, and surveys.
- Stakeholder panel showing traditional leaders, youth groups, women-led groups, NGOs, regulators, and media contacts where permitted.
- Engagement timeline for meetings, interventions, reports, and alerts.

## User Actions & Interactions
- Adding a field observation opens an offline-capable submission form.
- Assigning an engagement action creates a task with owner, due date, priority, and linked evidence.
- Opening a source tab filters mentions and transcripts to the community.
- Comparing before and after an intervention updates trend charts around the selected date.
- Exporting a community brief creates a PDF for internal review.

## Data Requirements & State
- Fetch community record, risk timeseries, sentiment by topic/source/stakeholder, latest mentions, engagement actions, intervention events, and coverage confidence.
- Capture field observations, action assignments, notes, export requests, and stakeholder updates.
- Preserve data-sharing restrictions for identifiable community submissions.

## Navigation & Routing
- Links to `/community/heatmap`, `/mentions/feed`, `/alerts/queue`, `/reports/builder`, and `/field/observation`.
- Missing community routes to `/system/404`.
- Sensitive stakeholder details show restricted state for unauthorized users.
