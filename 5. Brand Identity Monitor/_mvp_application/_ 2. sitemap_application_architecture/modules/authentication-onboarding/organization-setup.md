# Organization Setup

## Page Title & Description
Organization Setup configures the tenant baseline: industry, monitoring scope, regions, member companies or sites, and governance model. For the Ghana Chamber of Mines pilot, this is where sector-level, corridor-level, or member-consortium setup is selected.

## User Roles & Access Control
- Organization Owners and Admins can complete or edit organization setup.
- Invited Members can view only the organization summary after setup.
- Platform Admins can assist with setup through an impersonation-audited support flow.

## UI/UX Component Breakdown
- Organization profile form with legal name, industry, headquarters country, and data residency preference.
- Pilot model selector: Sector Pulse, Corridor Pilot, Member Consortium Pilot, or Company Workspace.
- Region and site selector for Ghana mining corridors, countries, districts, communities, and mine assets.
- Stakeholder taxonomy checklist covering host communities, traditional leaders, media, regulators, NGOs, employees, contractors, and investors.
- Initial topic taxonomy selector for environment, employment, compensation, safety, local content, regulation, galamsey association risk, CSR, and social license.
- Setup summary card showing included sources, users, and reporting cadence.

## User Actions & Interactions
- Selecting a pilot model changes required setup fields and default dashboards.
- Adding a mine site creates monitored asset records and prompts catchment community setup.
- Selecting topics initializes project tags, default risk weights, and report templates.
- Saving creates the first monitoring project and routes the user to source configuration.
- Leaving setup early saves a draft and displays an onboarding task in the dashboard.

## Data Requirements & State
- Fetch available countries, regions, districts, languages, industries, source packages, and subscription tier capabilities.
- Capture organization metadata, governance model, pilot scope, monitored sites, stakeholder taxonomy, topic taxonomy, and reporting cadence.
- Create `organization`, `workspace`, `project`, `mine_site`, `topic_taxonomy`, `stakeholder_group`, and `onboarding_state` records.

## Navigation & Routing
- Success redirects to `/sources/connect`.
- Draft save redirects to `/dashboard?setup=incomplete`.
- Missing required governance data remains on page with section-level errors.
- Subscription restriction routes to `/settings/billing` or sales contact workflow.
