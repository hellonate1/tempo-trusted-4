import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DatabaseTest = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    setTestResults(null);

    try {
      const results: any = {};

      // Test 1: Check if we can connect to Supabase
      console.log('Testing Supabase connection...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      results.connection = {
        success: !sessionError,
        error: sessionError?.message,
        session: sessionData
      };

      // Test 2: Check if products table exists and is accessible
      console.log('Testing products table...');
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('count')
        .limit(1);
      
      results.productsTable = {
        success: !productsError,
        error: productsError?.message,
        data: productsData
      };

      // Test 3: Check if reviews table exists and is accessible
      console.log('Testing reviews table...');
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('count')
        .limit(1);
      
      results.reviewsTable = {
        success: !reviewsError,
        error: reviewsError?.message,
        data: reviewsData
      };

      // Test 4: Try to insert a test product
      console.log('Testing product insertion...');
      const { data: insertData, error: insertError } = await supabase
        .from('products')
        .insert({
          name: 'Test Product - ' + Date.now(),
          description: 'This is a test product',
          category: 'Test'
        })
        .select()
        .single();

      results.productInsert = {
        success: !insertError,
        error: insertError?.message,
        data: insertData
      };

      // Test 5: Check RLS policies
      console.log('Testing RLS policies...');
      const { data: policyData, error: policyError } = await supabase
        .from('information_schema.policies')
        .select('*')
        .eq('table_name', 'products');

      results.rlsPolicies = {
        success: !policyError,
        error: policyError?.message,
        policies: policyData
      };

      setTestResults(results);
      console.log('All tests completed:', results);

    } catch (err) {
      console.error('Test error:', err);
      setError('Test failed: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Database Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runTests} disabled={loading}>
              {loading ? 'Running Tests...' : 'Run Database Tests'}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {testResults && (
              <div className="space-y-4">
                <h3 className="font-semibold">Test Results:</h3>
                
                {Object.entries(testResults).map(([testName, result]: [string, any]) => (
                  <div key={testName} className="border rounded p-4">
                    <h4 className="font-medium mb-2">{testName}</h4>
                    <div className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      Status: {result.success ? '✅ PASS' : '❌ FAIL'}
                    </div>
                    {result.error && (
                      <div className="text-sm text-red-600 mt-1">
                        Error: {result.error}
                      </div>
                    )}
                    {result.data && (
                      <div className="text-sm text-gray-600 mt-1">
                        Data: {JSON.stringify(result.data, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseTest;
