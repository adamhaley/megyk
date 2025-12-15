-- Verify the user_profiles table structure
-- Check if it has user_id or id as the primary key

-- 1. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 2. Check if user_id exists and what it references
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'user_profiles';

-- 3. The correct query should be:
-- UPDATE public.user_profiles
-- SET role = 'admin'
-- WHERE user_id = 'a5667469-887b-443d-a241-225cb86b2332';

-- 4. Verify the user exists in auth.users first:
-- SELECT id, email FROM auth.users WHERE id = 'a5667469-887b-443d-a241-225cb86b2332';


