> Module 7: Mobile App (Attendee & Staff Facing) → 7.2 Staff Field Operations

## Staff Field Operations
### Purpose and access
Enables volunteers and staff to execute assigned work safely in the field. Supervisors assign work; staff act only on assigned zones and masked data; Incident Command may broadcast critical instructions.
### Data model
| Entity | Fields and relationships |
|---|---|
| `field_task` | `id UUID`, `type enum`, `zone_id FK`, `assignee_id FK`, `priority enum`, `status enum`, `due_at timestamptz` |
| `field_checkin` | `id UUID`, `task_id FK`, `at timestamptz`, `device_at timestamptz`, `evidence_uri text?` |
| `device_registration` | `id UUID`, `user_id FK`, `device_key text`, `trust_state enum`, `last_sync_at timestamptz` |
### Rules and integrations
- IF task ownership changes, THEN revoke old offline details at next sync and notify both users.
- IF a staff member presses SOS, THEN create a P1 candidate with coarse location and call-back details.
- Edge case: task completion with a photo queues encrypted evidence and remains `pending_sync` until upload hashes validate.

Integrate Teams/Push-to-Talk where licensed and MDM for device compliance.
### UX, resilience, acceptance
The app is a sorted task queue with large action buttons, offline banner, and escalation shortcut. It encrypts local data and wipes it on device revocation.

- Staff cannot open another zone's restricted task.
- SOS produces an auditable escalation.
- Evidence sync failure does not mark a task fully complete.
