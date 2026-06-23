# Regulatory Tracker

## Page Title & Description
Regulatory Tracker monitors permits, EIA filings, Minerals Commission notices, EPA communications, parliamentary Hansard mentions, court records, and compliance-related narratives.

## User Roles & Access Control
- Legal, ESG, Executives, Analysts, Admins, and Government or Chamber users can access relevant regulatory data.
- Company-specific legal records are restricted to authorized users.
- Public regulator sources can be visible more broadly, but annotations and legal notes remain permission-controlled.

## UI/UX Component Breakdown
- Regulatory timeline with filings, deadlines, notices, hearings, parliamentary debates, court updates, and compliance events.
- Document table with source, authority, type, status, affected site, deadline, and linked mentions.
- Deadline calendar and reminder controls.
- NLP summary panel for uploaded or scraped regulatory documents.
- Risk association panel connecting regulatory events to sentiment, media coverage, and community risk.
- Legal notes and privileged flag controls.

## User Actions & Interactions
- Uploading or linking a regulatory document sends it through extraction and NLP summarization.
- Adding a deadline creates reminders and dashboard events.
- Marking item privileged restricts visibility and logs audit event.
- Linking a regulatory event to a community or issue updates trend annotations.
- Exporting regulatory brief sends selected items to Report Builder.

## Data Requirements & State
- Fetch regulatory documents, source metadata, deadlines, NLP summaries, linked mentions, legal notes, privilege flags, and sentiment correlations.
- Capture document uploads, deadline edits, privilege changes, event links, reminders, and brief exports.
- Preserve original document, extracted text, summary, and versioned annotations.

## Navigation & Routing
- Links to `/reports/esg`, `/reports/builder`, `/mentions/feed`, `/community/heatmap`, and `/settings/security-compliance`.
- Missing document routes to `/system/404`.
- Privileged document access routes to `/system/403`.
