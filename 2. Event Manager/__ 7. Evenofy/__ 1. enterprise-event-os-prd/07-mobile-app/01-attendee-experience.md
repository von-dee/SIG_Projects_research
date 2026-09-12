> Module 7: Mobile App (Attendee & Staff Facing) → 7.1 Attendee Experience

## Attendee Experience
### Purpose and access
Offers a privacy-respecting companion for agenda, navigation, credentials, and opted-in networking. Attendees edit their own profile and settings; content editors publish approved content only.
### Data model
| Entity | Fields and relationships |
|---|---|
| `app_profile` | `person_id PK/FK`, `display_name text`, `photo_uri text?`, `discoverable bool`, `preferences jsonb` |
| `saved_item` | `id UUID`, `person_id FK`, `entity_type enum`, `entity_id UUID`, `created_at timestamptz` |
| `notification` | `id UUID`, `audience_rule jsonb`, `title text`, `priority enum`, `sent_at timestamptz` |
### Rules and integrations
- IF a user disables discoverability, THEN remove them from new discovery results and existing connections see only the configured fallback.
- IF a session is changed within two hours, THEN notify saved attendees subject to push consent.
- Edge case: a QR credential is device-bound, rotates every 30 seconds, and shows a support path if clock skew exceeds tolerance.

Use Mapwize/Situm for indoor maps, Firebase/APNs for push, and the System API for all content.
### UX, resilience, acceptance
Home is a personalized next-up card, map, credential, and alert banner. Agenda, map tiles, saved credential, and essential contacts are available offline.

- Consent setting immediately changes discovery exposure.
- Time-critical agenda update reaches eligible saved users.
- Offline credential shows its freshness state.
