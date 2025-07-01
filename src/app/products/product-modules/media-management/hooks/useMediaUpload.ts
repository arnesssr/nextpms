'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductMediaService } from '@/services/products/mediaService';
import { Media, MediaUploadRequest, MediaType } from '@/types/media';

// Utility function to generate Supabase storage URLs
function generateSupabaseUrl(bucketName: string, filePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
}

export interface MediaFile extends Media {
  // Additional properties if needed
}

interface UseMediaUploadReturn {
  media: MediaFile[];
  mediaFiles: MediaFile[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
  fetchMedia: () => Promise<void>;
  fetchProductMedia: (productId: string) => Promise<void>;
  uploadMedia: (file: File, metadata?: Partial<MediaUploadRequest>) => Promise<Media>;
  deleteMedia: (mediaId: string) => Promise<void>;
  updateMedia: (mediaId: string, updates: Partial<Media>) => Promise<void>;
  setPrimaryImage: (mediaId: string) => Promise<void>;
}

export function useMediaUpload(productId?: string | null): UseMediaUploadReturn {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch media for the current product
  const fetchMedia = useCallback(async () => {
    if (!productId) {
      setMedia([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ProductMediaService.getProductMedia(productId);
      
      if (response.success && response.data) {
        setMedia(response.data as MediaFile[]);
      } else {
        setError(response.error?.message || 'Failed to fetch media');
        setMedia([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Alias for fetchMedia to match MediaManagementTab usage
  const fetchProductMedia = useCallback(async (id: string) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await ProductMediaService.getProductMedia(id);
      
      if (response.success && response.data) {
        setMedia(response.data as MediaFile[]);
      } else {
        setError(response.error?.message || 'Failed to fetch media');
        setMedia([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload media
  const uploadMedia = useCallback(async (
    file: File, 
    metadata: Partial<MediaUploadRequest> = {}
  ): Promise<Media> => {
    if (!productId) {
      throw new Error('Product ID is required for media upload');
    }

    setUploading(true);
    setError(null);

    try {
      // Determine media type from file
      const mediaType: MediaType = file.type.startsWith('image/') ? 'image' : 
                                   file.type.startsWith('video/') ? 'video' :
                                   file.type.startsWith('audio/') ? 'audio' :
                                   file.type.includes('pdf') || file.type.includes('document') ? 'document' : 'other';

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('media_type', mediaType);
      formData.append('usage_type', metadata.usage_type || 'product_gallery');
      formData.append('is_primary', String(metadata.is_primary || false));
      
      if (metadata.alt_text) {
        formData.append('alt_text', metadata.alt_text);
      }
      if (metadata.caption) {
        formData.append('caption', metadata.caption);
      }
      if (metadata.description) {
        formData.append('description', metadata.description);
      }

      // Upload via API route
      const response = await fetch(`/api/products/${productId}/media`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.media) {
        // Refresh media list
        await fetchMedia();
        return result.media;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [productId, fetchMedia]);

  // Delete media
  const deleteMedia = useCallback(async (mediaId: string) => {
    setError(null);

    try {
      // For now, we'll implement a basic delete by calling the API directly
      // This would need to be implemented in the ProductMediaService
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      // Refresh media list
      await fetchMedia();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchMedia]);

  // Update media
  const updateMedia = useCallback(async (mediaId: string, updates: Partial<Media>) => {
    setError(null);

    try {
      // For now, we'll implement a basic update by calling the API directly
      // This would need to be implemented in the ProductMediaService
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update media');
      }

      // Refresh media list
      await fetchMedia();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchMedia]);

  // Set primary image
  const setPrimaryImage = useCallback(async (mediaId: string) => {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    setError(null);

    try {
      const response = await ProductMediaService.setProductPrimaryImage(productId, mediaId);
      
      if (response.success) {
        // Update the product's featured image
        await ProductMediaService.updateProductFeaturedImage(productId);
        // Refresh media list
        await fetchMedia();
      } else {
        throw new Error(response.error?.message || 'Failed to set primary image');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set primary image';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [productId, fetchMedia]);

  // Fetch media when productId changes
  useEffect(() => {
    if (productId) {
      fetchMedia();
    } else {
      setMedia([]);
    }
  }, [productId, fetchMedia]);

  return {
    media,
    mediaFiles: media, // Alias for MediaManagementTab compatibility
    loading,
    uploading,
    error,
    fetchMedia,
    fetchProductMedia,
    uploadMedia,
    deleteMedia,
    updateMedia,
    setPrimaryImage,
  };
}
