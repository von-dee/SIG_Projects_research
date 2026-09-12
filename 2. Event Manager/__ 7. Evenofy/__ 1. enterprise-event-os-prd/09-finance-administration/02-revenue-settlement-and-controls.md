> Module 9: Finance & Administration Module → 9.2 Revenue, Settlement and Controls

## Revenue, Settlement and Controls
### Purpose and access
Reconciles registration, sponsorship, exhibitor, and onsite revenue with strict segregation of duties. AR owns invoices; Treasury reconciles; Finance Controller closes periods.
### Data model
| Entity | Fields and relationships |
|---|---|
| `receivable` | `id UUID`, `organization_id FK?`, `registration_id FK?`, `amount decimal`, `due_date date`, `status enum` |
| `payment` | `id UUID`, `provider_reference text`, `amount decimal`, `currency char(3)`, `state enum`, `received_at timestamptz` |
| `reconciliation` | `id UUID`, `payment_id FK`, `ledger_reference text`, `status enum`, `reviewer_id FK` |
### Rules and integrations
- IF payment currency differs from invoice currency, THEN create an FX variance item using approved daily rate source.
- IF a user created a receivable, THEN they cannot approve its write-off.
- Edge case: chargeback temporarily revokes paid entitlement only after a configurable grace and review policy.

Use Adyen/Stripe webhooks, bank statement import, and ERP GL APIs.
### UX, resilience, acceptance
Finance sees exception queues and a close checklist. Provider webhook outages show pending state and prevent unverified manual settlement.

- Creator cannot approve their own write-off.
- Chargeback follows configured grace workflow.
- Reconciliation requires ledger evidence.
