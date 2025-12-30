-- Get the full function definition
SELECT pg_get_functiondef(oid) as full_function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'auth' 
  AND p.proname = 'jwt_custom_claims';

-- Also verify it's the correct function by checking what it would return for your user
-- (This simulates what happens when the user is authenticated)
SELECT 
  au.id as user_id,
  au.email,
  up.role as user_profile_role,
  jsonb_build_object(
    'role',
    up.role
  ) as what_jwt_should_contain
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.user_id = au.id
WHERE au.email = 'adamhaley@gmail.com';

