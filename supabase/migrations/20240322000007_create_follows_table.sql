-- Create follows table to track user relationships
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure a user can't follow themselves
  CONSTRAINT no_self_follow CHECK (follower_id != following_id),
  
  -- Ensure unique follow relationships (no duplicate follows)
  UNIQUE(follower_id, following_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON public.follows(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view all follow relationships (for follower/following counts)
CREATE POLICY "Anyone can view follows" ON public.follows
  FOR SELECT USING (true);

-- Users can only create follows for themselves
CREATE POLICY "Users can follow others" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can only delete their own follows
CREATE POLICY "Users can unfollow others" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Create a function to get follower count for a user
CREATE OR REPLACE FUNCTION public.get_follower_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM public.follows 
    WHERE following_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get following count for a user
CREATE OR REPLACE FUNCTION public.get_following_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM public.follows 
    WHERE follower_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if current user follows another user
CREATE OR REPLACE FUNCTION public.is_following(follower_id UUID, following_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.follows 
    WHERE public.follows.follower_id = is_following.follower_id 
    AND public.follows.following_id = is_following.following_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add the follows table to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE follows;
