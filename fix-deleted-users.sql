-- Fix existing soft-deleted users by appending timestamp to their username and email
-- This frees up those credentials for reuse

-- First, let's see which users are soft-deleted
SELECT id, username, email, is_active, created_at 
FROM users 
WHERE is_active = FALSE 
  AND username NOT LIKE '%_deleted_%';

-- Update existing soft-deleted users to free up their usernames and emails
UPDATE users 
SET 
  username = CONCAT(username, '_deleted_', UNIX_TIMESTAMP(updated_at)),
  email = CONCAT(email, '_deleted_', UNIX_TIMESTAMP(updated_at))
WHERE is_active = FALSE 
  AND username NOT LIKE '%_deleted_%';

-- Verify the changes
SELECT id, username, email, is_active 
FROM users 
WHERE is_active = FALSE;
