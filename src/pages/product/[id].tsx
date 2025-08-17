import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  BookmarkPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Create mock components to use until the actual components are available
const ReviewForm = ({ productId = "", productName = "" }) => {
  return (
    <div className="p-4 bg-white">
      <h2 className="text-xl font-bold mb-4">
        Write a Review for {productName}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-6 w-6 text-gray-300 cursor-pointer hover:text-yellow-400"
              />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            className="w-full border rounded-md p-2"
            placeholder="Summarize your review"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Review</label>
          <textarea
            className="w-full border rounded-md p-2 h-32"
            placeholder="Write your review here"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Add Photos (optional)
          </label>
          <div className="border-2 border-dashed rounded-md p-4 text-center">
            <p className="text-sm text-gray-500">
              Drag and drop images or click to upload
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Submit Review</Button>
        </div>
      </div>
    </div>
  );
};

const ReviewCard = ({
  review = {
    id: "",
    user: { name: "User", avatar: "" },
    date: "",
    rating: 0,
    title: "",
    content: "",
    helpfulCount: 0,
    notHelpfulCount: 0,
    commentCount: 0,
    images: [],
  },
}) => {
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={review.user.avatar} alt={review.user.name} />
              <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{review.user.name}</div>
              <div className="text-sm text-gray-500">{review.date}</div>
            </div>
          </div>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-bold text-lg">{review.title}</h3>
          <p className="mt-2 text-gray-700">{review.content}</p>
        </div>
        {review.images.length > 0 && (
          <div className="mt-4 flex space-x-2">
            {review.images.map((image, index) => (
              <div key={index} className="h-20 w-20 rounded-md overflow-hidden">
                <img
                  src={image}
                  alt={`Review ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <button className="flex items-center text-gray-500 hover:text-gray-700">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>Helpful ({review.helpfulCount})</span>
          </button>
          <button className="flex items-center text-gray-500 hover:text-gray-700">
            <ThumbsDown className="h-4 w-4 mr-1" />
            <span>Not Helpful ({review.notHelpfulCount})</span>
          </button>
          <button className="flex items-center text-gray-500 hover:text-gray-700">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>Comment ({review.commentCount})</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("description");
  const [reviewSort, setReviewSort] = useState("newest");

  // Mock data - would be fetched from API based on id
  const product = {
    id: id || "1",
    title: "Sony WH-1000XM4 Wireless Noise Cancelling Headphones",
    price: 349.99,
    rating: 4.7,
    reviewCount: 1243,
    category: "Electronics",
    subcategory: "Headphones",
    description:
      "Industry-leading noise cancellation with Dual Noise Sensor technology. Next-level music with Edge-AI, co-developed with Sony Music Studios Tokyo. Up to 30-hour battery life with quick charging (10 min charge for 5 hours of playback). Touch Sensor controls to pause/play/skip tracks, control volume, activate your voice assistant, and answer phone calls. Speak-to-chat technology automatically reduces volume during conversations.",
    features: [
      "Industry-leading noise cancellation",
      "Up to 30-hour battery life",
      "Touch Sensor controls",
      "Speak-to-chat technology",
      "Wearing detection auto-play/pause sensor",
    ],
    specifications: {
      "Battery Life": "Up to 30 hours",
      "Bluetooth Version": "5.0",
      Weight: "254g",
      "Charging Time": "3 hours",
      "Quick Charge": "10 min for 5 hours playback",
    },
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80",
    ],
  };

  // Mock rating distribution
  const ratingDistribution = [
    { stars: 5, count: 876, percentage: 70 },
    { stars: 4, count: 245, percentage: 20 },
    { stars: 3, count: 87, percentage: 7 },
    { stars: 2, count: 25, percentage: 2 },
    { stars: 1, count: 10, percentage: 1 },
  ];

  // Mock reviews
  const reviews = [
    {
      id: "1",
      user: {
        name: "Alex Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      },
      date: "2023-05-15",
      rating: 5,
      title: "Best headphones I've ever owned",
      content:
        "These headphones are absolutely amazing. The noise cancellation is top-notch and the sound quality is incredible. Battery life is as advertised, easily lasting me a full week of commuting.",
      helpfulCount: 42,
      notHelpfulCount: 3,
      commentCount: 5,
      images: [
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&q=80",
      ],
    },
    {
      id: "2",
      user: {
        name: "Sarah Miller",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      },
      date: "2023-04-22",
      rating: 4,
      title: "Great but a bit pricey",
      content:
        "The sound quality and noise cancellation are excellent. Very comfortable for long listening sessions. My only complaint is the price point, but you get what you pay for.",
      helpfulCount: 28,
      notHelpfulCount: 2,
      commentCount: 3,
      images: [],
    },
    {
      id: "3",
      user: {
        name: "Michael Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      },
      date: "2023-03-10",
      rating: 5,
      title: "Perfect for working from home",
      content:
        "These headphones have been a lifesaver while working from home. The noise cancellation blocks out all distractions, and the comfort level is amazing for all-day wear.",
      helpfulCount: 35,
      notHelpfulCount: 1,
      commentCount: 7,
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",
      ],
    },
  ];

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
        <span className="ml-2 text-lg font-medium">{rating}</span>
        <span className="ml-2 text-sm text-gray-500">
          ({product.reviewCount} reviews)
        </span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      {/* Product Header - Compact Layout */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Product Image - Smaller */}
        <div className="md:w-1/3">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        {/* Product Info - Expanded */}
        <div className="md:w-2/3 space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <div className="mt-2">{renderStars(product.rating)}</div>
          </div>

          <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>

          <div className="space-y-2">
            <h3 className="font-medium">Product Overview</h3>
            <p className="text-gray-700">
              {product.description.split(".").slice(0, 2).join(". ") + "."}
            </p>
          </div>

          <Separator />

          {/* Retailer Link - De-emphasized */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button size="icon" variant="ghost">
                <BookmarkPlus className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              View at Retailer
            </Button>
          </div>
        </div>
      </div>

      {/* Rating Distribution - Moved Up */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
              <div className="text-5xl font-bold">{product.rating}</div>
              <div className="flex my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= product.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500">
                {product.reviewCount} reviews
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
      </div>

      {/* Reviews Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">All Reviews</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-2 text-sm">Sort by:</span>
              <select
                className="border rounded p-1 text-sm"
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Write a Review</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <ReviewForm
                  productId={product.id}
                  productName={product.title}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>

      {/* Product Details - Moved to Bottom */}
      <div className="mt-12 pt-8 border-t">
        <Tabs defaultValue="description">
          <TabsList className="mb-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="text-gray-700">
            <p>{product.description}</p>
          </TabsContent>
          <TabsContent value="features">
            <ul className="list-disc pl-5 space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="text-gray-700">
                  {feature}
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="specifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b pb-2">
                  <span className="font-medium">{key}</span>
                  <span className="text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductPage;
