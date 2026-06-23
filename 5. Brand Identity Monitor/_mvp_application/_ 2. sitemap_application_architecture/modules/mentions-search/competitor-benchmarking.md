# Competitor Benchmarking

## Page Title & Description
Competitor Benchmarking compares brand, company, member, or sector reputation metrics across peers while respecting confidentiality and anonymization rules.

## User Roles & Access Control
- Executives, Communications, ESG, Analysts, Chamber users, and Admins can access benchmarking if enabled.
- Chamber users may see anonymized member rankings or named data based on agreements.
- Member-company users see their own named data and approved sector averages.

## UI/UX Component Breakdown
- Peer set selector for companies, sites, sectors, corridors, regions, or custom competitor groups.
- Benchmark cards for sentiment balance, share of voice, risk score, SLO score, topic burden, response time, and report readiness.
- Ranking table with named, anonymized, or indexed display.
- Trend comparison charts by date range, topic, stakeholder, source, and location.
- Narrative comparison panel showing top positive and negative drivers per peer.
- Export benchmark report button.

## User Actions & Interactions
- Selecting peer set refreshes all benchmark metrics and anonymization labels.
- Changing topic or source filters recalculates comparisons.
- Clicking a peer opens permitted detail or anonymized summary.
- Saving benchmark view stores it for recurring reports.
- Exporting creates a benchmark report draft or data export.

## Data Requirements & State
- Fetch peer definitions, permissions, anonymization policy, aggregated metrics, topic drivers, narrative clusters, and export entitlements.
- Capture selected peer set, filters, saved view, export request, and report inclusion.
- Prevent drill-through into restricted peer data while preserving aggregate comparison.

## Navigation & Routing
- Links to `/dashboard`, `/reports/builder`, `/mentions/feed`, and `/settings/security-compliance`.
- Restricted peer detail routes to `/system/403`.
- Missing benchmark entitlement routes to `/settings/billing`.
