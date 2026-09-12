> Module 11: ESG & Sustainability Tracker → 11.2 Compliance and Reporting

## Compliance and Reporting
### Purpose and access
Creates defensible reporting packs with traceable evidence and approval. ESG prepares; Legal reviews disclosures; independent assurance signs off; public users see approved summary only.
### Data model
| Entity | Fields and relationships |
|---|---|
| `evidence_item` | `id UUID`, `activity_id FK`, `uri text`, `hash text`, `classification enum`, `verified_by FK?` |
| `report_snapshot` | `id UUID`, `scope jsonb`, `calculation_version text`, `status enum`, `generated_at timestamptz` |
| `assurance_finding` | `id UUID`, `snapshot_id FK`, `severity enum`, `resolution text?`, `status enum` |
### Rules and integrations
- IF an included metric has an unresolved material finding, THEN block final report publication.
- IF source evidence changes, THEN mark dependent snapshots superseded rather than alter the issued copy.
- Edge case: supplier evidence with confidential pricing is retained but redacted from public reports.

Export to assurance workspaces and BI tools; keep immutable, hashed evidence in object storage.
### UX, resilience, acceptance
Report builder has a scope checklist, evidence completeness meter, and approve/publish gates. It remains read-only during storage outage using cached snapshots.

- Material unresolved finding blocks publication.
- Published report links to its immutable calculation version.
- Confidential evidence cannot appear in public export.
