> Module 11: ESG & Sustainability Tracker -> 11.1 Carbon Footprint Tracker

## Carbon Footprint Tracker

### A. Purpose Statement

The Carbon Footprint Tracker is the authoritative measurement and reconciliation engine for every greenhouse gas (GHG) emission associated with the Future Minerals Forum, from the first concrete poured for the temporary plenary structure nine months out through the final waste-hauler truck leaving the venue fourteen days after close. At FMF scale, the system tracks Scope 1 (direct combustion: diesel generators, propane catering stoves, LPG forklifts), Scope 2 (purchased electricity at the Ritz-Carlton and Four Seasons host venues plus the ICC Riyadh plenary halls), and Scope 3 (the dominant share: attendee air travel for 10,000+ participants from 100+ sovereign delegations, hotel room-nights across 18 partner hotels, catering supply chain emissions, printed materials, AV equipment shipping, and the construction of the temporary exhibition halls). The headline number for FMF 2025 was 12,840 tCO2e, of which 8,910 tCO2e (69%) was Scope 3 attendee air travel.

This subsystem exists because FMF publishes a public net-zero pledge for 2030, because three sovereign delegations include carbon disclosure as a precondition of ministerial attendance, and because the host country Ministry of Energy requires an ISO 14064-aligned inventory as a regulatory filing within 90 days of event close. A single methodology drift (e.g., using a hotel factor from DEFRA 2019 instead of DEFRA 2025) can shift the reported total by more than 5%, which materially affects the volume of voluntary offsets the Forum must purchase to claim carbon neutrality. This subsystem codifies methodology, version-controls every emission factor used, and reconciles every line item to a primary source record.

The subsystem owns the `esg.carbon.*` Kafka topic prefix within the broader `esg.*` bounded context established in Module 0.1. It publishes `esg.carbon.line_item.created`, `esg.carbon.line_item.revised`, `esg.carbon.line_item.estimated`, `esg.carbon.line_item.reconciled`, `esg.carbon.footprint.snapshot_published`, `esg.carbon.offset.purchased`, `esg.carbon.offset.retired`, and `esg.carbon.offset.linked`. It subscribes to `registration.confirmed` and `registration.cancelled` (Module 6.1) to seed attendee-travel emission estimates, to `transport.fleet.audit` (Module 8.4) for ground-transport fuel logs, to `supplier.delivery.confirmed` (Module 8.2) for freight emissions, to `po.payment_released` (Module 9.3) for procurement-linked embedded carbon, and to `fnb.menu.published` (Module 8.3) for catering carbon intensity. Its non-negotiable contract is that every reported tonne of CO2e is traceable to a primary source artifact (meter reading, fuel receipt, boarding pass, hotel folio, supplier disclosure) or to a documented estimation methodology with a named analyst owner.

### B. User Roles & Permissions

- **Event Director (ED):** Read on all carbon data, snapshots, and offset records. Write only via break-glass on methodology overrides (e.g., adopting a non-default emission factor for a host-country-specific fuel blend) with two-person approval (ED + ESGO). Sees the live tCO2e counter and offset coverage ratio in the War Room.
- **Operations Lead (OL):** Read-only on aggregate carbon by venue, day, and stream. Sees fuel-delivery alerts and generator-runtime anomalies surfaced from Module 8.4.
- **Protocol Officer (PO):** No direct access. Receives a one-page summary of the carbon disclosure for inclusion in ministerial briefing packs only after ESGO sign-off.
- **VIP Liaison (VL):** No access. The VL's dignitary travel footprint is captured via the attendee-travel survey, not via direct liaison access.
- **Registration Manager (RM):** Read-only on the travel-survey completion dashboard. Can trigger post-event travel-survey reminders to attendees who did not complete registration-time travel questions.
- **Sponsorship Sales Lead (SSL):** Read-only on the aggregate carbon footprint attributable to each sponsor's contracted footprint (booth construction, sponsor staff travel, branded materials), surfaced as a "Sponsor Carbon Contribution" line in the sponsor's ESG dashboard.
- **Exhibitor Portal User (EPU):** Read-only on their own company's carbon attribution. Can submit fuel and shipping data via a structured form for their own booth logistics.
- **Content & Stage Manager (CSM):** Read-only on stage electricity consumption and AV shipping emissions per stage.
- **Matchmaking Concierge (MC):** No access.
- **Finance & Administration Lead (FAL):** Read on offset purchase invoices and credit-card charges. Write only on offset PO approval (per Module 9.3 standard three-way match).
- **Marketing & PR Lead (MPL):** Read-only on the externally shareable carbon snapshot. Cannot see line-item details or estimation flags.
- **ESG & Sustainability Officer (ESGO):** Primary user. Read/write on emission factors, calculation methodology config, estimation rules, line-item overrides (with audit capture), offset portfolio configuration, and snapshot publication. Owns the reconciliation queue and the methodology version manifest.
- **Field Volunteer (FV):** Read-only on assigned meter-reading tasks; writes via the Staff App to log manual meter readings when IoT telemetry fails.
- **Attendee (ATT):** Read-only on their own individual carbon footprint (estimated from their travel survey), surfaced in the Mobile App with a comparison to event median. Can voluntarily purchase additional offsets via a Pachama or Climeworks deep-link, attributed to their attendee_id.

