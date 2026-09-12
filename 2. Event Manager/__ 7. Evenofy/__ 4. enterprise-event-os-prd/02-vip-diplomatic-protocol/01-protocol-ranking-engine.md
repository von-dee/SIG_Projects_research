> Module 2: VIP & Diplomatic Protocol Management -> 2.1 Protocol Ranking Engine

## Protocol Ranking Engine

### A. Purpose Statement

The Protocol Ranking Engine is the authoritative source of diplomatic seniority for every dignitary attending the Forum. It is used by Protocol Officers (PO) and the Event Director (ED) to enforce seniority-based seating, holding-room, motorcade, and stage-arrival rules automatically, removing subjective judgment calls from protocol officers during the high-pressure windows of a 10,000-attendee, 100-delegation event. At FMF scale, a single misranked Minister can trigger a diplomatic protest note from a sovereign state; this engine exists so that ranking decisions are codified, auditable, and re-validatable in real time as dignitary rosters change.

### B. User Roles & Permissions

The Protocol Ranking Engine is the most tightly permissioned subsystem in the platform because it directly encodes diplomatic relationships. Permissions are enforced at the API gateway (coarse) and at the application layer (field-level via OPA/Rego policies).

- **Event Director (ED):** Read on all dignitary profiles, conflict matrix, and rank history. Write only via break-glass for protocol rank overrides, with two-person approval (ED + PO). Sees a real-time "Rank Override Queue" tile in the War Room.
- **Operations Lead (OL):** Read-only on dignitary profile summary fields (rank, country, name); no access to conflict_flags detail or notes fields. Cannot modify ranks.
- **Protocol Officer (PO):** Primary user. Read/write on dignitary profiles (excluding break-glass fields), protocol_rank assignments, tiebreaker configuration, and the Geo-Political Conflict Matrix. Can propose mid-event rank changes; cannot self-approve a rank override above their delegation level.
- **VIP Liaison (VL):** Read-only on the assigned dignitary's current rank, title, and country. Cannot see other dignitaries' ranks. Cannot write.
- **Registration Manager (RM):** Read-only on the protocol_rank field of attendees, used to drive badge color coding and lane routing at check-in.
- **Sponsorship Sales Lead (SSL):** No access. Sponsor and commercial records never interleave with protocol data.
- **Exhibitor Portal User (EPU):** No access.
- **Content & Stage Manager (CSM):** Read-only on rank and country for dignitary speakers, used to enforce stage precedence in the run-of-show.
- **Matchmaking Concierge (MC):** Read-only on protocol_rank and conflict_flags summary; used to block G2G meeting suggestions between delegations in active dispute.
- **Finance & Administration Lead (FAL):** No access.
- **Marketing & PR Lead (MPL):** No direct access. MPL sees only an aggregated "delegation count by rank" tile for press purposes.
- **ESG & Sustainability Officer (ESGO):** No access.
- **Field Volunteer (FV):** No access. FVs see only the badge color code transmitted from the registration context.
- **Attendee (ATT):** No access to anyone's rank, including their own if classified.

### C. Data Model

