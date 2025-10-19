import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  BookmarkPlus,
  ArrowLeft,
  Loader2,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReviewCard from "@/components/ReviewCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReviewForm from "@/components/ReviewForm";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  price?: number;
  created_at: string;
}

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  helpful_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  users: {
    username: string;
    bio?: string;
  };
}

interface ReviewCardProps {
  review: Review;
}


const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("description");
  const [reviewSort, setReviewSort] = useState("newest");

  const sortReviews = (reviews: Review[], sortType: string) => {
    const sortedReviews = [...reviews];
    
    switch (sortType) {
      case "newest":
        return sortedReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "oldest":
        return sortedReviews.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case "rating-high":
        return sortedReviews.sort((a, b) => b.rating - a.rating);
      case "rating-low":
        return sortedReviews.sort((a, b) => a.rating - b.rating);
      default:
        return sortedReviews;
    }
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setBrokenImages(prev => new Set([...prev, index]));
  };

  // Fetch product and reviews data
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) {
          console.error('Product fetch error:', productError);
          setError('Product not found');
          return;
        }

        setProduct(productData);

        // Fetch reviews first
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', id)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error('Reviews fetch error:', reviewsError);
          setError('Failed to load reviews');
          return;
        }

        // Fetch user data for each review
        const reviewsWithUsers = await Promise.all(
          (reviewsData || []).map(async (review) => {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('username, bio, avatar_url')
              .eq('id', review.user_id)
              .single();

            return {
              ...review,
              users: userData || { username: 'Unknown User', bio: null }
            };
          })
        );

        setReviews(reviewsWithUsers);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('An error occurred while loading the product');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // Calculate average rating and rating distribution
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(review => review.rating === stars).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  // Get all images from reviews
  const getAllImages = () => {
    const images: string[] = [];
    
    // Add review images
    reviews.forEach(review => {
      if (review.images) {
        images.push(...review.images);
      }
    });
    
    return images;
  };

  const allImages = getAllImages();

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-2 text-lg font-medium">{rating.toFixed(1)}</span>
        <span className="ml-2 text-sm text-gray-500">
          ({reviews.length} reviews)
        </span>
      </div>
    );
  };

  // Handle review form submission
  const handleReviewSubmit = async (reviewData: {
    title: string;
    content: string;
    rating: number;
    images: string[];
  }) => {
    if (!user || !product) return;

    try {
      // Create the review
      const { data: newReview, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: product.id,
          rating: reviewData.rating,
          title: reviewData.title,
          content: reviewData.content,
          images: reviewData.images
        })
        .select('*')
        .single();

      if (reviewError) {
        console.error('Review creation error:', reviewError);
        return;
      }

      // Fetch user data for the new review
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, bio, avatar_url')
        .eq('id', newReview.user_id)
        .single();

      const reviewWithUser = {
        ...newReview,
        users: userData || { username: 'Unknown User', bio: null }
      };

      // Add the new review to the list
      console.log('New review with images:', reviewWithUser);
      console.log('Review images:', reviewWithUser.images);
      setReviews(prev => [reviewWithUser, ...prev]);
      
      // Close the modal after successful submission
      setShowReviewModal(false);
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Product Header */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Product Images */}
          <div className="lg:w-1/2">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                {allImages.length > 0 && !brokenImages.has(currentImageIndex) ? (
                  <img
                    src={allImages[currentImageIndex]}
                    alt=""
                    className="h-full w-full object-cover object-center cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                    onError={() => handleImageError(currentImageIndex)}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Camera className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {allImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {allImages.map((image, index) => 
                    !brokenImages.has(index) ? (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                          index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={() => handleImageError(index)}
                        />
                      </button>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 space-y-6">
            <div>
              {product.brand && (
                <Badge variant="secondary" className="mb-2">
                  {product.brand}
                </Badge>
              )}
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {reviews.length > 0 && (
                <div className="mt-2">{renderStars(averageRating)}</div>
              )}
            </div>

            {product.price && (
              <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>
            )}

            {product.description && (
              <div className="space-y-2">
                <h3 className="font-medium">Description</h3>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button size="icon" variant="ghost">
                <BookmarkPlus className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Customer Reviews</h2>
              
              {/* Filter Dropdown */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={reviewSort} onValueChange={setReviewSort}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="rating-high">Highest Rating</SelectItem>
                    <SelectItem value="rating-low">Lowest Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Rating Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="col-span-1">
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
                  <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
                  <div className="flex my-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${star <= averageRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reviews.length} reviews
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="space-y-2">
                  {ratingDistribution.map((item) => (
                    <div key={item.stars} className="flex items-center">
                      <div className="w-12 text-sm">{item.stars} stars</div>
                      <div className="flex-1 mx-3">
                        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-sm text-right">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {sortReviews(reviews, reviewSort).map((review) => (
                <ReviewCard 
                  key={review.id}
                  reviewId={review.id}
                  userId={review.user_id}
                  reviewerName={review.users?.username || 'Anonymous'}
                  reviewerUsername={review.users?.username || 'anonymous'}
                  reviewerImage={review.users?.avatar_url}
                  reviewDate={new Date(review.created_at).toLocaleDateString()}
                  rating={review.rating}
                  reviewTitle={review.title || ''}
                  reviewContent={review.content}
                  productImage={null}
                  productName={product?.name || 'Unknown Product'}
                  productBrand={product?.brand || 'Unknown Brand'}
                  productId={product?.id}
                  reviewImages={review.images || []}
                  helpfulCount={review.helpful_count || 0}
                  notHelpfulCount={review.not_helpful_count || 0}
                  commentCount={review.comment_count || 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* Write Review Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {reviews.length > 0 ? 'All Reviews' : 'Be the first to review this product'}
            </h3>
            {user && (
              <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
                <DialogTrigger asChild>
                  <Button onClick={() => setShowReviewModal(true)}>Write a Review</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px]">
                  <ReviewForm
                    productId={product.id}
                    onSubmit={handleReviewSubmit}
                    onCancel={() => setShowReviewModal(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {!user && (
            <Alert>
              <AlertDescription>
                Please sign in to write a review for this product.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Image Modal */}
        {showImageModal && allImages.length > 0 && !brokenImages.has(currentImageIndex) && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative max-w-4xl max-h-[90vh] p-4">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="h-6 w-6" />
              </button>
              
              <img
                src={allImages[currentImageIndex]}
                alt=""
                className="max-w-full max-h-full object-contain"
                onError={() => {
                  handleImageError(currentImageIndex);
                  setShowImageModal(false);
                }}
              />
              
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === 0 ? allImages.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === allImages.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
