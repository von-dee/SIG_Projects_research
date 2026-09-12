# 06 — Doré, bullion, and reporting

## Doré and bullion chain

`Production period → Melt → numbered bar → gross mass → bar sample → assay chain → fineness`

Doré and bullion use the same model. The LIMS stores the assay evidence supporting a purity certificate; it does not confer refiner accreditation or Good Delivery status. A bar must have a serial, gross mass, source melt, sample identity, and current fineness result.

## Reporting process

1. Select only result versions with a current QA approval and valid upstream lineage.
2. Render branded PDF and Excel from the same report dataset and versioned tenant template.
3. Include hole/from/to, method, analyte, result, unit, qualifier, result version, and re-assay flag where applicable.
4. Generate machine-readable export alongside human-readable output for geology import.
5. Electronically release the COA. A reissue visibly supersedes the earlier issue with a reason.

## Report controls

- Release must block held, rejected, incomplete, or superseded results.
- Template, rounding convention, and report configuration are version-pinned to the issued COA.
- Released PDF, Excel, payload/export, recipient, timestamp, and signature/release identity are retained.
- Later correction preserves the earlier report and creates a successor link.

## Later scope: outturn reconciliation

V2 can compare mine doré assay and refiner return assay by melt/bar/period, calculate variance, attach outturn evidence, and surface unresolved differences. This is deliberately distinct from an accreditation claim.
