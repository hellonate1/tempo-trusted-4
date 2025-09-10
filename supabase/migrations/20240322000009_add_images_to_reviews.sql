-- Add images column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Add comment to document the column
COMMENT ON COLUMN public.reviews.images IS 'Array of image URLs uploaded by the reviewer';