### C. Data Model

`carbon_emission_line_item` (the atomic unit of every reported tonne):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 time-sortable |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | Actor (ESGO or service account) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency token |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{meter_id, supplier_id, attendee_id, po_id, hotel_folio_id}` |
| `audit_log` | `jsonb[]` | Append-only local audit |
| `scope` | `enum[1,2,3]` | GHG Protocol scope |
| `source_category` | `enum[stationary_combustion, mobile_combustion, purchased_electricity, attendee_air_travel, attendee_ground_travel, hotel_stay, catering, materials, freight, waste_treatment, other]` | |
| `activity_quantity` | `numeric(18,3)` | e.g., kWh, litres of diesel, passenger-km, room-nights, meals served |
| `activity_unit` | `text` | e.g., "kWh", "L", "pax_km", "room_night", "meal" |
| `emission_factor_id` | `uuid` | FK -> emission_factor.id |
| `co2e_kg` | `numeric(18,3)` | Computed: activity_quantity x emission_factor.kg_per_unit, including any CH4/N2O blended factor |
| `data_quality` | `enum[measured, calculated, estimated, projected]` | Determines the visibility flag in reports |
| `estimation_method` | `text null` | e.g., "median_pax_type_emissions", "hotel_star_rating_proxy", required when data_quality in (estimated, projected) |
| `source_artifact_ref` | `text null` | URI to primary source: S3 object key for meter reading, fuel receipt, or boarding pass |
| `period_start` | `timestamptz` | Activity start (UTC) |
| `period_end` | `timestamptz` | Activity end (UTC) |
| `venue_id` | `uuid null` | FK -> venue.id (Module 8.1) for scope 1 and 2 attribution |
| `reconciliation_status` | `enum[unreconciled, reconciled, disputed, superseded]` | Lifecycle state |
| `linked_offset_ids` | `uuid[]` | FK -> carbon_offset.id; covers allocation |

`emission_factor` (the versioned factor library):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ESGO or service account |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{defra_ghg_conversion_factor_id, epa_emission_hub_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `factor_name` | `text` | e.g., "Diesel (100% mineral diesel), DEFRA 2025" |
| `source_authority` | `enum[defra, epa, ipcc, local_government, supplier_disclosure, eeko, custom]` | |
| `source_version` | `text` | e.g., "DEFRA 2025 v1.0", "EPA Emission Factors Hub 2024" |
| `activity_unit` | `text` | Unit the factor applies to (litres, kWh, pax_km) |
| `kg_co2e_per_unit` | `numeric(12,6)` | Blended CO2 + CH4 + N2O in CO2-equivalent |
| `valid_from` | `timestamptz` | When factor becomes applicable |
| `valid_to` | `timestamptz null` | null = current |
| `geography` | `text` | e.g., "GLOBAL", "SAU", "GCC", "EU" |
| `notes` | `text null` | ESGO methodology notes |

`carbon_offset` (voluntary offset purchases and retirements):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ESGO or FAL (for purchase) |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{pachama_project_id, climeworks_order_id, gold_standard_serial}` |
| `audit_log` | `jsonb[]` | Append-only |
| `project_name` | `text` | e.g., "Pachama - Amazon Reforestation Pira" |
| `project_type` | `enum[reforestation, afforestation, dac, renewable_energy, blue_carbon, cookstoves, methane_capture]` | |
| `registry` | `enum[pachama, climeworks, gold_standard, verra, american_carbon_registry]` | |
| `registry_serial` | `text` | Unique serial from registry |
| `tonnes_purchased` | `numeric(18,3)` | tCO2e |
| `tonnes_retired` | `numeric(18,3)` | tCO2e retired via registry; cannot exceed tonnes_purchased |
| `purchase_price_usd` | `numeric(18,3)` | USD per tonne |
| `purchase_date` | `timestamptz` | |
| `retirement_date` | `timestamptz null` | null = not yet retired |
| `retirement_beneficiary` | `text` | e.g., "Future Minerals Forum 2026" |
| `linked_line_item_ids` | `uuid[]` | FK -> carbon_emission_line_item.id; allocation |

