# Megyk Campaign Dashboard — Master Plan

## 1. Project Overview
A client-facing dashboard built with **Next.js (15, TypeScript, App Router)**, styled with **Tailwind CSS**, fetching live data from **Supabase** (deduped `german_companies` table).  
Goal: gradually replace reliance on Google Sheets by providing a robust, professional dashboard at `megyk.com`.

---

## 2. Core Features (MVP)
- **Authentication**
  - Use Supabase Auth (email magic link or OAuth if needed).
  - Protect dashboard routes.
- **Data Display**
  - List of companies (name, email, website, analysis).
  - Pagination or infinite scroll.
  - Basic filtering/search.
- **Sync Visibility**
  - Show last sync time (from n8n job).
  - Highlight recently updated rows (`updated_at` column).
- **Client Branding**
  - Clean, minimal UI with branding placeholder for client logo.

---

## 3. Stretch Goals (Phase 2+)
- **Charts & Visualizations**
  - Distribution of dentists by postal code.
  - Growth over time (new entries per day).
  - Breakdown by deduped vs raw rows.
- **Admin Controls**
  - Trigger manual sync job (call n8n webhook).
  - Export to CSV.
- **Role-based Access**
  - Separate “viewer” and “admin” dashboards.

---

## 4. Tech Stack
- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: Supabase (Postgres + Auth + Storage)
- **Automation**: n8n (already set up for sync jobs)
- **Deployment**: DigitalOcean Droplet (shared with Supabase + n8n), behind Caddy reverse proxy
- **Package Manager**: Yarn (preferred for consistency)


---

## 5. Tasks / Next Steps
### Setup
- [ ] Ensure Tailwind is configured.
- [ ] Add Tailwind directives to `globals.css`.
- [ ] Verify Supabase client in `lib/supabase.ts`.

### MVP UI
- [ ] Fetch and render first 20 companies from Supabase.
- [ ] Add pagination or “Load More” button.
- [ ] Show `company`, `email`, `website`, `analysis`.

### Deployment
- [ ] Add build + deploy scripts for DigitalOcean (Caddy config at `megyk.com`).
- [ ] Test staging deploy before client demo.

---

## 6. Notes
- **Supabase Keys**: Use only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` on frontend.
- **CLI-first workflow**: Code and run migrations via CLI + editor, not VSCode GUI.
- **Style Philosophy**: Start minimal (Tailwind default), evolve branding later.

---

