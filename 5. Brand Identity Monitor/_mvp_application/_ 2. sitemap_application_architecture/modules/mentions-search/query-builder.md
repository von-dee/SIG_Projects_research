# Query Builder

## Page Title & Description
Query Builder lets users create precise monitoring queries using a visual builder or raw Boolean syntax for brands, competitors, issues, communities, sources, and risk watches.

## User Roles & Access Control
- Analysts, Admins, Communications Leads, ESG users, and Data Admins can build and save queries.
- View-only users can run shared queries but cannot edit them.
- Raw Boolean mode can be restricted to Analysts and Admins.

## UI/UX Component Breakdown
- Visual query blocks for keywords, exact phrases, entities, topics, sources, languages, locations, sentiment, and exclusions.
- Raw Boolean editor supporting AND, OR, NOT, NEAR/n, quotes, wildcards, and field scoping.
- Live syntax validation and result estimate panel.
- Query preview feed with highlighted matches.
- Save modal with name, folder, sharing scope, alert eligibility, and description.
- Query library sidebar.

## User Actions & Interactions
- Adding/removing visual blocks generates equivalent Boolean syntax.
- Typing raw Boolean validates parser output and highlights errors.
- Running preview fetches sample results and estimated volume.
- Saving query stores versioned query definition and sharing permissions.
- Creating alert from query routes to alert configuration with query prefilled.

## Data Requirements & State
- Fetch taxonomy, source list, entities, communities, saved query folders, and user permissions.
- Capture query AST, raw string, visual builder state, preview filters, sharing scope, and save metadata.
- Store query versions to preserve alert and report reproducibility.

## Navigation & Routing
- Links to `/mentions/feed`, `/alerts/create`, `/dashboard/analyst-workspace`, and `/settings/api-keys`.
- Syntax errors remain inline.
- Unauthorized edit routes to `/system/403`.
