> Module 9: Finance & Administration Module → 9.1 Budget, Procurement and AP

## Budget, Procurement and AP
### Purpose and access
Provides controlled budget commitments and supplier payment workflow. Budget owners request; Procurement tenders; Finance approves; auditors read immutable history.
### Data model
| Entity | Fields and relationships |
|---|---|
| `budget_line` | `id UUID`, `event_id FK`, `cost_center text`, `approved decimal`, `committed decimal`, `actual decimal`, `currency char(3)` |
| `purchase_order` | `id UUID`, `supplier_id FK`, `budget_line_id FK`, `amount decimal`, `status enum`, `approver_chain jsonb` |
| `invoice` | `id UUID`, `po_id FK?`, `supplier_invoice_no text`, `amount decimal`, `match_state enum`, `status enum` |
### Rules and integrations
- IF a PO exceeds available budget, THEN block approval unless a authorized reforecast is approved.
- IF invoice value differs from PO or receipt beyond tolerance, THEN place it in exception review.
- Edge case: duplicate supplier invoice number is rejected per supplier and legal entity, not globally.

Integrate SAP/Oracle/NetSuite for ledger posting and OCR via Azure Document Intelligence; only ERP posting ID makes an invoice paid.
### UX, resilience, acceptance
Budget view exposes approved, committed, actual, and forecast variance; approvers receive a spend and evidence summary. ERP outage queues verified postings.

- Over-budget PO cannot become approved.
- Three-way match exceptions are visible before payment.
- ERP replay never posts twice.
