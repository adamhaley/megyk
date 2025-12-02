-- Data Plumbing: Optimized Analytics Views and Functions
-- These views/functions replace client-side calculations with efficient SQL aggregations

-- View: Company Statistics Summary
-- Provides aggregated counts for website, email, and export statistics
CREATE OR REPLACE VIEW companies_stats AS
SELECT 
  COUNT(*)::integer AS total_companies,
  COUNT(*) FILTER (WHERE website IS NOT NULL AND website <> '')::integer AS companies_with_website,
  COUNT(*) FILTER (WHERE email IS NOT NULL AND email <> '')::integer AS companies_with_email,
  COUNT(*) FILTER (WHERE exported_to_instantly = true)::integer AS exported_companies,
  ROUND(
    COUNT(*) FILTER (WHERE website IS NOT NULL AND website <> '')::float / NULLIF(COUNT(*), 0) * 100,
    0
  )::integer AS website_percentage,
  ROUND(
    COUNT(*) FILTER (WHERE email IS NOT NULL AND email <> '')::float / NULLIF(COUNT(*), 0) * 100,
    0
  )::integer AS email_percentage,
  ROUND(
    COUNT(*) FILTER (WHERE exported_to_instantly = true)::float / NULLIF(COUNT(*), 0) * 100,
    0
  )::integer AS export_percentage
FROM german_companies;

-- Function: Get Unique Postal Code Coverage Count
-- Returns the count of distinct postal codes that have been scraped by Finder Felix
CREATE OR REPLACE FUNCTION get_unique_postal_codes_count()
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(DISTINCT postal_code)::integer
  FROM finder_felix_executions
  WHERE postal_code IS NOT NULL;
$$;

-- View: Finder Felix Coverage Summary
-- Provides postal code coverage statistics
CREATE OR REPLACE VIEW finder_felix_coverage AS
SELECT 
  (SELECT COUNT(*)::integer FROM german_zip_codes) AS total_postal_codes,
  get_unique_postal_codes_count() AS covered_postal_codes,
  ROUND(
    get_unique_postal_codes_count()::float / NULLIF((SELECT COUNT(*) FROM german_zip_codes), 0) * 100,
    0
  )::integer AS coverage_percentage;

-- Grant permissions for anonymous access (adjust based on your RLS policies)
-- These views/functions should be accessible to your Next.js app
GRANT SELECT ON companies_stats TO anon;
GRANT SELECT ON finder_felix_coverage TO anon;
GRANT EXECUTE ON FUNCTION get_unique_postal_codes_count() TO anon;


