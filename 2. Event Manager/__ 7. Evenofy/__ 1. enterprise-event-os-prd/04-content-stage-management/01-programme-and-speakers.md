> Module 4: Content & Stage Management System → 4.1 Programme and Speakers

## Programme and Speakers
### Purpose and access
Maintains an approved public agenda and speaker readiness record. Content producers edit drafts, speakers approve bios/releases, and Programme Directors publish.
### Data model
| Entity | Fields and relationships |
|---|---|
| `session` | `id UUID`, `event_id FK`, `title text`, `start_at timestamptz`, `stage_id FK`, `status enum`, `visibility enum` |
| `speaker_slot` | `id UUID`, `session_id FK`, `person_id FK`, `role enum`, `confirmation enum`, `requirements jsonb` |
| `content_approval` | `id UUID`, `entity_type text`, `entity_id UUID`, `version int`, `approver_id FK`, `status enum` |
### Rules and integrations
- IF a public session lacks a published approval, THEN it cannot enter the mobile feed.
- IF a speaker withdraws, THEN mark their slot unavailable and flag downstream bio, travel, seating, and cue dependencies.
- Edge case: timezone changes are forbidden after publishing; display uses venue time plus attendee-local conversion.

Import speaker CRM data from Salesforce and publish approved agenda to the mobile CMS through versioned APIs.
### UX, resilience, acceptance
Producers use a conflict-aware agenda grid; speakers use a secure confirmation link. Cached public agenda remains read-only during outage.

- A published session has an approved version.
- Speaker withdrawal creates dependency alerts.
- Attendee view converts, but does not alter, venue time.
