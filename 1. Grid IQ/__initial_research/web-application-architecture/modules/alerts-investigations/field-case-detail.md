# Field Case Detail

## Page Title & Description
Mobile-friendly investigation page used by field teams to inspect assigned cases, navigate to sites, record outcomes, and submit evidence.

## User Roles & Access Control
- Assigned field agents and their supervisors can update.
- Operations, management, and auditors can view.
- External viewers cannot access field evidence unless explicitly approved.

## UI/UX Component Breakdown
- Case header with account, zone, priority, and estimated loss.
- GPS and directions button.
- Safety and political-risk warning panel.
- Evidence checklist.
- Outcome form.
- Photo upload placeholder.
- Notes and signature fields.
- Offline sync status.

## User Actions & Interactions
- Mark arrived.
- Record outcome: confirmed, false positive, inconclusive, customer absent, unsafe, escalated.
- Upload photos or documents.
- Add notes and recommended follow-up.
- Submit case and trigger model feedback.

## Data Requirements & State
- Fetches case, alert, customer, zone, GPS, risk flags, prior history, required evidence, and offline cache.
- Captures arrival time, outcome, notes, photos, follow-up date, and agent identity.
- Writes investigation outcome and related audit events.

## Navigation & Routing
- `/queue/:id` links to `/alerts/:id`, `/zones/:id`, `/regularisation/customer-intake`, and map navigation.
- Offline submissions remain pending until sync succeeds.

