# Model Tuning

## Page Title & Description
Model Tuning lets authorized teams manage domain taxonomies, review datasets, confidence thresholds, local-language examples, and customer-specific sentiment calibration.

## User Roles & Access Control
- Model Admins, Platform Admins, and selected Data Admins can access this page.
- Analysts can view model performance summaries if granted.
- Standard Members cannot view or change model settings.

## UI/UX Component Breakdown
- Model performance dashboard by language, source, topic, stakeholder, and model version.
- Taxonomy editor for topics, intents, emotions, stakeholder groups, and urgency weights.
- Confidence threshold controls for automatic classification versus human review.
- Training dataset manager with reviewed examples, exclusions, and export controls.
- Drift monitoring charts and model version release notes.
- Simulation panel to test sample text against current and candidate model settings.

## User Actions & Interactions
- Updating a taxonomy creates a draft and requires publish confirmation.
- Adjusting confidence thresholds previews expected review volume changes.
- Promoting reviewed examples to training set creates a model feedback batch.
- Running simulation returns sentiment, topic, explanation, and risk outputs.
- Publishing model settings creates an auditable versioned configuration.

## Data Requirements & State
- Fetch model metrics, confusion matrices, review agreement, taxonomy records, thresholds, example datasets, and version history.
- Capture taxonomy edits, threshold changes, training flags, simulation inputs, and publish notes.
- Maintain draft versus published state and rollback metadata.

## Navigation & Routing
- Links to `/review/queue`, `/settings/audit-logs`, and `/sentiment/overview`.
- Publish failure remains on draft with validation errors.
- Unauthorized access routes to `/system/403`.
