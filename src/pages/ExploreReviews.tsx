import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  created_at: string;
  user_id: string;
  users: {
    username: string;
    avatar_url: string;
  };
  products: {
    id: string;
    name: string;
    brand: string;
    category: string;
  };
}

const ExploreReviews = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam) : 1;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("recent");
  
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortReviews = (reviews: Review[], sortType: string) => {
    const sortedReviews = [...reviews];
    
    switch (sortType) {
      case "recent":
        return sortedReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "rating-high":
        return sortedReviews.sort((a, b) => b.rating - a.rating);
      case "rating-low":
        return sortedReviews.sort((a, b) => a.rating - b.rating);
      case "title":
        return sortedReviews.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sortedReviews;
    }
  };

  const handlePageChange = (page: number) => {
    setPaginationLoading(true);
    
    // Update URL with new page
    setSearchParams({ page: page.toString() });
    
    // Simulate a brief loading state like Google search
    setTimeout(() => {
      setPaginationLoading(false);
    }, 300);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPaginationLoading(true);
    
    // Re-sort existing reviews
    const sortedReviews = sortReviews(reviews, newSort);
    setReviews(sortedReviews);
    
    // Reset to first page
    setSearchParams({ page: "1" });
    
    // Simulate loading
    setTimeout(() => {
      setPaginationLoading(false);
    }, 300);
  };

  useEffect(() => {
    fetchRecentReviews();
  }, [currentPage]);

  // Scroll to top when page changes
  useEffect(() => {
    scrollToTop();
  }, [currentPage]);

  const fetchRecentReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent reviews with product and user data
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          content,
          images,
          created_at,
          user_id,
          products (
            id,
            name,
            brand,
            category
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Get more reviews to account for pagination

      if (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews');
        return;
      }

      // Fetch user data for each review
      const reviewsWithUsers = await Promise.all(
        (data || []).map(async (review: any) => {
          const { data: userData } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', review.user_id)
            .single();

          return {
            ...review,
            users: userData || { username: 'Unknown User', avatar_url: null }
          };
        })
      );

      // Sort reviews based on current sort selection
      const sortedReviews = sortReviews(reviewsWithUsers, sortBy);
      setReviews(sortedReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Recent Reviews</h1>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Recent Reviews</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Recent Reviews</h1>
              <p className="text-gray-600">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''} found
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
              </p>
            </div>
            
            {/* Filter Dropdown */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="rating-high">Highest Rating</SelectItem>
                  <SelectItem value="rating-low">Lowest Rating</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No reviews found</h2>
            <p className="text-gray-600 mb-4">
              Be the first to write a review!
            </p>
            <Link 
              to="/write-review" 
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Write a Review
            </Link>
          </div>
        ) : (
          <div className="relative">
            {paginationLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              </div>
            )}
            <div className="space-y-6">
              {currentReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Review Image */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={review.images[0]}
                            alt={review.products.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {review.rating}/5
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                        {review.title}
                      </h3>
                      
                      <p className="text-gray-700 line-clamp-3 mb-3">
                        {review.content}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {review.users.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {review.users.username}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>0</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsDown className="h-4 w-4" />
                            <span>0</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>0</span>
                          </div>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex items-center justify-between">
                        <div>
                          <Link 
                            to={`/product/${review.products.id}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {review.products.name}
                          </Link>
                          <p className="text-sm text-gray-600">{review.products.brand}</p>
                          {review.products.category && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {review.products.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreReviews;
