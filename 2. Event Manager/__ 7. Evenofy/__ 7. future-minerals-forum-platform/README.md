# Future Minerals Forum (FMF) — Event Platform Architecture

A detailed, page-by-page information architecture for an international, government-grade minerals forum. Each module and submodule is a folder; every product screen is a standalone Markdown specification.

## How to use this set

Start with the [platform foundation](./00-platform-foundation/README.md), then navigate to a module. Each page states its purpose, authorised users, interaction model, workflow, data contracts, security/resilience controls, and testable acceptance criteria.

## Module index

| Module | Primary users | Pages |
|---|---:|---:|
| [Command Center](./01-command-center/README.md) | Event Director, Operations Team, and War Room Staff | 10 |
| [Venue Operations](./02-venue-operations/README.md) | Operations Team and Venue/Facility Contractors | 9 |
| [Commercial & Finance](./03-commercial-finance/README.md) | Commercial Director and Finance Team | 6 |
| [Registration & Accreditation](./04-registration-accreditation/README.md) | Registration Team | 10 |
| [Delegations & Bilateral Meetings](./05-delegations-bilateral-meetings/README.md) | Protocol Office and Corporate Relations | 9 |
| [Content, Speakers & Media](./06-content-speakers-media/README.md) | Content Director, Stage Managers, and Press Office | 10 |
| [Exhibitor & Sponsor Portal](./07-exhibitor-sponsor-portal/README.md) | Mining houses, OEMs, and service providers | 6 |
| [Delegate Portal](./08-delegate-portal/README.md) | Registered attendees on web and mobile | 8 |
| [Security & Protocol](./09-security-protocol/README.md) | Security Director, Protocol Office, and national-security liaisons | 6 |
| [Analytics, ESG & Compliance](./10-analytics-esg-compliance/README.md) | Event Director, Government Stakeholders, and Audit | 9 |
| [Staff Field App](./11-staff-field-app/README.md) | Event-day staff and volunteers | 6 |

## Operating principles

- **Bilingual by design:** English and Arabic (RTL) are required for every delegate-facing experience.
- **Government-grade control:** SSO with 2FA, page-level RBAC, zone enforcement, masking, approval workflows, and immutable audit trails.
- **Offline resilience:** scanners and field workflows cache locally, queue idempotent changes, and show sync freshness.
- **Single operational truth:** incidents, schedule changes, access events, and dispatch handoffs converge in the Command Center.
- **Configuration freeze:** at Week 2, non-admin changes route to a Next Edition backlog.
