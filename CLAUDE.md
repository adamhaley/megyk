# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js dashboard for Megyk.com that displays company/campaign/automation data from Supabase. The application uses TypeScript, Tailwind CSS, and server-side rendering with the App Router.

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

- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/companies.ts` - Company data fetching logic with pagination and search
- `src/types/company.ts` - TypeScript interfaces for company data
- `src/components/CompanyDashboard.tsx` - Main dashboard component with state management
- `src/components/CompanyTable.tsx` - Company data display component
- `src/components/SearchBar.tsx` - Search functionality component

### Database Schema

The application uses three main tables:

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

## Environment Variables

Required environment variables for Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Data Fetching Patterns

The application uses:
- Server-side pagination with `range()` queries
- Search across company name, email, and website fields using `ilike` 
- Optimistic loading states and error handling
- Load more functionality for infinite scroll behavior
- Analytics queries across multiple tables for dashboard charts:
  - Postal code coverage via `finder_felix_executions` vs `german_zip_codes`
  - Data completeness statistics from `german_companies`
  - Real-time chart updates with proper error handling

## Analytics Dashboard

The dashboard displays three main analytics charts:
1. **Finder Felix**: Shows postal code coverage (scraped vs total German postal codes)
2. **Analysis Anna**: Shows data completeness (companies with websites/emails)
3. **Pitch Paul**: Shows export status (placeholder for future "instantly" integration)

Charts use real data from the database with fallback to placeholder data where fields don't exist yet.
