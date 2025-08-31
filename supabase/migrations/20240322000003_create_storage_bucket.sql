-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for review images
CREATE POLICY "Anyone can view review images" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own review images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'review-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own review images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'review-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
