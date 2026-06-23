# Connect Sources

## Page Title & Description
Connect Sources lets teams configure the channels BrandWatch Africa monitors: digital media, local news, radio transcripts, regulator feeds, uploaded reports, SMS or WhatsApp exports, and community field submissions.

## User Roles & Access Control
- Admins, Data Admins, Analysts, and Implementation Managers can connect sources.
- Members can upload permitted files if granted upload access.
- Source credentials are hidden from all non-admin users.

## UI/UX Component Breakdown
- Source catalog grouped by Digital, Broadcast, Community Voice, Documents, Regulatory, and Manual Upload.
- Connection cards for APIs, RSS feeds, radio stations, file upload, object storage, and webhook endpoints.
- Source health indicators for active, delayed, failed, unauthorized, or paused.
- Scope controls for keywords, brands, competitors, sites, communities, languages, and date range.
- Credential modal with masked secrets and test-connection action.

## User Actions & Interactions
- Adding a source opens configuration flow specific to source type.
- Testing a connection validates credentials, sample fetch, rate limits, and parsing.
- Enabling a source starts ingestion jobs and shows first expected sync time.
- Pausing a source stops new ingestion but preserves historical data.
- Deleting a source requires confirmation and retains audit history.

## Data Requirements & State
- Fetch available source connectors, subscription limits, connected sources, health metrics, and last ingestion status.
- Capture API keys, OAuth tokens, RSS URLs, radio station metadata, file mappings, source scopes, and retention settings.
- Store credentials in encrypted secret storage and source config in application database.

## Navigation & Routing
- Success routes to `/sources/health`.
- File upload routes to `/sources/upload`.
- Radio configuration routes to `/sources/radio-stations`.
- Unauthorized source failure remains on modal with remediation instructions.
- Subscription limit routes to `/settings/billing`.
