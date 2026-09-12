> Module 12: Post-Event Analytics & Data Engine -> 12.1 Data Warehouse & Pipeline

## Data Warehouse & Pipeline

### A. Purpose Statement

The Data Warehouse & Pipeline is the analytical foundation of the Future Minerals Forum operating system. It is the single, authoritative repository into which every operational signal from Modules 01 through 11 lands, is cleaned, is deduplicated, is denormalized, and is exposed for every downstream analytical use case in this module (attendee journey, sponsorship ROI, executive insights) and every adjacent cross-module analytical surface (the Module 1.1 War Room tiles, the Module 11.4 ESG Reporting Portal snapshots, the Module 10.4 social listening correlation). At FMF scale, the warehouse ingests on the order of 80 million fact rows per event day: 10,000+ attendees each producing 30+ touchpoint events (badge scans, session check-ins, app screen views, push taps, meeting participations, F&B voucher redemptions, booth visits, survey responses), 60+ ministerial speaker sessions each with thousands of live-stream viewer seconds, and 100+ sovereign delegations each producing protocol, motorcade, and security telemetry.

The subsystem owns the `analytics.warehouse.*` Kafka topic prefix within the broader `analytics.*` bounded context established in Module 0.1. It publishes `analytics.warehouse.raw.landed`, `analytics.warehouse.staging.deduplicated`, `analytics.warehouse.mart.materialized`, `analytics.warehouse.dq.test_failed`, `analytics.warehouse.dq.test_passed`, `analytics.warehouse.lineage.snapshot_published`, and `analytics.warehouse.refresh.completed`. It subscribes to every domain topic in the platform: `registration.*` (Module 6.1), `vip.*` (Module 2), `agenda.*` and `session.*` (Module 4), `match.*` and `meeting.*` (Module 3), `sponsor.*` and `lead.*` and `booth.*` (Module 5), `transport.*` and `fnb.*` and `supplier.*` and `venue.*` (Module 8), `po.*` and `invoice.*` and `budget.*` (Module 9), `press.*` and `campaign.*` and `social.*` (Module 10), and `esg.*` (Module 11). Its non-negotiable contract is that every analytical figure surfaced in any downstream dashboard or executive export is traceable through OpenLineage back to a Kafka topic, a partition offset, and an upstream source row in PostgreSQL, with every transformation between landing and mart captured as a versioned dbt model.

