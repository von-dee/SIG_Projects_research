> Module 11: ESG & Sustainability Tracker → 11.1 Impact Data and Targets

## Impact Data and Targets
### Purpose and access
Measures environmental and social outcomes against approved methodology. ESG leads configure factors; suppliers submit evidence; auditors review but cannot alter source data.
### Data model
| Entity | Fields and relationships |
|---|---|
| `impact_target` | `id UUID`, `event_id FK`, `metric text`, `baseline numeric`, `target numeric`, `unit text`, `owner_id FK` |
| `activity_record` | `id UUID`, `category enum`, `quantity numeric`, `unit text`, `source_id FK`, `occurred_at timestamptz` |
| `emission_factor` | `id UUID`, `methodology text`, `version text`, `factor numeric`, `unit text`, `effective_from date` |
### Rules and integrations
- IF a factor version changes, THEN preserve prior calculations and recalculate a separately versioned scenario.
- IF submitted activity lacks required evidence, THEN label it estimated and exclude it from assured totals.
- Edge case: attendee travel estimates use aggregated origin bands and never retain precise itinerary data for ESG analysis.

Import utility meter, waste contractor, travel aggregate, and procurement data; align calculations with GHG Protocol guidance.
### UX, resilience, acceptance
ESG dashboard shows target, measured, data quality, and evidence gaps. Supplier forms support offline draft and later upload.

- Factor revisions do not overwrite historical reported values.
- Missing evidence is visibly excluded from assured total.
- Travel reporting exposes only approved aggregates.
