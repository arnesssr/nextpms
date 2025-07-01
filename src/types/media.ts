// Media management types for the PMS system

export interface Media {
  id: string;
  
  // File information
  file_name: string;
  file_path: string;
  bucket_name: string;
  file_size?: number;
  mime_type?: string;
  file_extension?: string;
  
  // Display and metadata
  alt_text?: string;
  caption?: string;
  description?: string;
  
  // Relationships
  product_id?: string;
  category_id?: string;
  user_id?: string;
  
  // Organization
  media_type: MediaType;
  usage_type: UsageType;
  is_primary: boolean;
  display_order: number;
  
  // Status and visibility
  is_active: boolean;
  is_featured: boolean;
  visibility: VisibilityType;
  
  // Tags and categorization
  tags?: string[];
  
  // Audit fields
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields (from joins)
  product_name?: string;
  product_sku?: string;
  category_name?: string;
}

export type MediaType = 'image' | 'document' | 'video' | 'audio' | 'other';

export type UsageType = 
  | 'product_primary' 
  | 'product_gallery' 
  | 'product_document' 
  | 'category_banner' 
  | 'user_avatar' 
  | 'general';

export type VisibilityType = 'public' | 'private' | 'restricted';

// Upload types
export interface MediaUploadRequest {
  file: File;
  product_id?: string;
  category_id?: string;
  media_type: MediaType;
  usage_type: UsageType;
  alt_text?: string;
  caption?: string;
  description?: string;
  is_primary?: boolean;
  tags?: string[];
  visibility?: VisibilityType;
}

export interface MediaUploadResponse {
  success: boolean;
  media?: Media;
  error?: string;
  progress?: number;
}

// Gallery and display types
export interface MediaGalleryProps {
  productId?: string;
  categoryId?: string;
  mediaType?: MediaType;
  usageType?: UsageType;
  allowUpload?: boolean;
  allowDelete?: boolean;
  allowEdit?: boolean;
  maxItems?: number;
  onMediaSelect?: (media: Media) => void;
  onMediaUpload?: (media: Media) => void;
  onMediaDelete?: (mediaId: string) => void;
}

export interface MediaUploadProps {
  productId?: string;
  categoryId?: string;
  mediaType?: MediaType;
  usageType?: UsageType;
  multiple?: boolean;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  onUploadComplete?: (media: Media[]) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadError?: (error: string) => void;
}

// Transform and optimization types
export interface MediaTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'avif';
  resize?: 'cover' | 'contain' | 'fill';
}

export interface OptimizedMediaUrl {
  original: string;
  thumbnail: string;
  medium: string;
  large: string;
}

// Search and filter types
export interface MediaSearchFilters {
  mediaType?: MediaType;
  usageType?: UsageType;
  productId?: string;
  categoryId?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  visibility?: VisibilityType;
}

export interface MediaSearchParams extends MediaSearchFilters {
  query?: string;
  sortBy?: 'created_at' | 'file_name' | 'file_size' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Bulk operations
export interface BulkMediaOperation {
  mediaIds: string[];
  operation: 'delete' | 'updateTags' | 'updateVisibility' | 'move';
  data?: {
    tags?: string[];
    visibility?: VisibilityType;
    productId?: string;
    categoryId?: string;
  };
}

// Error types
export interface MediaError {
  code: string;
  message: string;
  details?: any;
}

// API response types
export interface MediaApiResponse<T = any> {
  data?: T;
  error?: MediaError;
  success: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Storage configuration
export interface StorageConfig {
  bucketName: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  generateThumbnails: boolean;
  optimizeImages: boolean;
}

// Predefined configurations for different use cases
export const MEDIA_CONFIGS: Record<UsageType, Partial<StorageConfig>> = {
  product_primary: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    generateThumbnails: true,
    optimizeImages: true,
  },
  product_gallery: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    generateThumbnails: true,
    optimizeImages: true,
  },
  product_document: {
    bucketName: 'documents',
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ['application/pdf', 'application/msword', 'text/plain'],
    generateThumbnails: false,
    optimizeImages: false,
  },
  category_banner: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    generateThumbnails: true,
    optimizeImages: true,
  },
  user_avatar: {
    maxFileSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    generateThumbnails: true,
    optimizeImages: true,
  },
  general: {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    allowedMimeTypes: ['image/*', 'application/pdf', 'text/*'],
    generateThumbnails: false,
    optimizeImages: false,
  },
};
