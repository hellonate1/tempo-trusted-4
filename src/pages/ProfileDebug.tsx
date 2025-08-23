import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ProfileDebug = () => {
  const { username } = useParams<{ username: string }>();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const debugProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Looking for username:', username);

        // Test 1: Check if users table exists and has data
        const { data: allUsers, error: allUsersError } = await supabase
          .from('users')
          .select('*');

        console.log('All users:', allUsers);
        console.log('All users error:', allUsersError);

        // Test 2: Try to find the specific user
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        console.log('User data:', userData);
        console.log('User error:', userError);

        // Test 3: Check if tables exist
        const { data: tableInfo, error: tableError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .in('table_name', ['users', 'reviews', 'products']);

        console.log('Table info:', tableInfo);
        console.log('Table error:', tableError);

        setDebugInfo({
          username,
          allUsers,
          allUsersError,
          userData,
          userError,
          tableInfo,
          tableError
        });

      } catch (err) {
        console.error('Debug error:', err);
        setError('Debug failed');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      debugProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Debugging...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Looking for username:</h3>
                <p className="text-lg font-mono bg-gray-100 p-2 rounded">{username}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">All Users in Database:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo?.allUsers, null, 2)}
                </pre>
                {debugInfo?.allUsersError && (
                  <p className="text-red-500 text-sm mt-1">Error: {debugInfo.allUsersError.message}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Specific User Query:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo?.userData, null, 2)}
                </pre>
                {debugInfo?.userError && (
                  <p className="text-red-500 text-sm mt-1">Error: {debugInfo.userError.message}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Available Tables:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo?.tableInfo, null, 2)}
                </pre>
              </div>

              {error && (
                <div className="text-red-500">
                  <h3 className="font-semibold">Debug Error:</h3>
                  <p>{error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileDebug;