`carbon_footprint_snapshot` (point-in-time published inventory):

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, v7 |
| `tenant_id` | `uuid` | Multi-tenant isolation |
| `event_id` | `uuid` | FK -> event.id |
| `created_at` | `timestamptz` | UTC |
| `updated_at` | `timestamptz` | UTC |
| `created_by` | `uuid` | ESGO |
| `updated_by` | `uuid` | Actor of last mutation |
| `version` | `int` | Optimistic concurrency |
| `deleted_at` | `timestamptz null` | Soft-delete |
| `ext_refs` | `jsonb` | e.g., `{workiva_document_id, salesforce_nzc_report_id}` |
| `audit_log` | `jsonb[]` | Append-only |
| `snapshot_type` | `enum[pre_event_baseline, live_event, post_event_final, regulator_filing]` | |
| `period_start` | `timestamptz` | |
| `period_end` | `timestamptz` | |
| `total_co2e_tonnes` | `numeric(18,3)` | Sum of all line items in snapshot |
| `scope_1_tonnes` | `numeric(18,3)` | |
| `scope_2_tonnes` | `numeric(18,3)` | |
| `scope_3_tonnes` | `numeric(18,3)` | |
| `offset_coverage_ratio` | `numeric(5,2)` | Retired offsets / total_co2e_tonnes, percentage |
| `methodology_version` | `text` | e.g., "GHG Protocol Corporate Standard, DEFRA 2025, ISO 14064-1:2018" |
| `publication_status` | `enum[draft, internal_review, approved, published, superseded]` | Workflow state |
| `published_by` | `uuid null` | ESGO who approved publication |
| `published_at` | `timestamptz null` | |

### D. Business Logic & Edge Cases

