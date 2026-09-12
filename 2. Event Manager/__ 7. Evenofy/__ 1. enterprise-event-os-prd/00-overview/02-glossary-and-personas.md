> Enterprise Event OS → Overview → Glossary and Personas

## Glossary and Personas

| Term | Definition |
|---|---|
| Credential | A revocable digital or printed proof of an attendee's approved entitlement. |
| Zone | A physical or virtual area with an access policy. |
| ROS | Run of show, the time-ordered executable programme for a stage or operation. |
| Dignitary | A person whose movement, seating, security, or disclosure requires protocol controls. |
| Source of truth | The system authorized to create a specified field; integrations may mirror but not overwrite it. |

### Personas and default permissions

| Role | Permitted work | Restricted work |
|---|---|---|
| Event Director | Cross-module read, incident command, approval delegation | Cannot alter immutable audit logs |
| Ops Lead | Work orders, ROS, capacity, incidents | No payment details or protocol notes by default |
| Protocol Officer | Dignitary profiles, itineraries, seating | Cannot export unrelated attendee PII |
| Registration Agent | Verify, issue, reprint approved badges | Cannot approve own escalated registrations |
| Sponsor Manager | Organization, package, fulfillment | Cannot see competitor contract pricing |
| Finance Approver | Budget, PO and payment approvals | Cannot approve a request they created |
| Volunteer | Assigned tasks and limited attendee lookup | No bulk exports or sensitive notes |

Authorization evaluates a role grant, event assignment, purpose, zone, and data classification. Emergency `break_glass` access requires reason, second-factor authentication, notification to Security, and automatic expiry after 60 minutes.
