# Radio Station Monitoring

## Page Title & Description
Radio Station Monitoring configures local FM, AM, online stream, podcast, and broadcast sources that are central to rural community sentiment coverage.

## User Roles & Access Control
- Admins, Data Admins, Analysts, and Implementation Managers can configure radio monitoring.
- Community Relations and Communications users can view transcript availability and station coverage.
- Hardware deployment details are visible only to Admins and Platform Admins.

## UI/UX Component Breakdown
- Station directory with name, region, language, type, stream URL, priority, and coverage communities.
- Add-station form for online stream, FM tuner capture, satellite capture, or manually supplied audio.
- Coverage map showing station reach relative to mine sites and catchment communities.
- Processing pipeline status for capture, upload, transcription, translation, sentiment, and indexing.
- Audio retention and transcript retention policy controls.
- QA sampling panel for manual transcription validation.

## User Actions & Interactions
- Adding a stream tests audio availability and schedules capture jobs.
- Assigning station coverage links transcripts to communities, regions, and monitored sites.
- Starting QA creates review tasks for selected transcript samples.
- Changing retention policy recalculates storage estimates and requires Admin confirmation.
- Clicking a station opens transcript browser filtered to that source.

## Data Requirements & State
- Fetch station catalog, stream health, capture jobs, transcript status, language models, coverage geometry, and storage usage.
- Capture station metadata, stream URL, tuner frequency, priority, languages, coverage communities, and retention policy.
- Maintain audio file pointers, transcript segments, diarization labels, translation text, and source confidence.

## Navigation & Routing
- Links to `/sources/transcript-browser`, `/community/registry`, `/settings/data-retention`, and `/review/queue`.
- Failed stream test remains on page with diagnostic details.
- Hardware deployment requirement routes to implementation support workflow.
