# 09 — Finish

**Role:** Assay technician  
**Record:** [Finish & prill weight record](../forms/09-finish-prill-weight-record.md)  
**Outcome:** A complete technical result ready for QA review.

**Batch handling:** The finish sequence groups the run, but raw data and provisional result are captured per prill/sample. Technical completion is therefore a member status, not an assumption based on the whole batch finishing.

## User flow

1. Scan the prill and select the approved finish route: gravimetric parting or dissolution followed by ICP/AAS.
2. Weigh the prill on the identified microbalance; capture tare, gross/net values as required.
3. For gravimetric finish, perform parting and enter post-parting weight/calculation inputs. For ICP/AAS, record dissolution, dilution, instrument sequence, calibration, and raw read.
4. Let the LIMS calculate the provisional result using the approved method version; review completeness and flags.
5. Mark the result technically complete and submit its batch to QA. Do not report from this stage.

## Form fields entered

Prill ID, finish method/version, microbalance ID, prill weight, parting data or dissolution/dilution data, ICP/AAS instrument ID and run/sequence, raw signal/read, calculation inputs, provisional result/unit, operator, timestamp, and technical-completion status.

## Controls and hand-off

- Raw readings and calculation versions are retained with the result.
- Any manual amendment needs a reason, authorisation, and a new version.
