# Write Review Setup Guide

## 🎯 Features Included

The Write Review page includes:
- ✅ **Product Search**: Search existing products or create new ones
- ✅ **Product Information**: Name, description, category
- ✅ **Review Content**: Title and detailed review text
- ✅ **Star Rating**: Interactive 1-5 star rating system
- ✅ **Image Upload**: Upload up to 5 photos with preview
- ✅ **Form Validation**: Complete validation and error handling
- ✅ **Authentication**: Only signed-in users can write reviews

## 🗄️ Database Requirements

### Existing Tables (from previous migrations):
- `users` - User profiles
- `products` - Product information
- `reviews` - User reviews

### New Storage Setup:
- `review-images` bucket for storing review photos

## 🔧 Setup Instructions

### Step 1: Run Storage Migration

Run this SQL in your Supabase SQL Editor:

```sql
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
```

### Step 2: Verify Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Verify that `review-images` bucket exists
4. Check that it's set to **Public**

## 🧪 Testing the Write Review Page

### Test Steps:
1. **Sign in** to your account
2. **Click "Write a Review"** in the header
3. **Search for a product** or enter a new one
4. **Fill in the review form**:
   - Product name and description
   - Review title and content
   - Select a star rating
   - Upload some test images
5. **Submit the review**
6. **Verify** it appears on your profile

### Test Scenarios:
- ✅ **New Product**: Enter a product that doesn't exist
- ✅ **Existing Product**: Search and select an existing product
- ✅ **Image Upload**: Upload multiple images and remove some
- ✅ **Form Validation**: Try submitting with missing fields
- ✅ **Authentication**: Test without being signed in

## 📱 User Experience

### For Signed-in Users:
- Full access to write reviews
- Can upload images
- Can search existing products
- Can create new products

### For Non-signed-in Users:
- Redirected to sign-in page
- Can't access write review functionality

## 🔍 Troubleshooting

### Common Issues:

1. **"Storage bucket not found" error**:
   - Run the storage migration SQL
   - Check that the bucket exists in Storage dashboard

2. **"Permission denied" for image upload**:
   - Verify storage policies are created
   - Check that user is authenticated

3. **Product search not working**:
   - Verify products table exists
   - Check RLS policies for products table

4. **Review submission fails**:
   - Check browser console for errors
   - Verify all required fields are filled
   - Check that user is authenticated

## 🚀 Next Steps

After setup, consider adding:
- **Review editing** functionality
- **Review moderation** system
- **Review helpfulness** voting
- **Review comments** system
- **Review analytics** and insights

The Write Review system is now fully functional! 🎉
