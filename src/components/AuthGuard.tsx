import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Pages that don't require authentication
  const publicPages = ['/signin', '/signup', '/complete-profile'];
  const isPublicPage = publicPages.includes(location.pathname);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (authLoading) return;

      // If not authenticated and not on a public page, redirect to signin
      if (!user && !isPublicPage) {
        navigate('/signin');
        return;
      }

      // If authenticated, check if profile is complete
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('username, bio')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error checking profile:', error);
            setProfileLoading(false);
            return;
          }

          // Check if profile needs completion
          const needsCompletion = !profile || 
            !profile.username || 
            profile.username.startsWith('user_') ||
            profile.username.length === 0;

          setNeedsProfileCompletion(needsCompletion);

          // If profile needs completion and not already on complete-profile page, redirect
          if (needsCompletion && location.pathname !== '/complete-profile') {
            navigate('/complete-profile');
            return;
          }

          // If profile is complete and on complete-profile page, redirect to home
          if (!needsCompletion && location.pathname === '/complete-profile') {
            navigate('/');
            return;
          }

        } catch (err) {
          console.error('Error checking profile completion:', err);
        }
      }

      setProfileLoading(false);
    };

    checkProfileCompletion();
  }, [user, authLoading, location.pathname, navigate, isPublicPage]);

  // Show loading spinner while checking auth and profile
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
