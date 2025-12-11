-- ============================================================================
-- FIX: Remove problematic recursive policies and create simple ones
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "user_read_own_role" ON user_roles;
DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update all roles" ON user_roles;

-- Create simple, non-recursive policies

-- 1. Users can read their own role (no recursion)
CREATE POLICY "users_read_own_role" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Users can insert their own role during signup
CREATE POLICY "users_insert_own_role" ON user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own role (optional, can be removed if only admins should update)
CREATE POLICY "users_update_own_role" ON user_roles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFY: Check all policies
-- ============================================================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_roles';
