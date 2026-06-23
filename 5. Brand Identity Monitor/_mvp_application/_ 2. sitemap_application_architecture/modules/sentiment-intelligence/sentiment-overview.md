# Sentiment Overview

## Page Title & Description
Sentiment Overview summarizes how monitored brands, sites, communities, topics, and stakeholder groups are being perceived across digital, broadcast, document, and community channels.

## User Roles & Access Control
- Executives, ESG users, Community Relations, Communications, Analysts, and Admins can view this page.
- Member users can only view their organization or permitted benchmark scope.
- Model configuration controls are hidden unless the user is an Admin or Model Admin.

## UI/UX Component Breakdown
- Sentiment distribution cards for positive, neutral, mixed, uncertain, negative, and strongly negative classes.
- Time-series chart with topic, source, stakeholder, language, and region filters.
- Sentiment drivers panel showing topics causing positive or negative movement.
- Confidence distribution chart and low-confidence review prompt.
- Event annotations for incidents, CSR launches, regulator statements, community meetings, and media reports.
- Comparative view for company, competitor, industry baseline, or Chamber sector pulse.

## User Actions & Interactions
- Changing filters recalculates all charts and driver panels.
- Clicking a sentiment segment opens the filtered mention feed.
- Selecting an event annotation shows before-and-after sentiment movement.
- Sending uncertain items to review creates review tasks.
- Exporting chart creates PNG, PDF, or report block.

## Data Requirements & State
- Fetch sentiment aggregates, timeseries, topic drivers, source breakdown, confidence scores, event annotations, and benchmark permissions.
- Maintain filter state for project, mine, community, date range, source, language, stakeholder, topic, and competitor.
- Use model version and confidence metadata for all sentiment panels.

## Navigation & Routing
- Links to `/mentions/feed`, `/review/queue`, `/reports/builder`, `/community/heatmap`, and `/settings/model-tuning`.
- No processed mentions routes to `/sources/connect`.
- Restricted benchmark access routes to `/system/403`.
