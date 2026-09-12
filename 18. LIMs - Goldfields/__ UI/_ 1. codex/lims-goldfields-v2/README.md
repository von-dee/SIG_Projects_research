# Goldfields Assay Chain — architecture-aligned workflow (V2)

This is the updated workflow documentation. It incorporates the **Assay Chain Architecture pre-PRD** and supersedes the earlier workflow set as the design reference.

## What changed from the first workflow

- A material is now a **versioned lineage graph**, not a single sample record.
- Every event is bound to the versioned method, workflow, QC, ID, and report configuration that governed it.
- Batches are addressable trays, including position-level controls and provenance.
- Instrument data is captured as immutable raw payloads, then parsed server-side with versioned profiles.
- Field dispatch supports offline sync, QR manifests, provisional receipt, and reconciliation.
- Lab QC and submitter QC are separate streams; blind controls are protected below the interface.
- Results, approvals, reports, and audit events are append-only/versioned; corrections supersede rather than overwrite.
- The chain continues through melt, bar, bar sample, and fineness for doré and bullion.

## Documentation map

| Page | Purpose |
| --- | --- |
| [01 Workflow and user journeys](01-workflow-and-user-journeys.md) | Stage-by-stage activities, screens/forms, states, and hand-offs. |
| [02 Forms and record specifications](02-forms-and-record-specifications.md) | Field requirements for every operational record. |
| [03 Traceability, identity, and audit](03-traceability-identity-audit.md) | Graph, material derivations, labels, electronic signatures, and audit controls. |
| [04 QC, trays, and blind controls](04-qc-trays-and-blind-controls.md) | Batch position model, two QC streams, rule evaluation, and disposition. |
| [05 Instrument, field, and integration flows](05-capture-field-and-integration.md) | Raw capture, offline dispatch, reconciliation, acQuire boundary, and migration. |
| [06 Doré, bullion, and reporting](06-dore-bullion-and-reporting.md) | Bar chain, COA/report release, outturn reconciliation scope. |
| [07 Configuration and release scope](07-configuration-and-release-scope.md) | Configurable-by-data rules, configuration versions, V1/V2/V3 boundary. |
| [08 Activity flow](08-activity-flow.md) | End-to-end flow, exception routes, and role ownership. |

## Non-negotiable implementation rules

1. Store laboratory differences as versioned configuration data—not code branches.
2. Never overwrite evidence. Raw instrument payloads, audit events, result versions, and released reports are append-only.
3. Preserve both mass and identity across every material transformation.
4. Keep the lab operational when the field device, WAN, barcode scanner, or upstream dispatch is unavailable.
5. Enforce access restrictions, especially blind-control visibility, in the data access layer rather than only in the UI.
