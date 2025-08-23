-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create products table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add foreign key constraint for reviews.product_id
ALTER TABLE public.reviews 
ADD CONSTRAINT fk_reviews_product 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "Users can view all reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for products
CREATE POLICY "Users can view all products" ON public.products
  FOR SELECT USING (true);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Insert some sample products for testing
INSERT INTO public.products (name, description, image_url, price, category) VALUES
  ('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80', 199.99, 'Electronics'),
  ('Smartphone', 'Latest smartphone with advanced features', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80', 799.99, 'Electronics'),
  ('Coffee Maker', 'Automatic coffee maker for perfect brew every time', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=80', 89.99, 'Home & Kitchen'),
  ('Running Shoes', 'Comfortable running shoes for all terrains', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80', 129.99, 'Sports')
ON CONFLICT DO NOTHING;
