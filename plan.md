# Megyk Dashboard — Master Plan

## 1. Project Overview
A **dual-purpose client-facing dashboard** built with **Next.js 15, TypeScript, App Router**, styled with **Tailwind CSS 4**, fetching live data from **Supabase**.

### Two Main Applications:

#### A. Book Summaries Management System
- Full CRUD interface for managing book summaries
- PDF upload and processing via n8n webhook integration
- Search, pagination, and filtering capabilities

#### B. Sales Campaign Dashboard
- Analytics dashboard for German dentist lead generation
- Three-stage pipeline tracking (Finder Felix → Analysis Anna → Pitch Paul)
- Company data management with search and export tracking

**Goal**: Provide a robust, professional dashboard at `megyk.com` to replace reliance on Google Sheets and provide automated book processing.

---

## 2. ✅ Implemented Core Features

### Authentication ✅
- ✅ Supabase Auth with email/password
- ✅ Server-side session management with cookies (@supabase/ssr)
- ✅ Protected dashboard routes with redirect
- ✅ Sign out functionality

### Book Management System ✅
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ List view with search and pagination
- ✅ Drag-and-drop PDF upload component
- ✅ n8n webhook integration for PDF processing
- ✅ Book metadata fields (title, author, ISBN, cover, summary, etc.)
- ✅ Status tracking and live/draft toggle

### Sales Campaign Dashboard ✅
- ✅ List of companies (name, email, website, analysis)
- ✅ Pagination with "Load More" functionality
- ✅ Search across multiple fields (company, email, website)
- ✅ Three analytics charts with real-time data:
  - **Finder Felix**: Postal code coverage tracking
  - **Analysis Anna**: Data enrichment status (websites/emails)
  - **Pitch Paul**: Export to instantly.ai tracking

### UI/UX ✅
- ✅ Responsive design (mobile + desktop)
- ✅ Fixed sidebar navigation (desktop)
- ✅ Collapsible hamburger menu (mobile)
- ✅ Clean, modern UI with Tailwind CSS 4
- ✅ Loading states and error handling
- ✅ Heroicons integration

---

## 3. Future Enhancements

### Charts & Visualizations
- ✅ Three main analytics charts (Finder Felix, Analysis Anna, Pitch Paul)
- ⬜ Distribution map of dentists by postal code (geographic visualization)
- ⬜ Growth over time chart (new entries per day/week/month)
- ⬜ Breakdown by deduped vs raw rows
- ⬜ Historical trend analysis

### Admin Controls
- ⬜ Trigger manual sync job (call n8n webhook)
- ⬜ Export companies to CSV
- ⬜ Export books to CSV
- ⬜ Bulk operations (delete, update status)
- ⬜ Manual export to instantly.ai

### Role-based Access
- ⬜ Separate "viewer" and "admin" roles
- ⬜ Admin-only pages for sensitive operations
- ⬜ User management interface

### Book Management Enhancements
- ⬜ Genre/category management
- ⬜ Book ratings and reviews
- ⬜ Advanced search filters (by genre, year, status)
- ⬜ Bulk PDF upload
- ⬜ PDF preview/viewer

### Sales Campaign Enhancements
- ⬜ Campaign performance tracking over time
- ⬜ A/B test results visualization
- ⬜ Email open/click tracking
- ⬜ Lead scoring system
- ⬜ Sync status visibility (last sync time, next scheduled sync)

---

## 4. Tech Stack

### Current Implementation ✅
- **Frontend**: Next.js 15.5.3 (with Turbopack), React 19.1.0, TypeScript 5
- **Styling**: Tailwind CSS 4.1.13, PostCSS, Autoprefixer
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
  - `@supabase/supabase-js` 2.57.4
  - `@supabase/ssr` 0.7.0 (for server-side auth)
- **Charts**: Recharts 3.2.1
- **Icons**: Heroicons 2.2.0
- **Automation**: n8n (webhook integration for PDF processing)
- **Deployment**: DigitalOcean Droplet (shared with Supabase + n8n), behind Caddy reverse proxy
- **Package Manager**: Yarn
- **Linting**: ESLint 9 with Next.js config


---

## 5. Implementation Status

### ✅ Completed
- ✅ Tailwind CSS 4 configured with PostCSS
- ✅ Tailwind directives added to `globals.css`
- ✅ Supabase client configured (browser + server)
- ✅ Authentication with Supabase Auth (email/password)
- ✅ Protected routes with server-side session checks
- ✅ Responsive layout with sidebar navigation
- ✅ Company data fetching with pagination
- ✅ Company search functionality
- ✅ "Load More" pagination
- ✅ Analytics dashboard with three charts
- ✅ SQL views and RPC functions for optimized queries
- ✅ Book CRUD operations
- ✅ Book search and pagination
- ✅ PDF upload with drag-and-drop
- ✅ n8n webhook integration
- ✅ Deployment to DigitalOcean with Caddy

### 🔄 In Progress / Next Steps
- [ ] Run SQL migrations on production database
- [ ] Test analytics views on production
- [ ] Add CSV export functionality
- [ ] Implement manual n8n trigger controls
- [ ] Add role-based access control
- [ ] Performance optimization and caching
- [ ] Add monitoring and error tracking

---

## 6. Notes & Best Practices

### Environment Variables
- **Supabase Keys**: Use only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` on frontend
- Never commit `.env.local` to git
- n8n webhook URL is currently hardcoded (consider moving to env var)

### Development Workflow
- **CLI-first workflow**: Code and run migrations via CLI + editor
- Use Yarn for all package management
- Run `yarn lint` before committing
- Test both mobile and desktop layouts

### Database Best Practices
- SQL views and RPC functions improve analytics performance significantly
- Use migrations file for all schema changes: `supabase/migrations/`
- Always grant proper permissions to `anon` role for views/functions
- Count queries with filters are more efficient than fetching all data

### Authentication
- Server components use `createServerComponentClient()` for SSR
- Client components use standard `supabase` client
- Session persists via cookies (managed by `@supabase/ssr`)
- Always check session on protected routes

### Code Organization
- Keep business logic in `lib/` directory
- Keep UI components in `components/` directory
- Use TypeScript types from `types/` directory
- API routes go in `app/api/` directory

### Performance
- Use Turbopack for faster development builds (`--turbopack` flag)
- Leverage SQL-level aggregations instead of client-side calculations
- Implement pagination for large datasets
- Use loading states and error boundaries

---

## 7. Database Migrations

### Analytics Views (Priority: High)
Location: `supabase/migrations/20240101000000_create_analytics_views.sql`

This migration creates:
- `companies_stats` - Aggregated view for company statistics
- `finder_felix_coverage` - Postal code coverage view
- `get_unique_postal_codes_count()` - RPC function for unique postal code count

**Status**: Created but may need to be run on production database

### Future Migrations Needed
- Book genres table (referenced by `book_genre_id`)
- User roles and permissions
- Audit logs for data changes
- Full-text search indexes

---


