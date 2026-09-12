> Module 1: Master Dashboard & War Room Command Center → 1.1 Real-Time Data Visualization

## Real-Time Data Visualization

### A. Purpose Statement

The Real-Time Data Visualization surface is the primary digital surface of the War Room: a single live view that aggregates telemetry from every bounded context (registration, protocol, content, ops, finance, commercial, ESG) into a unified operational picture. It is used by the Event Director (ED), Operations Lead (OL), and senior on-call staff to detect anomalies within seconds and to coordinate responses across 10,000+ attendees, 100+ sovereign delegations, and multiple concurrent venues without forcing anyone to switch between a dozen disconnected tools.

At FMF scale, where a single delayed motorcade can cascade into a missed ministerial cue and a PR incident, the cost of a fragmented operational picture is measured in diplomatic fallout and lost deal value. This surface exists to compress the time between "something happened on the floor" and "the right person in the War Room saw it" from minutes to single-digit seconds.

### B. User Roles & Permissions

The dashboard is role-personalized; the same data backbone is filtered and prioritized per persona at the view layer. Permissions are enforced at the GraphQL federation layer and at the WebSocket subscription layer.

- **Event Director (ED):** Full read on every tile; sees a default layout with commercial KPIs (deal pipeline value, sponsorship realization), VIP ETA board, and S0/S1 incident counts pinned. Cannot edit data from this surface (it is read-only by design); can pin/unpin tiles and override the crisis-mode banner.
- **Operations Lead (OL):** Default layout prioritizes ops KPIs: zone density, F&B service status, scanner health, incident severity counts, ROS drift. Can re-order tiles for their own session but cannot publish a layout to other users.
- **Protocol Officer (PO):** Sees VIP arrival board, holding-room occupancy, and protocol-conflict count tiles; financial and commercial tiles are hidden by default.
- **VIP Liaison (VL):** Sees only the tile for their assigned dignitary (ETA, current zone, next cue) plus the global VIP board in summary form.
- **Registration Manager (RM):** Sees registration throughput, badge-print failure rate, and check-in queue depth tiles.
- **Sponsorship Sales Lead (SSL):** Sees deal pipeline, lead-capture rate, and sponsor booth traffic tiles.
- **Exhibitor Portal User (EPU):** No access to this surface. EPU dashboards live in the Commercial module (5).
- **Content & Stage Manager (CSM):** Sees session fill %, stage cue status, live-stream concurrency, and speaker green-room status tiles.
- **Matchmaking Concierge (MC):** Sees B2B meeting acceptance rate, meeting-room utilization, and queue depth tiles.
- **Finance & Administration Lead (FAL):** Sees budget pacing, invoice aging, and FX exposure tiles. Ops and protocol tiles are read-only summary.
- **Marketing & PR Lead (MPL):** Sees social sentiment, press accreditation count, and campaign conversion tiles.
- **ESG & Sustainability Officer (ESGO):** Sees real-time carbon, waste, and energy tiles sourced from IoT sensors and supplier feeds.
- **Field Volunteer (FV):** No direct access to the War Room dashboard; receives push notifications derived from it via the Mobile App.
- **Attendee (ATT):** No access. A public-facing, heavily redacted subset is published to the Attendee App (7).

A "layout publisher" permission (held by ED and OL only) allows saving a layout as the default for a role.

### C. Data Model

The dashboard is a projection layer; it does not own transactional state. Its data model consists of tile definitions, tile subscriptions, snapshot records, and personalization rows.

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | External IDs (e.g., grafana_dashboard_id) |
| `audit_log` | `jsonb[]` | Append-only local audit |

`tile_definition` (extends shared columns above):

| Field | Type | Notes |
|---|---|---|
| `tile_key` | `enum[reg_throughput, badge_scan_rate, zone_density, session_fill, incident_severity_count, vip_eta, b2b_accept_rate, fnb_status, social_sentiment, deal_pipeline, budget_pacing, carbon_realtime, ...]` | Catalog of supported tiles |
| `data_source` | `enum[kafka_topic, graphql_subgraph, http_poll, iot_stream]` | Source type |
| `source_ref` | `text` | Topic name, subgraph field, or URL |
| `refresh_strategy` | `enum[ws_push_2s, ws_push_5s, poll_15s, poll_60s]` | Drives subscription layer |
| `criticality` | `enum[critical, standard, auxiliary]` | Critical tiles cannot be hidden in crisis mode |
| `min_role` | `enum[ED, OL, PO, ...]` | Minimum role to see the tile |
| `render_spec` | `jsonb` | Component type, color thresholds, units |

`tile_snapshot` (the materialized value of a tile, written by the projection service):

