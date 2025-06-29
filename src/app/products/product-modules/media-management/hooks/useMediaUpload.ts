import { useState, useCallback } from 'react';
import { MediaFile, MediaUpload, MediaUploadRequest, MediaStats } from '../types';
import { mediaService } from '../services/mediaService';

interface UseMediaUploadState {
  mediaFiles: MediaFile[];
  currentUploads: MediaUpload[];
  uploadProgress: number;
  stats: MediaStats | null;
  loading: boolean;
  error: string | null;
}

interface UseMediaUploadActions {
  uploadFiles: (files: File[], productId: string, options?: { altTexts?: string[]; primaryIndices?: number[] }) => Promise<void>;
  updateMedia: (mediaId: string, updates: { alt_text?: string; is_primary?: boolean; sort_order?: number }) => Promise<void>;
  deleteMedia: (mediaId: string) => Promise<void>;
  fetchProductMedia: (productId: string) => Promise<void>;
  fetchMediaStats: () => Promise<void>;
  clearUploads: () => void;
  retryUpload: (uploadIndex: number) => Promise<void>;
}

export const useMediaUpload = (): UseMediaUploadState & UseMediaUploadActions => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [currentUploads, setCurrentUploads] = useState<MediaUpload[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductMedia = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const media = await mediaService.getProductMedia(productId);
      setMediaFiles(media.sort((a, b) => a.sort_order - b.sort_order));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch media';
      setError(errorMessage);
      console.error('Error fetching product media:', err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed as it only uses setState functions

  const uploadFiles = useCallback(async (
    files: File[], 
    productId: string, 
    options?: { altTexts?: string[]; primaryIndices?: number[] }
  ) => {
    setLoading(true);
    setError(null);
    
    // Create upload tracking objects
    const uploads: MediaUpload[] = files.map((file, index) => ({
      file,
      preview_url: URL.createObjectURL(file),
      upload_progress: 0,
      status: 'pending'
    }));
    
    setCurrentUploads(uploads);

    try {
      // Update upload status to uploading
      setCurrentUploads(prev => 
        prev.map(upload => ({ ...upload, status: 'uploading' as const }))
      );

      // Simulate upload progress (less frequent updates for smoother UX)
      const progressInterval = setInterval(() => {
        setCurrentUploads(prev => 
          prev.map(upload => ({
            ...upload,
            upload_progress: Math.min(upload.upload_progress + Math.random() * 10, 95)
          }))
        );
        
        setUploadProgress(prev => Math.min(prev + Math.random() * 8, 95));
      }, 500); // Reduced frequency from 200ms to 500ms

      // Prepare upload request
      const uploadRequest: MediaUploadRequest = {
        product_id: productId,
        files,
        alt_texts: options?.altTexts,
        is_primary_indices: options?.primaryIndices
      };

      // Upload files
      const uploadedFiles = await mediaService.uploadMedia(uploadRequest);
      
      // Clear progress interval
      clearInterval(progressInterval);
      
      // Update upload status to completed
      setCurrentUploads(prev => 
        prev.map(upload => ({ 
          ...upload, 
          status: 'completed' as const,
          upload_progress: 100
        }))
      );
      setUploadProgress(100);

      // Add uploaded files to media files list
      setMediaFiles(prev => [...prev, ...uploadedFiles].sort((a, b) => a.sort_order - b.sort_order));

      // Clear uploads after a short delay
      setTimeout(() => {
        setCurrentUploads([]);
        setUploadProgress(0);
      }, 2000);

      // Refresh stats
      await fetchMediaStats();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      
      // Update upload status to error
      setCurrentUploads(prev => 
        prev.map(upload => ({ 
          ...upload, 
          status: 'error' as const,
          error_message: errorMessage
        }))
      );
      
      console.error('Error uploading files:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMedia = useCallback(async (
    mediaId: string, 
    updates: { alt_text?: string; is_primary?: boolean; sort_order?: number }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const updatedMedia = await mediaService.updateMedia({ id: mediaId, ...updates });
      
      setMediaFiles(prev => 
        prev.map(media => 
          media.id === mediaId ? updatedMedia : media
        ).sort((a, b) => a.sort_order - b.sort_order)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update media';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMedia = useCallback(async (mediaId: string) => {
    setLoading(true);
    setError(null);
    try {
      await mediaService.deleteMedia(mediaId);
      
      setMediaFiles(prev => prev.filter(media => media.id !== mediaId));
      
      // Refresh stats
      await fetchMediaStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete media';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMediaStats = useCallback(async () => {
    try {
      const mediaStats = await mediaService.getMediaStats();
      setStats(mediaStats);
    } catch (err) {
      console.error('Error fetching media stats:', err);
    }
  }, []);

  const clearUploads = () => {
    setCurrentUploads([]);
    setUploadProgress(0);
    setError(null);
  };

  const retryUpload = async (uploadIndex: number) => {
    const upload = currentUploads[uploadIndex];
    if (!upload) return;

    setCurrentUploads(prev => 
      prev.map((u, index) => 
        index === uploadIndex 
          ? { ...u, status: 'pending', upload_progress: 0, error_message: undefined }
          : u
      )
    );

    // This would retry the specific upload
    // For now, we'll simulate a retry
    try {
      setCurrentUploads(prev => 
        prev.map((u, index) => 
          index === uploadIndex ? { ...u, status: 'uploading' } : u
        )
      );

      // Simulate retry upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentUploads(prev => 
        prev.map((u, index) => 
          index === uploadIndex 
            ? { ...u, status: 'completed', upload_progress: 100 }
            : u
        )
      );
    } catch (err) {
      setCurrentUploads(prev => 
        prev.map((u, index) => 
          index === uploadIndex 
            ? { ...u, status: 'error', error_message: 'Retry failed' }
            : u
        )
      );
    }
  };

  return {
    mediaFiles,
    currentUploads,
    uploadProgress,
    stats,
    loading,
    error,
    uploadFiles,
    updateMedia,
    deleteMedia,
    fetchProductMedia,
    fetchMediaStats,
    clearUploads,
    retryUpload,
  };
};
