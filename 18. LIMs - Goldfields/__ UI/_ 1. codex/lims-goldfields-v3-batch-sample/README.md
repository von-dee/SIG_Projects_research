# Goldfields LIMS workflow — batch and individual-sample traceability (V3)

This folder describes the end-to-end fire-assay journey from drill core to a released Certificate of Analysis (COA). It makes the two operational views explicit at every point: the **batch that is being worked** and the **individual sample that owns the material and result**.

A batch is a controlled working group, never a replacement identity for its members. A sample can move between batches or be rerun; its material lineage, custody, state, result version and exception history remain attached to that individual sample.

## Reading order

1. [Workflow overview](workflow-overview.md) gives the process and hand-offs.
2. [Batch and sample traceability](batch-and-sample-traceability.md) defines the batch types, membership rules, and stage-by-stage behaviour.
3. [End-to-end activity flow](activity-flow.md) describes the complete user journey and exception routes.
4. [Lineage graph model](lineage-graph.md) defines the assets, relationships, and form-derived edge properties.
4. Open the relevant page in [stages](stages/) for a role-specific working procedure.
5. Use the matching template in [forms](forms/) to design or configure the LIMS record.

## Folder map

```text
docs/lims-goldfields/
├── README.md
├── workflow-overview.md
├── batch-and-sample-traceability.md
├── activity-flow.md
├── lineage-graph.md
├── stages/
│   ├── 01-field-sampling.md … 11-reporting.md
└── forms/
    ├── 01-sample-submission-chain-of-custody.md … 11-certificate-of-analysis.md
```

## Core rule

Every process event is entered once in its source record. The LIMS creates both the batch-membership event and the material-lineage relationship from that record; it must not ask users to re-key operator, timestamp, or instrument details into a separate lineage screen.
