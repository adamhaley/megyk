-- Check the current state of the JWT custom claims function
-- This will help diagnose if it's causing the hang on megyk.com

-- 1. Check if function exists and get its definition
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'auth' 
  AND p.proname = 'jwt_custom_claims';

-- 2. Test if the function can execute without hanging
-- This should return quickly with role: null
SELECT auth.jwt_custom_claims();

-- 3. If the function is still problematic, completely remove it:
-- DROP FUNCTION IF EXISTS auth.jwt_custom_claims();

