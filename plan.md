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

Phase 2: Dashboard UI + Charts
1. UI Foundation (Cool-Kid Skin)

Add shadcn/ui (super popular with Next.js + Tailwind projects).

Introduce a layout system:

Sidebar nav (links: Dashboard, Companies, Charts, Settings).

Top header (title, maybe a search bar, future user menu).

Footer (simple copyright / version info).

Standardize typography and spacing with Tailwind presets.

2. Charts

Use recharts (popular + simple with React + TypeScript) or chart.js with react-chartjs-2.
Charts to implement:

Total Dentists (big stat card) → just a single number, pulled from Supabase.

% with Website → donut/pie chart.

% with Email → donut/pie chart.

% with Analysis → donut/pie chart.

Optional: Stacked bar with overlap (how many have website+email+analysis).

3. Company Table Improvements

Add pagination (server-side or client-side).

Add sortable columns (company, last_updated).

Show badges for missing fields (e.g. “No Email” in red).

4. Data Plumbing

Reuse the Supabase client from /lib/supabase.ts.

Add SQL views if necessary for chart queries (example: companies_with_email_pct).

Example query for websites:

SELECT 
  COUNT(*) FILTER (WHERE website IS NOT NULL AND website <> '')::float / COUNT(*) * 100 AS pct_with_website
FROM german_companies;

Phase3:

1. Add Quick Auth

Since you’re already using Supabase, leverage its Auth (built-in JWT + Postgres RLS). That way you don’t add new infra.

Steps:

Enable Email/Password (or Magic Link) in your Supabase project (Auth → Providers).

Install Supabase client in Next.js (you already did for DB).

Add auth context with @supabase/auth-helpers-nextjs:

yarn add @supabase/auth-helpers-nextjs


Wrap your app in the provider (src/app/layout.tsx):

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  return (
    <html>
      <body>
        <SessionContextProvider supabaseClient={supabaseClient}>
          {children}
        </SessionContextProvider>
      </body>
    </html>
  );
}


Create a Login page (src/app/login/page.tsx) with:

'use client';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function Login() {
  const supabase = useSupabaseClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    await supabase.auth.signInWithPassword({
      email: form.get('email') as string,
      password: form.get('password') as string,
    });
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" name="email" placeholder="Email" />
      <input type="password" name="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}


Protect your dashboard route with redirect:

import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function DashboardLayout({ children }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/login');
  return <>{children}</>;
}


