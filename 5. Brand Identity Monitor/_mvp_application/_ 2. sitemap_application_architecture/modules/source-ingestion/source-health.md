# Source Health

## Page Title & Description
Source Health gives operations teams a reliability view of every data source, connector, ingestion job, and processing queue so monitoring gaps are visible before they affect intelligence.

## User Roles & Access Control
- Admins, Data Admins, Analysts, and Platform Admins can access this page.
- Executives can see a high-level data freshness summary only.
- Source secrets and raw error payloads are restricted to Admins and Platform Admins.

## UI/UX Component Breakdown
- Health table with source name, type, status, last successful sync, next sync, error count, and freshness SLA.
- Queue metrics for ingestion, transcription, NLP, embedding, alerting, and report generation.
- Incident banner for degraded platform-wide source processing.
- Connector detail drawer with logs, retry controls, and sample payloads.
- Data coverage chart by source type, language, region, and topic.

## User Actions & Interactions
- Retrying a failed source queues an immediate sync and updates health state.
- Pausing a noisy source suppresses ingestion and alerts until resumed.
- Opening logs reveals permission-scoped diagnostic details.
- Exporting health report creates a system operations PDF or CSV.
- Acknowledging an outage attaches a note to the source incident.

## Data Requirements & State
- Fetch connector status, job logs, queue depth, processing latency, source freshness, error summaries, and coverage metrics.
- Capture retry actions, pause/resume actions, outage notes, and health export requests.
- Maintain realtime updates for high-priority source failures.

## Navigation & Routing
- Links to `/sources/connect`, `/sources/import-jobs/:id`, `/settings/integrations`, and `/system/status`.
- Unauthorized log access routes to `/system/403`.
- Persistent source failure opens support escalation workflow.
