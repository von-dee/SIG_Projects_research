# 07 — Configuration and release scope

## Configuration is data

The following are tenant-scoped, versioned configuration objects: methods, workflow stages, batch templates, QC rule sets, parser profiles, ID schemes, role policies, visibility policies, rounding conventions, label layouts, and report templates. An authorised change creates a new configuration version and audit event; it never edits prior versions in place.

Every run, measurement, QC evaluation, result, and report stores the IDs/versions that governed it. Recalculating history therefore uses its original rules, not today’s settings.

## Deployment posture

The lab site runs without WAN dependency: browser clients and field sync on LAN; one modular application and PostgreSQL edge server; append-only outbox for eventual cloud aggregation; capture agents on instrument PCs. Site owns laboratory records; cloud owns configuration. Configuration is applied explicitly and version-pinned at site.

## Release boundary

| Release | Included |
| --- | --- |
| V1 | Receipt/reconciliation/status; transformation graph/mass; trays/QC; balance, AAS and LECO capture; parser profiles; blind controls; approval/re-assay/audit; identity/labels; field app; PDF/Excel/export; doré/bullion; legacy importer. |
| V2 | acQuire exchange after discovery; expanded consumable tracking; asset calibration register; refiner outturn reconciliation; cloud aggregation/multi-site/TAT dashboards; external/umpire lab comparison if confirmed. |
| V3 | Commercial lab jobs/invoicing; plant metal accounting; instrument worklist push; anomaly detection once enough clean system data exists. |

## Discovery gates

Before estimation or final integration design: instrument makes/models/output formats, instrument-PC OS and install rights, acQuire version/exchange method, throughput, on-site doré versus bullion process, power/network/backup arrangements, historical data quality, and current report examples.
