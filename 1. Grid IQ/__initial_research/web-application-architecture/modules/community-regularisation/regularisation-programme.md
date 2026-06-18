# Regularisation Programme

## Page Title & Description
Programme management page for converting informal or theft-linked customers into legitimate, metered, paying accounts through structured offers and community-safe workflows.

## User Roles & Access Control
- Management, operations, community teams, administrators, and auditors can view.
- Community programme managers can configure offers.
- Field agents can refer eligible cases.

## UI/UX Component Breakdown
- Programme KPI cards.
- Eligible cases table.
- Offer configuration panel.
- Community area map.
- Conversion funnel.
- Follow-up task list.
- Risk and social-licence notes.

## User Actions & Interactions
- Create regularisation campaign.
- Approve customer for formal connection, payment plan, amnesty, or meter replacement.
- Assign community follow-up.
- Track converted customers.
- Export programme results.

## Data Requirements & State
- Fetches eligible alerts, customer records, zones, campaign rules, conversion outcomes, payment-plan status, and engagement notes.
- Captures offer terms, approvals, referrals, and conversion outcomes.
- Links converted customers back to ROI and social-impact reporting.

## Navigation & Routing
- `/regularisation` links to `/regularisation/customer-intake`, `/community-engagement`, `/queue/:id`, and `/dfi-impact-pack`.
- Sensitive enforcement cases require political-risk review before campaign inclusion.

