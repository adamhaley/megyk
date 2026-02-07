# Megyk Dashboard

A dual-purpose [Next.js 15](https://nextjs.org) application for Megyk.com featuring:

1. **📚 Book Summaries Management System** - Complete CRUD interface for managing book summaries with PDF ingestion
2. **📊 Sales Campaign Dashboard** - Analytics and data visualization for lead generation campaigns

## Features

### Book Management
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Search and pagination
- ✅ PDF upload with drag-and-drop interface
- ✅ Integration with n8n for automated PDF processing
- ✅ Book metadata management (ISBN, cover images, publication year, etc.)

### Sales Campaign Analytics
- ✅ Multi-campaign support with nested navigation
  - **German Dentists** - Lead generation for German dental practices
  - **US Financial Advisors** - Lead generation for US financial advisory firms
- ✅ Campaign-specific analytics dashboards
  - Finder Felix (postal code coverage) - German campaign only
  - Enrichment metrics (website/email data quality)
  - Outreach status tracking
- ✅ Real-time analytics with donut charts
- ✅ Company/advisor data management with search and pagination
- ✅ Email verification status tracking
- ✅ Email domain health monitoring (SPF/DMARC/MX)
- ✅ Duplicate detection and filtering
- ✅ Optimized SQL queries with database views and RPC functions

### General
- ✅ Supabase authentication (email/password)
- ✅ Server-side rendering with App Router
- ✅ Responsive design (mobile and desktop)
- ✅ Modern UI with Material UI (MUI)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Material UI (MUI)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
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
# N8N_API_KEY=your_n8n_api_key
# VERIFICATION_WORKFLOW_ID=your_workflow_id
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

## Database Schema

### German Dentists Campaign

**`german_companies`** - Company records for German dental practices
**`german_zip_codes`** - German postal code reference data
**`finder_felix_executions`** - Postal code scraping execution tracking

### US Financial Advisors Campaign

**`us_financial_advisors`** - Advisor records for US financial advisory firms
**`us_zip_codes`** - US postal code reference data with population/income metrics

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── books/                # Book management pages
│   │   ├── sales-campaign/       # Sales campaign routes
│   │   │   ├── german-dentists/      # German campaign page
│   │   │   ├── us-financial-advisors/ # US campaign page
│   │   │   └── page.tsx              # Redirects to default campaign
│   │   └── layout.tsx            # Dashboard layout with auth
│   ├── api/
│   │   ├── ingest-book/          # PDF upload API route
│   │   ├── enrich-book/          # Book enrichment API route
│   │   ├── email-health/         # Email domain health check
│   │   └── verification-last-run/ # Verification workflow status
│   ├── auth/
│   │   └── signout/              # Sign out route
│   ├── login/                    # Login page
│   └── page.tsx                  # Home (redirects based on auth)
├── components/                   # Reusable React components
│   ├── Sidebar.tsx               # Desktop navigation with nested items
│   ├── MobileNav.tsx             # Mobile navigation
│   ├── CompanyDashboard.tsx      # Main campaign dashboard (supports both campaigns)
│   ├── AnalyticsDashboard.tsx    # Analytics charts (campaign-aware)
│   ├── CompanyTable.tsx          # Data grid for companies/advisors
│   ├── EmailVerificationCard.tsx # Email status distribution
│   └── EmailWarmupCard.tsx       # Domain health monitoring
├── lib/                          # Utilities and data fetching
│   ├── supabase.ts               # Browser Supabase client
│   ├── supabase-server.ts        # Server Supabase client (SSR)
│   ├── books.ts                  # Book CRUD operations
│   ├── companies.ts              # German companies data operations
│   ├── advisors.ts               # US advisors data operations
│   ├── analytics.ts              # German campaign analytics
│   └── advisor-analytics.ts      # US campaign analytics
└── types/                        # TypeScript type definitions
    ├── book.ts
    ├── company.ts                # GermanCompany interface
    └── advisor.ts                # USFinancialAdvisor interface
```

## Deployment

The application is deployed on DigitalOcean behind Caddy reverse proxy at `megyk.com`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Material UI Documentation](https://mui.com/material-ui/getting-started/)
