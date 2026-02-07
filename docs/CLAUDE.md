# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **dual-purpose Next.js 15 dashboard** for Megyk.com with two main sections:

1. **Book Summaries Management** - CRUD application for managing book summaries with PDF ingestion via n8n
2. **Sales Campaign Dashboard** - Analytics and data display for multiple lead generation campaigns

The application uses TypeScript, Material UI (MUI), React 19, and server-side rendering with the App Router. Authentication is handled via Supabase Auth with SSR support.

## Development Commands

```bash
# Start development server (with Turbo)
yarn dev

# Build for production (with Turbo)
yarn build

# Start production server
yarn start

# Run linting
yarn lint
```

## Architecture

The application follows Next.js 15 App Router conventions:

- **Frontend**: React 19 with TypeScript, Material UI (MUI) for styling
- **Backend**: Supabase for database operations
- **Data Layer**: Custom hooks and API functions in `src/lib/`
- **Components**: Reusable UI components in `src/components/`
- **Types**: TypeScript interfaces in `src/types/`

### Key Files

**Authentication & Core:**
- `src/lib/supabase.ts` - Browser Supabase client configuration
- `src/lib/supabase-server.ts` - Server-side Supabase client with cookie handling (SSR)
- `src/app/(dashboard)/layout.tsx` - Protected dashboard layout with auth check (uses dynamic imports for nav)
- `src/app/login/page.tsx` - Login page with Supabase Auth
- `src/app/auth/signout/route.ts` - Sign out API route

**Book Management System:**
- `src/lib/books.ts` - Book CRUD operations with pagination and search
- `src/types/book.ts` - TypeScript interfaces for book data
- `src/components/BookList.tsx` - Book listing component
- `src/components/BookForm.tsx` - Book creation/editing form
- `src/components/BookDropzone.tsx` - PDF upload component
- `src/app/api/ingest-book/route.ts` - API route that forwards PDFs to n8n webhook

**Sales Campaign Dashboard (Multi-Campaign):**

The dashboard supports multiple campaigns with a shared component architecture:

*German Dentists Campaign:*
- `src/lib/companies.ts` - Company data fetching logic
- `src/lib/analytics.ts` - Analytics data fetching (includes Finder Felix postal code coverage)
- `src/types/company.ts` - GermanCompany interface
- `src/app/(dashboard)/sales-campaign/german-dentists/page.tsx` - Campaign page

*US Financial Advisors Campaign:*
- `src/lib/advisors.ts` - Advisor data fetching logic
- `src/lib/advisor-analytics.ts` - Analytics data fetching (no postal code coverage)
- `src/types/advisor.ts` - USFinancialAdvisor interface
- `src/app/(dashboard)/sales-campaign/us-financial-advisors/page.tsx` - Campaign page

*Shared Components:*
- `src/components/CompanyDashboard.tsx` - Main dashboard component (campaign-aware via `campaign` prop)
- `src/components/AnalyticsDashboard.tsx` - Analytics charts (shows different charts per campaign)
- `src/components/CompanyTable.tsx` - Data grid component
- `src/components/AnalyticsChart.tsx` - Reusable donut chart component (using Recharts)
- `src/components/EmailVerificationCard.tsx` - Email status distribution
- `src/components/EmailWarmupCard.tsx` - Domain health monitoring
- `src/components/SearchBar.tsx` - Search functionality component
- `src/components/CompanyFilters.tsx` - Filter controls

**Navigation:**
- `src/components/Sidebar.tsx` - Desktop navigation with nested hierarchy for campaigns
- `src/components/MobileNav.tsx` - Mobile navigation with same nested structure

### Database Schema

The application uses separate tables for each campaign:

#### Book Management Tables

