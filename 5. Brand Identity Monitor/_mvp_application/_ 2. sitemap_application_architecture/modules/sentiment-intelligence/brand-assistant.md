# Brand Assistant

## Page Title & Description
Brand Assistant is a conversational intelligence interface where users ask natural-language questions about reputation, community sentiment, ESG evidence, competitors, narratives, and risk drivers.

## User Roles & Access Control
- Executives, Analysts, ESG, Communications, Community Relations, Legal, and Admins can use the assistant if enabled.
- Responses are constrained to the user's data permissions and organization scope.
- Legal-sensitive or PII-restricted content is summarized or withheld based on policy.

## UI/UX Component Breakdown
- Chat interface with prompt input, suggested questions, and conversation history.
- Source-grounded answer cards with citations to mentions, transcripts, reports, and charts.
- Inline visualization blocks for sentiment trends, community maps, topic breakdowns, and benchmarks.
- Follow-up action buttons for save to report, create alert, open mentions, or export answer.
- Scope selector for project, date range, site, competitor, community, and stakeholder group.

## User Actions & Interactions
- Asking a question retrieves scoped data and returns a cited answer.
- Clicking citation opens the underlying mention, transcript, report, or community detail.
- Saving to report adds the answer and evidence to a report draft.
- Creating an alert converts the query intent into an alert-rule draft.
- Clearing conversation removes local chat state but preserves auditable generated outputs where policy requires.

## Data Requirements & State
- Fetch user permissions, active scope, relevant mentions, aggregates, reports, community scores, and source citations.
- Capture prompt, selected scope, generated response, cited evidence, user feedback, and action taken.
- Apply retrieval filters before generation so the assistant cannot access unauthorized content.

## Navigation & Routing
- Links to `/mentions/detail/:id`, `/community/:id`, `/reports/builder`, `/alerts/create`, and `/search/query-builder`.
- Unsupported question returns clarification prompt.
- Restricted citation routes to `/system/403`.
