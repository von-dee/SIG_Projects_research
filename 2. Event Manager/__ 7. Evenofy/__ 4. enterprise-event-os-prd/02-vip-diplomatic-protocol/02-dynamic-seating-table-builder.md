> Module 2: VIP & Diplomatic Protocol Management -> 2.2 Dynamic Seating & Table Builder

## Dynamic Seating & Table Builder

### A. Purpose Statement

The Dynamic Seating & Table Builder is the operational surface used by Protocol Officers (PO) to author, validate, and publish seating charts for every zone in the Forum: plenary rows, banquet round tables, breakout theater rows, and private holding rooms. It exists because at FMF scale (60+ ministerial speakers, 100+ delegations, multiple concurrent sessions across multiple venues), no human can mentally enforce the hundreds of pairwise constraints (rank precedence, country conflict flags, host-country precedence, spouse pairing, language, accessibility) while also responding to real-time roster changes. The Builder automates enforcement and reflow so the PO can focus on diplomatic nuance rather than arithmetic.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all seating charts and versions. Publish/rollback requires break-glass (two-person approval). Sees the "Active Chart Versions" tile in the War Room.
- **Operations Lead (OL):** Read on chart metadata and published versions; cannot edit seat assignments. Uses chart data to coordinate usher and F&B deployment.
- **Protocol Officer (PO):** Primary user. Read/write on chart drafts, seating rules, and assignments. Publishes charts (single-person approval within their delegation). Can rollback to prior versions within 5 minutes.
- **VIP Liaison (VL):** Read-only on the seating assignment of their assigned dignitary (single row + seat label + zone map link). Cannot see other dignitaries' assignments.
- **Registration Manager (RM):** Read-only on published seating assignments for the purpose of printing seat numbers on badges.
- **Sponsorship Sales Lead (SSL):** Read-only on sponsor-table assignments (the commercial table block); no access to dignitary tables.
- **Exhibitor Portal User (EPU):** No access.
- **Content & Stage Manager (CSM):** Read-only on stage-row seating (used to brief speakers on where to sit when they exit the stage).
- **Matchmaking Concierge (MC):** No access. Matchmaking never modifies seating.
- **Finance & Administration Lead (FAL):** No access.
- **Marketing & PR Lead (MPL):** No direct access. Receives an aggregated "seating coverage by delegation" report post-event.
- **ESG & Sustainability Officer (ESGO):** No access.
- **Field Volunteer (FV):** Read-only on the zone map and published seat labels for their assigned zone; used to direct attendees.
- **Attendee (ATT):** Read-only on their own seat assignment via the Attendee App; updated when chart is published.

### C. Data Model

`seating_chart` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{cvent_session_id, mfa_banquet_plan_ref}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `session_id` | `uuid` | FK -> session.id (nullable for zone-wide charts) |
| `zone_id` | `uuid` | FK -> zone.id |
| `chart_type` | `enum[plenary_rows, banquet_round, breakout_theater, holding_room]` | Drives seat shape |
| `name` | `text` | e.g., "Plenary Day 2 Morning" |
| `status` | `enum[draft, in_review, published, archived]` | Lifecycle |
| `published_at` | `timestamptz null` | When chart went live |
| `published_by` | `uuid null` | Actor |
| `parent_version_id` | `uuid null` | FK -> seating_chart.id for version chain |
| `rules_snapshot` | `jsonb` | Frozen copy of the rules engine config used at publish time |

