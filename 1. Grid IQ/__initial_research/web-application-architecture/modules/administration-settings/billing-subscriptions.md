# Billing & Subscriptions

## Page Title & Description
Commercial administration page for DFI-funded contracts, utility subscriptions, hardware leases, managed-service fees, and success-bonus terms.

## User Roles & Access Control
- Platform administrators, finance users, and management can view.
- Only finance administrators can edit commercial terms.
- DFI viewers see contract deliverables and approved billing evidence only.

## UI/UX Component Breakdown
- Subscription or grant agreement summary.
- Invoice and payment status table.
- Hardware lease inventory.
- Success-bonus calculation panel.
- Contract milestone tracker.
- Currency and sovereign-payment risk indicator.

## User Actions & Interactions
- View invoices and contract milestones.
- Update billing contact.
- Record payment status.
- Generate success-bonus evidence.
- Export commercial summary.

## Data Requirements & State
- Fetches contract terms, payer type, invoices, payment status, hardware lease records, ROI evidence, milestones, and currency assumptions.
- Captures billing updates, invoice notes, and export requests.
- Separates commercial data from operational alert permissions.

## Navigation & Routing
- `/settings/billing` links to `/roi`, `/dfi-impact-pack`, `/reports`, and `/settings/utility`.
- Missing payer configuration displays onboarding checklist.

