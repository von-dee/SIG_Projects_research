> Module 10: Marketing, PR & Media Center → 10.1 Campaigns and Press

## Campaigns and Press
### Purpose and access
Plans audience acquisition and manages accredited media communications. Marketers create campaigns; PR approves press material; media desk verifies accreditation; consent controls exports.
### Data model
| Entity | Fields and relationships |
|---|---|
| `campaign` | `id UUID`, `segment_rule jsonb`, `channel enum`, `status enum`, `owner_id FK`, `consent_purpose enum` |
| `press_contact` | `person_id PK/FK`, `outlet_id FK`, `accreditation_state enum`, `embargo_ack_at timestamptz?` |
| `press_asset` | `id UUID`, `title text`, `embargo_until timestamptz?`, `approval_state enum`, `uri text` |
### Rules and integrations
- IF a recipient lacks current marketing consent, THEN exclude them from campaign send and record exclusion count.
- IF an embargo has not elapsed, THEN prevent external download and display release time in venue timezone.
- Edge case: verified journalists may receive operational alerts without marketing consent when this is a documented legitimate operational purpose.

Sync consented contacts with HubSpot/Marketo, send through Twilio SendGrid, and distribute assets via a signed CDN.
### UX, resilience, acceptance
Campaign builder displays eligible audience estimate and suppression reasons; media portal shows accreditation state and embargo timer. Send provider outages queue rather than duplicate sends.

- Non-consented contact cannot be sent marketing.
- Embargoed asset cannot download early.
- Webhook retries do not duplicate a campaign delivery.
