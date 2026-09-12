# 01 — Workflow and user journeys

## Process sequence

| Stage | Primary user | Activity | Required record / screen | Output / state gate |
| --- | --- | --- | --- | --- |
| Dispatch | Field geologist | Collects interval, adds requested work and any field controls, transfers custody. | Dispatch / COC | FieldSample(s); dispatch can sync later. |
| Receipt | Receiving clerk | Reconciles physical bags to dispatch or creates provisional records. | Receipt & reconciliation | `Received` or `Receipt hold`. |
| Drying | Prep technician | Runs oven cycle and records dry mass. | Drying event | `Dried`; mass flag reviewed if needed. |
| Crush and split | Prep technician | Makes working split and retained reject. | Transformation event | Child split and reject, with mass balance. |
| Pulverise | Prep technician | Produces pulp and tests P80. | Grind event + sieve QC | `Pulp QC passed` or `Regrind`. |
| Charge | Assay technician | Creates measured test portion, archives remainder. | Charge weigh event | `Charged`; mass is within tolerance. |
| Fusion | Assay technician | Builds a configured tray and records every position. | Furnace batch / tray | Lead buttons linked to positions. |
| Cupellation | Assay technician | Turns each button into a prill. | Cupellation run | Prill is recovered. |
| Finish | Assay technician | Weighs/parts or dissolves and reads prill. | Finish record + captured measurement | Technical result is complete. |
| QA | Manager / senior chemist | Evaluates lab QC and process flags; signs a disposition. | QA review | Batch approved, held, quarantined, or rerun. |
| Report | LIMS administrator | Issues current approved results to the client/geology system. | Versioned COA/export | Immutable released report. |
| Bar chain | Assayer / production user | Records melt, bar, bar sample and fineness. | Melt/bar records + assay chain | Fineness linked to numbered bar. |

## Detailed user flow: dispatch and receipt

1. The field geologist creates a dispatch offline, adds field samples with hole/from/to/type/collector/requested work, and selects control visibility per insert where authorised.
2. The field app preserves the dispatch locally. On arrival it synchronises to the lab edge server over LAN; if unavailable, a QR manifest is scanned. If neither arrives, receipt continues provisionally.
3. The receiving clerk scans or types the bag identifier, checks physical condition and gross wet mass, then matches it to the dispatch (or marks it provisional).
4. When a dispatch later arrives, the reconciliation process reports missing, unexpected, and mismatched samples. No historic receipt is overwritten.

## Detailed user flow: preparation and assay

1. At every bench, the technician scans/types the current material identity and chooses the approved method configuration. The system creates an **event** and a child material node rather than changing the parent in place.
2. The technician records measured mass-in, mass-out, operator, timestamp, equipment, and retained material location. The LIMS evaluates configured material-balance expectations and creates a flag when required.
3. The assay technician creates a charge/test portion from passed pulp. The remaining pulp stays archived and retrievable.
4. For fusion, the operator creates a batch from a versioned tray template. Each sample, CRM, blank and duplicate occupies a first-class tray position; after charge enters a crucible, identity is tray + position—not a furnace label.
5. During finish, the operator confirms the expected material/position before committing a live reading. Worklist-driven and sequence-driven binding are both supported configuration choices.

## Detailed user flow: QA and reporting

1. The QA reviewer opens a technically complete batch. They cannot be the person who produced the result they approve.
2. They review lab control evaluations, prep flags, regrinds, deviations, calculations, and re-assays against configuration versions bound at execution time.
3. An approval uses re-authentication and captures the meaning of signature, exact reviewed versions, reviewer, and time. A held/quarantined batch cannot report.
4. The report user selects only current approved results and generates a versioned COA plus machine-readable export. A reissue creates a visible successor; a re-assay remains linked and carries its flag.

## State transitions and exception routes

`Provisional/Dispatched → Received → Prepared → Pulp QC passed → Charged → In batch → Finished → QA pending → Approved → Reported`

- ID discrepancy, physical damage, or unresolved reconciliation: **receipt hold**.
- Material-balance anomaly: **process hold/review**, retaining the recorded event.
- Failed P80: **regrind**, with new QC event; failed value remains visible.
- Failed lab QC: configured **warn, hold, or quarantine** action; QA investigates/reruns.
- Failed blind submitter QC: notify the submitter; do not hold the laboratory batch, as that would reveal the control.
- Correction or re-assay: create a new result/report version with a `supersedes` link and reason.
