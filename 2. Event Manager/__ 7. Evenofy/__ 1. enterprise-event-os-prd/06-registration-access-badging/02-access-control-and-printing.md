> Module 6: Registration, Access Control & Badging → 6.2 Access Control and Printing

## Access Control and Printing
### Purpose and access
Issues tamper-resistant credentials and enforces physical access at entrances. Registration agents print/reprint; Security controls zone policy; gate staff see only allow/deny and minimal identity.
### Data model
| Entity | Fields and relationships |
|---|---|
| `credential` | `id UUID`, `registration_id FK`, `token_hash text`, `status enum`, `issued_at timestamptz`, `print_count int` |
| `access_policy` | `id UUID`, `zone_id FK`, `access_profile_id FK`, `schedule jsonb`, `priority int` |
| `scan_event` | `id UUID`, `credential_id FK?`, `reader_id FK`, `decision enum`, `reason_code text`, `at timestamptz`, `offline bool` |
### Rules and integrations
- IF a token is revoked, expired, or outside schedule, THEN deny and record a reason without disclosing sensitive status.
- IF a badge scans twice at the same reader within five seconds, THEN record the second as `duplicate` and do not change occupancy.
- Edge case: a reprint revokes the prior token only after new print completion is confirmed.

Integrate HID/Genetec readers and Zebra printers. Gate devices receive signed policy and revocation snapshots and upload buffered scans on reconnection.
### UX, resilience, acceptance
Gate UI is a full-screen green/red decision with optional assistance code; agent UI requires reprint reason. Offline mode displays snapshot age.

- Duplicate scan does not increment occupancy.
- Reprint transition never leaves two active credentials.
- An offline device denies unknown tokens and queues its scan log.
