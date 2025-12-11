-- Check current schema of user_roles table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- ✅ Schema is correct! Now update existing rows with email from auth.users:
UPDATE user_roles ur
SET email = au.email
FROM auth.users au
WHERE ur.user_id = au.id AND (ur.email IS NULL OR ur.email = '');

-- Verify the update:
SELECT * FROM user_roles;
