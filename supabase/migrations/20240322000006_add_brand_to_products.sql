-- Add brand column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand TEXT;

-- Add index for better performance on brand searches
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);