| Field | Type | Notes |
|---|---|---|
| `tile_id` | `uuid` | FK -> tile_definition.id |
| `event_id` | `uuid` | FK -> event.id |
| `payload` | `jsonb` | The actual KPI value(s) |
| `source_event_id` | `uuid` | Last Kafka event id that updated this |
| `source_event_ts` | `timestamptz` | Timestamp on the source event |
| `ingested_at` | `timestamptz` | When projection service wrote this |
| `staleness_state` | `enum[fresh, stale, missing, error]` | Computed by staleness watchdog |
| `last_known_at` | `timestamptz` | Same as `source_event_ts` when fresh; frozen when stale |

`dashboard_layout` (per-user personalization):

| Field | Type | Notes |
|---|---|---|
| `user_id` | `uuid` | Owner of this layout |
| `role_default` | `boolean` | True if this is the role-level default |
| `tile_order` | `uuid[]` | Ordered list of tile_definition IDs |
| `pinned_tiles` | `uuid[]` | Tiles always visible above the fold |
| `crisis_filter` | `boolean` | If true, only critical tiles render |

### D. Business Logic & Edge Cases

The dashboard is driven by a set of explicit conditional rules. Logic is evaluated in the projection service, not the client, so that all clients see consistent state.

- **IF** a tile's `source_event_ts` is older than `now() - 60s` **AND** the tile's `refresh_strategy` is `ws_push_2s` or `ws_push_5s` **THEN** mark `staleness_state = 'stale'`, surface a yellow "STALE" badge on the tile, and render the `last_known_at` timestamp below the value.
- **IF** a tile's `source_event_ts` is older than `now() - 180s` **THEN** mark `staleness_state = 'missing'`, render the tile body in a striped grey pattern, and surface a "DATA UNAVAILABLE - tap for source status" affordance.
- **IF** a tile's data source returns an HTTP 5xx or a Kafka lag exceeds 10,000 messages **THEN** mark `staleness_state = 'error'`, render a red border, and emit an `incident.suggested` event of severity S2 to the Incident module.
- **IF** the user's role is `ED` or `OL` **AND** crisis mode is active **THEN** render only tiles with `criticality = 'critical'`, in a single-column high-contrast layout, and suppress personalization overrides.
- **IF** two tiles share the same underlying data source (e.g., `zone_density` and `fnb_status` both consume `ops.zone.telemetry`) **THEN** the projection service deduplicates the subscription and fans out to both tiles from a single consumer.
- **IF** the WebSocket connection drops **THEN** the client automatically switches to a 15-second polling fallback for ALL tiles (regardless of their normal `refresh_strategy`) until WSS reconnects, and surfaces a "DEGRADED - polling" banner at the top of the dashboard.

**Non-obvious edge case:** A VIP arrival ETA tile is sourced from the VIP module, which itself depends on a FlightAware webhook for inbound flights. The FlightAware webhook is delayed by 8 minutes due to an upstream outage. Naively, the ETA tile would show "STALE" and alarm the War Room, even though the dignitary's motorcade is in fact on schedule per the local VL's manual update. The system handles this by allowing the VL to manually "punch in" a status update via the Shadow App; this manual update writes a `vip.eta.override` event that takes precedence over the FlightAware-derived ETA in the tile's payload, AND the tile renders with a small "MANUAL" badge to make the override visible. The FlightAware-derived value continues to display in a secondary line. If the FlightAware feed recovers and the new ETA is within 5 minutes of the manual override, the system auto-clears the override and notifies the VL.

### E. Third-Party Integrations

The visualization surface integrates with the following real vendors and APIs. Data flow direction is explicit.

- **Datadog:** Datadog sends infrastructure metrics (API gateway latency, Kafka consumer lag, DB replica lag) outbound via webhook to the dashboard's `infra.health` Kafka topic. Direction: Datadog -> System. Used by the "infra health" auxiliary tile visible only to ED and OL.
- **Grafana:** The System embeds Grafana panels as iframes inside detailed drill-down views for ESG and network telemetry. Direction: bidirectional. The System passes a scoped OAuth token to Grafana; Grafana renders read-only panels.
- **Mapwize / Situm:** Indoor positioning vendors provide zone density telemetry. Direction: Mapwize/Situm -> System (via MQTT bridge). Drives the occupancy heatmap. Zone density is computed as `unique_badge_scans_in_zone / zone_area_sqm`, refreshed every 5 seconds.
- **HID Global / Zebra:** Badge scanner telemetry flows into the `scan.*` topic which feeds the `badge_scan_rate` and `zone_density` tiles. Direction: scanner -> System.
- **Slack and Microsoft Teams:** When an S0 or S1 tile crosses a threshold, the dashboard pushes a structured message to a configured channel via Slack Web API and Teams Graph API. Direction: System -> Slack/Teams.
- **PagerDuty:** PagerDuty incident states are mirrored into the `incident_severity_count` tile via PagerDuty webhooks. Direction: PagerDuty -> System.
- **Twilio:** Used to SMS ED and OL when crisis mode is declared. Direction: System -> Twilio.
- **FlightAware Firehose:** Inbound flight ETA for the VIP arrival board. Direction: FlightAware -> System.
- **SendGrid:** Used to email a daily 06:00 digest of dashboard tiles to the executive distribution list. Direction: System -> SendGrid.
- **AWS SNS / SQS:** Internal fan-out for tile update events across multi-region projection replicas. Direction: System internal.

