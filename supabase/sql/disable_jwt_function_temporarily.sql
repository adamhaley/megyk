-- Temporarily disable the JWT custom claims function to test if it's causing the hang
-- This version returns immediately without any database queries

CREATE OR REPLACE FUNCTION auth.jwt_custom_claims()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  -- Return empty object immediately - no database queries
  SELECT jsonb_build_object('role', NULL);
$$;

-- Verify it's updated
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'auth' 
  AND p.proname = 'jwt_custom_claims';

