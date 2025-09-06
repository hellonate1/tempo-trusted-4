import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const CompleteProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }

    // Check if user already has a complete profile
    if (user) {
      checkExistingProfile();
    }
  }, [user, authLoading, navigate]);

  const checkExistingProfile = async () => {
    if (!user) return;

    try {
      const { data: existingProfile, error } = await supabase
        .from('users')
        .select('username, bio')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking profile:', error);
        return;
      }

      if (existingProfile && existingProfile.username && !existingProfile.username.startsWith('user_')) {
        // User already has a complete profile, redirect to home
        navigate("/");
        return;
      }

      // Pre-fill username with Google name if available
      if (user.user_metadata?.full_name) {
        const suggestedUsername = user.user_metadata.full_name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 20);
        setFormData(prev => ({ ...prev, username: suggestedUsername }));
      }
    } catch (err) {
      console.error('Error checking existing profile:', err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username) {
      setError("Username is required");
      return;
    }

    if (formData.bio.length > 150) {
      setError("Bio must be 150 characters or less");
      return;
    }

    if (!user) {
      setError("You must be signed in to complete your profile");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', formData.username)
        .neq('id', user.id) // Exclude current user
        .single();

      if (existingUser) {
        setError("Username is already taken. Please choose a different one.");
        return;
      }

      // Update the user profile
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          username: formData.username,
          bio: formData.bio,
        });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Success! Redirect to home page
      navigate("/");
    } catch (err) {
      console.error('Profile completion error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            Welcome! Please complete your profile to get started with TrustedGoods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be your public display name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us a bit about yourself... (max 150 characters)"
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={150}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.bio.length}/150 characters
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing profile...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Signed in as: {user.email}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
