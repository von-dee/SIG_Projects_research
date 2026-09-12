> Module 12: Post-Event Analytics & Data Engine → 12.1 Data Platform and Metrics

## Data Platform and Metrics
### Purpose and access
Produces governed cross-module metrics without turning operational data into an uncontrolled data copy. Data Engineers manage pipelines; analysts use approved semantic models; Privacy Officers approve sensitive datasets.
### Data model
| Entity | Fields and relationships |
|---|---|
| `data_event` | `id UUID`, `event_id FK`, `type text`, `occurred_at timestamptz`, `subject_key text`, `payload jsonb`, `schema_version text` |
| `metric_definition` | `id UUID`, `name text`, `formula text`, `grain text`, `owner_id FK`, `certification enum` |
| `dataset_access` | `id UUID`, `dataset text`, `principal_id FK`, `purpose text`, `expires_at timestamptz` |
### Rules and integrations
- IF an incoming schema breaks compatibility, THEN quarantine the batch and alert owner; never silently coerce a finance or access field.
- IF a metric definition changes, THEN create a version and retain the prior dashboard result.
- Edge case: cross-event comparison is blocked when methodology or currency normalization differs unless labeled non-comparable.

Use Snowflake/BigQuery/Databricks, dbt, and BI such as Power BI/Tableau. PII is tokenized before analytics ingestion where possible.
### UX, resilience, acceptance
Metric catalog shows owner, formula, freshness, and certification; pipeline screen shows lineage and quarantine queues. Analytical downtime does not affect live operations.

- Breaking schema cannot reach curated metrics.
- Metric change preserves historical version.
- Dataset access automatically expires.
