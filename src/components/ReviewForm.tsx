import React, { useState } from "react";
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
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [rating, setRating] = useState(initialData.rating);
  const [images, setImages] = useState<string[]>(initialData.images);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map((file) => {
        // In a real app, we would upload to a server and get back URLs
        // For now, create object URLs for preview
        return URL.createObjectURL(file);
      });
      setImages([...images, ...newImages]);
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
                className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400"
              >
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="sr-only">Upload images</span>
              </label>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
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
          <Button type="submit" disabled={!rating || !title || !content}>
            Submit Review
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ReviewForm;
