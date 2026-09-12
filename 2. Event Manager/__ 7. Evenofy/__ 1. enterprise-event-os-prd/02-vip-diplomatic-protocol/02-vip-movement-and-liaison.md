> Module 2: VIP & Diplomatic Protocol Management → 2.2 VIP Movement and Liaison

## VIP Movement and Liaison
### Purpose and access
Coordinates discreet itineraries, transport, security handoffs, and liaison actions. Assigned liaisons see their principal only; Security sees route and risk state; Protocol leads approve itinerary changes.
### Data model
| Entity | Fields and relationships |
|---|---|
| `itinerary_leg` | `id UUID`, `person_id FK`, `start_at timestamptz`, `end_at timestamptz`, `origin_id FK`, `destination_id FK`, `status enum` |
| `movement_task` | `id UUID`, `leg_id FK`, `assignee_id FK`, `checklist jsonb`, `completed_at timestamptz?` |
| `vehicle_assignment` | `id UUID`, `leg_id FK`, `vehicle_id FK`, `driver_id FK`, `security_level enum` |
### Rules and integrations
- IF an itinerary change is within 30 minutes of departure, THEN require Protocol and Security acknowledgement before dispatch.
- IF a liaison misses two location check-ins, THEN alert their supervisor without exposing the principal's precise position broadly.
- Edge case: GPS location is rounded to a safe zone for liaison peers and purged on configured retention.

FlightAware provides flight status, fleet dispatch may use Samsara, and secure messaging uses Microsoft Teams or a private push channel.
### UX, resilience, acceptance
Liaison mobile view is a next-action card with check-in buttons, contacts, and offline route pack. QR check-ins work offline and sync with device timestamps.

- Unauthorized users cannot query a dignitary itinerary.
- Late flight updates trigger a proposed, not automatic, downstream replan.
- Offline check-ins remain visible locally and reconcile idempotently.