The warehouse uses ClickHouse as the analytical store, per Module 0.1 architecture decision. PostgreSQL 16 remains the OLTP source of truth for transactional records; ClickHouse is the read-optimized analytical projection. Kafka Connect (Debezium connector) performs change data capture (CDC) from PostgreSQL to Kafka in near real time, and a ClickHouse Kafka Engine table consumes those topics into the `raw` layer. dbt (data build tool) compiles SQL transformations between `raw`, `staging`, and `marts` layers, with Airflow as the orchestrator for nightly batch jobs and a streaming engine (Apache Flink or Kafka Streams) for sub-10-second live dashboards.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all marts, all snapshots, all data quality dashboards. Cannot modify warehouse configuration. Sees the live "warehouse health" indicator in the War Room (green/amber/red based on data freshness and DQ test pass rate).
- **Operations Lead (OL):** Read on the `ops_efficiency` mart domain (incident counts, throughput, queue times, venue utilization) and on the data quality dashboard filtered to ops-related tables. No access to commercial or attendee-journey marts beyond aggregates.
- **Protocol Officer (PO):** Read on `attendee_journey` mart restricted to delegation-level aggregates; no individual attendee journey access to preserve diplomatic discretion.
- **VIP Liaison (VL):** No direct warehouse access. Receives curated PDF extracts of their assigned dignitary's journey via the Module 12.2 attendee journey subsystem.
- **Registration Manager (RM):** Read on `attendee_journey` mart for registration funnel diagnostics. Can request ad-hoc queries via a SQL runner scoped to read-only on staging tables.
- **Sponsorship Sales Lead (SSL):** Read on `commercial` mart (sponsor revenue, lead pipeline, meeting conversions, deal pipeline) filtered to sponsors under their ownership. No access to other sponsors' data.
- **Exhibitor Portal User (EPU):** No direct warehouse access. Sees their sponsor-facing ROI dashboard (Module 12.3) rendered from marts with their sponsor_id as a row-level filter.
- **Content & Stage Manager (CSM):** Read on `content_engagement` mart (session attendance, session ratings, live-stream viewership, content repository downloads).
- **Matchmaking Concierge (MC):** Read on `attendee_journey` mart for meeting participation patterns; no PII access beyond the meeting ID and aggregate match scores.
- **Finance & Administration Lead (FAL):** Read on `commercial` mart (revenue, invoicing, PO spend) and `ops_efficiency` mart for cost-per-attendee and cost-per-session metrics.
- **Marketing & PR Lead (MPL):** Read on the `content_engagement` and a `brand_performance` projection (media reach, social sentiment). No access to commercial PII.
- **ESG & Sustainability Officer (ESGO):** Read on `esg_impact` mart (carbon, waste, diversity) which mirrors the Module 11 fact tables for cross-correlation with attendance and commercial activity.
- **Field Volunteer (FV):** No warehouse access. Their scan events feed the warehouse but they do not consume it.
- **Attendee (ATT):** No direct warehouse access. Their personal journey is exposed via Module 12.2 with their `attendee_id` as a row filter.
- **Analytics Engineer (service role):** The primary writer. Owns dbt model definitions, schema migrations, DQ test configuration, and refresh schedule tuning. This is a platform role, not an event-role persona; at FMF scale this role is held by 2-3 engineers in the central platform team.

### C. Data Model

The warehouse is organized in three layers (raw, staging, marts). The `analytics_warehouse_log` table below is the operational ledger of every refresh cycle; the mart catalog tables describe the denormalized analytical surfaces.

