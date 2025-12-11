/**
 * Supabase Database Setup Script
 * 
 * Run this SQL script in your Supabase SQL Editor to set up the database
 * for VaultBoard's authentication system.
 * 
 * Access the SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql
 */

-- =============================================================================
-- CREATE USER_ROLES TABLE
-- =============================================================================
-- This table stores user role information for role-based access control

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
-- Enable RLS to ensure users can only access data they're authorized to see

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE RLS POLICIES
-- =============================================================================

-- Policy: Users can read their own role
CREATE POLICY "Users can read their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own role during signup
CREATE POLICY "Users can insert their own role during signup"
  ON user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can read all roles
CREATE POLICY "Admins can read all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update all roles
CREATE POLICY "Admins can update all roles"
  ON user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can delete roles
CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================================================
-- CREATE INDEXES
-- =============================================================================
-- Create indexes for faster lookups

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- =============================================================================
-- CREATE UPDATED_AT TRIGGER
-- =============================================================================
-- Automatically update the updated_at timestamp when a row is modified

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these queries to verify the setup

-- Check if table was created
-- SELECT * FROM user_roles LIMIT 5;

-- Check if policies were created
-- SELECT * FROM pg_policies WHERE tablename = 'user_roles';

-- Check if indexes were created
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'user_roles';
