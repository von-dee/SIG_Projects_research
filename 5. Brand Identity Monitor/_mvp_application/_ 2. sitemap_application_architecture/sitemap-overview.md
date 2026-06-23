# Application Sitemap Overview

## Page Title & Description
Application Sitemap Overview documents the complete BrandWatch Africa web application information architecture as a file-and-folder blueprint. It is the navigation map for product, design, engineering, QA, and implementation teams.

```text
└── /application_architecture
    ├── sitemap-overview.md
    └── /modules
        ├── /authentication-onboarding
        │   ├── register.md
        │   ├── login.md
        │   ├── password-recovery.md
        │   ├── mfa-setup.md
        │   ├── mfa-verify.md
        │   ├── profile-setup.md
        │   └── organization-setup.md
        ├── /dashboard-workspace
        │   ├── executive-dashboard.md
        │   ├── analyst-workspace.md
        │   └── onboarding-checklist.md
        ├── /source-ingestion
        │   ├── connect-sources.md
        │   ├── radio-stations.md
        │   ├── file-upload-mapping.md
        │   └── source-health.md
        ├── /sentiment-intelligence
        │   ├── sentiment-overview.md
        │   ├── mention-detail.md
        │   ├── human-review-queue.md
        │   ├── model-tuning.md
        │   ├── brand-assistant.md
        │   └── ai-visibility.md
        ├── /community-risk
        │   ├── community-heatmap.md
        │   ├── community-detail.md
        │   ├── community-registry.md
        │   └── field-observation.md
        ├── /mentions-search
        │   ├── mention-feed.md
        │   ├── query-builder.md
        │   ├── transcript-browser.md
        │   └── competitor-benchmarking.md
        ├── /alerts-response
        │   ├── alert-queue.md
        │   ├── create-alert-rule.md
        │   └── incident-war-room.md
        ├── /reports-esg
        │   ├── report-builder.md
        │   ├── esg-reporting.md
        │   ├── regulatory-tracker.md
        │   └── report-library.md
        ├── /settings-administration
        │   ├── user-profile.md
        │   ├── team-management.md
        │   ├── billing-subscriptions.md
        │   ├── integrations.md
        │   ├── security-compliance.md
        │   └── api-keys.md
        ├── /api-integrations
        │   ├── api-documentation.md
        │   ├── webhook-management.md
        │   └── data-exports.md
        └── /system-legal
            ├── not-found.md
            ├── forbidden.md
            ├── maintenance.md
            ├── privacy-policy.md
            ├── terms-of-service.md
            └── system-status.md
```

## User Roles & Access Control
- Guest users can access public authentication, privacy, terms, status, and recovery flows.
- Authenticated users are routed according to organization role, workspace, subscription, and data-sharing rules.
- Chamber users can access sector-level and anonymized member intelligence.
- Member Company users can access their own company data and approved benchmarks.
- Platform Admins have restricted support and implementation access with full audit logging.

## UI/UX Component Breakdown
- Nested module tree that maps epics to folders and pages to markdown files.
- Route family summary for authentication, dashboard, ingestion, intelligence, risk, alerts, reporting, settings, integrations, and system pages.
- Role-based navigation model for Executive, Analyst, ESG, Communications, Community Relations, Legal, Field Team, Admin, and Viewer users.
- Cross-module flow references for onboarding, monitoring, investigation, response, reporting, and administration.

## User Actions & Interactions
- Product and engineering teams use this page to locate the authoritative page specification for each screen.
- Designers use the tree to validate primary navigation, secondary navigation, and workflow entry points.
- QA uses the file list to derive route coverage and permission test matrices.
- Implementation teams update individual page files when route behavior or data contracts change.

## Data Requirements & State
- This overview does not render production application data.
- It references the architecture implied by source documents in the current folder: Ghana Chamber proposal, mining intelligence system design, sentiment analysis extension, business model, roadmap, and MVP notes.
- The state model assumes multi-tenant organizations, role-based access control, audited actions, source connectors, processed mentions, community scores, alerts, reports, and integrations.

## Navigation & Routing
- Primary app entry routes: `/auth/register`, `/auth/login`, `/dashboard`, `/mentions/feed`, `/community/heatmap`, `/alerts/queue`, `/reports/library`, and `/settings/user-profile`.
- System routes: `/system/404`, `/system/403`, `/system/maintenance`, `/system/status`, `/legal/privacy`, and `/legal/terms`.
- Onboarding completion routes users from registration through MFA, profile, organization setup, source configuration, and dashboard readiness.
