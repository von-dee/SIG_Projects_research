# Maintenance Mode

## Page Title & Description
System availability page shown during planned maintenance, emergency downtime, or read-only mode.

## User Roles & Access Control
- All users can view maintenance status.
- Administrators may access a limited maintenance console.
- Emergency operations users may receive read-only continuity links.

## UI/UX Component Breakdown
- Maintenance status banner.
- Expected restoration time.
- Impacted services list.
- Read-only availability indicator.
- Contact and incident reference.
- Administrator console link if authorised.

## User Actions & Interactions
- Refresh status.
- Open read-only dashboard if available.
- Subscribe to restoration notification.
- Administrators update public maintenance message.

## Data Requirements & State
- Fetches maintenance window, impacted services, status, ETA, incident reference, and read-only endpoints.
- Captures subscription request and admin updates.
- Logs admin maintenance-message changes.

## Navigation & Routing
- `/maintenance` links to read-only `/dashboard` or `/map` if enabled.
- Full app routes redirect here when maintenance flag is active.

