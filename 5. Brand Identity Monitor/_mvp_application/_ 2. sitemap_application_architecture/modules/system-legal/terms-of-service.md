# Terms Of Service

## Page Title & Description
Terms Of Service defines the contractual rules for using BrandWatch Africa, including acceptable use, data responsibilities, source compliance, AI limitations, subscription terms, confidentiality, and liability.

## User Roles & Access Control
- Public guests and authenticated users can view this page.
- Organization Owners accept terms during registration or contract activation.
- Legal text is read-only in the application.

## UI/UX Component Breakdown
- Terms content sections for account obligations, data sources, prohibited use, AI outputs, subscriptions, confidentiality, warranties, liability, termination, and governing law.
- Table of contents with anchor links.
- Effective date and version history.
- Download PDF button.
- Contact legal link.

## User Actions & Interactions
- Clicking anchors scrolls to terms sections.
- Downloading PDF retrieves current terms artifact.
- Contact legal opens support or mail link.
- During registration, checkbox records acceptance of the current terms version.

## Data Requirements & State
- Fetch current published terms version, effective date, PDF artifact, and prior version metadata.
- During acceptance flows, capture user, organization, terms version, timestamp, IP metadata where legally allowed, and consent record.

## Navigation & Routing
- Links to `/legal/privacy`, `/legal/data-processing`, `/auth/register`, and `/settings/compliance`.
- Missing terms artifact routes to support fallback.
- Public route remains accessible during logged-out sessions.
