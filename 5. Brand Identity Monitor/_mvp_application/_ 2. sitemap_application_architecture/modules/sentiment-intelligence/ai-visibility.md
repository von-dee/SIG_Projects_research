# AI Visibility

## Page Title & Description
AI Visibility tracks how monitored brands, mining companies, competitors, sector narratives, and issue topics appear in AI search and answer engines.

## User Roles & Access Control
- Communications, Executives, Analysts, ESG, Admins, and Chamber users can access AI visibility where subscription allows.
- Users can only configure prompts for brands, competitors, and issues within their permitted scope.
- Platform Admins can manage provider-level configuration.

## UI/UX Component Breakdown
- Prompt library for stakeholder questions, investor questions, community questions, regulatory questions, and competitor comparisons.
- AI Brand Score and Presence Score cards.
- Provider comparison table for ChatGPT, Claude, Gemini, Perplexity, DeepSeek, and configured engines.
- Citation source panel showing which web or report sources influence AI answers.
- Hallucination and misinformation flag list.
- Trend chart for answer quality, presence, sentiment, and competitor rank.

## User Actions & Interactions
- Adding a prompt schedules periodic checks across selected AI engines.
- Running a prompt now executes monitored query and stores answer snapshot.
- Flagging hallucination creates a response or content-remediation task.
- Comparing competitors updates scorecards and source analysis.
- Exporting AI visibility report creates a communications-ready summary.

## Data Requirements & State
- Fetch prompt definitions, provider availability, answer snapshots, citation sources, brand scores, competitor scores, and hallucination flags.
- Capture prompt text, schedule, provider selection, run results, flags, tasks, and exports.
- Store answer snapshots with timestamp and provider metadata for trend analysis.

## Navigation & Routing
- Links to `/reports/builder`, `/alerts/create`, `/mentions/feed`, and `/settings/billing`.
- Missing entitlement routes to `/settings/billing`.
- Provider failure shows partial-results state.
