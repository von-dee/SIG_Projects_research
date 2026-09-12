# Workflow overview

## Purpose

Track a ~3 kg drill-core interval through preparation, fire assay, quality assurance, and client reporting while retaining a defensible chain of custody, full material lineage, and an explicit history of every batch in which the sample was worked.

## Stages and hand-offs

| # | Stage | Accountable user | Batch context | Individual-sample outcome | Required record |
| --- | --- | --- | --- | --- | --- |
| 01 | [Field sampling](stages/01-field-sampling.md) | Field geologist | Submission batch | Interval → sealed field sample | Submission / chain of custody |
| 02 | [Receiving & login](stages/02-receiving-login.md) | Receiving clerk | Submission manifest / receiving run | Field sample → lab ID; accepted, held or rejected individually | Sample intake log |
| 03 | [Drying](stages/03-drying.md) | Prep technician | Oven run and shelf position | Wet sample → dried sample with dry mass | Drying log |
| 04 | [Crushing & splitting](stages/04-crushing-splitting.md) | Prep technician | Crusher/split run | Dried sample → work split + retrievable reject | Crush / split worksheet |
| 05 | [Pulverising](stages/05-pulverising.md) | Prep technician | Mill run | Coarse split → qualified pulp or regrind hold | Pulverising & sieve QC form |
| 06 | [Charge weigh-out](stages/06-charge-weigh-out.md) | Assay technician | Charge-loading list | Pulp → accepted charge + archive pulp | Charge weigh ticket |
| 07 | [Fusion](stages/07-fusion.md) | Assay technician | Assay batch, tray and crucible position | Charge + flux → position-linked lead button | Furnace batch sheet |
| 08 | [Cupellation](stages/08-cupellation.md) | Assay technician | Cupellation run and cupel position | Lead button → position-linked prill | Cupellation log |
| 09 | [Finish](stages/09-finish.md) | Assay technician | Analytical run / sequence | Prill → provisional sample result | Finish & prill weight record |
| 10 | [QA review](stages/10-qa-review.md) | Senior chemist / QA | Batch controls + member results | Approved, held, rejected or rerun per sample | QA review checklist |
| 11 | [Reporting](stages/11-reporting.md) | LIMS administrator | COA release set | Approved individual result → released COA line | Certificate of Analysis |

## Status model

`Collected → Received → Drying → Prepared → Pulp QC passed → Charged → Fused → Cupelled → Finished → QA pending → Approved/Rejected → Reported`

A rejection, identification mismatch, damaged container, failed grind, failed control, or missing record puts the affected sample or batch into **Hold**. The LIMS records the scope explicitly: a member hold blocks one sample; a batch hold blocks the scoped members until an authorised resolution is recorded.
