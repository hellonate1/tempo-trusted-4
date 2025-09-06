-- Create review_votes table
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id) -- Each user can only vote once per review
);

-- Create review_comments table
CREATE TABLE IF NOT EXISTS review_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_review_id ON review_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_user_id ON review_comments(user_id);

-- Enable RLS
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for review_votes
DROP POLICY IF EXISTS "Users can view all votes" ON review_votes;
CREATE POLICY "Users can view all votes" ON review_votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert their own votes" ON review_votes;
CREATE POLICY "Authenticated users can insert their own votes" ON review_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own votes" ON review_votes;
CREATE POLICY "Users can update their own votes" ON review_votes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own votes" ON review_votes;
CREATE POLICY "Users can delete their own votes" ON review_votes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for review_comments
DROP POLICY IF EXISTS "Users can view all comments" ON review_comments;
CREATE POLICY "Users can view all comments" ON review_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert their own comments" ON review_comments;
CREATE POLICY "Authenticated users can insert their own comments" ON review_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON review_comments;
CREATE POLICY "Users can update their own comments" ON review_comments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON review_comments;
CREATE POLICY "Users can delete their own comments" ON review_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update vote counts on reviews table
CREATE OR REPLACE FUNCTION update_review_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the review's vote counts
  UPDATE reviews 
  SET 
    helpful_count = (
      SELECT COUNT(*) FROM review_votes 
      WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
      AND vote_type = 'up'
    ),
    not_helpful_count = (
      SELECT COUNT(*) FROM review_votes 
      WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
      AND vote_type = 'down'
    )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update vote counts
DROP TRIGGER IF EXISTS update_review_vote_counts_trigger ON review_votes;
CREATE TRIGGER update_review_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW EXECUTE FUNCTION update_review_vote_counts();

-- Function to update comment count on reviews table
CREATE OR REPLACE FUNCTION update_review_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the review's comment count
  UPDATE reviews 
  SET comment_count = (
    SELECT COUNT(*) FROM review_comments 
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update comment count
DROP TRIGGER IF EXISTS update_review_comment_count_trigger ON review_comments;
CREATE TRIGGER update_review_comment_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON review_comments
  FOR EACH ROW EXECUTE FUNCTION update_review_comment_count();

-- Add not_helpful_count column to reviews table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'reviews' AND column_name = 'not_helpful_count') THEN
    ALTER TABLE reviews ADD COLUMN not_helpful_count INTEGER DEFAULT 0;
  END IF;
END $$;
