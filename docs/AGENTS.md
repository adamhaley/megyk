# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js 15 App Router project. Source code lives in `src/`:
`src/app/` for routes (e.g., `src/app/(dashboard)/books/`), `src/components/` for shared UI,
`src/lib/` for data access (Supabase clients and fetchers), `src/types/` for TypeScript types,
and `src/theme/` for theming. Static assets live in `public/`. SQL helpers and migrations are
in `supabase/` and top-level `.sql` files.

## Build, Test, and Development Commands
- `yarn dev` runs the local dev server with Turbopack at `http://localhost:3000`.
- `yarn build` creates the production build.
- `yarn start` runs the production server after a build.
- `yarn lint` runs ESLint with the Next.js config.

## Coding Style & Naming Conventions
Use TypeScript and follow existing patterns in `src/`. Let ESLint enforce style; fix lint
issues before pushing. Prefer descriptive component names in `PascalCase` (e.g.,
`BookTable.tsx`), hooks and utilities in `camelCase` (e.g., `useCompanies.ts`), and keep
route folders aligned to feature areas under `src/app/`.

## Testing Guidelines
No automated test runner is configured in `package.json`. Verify changes with `yarn lint`
and manual flows in the dashboard (books CRUD, PDF ingest, and sales analytics). If you add
tests, include instructions and commands in this file.

## Commit & Pull Request Guidelines
Recent commits use short, lowercase, present-tense messages (e.g., “adding logout in upper
right”). Keep commits focused and avoid mixing unrelated changes. For PRs, include a concise
summary, link relevant issues, and attach screenshots for UI changes.

## Configuration & Secrets
Create a `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
and `N8N_BASE_URL`. Do not commit secrets. Database views and functions are defined in
`supabase/migrations/` and top-level `.sql` files.
