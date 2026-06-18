# Right Direction Frontend

Modern React + TypeScript frontend for the Right Direction fleet logistics interface.

## What Is Included

- Vite React application with strict TypeScript.
- Modular component structure for layout, UI primitives, fleet cards, route map, driver details, cargo photo reports, and page-level views.
- Typed mock API layer in `src/api/fleetApi.ts`.
- Custom hooks for async loading, error, and success states.
- Theme context for dark/light mode.
- Toast context for user feedback.
- Responsive desktop, tablet, and mobile layouts.

## Run Locally

```bash
pnpm install
pnpm dev
```

The app runs at:

```text
http://127.0.0.1:5173/
```

## Build

```bash
pnpm build
```

## Project Structure

```text
src/
  api/          mock API client
  components/   reusable layout, UI, and fleet components
  context/      theme and toast providers
  data/         realistic seed data
  hooks/        data-fetching hooks
  pages/        page-level views
  styles/       global design system and responsive CSS
  types/        strict TypeScript domain models
  utils/        formatting helpers
```

## Backend Integration Notes

Replace the mock methods in `src/api/fleetApi.ts` with real HTTP calls. The rest of the UI consumes typed hooks, so API changes should stay contained to the API and hook layer.

