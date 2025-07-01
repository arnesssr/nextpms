'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestUploadPage() {
  const [setupResult, setSetupResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const testStorageSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/storage/setup');
      const result = await response.json();
      setSetupResult(result);
    } catch (error) {
      setSetupResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const testUpload = async () => {
    setUploadLoading(true);
    try {
      // Create a test file
      const testContent = 'This is a test image content';
      const testFile = new File([testContent], 'test-image.txt', { type: 'text/plain' });
      
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('media_type', 'document');
      formData.append('usage_type', 'general');
      formData.append('is_primary', 'false');
      formData.append('alt_text', 'Test upload');

      // Test upload to a dummy product (we'll use a proper UUID format)
      const testProductId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
      const response = await fetch(`/api/products/${testProductId}/media`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setUploadResult(result);
    } catch (error) {
      setUploadResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Media Upload Diagnostics</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Storage Setup Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testStorageSetup} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Storage Setup'}
          </Button>
          
          {setupResult && (
            <div className={`p-4 rounded-lg ${setupResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className={`font-medium ${setupResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {setupResult.success ? 'Success' : 'Error'}
              </h3>
              <pre className="mt-2 text-sm overflow-auto">
                {JSON.stringify(setupResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testUpload} 
            disabled={uploadLoading}
            className="w-full"
          >
            {uploadLoading ? 'Uploading...' : 'Test File Upload'}
          </Button>
          
          {uploadResult && (
            <div className={`p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className={`font-medium ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {uploadResult.success ? 'Upload Success' : 'Upload Error'}
              </h3>
              <pre className="mt-2 text-sm overflow-auto">
                {JSON.stringify(uploadResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
            </div>
            <div>
              <strong>Supabase Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
