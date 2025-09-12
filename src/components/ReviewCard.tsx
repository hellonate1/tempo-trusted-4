import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, MessageSquare, Send, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface ReviewCardProps {
  reviewId?: string;
  reviewerName?: string;
  reviewerUsername?: string;
  reviewerImage?: string;
  reviewDate?: string;
  rating?: number;
  reviewTitle?: string;
  reviewContent?: string;
  productImage?: string;
  productName?: string;
  productBrand?: string;
  productId?: string;
  reviewImages?: string[];
  helpfulCount?: number;
  notHelpfulCount?: number;
  commentCount?: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface Vote {
  id: string;
  vote_type: 'up' | 'down';
  user_id: string;
}

const ReviewCard = ({
  reviewId,
  reviewerName = "Jane Smith",
  reviewerUsername = "janesmith",
  reviewerImage = "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  reviewDate = "May 15, 2023",
  rating = 4,
  reviewTitle = "Great product with minor flaws",
  reviewContent = "This product exceeded my expectations in many ways. The quality is excellent and it works exactly as described. However, there are a few minor issues that could be improved in future versions.",
  productImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80",
  productName = "Wireless Headphones",
  productBrand = "Unknown Brand",
  productId,
  reviewImages = [],
  helpfulCount = 24,
  notHelpfulCount = 3,
  commentCount = 5,
}: ReviewCardProps) => {
  const { user, isAuthenticated } = useAuth();
  const [currentVote, setCurrentVote] = useState<Vote | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Load user's current vote
  useEffect(() => {
    if (reviewId && user && isAuthenticated) {
      loadUserVote();
    }
  }, [reviewId, user, isAuthenticated]);

  // Load comments when comments section is opened
  useEffect(() => {
    if (showComments && reviewId) {
      loadComments();
    }
  }, [showComments, reviewId]);

  const loadUserVote = async () => {
    if (!reviewId || !user) {
      console.log('loadUserVote: Missing reviewId or user', { reviewId, user: user?.id });
      return;
    }
    
    try {
      console.log('Loading user vote for review:', reviewId, 'user:', user.id);
      
      const { data, error } = await supabase
        .from('review_votes')
        .select('*')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading user vote:', error);
        return;
      }
      
      console.log('User vote loaded:', data);
      setCurrentVote(data);
    } catch (err) {
      console.error('Error loading user vote:', err);
    }
  };

  const loadComments = async () => {
    if (!reviewId) return;
    
    try {
      const { data, error } = await supabase
        .from('review_comments')
        .select('id, content, created_at, user_id')
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true });
      
      if (data && !error) {
        // Get user info for each comment
        const commentsWithUsers = await Promise.all(
          data.map(async (comment) => {
            const { data: userData } = await supabase
              .from('users')
              .select('username, full_name, avatar_url')
              .eq('id', comment.user_id)
              .single();
            
            return {
              id: comment.id,
              content: comment.content,
              created_at: comment.created_at,
              user: {
                username: userData?.username || 'Unknown',
                full_name: userData?.full_name,
                avatar_url: userData?.avatar_url
              }
            };
          })
        );
        
        setComments(commentsWithUsers);
      } else {
        console.error('Error loading comments:', error);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!reviewId || !user || !isAuthenticated) return;
    
    setLoading(true);
    try {
      if (currentVote) {
        // Update existing vote
        if (currentVote.vote_type === voteType) {
          // Remove vote if clicking the same type
          await supabase
            .from('review_votes')
            .delete()
            .eq('id', currentVote.id);
          setCurrentVote(null);
        } else {
          // Change vote type
          const { data, error } = await supabase
            .from('review_votes')
            .update({ vote_type: voteType })
            .eq('id', currentVote.id)
            .select()
            .single();
          
          if (data && !error) {
            setCurrentVote(data);
          }
        }
      } else {
        // Create new vote
        const { data, error } = await supabase
          .from('review_votes')
          .insert({
            review_id: reviewId,
            user_id: user.id,
            vote_type: voteType
          })
          .select()
          .single();
        
        if (data && !error) {
          setCurrentVote(data);
        }
      }
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!reviewId || !user || !isAuthenticated || !newComment.trim()) return;
    
    console.log('Attempting to add comment:', {
      reviewId,
      userId: user.id,
      content: newComment.trim()
    });
    
    setCommentLoading(true);
    try {
      // First, just insert the comment without the join
      const { data, error } = await supabase
        .from('review_comments')
        .insert({
          review_id: reviewId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select('id, content, created_at, user_id')
        .single();
      
      console.log('Comment insert result:', { data, error });
      
      if (data && !error) {
        // Get user info separately
        const { data: userData } = await supabase
          .from('users')
          .select('username, full_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        const newCommentData = {
          id: data.id,
          content: data.content,
          created_at: data.created_at,
          user: {
            username: userData?.username || user.user_metadata?.full_name || 'Unknown',
            full_name: userData?.full_name || user.user_metadata?.full_name,
            avatar_url: userData?.avatar_url || user.user_metadata?.avatar_url
          }
        };
        setComments(prev => [...prev, newCommentData]);
        setNewComment("");
        console.log('Comment added successfully');
      } else {
        console.error('Error adding comment:', error);
        alert(`Error adding comment: ${error?.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert(`Error adding comment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCommentLoading(false);
    }
  };

  // Function to check if image is supported format
  const isImageSupported = (imageUrl: string) => {
    if (!imageUrl) return false;
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = imageUrl.toLowerCase();
    return supportedFormats.some(format => lowerUrl.includes(format)) || 
           lowerUrl.startsWith('data:image/') ||
           lowerUrl.includes('placeholder') ||
           lowerUrl.includes('unsplash.com');
  };

  // Function to get fallback image
  const getFallbackImage = (productName: string) => {
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=150&fit=crop&crop=center`;
  };

  // Carousel navigation functions
  const nextImage = () => {
    if (reviewImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % reviewImages.length);
    }
  };

  const prevImage = () => {
    if (reviewImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + reviewImages.length) % reviewImages.length);
    }
  };

  // Get the current image to display (review images take priority over product image)
  const getCurrentImage = () => {
    if (reviewImages.length > 0) {
      return reviewImages[currentImageIndex];
    }
    return productImage;
  };

  const hasMultipleImages = reviewImages.length > 1;

  return (
    <Card className="w-full max-w-[900px] bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Left side - Reviewer info and Review content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4 mb-4">
              {/* Reviewer info */}
              <div className="flex flex-col items-center flex-shrink-0">
                <Link to={`/profile/${reviewerUsername}`}>
                  <Avatar className="h-12 w-12 hover:opacity-80 transition-opacity cursor-pointer">
                    <AvatarImage src={reviewerImage} alt={reviewerName} />
                    <AvatarFallback>{reviewerName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </Link>
                <Link to={`/profile/${reviewerUsername}`}>
                  <span className="text-xs text-gray-500 mt-1 hover:text-primary transition-colors cursor-pointer">
                    {reviewerName}
                  </span>
                </Link>
              </div>

              {/* Review header */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{reviewDate}</span>
                </div>

                <h3 className="font-semibold text-lg mb-2">{reviewTitle}</h3>
                
                {/* Product name and brand below title */}
                <div className="mb-3">
                  {productId ? (
                    <Link to={`/product/${productId}`}>
                      <p className="text-sm font-medium text-gray-800 hover:text-primary transition-colors cursor-pointer">
                        {productName}
                      </p>
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-gray-800">{productName}</p>
                  )}
                  <p className="text-xs text-gray-500">{productBrand}</p>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {reviewContent}
                </p>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1 ${
                      currentVote?.vote_type === 'up' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                    onClick={() => handleVote('up')}
                    disabled={!isAuthenticated || loading}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{helpfulCount}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1 ${
                      currentVote?.vote_type === 'down' 
                        ? 'text-red-600 bg-red-50' 
                        : 'text-gray-600 hover:text-red-600'
                    }`}
                    onClick={() => handleVote('down')}
                    disabled={!isAuthenticated || loading}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>{notHelpfulCount}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
                    onClick={() => setShowComments(!showComments)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{commentCount} comments</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Review/Product image (full height) with carousel */}
          {(getCurrentImage() && isImageSupported(getCurrentImage())) && (
            <div className="flex-shrink-0">
              <div className="relative w-48 h-64 bg-gray-100 rounded-lg overflow-hidden group">
                <img
                  src={getCurrentImage()}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation arrows - only show if multiple images */}
                {hasMultipleImages && (
                  <>
                    {/* Left arrow */}
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    {/* Right arrow */}
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
                
                {/* Dot indicators - only show if multiple images */}
                {hasMultipleImages && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {reviewImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          index === currentImageIndex 
                            ? 'bg-white' 
                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Comments Section */}
      {showComments && (
        <div className="border-t bg-gray-50 p-4">
          <div className="space-y-4">
            {/* Add Comment Form */}
            {isAuthenticated ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || commentLoading}
                    size="sm"
                  >
                    {commentLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  <Link to="/signin" className="text-blue-600 hover:underline">
                    Sign in
                  </Link> to leave a comment
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 bg-white rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatar_url} alt={comment.user.username} />
                    <AvatarFallback>{comment.user.username.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        to={`/profile/${comment.user.username}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {comment.user.full_name || comment.user.username}
                      </Link>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ReviewCard;
