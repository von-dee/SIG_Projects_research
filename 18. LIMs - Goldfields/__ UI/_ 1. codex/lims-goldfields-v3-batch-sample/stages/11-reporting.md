# 11 — Reporting

**Role:** LIMS administrator  
**Record:** [Certificate of Analysis](../forms/11-certificate-of-analysis.md)  
**Outcome:** A released client-facing COA tied to the original drill-hole intervals.

**Batch handling:** The COA is a release set, not a batch result. It selects individually approved result versions and shows every sample's original interval; held, rejected and superseded members are excluded.

## User flow

1. Select only results with current QA approval and confirm client/project/reporting scope.
2. Compile each result with its original hole ID, from depth, to depth, method, unit, and required qualifiers.
3. Generate a controlled COA version, validate completeness, and apply the release authorisation.
4. Release through the approved delivery channel; record recipient, release time, and immutable report identifier.
5. If corrected later, create a superseding COA that cites the original report and amendment reason; never overwrite the released document.

## Form fields entered

COA number/version, client/project, issued date/time, result IDs, original hole/interval, analyte, method, result/unit/qualifier, QA approval reference, report compiler/releaser, delivery recipient/channel, amendment/supersession reference.

## Controls and hand-off

- A COA must never contain held, rejected, or superseded result versions.
- Released reports are immutable records in the lineage graph.
