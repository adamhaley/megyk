-- Query 1: Check if user_profiles row exists for this user
SELECT 
  up.user_id,
  up.role,
  au.email,
  au.id as auth_user_id
FROM public.user_profiles up
RIGHT JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'adamhaley@gmail.com';

-- Query 2: Check all user_profiles to see the structure
SELECT 
  user_id,
  role,
  (SELECT email FROM auth.users WHERE id = user_id) as email
FROM public.user_profiles
ORDER BY role DESC;

-- Query 3: Create or update user_profiles row for admin user
-- Replace the email with your actual email
INSERT INTO public.user_profiles (user_id, role)
SELECT id, 'admin' 
FROM auth.users 
WHERE email = 'adamhaley@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

