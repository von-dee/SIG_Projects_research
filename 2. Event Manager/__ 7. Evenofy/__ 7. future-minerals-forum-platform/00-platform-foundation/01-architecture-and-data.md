# Architecture & Canonical Data

The platform is a modular web system with a shared identity, event, organisation, person/delegation, credential, venue/zone, programme/session, meeting, transaction, content asset, task/incident, consent, and audit model. Modules own their workflows but exchange stable identifiers and versioned events through an integration layer. Operational dashboards consume timestamped projections rather than directly mutating source systems.

## Integration boundaries

Use adapters for badge hardware, RFID/QR scanners, print services, CAD/floorplan tools, hotel and flight feeds, payment providers, finance ERP, SMS/email/push, AV/interpretation systems, and dispatch/radio. Every integration needs idempotency keys, replayable events, status monitoring, and a manual fall-back procedure.
