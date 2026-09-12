> Module 5: Commercial & Exhibition Management → 5.1 Sales, Contracts and Inventory

## Sales, Contracts and Inventory
### Purpose and access
Controls sellable sponsorship and exhibition inventory from offer through contractual fulfillment. Sales owns opportunities; Legal approves clauses; Finance approves concessions; exhibitors see only their agreement.
### Data model
| Entity | Fields and relationships |
|---|---|
| `commercial_inventory` | `id UUID`, `event_id FK`, `type enum`, `location_id FK?`, `price decimal`, `status enum` |
| `opportunity` | `id UUID`, `organization_id FK`, `owner_id FK`, `stage enum`, `forecast decimal` |
| `contract` | `id UUID`, `opportunity_id FK`, `version int`, `value decimal`, `currency char(3)`, `status enum` |
### Rules and integrations
- IF inventory is on a signed contract, THEN reserve it and prevent a second proposal from claiming it.
- IF a discount exceeds delegated authority, THEN route to Finance before signature.
- Edge case: an expired hold releases automatically unless a legal-review exception is active.

Sync opportunities with Salesforce/Dynamics and execute contracts via DocuSign/Adobe Sign; only signed webhook events reserve inventory.
### UX, resilience, acceptance
Sales sees an inventory map and quote builder with live availability; legal sees redline versions. Vendor outage makes contracts `pending verification`, not signed.

- Signed inventory cannot be double-sold.
- An excessive discount cannot bypass approval.
- Contract webhook replay does not duplicate a reservation.
