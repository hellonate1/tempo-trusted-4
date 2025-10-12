-- Migration to add avatar_url column to users table
-- This allows users to upload and store profile pictures

-- Step 1: Add avatar_url column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Step 2: Add comment to document the column
COMMENT ON COLUMN public.users.avatar_url IS 'URL of the user profile picture stored in Supabase storage';
