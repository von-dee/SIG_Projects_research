# Data Exports

## Page Title & Description
Data Exports manages one-time and scheduled exports of mentions, transcripts, community scores, trends, alerts, reports, and GIS-ready GeoJSON.

## User Roles & Access Control
- Admins, Data Admins, Analysts, ESG, and Report Editors can export data based on permissions.
- PII, raw audio, and confidential member data require elevated export permission.
- Exported data is watermarked or logged according to compliance policy.

## UI/UX Component Breakdown
- Export job table with name, type, scope, format, owner, status, created date, expiration, and download state.
- Create export modal for dataset, filters, fields, format, schedule, and retention.
- Format options for CSV, XLSX, JSON, GeoJSON, PDF, PPTX, DOCX, and audio transcript package.
- Field selector with restricted fields marked.
- Export progress and failure diagnostics.

## User Actions & Interactions
- Creating export validates permissions and starts background job.
- Downloading completed export records audit event and may require re-authentication.
- Scheduling export creates recurring job and delivery target.
- Canceling export stops pending job but preserves audit record.
- Expiring export deletes downloadable artifact while preserving metadata.

## Data Requirements & State
- Fetch export jobs, dataset catalog, allowed fields, user permissions, formats, schedules, and retention policy.
- Capture dataset filters, selected fields, format, schedule, delivery target, and download events.
- Store export artifacts in secure object storage with signed URL expiration.

## Navigation & Routing
- Links to `/reports/library`, `/community/heatmap`, `/mentions/feed`, and `/api/docs`.
- Export permission failure routes to `/system/403`.
- Job failure remains on page with retry.
