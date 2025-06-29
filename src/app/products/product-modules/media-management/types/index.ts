// Media-related types
export interface MediaFile {
  id: string;
  product_id: string;
  file_name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  thumbnail_url?: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
  uploaded_by: string;
  uploaded_at: string;
  updated_at: string;
}

export interface MediaUpload {
  file: File;
  preview_url: string;
  upload_progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error_message?: string;
}

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface MediaGallery {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  media_files: MediaFile[];
  created_at: string;
  updated_at: string;
}

// Enums
export type MediaType = 'image' | 'video' | 'document';
export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'error';

// Form types
export interface MediaUploadRequest {
  product_id: string;
  files: File[];
  alt_texts?: string[];
  is_primary_indices?: number[];
}

export interface MediaUpdateRequest {
  id: string;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface BulkMediaRequest {
  media_ids: string[];
  action: 'delete' | 'update_product' | 'set_primary' | 'reorder';
  data?: any;
}

// API response types
export interface MediaResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface MediaStats {
  total_files: number;
  total_size: number;
  by_type: Record<string, number>;
  recent_uploads: number;
  storage_used: number;
  storage_limit: number;
}

// Component props
export interface MediaUploaderProps {
  productId?: string;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  onUploadComplete?: (files: MediaFile[]) => void;
  onUploadError?: (error: string) => void;
}

export interface ImageGalleryProps {
  productId?: string;
  mediaFiles: MediaFile[];
  onMediaSelect?: (media: MediaFile) => void;
  onMediaDelete?: (mediaId: string) => void;
  onMediaUpdate?: (media: MediaFile) => void;
  allowEdit?: boolean;
  allowDelete?: boolean;
}

export interface MediaCardProps {
  media: MediaFile;
  onSelect?: (media: MediaFile) => void;
  onDelete?: (mediaId: string) => void;
  onEdit?: (media: MediaFile) => void;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImage: Blob, cropData: ImageProcessingOptions['crop']) => void;
  onCancel: () => void;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
}

// Validation types
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface MediaValidationRules {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  maxFiles: number;
  minDimensions?: { width: number; height: number };
  maxDimensions?: { width: number; height: number };
}

// Storage provider types
export interface StorageProvider {
  name: string;
  upload: (file: File, options?: any) => Promise<string>;
  delete: (fileUrl: string) => Promise<void>;
  getPublicUrl: (fileName: string) => string;
}
