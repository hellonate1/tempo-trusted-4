-- Migration to add avatar_url and full_name columns to users table
-- This allows users to upload and store profile pictures and store their full name

-- Step 1: Add avatar_url column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Step 2: Add full_name column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Step 3: Add comments to document the columns
COMMENT ON COLUMN public.users.avatar_url IS 'URL of the user profile picture stored in Supabase storage';
COMMENT ON COLUMN public.users.full_name IS 'Full name of the user (from Google auth or manually set)';