- **IF** an `emission_factor` with the same `factor_name` and `source_version` already exists, **THEN** the system blocks creation and surfaces the existing factor with a "use existing" prompt, preventing accidental duplicate factors that would create double counting.
- **IF** a line item has `data_quality = estimated` and the corresponding primary source artifact becomes available within 90 days post-event, **THEN** the system creates a new line item with `data_quality = measured`, marks the original `superseded`, and preserves both in the audit trail for methodology transparency.
- **IF** a Scope 2 electricity line item is created from IoT meter telemetry and the meter registers a negative reading (export to grid, e.g., rooftop solar feeding back), **THEN** the system creates a separate line item with `source_category = purchased_electricity` and a negative `co2e_kg`, and surfaces an "on-site renewable export credit" line in the snapshot, with ESGO approval required to apply the credit against total emissions.
- **IF** the sum of `tonnes_retired` across all `carbon_offset` records exceeds `total_co2e_tonnes` for the post-event snapshot, **THEN** the snapshot is flagged "over-offset" and the ESGO must either carry the surplus forward to the next event or retire it under a separate beneficiary.
- **IF** an attendee's travel survey is missing the flight class field, **THEN** the system estimates using the median emission factor for that attendee's `pax_type` (Minister, Investor, Sponsor Rep, Staff, Press, Volunteer) from the prior 3 events, flags the line item with `data_quality = estimated`, sets `estimation_method = "median_pax_type_emissions"`, and enrolls the attendee in a post-event travel survey that, when completed, will trigger a reconciliation pass.
- **IF** a hotel partner's emissions disclosure is delayed beyond 30 days post-event, **THEN** the system creates a provisional line item using `estimation_method = "hotel_star_rating_proxy"` with a factor derived from star rating, room-night count, and the DEFRA "Hotel stay" factor for the host country, with a 25% uncertainty buffer added. When the actual disclosure arrives, the system reconciles, marks the provisional line `superseded`, and publishes a `esg.carbon.line_item.reconciled` event that updates the snapshot delta.
- **IF** a methodological revision (e.g., DEFRA releases 2025 factors mid-prep cycle replacing 2024 factors) requires recomputing historical line items, **THEN** the ESGO can publish a new `emission_factor` with `valid_from` set to the date the new factor takes effect; previously-computed line items retain the factor active at their `period_start`, ensuring no retroactive rewrites of the historical record.
- **IF** an offset purchase from Climeworks (Direct Air Capture) is linked to a Scope 3 air-travel line item, **THEN** the system applies the stricter permanence accounting (10,000-year storage guarantee per Climeworks) and surfaces a "permanent removal" tag in the snapshot, distinguishing it from avoidance-based offsets (e.g., renewable energy credits).
- **IF** a supplier's emissions disclosure is unsigned or self-attested only (no third-party verification), **THEN** the line item created from that disclosure is flagged `data_quality = calculated` with a `disclosure_verification = self_attested` tag, and the ESGO dashboard surfaces an "unverified disclosure" tile for prioritized review.

**Edge case (non-obvious): incomplete attendee travel data with no origin airport.** A delegate registers with only their destination (Riyadh) and no origin airport, but with a declared nationality of "AU" (Australia). The system cannot directly compute passenger-kilometres. The engine falls back to the host-country capital airport (CAN for Australia) as a proxy origin, computes the great-circle distance via the GEOS library, multiplies by the DEFRA "Long-haul, economy" factor (defaulting to economy because pax_type=investor at this tier typically flies economy at FMF per 2024 audit), flags the line item with `data_quality = estimated`, sets `estimation_method = "nationality_capital_proxy"`, and enrolls the attendee in a post-event survey offering a 30-second form with origin airport, cabin class, and round-trip vs one-way. Survey responses auto-reconcile the line item, with the old and new values both retained in `audit_log`. This pattern, applied across 1,200+ attendees with missing travel data at FMF 2025, produced a net upward revision of 840 tCO2e once the post-event survey closed.

**Edge case (non-obvious): hotel partner disclosure arrives 60 days late and revises a published snapshot.** A partner hotel submits their actual kWh and laundry-propane figures 60 days after event close, after the post-event snapshot has already been published on the FMF website. The original line item was estimated at 142 tCO2e using the DEFRA 5-star hotel factor for Saudi Arabia. The actual disclosure is 198 tCO2e (the hotel ran two diesel pool heaters during the event week). The system creates a new `data_quality = measured` line item for 198 tCO2e, marks the original `superseded`, increments the `total_co2e_tonnes` on a "revised" snapshot by 56 tCO2e, and surfaces a "Published snapshot delta" alert to ESGO and MPL. MPL then publishes a one-paragraph erratum on the FMF website and updates the regulatory filing if the filing window (90 days) has not closed.

### E. Third-Party Integrations

