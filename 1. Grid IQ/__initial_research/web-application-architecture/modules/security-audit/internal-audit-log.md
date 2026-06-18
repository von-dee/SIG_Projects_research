# Internal Audit Log

## Page Title & Description
Immutable audit view showing sensitive activity across login, alert access, assignments, investigations, reports, EIS submissions, model governance, and administration.

## User Roles & Access Control
- Auditors and security administrators can view.
- Management can view summary dashboards if permitted.
- No user can edit or delete audit rows.

## UI/UX Component Breakdown
- Append-only audit table.
- Filters for user, action, resource type, date range, IP, and severity.
- Event detail drawer.
- Integrity status indicator.
- Export request workflow if policy allows.
- Restricted-event masking.

## User Actions & Interactions
- Search and filter audit events.
- Open event detail.
- Create audit review note.
- Request export with approval.
- Jump to related resource if authorised.

## Data Requirements & State
- Fetches audit events, users, resources, integrity hashes, masking rules, and review notes.
- Captures review notes and export requests.
- Enforces append-only storage and restricted visibility.

## Navigation & Routing
- `/audit-log` links to `/alerts/:id`, `/queue/:id`, `/eis`, `/settings/users`, and `/cybersecurity`.
- Unauthorised linked resources show `/403`.

