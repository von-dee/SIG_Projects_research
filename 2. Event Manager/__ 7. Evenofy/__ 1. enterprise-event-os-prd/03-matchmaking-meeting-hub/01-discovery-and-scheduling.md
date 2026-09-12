> Module 3: B2B / G2G Matchmaking & Meeting Hub → 3.1 Discovery and Scheduling

## Discovery and Scheduling
### Purpose and access
Matches opted-in delegates and organizations, then schedules mutually acceptable meetings. Attendees control visibility; organization admins manage their delegates; meeting hosts manage their own invitations.
### Data model
| Entity | Fields and relationships |
|---|---|
| `match_profile` | `person_id PK/FK`, `interests text[]`, `seeking text[]`, `visibility enum`, `availability jsonb` |
| `match_score` | `id UUID`, `subject_id FK`, `candidate_id FK`, `score numeric`, `explanation jsonb`, `model_version text` |
| `meeting_request` | `id UUID`, `host_id FK`, `invitee_id FK`, `slot tstzrange`, `status enum`, `room_id FK?` |
### Rules and integrations
- IF either party is not opted in, THEN never create or expose a match.
- IF two accepted requests overlap, THEN hold the earliest confirmed slot and return alternatives for the later one.
- Edge case: a delegate's assistant can schedule only if the delegate has granted scheduling authority.

Sync availability with Microsoft Graph/Google Calendar through delegated consent, and use a transparent rules-based score before ML ranking.
### UX, resilience, acceptance
The app shows explainable match cards, availability picker, and conflict-free alternatives. Calendar writes are queued if the provider is unavailable; the internal booking remains provisional.

- Hidden profiles do not appear in search or recommendations.
- Acceptance creates one internal booking and idempotent calendar invitations.
- A stale calendar sync is labeled before confirmation.
