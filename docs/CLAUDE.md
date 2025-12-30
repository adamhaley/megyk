# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **dual-purpose Next.js 15 dashboard** for Megyk.com with two main sections:

1. **Book Summaries Management** - CRUD application for managing book summaries with PDF ingestion via n8n
2. **Sales Campaign Dashboard** - Analytics and data display for German dentist lead generation campaign

The application uses TypeScript, Tailwind CSS 4, React 19, and server-side rendering with the App Router. Authentication is handled via Supabase Auth with SSR support.

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

- **Frontend**: React 19 with TypeScript, Tailwind CSS for styling
- **Backend**: Supabase for database operations
- **Data Layer**: Custom hooks and API functions in `src/lib/`
- **Components**: Reusable UI components in `src/components/`
- **Types**: TypeScript interfaces in `src/types/`

### Key Files

**Authentication & Core:**
- `src/lib/supabase.ts` - Browser Supabase client configuration
- `src/lib/supabase-server.ts` - Server-side Supabase client with cookie handling (SSR)
- `src/app/(dashboard)/layout.tsx` - Protected dashboard layout with auth check
- `src/app/login/page.tsx` - Login page with Supabase Auth
- `src/app/auth/signout/route.ts` - Sign out API route

**Book Management System:**
- `src/lib/books.ts` - Book CRUD operations with pagination and search
- `src/types/book.ts` - TypeScript interfaces for book data
- `src/components/BookList.tsx` - Book listing component
- `src/components/BookForm.tsx` - Book creation/editing form
- `src/components/BookDropzone.tsx` - PDF upload component
- `src/app/api/ingest-book/route.ts` - API route that forwards PDFs to n8n webhook

**Sales Campaign Dashboard:**
- `src/lib/companies.ts` - Company data fetching logic with pagination and search
- `src/lib/analytics.ts` - Analytics data fetching with SQL view optimization
- `src/types/company.ts` - TypeScript interfaces for company data
- `src/components/CompanyDashboard.tsx` - Main dashboard component with state management
- `src/components/CompanyTable.tsx` - Company data display component
- `src/components/AnalyticsDashboard.tsx` - Three-chart analytics dashboard
- `src/components/AnalyticsChart.tsx` - Reusable donut chart component (using Recharts)
- `src/components/SearchBar.tsx` - Search functionality component

### Database Schema

The application uses two separate database schemas:

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

#### Sales Campaign Tables

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
- `analysis` (string) - Analysis notes
- exported_to_instantly (boolean) - If the company has been added to instantly.ai as a Lead

**`german_zip_codes`** table:
- `id` (string) - Primary key
- `created_at` (timestamp) - Record creation date
- `Name` (string) - Zip code name/number
- `PLZ` (string) - Postal code
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

## External Integrations

### n8n Webhook Integration
The application integrates with n8n for book PDF processing and enrichment:

#### 1. Book Ingestion Webhook
- **Base URL**: Configured via `N8N_BASE_URL` environment variable
- **Webhook Endpoint**: `/webhook/ingest_book` (hardcoded in API route)
- **Full URL**: `${N8N_BASE_URL}/webhook/ingest_book`
- **Purpose**: Upload and process book PDFs to extract metadata and generate summaries
- **Flow**: BookDropzone → `/api/ingest-book` → n8n webhook → Supabase
- **Method**: POST (multipart/form-data)

#### 2. Book Enrichment Webhook
- **Base URL**: Configured via `N8N_BASE_URL` environment variable
- **Webhook Endpoint**: `/webhook/enrich_book` (hardcoded in API route)
- **Full URL**: `${N8N_BASE_URL}/webhook/enrich_book`
- **Purpose**: Enrich existing book data with additional metadata
- **Flow**: "Enrich Book" button → `/api/enrich-book` → n8n webhook → Supabase
- **Method**: POST (application/json)
- **Body**: `{ "bookId": "uuid" }`

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `N8N_BASE_URL` - n8n server base URL (e.g., `https://n8n.megyk.com`)

Example `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
N8N_BASE_URL=https://n8n.megyk.com
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
- `/sales-campaign` - Sales campaign analytics dashboard

### API Routes
- `/api/ingest-book` - POST endpoint to forward PDF uploads to n8n (multipart/form-data)
- `/api/enrich-book` - POST endpoint to trigger book enrichment via n8n (JSON body with bookId)
- `/auth/signout` - POST endpoint to handle sign out

## Navigation Structure

The dashboard uses a responsive layout with:
- **Desktop**: Fixed sidebar with navigation links (Sidebar.tsx)
- **Mobile**: Collapsible hamburger menu (MobileNav.tsx)
- **Navigation Items**:
  - Book Summaries → `/books`
  - Sales Campaign → `/sales-campaign`
- **User Section**: Shows email and sign out button

## Authentication Implementation

The application uses **Supabase Auth with SSR** pattern:
- Server-side authentication check in `(dashboard)/layout.tsx`
- Uses `@supabase/ssr` package for cookie-based session management
- Redirects unauthenticated users to `/login`
- Session accessible via `createServerComponentClient()` helper
- Client-side auth state managed by Supabase client

### Auth Flow:
1. User visits protected route → Server component checks session
2. No session → Redirect to `/login`
3. User logs in → Supabase sets auth cookies
4. Session persists across page loads via cookies
5. Sign out → POST to `/auth/signout` → Clear cookies → Redirect to `/login`

## Data Fetching Patterns

The application uses multiple data fetching strategies:

### Book Management
- Client-side fetching with React state (`'use client'` components)
- Server-side pagination with `range()` queries
- Search across title and author fields using `ilike`
- Load more functionality for infinite scroll
- Optimistic loading states and error handling

### Sales Campaign
- Server-side pagination with `range()` queries
- Search across company name, email, and website fields using `ilike` 
- Optimistic loading states and error handling
- Load more functionality for infinite scroll behavior
- **Optimized analytics queries** with fallback strategy:
  1. First attempts to use SQL views (`companies_stats`, `finder_felix_coverage`)
  2. Falls back to RPC function (`get_unique_postal_codes_count()`)
  3. Falls back to optimized count queries with filters
  4. Analytics data spans multiple tables:
     - Postal code coverage via `finder_felix_executions` vs `german_zip_codes`
     - Data completeness statistics from `german_companies`
     - Real-time chart updates with proper error handling

## Analytics Dashboard

The dashboard displays three main analytics charts:
1. **Finder Felix**: Shows postal code coverage (scraped vs total German postal codes)
2. **Analysis Anna**: Shows data completeness (companies with websites/emails)
3. **Pitch Paul**: Shows export status to instantly.ai (real data from exported_to_instantly field)

Charts use real data from the database with fallback to placeholder data where fields don't exist yet.
