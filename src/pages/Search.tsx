import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
  users: {
    username: string;
    avatar_url: string;
  };
}

interface SearchResult {
  id: string;
  name: string;
  brand: string;
  category: string;
  review_count: number;
  average_rating: number;
  created_at: string;
  match_type: 'primary' | 'tertiary';
  reviews: Review[];
}

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam) : 1;
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("relevance");
  
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(allResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResults = allResults.slice(startIndex, endIndex);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortResults = (results: SearchResult[], sortType: string) => {
    const sortedResults = [...results];
    
    switch (sortType) {
      case "recent":
        return sortedResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "relevance":
        // Primary matches first, then by review count, then by rating
        return sortedResults.sort((a, b) => {
          if (a.match_type !== b.match_type) {
            if (a.match_type === 'primary') return -1;
            if (b.match_type === 'primary') return 1;
          }
          if (b.review_count !== a.review_count) {
            return b.review_count - a.review_count;
          }
          return b.average_rating - a.average_rating;
        });
      case "rating-high":
        return sortedResults.sort((a, b) => b.average_rating - a.average_rating);
      case "rating-low":
        return sortedResults.sort((a, b) => a.average_rating - b.average_rating);
      default:
        return sortedResults;
    }
  };

  const handlePageChange = (page: number) => {
    setPaginationLoading(true);
    
    // Update URL with new page
    setSearchParams({ q: query, page: page.toString() });
    
    // Simulate a brief loading state like Google search
    setTimeout(() => {
      setPaginationLoading(false);
    }, 300);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPaginationLoading(true);
    
    // Re-sort existing results
    const sortedResults = sortResults(allResults, newSort);
    setAllResults(sortedResults);
    
    // Reset to first page
    setSearchParams({ q: query, page: "1" });
    
    // Simulate loading
    setTimeout(() => {
      setPaginationLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (query) {
      searchProducts(query);
    }
  }, [query, currentPage]);

  // Scroll to top when page changes
  useEffect(() => {
    scrollToTop();
  }, [currentPage]);

  const searchProducts = async (searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);

      // Search for products with reviews - including review content and images
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          brand,
          category,
          created_at,
          reviews (
            id,
            rating,
            title,
            content,
            images,
            created_at,
            user_id
          )
        `)
        .or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(50); // Increased limit to account for filtering

      if (error) {
        console.error('Search error:', error);
        setError('Failed to search products');
        return;
      }

      // Also search for products that have reviews matching the search query
      const { data: reviewMatchData, error: reviewError } = await supabase
        .from('reviews')
        .select(`
          product_id,
          products (
            id,
            name,
            brand,
            category,
            created_at,
            reviews (
              id,
              rating,
              title,
              content,
              images,
              created_at,
              user_id
            )
          )
        `)
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);

      if (reviewError) {
        console.error('Review search error:', reviewError);
        // Continue with just product matches if review search fails
      }

      // Combine and deduplicate results
      const allProducts = new Map();
      
      // Add products that match name/brand (primary matches)
      data?.forEach(product => {
        allProducts.set(product.id, { ...product, matchType: 'primary' });
      });

      // Add products that match review content (tertiary matches)
      reviewMatchData?.forEach(review => {
        if (review.products && !allProducts.has(review.products.id)) {
          allProducts.set(review.products.id, { ...review.products, matchType: 'tertiary' });
        }
      });

      // Process results to include review statistics and ranking
      const processedResults = await Promise.all(
        Array.from(allProducts.values()).map(async (product) => {
          const reviews = product.reviews || [];
          const reviewCount = reviews.length;
          const averageRating = reviewCount > 0 
            ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewCount
            : 0;

          // Fetch user data for each review
          const reviewsWithUsers = await Promise.all(
            reviews.map(async (review: any) => {
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

          return {
            id: product.id,
            name: product.name,
            brand: product.brand,
            category: product.category,
            review_count: reviewCount,
            average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            created_at: product.created_at,
            match_type: product.matchType || 'primary',
            reviews: reviewsWithUsers
          };
        })
      );

      // Sort results based on current sort selection
      const sortedResults = sortResults(processedResults, sortBy);
      setAllResults(sortedResults);
    } catch (err) {
      console.error('Search error:', err);
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
          <h1 className="text-3xl font-bold mb-6">Searching...</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
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
          <h1 className="text-3xl font-bold mb-6">Search Error</h1>
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
              <h1 className="text-3xl font-bold mb-2">
                Search Results for "{query}"
              </h1>
              <p className="text-gray-600">
                {allResults.length} product{allResults.length !== 1 ? 's' : ''} found
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
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="rating-high">Highest Rating</SelectItem>
                  <SelectItem value="rating-low">Lowest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {allResults.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No products found</h2>
            <p className="text-gray-600 mb-4">
              Try searching with different keywords or check the spelling.
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
              {currentResults.map((product) => (
              <div key={product.id} className="space-y-4">
                {/* Product Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{product.name}</h2>
                    <p className="text-gray-600">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {product.category && (
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                      {product.match_type === 'tertiary' && (
                        <Badge variant="outline" className="text-xs">
                          Found in review
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {product.review_count} review{product.review_count !== 1 ? 's' : ''}
                        {product.average_rating > 0 && ` • ${product.average_rating}/5`}
                      </span>
                    </div>
                  </div>
                  <Link 
                    to={`/product/${product.id}`}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm"
                  >
                    View Product
                  </Link>
                </div>

                {/* Reviews */}
                {product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.slice(0, 3).map((review) => (
                      <Card key={review.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            {/* Review Image */}
                            {review.images && review.images.length > 0 && (
                              <div className="flex-shrink-0">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={review.images[0]}
                                    alt={product.name}
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
                              
                              <div className="flex items-center justify-between">
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
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {product.reviews.length > 3 && (
                      <div className="text-center">
                        <Link 
                          to={`/product/${product.id}`}
                          className="text-primary hover:underline"
                        >
                          View {product.reviews.length - 3} more review{product.reviews.length - 3 !== 1 ? 's' : ''}
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <Card className="p-6 text-center">
                    <p className="text-gray-500">No reviews yet</p>
                    <Link 
                      to={`/product/${product.id}`}
                      className="inline-block mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm"
                    >
                      Write the first review
                    </Link>
                  </Card>
                )}
              </div>
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

export default SearchPage;
