# Terms of Service

## Page Title & Description
Public legal page defining acceptable use, user responsibilities, service limitations, data rights, investigation disclaimers, and liability boundaries.

## User Roles & Access Control
- Public guests and authenticated users can view.
- Administrators manage terms versions through governance workflows.
- Users may be required to re-accept updated terms during profile setup.

## UI/UX Component Breakdown
- Terms content sections.
- Effective date and version.
- Critical-infrastructure acceptable-use notice.
- Investigation and anomaly disclaimer.
- Download PDF button.
- Link to privacy policy.

## User Actions & Interactions
- Read terms.
- Download PDF.
- Navigate to privacy policy.
- Authenticated users can view accepted version metadata in profile settings.

## Data Requirements & State
- Fetches current terms, effective date, version, jurisdictional addenda, and acceptance requirement.
- Captures no data on this public page.
- Acceptance records are captured during login/profile workflows when required.

## Navigation & Routing
- `/terms` links to `/privacy`, `/login`, and `/profile-setup` when re-acceptance is required.
- Missing terms version shows latest active approved version.

