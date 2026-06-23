# Human Review Queue

## Page Title & Description
Human Review Queue routes low-confidence, culturally nuanced, legally sensitive, or high-impact AI classifications to qualified reviewers so the system stays trustworthy.

## User Roles & Access Control
- Analysts, Reviewers, Model Admins, Legal users, and selected local-language reviewers can access assigned queues.
- Users only receive review items matching their organization, language capability, and permission scope.
- Model Admins can view aggregate reviewer agreement and training feedback.

## UI/UX Component Breakdown
- Queue tabs for low confidence, high urgency, local language, legal sensitivity, PII, and disputed classifications.
- Review card with original text, translation, source context, AI prediction, confidence, and explanation.
- Decision controls for confirm, correct sentiment, correct topic, mark uncertain, escalate, or exclude from analytics.
- Keyboard shortcuts and batch review mode for high-volume workflows.
- Reviewer quality panel showing agreement rate and pending workload.

## User Actions & Interactions
- Confirming classification marks the item reviewed and can feed training data.
- Correcting classification opens required fields for label, reason, and optional comment.
- Escalating sends item to Legal, Admin, or crisis response queue.
- Excluding item removes it from aggregate analytics while preserving audit trail.
- Batch submit applies decisions and advances to next review set.

## Data Requirements & State
- Fetch assigned review tasks, mention context, model prediction, taxonomy options, reviewer capabilities, and escalation paths.
- Capture reviewer decision, corrected labels, reason, escalation target, training eligibility, and time spent.
- Update `review_task`, `sentiment_result`, `topic_result`, `model_feedback`, and `audit_log` records.

## Navigation & Routing
- Links to `/mentions/detail/:id`, `/settings/model-tuning`, `/alerts/queue`, and `/dashboard/analyst-workspace`.
- Empty queue routes to completed state with link back to dashboard.
- Permission mismatch routes to `/system/403`.
