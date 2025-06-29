'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { MediaUploader } from '../product-modules/media-management/components/MediaUploader';
import { ImageGallery } from '../product-modules/media-management/components/ImageGallery';
import { useMediaUpload } from '../product-modules/media-management/hooks/useMediaUpload';
import { MediaFile } from '../product-modules/media-management/types';

interface MediaManagementTabProps {
  productId?: string;
}

const MediaManagementTab: React.FC<MediaManagementTabProps> = ({ 
  productId = 'sample-product-1' 
}) => {
  const { 
    mediaFiles, 
    loading, 
    error, 
    fetchProductMedia, 
    updateMedia, 
    deleteMedia 
  } = useMediaUpload();

  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch media files when component mounts or productId changes
  useEffect(() => {
    if (productId) {
      fetchProductMedia(productId);
    }
  }, [productId]); // Removed fetchProductMedia from dependencies

  const handleUploadComplete = useCallback((files: MediaFile[]) => {
    console.log('Upload completed:', files);
    // Refresh the media files after upload
    if (productId) {
      fetchProductMedia(productId);
    }
  }, [productId]); // Removed fetchProductMedia to prevent infinite loop

  const handleUploadError = useCallback((error: string) => {
    setUploadError(error);
    console.error('Upload error:', error);
  }, []);

  const handleMediaUpdate = useCallback(async (media: MediaFile) => {
    try {
      await updateMedia(media.id, {
        alt_text: media.alt_text,
        is_primary: media.is_primary,
        sort_order: media.sort_order
      });
    } catch (error) {
      console.error('Failed to update media:', error);
    }
  }, [updateMedia]);

  const handleMediaDelete = useCallback(async (mediaId: string) => {
    try {
      await deleteMedia(mediaId);
    } catch (error) {
      console.error('Failed to delete media:', error);
    }
  }, [deleteMedia]);

  const handleMediaSelect = useCallback((media: MediaFile) => {
    console.log('Media selected:', media);
  }, []);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upload Product Images</h3>
        <MediaUploader
          productId={productId}
          maxFiles={10}
          maxFileSize={10 * 1024 * 1024} // 10MB
          acceptedFileTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
        
        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
        )}
      </Card>

      {/* Gallery Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Product Image Gallery</h3>
        
        {/* Fixed height container to prevent layout shifts */}
        <div className="min-h-[400px]">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading media files...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!loading && (
            <ImageGallery
              productId={productId}
              mediaFiles={mediaFiles || []} // Ensure mediaFiles is never undefined
              onMediaSelect={handleMediaSelect}
              onMediaUpdate={handleMediaUpdate}
              onMediaDelete={handleMediaDelete}
              allowEdit={true}
              allowDelete={true}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default MediaManagementTab;
