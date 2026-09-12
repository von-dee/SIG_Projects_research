# 02 — Forms and record specifications

Each record is a source of lineage edge properties. `actor`, `timestamp`, `terminal`, `instrument/equipment`, `configuration_version`, and source/created material IDs are captured once here and reused everywhere.

| Record | Completed by | Mandatory fields | System-generated links |
| --- | --- | --- | --- |
| Dispatch / COC | Field geologist | dispatch ID; field sample ID; hole/from/to; type; collector; requested work; custody transfers; control ownership/visibility | FieldSample, dispatch, custody events, QR manifest |
| Receipt & reconciliation | Receiving clerk | physical ID; lab ID; gross wet mass; balance; condition; receiver; received time; match status | FieldSample/Provisional Sample, receipt event, discrepancy report |
| Drying event | Prep technician | input material; oven/run/position; method version; target/actual time/temp; dry mass; balance; operator | child dried material, derivation edge |
| Crush/split event | Prep technician | parent; crusher/splitter; work split/reject IDs and masses; retained location; cleaning; operator | child split/reject nodes, mass-balance flag |
| Pulverise + sieve QC | Prep technician | split/pulp IDs; mill/run; sieve; P80 result; spec version; pass/fail; regrind link | pulp node, QC event |
| Charge weigh | Assay technician | pulp/charge IDs; method; nominal/actual mass; tolerance; balance; archive location; status | TestPortion and archived pulp nodes |
| Furnace batch | Assay technician | batch/tray/template version; furnace/program; flux lot; positions; controls; timestamps | Batch, Position, Run, lead-button nodes |
| Cupellation run | Assay technician | button ID; batch/position; cupel; furnace/program; run time; prill condition | prill node and derivation |
| Finish record | Assay technician | prill; finish method version; microbalance; raw-read reference; calculation inputs; provisional result | Measurement(s), Result version |
| QA review | QA reviewer | batch; controls/rules/lots; flag assessment; disposition; reason; signature | QCEvaluation, approval event |
| COA / export | LIMS administrator | COA/version; selected approved result versions; recipient; issue time; template version | report node, release event |
| Melt / bar record | Production user | melt; bar serial; gross mass; bar sample; production period | Melt, Bar, BarSample, fineness chain |

## Form behaviour requirements

- **Typed-first, scanner-ready:** every identifier field accepts typed input and validates the configured check digit; USB keyboard-wedge scanners add no separate workflow.
- **No silent editing:** completed event fields are corrected by a version/amendment event, with reason and actor.
- **Evidence attachment:** certificates, photos, raw payloads, and source files are immutable attachments with checksums/references.
- **Configuration binding:** saving a record stores the exact method, parser, QC rule, template, or report configuration version used at that moment.
- **Role checks:** the same user cannot both produce and approve a result; blind-control attributes are absent from lab-scoped responses.
