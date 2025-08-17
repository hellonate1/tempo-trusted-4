import React from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import ProductCard from "./ProductCard";
import ReviewCard from "./ReviewCard";

const HomePage = () => {
  // Mock data for featured reviews
  const featuredReviews = [
    {
      id: "1",
      title: "Best headphones I've ever owned",
      content:
        "These noise-cancelling headphones have completely changed my work-from-home experience. The sound quality is exceptional and the battery life is impressive.",
      rating: 5,
      date: "2023-05-15",
      user: {
        name: "Alex Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      },
      product: {
        id: "101",
        name: "SoundMax Pro Headphones",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80",
      },
      helpfulCount: 42,
      commentCount: 8,
    },
    {
      id: "2",
      title: "Great value for the price",
      content:
        "This coffee maker is simple to use and makes a consistently good cup of coffee. It's not fancy but it gets the job done reliably every morning.",
      rating: 4,
      date: "2023-05-10",
      user: {
        name: "Sarah Miller",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      },
      product: {
        id: "102",
        name: "BrewMaster Coffee Maker",
        image:
          "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&q=80",
      },
      helpfulCount: 28,
      commentCount: 5,
    },
  ];

  // Mock data for trending products
  const trendingProducts = [
    {
      id: "101",
      name: "SoundMax Pro Headphones",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80",
      rating: 4.8,
      reviewCount: 1245,
      price: 249.99,
      category: "Electronics",
      description:
        "Wireless noise-cancelling headphones with 30-hour battery life.",
    },
    {
      id: "102",
      name: "BrewMaster Coffee Maker",
      image:
        "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&q=80",
      rating: 4.2,
      reviewCount: 876,
      price: 89.99,
      category: "Kitchen Appliances",
      description:
        "Programmable coffee maker with 12-cup capacity and auto-shutoff.",
    },
    {
      id: "103",
      name: "UltraGrip Running Shoes",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80",
      rating: 4.5,
      reviewCount: 932,
      price: 129.99,
      category: "Footwear",
      description:
        "Lightweight running shoes with responsive cushioning and breathable mesh.",
    },
    {
      id: "104",
      name: "SmartHome Security Camera",
      image:
        "https://images.unsplash.com/photo-1557862921-37829c790f19?w=300&q=80",
      rating: 4.6,
      reviewCount: 654,
      price: 179.99,
      category: "Smart Home",
      description: "HD security camera with motion detection and night vision.",
    },
  ];

  // Mock data for personalized recommendations
  const recommendations = [
    {
      id: "201",
      name: "EcoFriendly Water Bottle",
      image:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&q=80",
      rating: 4.7,
      reviewCount: 543,
      price: 34.99,
      category: "Lifestyle",
      description:
        "Insulated stainless steel water bottle that keeps drinks cold for 24 hours.",
    },
    {
      id: "202",
      name: "PocketTech E-Reader",
      image:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
      rating: 4.4,
      reviewCount: 789,
      price: 129.99,
      category: "Electronics",
      description:
        "Lightweight e-reader with adjustable backlight and weeks of battery life.",
    },
    {
      id: "203",
      name: "Gourmet Chef Knife Set",
      image:
        "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=300&q=80",
      rating: 4.9,
      reviewCount: 321,
      price: 199.99,
      category: "Kitchen",
      description:
        "Professional-grade knife set with ergonomic handles and precision blades.",
    },
    {
      id: "204",
      name: "Organic Cotton Bedding",
      image:
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&q=80",
      rating: 4.6,
      reviewCount: 456,
      price: 89.99,
      category: "Home",
      description:
        "Luxuriously soft 100% organic cotton sheets and pillowcases.",
    },
  ];

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
        {/* Featured Reviews */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Reviews</h2>
            <Link
              to="/reviews"
              className="text-sm text-primary flex items-center hover:underline"
            >
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredReviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                reviewerName={review.user.name}
                reviewerImage={review.user.avatar}
                reviewDate={review.date}
                rating={review.rating}
                reviewTitle={review.title}
                reviewContent={review.content}
                productImage={review.product.image}
                productName={review.product.name}
                helpfulCount={review.helpfulCount}
                commentCount={review.commentCount}
              />
            ))}
          </div>
        </section>

        {/* Trending Products */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Trending Products</h2>
            <Link
              to="/trending"
              className="text-sm text-primary flex items-center hover:underline"
            >
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.name}
                image={product.image}
                rating={product.rating}
                category={product.category}
                price={product.price}
                description={product.description}
              />
            ))}
          </div>
        </section>

        {/* Personalized Recommendations */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recommended For You</h2>
            <Link
              to="/recommendations"
              className="text-sm text-primary flex items-center hover:underline"
            >
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="electronics">Electronics</TabsTrigger>
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            </TabsList>
            <TabsContent
              value="all"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {recommendations.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.name}
                  image={product.image}
                  rating={product.rating}
                  category={product.category}
                  price={product.price}
                  description={product.description}
                />
              ))}
            </TabsContent>
            <TabsContent
              value="electronics"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {recommendations
                .filter((product) => product.category === "Electronics")
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.name}
                    image={product.image}
                    rating={product.rating}
                    category={product.category}
                    price={product.price}
                    description={product.description}
                  />
                ))}
            </TabsContent>
            <TabsContent
              value="home"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {recommendations
                .filter(
                  (product) =>
                    product.category === "Home" ||
                    product.category === "Kitchen",
                )
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.name}
                    image={product.image}
                    rating={product.rating}
                    category={product.category}
                    price={product.price}
                    description={product.description}
                  />
                ))}
            </TabsContent>
            <TabsContent
              value="lifestyle"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {recommendations
                .filter((product) => product.category === "Lifestyle")
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.name}
                    image={product.image}
                    rating={product.rating}
                    category={product.category}
                    price={product.price}
                    description={product.description}
                  />
                ))}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">ReviewHub</h3>
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
              &copy; {new Date().getFullYear()} ReviewHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
