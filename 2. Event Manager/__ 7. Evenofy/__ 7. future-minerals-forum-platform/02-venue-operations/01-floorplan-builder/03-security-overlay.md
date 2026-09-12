# Security Overlay

> **Breadcrumb:** [FMF Platform](../../README.md) → [Venue Operations](../README.md) → [Floorplan Builder](./README.md) → Security Overlay

## Purpose

Approved layer for magnetometers, screening lanes, and VIP-only corridors. This is an operational page, not merely a report: authorised users can identify an exception, trace its source, and take the next permitted action without leaving the FMF platform.

## Users and access

- **Primary users:** Operations Team and Venue/Facility Contractors.
- **Access model:** role-, event-, and delegation/zone-scoped access. Read, create, approve, export, and administer permissions are independently grantable.
- **Sensitive-data rule:** passport, principal, security, financial, and closed-session data are minimized, masked by default, and fully audited.

## Screen design and behaviour

The page opens with a context bar for event, date/time zone, status, and data freshness. A task-focused workspace presents the relevant record or operational view, filters, saved views, and drill-through links to source records. Inline validation explains what is missing or blocked; destructive or high-impact actions require confirmation and the appropriate approval. Arabic RTL and English are first-class layouts, with equivalent labels, validation, and exports.

## Primary workflow

1. Select the active event and permitted scope; the system applies role and zone/delegation filters.
2. Review the current state, alerts, and linked records; filter or search to locate the target.
3. Create, update, approve, or escalate the item with required evidence and ownership.
4. The platform validates policy, writes an immutable audit event, updates dependent modules, and notifies only the relevant people.
5. Confirm completion from the updated status and, where allowed, export a timestamped record.

## Data, integrations, and dependencies

The page uses the canonical event, person, organisation, credential, venue, programme, transaction, and audit entities as relevant to its scope. It must expose source timestamps, integration status, and a retry-safe reference for every external handoff. Linked workflows may include registration, access control, floorplan, transport, finance, content, notifications, and analytics; failures remain visible and never silently change the operational record.

## Controls and resilience

- Use 2FA/SSO, least privilege, field masking, export restrictions, and immutable audit logs.
- Enforce the Week 2 “No New Ideas” lock: non-admin configuration changes route to the Next Edition backlog.
- Preserve a read-only cached experience and queued mutations where the field workflow must survive unreliable venue connectivity.
- Require explicit consent before contact-data discovery, sharing, scanning, or post-event reuse.

## Acceptance criteria

- An authorised user can complete the core workflow on desktop and the supported mobile layout without access to unrelated records.
- Validation prevents invalid state transitions and explains the corrective action.
- Every write records actor, time, prior value, new value, source, and approval where required.
- Arabic RTL and English render the same functional controls and policy notices.
- When an upstream service is unavailable, the page shows freshness and retry state; it does not present stale data as live.