- **AWS IoT Core:** Subscribes to electricity meter MQTT topics from Schneider PowerLogic IoT gateways installed at the three primary venues. Data flow: meter -> AWS IoT Core (TLS) -> Kafka `esg.carbon.telemetry.raw` -> stream processor -> `carbon_emission_line_item` (one line item per meter per 15-minute interval). Backfill from Modbus registers when telemetry gaps exceed 5 minutes.
- **Salesforce Net Zero Cloud:** Bi-directional carbon ledger sync. Data flow: `carbon_emission_line_item` -> Salesforce Net Zero Cloud (REST API, hourly) for consolidation with the Forum's year-round corporate carbon account; Salesforce Net Zero Cloud -> this subsystem (nightly) for any corporate-overhead allocation back to the event.
- **Microsoft Cloud for Sustainability (Sustainability Manager):** Optional alternative to Net Zero Cloud for Forum tenants on Microsoft-only stacks. Connector pattern identical.
- **DEFRA Greenhouse Gas Conversion Factors API:** Annual pull of the UK government's published conversion factors (released in June each year). Data flow: DEFRA CSV -> Integration Hub parser -> `emission_factor` table with `source_authority = defra`. ESGO reviews each new factor before activation.
- **US EPA Emission Factors Hub:** Annual pull of US-published factors, used as the default for any factor where the host country is the United States or where DEFRA lacks a suitable factor (e.g., specific aviation fuel blends).
- **Pachama:** Reforestation and afforestation offset marketplace. Data flow: ESGO selects project in Pachama UI -> API call to Pachama to retire tonnes -> registry serial returned -> `carbon_offset` record created with `linked_line_item_ids`. Retirement is irrevocable.
- **Climeworks:** Direct Air Capture (DAC) offset purchases. Data flow: ESGO specifies tonnage -> Climeworks API order placement -> monthly storage certificate -> `carbon_offset` with `project_type = dac`. Higher unit cost (US$ 500-1,000/tCO2e) but applies the "permanent removal" tag.
- **Gold Standard Registry and Verra (VCS):** Searchable registries for verifying retirement serials of credits purchased outside Pachama/Climeworks. Read-only via public registry APIs.
- **FlightAware:** Aircraft tail-number and route lookup used to refine attendee air-travel line items when the attendee provides a flight number (more accurate than great-circle distance, because it captures actual routing with layovers).
- **OpenSky Network:** Open-source flight tracker used as a fallback when FlightAware API quota is exhausted.
- **Google Maps Distance Matrix API:** Attendee ground-transport distances (hotel-to-venue, airport-to-hotel) computed from geocoded addresses.
- **Kafka topics:** Publishes the events enumerated in Section A. Subscribes to `registration.confirmed` (Module 6.1) to seed an estimated attendee-travel line item at registration time, `registration.cancelled` to retract the same, `transport.fleet.audit` (Module 8.4) to consume diesel and petrol logs from the motorcade fleet, `supplier.delivery.confirmed` (Module 8.2) for freight emissions per shipment, `po.payment_released` (Module 9.3) to estimate embedded carbon per procurement category using an EEIO (environmentally-extended input-output) factor table, and `fnb.menu.published` (Module 8.3) to compute catering emissions per menu item based on ingredient-level factors.

### F. UI/UX Notes

The ESGO's primary screen is a four-quadrant dashboard. Top-left: a live tCO2e counter broken down by scope (Scope 1 / 2 / 3) with the Scope 3 sub-breakdown (Air Travel, Hotel, Catering, Materials, Freight, Waste) shown as a stacked bar across event days. Top-right: the "Offset Coverage" gauge showing retired tonnes vs total emissions, color-coded green at >= 100%, amber at 75-99%, red below 75%. Bottom-left: the "Reconciliation Queue" listing every line item with `data_quality = estimated` or `superseded`, sorted by absolute tCO2e magnitude, with a one-click "Open primary source" deep-link to the source artifact in S3. Bottom-right: the "Emission Factor Library" browser with filtering by `source_authority`, `valid_from`, `activity_unit`, and a "compare" mode showing side-by-side kg_per_unit across two factor versions.

The ED's War Room tile shows three numbers: live total tCO2e, retired offset tonnes, and net residual emissions. Clicking the tile opens a read-only view of the ESGO dashboard with edit controls hidden and a "Methodology Notes" side drawer summarizing the active factor library versions.

The ATT Mobile App surface shows the attendee's personal estimated footprint (their air travel + their hotel stay + their share of venue electricity per day) with a comparison to the event median, and a "Go further" deep-link to Pachama or Climeworks for personal offset purchases. The ATT view deliberately does not show the venue-aggregate number to avoid deflecting personal accountability.

The FAL's finance surface integrates offset purchases into the standard AP workflow, with offset vendor invoices routed through the same three-way match as any other supplier per Module 9.3.

### G. Failure Modes & Offline Behavior