**`books`** table:
- `id` (uuid) - Primary key
- `title` (string) - Book title
- `author` (string) - Book author
- `status` (string) - Current status (e.g., "draft", "published")
- `summary` (text) - Book summary/description
- `isbn` (string) - ISBN number
- `cover_image_url` (string) - Cover image URL
- `publication_year` (integer) - Year published
- `page_count` (integer) - Number of pages
- `default_summary_pdf_url` (string) - URL to generated summary PDF
- `live` (boolean) - Whether book is live/published
- `book_genre_id` (uuid) - Foreign key to genre table
- `created_at` (timestamp) - Record creation date
- `updated_at` (timestamp) - Last update date

#### German Dentists Campaign Tables

**`german_companies`** table:
- `id` (string) - Primary key
- `company` (string) - Company name
- `industry` (string) - Industry classification
- `ceo_name` (string) - CEO name
- `phone` (string) - Phone number
- `email` (string) - Email address
- `website` (string) - Website URL
- `address` (string) - Full address
- `district` (string) - District/area
- `city` (string) - City name
- `state` (string) - German state
- `created_at` (timestamp) - Record creation date
- `updated_at` (timestamp) - Last update date
- `analysis` (string) - Analysis notes
- `email_status` (string) - Email verification status
- `first_contact_sent` (boolean) - Whether first contact email was sent
- `exported_to_instantly` (boolean) - If added to instantly.ai as a Lead
- `is_duplicate` (boolean) - Duplicate flag for filtering

**`german_zip_codes`** table:
- `id` (string) - Primary key
- `PLZ` (string) - Postal code
- `Name` (string) - Location name
- `Kreis code` (string) - District code
- `Land name` (string) - State name
- `Land code` (string) - State code
- `Kreis name` (string) - District name

**`finder_felix_executions`** table:
- `id` (string) - Primary key
- `created_at` (timestamp) - Execution timestamp
- `execution` (string) - Execution ID/number
- `postal_code` (string) - Postal code processed
- `num_results` (number) - Number of results found

#### US Financial Advisors Campaign Tables

**`us_financial_advisors`** table:
- `id` (bigint) - Primary key
- `company` (string) - Company/firm name
- `industry` (string) - Industry classification
- `ceo_name` (string) - Contact name
- `phone` (string) - Phone number
- `email` (string) - Email address
- `website` (string) - Website URL
- `address` (string) - Full address
- `district` (string) - District/area
- `city` (string) - City name
- `state` (string) - US state
- `created_at` (timestamp) - Record creation date
- `updated_at` (timestamp) - Last update date
- `analysis` (string) - Analysis notes
- `email_status` (string) - Email verification status
- `first_contact_sent` (boolean) - Whether first contact email was sent
- `exported_to_instantly` (boolean) - If added to instantly.ai
- `is_duplicate` (boolean) - Duplicate flag (NOTE: can be null, queries use `or('is_duplicate.is.null,is_duplicate.eq.false')`)

**`us_zip_codes`** table:
- `id` (bigint) - Primary key
- `zip` (string) - Postal code (primary key)
- `name` (string) - Location name
- `population` (integer) - Population count
- `median_income` (integer) - Median income

## External Integrations

### n8n Webhook Integration
The application integrates with n8n for book PDF processing and enrichment:

#### 1. Book Ingestion Webhook
- **Base URL**: Configured via `N8N_BASE_URL` environment variable
- **Webhook Endpoint**: `/webhook/ingest_book`
- **Purpose**: Upload and process book PDFs to extract metadata and generate summaries
- **Flow**: BookDropzone → `/api/ingest-book` → n8n webhook → Supabase

#### 2. Book Enrichment Webhook
- **Webhook Endpoint**: `/webhook/enrich_book`
- **Purpose**: Enrich existing book data with additional metadata
- **Flow**: "Enrich Book" button → `/api/enrich-book` → n8n webhook → Supabase

#### 3. Email Verification Workflow
- **Workflow ID**: Configured via `VERIFICATION_WORKFLOW_ID` environment variable
- **Purpose**: Track email verification status via n8n workflow
- **API Route**: `/api/verification-last-run` - Fetches last run time and workflow status

