-- Verify the auth.jwt_custom_claims() function exists and is correct
-- Run this in Supabase SQL Editor

-- 1. Check if the function exists
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'auth' 
  AND p.proname = 'jwt_custom_claims';

-- 2. If it doesn't exist or is wrong, create/replace it:
CREATE OR REPLACE FUNCTION auth.jwt_custom_claims()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'role',
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid())
  );
$$;

-- 3. Test the function (this will return null in SQL editor, but works when user is authenticated)
SELECT auth.jwt_custom_claims();

-- 4. Verify it works by simulating with a specific user_id
SELECT 
  au.id,
  au.email,
  up.role,
  jsonb_build_object(
    'role',
    up.role
  ) as simulated_jwt_claims
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.user_id = au.id
WHERE au.email = 'adamhaley@gmail.com';

