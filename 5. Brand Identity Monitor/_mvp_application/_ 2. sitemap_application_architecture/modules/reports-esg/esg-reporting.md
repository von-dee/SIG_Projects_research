# ESG Reporting

## Page Title & Description
ESG Reporting translates sentiment, community risk, grievance, stakeholder, and regulatory signals into evidence suitable for sustainability reviews, investor briefings, GRI-aligned reporting, IFC Performance Standards, and board updates.

## User Roles & Access Control
- ESG Directors, Sustainability teams, Executives, Analysts, Admins, and selected Report Editors can access this page.
- Member-company ESG users see their own data and approved benchmarks.
- Chamber users can create sector-level reports without exposing confidential member detail.

## UI/UX Component Breakdown
- ESG framework selector for GRI 413 Local Communities, IFC PS1, PS4, PS5, and custom internal frameworks.
- Social License to Operate score card with methodology explainer and trend.
- Community trust index table by site, region, topic, and stakeholder group.
- Grievance and issue trend charts with response and resolution metrics.
- Evidence library linking report claims to mentions, transcripts, field reports, and documents.
- Board-ready export panel with review and approval status.

## User Actions & Interactions
- Selecting a framework maps metrics and evidence requirements to report sections.
- Clicking SLO score opens component breakdown and trend drivers.
- Adding evidence attaches selected mentions or documents to ESG claims.
- Generating report creates an editable report draft in Report Builder.
- Approving final ESG report archives version and creates export artifact.

## Data Requirements & State
- Fetch ESG framework mappings, SLO score components, community index, grievance metrics, intervention history, evidence links, and report templates.
- Capture framework selection, evidence attachments, commentary, approval state, and export choices.
- Preserve calculation inputs and methodology version for defensible reporting.

## Navigation & Routing
- Links to `/reports/builder`, `/community/heatmap`, `/mentions/feed`, `/settings/compliance`, and `/reports/library`.
- Missing required evidence shows readiness checklist.
- Restricted evidence routes to `/system/403`.
