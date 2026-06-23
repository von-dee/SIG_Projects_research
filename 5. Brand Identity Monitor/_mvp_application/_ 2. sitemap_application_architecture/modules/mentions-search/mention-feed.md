# Mention Feed

## Page Title & Description
Mention Feed is the real-time stream of monitored content across social, news, radio transcripts, documents, surveys, uploaded reports, SMS, WhatsApp exports, and field observations.

## User Roles & Access Control
- Analysts, Communications, ESG, Community Relations, Legal, Executives, and Admins can view mentions within role scope.
- Raw data export and PII display depend on explicit permissions.
- Chamber users can view sector mentions and member data according to sharing rules.

## UI/UX Component Breakdown
- Realtime feed list with sentiment color, urgency badge, source icon, topic chips, language, location, timestamp, and confidence.
- Filter bar for source, sentiment, topic, stakeholder, location, language, urgency, confidence, date, and entity.
- Sort options for newest, urgency, reach, relevance, sentiment impact, and source credibility.
- Cluster toggle to group syndicated stories and repeated narratives.
- Detail drawer preview and bulk action toolbar.
- Empty, loading, stale data, and source outage states.

## User Actions & Interactions
- Applying filters updates URL query parameters and feed results.
- Clicking a mention opens the detail drawer or full detail route.
- Bulk selecting mentions enables assign, tag, export, review, create alert, and add to report actions.
- Switching to clustered view groups duplicates and shows representative evidence.
- Saving current filters creates a saved query.

## Data Requirements & State
- Fetch paginated mentions, source metadata, sentiment results, tags, entities, clusters, user permissions, and source health.
- Maintain filter state, sort order, selected mentions, live update cursor, and detail drawer state.
- Deduplicate syndicated content without deleting underlying mention records.

## Navigation & Routing
- Links to `/mentions/detail/:id`, `/search/query-builder`, `/alerts/create`, `/review/queue`, and `/reports/builder`.
- No results offers reset filters or connect sources.
- Permission violation routes to `/system/403`.