- **AWS IoT Core telemetry loss for a meter:** The system detects gaps longer than 5 minutes, falls back to the prior 7-day rolling average consumption for that meter (multiplied by the elapsed time), flags the line items with `data_quality = estimated` and `estimation_method = "meter_rolling_average_proxy"`, and dispatches a Field Volunteer task in the Staff App to perform a manual meter reading within 4 hours. When the manual reading is logged, the system back-calculates the average consumption during the gap.
- **DEFRA emission factor API unavailable during a methodology refresh:** The system retains the prior year's factors in the `emission_factor` table with `valid_to` set to the date the new factors were expected; line items computed during the gap use the prior factors with a "factor version stale" banner surfaced to ESGO. Once the new factors are ingested, ESGO chooses whether to retroactively recompute line items in the active snapshot (default: do not recompute, to preserve the audit trail).
- **Pachama or Climeworks API outage during an offset purchase:** The offset-purchase workflow queues the request in a durable local store with the order parameters (project ID, tonnage, beneficiary) preserved; once the API recovers, the order is submitted with the original idempotency key. The ESGO sees a "pending offset purchase" tile in the dashboard with a retry countdown.
- **Post-event travel survey response rate below 30%:** The system triggers a Tier-2 estimation pass that replaces estimated line items with a stratified sample-based uplift factor (per attendee `pax_type` and `nationality`), with the methodology documented in the snapshot's `methodology_version` field. ESGO can override this with a manual estimation choice captured in `audit_log`.
- **Salesforce Net Zero Cloud sync failure (network partition):** The Integration Hub retains a 14-day outbound queue; once connectivity returns, the queue drains in order. Inbound syncs (corporate overhead allocations) are deferred until both sides confirm the partition is resolved, to prevent double counting of corporate-overhead emissions.
- **Methodology version conflict between active and superseded snapshots:** If a published snapshot uses factors that have since been retired from the library, the system continues to render the published snapshot using the historical factors stored in the snapshot's `methodology_version` field; the UI shows a "frozen methodology" indicator and prohibits edits.
- **Offset retirement fraud (duplicate serial surfaced by registry):** A nightly reconciliation job pulls every `carbon_offset.registry_serial` from the source registry API; if a serial appears twice across events or across tenants, the system flags both records, reverses the offset coverage in the affected snapshot, and pages ESGO.

### H. Acceptance Criteria

- **Given** an attendee registers with nationality "AU" but no origin airport, **When** the registration-time travel survey is incomplete, **Then** the system creates a `carbon_emission_line_item` with `data_quality = estimated` and `estimation_method = "nationality_capital_proxy"` using the host-country capital (Canberra) as proxy origin and the DEFRA long-haul economy factor, and enrolls the attendee in a post-event survey that, on submission, reconciles the line item within 60 seconds.
- **Given** a partner hotel's emissions disclosure is delayed 60 days past event close, **When** the actual disclosure arrives with kWh and propane figures higher than the star-rating proxy estimate, **Then** the system creates a new `data_quality = measured` line item, marks the original line item `superseded`, increments the snapshot's `total_co2e_tonnes` by the delta, and surfaces a "Published snapshot delta" alert to ESGO and MPL with a one-click "Publish erratum" workflow.
- **Given** a 15-minute electricity telemetry interval is missed for a plenary hall meter, **When** the gap exceeds 5 minutes, **Then** the system falls back to the rolling 7-day average for that meter, flags the resulting line item with `data_quality = estimated`, and dispatches a Staff App task to a Field Volunteer to log a manual meter reading within 4 hours, with the manual reading back-calculating the gap interval on submission.
- **Given** an ESGO purchases 500 tCO2e of Climeworks DAC offsets, **When** the Climeworks retirement certificate arrives, **Then** the system creates a `carbon_offset` record with `project_type = dac`, applies the "permanent removal" tag in the linked line items, and increases the snapshot's `offset_coverage_ratio` by the retired tonnage, with the remaining residual emissions visible in red on the dashboard gauge.
- **Given** DEFRA releases the 2025 emission factor set on June 1, **When** the ESGO ingests the new factor library, **Then** line items with `period_start` on or after June 1 automatically use the new factors, line items computed before June 1 retain the prior factors in the audit trail, and the snapshot's `methodology_version` field records both versions for transparency.