`dignitary_profile` (extends shared columns):

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
| `ext_refs` | `jsonb` | e.g., `{mof_id, delegation_id, cvent_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `attendee_id` | `uuid` | FK -> registration.id, unique per event |
| `full_name` | `text` | Honorific + first + last, e.g., "H.E. Marie Dupont" |
| `country_code` | `char(2)` | ISO 3166-1 alpha-2 |
| `protocol_rank` | `enum[1,2,3,4,5]` | 1=Head of State, 2=Head of Government, 3=Minister, 4=Deputy Minister/Ambassador, 5=Senior Official |
| `title` | `text` | Formal title, e.g., "Minister of Energy" |
| `is_head_of_state` | `bool` | Derived from protocol_rank = 1; flag allows override for edge cases (e.g., Governor-General) |
| `is_head_of_government` | `bool` | Derived from protocol_rank = 2 |
| `delegation_id` | `uuid` | FK -> delegation.id; groups members of same country |
| `delegation_seniority_order` | `int` | 1-based rank within delegation, used for same-country minister conflicts |
| `conflict_flags` | `uuid[]` | FK -> conflict_matrix_entry.id, materialized for fast lookup |
| `precedence_override` | `jsonb null` | Per-event manual override (e.g., `{position: 3, reason: "host-country special guest"}`) |
| `tiebreak_preference` | `enum[country_alpha, manual, custom_rank]` | Per-dignitary override of event default |
| `custom_rank_value` | `numeric(6,2) null` | Used when tiebreak_preference = custom_rank |
| `language_pref` | `text[]` | ISO 639-1, ordered by preference |
| `accessibility_needs` | `jsonb` | e.g., `{wheelchair: true, interpreter: "ASL"}` |
| `do_not_mention` | `jsonb` | Encrypted (column-level); sensitive notes for VL only |
| `diplomatic_note_ref` | `text null` | Reference to host-country MFA note verbale acknowledging rank |

`conflict_matrix_entry` (the Geo-Political Conflict Matrix):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (PO or diplomatic_advisor role) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{mfa_ref: "2026-DM-0142"}` |
| `audit_log` | `jsonb[]` | Append-only |
| `country_a` | `char(2)` | ISO 3166-1 alpha-2 |
| `country_b` | `char(2)` | ISO 3166-1 alpha-2 |
| `severity` | `enum[advisory, restricted, prohibited]` | prohibited blocks adjacency; advisory warns only |
| `reason_code` | `enum[active_dispute, sanctions, recognition_status, historical, security]` | Classification |
| `effective_from` | `timestamptz` | When the rule takes effect |
| `effective_to` | `timestamptz null` | null = open-ended |
| `source` | `enum[mfa_advisory, internal_protocol, host_country_directive]` | Provenance |
| `notes` | `text null` | Internal context, encrypted at column level |

`protocol_rank_enum` definition (canonical):

```text
1 = Head of State
    Examples: King, President (where president is head of state), Emir
2 = Head of Government
    Examples: Prime Minister, Premier, Chancellor (where head of government)
3 = Minister
    Examples: Minister of Energy, Minister of Mines, Cabinet Secretary
4 = Deputy Minister / Ambassador
    Examples: Vice Minister, Deputy Minister, Ambassador-at-large
5 = Senior Official
    Examples: Director General, Permanent Secretary, Department Head
```

`tiebreaker_config` (per-event):

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
| `default_strategy` | `enum[country_alpha, manual, custom_rank]` | Used when no per-dignitary override |
| `host_country_code` | `char(2)` | ISO 3166-1 alpha-2; host-country dignitary always ranks first within rank tier |
| `precedence_mode` | `enum[host_first, strict_alpha, custom]` | Head-of-state vs head-of-government precedence is host-country protocol dependent |
| `custom_order` | `jsonb null` | e.g., `{countries: ["SA","AE","EG",...]}` when precedence_mode = custom |
| `same_delegation_rule` | `enum[strict_seniority, co_equal]` | Whether two Ministers from same country are strictly ordered or treated as equal |

### D. Business Logic & Edge Cases

- **IF** a seating assignment would place a rank-3 dignitary in a row reserved for ranks 1-2, **THEN** block the save and surface a warning to the PO naming both the seat and the dignitary, with the next three compliant seats suggested.
- **IF** two dignitaries share the same protocol_rank and the same delegation, **THEN** order by `delegation_seniority_order`; if equal, fall back to `custom_rank_value`; if equal, fall back to alphabetical-by-`full_name`.
- **IF** two dignitaries share the same protocol_rank but different countries, **THEN** apply the event's `default_strategy`: alphabetical-by-`country_code` unless `precedence_mode = host_first` and one is from `host_country_code`, in which case the host-country dignitary ranks first.
- **IF** the conflict matrix entry between two dignitaries' countries has `severity = prohibited`, **THEN** the system blocks any seating, holding-room, motorcade-staging, or stage-lineup assignment that places them adjacent (within 2 seats, same table, or same holding room) and surfaces a "Protocol Block" error.
- **IF** `severity = restricted`, **THEN** the system warns the PO and requires a written justification captured in `audit_log` before allowing the assignment.
- **IF** `severity = advisory`, **THEN** the system surfaces a soft warning but allows the assignment.
- **IF** a PO changes `protocol_rank` on a dignitary after seating has been published, **THEN** the engine re-validates all existing seating assignments for that dignitary and for adjacent seats within 5 seconds, and flags any new violations on the PO's dashboard with a 10-minute countdown to resolve.
- **IF** two heads of state from different countries are seated in the same row, **THEN** host-country precedence applies if one is the host; otherwise, alphabetical-by-country applies, with the higher-precedence dignitary placed on the host's right (a configurable side-of-host convention stored in `tiebreaker_config.custom_order`).
- **IF** a dignitary's country is the subject of a new conflict matrix entry (severity escalation), **THEN** all materialized `conflict_flags` on dignitary profiles refresh within 60 seconds, and downstream seating and holding-room modules receive a `protocol.conflict_matrix.changed` event.

