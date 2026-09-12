> Enterprise Event OS → Appendix → Open Questions and Assumptions

## Open Questions and Assumptions

| Topic | Working assumption | Decision owner / question |
|---|---|---|
| Capacity | 15,000 credentialed participants, peak 8,000 concurrent onsite | Event Director: confirm attendance and gate peak |
| Jurisdiction | Saudi-hosted event with international attendees | Legal/DPO: confirm applicable privacy, residency, sanctions rules |
| Currency | SAR as base currency; contracts may be multi-currency | Finance: approve FX source and close policy |
| Identity | SSO for staff; magic link or passwordless for attendees | Security: choose IdP and MFA coverage |
| Access | HID-compatible QR/NFC readers and Zebra printers | Venue Security: confirm installed hardware and SDKs |
| Offline | Gate and staff workflows work 12 hours with signed snapshots | Ops: validate device count, revocation SLA, venue network topology |
| Protocol | Protocol ranks and bilateral conflict policy supplied by Chief of Protocol | Protocol: define authority, classification, and emergency override |
| Retention | Operational records retained per legal schedule, marketing by consent | DPO: approve data map and retention table |

Before build, run workshops on venue topology, delegated approval limits, incident taxonomy, systems of record, accessibility/localization, and penetration-test requirements. Convert every approved assumption into versioned event configuration or an architecture decision record.
