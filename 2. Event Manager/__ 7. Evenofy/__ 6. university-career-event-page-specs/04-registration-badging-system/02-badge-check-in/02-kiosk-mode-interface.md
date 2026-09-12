> Module 4: Registration & Badging System → Badge & Check-In → Kiosk Mode Interface

## Kiosk Mode Interface
**Purpose & users:** Students and attendees self-check-in and print approved badges on site.

**Features:** full-screen identity lookup; QR/email/confirmation-code search; consent confirmation; badge preview; printer status; help button; language/accessibility controls; reprint reason; queue status.

**Workflow:** Attendee scans or enters identifier → kiosk confirms eligible record → requests any required acknowledgement → prints badge → shows directions; unresolved record routes to staffed desk.

**States & guardrails:** never expose another attendee's details in search results. Printer failure preserves check-in state and gives a queue token; reprints revoke or flag prior badge according to policy.
