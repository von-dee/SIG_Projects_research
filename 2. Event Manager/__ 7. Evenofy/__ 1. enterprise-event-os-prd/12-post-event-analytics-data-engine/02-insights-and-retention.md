> Module 12: Post-Event Analytics & Data Engine → 12.2 Insights and Retention

## Insights and Retention
### Purpose and access
Turns certified data into decision-ready reports while enforcing retention and deletion. Analysts publish governed insights; event leadership sees aggregates; DPO controls requests and legal holds.
### Data model
| Entity | Fields and relationships |
|---|---|
| `insight_report` | `id UUID`, `title text`, `snapshot_id FK`, `audience enum`, `status enum`, `owner_id FK` |
| `retention_policy` | `id UUID`, `data_class enum`, `duration_days int`, `legal_basis text`, `disposition enum` |
| `deletion_request` | `id UUID`, `person_id FK`, `scope enum`, `status enum`, `hold_reason text?` |
### Rules and integrations
- IF a valid deletion request is not under legal hold, THEN erase or anonymize eligible data and retain a minimal fulfillment record.
- IF an insight has fewer than the configured anonymity threshold, THEN suppress or aggregate it.
- Edge case: an attendee can opt out of future marketing while operational safety records remain for their legally defined period.

Connect privacy request systems, BI distribution, and CRM suppression lists through auditable workflows.
### UX, resilience, acceptance
Report gallery shows data freshness and audience label; privacy console shows scope, hold, and completion evidence. Export is disabled when policy service is unavailable for sensitive reports.

- Small cohorts are suppressed.
- Legal hold blocks disposal with a visible reason.
- Completion updates connected marketing suppression where applicable.
