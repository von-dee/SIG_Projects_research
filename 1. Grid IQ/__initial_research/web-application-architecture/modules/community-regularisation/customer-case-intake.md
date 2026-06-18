# Customer Case Intake

## Page Title & Description
Customer-facing or assisted-intake page for capturing regularisation applications, informal connection details, meter replacement requests, and affordability constraints.

## User Roles & Access Control
- Community officers, field agents, and authorised call-centre staff can create cases.
- Customers may access a limited public version if enabled by the utility.
- Auditors can view final case records.

## UI/UX Component Breakdown
- Intake form.
- Customer identity and contact fields.
- Existing meter or informal connection details.
- Affordability and tariff category selector.
- Document/photo upload.
- Consent and privacy acknowledgement.
- Case status confirmation.

## User Actions & Interactions
- Submit new case.
- Link intake to investigation or alert.
- Upload evidence.
- Schedule follow-up appointment.
- Check case status if public portal is enabled.

## Data Requirements & State
- Captures customer identity, address, GPS, contact, meter serial, connection type, affordability data, documents, consent, and linked alert ID.
- Fetches available campaigns, tariff categories, and duplicate-account warnings.
- Stores case status and follow-up tasks.

## Navigation & Routing
- `/regularisation/customer-intake` links to `/regularisation`, `/queue/:id`, and `/community-engagement`.
- Duplicate applications show merge/review workflow.