`seat` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{floor_plan_id, mapwize_node_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `chart_id` | `uuid` | FK -> seating_chart.id |
| `zone_id` | `uuid` | FK -> zone.id |
| `seat_label` | `text` | e.g., "4A", "Table 12 - Seat 3" |
| `row_label` | `text null` | e.g., "Row 4"; null for banquet |
| `table_label` | `text null` | e.g., "Table 12"; null for plenary |
| `seat_kind` | `enum[standard, vip, reserved, accessible, spouse, host_right, host_left, aisle]` | Drives auto-suggestion priority |
| `max_rank_allowed` | `enum[1,2,3,4,5,any]` | Surfaces the rank-row threshold; "any" used for breakout theater |
| `x_coord` | `numeric(8,3)` | Floor plan position in meters from zone origin |
| `y_coord` | `numeric(8,3)` | Floor plan position |
| `capacity` | `int` | Default 1; >1 for shared bench-style seats |
| `adjacency_group` | `text null` | Groups seats considered "adjacent" for conflict purposes (e.g., same table, same row pair) |

`seat_assignment` (extends shared columns):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{cvent_seat_assignment_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `seat_id` | `uuid` | FK -> seat.id |
| `dignitary_id` | `uuid` | FK -> dignitary_profile.id (nullable if seat is unassigned) |
| `attendee_id` | `uuid null` | FK -> registration.id (for non-dignitary seats) |
| `role_at_seat` | `enum[principal, spouse, interpreter, aide, security]` | Drives pairing rules |
| `assigned_at` | `timestamptz` | UTC |
| `assigned_by` | `uuid` | Actor (PO or system auto-suggestion accepted by PO) |
| `assignment_origin` | `enum[manual, auto_suggestion, auto_reflow, break_glass]` | Provenance for audit |
| `validation_status` | `enum[valid, warning, blocked]` | Result of rules engine check |

`seating_rules_config` (per-event rules engine):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | External refs |
| `audit_log` | `jsonb[]` | Append-only |
| `rank_row_thresholds` | `jsonb` | e.g., `{rows_1_to_2: rank_1, rows_3_to_5: rank_2, rows_6_to_10: rank_3}` |
| `host_country_code` | `char(2)` | Drives host-side precedence |
| `spouse_pairing_enabled` | `bool` | If true, spouse seats auto-adjacent |
| `interpreter_seating_rule` | `enum[adjacent, behind, none]` | Where interpreter sits relative to dignitary |
| `language_cluster_enabled` | `bool` | If true, common-language dignitaries clustered when rank allows |
| `accessibility_priority` | `bool` | If true, accessibility seats auto-assigned first |
| `banquet_table_size` | `enum[8, 10, 12]` | Drives banquet seat geometry |
| `auto_reflow_strategy` | `enum[minimal_disruption, lowest_row, next_available]` | Used for late VIP reflow |

### D. Business Logic & Edge Cases

- **IF** `seat.max_rank_allowed` is less than `attendee.protocol_rank` (rank value, where lower number = higher rank), **THEN** the assignment is blocked with a specific error message naming both the seat and the dignitary, and the system suggests the next three compliant seats in the same zone.
- **IF** two dignitaries from countries with `severity = prohibited` are placed within the same `adjacency_group`, **THEN** the assignment is blocked and the PO must move one of them at least two seats away or to a different table.
- **IF** `spouse_pairing_enabled = true`, **THEN** when a principal dignitary is assigned, the system reserves the adjacent seat for a spouse assignment and warns the PO if a non-spouse is placed there.
- **IF** the dignitary has `accessibility_needs.wheelchair = true`, **THEN** the system only allows assignment to seats with `seat_kind = accessible`, and reserves the adjacent seat for an aide.
- **IF** a VIP confirms attendance within 2 hours of the session start time and `auto_reflow_strategy = minimal_disruption`, **THEN** the system computes the seat whose insertion causes the fewest cascading reassignments (a greedy least-cost path over the existing assignment graph), inserts the VIP there, and presents the diff for PO approval before publishing.
- **IF** two heads of state from different countries are seated in the same row and one is from `host_country_code`, **THEN** the host-country HoS is placed at the host_right position; if neither is from the host country, **THEN** they are seated in alphabetical order by `country_code`, with the alphabetically-first country on the host_right side.
- **IF** a seat assignment is changed after chart publication, **THEN** the engine creates a new chart version (increment `version`, copy `parent_version_id`), preserves the prior version, and emits `seating.chart.versioned`. Prior versions remain rollback-eligible for 5 minutes; after that they are archived for audit.
- **IF** the PO drags a dignitary onto a seat that violates three or more rules simultaneously, **THEN** the system surfaces a single composite error listing all violations and offers a "Best Alternative" one-click suggestion that resolves all violations by finding the nearest compliant seat.
- **IF** a VIP's protocol rank changes mid-event, **THEN** the engine re-validates every seat assignment in every published chart for that dignitary within 5 seconds and produces a "Revalidation Report" listing any now-invalid assignments.

**Edge case (non-obvious): a VIP confirms 90 minutes before the plenary, and the only compliant seat is held by a rank-3 Minister who is currently en route and whose VL has not yet checked in.** The engine proposes inserting the VIP at the rank-3 Minister's seat and displacing the Minister to a rank-3-compliant seat one row back, but it flags this as a "Disruptive Reflow" requiring PO + ED co-approval because the displaced Minister's VL has not been notified. The engine pre-drafts a push notification to the Minister's VL for the PO to send.

**Edge case (non-obvious): two heads of state from non-host countries with a restricted (not prohibited) conflict severity must both be seated in the front row.** The system warns the PO, requires a written justification, and places them at opposite ends of the front row with a one-seat buffer occupied by a host-country senior official. The justification is captured in `audit_log` and surfaces in the post-event protocol review.

**Edge case (non-obvious): banquet table with 12 seats and 4 delegations present, one of which is a host-country Minister whose spouse is also attending.** The engine ensures the Minister sits at the host-side position (typically seat 1 or seat 12 depending on convention), the spouse adjacent, and clusters the remaining 3 delegations on opposite sides of the table to avoid adjacency between any two non-host delegations with advisory-or-worse conflict severity.

### E. Third-Party Integrations

- **HID Global Origo (badging service):** When a chart is published, seat assignments flagged `print_on_badge = true` are pushed to HID Origo for inclusion on the printed badge. Data flow: seating module -> Integration Hub -> HID Origo API (outbound).
- **Zebra ZebraDesigner / PrintConnect:** Print-time injection of seat label and table number onto the badge stock. Bidirectional status (print success/failure) returned.
- **Mapwize / Situm (indoor mapping):** Seat `x_coord` and `y_coord` are pushed to Mapwize as POIs so the Attendee App can render a navigation path to "Your seat is 4A in Row 4". Data flow: seating module -> Integration Hub -> Mapwize API (outbound).
- **Microsoft Graph / Google Workspace:** Calendar invites to attendees whose seat assignments change post-publication include the new seat label in the calendar body. Data flow: seating module -> Integration Hub -> Microsoft Graph (outbound).
- **Salesforce (sponsor CRM):** Sponsor table assignments are mirrored to Salesforce for sponsor portal display. Data flow: seating module -> Integration Hub -> Salesforce REST API (outbound, every 5 minutes).
- **Cvent (if used as registration back-end for some delegations):** Bidirectional sync of seat assignments. Data flow: bidirectional via Workato recipe.
- **Twilio:** SMS notification to VL when their assigned dignitary's seat changes post-publication. Data flow: outbound via Integration Hub.
- **AWS KMS:** Column-level encryption of any dignitary-name-bearing seat assignment metadata at rest.
- **Kafka topics:** Publishes `seating.chart.drafted`, `seating.chart.published`, `seating.chart.rolled_back`, `seating.assignment.changed`, `seating.reflow.executed`. Subscribes to `vip.protocol_rank.changed` and `vip.conflict_matrix.changed` (from Module 2.1) to trigger re-validation.

### F. UI/UX Notes

The Builder is a full-screen, three-region layout. Left region: a session/zone picker and a list of chart versions with the active one highlighted, a "Compare Versions" button that opens a side-by-side diff, and a "Rollback" button enabled only within the 5-minute rollback window. Center region: an interactive floor plan rendered as SVG. Plenary rows are shown as numbered seat grids; banquet tables as round circles with seat numbers positioned radially; breakout theater as angled rows; holding rooms as labelled rectangles. Dragging a dignitary card from the right region onto a seat triggers rule validation in real time; the seat turns green (valid), amber (warning), or red (blocked) with a tooltip listing the violating rules.

Right region: a roster of unseated dignitaries, filterable by country, rank, and accessibility needs. Each dignitary card carries a colored rank chip and a small flag icon. Above the roster, a "System Suggestions" panel proactively surfaces three suggested seat placements for the next-selected dignitary, ranked by compliance score. A "Bulk Auto-Assign" button runs the rules engine over all unseated dignitaries and proposes a complete assignment, which the PO can accept, modify, or reject.

A top toolbar carries: chart name and version, a status badge (draft/in_review/published), a "Publish" button (enabled only when validation passes), a "Reflow on Late VIP" button, and a "Lock Chart" toggle that prevents further edits (used when the chart has been sent to badging).

### G. Failure Modes & Offline Behavior

- **Badging integration (HID Origo) down at publish time:** The chart publishes successfully and the seat assignments are queued in the Integration Hub with a 24-hour TTL. When HID Origo recovers, the queue drains. Badges printed during the outage use a manual fallback label printed at the registration desk.
- **Mapwize unavailable:** Seat assignments remain valid in the seating module; the Attendee App shows a static floor plan image with a pin on the seat label, without turn-by-turn navigation. A "Mapping degraded" banner appears in the Attendee App.
- **Drag-and-drop validation latency exceeds 500 ms:** The UI shows a "Validating..." spinner on the dragged card and refuses to commit until validation returns; if validation does not return within 3 seconds, the seat reverts to its prior assignment and an error is logged.
- **Kafka producer failure on chart publish:** The chart is marked `in_review` rather than `published` in the local database; a background reconciler retries the publish event every 30 seconds and alerts the PO if it cannot succeed within 5 minutes.
- **Concurrent edits by two POs on the same chart:** Optimistic concurrency check via `version` column; the second save is rejected with a "Chart was modified by another user" message and a diff preview, allowing the second PO to merge or discard.
- **Mobile device offline (PO using tablet during a walk-through):** The Builder does not support offline editing by design, because seating decisions require live conflict-matrix freshness. The PO can view a read-only cached snapshot of the last published chart, with a "Stale snapshot, X minutes old" banner.
- **Rollback window exceeded:** The "Rollback" button greys out after 5 minutes; the PO must instead create a new chart version that restores the prior seat assignments (the prior version is still accessible via the version list and can be copied as a draft).

### H. Acceptance Criteria

- **Given** a draft plenary chart with seat 4A in Row 4 having `max_rank_allowed = 2`, **When** the PO drags a rank-3 Minister onto seat 4A, **Then** the seat turns red, the save is blocked, the error message names the Minister and the seat, and three alternative seats in Row 5 (or lower) are suggested.
- **Given** a published banquet chart with Table 12 having 10 seats and a host-country Minister assigned to seat 1, **When** the host-country Minister's spouse is added to the dignitary roster, **Then** the system auto-suggests seat 2 for the spouse, marks the assignment with `role_at_seat = spouse`, and updates the badge print data within 30 seconds.
- **Given** a VIP confirms attendance 90 minutes before the plenary and `auto_reflow_strategy = minimal_disruption`, **When** the PO clicks "Reflow on Late VIP", **Then** the system inserts the VIP at the lowest-disruption compliant seat, shows a diff listing every displaced attendee, and the PO can approve or reject before the reflow is published.
- **Given** a published chart at version 4, **When** the PO publishes version 5 (with three seat changes), **Then** version 4 remains rollback-eligible for 5 minutes, the rollback button is active during that window, and rolling back produces a new version 6 that restores the version 4 assignments with an `assignment_origin = break_glass` tag for audit.
- **Given** two heads of state from countries "AE" and "BH" with the host country "SA" and `precedence_mode = host_first`, **When** the PO attempts to place the AE HoS at seat 1A and the BH HoS at seat 1B (host-right and host-left), **Then** the engine validates the placement using alphabetical-by-country (AE before BH) for non-host HoS precedence, places AE HoS on the host-right side, and surfaces the precedence rationale as a tooltip.
