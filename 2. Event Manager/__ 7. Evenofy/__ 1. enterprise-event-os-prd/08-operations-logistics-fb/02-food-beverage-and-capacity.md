> Module 8: Operations, Logistics & F&B Management → 8.2 Food, Beverage and Capacity

## Food, Beverage and Capacity
### Purpose and access
Plans service volume, dietary safety, and room capacity. F&B managers edit menus and forecasts; caterers confirm production; health/safety can halt a service.
### Data model
| Entity | Fields and relationships |
|---|---|
| `service_period` | `id UUID`, `location_id FK`, `start_at timestamptz`, `forecast_covers int`, `capacity int`, `status enum` |
| `menu_item` | `id UUID`, `service_period_id FK`, `allergens text[]`, `dietary_tags text[]`, `quantity int` |
| `queue_observation` | `id UUID`, `service_period_id FK`, `observed_at timestamptz`, `wait_seconds int`, `source enum` |
### Rules and integrations
- IF an allergen declaration changes after production starts, THEN freeze service item and require F&B safety acknowledgement.
- IF capacity is reached, THEN stop new access recommendations and direct users to alternate service areas.
- Edge case: dietary counts are aggregated and never reveal an individual's condition to catering staff.

Ingest access counts, POS totals from Oracle Simphony, and supplier delivery updates.
### UX, resilience, acceptance
Service console shows covers forecast, stock, allergens, and queue trend; attendee app receives only aggregate availability. Manual counts can be captured offline.

- Changed allergen data blocks unsafe service.
- Capacity redirection lists valid alternatives.
- Staff cannot view named dietary data without a justified workflow.
