// Re-export media types and add module-specific types
export type { Media, MediaUploadRequest, MediaType, UsageType } from '@/types/media';

// Alias for compatibility with existing components
export interface MediaFile extends Media {
  // Additional properties specific to product media management if needed
}

export interface MediaUploadProgress {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface MediaManagerProps {
  productId?: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
  allowEdit?: boolean;
  maxFiles?: number;
  onMediaChange?: (media: MediaFile[]) => void;
}
