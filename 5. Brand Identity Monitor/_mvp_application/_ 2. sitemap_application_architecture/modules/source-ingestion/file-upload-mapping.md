# File Upload And Mapping

## Page Title & Description
File Upload And Mapping allows customers to ingest historical media tracking spreadsheets, community reports, survey exports, call center logs, meeting minutes, and regulator documents.

## User Roles & Access Control
- Admins, Data Admins, Analysts, and permitted Members can upload files.
- Sensitive files require a project-level upload permission.
- Users without PII handling permission cannot upload unredacted personal data.

## UI/UX Component Breakdown
- Drag-and-drop upload zone supporting CSV, XLSX, PDF, DOCX, TXT, audio, and image files.
- File preview with detected columns, pages, OCR status, or audio metadata.
- Mapping interface for date, source, text, language, location, topic, stakeholder, and author fields.
- PII detection preview with redact, keep, or send-to-admin-review choices.
- Import validation summary with row counts, errors, duplicates, and expected processing time.

## User Actions & Interactions
- Uploading a file stores it in quarantine and runs virus scan plus type detection.
- Mapping columns creates an import schema that can be reused.
- Confirming import sends rows or documents to ingestion and NLP processing queues.
- Redacting PII updates extracted text before indexing.
- Canceling import deletes quarantined temp files according to retention policy.

## Data Requirements & State
- Fetch supported file types, saved mappings, project taxonomies, PII policy, and upload limits.
- Capture raw file, mapping schema, source attribution, consent basis, retention policy, and user confirmation.
- Create import job, document records, mention records, extraction logs, and processing status.

## Navigation & Routing
- Success routes to `/sources/import-jobs/:id`.
- Mapping errors remain inline with downloadable error report.
- Large import completion notifies user and links to `/mentions/feed?import=:id`.
- PII policy failure routes to `/settings/compliance`.
