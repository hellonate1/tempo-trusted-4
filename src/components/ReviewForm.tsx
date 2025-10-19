import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star, Upload, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import heic2any from "heic2any";

interface ReviewFormProps {
  productId?: string;
  initialData?: {
    title: string;
    content: string;
    rating: number;
    images: string[];
  };
  onSubmit?: (data: {
    title: string;
    content: string;
    rating: number;
    images: string[];
  }) => void;
  onCancel?: () => void;
}

const ReviewForm = ({
  productId = "",
  initialData = {
    title: "",
    content: "",
    rating: 0,
    images: [],
  },
  onSubmit = () => {},
  onCancel = () => {},
}: ReviewFormProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [rating, setRating] = useState(initialData.rating);
  const [images, setImages] = useState<string[]>(initialData.images);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Debug: Log when images state changes
  useEffect(() => {
    console.log('Images state updated:', images);
  }, [images]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) {
      console.log('No files or user:', { files: e.target.files, user });
      return;
    }
    
    console.log('Starting image upload...');
    setUploading(true);
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        console.log('Uploading file:', file.name, file.size);
        
        // Convert HEIC to JPEG if needed
        let fileToUpload = file;
        let fileExt = file.name.split('.').pop()?.toLowerCase();
        
        if (fileExt === 'heic' || fileExt === 'heif') {
          console.log('Converting HEIC to JPEG...');
          try {
            const convertedBlob = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.8
            }) as Blob;

            fileToUpload = new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
              type: 'image/jpeg'
            });
            fileExt = 'jpg';
            console.log('HEIC conversion successful');
          } catch (conversionError) {
            console.error('HEIC conversion failed:', conversionError);
            continue; // Skip this file if conversion fails
          }
        }
        
        // Create unique filename
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = fileName; // Remove the review-images/ prefix since bucket is already review-images

        console.log('Uploading to path:', filePath);

        // Use review-images bucket (which exists in your Supabase)
        const bucketName = 'review-images';
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, fileToUpload);

        if (error) {
          console.error('Upload error:', error);
          continue;
        }

        console.log('Upload successful:', data);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        console.log('Public URL:', publicUrl);
        uploadedUrls.push(publicUrl);
      }

      console.log('All uploads complete, setting images:', uploadedUrls);
      console.log('Current images before update:', images);
      const newImages = [...images, ...uploadedUrls];
      console.log('New images array:', newImages);
      setImages(newImages);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      content,
      rating,
      images,
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Write Your Review</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Rating Selector */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={32}
                    className={`${star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {rating > 0
                  ? `${rating} star${rating > 1 ? "s" : ""}`
                  : "Select a rating"}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Review</Label>
            <Textarea
              id="content"
              placeholder="Share your experience with this product..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] w-full"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="images">Add Photos (Optional)</Label>
            <div className="flex items-center">
              <label
                htmlFor="image-upload"
                className={`flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
                    <span className="text-xs text-gray-500 mt-1">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="sr-only">Upload images</span>
                  </>
                )}
              </label>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!rating || !title || !content || uploading}>
            {uploading ? "Uploading..." : "Submit Review"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ReviewForm;
