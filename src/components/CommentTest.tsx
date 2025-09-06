import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CommentTest = () => {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults(null);

    try {
      const results: any = {};

      // Test 1: Check if user is authenticated
      results.authentication = {
        isAuthenticated,
        userId: user?.id,
        userEmail: user?.email
      };

      // Test 2: Check if review_comments table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('review_comments')
        .select('count')
        .limit(1);
      
      results.tableExists = {
        success: !tableError,
        error: tableError?.message,
        data: tableCheck
      };

      // Test 3: Check if user exists in users table
      if (user) {
        const { data: userCheck, error: userError } = await supabase
          .from('users')
          .select('id, username')
          .eq('id', user.id)
          .single();
        
        results.userExists = {
          success: !userError,
          error: userError?.message,
          data: userCheck
        };
      }

      // Test 4: Check if there are any reviews to comment on
      const { data: reviewsCheck, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, title')
        .limit(1);
      
      results.reviewsExist = {
        success: !reviewsError,
        error: reviewsError?.message,
        data: reviewsCheck
      };

      // Test 5: Try to insert a test comment (if we have a review)
      if (reviewsCheck && reviewsCheck.length > 0 && user) {
        const testReviewId = reviewsCheck[0].id;
        const { data: insertTest, error: insertError } = await supabase
          .from('review_comments')
          .insert({
            review_id: testReviewId,
            user_id: user.id,
            content: 'Test comment - ' + Date.now()
          })
          .select()
          .single();
        
        results.insertTest = {
          success: !insertError,
          error: insertError?.message,
          data: insertTest
        };

        // Clean up test comment
        if (insertTest) {
          await supabase
            .from('review_comments')
            .delete()
            .eq('id', insertTest.id);
        }
      }

      setTestResults(results);
      console.log('Test results:', results);

    } catch (err) {
      console.error('Test error:', err);
      setTestResults({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Comment System Debug Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={loading}>
          {loading ? 'Running Tests...' : 'Run Comment System Tests'}
        </Button>
        
        {testResults && (
          <div className="space-y-4">
            <h3 className="font-semibold">Test Results:</h3>
            
            {testResults.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800">Error: {testResults.error}</p>
              </div>
            )}

            {testResults.authentication && (
              <div className="p-3 bg-gray-50 border rounded">
                <h4 className="font-medium">Authentication:</h4>
                <pre className="text-sm">{JSON.stringify(testResults.authentication, null, 2)}</pre>
              </div>
            )}

            {testResults.tableExists && (
              <div className="p-3 bg-gray-50 border rounded">
                <h4 className="font-medium">Table Exists:</h4>
                <pre className="text-sm">{JSON.stringify(testResults.tableExists, null, 2)}</pre>
              </div>
            )}

            {testResults.userExists && (
              <div className="p-3 bg-gray-50 border rounded">
                <h4 className="font-medium">User Exists:</h4>
                <pre className="text-sm">{JSON.stringify(testResults.userExists, null, 2)}</pre>
              </div>
            )}

            {testResults.reviewsExist && (
              <div className="p-3 bg-gray-50 border rounded">
                <h4 className="font-medium">Reviews Exist:</h4>
                <pre className="text-sm">{JSON.stringify(testResults.reviewsExist, null, 2)}</pre>
              </div>
            )}

            {testResults.insertTest && (
              <div className="p-3 bg-gray-50 border rounded">
                <h4 className="font-medium">Insert Test:</h4>
                <pre className="text-sm">{JSON.stringify(testResults.insertTest, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentTest;