### F. UI/UX Notes

The War Room dashboard renders on a 4K 65-inch wall display (primary) and a 14-inch laptop (secondary, for ED/OL when mobile). The layout is responsive but optimized for landscape 16:9.

- **Live tile grid:** A 6-column masonry grid. Each tile is a card with a header (tile name + staleness badge), a primary value (large), a delta vs. previous window (small, green/red), and a sparkline of the last 10 minutes. Critical tiles occupy 2x2 cells; auxiliary tiles 1x1.
- **Occupancy heatmap:** A full-width band beneath the tile grid. Renders the venue floor plan as an SVG with zones colored on a green->yellow->red gradient by people-per-sqm. Clicking a zone opens a side drawer with zone detail (current count, capacity, F&B status, active incidents).
- **Timeline of upcoming cues:** A horizontal Gantt-style strip showing the next 30 minutes of ROS cues across all sessions, color-coded by cue type (content, AV, F&B, security, protocol, transport). Slides leftward over time.
- **Alert ticker:** A bottom-of-screen scrolling ticker showing the last 20 S0/S1/S2 events with timestamp and severity color. Pauses on hover.
- **Mobile card view:** On the Staff App, a subset of 6 critical tiles is rendered as vertically stacked cards with a pull-to-refresh gesture. Designed for OL walking the floor.
- **Kiosk mode:** A read-only full-screen view with no UI chrome, intended for the wall display. Auto-cycles between the tile grid and the heatmap every 90 seconds.

Personalization is via a "edit layout" affordance: drag tiles to reorder, toggle visibility, pin to top. The ED can save a layout as the role-level default for OL or PO.

### G. Failure Modes & Offline Behavior

The dashboard is the most failure-sensitive surface in the System because its absence during a live event is itself an S1 incident.

- **WebSocket disconnect:** The client retries with exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s) and falls back to 15-second HTTP polling after the first failure. A "DEGRADED - polling" banner is shown. After 3 minutes of polling, an `incident.suggested` event of severity S2 is raised against the mobile BFF.
- **Kafka consumer lag > 5,000 messages:** The projection service emits a warning tile (yellow). At > 25,000 messages, tiles sourced from the lagging topic are marked `staleness_state = 'stale'` and an S2 incident is auto-raised.
- **Source API outage (e.g., FlightAware down):** The affected tile shows "STALE" after 60 seconds and "DATA UNAVAILABLE" after 180 seconds. Manual overrides (see edge case) remain honored. A "source status" drawer lists all source APIs and their last-success timestamp.
- **Projection service crash:** The projection service runs as a stateless Kubernetes deployment with 3 replicas. If a replica crashes, Kubernetes restarts within 30 seconds; tiles briefly show stale but recover automatically. The latest snapshot remains in Redis (TTL 5 minutes) so the UI continues to render the last known value during restart.
- **Walled venue with no attendee Wi-Fi:** The dashboard itself runs on the operations VLAN, which is physically separate from attendee Wi-Fi. If attendee Wi-Fi fails, the `app_active_users` tile goes stale, but the dashboard remains operational.
- **Display hardware failure on the wall display:** The kiosk mode client supports automatic failover from the primary wall display to a backup laptop connected to a secondary HDMI input, triggered by a heartbeat loss detected by the OL's laptop.
- **Time sync drift:** All projection timestamps use UTC from NTP-synced servers. The client renders `last_known_at` in event-local time (`Asia/Riyadh` for FMF) with a timezone label to avoid ambiguity.

### H. Acceptance Criteria

- **Given** the `badge_scan_rate` tile has not received a Kafka event for 65 seconds, **when** the staleness watchdog next runs, **then** the tile displays a yellow "STALE" badge and renders a `last_known_at` timestamp, and the system emits a `tile.stale` event to the audit log.
- **Given** the War Room dashboard is open on the ED's laptop, **when** an S0 incident is created in the Incident module, **then** the `incident_severity_count` tile updates within 2 seconds and the alert ticker shows the new incident with a red S0 marker.
- **Given** the WSS connection drops, **when** the client detects the disconnect, **then** the dashboard automatically falls back to 15-second polling within 1 second, displays a "DEGRADED - polling" banner, and continues to render all tiles from the latest Redis snapshot without going blank.
- **Given** a VL manually punches in a VIP ETA override via the Shadow App, **when** the override event propagates to the dashboard, **then** the VIP ETA tile renders the manual value as primary, displays a "MANUAL" badge, and continues to show the FlightAware-derived value in a secondary line until the next FlightAware ETA arrives within 5 minutes of the manual value.
- **Given** crisis mode is declared by the ED, **when** the dashboard re-renders, **then** only tiles with `criticality = 'critical'` are displayed, in a single-column high-contrast layout, regardless of the user's saved personalization.
