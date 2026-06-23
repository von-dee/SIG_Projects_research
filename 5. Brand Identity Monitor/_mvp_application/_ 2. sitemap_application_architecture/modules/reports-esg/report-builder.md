# Report Builder

## Page Title & Description
Report Builder creates daily digests, weekly intelligence briefs, monthly board reports, incident reports, ESG summaries, and Chamber sector pulse reports from monitored data.

## User Roles & Access Control
- Analysts, ESG, Communications, Executives, Admins, and Report Editors can build reports.
- Users can only include data they are authorized to view.
- Publishing externally requires approval permission.

## UI/UX Component Breakdown
- Template gallery for daily digest, weekly intelligence brief, incident report, monthly board report, ESG report, sector pulse, and custom report.
- Report outline editor with drag-and-drop blocks for KPI cards, charts, maps, mention excerpts, narrative summaries, recommendations, and appendix tables.
- Data filter panel for date range, project, site, community, topic, stakeholder, and source.
- AI summary assistant with citations to underlying evidence.
- Approval workflow panel, scheduled delivery controls, and export options for PDF, PPTX, DOCX, XLSX, and CSV.

## User Actions & Interactions
- Selecting a template creates a draft report with default sections and filters.
- Adding a block opens configuration for chart type, metric, scope, and commentary.
- Generating AI summary inserts editable text linked to evidence references.
- Submitting for approval notifies approvers and locks selected sections if required.
- Exporting creates a background job and stores final artifact.

## Data Requirements & State
- Fetch templates, report drafts, available metrics, chart data, map data, evidence mentions, approval policy, and export job status.
- Capture report structure, filters, narrative text, selected evidence, approval state, schedule, and export format.
- Version report drafts and final exports for auditability.

## Navigation & Routing
- Links to `/reports/library`, `/reports/esg`, `/mentions/feed`, `/community/heatmap`, and `/alerts/queue`.
- Export failure remains in report with retry and logs for Admins.
- Approval denial returns draft to editor with comments.
