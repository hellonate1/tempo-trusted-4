-- Migration to move images from products to reviews
-- This migration handles the transition from product-based images to review-based images

-- Step 1: Add images column to reviews table if it doesn't exist
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Step 2: Migrate existing product images to reviews
-- For each review, if the product has an image_url, add it to the review's images array
UPDATE public.reviews 
SET images = ARRAY[p.image_url]
FROM public.products p
WHERE reviews.product_id = p.id 
  AND p.image_url IS NOT NULL 
  AND p.image_url != ''
  AND (reviews.images IS NULL OR array_length(reviews.images, 1) IS NULL);

-- Step 3: Remove image_url column from products table
-- (We'll do this in a separate migration to be safe)
-- ALTER TABLE public.products DROP COLUMN IF EXISTS image_url;

-- Step 4: Update any existing reviews that might have empty images arrays
UPDATE public.reviews 
SET images = NULL 
WHERE images = ARRAY[''] OR images = ARRAY[NULL];

-- Step 5: Add index for better performance on images queries
CREATE INDEX IF NOT EXISTS idx_reviews_images ON public.reviews USING GIN (images);

-- Step 6: Add comment to document the change
COMMENT ON COLUMN public.reviews.images IS 'Array of image URLs associated with this review. Moved from products.image_url for better data modeling.';
