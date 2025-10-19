import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Header = () => {
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<{ username: string; avatar_url?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && isAuthenticated) {
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
          } else {
            setUserProfile(profile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user, isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      {/* Header/Navigation */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-2xl font-bold text-primary">
              TrustedGoods
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative w-64 hidden md:block">
              <Input
                type="text"
                placeholder="Search products..."
                className="pr-8"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>
            {!authLoading && isAuthenticated ? (
              <>
                <Link to="/write-review">
                  <Button variant="outline" className="hidden md:inline-flex">
                    Write a Review
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.avatar_url} />
                        <AvatarFallback>
                          {user?.user_metadata?.full_name?.charAt(0) ||
                            user?.email?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link 
                        to={userProfile?.username ? `/profile/${userProfile.username}` : '#'}
                        className={!userProfile?.username ? 'pointer-events-none opacity-50' : ''}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : !authLoading ? (
              <>
                <Link to="/signin">
                  <Button variant="outline" className="hidden md:inline-flex">
                    Write a Review
                  </Button>
                </Link>
                <div className="hidden md:flex space-x-2">
                  <Link to="/signup">
                    <Button variant="outline">Sign Up</Button>
                  </Link>
                  <Link to="/signin">
                    <Button>Sign In</Button>
                  </Link>
                </div>
              </>
            ) : null}
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
