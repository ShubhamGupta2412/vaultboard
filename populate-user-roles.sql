-- ============================================================================
-- FIX: Check and populate missing user_roles entries
-- ============================================================================

-- 1. Check which users are missing from user_roles
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE ur.user_id IS NULL;

-- 2. Insert missing users into user_roles with default 'member' role
-- (Change 'member' to 'admin' if you want your first user to be admin)
INSERT INTO user_roles (user_id, email, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  'admin' as role,  -- Change to 'member', 'manager', 'viewer' if needed
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE ur.user_id IS NULL;

-- 3. Verify all users now have roles
SELECT 
  au.email as auth_email,
  ur.email as role_email,
  ur.role,
  ur.created_at
FROM auth.users au
JOIN user_roles ur ON au.id = ur.user_id;
