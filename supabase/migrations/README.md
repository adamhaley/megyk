# Supabase Migrations

This directory contains SQL migration files for optimizing the analytics queries used by the dashboard.

## Setup

To apply these migrations to your Supabase database:

1. **Using Supabase CLI** (recommended):
   ```bash
   # Install Supabase CLI if you haven't already
   npm install -g supabase
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Push migrations
   supabase db push
   ```

2. **Using Supabase Dashboard**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of each migration file
   - Execute them in order (by timestamp in filename)

## Migrations

### `20240101000000_create_analytics_views.sql`

Creates optimized SQL views and functions for analytics queries:

- **`companies_stats` view**: Provides aggregated statistics about companies (total, with website, with email, exported)
- **`finder_felix_coverage` view**: Provides postal code coverage statistics
- **`get_unique_postal_codes_count()` function**: Returns count of distinct postal codes scraped

These optimizations move calculations from the application layer (JavaScript) to the database layer (SQL), resulting in:
- **Better performance**: Database-level aggregations are faster than fetching all rows
- **Reduced network traffic**: Only aggregated results are transferred
- **Lower memory usage**: No need to load all rows into application memory

## Benefits

After applying these migrations, the analytics dashboard will:
1. First attempt to use the optimized views (fastest)
2. Fall back to efficient count queries if views don't exist
3. Provide the same data structure regardless of which method is used

## Testing

After applying migrations, verify the views work:

```sql
-- Check company statistics
SELECT * FROM companies_stats;

-- Check postal code coverage
SELECT * FROM finder_felix_coverage;

-- Test the function
SELECT get_unique_postal_codes_count();
```

## Permissions

The migrations include `GRANT` statements to allow anonymous access. Adjust these based on your Row Level Security (RLS) policies if you have authentication enabled.









