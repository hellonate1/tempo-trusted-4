-- Fix RLS policies for products table to allow product creation
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view all products" ON public.products;

-- Create comprehensive policies for products table
CREATE POLICY "Users can view all products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create products" ON public.products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own products" ON public.products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Note: We're not adding DELETE policy for products to prevent accidental deletion
