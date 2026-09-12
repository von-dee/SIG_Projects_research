# 04 — QC, trays, and blind controls

## Configured tray model

A batch is a tray with addressable positions, not an unordered list. Its versioned template defines tray capacity, control classes/positions, insertion rate, and method-specific rules. A `Position` holds a test portion or control insertion and retains that address through fusion, cupellation, and finish.

| Control | Owner | Visibility to lab | Effect of failure |
| --- | --- | --- | --- |
| Lab CRM | Lab | Visible | Configured warn, hold, or quarantine of batch. |
| Lab blank | Lab | Visible | Configured warn, hold, or quarantine of batch. |
| Lab duplicate | Lab | Visible | Configured warn, hold, or quarantine of batch. |
| Submitter/geology control | Submitter | Visible, blind, or retained | Evaluated separately; blind/retained failure routes to submitter and does not gate lab approval. |

## Blind-control modes

- **Visible:** lab sees control class and lot. Used for lab inserts.
- **Blind:** lab receives an ordinary sample; control identity reveals only at a configured event, normally approval.
- **Retained:** identity never reveals to lab; only submitter and auditor can see evaluation.

The submitting party sets visibility. Precedence is insert → dispatch → tenant default; a locked tenant policy can prevent lab visibility entirely. Lab users may never change it.

## Leak-prevention requirements

Blindness is enforced in data access, not as a UI hide/show rule. Lab-scoped queries return blind controls as ordinary samples without control attributes. The same restriction applies to exports, search, reports, validation messages, counts, and audit queries.

Blind inserts use normal identifiers, are included in normal sample counts, carry plausible requested work, and are scattered rather than placed at a detectable exact interval. A blind-control failure cannot create a lab-visible batch hold or explanatory re-assay reason.

## QC evaluation record

Each `QCEvaluation` stores: control/material ID, owner stream, result, lot certificate ID with certified value and standard deviation, rule-set version, evaluated timestamp, outcome, action, reviewer/automation identity, and follow-up reference. CRM lot handling is V1 because an evaluation cannot be reproduced without its certificate.
