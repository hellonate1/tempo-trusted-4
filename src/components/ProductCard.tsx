import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface ProductCardProps {
  id?: string;
  title?: string;
  image?: string;
  rating?: number;
  category?: string;
  price?: number;
  description?: string;
  onClick?: () => void;
}

const ProductCard = ({
  id = "1",
  title = "Premium Wireless Headphones",
  image = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
  rating = 4.5,
  category = "Electronics",
  price = 199.99,
  description = "High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.",
  onClick,
}: ProductCardProps) => {
  // Generate stars based on rating
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="h-4 w-4 text-yellow-400" />
            <div className="absolute inset-0 overflow-hidden w-[50%]">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>,
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-yellow-400" />);
      }
    }

    return stars;
  };

  return (
    <Link to={`/product/${id}`} className="block">
      <Card
        className="w-full max-w-[300px] h-[380px] overflow-hidden flex flex-col bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        onClick={onClick}
      >
        <div className="h-40 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
            <Badge variant="outline" className="bg-primary/10">
              {category}
            </Badge>
          </div>
          <div className="flex items-center mt-1 space-x-1">
            {renderStars()}
            <span className="text-sm text-muted-foreground ml-1">{rating}</span>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {description}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <span className="font-bold text-lg">${price.toFixed(2)}</span>
          <Badge className="hover:bg-primary/90">View Details</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
