# Security And Compliance

## Page Title & Description
Security And Compliance centralizes MFA policy, SSO, data retention, PII handling, audit logs, data residency, consent policy, and governance settings required for sensitive reputation intelligence.

## User Roles & Access Control
- Organization Owners, Security Admins, Compliance Admins, and Platform Admins can manage settings.
- Auditors can view logs and policies if granted.
- Standard Members can only view personal security settings elsewhere.

## UI/UX Component Breakdown
- MFA enforcement controls and SSO configuration summary.
- Data residency selector and encryption status indicators.
- Data retention policies for raw audio, transcripts, mentions, exports, uploads, and audit logs.
- PII detection and redaction policy controls.
- Consent and community submission governance settings.
- Audit log viewer with filters for user, action, object, date, and severity.

## User Actions & Interactions
- Enforcing MFA prompts all non-compliant users at next login.
- Updating retention policy shows impact estimate and requires confirmation.
- Changing PII policy affects future ingestion and can trigger reprocessing job.
- Exporting audit logs creates a secure downloadable file.
- Configuring SSO opens identity provider setup and metadata exchange.

## Data Requirements & State
- Fetch security policy, SSO config, MFA compliance, retention settings, PII rules, audit logs, data residency, and compliance attestations.
- Capture policy changes, confirmations, reprocessing requests, SSO metadata, and audit exports.
- Preserve policy version history and effective dates.

## Navigation & Routing
- Links to `/auth/mfa-setup`, `/settings/team`, `/settings/integrations`, and `/settings/audit-logs`.
- Policy change conflict remains inline.
- Unauthorized access routes to `/system/403`.
