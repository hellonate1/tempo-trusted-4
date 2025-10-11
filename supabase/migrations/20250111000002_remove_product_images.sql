-- Migration to remove image_url column from products table
-- Run this after confirming the previous migration worked correctly

-- Step 1: Remove image_url column from products table
ALTER TABLE public.products DROP COLUMN IF EXISTS image_url;

-- Step 2: Update any RLS policies that might reference image_url
-- (Check if any policies need updating)

-- Step 3: Add comment to document the change
COMMENT ON TABLE public.products IS 'Products table. Images are now stored in reviews.images array instead of products.image_url.';
