-- Debug query to check user_profiles and role setup
-- Replace 'adamhaley@gmail.com' with the email you're testing

-- 1. Check if user_profiles row exists for this user
SELECT 
  up.user_id,
  up.role,
  au.email,
  au.id as auth_user_id
FROM public.user_profiles up
RIGHT JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'adamhaley@gmail.com';

-- 2. Check all user_profiles to see the structure
SELECT 
  user_id,
  role,
  (SELECT email FROM auth.users WHERE id = user_id) as email
FROM public.user_profiles
ORDER BY role DESC;

-- 3. Verify the JWT custom claims function works for a specific user
-- This simulates what happens when that user is authenticated
SELECT 
  au.id,
  au.email,
  up.role,
  auth.jwt_custom_claims() as jwt_claims
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.user_id = au.id
WHERE au.email = 'adamhaley@gmail.com';

-- 4. If the user_profiles row doesn't exist, create it:
-- INSERT INTO public.user_profiles (user_id, role)
-- SELECT id, 'admin' 
-- FROM auth.users 
-- WHERE email = 'adamhaley@gmail.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

