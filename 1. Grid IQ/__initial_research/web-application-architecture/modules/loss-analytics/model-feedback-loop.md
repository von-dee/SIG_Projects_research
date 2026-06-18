# Model Feedback Loop

## Page Title & Description
Model governance page where confirmed field outcomes, false positives, drift indicators, and retraining readiness are reviewed.

## User Roles & Access Control
- Data administrators, auditors, and management can view.
- Only data administrators can approve model retraining.
- Operations users can submit feedback through alerts and investigations but cannot change model settings.

## UI/UX Component Breakdown
- Model version cards.
- Precision, recall, false-positive, and confirmation-rate metrics.
- Feedback queue.
- Drift detection chart.
- Feature health table.
- Retraining approval workflow.
- Model release notes panel.

## User Actions & Interactions
- Review field-confirmed outcomes.
- Approve or reject feedback records.
- Trigger retraining request where infrastructure supports it.
- Compare current and candidate model performance.
- Roll back to prior model version if authorised.

## Data Requirements & State
- Fetches model versions, scoring runs, feedback records, investigation outcomes, feature distributions, and approval history.
- Captures approval decisions, retraining notes, and rollback reasons.
- Writes immutable audit entries for all model-governance actions.

## Navigation & Routing
- `/model-feedback` links to `/analytics/anomalies`, `/alerts/:id`, `/queue/:id`, and `/internal-audit-log`.
- Unavailable ML pipeline shows read-only governance state with last model version.

