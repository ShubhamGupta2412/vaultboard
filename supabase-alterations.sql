-- ============================================================================
-- ALTERATIONS FOR EXISTING user_roles TABLE
-- Run these commands in your Supabase SQL Editor
-- ============================================================================

-- 1. Add missing 'email' column
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';

-- 2. Add missing 'updated_at' column
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 3. Add index for email (for performance)
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email);

-- 4. Add missing RLS policies for INSERT (needed for signup)
-- Drop policy if it exists and recreate
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON user_roles;
CREATE POLICY "Users can insert their own role during signup"
  ON user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Add RLS policy for admins to read all roles (optional but recommended)
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;
CREATE POLICY "Admins can read all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Add RLS policy for admins to update roles (optional but recommended)
DROP POLICY IF EXISTS "Admins can update all roles" ON user_roles;
CREATE POLICY "Admins can update all roles"
  ON user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Create trigger to auto-update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify all columns exist:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_roles';

-- Run this to verify all policies exist:
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'user_roles';
