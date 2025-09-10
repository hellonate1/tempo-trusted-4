import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, User, Star, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import ReviewCard from "./ReviewCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const HomePage = () => {
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  // Fetch recent reviews from Supabase
  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            user_id,
            title,
            content,
            rating,
            created_at,
            helpful_count,
            not_helpful_count,
            comment_count,
            images,
            products (
              id,
              name,
              brand,
              image_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error fetching recent reviews:', error);
          return;
        }

        console.log('Fetched recent reviews:', data);
        console.log('First review user_id:', data?.[0]?.user_id);
        console.log('First review full object:', data?.[0]);
        
        // Fetch user data for each review
        if (data && data.length > 0) {
          const reviewsWithUsers = await Promise.all(
            data.map(async (review) => {
              console.log('Fetching user data for review:', review.id, 'user_id:', review.user_id);
              
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id, username, bio')
                .eq('id', review.user_id)
                .single();
              
              console.log('User data result:', { userData, userError });
              
              if (userError) {
                console.error('Error fetching user data for user_id:', review.user_id, userError);
                return {
                  ...review,
                  users: {
                    id: review.user_id,
                    username: 'Anonymous',
                    full_name: 'Anonymous User',
                    avatar_url: null
                  }
                };
              }
              
              // Use the same logic as Profile page for avatar_url
              const isCurrentUser = currentUser?.id === userData.id;
              const avatarUrl = isCurrentUser ? currentUser.user_metadata?.avatar_url : null;
              const fullName = isCurrentUser ? currentUser.user_metadata?.full_name : userData.username;
              
              return {
                ...review,
                users: {
                  id: userData.id,
                  username: userData.username,
                  full_name: fullName || userData.username,
                  avatar_url: avatarUrl
                }
              };
            })
          );
          
          console.log('Final reviews with users:', reviewsWithUsers);
          setRecentReviews(reviewsWithUsers);
        } else {
          setRecentReviews([]);
        }
      } catch (err) {
        console.error('Error fetching recent reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReviews();
  }, [currentUser]);

  // Categories for navigation
  const categories = [
    "Electronics",
    "Home & Kitchen",
    "Fashion",
    "Beauty",
    "Books",
    "Sports",
    "Toys",
    "Automotive",
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-accent py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Discover Honest Product Reviews
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of reviewers sharing authentic experiences with
            products across all categories.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg">Explore Reviews</Button>
            <Button size="lg" variant="outline">
              Join Community
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Recent Product Reviews */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Product Reviews</h2>
            <Link
              to="/reviews"
              className="text-sm text-primary flex items-center hover:underline"
            >
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted h-48 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : recentReviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
              {recentReviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                  reviewId={review.id}
                  reviewerName={review.users?.full_name || review.users?.username || 'Anonymous'}
                  reviewerImage={review.users?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.users?.username || 'user'}`}
                  reviewDate={new Date(review.created_at).toLocaleDateString()}
                rating={review.rating}
                  reviewTitle={review.title || ''}
                reviewContent={review.content}
                  productImage={review.products?.image_url || null}
                  productName={review.products?.name || 'Unknown Product'}
                  productBrand={review.products?.brand || 'Unknown Brand'}
                  reviewImages={review.images || []}
                  helpfulCount={review.helpful_count || 0}
                  notHelpfulCount={review.not_helpful_count || 0}
                  commentCount={review.comment_count || 0}
              />
            ))}
          </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No reviews yet. Be the first to write a review!</p>
              <Link to="/write-review">
                <Button className="mt-4">Write Your First Review</Button>
            </Link>
          </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">TrustedGoods</h3>
              <p className="text-muted-foreground">
                Your trusted source for honest product reviews and
                recommendations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                {categories.slice(0, 5).map((category) => (
                  <li key={category}>
                    <Link
                      to={`/category/${category.toLowerCase().replace(" & ", "-")}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/press"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cookies"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} TrustedGoods. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
