# Mention Detail

## Page Title & Description
Mention Detail provides a full audit-ready view of one mention, including original content, translation, sentiment, topic classification, entities, source metadata, AI explanation, and workflow history.

## User Roles & Access Control
- Analysts, Communications, ESG, Community Relations, Legal, and Admins can view permitted mention details.
- Legal and Admin users can view full audit history where granted.
- PII-redacted mentions hide restricted fields from users without sensitive data permission.

## UI/UX Component Breakdown
- Source header with channel icon, source name, timestamp, language, location, and credibility indicator.
- Original text and translated English text side by side.
- Sentiment card with label, score, confidence, explanation, model version, and review status.
- Topic, emotion, intent, stakeholder, and entity chips.
- Audio player or document preview when the mention comes from radio, voice note, podcast, video, or uploaded document.
- Related mentions and narrative cluster panel.
- Workflow timeline for assignments, reviews, overrides, exports, and alerts.

## User Actions & Interactions
- Editing sentiment or topic opens an override modal requiring reason and optional training feedback flag.
- Assigning mention creates an issue task or links to an existing alert.
- Playing audio starts at the exact transcript timestamp.
- Opening related cluster moves to cluster detail while preserving source mention context.
- Exporting mention creates a shareable PDF with permission-aware redactions.

## Data Requirements & State
- Fetch mention record, raw source metadata, extracted entities, sentiment results, model explanations, transcript segments, attachments, related clusters, audit events, and permissions.
- Capture overrides, review decisions, assignments, notes, and export requests.
- Preserve immutable original text and maintain derived fields with version history.

## Navigation & Routing
- Links to `/mentions/feed`, `/search/query-builder`, `/review/queue`, `/alerts/queue`, and `/reports/builder`.
- Missing mention routes to `/system/404`.
- Redacted content displays restricted state and support request link.
