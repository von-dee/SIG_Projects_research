> Module 5: Commercial & Exhibition Management → 5.2 Exhibitor Operations

## Exhibitor Operations
### Purpose and access
Provides each exhibitor a self-service fulfillment portal and lets operations govern build-up. Exhibitor admins manage their company; contractors access assigned jobs; floor managers approve exceptions.
### Data model
| Entity | Fields and relationships |
|---|---|
| `booth` | `id UUID`, `contract_id FK`, `hall_id FK`, `area_sqm numeric`, `build_status enum` |
| `fulfillment_item` | `id UUID`, `contract_id FK`, `service_code text`, `due_at timestamptz`, `status enum` |
| `contractor_pass` | `id UUID`, `person_id FK`, `booth_id FK`, `valid_from timestamptz`, `valid_to timestamptz` |
### Rules and integrations
- IF mandatory insurance or method statement is missing, THEN block contractor pass activation.
- IF a service deadline has passed, THEN show paid late-order terms before accepting the order.
- Edge case: booth transfer requires both outgoing and incoming authorized signatories and preserves prior audit history.

Integrate floor-plan inventory from AutoCAD/ExpoCAD exports, payments from Adyen, and delivery windows with venue dock scheduling.
### UX, resilience, acceptance
Portal uses a completion checklist and booth map; floor app scans contractor passes offline against a signed allow-list.

- Incomplete compliance blocks pass issuance.
- Late orders show their surcharge before confirmation.
- Transfer preserves original contract trail.
