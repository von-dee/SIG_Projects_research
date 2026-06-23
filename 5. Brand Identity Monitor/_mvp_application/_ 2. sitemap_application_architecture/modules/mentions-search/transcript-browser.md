# Transcript Browser

## Page Title & Description
Transcript Browser provides searchable access to radio, podcast, video, voice note, and field audio transcripts with original language, English translation, diarization, timestamps, and playback.

## User Roles & Access Control
- Analysts, Communications, Community Relations, ESG, Legal, and Admins can access permitted transcripts.
- Raw audio playback can be restricted by compliance policy.
- Field voice notes with sensitive data require PII permission.

## UI/UX Component Breakdown
- Station/source selector, date range picker, language filter, and keyword search.
- Transcript timeline with speaker labels, timestamp anchors, original text, translation, sentiment marks, and topic tags.
- Audio player synchronized to selected transcript segment.
- Segment detail drawer with source metadata, confidence, and related mentions.
- QA controls for correction, flagging poor transcription, or sending segment to review.

## User Actions & Interactions
- Searching highlights matching transcript segments and updates result count.
- Clicking a segment seeks audio to exact timestamp and opens detail metadata.
- Correcting transcript text creates a reviewed transcript version.
- Flagging poor transcription creates QA task and can suppress downstream analytics.
- Exporting transcript creates permission-aware text, PDF, or audio clip package.

## Data Requirements & State
- Fetch transcript segments, audio file pointers, station metadata, diarization labels, translation text, NLP outputs, QA status, and permissions.
- Capture search query, selected segment, playback state, transcript corrections, QA flags, and exports.
- Maintain immutable raw transcript and versioned corrected transcript.

## Navigation & Routing
- Links to `/sources/radio-stations`, `/mentions/detail/:id`, `/review/queue`, and `/reports/builder`.
- Missing audio shows transcript-only state.
- Restricted audio routes to `/system/403`.
