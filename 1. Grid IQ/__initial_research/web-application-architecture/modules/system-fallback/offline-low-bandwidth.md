# Offline & Low-Bandwidth Mode

## Page Title & Description
Resilient fallback page for poor connectivity, enabling field teams and utility users to continue with cached maps, assigned cases, and essential reports.

## User Roles & Access Control
- Authenticated users with cached sessions can access.
- Field agents receive assigned-case cache.
- Management and operations receive last-known summary metrics.

## UI/UX Component Breakdown
- Connectivity status indicator.
- Last-synced timestamp.
- Cached case list.
- Low-bandwidth zone summary.
- Pending sync queue.
- Retry connection button.
- Conflict-resolution prompt.

## User Actions & Interactions
- Continue working from cached assigned cases.
- Record field outcomes offline.
- Retry sync.
- Resolve sync conflicts.
- Switch to text-only map summary.

## Data Requirements & State
- Uses cached user session, assigned cases, zone summaries, field forms, and pending submissions.
- Captures offline actions, timestamps, local device ID, and conflict decisions.
- Syncs to server when connectivity returns.

## Navigation & Routing
- `/offline-low-bandwidth` links to cached `/queue`, `/map` summary, and `/notifications`.
- Expired cache requires return to `/login`.

