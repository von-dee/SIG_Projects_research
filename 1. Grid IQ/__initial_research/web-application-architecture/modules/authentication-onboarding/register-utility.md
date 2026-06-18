# Register Utility Workspace

## Page Title & Description
Workspace intake page for utilities, ministries, DFI-sponsored pilots, and implementation partners requesting a GridIQ deployment.

## User Roles & Access Control
- Guest users can submit an intake request.
- GridIQ platform administrators can review submissions in the back office.
- No production utility workspace is provisioned automatically without administrator approval.

## UI/UX Component Breakdown
- Multi-step registration form.
- Organisation identity section.
- Country, regulator, and ECOWAS member-state selectors.
- Primary contact and executive sponsor fields.
- Deployment model selector: software-only, pilot, enterprise, DFI-funded.
- Data-readiness checklist.
- Consent checkboxes for data processing and verification contact.

## User Actions & Interactions
- Save progress locally while the guest completes the form.
- Submit request for review.
- Upload supporting documents such as mandate letters, DFI programme references, and utility approval notes.
- Show confirmation with a tracking reference and expected response window.

## Data Requirements & State
- Captures utility name, country, service area, customer count, meter vendors, baseline NTL estimate, billing system, SCADA/GIS maturity, and sponsor contact.
- Stores uploaded files as pending onboarding evidence.
- Creates a provisional workspace record with `pending_review` status.

## Navigation & Routing
- Successful submission routes to `/register/confirmation`.
- Existing workspace domains route users back to `/login`.
- Invalid or duplicate requests display recoverable inline errors.
- Privacy and terms links open `/privacy` and `/terms`.

