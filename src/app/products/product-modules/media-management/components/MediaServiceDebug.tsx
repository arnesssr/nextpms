'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const MediaServiceDebug: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testing, setTesting] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    try {
      setTesting(true);
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [testName]: { success: true, data: result } }));
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          details: error
        } 
      }));
    } finally {
      setTesting(false);
    }
  };

  const tests = [
    {
      name: 'Database Connection',
      description: 'Test basic Supabase connection',
      test: async () => {
        const { data, error } = await supabase.from('products').select('id').limit(1);
        if (error) throw error;
        return { connected: true, productCount: data?.length || 0 };
      }
    },
    {
      name: 'Media Table Exists',
      description: 'Check if media table exists and get structure',
      test: async () => {
        const { data, error } = await supabase.from('media').select('*').limit(1);
        if (error) throw error;
        return { exists: true, sampleCount: data?.length || 0, sampleData: data?.[0] || null };
      }
    },
    {
      name: 'Media Table Columns',
      description: 'Check media table structure',
      test: async () => {
        // Try to get table structure by running a query that will show column names
        const { data, error } = await supabase
          .from('media')
          .select('id, product_id, file_name, file_path, bucket_name, file_size, mime_type, created_at')
          .limit(1);
        
        if (error) throw error;
        return { 
          columns: [
            'id', 'product_id', 'file_name', 'file_path', 
            'bucket_name', 'file_size', 'mime_type', 'created_at'
          ],
          queryWorked: true
        };
      }
    },
    {
      name: 'Storage Bucket Access',
      description: 'Test Supabase storage bucket access',
      test: async () => {
        const bucketName = process.env.SUPABASE_S3_BUCKET_NAME || 'media-files';
        const { data, error } = await supabase.storage.from(bucketName).list('', { limit: 1 });
        if (error) throw error;
        return { bucketName, accessible: true, fileCount: data?.length || 0 };
      }
    },
    {
      name: 'Environment Variables',
      description: 'Check required environment variables',
      test: async () => {
        return {
          NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_S3_BUCKET_NAME: process.env.SUPABASE_S3_BUCKET_NAME || 'media-files',
          configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL
        };
      }
    },
    {
      name: 'Create Test Media Record',
      description: 'Try to create a test media record',
      test: async () => {
        const testRecord = {
          product_id: 'demo-product-123',
          file_name: 'test-image.jpg',
          file_path: 'test/test-image.jpg',
          bucket_name: 'media-files',
          file_size: 1024,
          mime_type: 'image/jpeg',
          file_extension: 'jpg',
          alt_text: 'Test image',
          media_type: 'image',
          usage_type: 'product_gallery',
          is_primary: false,
          display_order: 1,
          is_active: true,
          visibility: 'public',
          created_by: 'debug-test'
        };

        const { data, error } = await supabase
          .from('media')
          .insert(testRecord)
          .select()
          .single();

        if (error) throw error;

        // Clean up test record
        await supabase.from('media').delete().eq('id', data.id);

        return { created: true, testRecord: data };
      }
    }
  ];

  const runAllTests = async () => {
    setTestResults({});
    for (const test of tests) {
      await runTest(test.name, test.test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const getStatusBadge = (testName: string) => {
    const result = testResults[testName];
    if (!result) {
      return <Badge variant="outline">Not Run</Badge>;
    }
    
    return result.success 
      ? <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Pass</Badge>
      : <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Fail</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Media Service Debug Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={testing}>
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run All Tests'
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setTestResults({})}
            disabled={testing}
          >
            Clear Results
          </Button>
        </div>

        <div className="space-y-3">
          {tests.map((test) => (
            <div key={test.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(test.name)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runTest(test.name, test.test)}
                    disabled={testing}
                  >
                    Test
                  </Button>
                </div>
              </div>

              {testResults[test.name] && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                  {testResults[test.name].success ? (
                    <div>
                      <p className="text-green-700 font-medium">✅ Success</p>
                      <pre className="mt-1 text-xs overflow-auto">
                        {JSON.stringify(testResults[test.name].data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div>
                      <p className="text-red-700 font-medium">❌ Failed</p>
                      <p className="text-red-600 mt-1">{testResults[test.name].error}</p>
                      {testResults[test.name].details && (
                        <pre className="mt-2 text-xs overflow-auto text-gray-600">
                          {JSON.stringify(testResults[test.name].details, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaServiceDebug;
