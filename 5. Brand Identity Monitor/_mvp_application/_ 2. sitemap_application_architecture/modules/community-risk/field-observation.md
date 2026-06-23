# Field Observation

## Page Title & Description
Field Observation captures structured notes, voice memos, photos, GPS location, and urgency signals from community liaison officers, especially in low-connectivity environments.

## User Roles & Access Control
- Field Teams, Community Relations users, and Admins can create observations.
- Analysts and ESG users can view processed observations if permitted.
- PII-sensitive submissions are restricted based on compliance permissions.

## UI/UX Component Breakdown
- Community selector with assigned-community default.
- Observation form with mood assessment, issue category, stakeholder group, urgency level, free-text notes, and follow-up needed.
- Voice memo recorder, photo attachment, and GPS capture controls.
- Offline save indicator and sync queue status for mobile or unstable networks.
- Consent and sensitivity flags for private submissions.

## User Actions & Interactions
- Saving online sends observation to ingestion and NLP processing immediately.
- Saving offline stores encrypted local draft and syncs when connectivity returns.
- Recording voice memo queues transcription, translation, and sentiment processing.
- Marking urgent creates an immediate alert candidate for review.
- Adding photo stores attachment with location and timestamp metadata.

## Data Requirements & State
- Fetch assigned communities, issue taxonomy, stakeholder groups, consent policy, and local draft state.
- Capture text, voice, photos, GPS, category, urgency, stakeholder, consent basis, sensitivity flags, and follow-up owner.
- Create observation record, attachment records, mention candidate, review task, and audit log.

## Navigation & Routing
- Success routes to `/community/:id` or stays in form for rapid entry.
- Offline success remains in local queue with sync indicator.
- Sensitive urgent observation links to `/alerts/queue` after processing.
- Missing permission routes to `/system/403`.
