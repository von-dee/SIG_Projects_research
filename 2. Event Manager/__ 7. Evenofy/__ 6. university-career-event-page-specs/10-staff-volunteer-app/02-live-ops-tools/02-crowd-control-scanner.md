> Module 10: Staff & Volunteer App → Live Ops Tools → Crowd Control Scanner

## Crowd Control Scanner
**Purpose & users:** Door volunteers verify access and help manage room capacity from a phone.

**Features:** camera scan; manual code fallback; allow/deny response; accessible reason guidance; room occupancy; threshold warning; duplicate-scan handling; help/escalation; offline mode; device status.

**Workflow:** Select assigned room → scan badge at entry → show simple allow/deny result → admit or direct to help/overflow → monitor occupancy → escalate capacity or device problem to supervisor.

**States & guardrails:** do not display sensitive identity data. Duplicate scans do not increase occupancy; unknown or stale offline credentials route to a staffed resolution path rather than improvisation.
