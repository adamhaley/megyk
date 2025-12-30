# Megyk Dashboard

A dual-purpose [Next.js 15](https://nextjs.org) application for Megyk.com featuring:

1. **📚 Book Summaries Management System** - Complete CRUD interface for managing book summaries with PDF ingestion
2. **📊 Sales Campaign Dashboard** - Analytics and data visualization for German dentist lead generation campaign

## Features

### Book Management
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Search and pagination
- ✅ PDF upload with drag-and-drop interface
- ✅ Integration with n8n for automated PDF processing
- ✅ Book metadata management (ISBN, cover images, publication year, etc.)

### Sales Campaign Analytics
- ✅ Three-stage campaign tracking (Finder Felix, Analysis Anna, Pitch Paul)
- ✅ Real-time analytics with donut charts
- ✅ Company data management with search and pagination
- ✅ Optimized SQL queries with database views and RPC functions
- ✅ Postal code coverage tracking
- ✅ Data enrichment status monitoring

### General
- ✅ Supabase authentication (email/password)
- ✅ Server-side rendering with App Router
- ✅ Responsive design (mobile and desktop)
- ✅ Modern UI with Tailwind CSS 4

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Icons**: Heroicons
- **Automation**: n8n (webhook integration)
- **Package Manager**: Yarn

## Getting Started

### Prerequisites
- Node.js 20+
- Yarn
- Supabase project with required tables

### Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
# Create .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# N8N_BASE_URL=https://n8n.megyk.com
```

### Development

```bash
# Start development server (with Turbo)
yarn dev

# Open http://localhost:3000
```

### Production

```bash
# Build for production (with Turbo)
yarn build

# Start production server
yarn start
```

### Linting

```bash
yarn lint
```

## Database Setup

Run the SQL migration to create optimized analytics views:

```sql
-- Run the file: supabase/migrations/20240101000000_create_analytics_views.sql
```

This creates:
- `companies_stats` view - Aggregated company statistics
- `finder_felix_coverage` view - Postal code coverage metrics
- `get_unique_postal_codes_count()` function - Unique postal code counter

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── books/            # Book management pages
│   │   ├── sales-campaign/   # Sales analytics page
│   │   └── layout.tsx        # Dashboard layout with auth
│   ├── api/
│   │   └── ingest-book/      # PDF upload API route
│   ├── auth/
│   │   └── signout/          # Sign out route
│   ├── login/                # Login page
│   └── page.tsx              # Home (redirects based on auth)
├── components/               # Reusable React components
├── lib/                      # Utilities and data fetching
│   ├── supabase.ts          # Browser Supabase client
│   ├── supabase-server.ts   # Server Supabase client (SSR)
│   ├── books.ts             # Book CRUD operations
│   ├── companies.ts         # Company data operations
│   └── analytics.ts         # Analytics data fetching
└── types/                    # TypeScript type definitions
    ├── book.ts
    └── company.ts
```

## Deployment

The application is deployed on DigitalOcean behind Caddy reverse proxy at `megyk.com`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

