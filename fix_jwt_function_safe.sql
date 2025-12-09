-- Make the JWT custom claims function more defensive to prevent hangs
-- This version handles errors gracefully and won't break other apps

CREATE OR REPLACE FUNCTION auth.jwt_custom_claims()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Safely get the role from user_profiles
  -- Returns null if table doesn't exist, user doesn't exist, or any error occurs
  BEGIN
    SELECT role INTO user_role
    FROM public.user_profiles
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    -- Return the role if found, otherwise return empty object
    IF user_role IS NOT NULL THEN
      RETURN jsonb_build_object('role', user_role);
    ELSE
      RETURN jsonb_build_object('role', NULL);
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- If anything goes wrong (table doesn't exist, RLS blocks, etc.)
      -- Return empty/null role instead of failing
      RETURN jsonb_build_object('role', NULL);
  END;
END;
$$;

-- Verify it works
SELECT auth.jwt_custom_claims();