### Email Health Monitoring
- **API Route**: `/api/email-health` - Performs DNS lookups for SPF/DMARC/MX records
- **Domains**: Configured in route (currently checks sending domains for warmup status)

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `N8N_BASE_URL` - n8n server base URL (e.g., `https://n8n.megyk.com`)
- `N8N_API_KEY` - n8n API key for workflow status checks
- `VERIFICATION_WORKFLOW_ID` - n8n workflow ID for email verification

Example `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://supabase.megyk.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
N8N_BASE_URL=https://n8n.megyk.com
N8N_API_KEY=your_n8n_api_key
VERIFICATION_WORKFLOW_ID=your_workflow_id
```

## Application Routes

### Public Routes
- `/login` - Authentication page (Supabase Auth with email/password)
- `/` - Home page (redirects to `/books` if authenticated, `/login` if not)

### Protected Dashboard Routes (requires authentication)
- `/books` - Book list with search and pagination
- `/books/new` - Create new book
- `/books/[id]` - View book details
- `/books/[id]/edit` - Edit book
- `/usage` - Usage statistics
- `/sales-campaign` - Redirects to default campaign (german-dentists)
- `/sales-campaign/german-dentists` - German Dentists campaign dashboard
- `/sales-campaign/us-financial-advisors` - US Financial Advisors campaign dashboard

### API Routes
- `/api/ingest-book` - POST endpoint to forward PDF uploads to n8n
- `/api/enrich-book` - POST endpoint to trigger book enrichment via n8n
- `/api/email-health` - GET endpoint for email domain health checks
- `/api/verification-last-run` - GET endpoint for verification workflow status
- `/auth/signout` - POST endpoint to handle sign out

## Navigation Structure

The dashboard uses a responsive layout with:
- **Desktop**: Fixed sidebar with navigation links (Sidebar.tsx) - loaded client-side to avoid hydration issues
- **Mobile**: Collapsible hamburger menu (MobileNav.tsx) - loaded client-side
- **Navigation Items**:
  - Book Summaries → `/books`
  - Usage & Stats → `/usage`
  - Sales Campaign (parent label, not clickable)
    - German Dentists → `/sales-campaign/german-dentists`
    - US Financial Advisors → `/sales-campaign/us-financial-advisors`
- **User Section**: Shows email and sign out button

## Campaign-Aware Components

The `CompanyDashboard` and `AnalyticsDashboard` components accept a `campaign` prop of type `CampaignType`:

```typescript
type CampaignType = 'german-dentists' | 'us-financial-advisors';
```

This prop determines:
- Which data source to fetch from (companies vs advisors)
- Which analytics to display (German has 3 charts including Finder Felix, US has 2)
- Entity labels in the UI ("Companies" vs "Advisors")

## Analytics Dashboard

### German Dentists Campaign (3 charts):
1. **Finder Felix**: Postal code coverage (scraped vs total German postal codes)
2. **Analysis Anna**: Data completeness (companies with websites/emails)
3. **Pitch Paul**: Outreach status (first contact sent)

### US Financial Advisors Campaign (2 charts):
1. **Enrichment**: Data quality (advisors with websites/emails)
2. **Outreach**: Contact status (first contact sent)

## Duplicate Handling

Both campaigns support duplicate detection via `is_duplicate` field:
- German campaign: `is_duplicate` is boolean (true/false)
- US campaign: `is_duplicate` can be null - queries use `.or('is_duplicate.is.null,is_duplicate.eq.false')` to include both null and false values

Deduplication SQL for US campaign:
```sql
UPDATE us_financial_advisors
SET is_duplicate = true
WHERE id NOT IN (
  SELECT MIN(id)
  FROM us_financial_advisors
  WHERE company IS NOT NULL
  GROUP BY company, city, state
)
AND company IS NOT NULL;
```
