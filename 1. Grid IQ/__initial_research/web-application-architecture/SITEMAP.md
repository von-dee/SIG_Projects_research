# GridIQ Web Application Architecture Sitemap

GridIQ West Africa is a web application for ECOWAS distribution utilities, DFI partners, regulators, field teams, and auditors. The application converts prepaid meter data, IoT feeder readings, investigation outcomes, and utility performance records into live loss intelligence, revenue-recovery workflows, EIS reporting, predictive maintenance prioritisation, and impact accountability.

## Directory Tree

```text
└── /web-application-architecture
    ├── SITEMAP.md
    └── /modules
        ├── /authentication-onboarding
        │   ├── login.md
        │   ├── register-utility.md
        │   ├── mfa-verification.md
        │   ├── password-recovery.md
        │   └── profile-setup.md
        ├── /dashboard-workspace
        │   ├── executive-dashboard.md
        │   ├── operations-workspace.md
        │   └── notification-center.md
        ├── /grid-monitoring
        │   ├── live-loss-map.md
        │   ├── zone-drill-down.md
        │   ├── digital-twin-viewer.md
        │   └── outage-reliability-view.md
        ├── /loss-analytics
        │   ├── anomaly-intelligence.md
        │   ├── meter-token-analytics.md
        │   ├── revenue-loss-model.md
        │   └── model-feedback-loop.md
        ├── /alerts-investigations
        │   ├── alert-feed.md
        │   ├── alert-detail.md
        │   ├── investigation-queue.md
        │   ├── field-case-detail.md
        │   └── political-risk-escalation.md
        ├── /reporting-compliance
        │   ├── monthly-performance-report.md
        │   ├── impact-roi-tracker.md
        │   ├── eis-export.md
        │   ├── dfi-impact-pack.md
        │   └── pilot-controls.md
        ├── /asset-iot-operations
        │   ├── asset-registry.md
        │   ├── sensor-fleet-management.md
        │   ├── gateway-connectivity.md
        │   └── predictive-maintenance.md
        ├── /community-regularisation
        │   ├── regularisation-programme.md
        │   ├── customer-case-intake.md
        │   └── community-engagement.md
        ├── /administration-settings
        │   ├── user-management.md
        │   ├── team-management.md
        │   ├── utility-profile.md
        │   ├── billing-subscriptions.md
        │   ├── api-integrations.md
        │   └── notification-preferences.md
        ├── /security-audit
        │   ├── internal-audit-log.md
        │   ├── data-governance.md
        │   ├── cybersecurity-center.md
        │   └── access-denied.md
        └── /system-fallback
            ├── not-found-404.md
            ├── maintenance-mode.md
            ├── offline-low-bandwidth.md
            ├── privacy-policy.md
            └── terms-of-service.md
```

## Primary User Flow

1. Guest user registers a utility workspace or logs in with MFA.
2. Authenticated user lands on the role-appropriate dashboard.
3. Operations users monitor the live loss map, inspect zone drill-downs, and triage alerts.
4. Field agents work investigation queues, record outcomes, and feed confirmed results back into the model loop.
5. Management reviews monthly performance, recovered revenue, pilot controls, and DFI-ready impact packs.
6. Auditors inspect immutable logs, data governance controls, internal fraud patterns, and EIS submission history.
7. Administrators manage users, teams, utility settings, subscriptions, integrations, and notification rules.

