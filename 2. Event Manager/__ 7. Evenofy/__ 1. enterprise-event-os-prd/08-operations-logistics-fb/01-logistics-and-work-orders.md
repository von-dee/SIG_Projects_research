> Module 8: Operations, Logistics & F&B Management → 8.1 Logistics and Work Orders

## Logistics and Work Orders
### Purpose and access
Coordinates assets, loading, staffing, and corrective work between venue, suppliers, and operations. Leads assign work; suppliers update assigned orders; Safety approves high-risk activities.
### Data model
| Entity | Fields and relationships |
|---|---|
| `work_order` | `id UUID`, `type enum`, `location_id FK`, `priority enum`, `status enum`, `assignee_org_id FK?`, `sla_due_at timestamptz` |
| `asset` | `id UUID`, `tag text`, `type enum`, `location_id FK`, `owner_org_id FK`, `condition enum` |
| `delivery_slot` | `id UUID`, `dock_id FK`, `start_at timestamptz`, `end_at timestamptz`, `vehicle_plate text`, `status enum` |
### Rules and integrations
- IF a delivery has no slot, THEN deny dock entry except an Ops-approved emergency override.
- IF a P1 work order exceeds its SLA, THEN page the vendor manager and display on the command center.
- Edge case: a moved asset retains custody chain and cannot be simultaneously checked into two locations.

Connect dock systems, RFID/barcode scanners, and ServiceNow/UpKeep through adapters.
### UX, resilience, acceptance
Floor map supports tap-to-create work orders and technician checklists; dock tablet runs a locally cached schedule during outage.

- Unscheduled delivery is denied with escalation route.
- Custody transfer records both responsible parties.
- SLA breach creates one deduplicated escalation.
