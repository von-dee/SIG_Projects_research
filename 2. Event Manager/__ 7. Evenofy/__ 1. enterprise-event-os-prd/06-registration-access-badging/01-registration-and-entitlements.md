> Module 6: Registration, Access Control & Badging → 6.1 Registration and Entitlements

## Registration and Entitlements
### Purpose and access
Captures registrations, consent, eligibility and paid or complimentary entitlements. Registrants manage their own submission; agents verify records; approvers decide exceptions; Privacy Officers handle requests.
### Data model
| Entity | Fields and relationships |
|---|---|
| `registration` | `id UUID`, `person_id FK`, `event_id FK`, `type enum`, `status enum`, `submitted_at timestamptz` |
| `entitlement` | `id UUID`, `registration_id FK`, `access_profile_id FK`, `valid_from timestamptz`, `valid_to timestamptz`, `state enum` |
| `consent` | `id UUID`, `person_id FK`, `purpose enum`, `version text`, `granted bool`, `at timestamptz` |
### Rules and integrations
- IF eligibility evidence is incomplete, THEN registration remains `action_required` and no credential is issued.
- IF consent is withdrawn, THEN stop its downstream marketing export within 24 hours while retaining legally required transaction records.
- Edge case: a duplicate email is merged only after verified ownership; otherwise create a review case to avoid merging namesakes.

Use Adyen/Stripe for payment, Persona/Onfido where identity checking is justified, and CRM consent sync through the integration hub.
### UX, resilience, acceptance
Registration is a saved-progress form with contextual evidence upload and status timeline. Kiosk intake issues a queue token offline, but cannot approve restricted categories.

- Ineligible registration cannot generate a credential.
- Consent withdrawal propagates to marketing export.
- Duplicate resolution records reviewer and evidence.
