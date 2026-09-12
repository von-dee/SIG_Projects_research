> Module 2: VIP & Diplomatic Protocol Management → 2.1 Protocol Ranking and Seating

## Protocol Ranking and Seating
### Purpose and access
Prevents protocol breaches through controlled seniority, conflict, and seating rules. Protocol Officers edit profiles; Chief of Protocol approves exceptions; Security sees only movement-relevant restrictions.
### Data model
| Entity | Fields and relationships |
|---|---|
| `dignitary_profile` | `person_id PK/FK`, `rank int`, `title text`, `delegation_id FK`, `sensitivity enum`, `conflict_tags text[]` |
| `seat` | `id UUID`, `venue_area_id FK`, `row int`, `position int`, `rank_ceiling int`, `attributes jsonb` |
| `seat_assignment` | `id UUID`, `seat_id FK`, `person_id FK`, `status enum`, `approved_by FK?` |
### Rules and integrations
- IF a person rank exceeds a seat's `rank_ceiling`, THEN block assignment unless an exception has two approvers.
- IF two conflict tags are incompatible, THEN prohibit adjacent seats and shared holding rooms.
- Edge case: equal rank uses the event's configured bilateral-precedence order; if absent, flag for manual decision rather than alphabetize silently.

Import passport/identity verification from an approved KYC provider only with consent; synchronize safe seating zones to access control, never diplomatic notes.
### UX, resilience, acceptance
Seat map uses rank bands and conflict halos; sensitive labels are redacted unless the viewer has protocol clearance. A signed PDF seating pack is available offline, while electronic changes require connectivity.

- Invalid rank or adjacency saves are blocked with a reason.
- Approved exception is logged with both approvers.
- Changing a conflict tag revalidates existing assignments.
