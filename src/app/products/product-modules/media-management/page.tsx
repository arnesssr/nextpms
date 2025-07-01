'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaUploader } from './components/MediaUploader';
import { ImageGallery } from './components/ImageGallery';
import EnhancedMediaUploader from './components/EnhancedMediaUploader';
import { useMediaUpload } from './hooks/useMediaUpload';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MediaManagementPage() {
  const { 
    mediaFiles, 
    loading, 
    error, 
    fetchProductMedia, 
    updateMedia, 
    deleteMedia 
  } = useMediaUpload();

  // Demo product ID for testing
  const demoProductId = 'demo-product-123';

  React.useEffect(() => {
    fetchProductMedia(demoProductId);
  }, []);

  const handleUploadComplete = (files: any[]) => {
    console.log('Upload completed:', files);
    // Refresh media after upload
    fetchProductMedia(demoProductId);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  const handleMediaUpdate = async (media: any) => {
    try {
      await updateMedia(media.id, {
        alt_text: media.alt_text,
        is_primary: media.is_primary,
        sort_order: media.sort_order
      });
    } catch (error) {
      console.error('Failed to update media:', error);
    }
  };

  const handleMediaDelete = async (mediaId: string) => {
    try {
      await deleteMedia(mediaId);
    } catch (error) {
      console.error('Failed to delete media:', error);
    }
  };

  const handleMediaSelect = (media: any) => {
    console.log('Media selected:', media);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Media Management</h1>
          <p className="text-muted-foreground">
            Upload and manage product media using Supabase S3 storage
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            ✅ Phase 1: S3 Integration
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            🚀 Phase 2: Enhanced Processing
          </Badge>
        </div>
      </div>

      {/* Configuration Display */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Bucket:</span> {process.env.SUPABASE_S3_BUCKET_NAME || 'media-files'}
            </div>
            <div>
              <span className="font-medium">Supabase URL:</span> {process.env.NEXT_PUBLIC_SUPABASE_URL}
            </div>
            <div>
              <span className="font-medium">Test Product ID:</span> {demoProductId}
            </div>
            <div>
              <span className="font-medium">Media Files:</span> {mediaFiles?.length || 0} files
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Media Files</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="phase2" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phase1">Phase 1 - Basic Upload</TabsTrigger>
              <TabsTrigger value="phase2">Phase 2 - Enhanced Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="phase1" className="mt-6">
              <MediaUploader
                productId={demoProductId}
                maxFiles={10}
                maxFileSize={10 * 1024 * 1024} // 10MB
                acceptedFileTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
            </TabsContent>
            
            <TabsContent value="phase2" className="mt-6">
              <EnhancedMediaUploader
                productId={demoProductId}
                maxFiles={10}
                maxFileSize={10 * 1024 * 1024} // 10MB
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Gallery Section */}
      <Card>
        <CardHeader>
          <CardTitle>Media Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading media files...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!loading && (
            <ImageGallery
              productId={demoProductId}
              mediaFiles={mediaFiles || []}
              onMediaSelect={handleMediaSelect}
              onMediaUpdate={handleMediaUpdate}
              onMediaDelete={handleMediaDelete}
              allowEdit={true}
              allowDelete={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Implementation Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phase 1 Status */}
        <Card>
          <CardHeader>
            <CardTitle>Phase 1 Implementation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">✅</Badge>
                <span>Supabase S3 credentials configured</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">✅</Badge>
                <span>Database schema alignment</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">✅</Badge>
                <span>File upload to correct bucket</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">✅</Badge>
                <span>Error handling & cleanup</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">✅</Badge>
                <span>Service layer integration</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase 2 Status */}
        <Card>
          <CardHeader>
            <CardTitle>Phase 2 Enhancement Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">🚀</Badge>
                <span>Image compression & optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">🚀</Badge>
                <span>Multiple thumbnail generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">🚀</Badge>
                <span>Real-time processing progress</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">🚀</Badge>
                <span>Advanced processing options</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">🚀</Badge>
                <span>Metadata extraction & analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">🚀</Badge>
                <span>Format conversion (WebP, JPEG, PNG)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