**Edge case (non-obvious): head-of-state vs. head-of-government precedence varies by host country.** In some protocols (e.g., French Fifth Republic), the President (HoS) outranks the Prime Minister (HoG); in others (e.g., certain parliamentary systems), the HoG is treated as the principal visiting dignitary. The engine stores `precedence_mode` per event and explicitly notes that the host-country MFA's note verbale is the source of truth. If a visiting HoS and a visiting HoG from the same country arrive, the engine uses `delegation_seniority_order` rather than rank tier alone.

**Edge case (non-obvious): mid-event rank change due to ministerial reshuffle.** A visiting Minister of Energy is promoted to Deputy Prime Minister mid-event (this has happened at FMF-class events). The PO updates `protocol_rank` from 3 to 2 via break-glass (requires ED co-approval). The engine publishes `vip.protocol_rank.changed`, which triggers re-validation of all seating, holding-room, motorcade, and stage-lineup records. The VL assigned to that dignitary receives a push notification with the new precedence and any required physical movement (e.g., from Row 3 to Row 2 of the plenary).

**Edge case (non-obvious): break-glass override of a prohibited conflict.** A truly exceptional diplomatic circumstance (e.g., a back-channel meeting explicitly authorized at Foreign-Minister level) requires seating two delegations in restricted severity together. ED + PO co-approve the override; the system records both approver identities, the justification text, the timestamp, and the MFA note verbale reference. The override is time-bounded (default 4 hours) and auto-reverts unless renewed.

### E. Third-Party Integrations

- **Host-country Ministry of Foreign Affairs (MFA) Diplomatic Note exchange:** The conflict matrix is partially populated from note verbale documents exchanged via a secure email gateway (Microsoft 365 with Message Encryption) and parsed by an LLM-assisted extractor in the Integration Hub. Data flow: MFA -> Integration Hub (Workato recipe) -> `conflict_matrix_entry` table. A human PO reviews every parsed entry before it goes live.
- **Microsoft Graph:** Pulls host-country delegation calendars and titles for dignitary profile enrichment. Data flow: Microsoft Graph -> Integration Hub -> dignitary_profile (read-only sync every 15 minutes during prep, every 60 minutes during event).
- **Google Workspace (Calendar + Directory):** Mirror of Microsoft Graph for delegations that use Google rather than Microsoft. Bidirectional conflict detection on calendar events.
- **Salesforce (NGO / diplomatic CRM):** Some FMF partner organizations (e.g., OECD, IEA) maintain dignitary rosters in Salesforce. Read-only sync via Salesforce REST API.
- **Azure AD B2C:** Identity provider for diplomatic liaison accounts. The PO and VL roles authenticate via Azure AD B2C with conditional access policies requiring device compliance and MFA.
- **AWS KMS:** Column-level encryption for `do_not_mention`, `notes`, and `precedence_override` fields. The DEK is held in a Protocol-service-only KMS key with a 90-day rotation policy.
- **OpenSearch:** Full-text search across the conflict matrix history and rank-change audit trail. Used by ED and PO during post-event review.
- **FlightAware (inbound feed):** Inbound flight ETA for each dignitary updates `dignitary_profile.ext_refs.flight_id` for cross-reference with the Transport module.
- **Kafka topics:** Publishes `vip.protocol_rank.changed`, `vip.conflict_matrix.changed`, `vip.tiebreaker.changed`, `vip.break_glass.executed`. Subscribes to `registration.attendee.promoted_to_vip` (from Registration module).

### F. UI/UX Notes

The PO's primary screen is a three-pane layout. Left pane: a sortable, filterable list of dignitaries grouped by country, with a colored chip per row showing the protocol rank (rank 1 = gold, rank 2 = silver, rank 3 = dark blue, rank 4 = light blue, rank 5 = grey). Center pane: the selected dignitary's detail form, with edit controls disabled for break-glass fields and a prominent "Request Rank Override" button that opens a modal capturing justification, MFA note reference, and approver selection. Right pane: the Conflict Matrix editor, a grid of country-vs-country cells colored green (advisory), amber (restricted), red (prohibited), with hover-revealed reason codes.

