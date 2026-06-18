# Cybersecurity Center

## Page Title & Description
Security operations page tracking authentication risk, IoT device security, credential rotation, incident response, vulnerability status, and compliance readiness.

## User Roles & Access Control
- Security administrators, platform administrators, and auditors can view.
- Management sees high-level security posture.
- Operations users see only relevant device or account security tasks.

## UI/UX Component Breakdown
- Security posture score.
- Open incidents table.
- Credential rotation status.
- MFA coverage chart.
- Device firmware and secure-boot status.
- Vulnerability and penetration-test evidence panel.
- Incident response runbook links.

## User Actions & Interactions
- Open incident.
- Force password or MFA reset.
- Rotate integration credential.
- Review vulnerable devices.
- Upload security assessment evidence.
- Trigger incident notification workflow.

## Data Requirements & State
- Fetches incidents, authentication risk, device firmware status, integration credentials metadata, vulnerability records, and compliance evidence.
- Captures incident updates, rotations, forced resets, and uploaded evidence.
- Logs all security actions.

## Navigation & Routing
- `/cybersecurity` links to `/settings/api-integrations`, `/sensor-fleet`, `/internal-audit-log`, and `/data-governance`.
- Critical incidents pin notification-center alerts.

