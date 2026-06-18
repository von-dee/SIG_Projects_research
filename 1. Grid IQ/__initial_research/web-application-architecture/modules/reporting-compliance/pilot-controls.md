# Pilot Controls

## Page Title & Description
Pilot governance page used to define baselines, control zones, sample coverage, independent verification, and statistical confidence for the GridIQ deployment.

## User Roles & Access Control
- Management, administrators, DFI viewers, auditors, and pilot analysts can view.
- Only pilot administrators can edit study design.
- Operations users can view implementation milestones.

## UI/UX Component Breakdown
- Pilot design summary.
- Baseline period selector.
- Treatment and control zone comparison.
- Sensor and meter coverage chart.
- Independent verification checklist.
- Milestone timeline.
- Statistical confidence and data-quality indicators.

## User Actions & Interactions
- Configure pilot zones and control zones.
- Lock baseline period.
- Upload independent verification evidence.
- Track deployment milestones.
- Export pilot methodology.

## Data Requirements & State
- Fetches zones, sensors, meters, monthly snapshots, baseline assumptions, verification documents, milestones, and control-group assignments.
- Captures design changes, evidence uploads, milestone updates, and locked methodology approvals.
- Stores versioned pilot design records.

## Navigation & Routing
- `/pilot-controls` links to `/roi`, `/reports`, `/asset-registry`, and `/dfi-impact-pack`.
- Locked pilot design requires explicit revision workflow.

