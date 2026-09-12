> Module 10: Marketing, PR & Media Center → 10.2 Content Approval and Monitoring

## Content Approval and Monitoring
### Purpose and access
Controls public messaging and helps PR detect emerging issues. Authors draft; PR approvers publish; Crisis Comms may issue emergency statements; analysts view aggregated monitoring.
### Data model
| Entity | Fields and relationships |
|---|---|
| `content_item` | `id UUID`, `channel enum`, `body text`, `version int`, `status enum`, `author_id FK` |
| `approval_step` | `id UUID`, `content_id FK`, `role text`, `status enum`, `actor_id FK?`, `at timestamptz?` |
| `media_signal` | `id UUID`, `source text`, `sentiment numeric?`, `topic text[]`, `url text`, `observed_at timestamptz` |
### Rules and integrations
- IF content is materially edited after approval, THEN invalidate approvals and re-route.
- IF monitoring signal crosses configured severity, THEN create a PR triage item, not an automatic public response.
- Edge case: deleted social content remains only as permitted metadata/evidence, honoring source and retention policy.

Integrate Brandwatch/Meltwater, social channel APIs, and CMS publishing APIs.
### UX, resilience, acceptance
The newsroom is a draft-to-publish board with side-by-side versions; monitor is a trend and alert view. Manual posting guidance appears if an API is down.

- Post-approval edit requires reapproval.
- High-severity signal creates a triage task.
- Publishing outage preserves an approved, timestamped release package.