`analytics_warehouse_refresh_log` (one row per pipeline execution):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC, refresh start |
| `updated_at` | `timestamptz` | UTC, last mutation |
| `created_by` | `uuid` | Service account (airflow-worker) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{airflow_run_id, dbt_run_id, clickhouse_query_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `pipeline_type` | `enum[streaming_realtime, nightly_batch, ad_hoc_backfill]` | |
| `layer` | `enum[raw, staging, marts]` | Which layer this refresh touched |
| `domain` | `enum[attendee_journey, commercial, content_engagement, ops_efficiency, esg_impact]` | Star schema domain |
| `started_at` | `timestamptz` | Wall clock start |
| `completed_at` | `timestamptz null` | null = in flight |
| `rows_inserted` | `bigint` | Rows added to target mart |
| `rows_updated` | `bigint` | Rows mutated |
| `late_event_count` | `int` | Events that arrived after watermark window |
| `dq_tests_run` | `int` | Count of Great Expectations suites executed |
| `dq_tests_failed` | `int` | |
| `status` | `enum[running, succeeded, failed, degraded, rolled_back]` | |
| `fallback_mart_version` | `text null` | If degraded, the prior mart version served to consumers |
| `gap_period_start` | `timestamptz null` | If degraded, the time range not covered by current mart |
| `gap_period_end` | `timestamptz null` | |

`analytics_warehouse_mart_catalog` (the registry of every denormalized mart):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Analytics engineer |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{dbt_model_id, openlineage_run_id, clickhouse_table_name}` |
| `audit_log` | `jsonb[]` | Append-only |
| `mart_name` | `text` | e.g., `fct_attendee_journey_daily`, `dim_sponsor`, `fct_lead_capture_event` |
| `domain` | `enum[attendee_journey, commercial, content_engagement, ops_efficiency, esg_impact]` | |
| `layer` | `enum[staging, marts]` | |
| `grain` | `text` | e.g., "one row per attendee per day", "one row per session per minute" |
| `star_schema_role` | `enum[fact, dimension, bridge]` | |
| `source_topics` | `text[]` | Kafka topics the mart derives from |
| `source_dbt_models` | `text[]` | Upstream dbt model names |
| `refresh_cadence` | `enum[realtime_streaming, hourly, nightly, weekly, on_demand]` | |
| `last_refreshed_at` | `timestamptz` | |
| `row_count` | `bigint` | Materialized row count |
| `is_active` | `boolean` | false = superseded by a newer version |
| `schema_version` | `text` | dbt model version, e.g., "1.4.2" |

`analytics_warehouse_dq_test_result` (Great Expectations execution log):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Service account |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{ge_suite_id, ge_expectation_id, dbt_test_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `test_name` | `text` | e.g., `expect_column_values_to_not_be_null`, `expect_column_pair_values_a_to_be_greater_than_b` |
| `target_table` | `text` | ClickHouse table |
| `target_column` | `text null` | |
| `suite_name` | `text` | Grouping, e.g., `attendee_journey_v3_suite` |
| `expectation_config` | `jsonb` | GE expectation config |
| `result` | `enum[passed, failed, warning]` | |
| `observed_value` | `text null` | |
| `unexpected_count` | `int null` | |
| `unexpected_percent` | `numeric(6,3) null` | |
| `failure_severity` | `enum[info, warning, error, critical]` | |
| `run_at` | `timestamptz` | |
| `run_id` | `text` | Airflow / GE shared run id |

`analytics_warehouse_lineage_edge` (OpenLineage materialized graph):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Service account |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{openlineage_run_id, openlineage_job_id, dataset_namespace}` |
| `audit_log` | `jsonb[]` | Append-only |
| `source_dataset` | `text` | e.g., `kafka://registration.confirmed` or `clickhouse://raw.registration_confirmed` |
| `target_dataset` | `text` | e.g., `clickhouse://staging.stg_registration` |
| `transformation` | `text` | dbt model name or Flink job name |
| `transformation_type` | `enum[dbt_model, flink_stream, clickhouse_mv, manual_sql]` | |
| `edge_kind` | `enum[reads_from, writes_to, derives_from, deprecated_by]` | |
| `captured_at` | `timestamptz` | OpenLineage event timestamp |

### D. Business Logic & Edge Cases

- **IF** a Kafka event arrives on a raw topic and the `event_time` field is older than the current `event_time` watermark for that topic by less than 5 minutes, **THEN** the ClickHouse Kafka Engine consumer accepts the event, the staging layer reorders it into the correct event-time sequence, and the downstream mart is recomputed with the in-order sequence. The reordering is idempotent: re-running the same staging pass produces the same mart state.
- **IF** an event arrives with `event_time` older than the watermark by more than 5 minutes (a "late-arriving event"), **THEN** the event is still written to the raw layer (it is the source of truth) but it is also written to an `analytics.warehouse.late_event_quarantine` ClickHouse table, an `analytics.warehouse.dq.test_failed` Kafka event is published with `failure_severity = warning`, the staging layer marks the affected mart rows as `is_stale = true` for the affected event-time window, and a Data Quality dashboard tile surfaces the late-arriving event for analyst review.
- **IF** a dbt model fails to compile (e.g., an upstream PostgreSQL schema change introduced a renamed column that broke a dbt `ref()`), **THEN** the Airflow task for that dbt model is marked `failed`, the orchestrator does not propagate the failure to downstream marts that depend on the broken model, the consumer-facing API for the affected mart is reverted to the last successful materialization, the `analytics_warehouse_refresh_log` row for the failed run records `status = degraded`, `fallback_mart_version` is set to the prior version identifier, `gap_period_start` is set to the timestamp of the last successful run, and a PagerDuty alert is dispatched to the analytics engineer on call.
- **IF** a Great Expectations test fails with `failure_severity = error` on a mart, **THEN** the mart is not promoted to the consumer-facing view; the prior version remains queryable; the failed test result is published to the Data Quality dashboard with a deep-link to the dbt model and the GE expectation config; and a Slack message is posted to `#data-quality` with the test name, the observed value, the unexpected count, and a one-click "Create Jira ticket" action.
- **IF** a streaming pipeline backpressure causes ClickHouse Kafka Engine ingestion to lag by more than 30 seconds behind the Kafka topic high-water mark, **THEN** the live dashboard consumer (Module 12.4 Executive Insights Dashboard) shows a "live data lagging" banner with the lag in seconds, and the dashboard tiles that depend on the lagging topic fall back to a "last known good" value with a stale timestamp label.
- **IF** an `ext_refs` payload on a Kafka event references an entity that has been soft-deleted in PostgreSQL (e.g., a `registration.confirmed` event references a registration later marked `deleted_at`), **THEN** the warehouse raw layer still ingests the event, but the staging layer tags the derived fact rows with `is_soft_deleted_source = true`, and they are excluded from the default mart materialization. An admin-only "include soft-deleted" view is available for forensic analysis.
- **IF** an OpenLineage run event arrives out of order (the job completed event arrives before the job started event due to network jitter), **THEN** the lineage graph builder detects the inversion via the `run_id` and the `event_time` of each OpenLineage event, reorders them in the materialized `analytics_warehouse_lineage_edge` table, and updates the dataset version graph without producing a false "orphan dataset" alert.
- **IF** a ClickHouse node in the 3-node cluster fails, **THEN** the warehouse continues to serve reads from the surviving nodes via the Distributed table engine, writes are buffered in Kafka (retention is 7 days per Module 0.1) until the failed node rejoins or is replaced, the `analytics.warehouse.health` metric published to the Module 1.1 War Room drops from green to amber, and the analytics engineer on call is paged to either re-image the node or expand the cluster.

**Edge case (non-obvious): out-of-order session scan event from a network-partitioned scanner.** A Field Volunteer's handheld scanner loses Wi-Fi connectivity in Hall 3 for 35 seconds during the Day 2 plenary. During the partition, the scanner queues 142 scan events locally on the device. When Wi-Fi returns, the device flushes the 142 events to the mobile app backend, which publishes them to the `session.scan` Kafka topic in a burst. Because each scan event carries its own `event_time` (the moment of the actual scan, captured from the device clock at scan time), the warehouse's Flink streaming job receives events whose `event_time` is 35 seconds older than the events that arrived during the partition. The watermark for the `session.scan` topic has already advanced past these events by more than 5 minutes (the partition was 35 seconds plus the time between scan and flush). The warehouse writes the 142 events to the raw layer (source of truth), moves them to the `analytics.warehouse.late_event_quarantine` table, publishes an `analytics.warehouse.dq.test_failed` event with `failure_severity = warning`, and recomputes the affected `fct_session_attendance_minute` mart rows for the 35-second window with `is_stale = true` for one refresh cycle, then clears the flag once the next full nightly batch reconciles the in-order sequence. The DQ dashboard surfaces a "142 late-arriving scans from Hall 3, 2025-01-22 10:14:12 to 10:14:47" tile for the analytics engineer to acknowledge.

**Edge case (non-obvious): dbt model breaks due to an upstream schema change deployed mid-event.** At 11:30 on Day 2, the platform team releases a hotfix to the Registration service that renames the `registration.dietary_preference` column to `registration.dietary_requirements` to support multi-value dietary needs. The hotfix passes its regression suite but the analytics engineer was not notified. The next hourly dbt run at 12:00 fails to compile the `stg_registration` model because it references the old column name. The orchestrator detects the compile failure, marks the run `degraded`, and reverts the `stg_registration` mart to the 11:00 version. All downstream marts that depend on `stg_registration` (the `fct_attendee_journey_daily` mart, the `fct_fnb_consumption` mart, the executive dashboard's F&B tile) continue to serve the 11:00 materialization. The analytics engineer receives the PagerDuty alert, hot-fixes the dbt model by adding a `COALESCE(dietary_requirements, dietary_preference)` compatibility shim, and the next hourly run at 13:00 succeeds. The `analytics_warehouse_refresh_log` records the 12:00 row as `status = degraded`, `gap_period_start = '2025-01-22 11:00:00'`, `gap_period_end = '2025-01-22 13:00:00'`. The Executive Insights Dashboard (Module 12.4) shows a small "data gap 11:00 to 13:00 for F&B metrics" annotation beneath the affected tiles, preserving audit transparency.

### E. Third-Party Integrations

- **ClickHouse (Cloud or self-hosted on AWS EKS):** The analytical store. Data flow: Kafka topic -> ClickHouse Kafka Engine table -> Materialized View -> `raw.*` tables (MergeTree engine, deduplicated by `(tenant_id, event_id, source_topic, kafka_offset)`). 3-node cluster, r6g.4xlarge each, per Module 0.1.
- **Kafka Connect with Debezium PostgreSQL Connector:** CDC from the transactional PostgreSQL 16 cluster into Kafka. Data flow: PostgreSQL WAL -> Debezium connector (per-table connector instance) -> Kafka topic `pg.cdc.<schema>.<table>` -> consumed by the ClickHouse Kafka Engine. Captures inserts, updates, and deletes with before/after payloads. Lag target: under 5 seconds for 95th percentile of changes.
- **dbt (data build tool, dbt-core 1.7+):** Transformation layer between raw, staging, and marts. Data flow: dbt model definitions in Git -> `dbt run` invoked by Airflow -> SQL compiled and executed against ClickHouse -> staging and mart tables materialized. `dbt test` invokes Great Expectations suites as dbt tests via the `dbt-great-expectations` adapter for cross-tool test integration.
- **Apache Airflow 2.9+ (or Prefect 2.x as alternative):** Orchestration of nightly batch jobs, hourly dbt runs, and on-demand backfills. DAGs include `warehouse_nightly_full_refresh`, `warehouse_hourly_marts`, `warehouse_streaming_health_check`, and `warehouse_dq_suite`. Airflow connections: ClickHouse (via `clickhouse-connect` hook), dbt Cloud or local dbt-core via `BashOperator`, Slack via `SlackWebhookHook` for failure notifications.
- **Great Expectations 0.18+:** Data quality test framework. Data flow: dbt test invocation -> Great Expectations suite execution -> test results written to `analytics_warehouse_dq_test_result` table and to the Data Quality dashboard. Suites include `attendee_journey_v3_suite`, `commercial_revenue_suite`, `content_engagement_suite`, `ops_efficiency_suite`, `esg_impact_suite`. Critical tests block mart promotion; warning tests surface but do not block.
- **OpenLineage (with Marquez or DataHub backend):** Data lineage capture. Data flow: dbt and Airflow emit OpenLineage events (via `openlineage-dbt` and `openlineage-airflow` integrators) -> OpenLineage backend (Marquez for FMF) -> materialized into the warehouse's `analytics_warehouse_lineage_edge` table for SQL queries. The lineage graph is queried by the Data Quality dashboard to answer "which marts depend on the `registration.confirmed` topic" for impact analysis before any schema change.
- **Looker (Looker Cloud) or Tableau Cloud:** BI consumption layer. Data flow: ClickHouse -> Looker via the `clickhouse-looker-connector` -> LookML model -> Looker explores -> dashboards. Embedded in the sponsor portal (Module 12.3) and the executive dashboard (Module 12.4) via Looker embedded iframes with row-level security on `sponsor_id` and `tenant_id`.
- **Snowflake or BigQuery (optional, for external data warehouse federation):** Some FMF stakeholders (e.g., the Ministry of Industry) maintain their own Snowflake account for cross-event benchmarking. The warehouse publishes curated marts to Snowflake via the ClickHouse `S3` table function and Snowpipe ingestion. Data flow: ClickHouse -> S3 (Parquet) -> Snowpipe -> Snowflake table. One-way, no inbound federation.
- **Amazon S3 (with KMS-CMK per Module 0.1):** Long-term raw event archive. Data flow: Kafka topic -> S3 sink connector (Parquet format, partitioned by `tenant_id/event_id/topic/date`) -> 7-year retention per regulatory requirement. Restorable into ClickHouse via `S3` table function for backfills.

### F. UI/UX Notes

The Analytics Engineer's primary screen is a four-quadrant console. Top-left: a "Refresh Pipeline Health" panel showing the last 12 hourly refresh cycles as a green/amber/red dot grid, with the currently-running cycle highlighted. Top-right: a "Data Quality" panel listing every failed Great Expectations test in the last 24 hours, sorted by `failure_severity` (critical first), with a deep-link to the failing dbt model and a "View unexpected rows" drill-down that runs a parameterized SQL query against the staging table. Bottom-left: a "Lineage Graph" interactive node view (rendered via the Marquez UI embedded in an iframe) showing the upstream sources of any selected mart, with edge labels showing the transformation type and the last successful run timestamp. Bottom-right: a "Late-Arriving Events Quarantine" panel listing every event in the `analytics.warehouse.late_event_quarantine` table, with a one-click "Acknowledge and reprocess" action that triggers an ad-hoc backfill of the affected window.

The ED's War Room tile shows three indicators: a "Warehouse Health" traffic light (green = all streams live and within SLA, amber = any stream lagging or DQ warning active, red = any mart degraded to fallback), a "Data Freshness" timestamp showing the most recent successful mart refresh, and a "Late Events Today" count. Clicking the tile opens a read-only Analytics Engineer console with edit controls hidden.

The ATT Mobile App surface has no direct warehouse access. The attendee's personal journey (Module 12.2) is rendered from the `fct_attendee_journey_daily` mart via a row-level filter on `attendee_id`, with the underlying warehouse infrastructure invisible to the attendee.

The FAL finance surface exposes a "Cost per Attendee" and "Cost per Session" widget rendered from the `commercial` and `ops_efficiency` marts. The FAL sees only aggregate financial metrics, not individual attendee journey data.

### G. Failure Modes & Offline Behavior

- **ClickHouse cluster partial failure (1 of 3 nodes down):** Reads continue via the Distributed table engine against the surviving replicas. Writes are buffered in Kafka for the duration. The `analytics.warehouse.health` metric drops to amber. The analytics engineer is paged; if the node is not restored within 4 hours, the platform team provisions a replacement node from the latest S3 snapshot and replays the Kafka backlog.
- **ClickHouse cluster total failure (all 3 nodes down):** Reads fail across all analytics surfaces. The Module 1.1 War Room tiles that depend on warehouse data fall back to direct PostgreSQL queries (degraded performance, no aggregations across multiple modules). The Module 12.4 Executive Insights Dashboard shows a "warehouse offline, showing transactional snapshots" banner. Kafka retains all events for 7 days; on warehouse recovery, the Kafka Engine tables replay from the last consumed offset.
- **Airflow scheduler outage:** Streaming pipelines (Flink jobs) continue to run independently. Nightly batch marts do not refresh, but the prior version remains queryable. The `analytics_warehouse_refresh_log` records no new rows for the outage period. Recovery: Airflow restarts, the scheduler detects missed DAG runs, and the analytics engineer chooses whether to backfill the missed cycles or skip to the next scheduled run.
- **dbt Cloud or local dbt-core outage:** Same degradation pattern as an Airflow scheduler outage for batch marts. Streaming marts continue to update. The DQ dashboard shows a "dbt unavailable" banner.
- **Great Expectations backend unavailable:** dbt tests cannot run; the `warehouse_dq_suite` Airflow task is marked `skipped`; marts are promoted without DQ validation but with an `is_dq_validated = false` flag. On GE recovery, a backfill run re-validates the affected marts and updates the flag.
- **OpenLineage backend unavailable:** Lineage capture is paused; lineage edges from the outage period are missing from the `analytics_warehouse_lineage_edge` table. The Marquez UI shows a "lineage gap" annotation. Recovery: dbt and Airflow integrators retain their OpenLineage event queues; on backend recovery, the queues drain and backfill the missing edges.
- **Kafka Connect CDC lag exceeds 60 seconds:** The Debezium connector health check fails; the `analytics.warehouse.health` metric drops to amber; the live dashboards show a "transactional data lagging" banner with the lag in seconds. The analytics engineer investigates whether the PostgreSQL WAL is the bottleneck or the connector itself, and scales the connector tasks horizontally if needed.
- **Cross-region replication (Kafka MirrorMaker 2) lag exceeds 30 seconds:** Both regions continue to ingest events independently; the warehouse in each region serves local consumers. Cross-region analytical queries (e.g., a global benchmark across all FMF events) are deferred until replication lag returns to under 5 seconds, to avoid double counting.
- **ClickHouse disk full (95% capacity):** A Sentinel alert fires at 85% triggering an emergency compaction. If the disk reaches 95%, the warehouse stops accepting new writes, the consumer-facing API returns a "warehouse read-only" banner, and the analytics engineer runs an emergency TTL drop on the oldest raw partitions (older than the 7-year regulatory retention floor) only if no regulatory retention obligation applies.

### H. Acceptance Criteria

- **Given** a Field Volunteer's scanner loses Wi-Fi for 35 seconds and flushes 142 queued scan events on reconnection, **When** the events arrive on the `session.scan` topic more than 5 minutes after their `event_time`, **Then** the warehouse writes all 142 events to the raw layer, moves them to the `analytics.warehouse.late_event_quarantine` table, publishes an `analytics.warehouse.dq.test_failed` event with `failure_severity = warning`, and the staging layer marks the affected mart rows `is_stale = true` for one refresh cycle before the next nightly batch reconciles them in-order.
- **Given** a hotfix to the Registration service renames the `dietary_preference` column mid-event, **When** the next hourly dbt run attempts to compile `stg_registration`, **Then** the orchestrator detects the compile failure, reverts the consumer-facing mart to the prior hourly materialization, records `status = degraded` with `fallback_mart_version` and `gap_period_start = last_successful_run_timestamp`, pages the analytics engineer on call, and the Module 12.4 dashboard shows a "data gap" annotation beneath the affected tiles for the duration of the degradation.
- **Given** a Great Expectations test `expect_column_values_to_not_be_null` on `fct_attendee_journey_daily.attendee_id` fails with `unexpected_count = 47`, **When** the test result is written to the `analytics_warehouse_dq_test_result` table with `failure_severity = error`, **Then** the mart is not promoted to the consumer-facing view, the prior version remains queryable, a Slack message is posted to `#data-quality` with the test name and a one-click "Create Jira ticket" action, and the DQ dashboard surfaces the failure for review.
- **Given** the warehouse runs the nightly full refresh DAG against the day's events at 02:00 UTC, **When** the DAG completes successfully and ingests 80 million fact rows across the five domains (attendee_journey, commercial, content_engagement, ops_efficiency, esg_impact), **Then** the `analytics_warehouse_refresh_log` row for the run records `status = succeeded`, `rows_inserted` reflects the per-domain breakdown, all DQ suites pass, OpenLineage captures the lineage edges, and the Module 1.1 War Room "Warehouse Health" tile shows green at the next 06:00 ED standup.
- **Given** an analyst opens the Lineage Graph in the Analytics Engineer console and selects the `fct_attendee_journey_daily` mart, **When** the Marquez-backed lineage view renders, **Then** every upstream source is visible (Kafka topics, raw ClickHouse tables, staging dbt models, intermediate marts) with edge labels showing transformation type and last successful run timestamp, and selecting any upstream node shows its schema, row count, and the downstream marts that depend on it.
