import React from "react";
import { Link } from "react-router-dom";
import { Search, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Header = () => {
  const { user, signOut, isAuthenticated } = useAuth();

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
      {/* Header/Navigation */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-2xl font-bold text-primary">
              ReviewHub
            </Link>
            <nav className="hidden md:flex space-x-4">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category}
                  to={`/category/${category.toLowerCase().replace(" & ", "-")}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {category}
                </Link>
              ))}
              <div className="relative group">
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  More
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-background border rounded-md shadow-lg hidden group-hover:block">
                  {categories.slice(4).map((category) => (
                    <Link
                      key={category}
                      to={`/category/${category.toLowerCase().replace(" & ", "-")}`}
                      className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative w-64 hidden md:block">
              <Input
                type="text"
                placeholder="Search products..."
                className="pr-8"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {isAuthenticated ? (
              <>
                <Button variant="outline" className="hidden md:inline-flex">
                  Write a Review
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback>
                          {user?.user_metadata?.full_name?.charAt(0) ||
                            user?.email?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>My Reviews</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" className="hidden md:inline-flex">
                  Write a Review
                </Button>
                <div className="hidden md:flex space-x-2">
                  <Link to="/signup">
                    <Button variant="outline">Sign Up</Button>
                  </Link>
                  <Link to="/signin">
                    <Button>Sign In</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search - visible only on small screens */}
      <div className="md:hidden container mx-auto px-4 py-3">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search products..."
            className="pr-8 w-full"
          />
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </>
  );
};

export default Header;
