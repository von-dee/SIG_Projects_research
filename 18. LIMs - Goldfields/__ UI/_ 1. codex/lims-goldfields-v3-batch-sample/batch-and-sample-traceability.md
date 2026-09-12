# Batch and individual-sample traceability

## The operating model

The LIMS shows the operator the group being processed and the exact member in hand. A **batch** records a shared operational context; an **individual sample** retains its own identity, material chain, status and eventual reportable result.

| Object | What it groups | Created | What must stay on each member |
| --- | --- | --- | --- |
| Submission batch | Samples dispatched under one chain of custody | Field dispatch | Field ID, hole/interval, seal and each custody acceptance |
| Receiving / prep run | Samples sharing a receiving, drying, crushing or milling operation | At each prep run | Lab ID, parent material, position, mass, condition and prep outcome |
| Assay batch / tray | Charges and QC controls processed under one method and furnace run | Charge loading | Charge ID, tray/crucible position, source sample, control type and result status |
| QA review group | Completed results reviewed against the same controls | QA review | Sample-level flags, eligibility and disposition |
| COA release set | Approved client results released together | Reporting | Original hole/interval and current approved result version |

## Rules that prevent identity loss

1. A batch has a durable ID, type, method/version, owner, timestamps and a membership history.
2. Membership is an event, not a field that gets overwritten. The record captures added/removed time, position, actor and reason.
3. A batch-level hold blocks its unresolved members. A sample-level hold blocks only that sample unless QA explicitly expands the scope.
4. All material transformations remain parent-to-child links: field sample → lab sample → dried sample → split/reject → pulp → charge → button → prill → result.
5. Controls are members of the assay batch but are never reported as client samples. Duplicates retain a link to the original sample.
6. QA approves or rejects both the batch evaluation and the eligibility of every member. The COA reads individual approved results, not a batch average or batch label.

## What users see at every stage

| Stage | Batch view | Individual-sample view | Handoff rule |
| --- | --- | --- | --- |
| Field dispatch | Submission batch and all sealed bags | Hole/interval, field ID, seal, expected mass | Receiving scans each bag and accepts, holds or rejects it independently. |
| Receiving | Submission manifest / receiving run | Lab ID, condition, wet mass and custody result | Accepted samples enter a drying run; held samples remain visible but cannot be assigned forward. |
| Drying | Oven run with shelf positions | Source lab ID, shelf, dry mass, state | Completion releases only samples with a complete dry record. |
| Crushing / split | Crusher or split run | Parent, work split, reject, mass balance and locations | The working split advances; the reject remains retrievable against the same sample. |
| Pulverising | Mill run | Split, pulp, sieve result and regrind history | Only passed pulps are eligible for charge selection. |
| Weigh-out | Charge-loading list | Pulp, charge ID, actual mass and tolerance | Accepted charges become named assay-batch members. |
| Fusion and cupellation | Assay batch, tray and position map | Charge → button → prill and every observed exception | Position travels with the member and is never inferred from order. |
| Finish | Analytical run / sequence | Prill, raw reading, calculation and provisional result | Technical completion is set per sample. |
| QA | Batch dashboard with controls and exceptions | Individual result, flags, disposition and rerun link | Approval is recorded per eligible result after the batch control assessment. |
| Reporting | COA release set | Original interval and approved result version | Release selects approved individual results only. |

## Holds, reruns and partial completion

- If one bag is mismatched, only that sample is on intake hold; the remaining submission members can proceed.
- If one pulp fails P80, it leaves the prep run for regrind. Its prior test remains evidence, and its siblings remain unaffected.
- If a control fails, QA places the assay batch on hold and identifies the affected sample positions. A rerun creates a new charge and new assay-batch membership; it never erases the first run.
- A partial batch can close only with a disposition for every member: complete, transferred to a later batch, held, voided or rerun.

## Mandatory batch-member fields

Every batch-member row carries: batch ID/type; member material or control ID; source sample ID; position where relevant; membership status; entered/removed timestamps; actor; method/configuration version; hold or exception reference; and links to output material/result IDs. The sample detail page displays its complete batch history in chronological order.
