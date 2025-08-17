import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

interface ReviewCardProps {
  reviewerName?: string;
  reviewerImage?: string;
  reviewDate?: string;
  rating?: number;
  reviewTitle?: string;
  reviewContent?: string;
  productImage?: string;
  productName?: string;
  helpfulCount?: number;
  notHelpfulCount?: number;
  commentCount?: number;
}

const ReviewCard = ({
  reviewerName = "Jane Smith",
  reviewerImage = "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  reviewDate = "May 15, 2023",
  rating = 4,
  reviewTitle = "Great product with minor flaws",
  reviewContent = "This product exceeded my expectations in many ways. The quality is excellent and it works exactly as described. However, there are a few minor issues that could be improved in future versions.",
  productImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80",
  productName = "Wireless Headphones",
  helpfulCount = 24,
  notHelpfulCount = 3,
  commentCount = 5,
}: ReviewCardProps) => {
  return (
    <Card className="w-full max-w-[600px] bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Reviewer info */}
          <div className="flex flex-col items-center">
            <Avatar className="h-12 w-12">
              <AvatarImage src={reviewerImage} alt={reviewerName} />
              <AvatarFallback>{reviewerName.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500 mt-1">{reviewerName}</span>
          </div>

          {/* Review content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
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

              <div className="flex items-center gap-2">
                <img
                  src={productImage}
                  alt={productName}
                  className="h-10 w-10 object-cover rounded-md"
                />
                <span className="text-xs text-gray-600">{productName}</span>
              </div>
            </div>

            <h3 className="font-semibold text-lg mb-2">{reviewTitle}</h3>
            <p className="text-gray-700 text-sm mb-4 line-clamp-3">
              {reviewContent}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-gray-600"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{helpfulCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-gray-600"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>{notHelpfulCount}</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-gray-600"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{commentCount} comments</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
