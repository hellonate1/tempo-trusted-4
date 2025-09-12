-- Fix the foreign key relationship between reviews and users
-- The reviews table currently references auth.users, but we need it to reference public.users

-- First, let's check if the foreign key constraint exists
-- If it does, we need to drop it and recreate it

-- Drop the existing foreign key constraint if it exists
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS fk_reviews_user;

-- Add the correct foreign key constraint to reference public.users
ALTER TABLE public.reviews 
ADD CONSTRAINT fk_reviews_user 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Update the RLS policies to work with the new relationship
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

-- Recreate policies with correct user reference
CREATE POLICY "Users can view all reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);
