# Workflow overview

## Purpose

Track a ~3 kg drill-core interval through preparation, fire assay, quality assurance, and client reporting while retaining a defensible chain of custody and full material lineage.

## Stages and hand-offs

| # | Stage | Accountable user | Input → output | Required record | Exit condition |
| --- | --- | --- | --- | --- | --- |
| 01 | [Field sampling](stages/01-field-sampling.md) | Field geologist | Drill-core interval → sealed field sample | Submission / chain of custody | Sample is uniquely identified and dispatched. |
| 02 | [Receiving & login](stages/02-receiving-login.md) | Receiving clerk | Field sample → lab sample ID/barcode | Sample intake log | Identity, condition and wet mass are accepted. |
| 03 | [Drying](stages/03-drying.md) | Prep technician | Wet sample → dried sample | Drying log | Dry mass is captured; sample is ready for prep. |
| 04 | [Crushing & splitting](stages/04-crushing-splitting.md) | Prep technician | Dried sample → assay split + reject | Crush / split worksheet | Reject is retrievable and split is identified. |
| 05 | [Pulverising](stages/05-pulverising.md) | Prep technician | Coarse split → qualified pulp | Pulverising & sieve QC form | P80 result meets the configured specification. |
| 06 | [Charge weigh-out](stages/06-charge-weigh-out.md) | Assay technician | Pulp → weighed charge + archive pulp | Charge weigh ticket | Charge is within mass tolerance. |
| 07 | [Fusion](stages/07-fusion.md) | Assay technician | Charge + flux → lead button | Furnace batch sheet | Furnace run is complete and controls are placed. |
| 08 | [Cupellation](stages/08-cupellation.md) | Assay technician | Lead button → precious-metal prill | Cupellation log | Prill is recovered and traceable. |
| 09 | [Finish](stages/09-finish.md) | Assay technician | Prill → analytical result | Finish & prill weight record | Result is calculated/read and technically complete. |
| 10 | [QA review](stages/10-qa-review.md) | Senior chemist / QA | Completed batch → approved or rejected batch | QA review checklist | QA disposition is recorded. |
| 11 | [Reporting](stages/11-reporting.md) | LIMS administrator | Approved result → released COA | Certificate of Analysis | Client-facing report is released. |

## Status model

`Collected → Received → Drying → Prepared → Pulp QC passed → Charged → Fused → Cupelled → Finished → QA pending → Approved/Rejected → Reported`

A rejection, identification mismatch, damaged container, failed grind, failed control, or missing record puts the affected sample or batch into **Hold**. It cannot move forward until an authorised resolution is recorded.
