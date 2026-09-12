> Module 4: Content & Stage Management System → 4.2 Stage Cues and Assets

## Stage Cues and Assets
### Purpose and access
Lets stage managers execute precise, approved cues and assets. Stage managers control assigned stages; AV leads validate files; Broadcast can lock live cues.
### Data model
| Entity | Fields and relationships |
|---|---|
| `cue` | `id UUID`, `session_id FK`, `sequence int`, `offset_seconds int`, `type enum`, `status enum`, `owner_id FK` |
| `media_asset` | `id UUID`, `object_uri text`, `checksum text`, `duration_seconds int`, `rights_expiry date`, `validation enum` |
| `technical_check` | `id UUID`, `session_id FK`, `check_type enum`, `result enum`, `performed_by FK`, `at timestamptz` |
### Rules and integrations
- IF checksum or playback validation fails, THEN block a cue from `ready` state.
- IF rights expire before session end, THEN warn at least 24 hours ahead and suppress public replay use.
- Edge case: a live cue may be skipped, but sequence numbers stay immutable and record the skip reason.

Integrate frame.io for review, storage/CDN for delivery, and show-control systems through a human-confirmed adapter.
### UX, resilience, acceptance
The operator console is a large next/now/previous cue view, with color-safe status and a local asset cache. If control integration fails, it switches to manual checklist mode.

- Invalid media cannot be marked ready.
- Skipped cues are retained in the audit trail.
- The console remains usable without the show-control adapter.
