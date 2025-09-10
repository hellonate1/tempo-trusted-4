import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Calendar, 
  Star, 
  ThumbsUp, 
  MessageSquare,
  Edit,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ReviewCard from "@/components/ReviewCard";
import EditProfile from "@/components/EditProfile";

interface UserProfile {
  id: string;
  username: string;
  bio: string;
  location?: string;
  created_at: string;
  avatar_url?: string;
  full_name?: string;
  follower_count?: number;
  following_count?: number;
  is_following?: boolean;
}

interface UserReview {
  id: string;
  product_id: string;
  product_name: string;
  product_brand: string;
  product_image: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  helpful_count: number;
  not_helpful_count: number;
  comment_count: number;
  images: string[];
}

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) {
          setError('User not found');
          return;
        }

        // Fetch follower and following counts
        const [followerCountResult, followingCountResult, isFollowingResult] = await Promise.all([
          supabase.rpc('get_follower_count', { user_id: profileData.id }),
          supabase.rpc('get_following_count', { user_id: profileData.id }),
          currentUser ? supabase.rpc('is_following', { 
            follower_id: currentUser.id, 
            following_id: profileData.id 
          }) : Promise.resolve({ data: false })
        ]);

        // Set profile data (auth metadata will be available if user is viewing their own profile)
        setProfile({
          ...profileData,
          avatar_url: currentUser?.id === profileData.id ? currentUser.user_metadata?.avatar_url : undefined,
          full_name: currentUser?.id === profileData.id ? currentUser.user_metadata?.full_name : profileData.username,
          location: currentUser?.id === profileData.id ? currentUser.user_metadata?.location || 'Location not set' : 'Location not set',
          follower_count: followerCountResult.data || 0,
          following_count: followingCountResult.data || 0,
          is_following: isFollowingResult.data || false
        });

        // Check if this is the current user's profile
        setIsOwnProfile(currentUser?.id === profileData.id);

        // Fetch user's reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            product_id,
            rating,
            title,
            content,
            created_at,
            helpful_count,
            not_helpful_count,
            comment_count,
            images,
            products (
              name,
              brand,
              image_url
            )
          `)
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          // Don't fail the profile load if reviews fail
          setReviews([]);
        } else {
          const formattedReviews = reviewsData?.map(review => ({
            id: review.id,
            product_id: review.product_id,
            product_name: review.products?.name || 'Unknown Product',
            product_brand: review.products?.brand || 'Unknown Brand',
            product_image: review.products?.image_url || 'https://via.placeholder.com/150',
            rating: review.rating,
            title: review.title,
            content: review.content,
            created_at: review.created_at,
            helpful_count: review.helpful_count || 0,
            not_helpful_count: review.not_helpful_count || 0,
            comment_count: review.comment_count || 0,
            images: review.images || []
          })) || [];
          
          setReviews(formattedReviews);
        }

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || 'The user you are looking for does not exist.'}</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const handleFollow = async () => {
    if (!currentUser || !profile || isOwnProfile) return;

    try {
      setFollowLoading(true);
      
      if (profile.is_following) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id);

        if (error) throw error;

        // Update local state
        setProfile(prev => prev ? {
          ...prev,
          is_following: false,
          follower_count: (prev.follower_count || 0) - 1
        } : null);
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: profile.id
          });

        if (error) throw error;

        // Update local state
        setProfile(prev => prev ? {
          ...prev,
          is_following: true,
          follower_count: (prev.follower_count || 0) + 1
        } : null);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleProfileUpdated = () => {
    // Refresh the profile data
    if (username) {
      fetchProfile();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} alt={profile.username} />
                <AvatarFallback className="text-2xl">
                  {profile.full_name?.charAt(0) || profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {profile.full_name || profile.username}
                    </h1>
                    <div className="flex items-center gap-4 text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{profile.follower_count || 0} followers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{profile.following_count || 0} following</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {formatDate(profile.created_at)}</span>
                      </div>
                    </div>
                    {profile.bio && (
                      <p className="text-muted-foreground max-w-2xl">{profile.bio}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <Button variant="outline" onClick={handleEditProfile}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <Button 
                        variant={profile.is_following ? "outline" : "default"}
                        onClick={handleFollow}
                        disabled={followLoading}
                      >
                        {followLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            {profile.is_following ? 'Unfollowing...' : 'Following...'}
                          </>
                        ) : (
                          profile.is_following ? 'Unfollow' : 'Follow'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">{reviews.length}</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">
                {reviews.reduce((sum, review) => sum + review.comment_count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Comments</div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Reviews</h2>
            <Badge variant="secondary">{reviews.length} reviews</Badge>
          </div>

          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No reviews yet</p>
                  <p className="text-sm">
                    {isOwnProfile 
                      ? "Start writing reviews to see them here!" 
                      : "This user hasn't written any reviews yet."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
                             {reviews.map((review) => (
                 <ReviewCard
                   key={review.id}
                   reviewId={review.id}
                   reviewerName={profile.full_name || profile.username}
                   reviewerUsername={profile.username}
                   reviewerImage={profile.avatar_url}
                   reviewDate={formatDate(review.created_at)}
                   rating={review.rating}
                   reviewTitle={review.title}
                   reviewContent={review.content}
                   productImage={review.product_image}
                   productName={review.product_name}
                   productBrand={review.product_brand}
                   reviewImages={review.images}
                   helpfulCount={review.helpful_count}
                   notHelpfulCount={review.not_helpful_count || 0}
                   commentCount={review.comment_count}
                 />
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfile
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdated={handleProfileUpdated}
          currentProfile={{
            username: profile.username,
            bio: profile.bio,
            full_name: profile.full_name,
            location: profile.location,
            avatar_url: profile.avatar_url,
          }}
        />
      )}
    </div>
  );
};

export default Profile;