The top of the screen carries a banner showing the count of "Pending Revalidation" items (seating records that need PO review after a rank change) and the count of "Active Break-Glass Overrides" with their expiry countdowns. A side drawer exposes the Tiebreaker Config screen, where the PO sets `default_strategy`, `host_country_code`, and `precedence_mode`, with an inline preview showing how the top 20 dignitaries will be ordered under the current configuration.

The ED's War Room tile for this module shows three numbers: total dignitaries, count of active protocol blocks, and count of break-glass overrides in effect. Clicking the tile opens a read-only view of the same three-pane layout with all edit controls hidden.

### G. Failure Modes & Offline Behavior

- **Conflict matrix vendor feed (MFA email gateway) down:** The Integration Hub retains the last successfully parsed note verbale; the `conflict_matrix_entry` table continues to serve stale-but-known data with a banner in the PO UI reading "Conflict matrix last refreshed 47 minutes ago (stale)." PO can manually edit entries; manual edits are flagged with `source = internal_protocol` and require a justification note.
- **Kafka broker failure (cross-region):** MirrorMaker 2 continues replicating to the surviving region; protocol rank changes written in the failed region are queued locally and replayed within 2 seconds of broker recovery. If both regions are unreachable, the PO can fall back to a local CSV export of the dignitary roster (downloadable from the UI) and re-import changes when connectivity returns, with a conflict-resolution screen handling divergent edits.
- **Azure AD B2C outage:** Break-glass authentication via one-time codes stored in AWS Secrets Manager; codes are single-use, expire after 15 minutes, and require two-person activation (ED + a Security Lead). Every break-glass auth produces an S0 audit event.
- **AWS KMS key unavailable:** The engine refuses to write new dignitary profiles or conflict matrix entries; reads of encrypted fields return a "Field locked" placeholder. Existing materialized conflict flags remain usable for seating validation because they are cached unencrypted in Redis with a 1-hour TTL.
- **Conflict propagation delay exceeds 60 seconds:** The PO UI surfaces a red banner "Conflict propagation delayed; downstream modules may be inconsistent." The reconciliation job runs every 30 seconds to recompute materialized `conflict_flags` arrays and emits a `protocol.reconciliation.complete` event when consistency is restored.
- **PO mobile device offline (rare, but possible during a motorcade):** Read-only dignitary list is cached locally on the PO Mobile App with a 30-minute TTL; write attempts are queued and transmitted on reconnect with original timestamps preserved in `audit_log`.

### H. Acceptance Criteria

- **Given** a published seating chart with two adjacent dignitaries from countries with `severity = prohibited`, **When** a new conflict matrix entry is created escalating those countries from advisory to prohibited, **Then** the seating chart is auto-flagged within 60 seconds with a "Protocol Block" error naming both dignitaries and suggesting three alternative seat pairs.
- **Given** two Ministers (rank 3) from the same country, **When** the PO assigns them to adjacent seats in the same row, **Then** the system orders them by `delegation_seniority_order`, and if equal, by `custom_rank_value`, and if equal, by alphabetical full_name, with the chosen tiebreaker surfaced in the UI as a tooltip.
- **Given** a dignitary currently seated in Row 2 of the plenary, **When** the PO changes their `protocol_rank` from 3 (Minister) to 2 (Head of Government), **Then** the engine re-validates all seating assignments for that dignitary within 5 seconds, flags any new violations (e.g., they are now outranking a Head of State seated in Row 1), and surfaces them in the PO's "Pending Revalidation" queue.
- **Given** an attempted break-glass override of a prohibited conflict, **When** the PO submits the override request with justification and MFA note reference, **Then** the override is not active until the ED co-approves via a second-factor push notification, and the override auto-reverts after the configured time window (default 4 hours) unless renewed.
- **Given** the host country is "SA" and `precedence_mode = host_first`, **When** a visiting Head of State from "EG" and the host-country Minister of Energy are both rank-classified, **Then** the system ranks the SA Minister ahead of the EG Head of State only within rank tier equality, and otherwise applies strict rank precedence (rank 1 HoS from EG outranks rank 3 SA Minister), with the precedence rationale visible to the PO in a hover tooltip.
