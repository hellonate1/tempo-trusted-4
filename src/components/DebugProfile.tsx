import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DebugProfile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Debug Profile Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current User Data:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Username Options:</h3>
            <ul className="space-y-1 text-sm">
              <li>• Email: {user?.email}</li>
              <li>• Username from metadata: {user?.user_metadata?.username}</li>
              <li>• Full name: {user?.user_metadata?.full_name}</li>
              <li>• User ID: {user?.id}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Try these profile links:</h3>
            <div className="space-y-2">
              {user?.user_metadata?.username && (
                <Link to={`/profile/${user.user_metadata.username}`}>
                  <Button className="w-full" variant="outline">
                    /profile/{user.user_metadata.username}
                  </Button>
                </Link>
              )}
              {user?.email && (
                <Link to={`/profile/${user.email.split('@')[0]}`}>
                  <Button className="w-full" variant="outline">
                    /profile/{user.email.split('@')[0]}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <Link to="/">
            <Button className="w-full">Back to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugProfile;
