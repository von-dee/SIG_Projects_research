# Goldfields LIMS workflow documentation

This folder describes the end-to-end fire-assay sample journey from drill core to a released Certificate of Analysis (COA). It is written as an operational blueprint for a LIMS and its lineage graph.

## Reading order

1. [Workflow overview](workflow-overview.md) gives the process and hand-offs.
2. [End-to-end activity flow](activity-flow.md) describes the complete user journey and exception routes.
3. [Lineage graph model](lineage-graph.md) defines the assets, relationships, and form-derived edge properties.
4. Open the relevant page in [stages](stages/) for a role-specific working procedure.
5. Use the matching template in [forms](forms/) to design or configure the LIMS record.

## Folder map

```text
docs/lims-goldfields/
├── README.md
├── workflow-overview.md
├── activity-flow.md
├── lineage-graph.md
├── stages/
│   ├── 01-field-sampling.md … 11-reporting.md
└── forms/
    ├── 01-sample-submission-chain-of-custody.md … 11-certificate-of-analysis.md
```

## Core rule

Every process event is entered once in its source record. The LIMS creates the lineage relationship from that record; it must not ask users to re-key operator, timestamp, or instrument details into a separate lineage screen.
