> Module 3: B2B / G2G Matchmaking & Meeting Hub → 3.2 Meeting Operations

## Meeting Operations
### Purpose and access
Allocates scarce rooms and captures consented outcomes. Hosts edit outcomes; hub staff assign rooms; sponsors only receive aggregate activation metrics.
### Data model
| Entity | Fields and relationships |
|---|---|
| `meeting_room` | `id UUID`, `capacity int`, `features text[]`, `zone_id FK`, `status enum` |
| `meeting` | `id UUID`, `request_id FK`, `room_id FK`, `start_at timestamptz`, `end_at timestamptz`, `checkin_state enum` |
| `meeting_outcome` | `id UUID`, `meeting_id FK`, `author_id FK`, `category enum`, `notes text`, `shareable bool` |
### Rules and integrations
- IF a room becomes unavailable, THEN propose equivalent rooms and notify both parties; do not silently relocate a diplomatic meeting.
- IF a participant checks in twice within five seconds, THEN deduplicate the second scan.
- Edge case: a no-show is recorded only after the 10-minute grace window and can be disputed by the host.

Integrate room panels through Condeco/Robin APIs and QR readers through the access service.
### UX, resilience, acceptance
Hub staff see a room grid and swap drawer; participants see a discreet meeting card. Offline hub tablets locally verify bookings and later reconcile scans.

- Double check-in creates one attendance record.
- Room conflict cannot be saved.
- Outcome notes remain private unless marked shareable.
