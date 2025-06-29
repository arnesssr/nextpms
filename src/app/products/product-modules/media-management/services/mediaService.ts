import { 
  MediaFile, 
  MediaUploadRequest, 
  MediaUpdateRequest, 
  BulkMediaRequest,
  MediaStats,
  FileValidationResult,
  MediaValidationRules
} from '../types';

// Mock API base URL - replace with actual API
const API_BASE = '/api/media';

export const mediaService = {
  // Get media files for a specific product
  async getProductMedia(productId: string): Promise<MediaFile[]> {
    try {
      // Mock implementation - replace with actual API call
      const mockMediaFiles: MediaFile[] = [
        {
          id: '1',
          product_id: productId,
          file_name: 'wireless-headphones-main.jpg',
          original_name: 'headphones-photo.jpg',
          file_type: 'image/jpeg',
          file_size: 245760, // 240KB
          file_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
          thumbnail_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
          alt_text: 'Wireless headphones main product image',
          is_primary: true,
          sort_order: 1,
          uploaded_by: 'admin',
          uploaded_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          product_id: productId,
          file_name: 'wireless-headphones-side.jpg',
          original_name: 'headphones-side-view.jpg',
          file_type: 'image/jpeg',
          file_size: 198432, // 194KB
          file_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop',
          thumbnail_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop',
          alt_text: 'Wireless headphones side view',
          is_primary: false,
          sort_order: 2,
          uploaded_by: 'admin',
          uploaded_at: '2024-01-15T10:32:00Z',
          updated_at: '2024-01-15T10:32:00Z'
        },
        {
          id: '3',
          product_id: productId,
          file_name: 'wireless-headphones-detail.jpg',
          original_name: 'headphones-detail.jpg',
          file_type: 'image/jpeg',
          file_size: 312576, // 305KB
          file_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop',
          thumbnail_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=150&h=150&fit=crop',
          alt_text: 'Wireless headphones detail shot',
          is_primary: false,
          sort_order: 3,
          uploaded_by: 'admin',
          uploaded_at: '2024-01-15T10:35:00Z',
          updated_at: '2024-01-15T10:35:00Z'
        }
      ];

      // Simulate API delay (reduced for better UX)
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockMediaFiles;
    } catch (error) {
      console.error('Error fetching product media:', error);
      throw new Error('Failed to fetch product media');
    }
  },

  // Upload media files
  async uploadMedia(request: MediaUploadRequest): Promise<MediaFile[]> {
    try {
      // Validate files first
      const validationResults = request.files.map(file => this.validateFile(file));
      const invalidFiles = validationResults.filter(result => !result.isValid);
      
      if (invalidFiles.length > 0) {
        const errors = invalidFiles.flatMap(result => result.errors);
        throw new Error(`File validation failed: ${errors.join(', ')}`);
      }

      // Mock implementation - replace with actual API call
      const uploadedFiles: MediaFile[] = request.files.map((file, index) => ({
        id: (Date.now() + index).toString(),
        product_id: request.product_id,
        file_name: `${request.product_id}-${Date.now()}-${index}.${file.name.split('.').pop()}`,
        original_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: URL.createObjectURL(file), // Mock URL - replace with actual upload
        thumbnail_url: URL.createObjectURL(file), // Mock thumbnail
        alt_text: request.alt_texts?.[index] || `${file.name} for product ${request.product_id}`,
        is_primary: request.is_primary_indices?.includes(index) || false,
        sort_order: index + 1,
        uploaded_by: 'current_user',
        uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return uploadedFiles;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error('Failed to upload media files');
    }
  },

  // Update media metadata
  async updateMedia(request: MediaUpdateRequest): Promise<MediaFile> {
    try {
      // Mock implementation - replace with actual API call
      const currentMedia = await this.getMediaById(request.id);
      if (!currentMedia) {
        throw new Error('Media file not found');
      }

      const updatedMedia: MediaFile = {
        ...currentMedia,
        alt_text: request.alt_text ?? currentMedia.alt_text,
        is_primary: request.is_primary ?? currentMedia.is_primary,
        sort_order: request.sort_order ?? currentMedia.sort_order,
        updated_at: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      return updatedMedia;
    } catch (error) {
      console.error('Error updating media:', error);
      throw new Error('Failed to update media');
    }
  },

  // Delete media file
  async deleteMedia(mediaId: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      const response = await fetch(`${API_BASE}/${mediaId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete media file');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new Error('Failed to delete media file');
    }
  },

  // Get media by ID
  async getMediaById(mediaId: string): Promise<MediaFile | null> {
    try {
      // Mock implementation - replace with actual API call
      // This would typically fetch from your database
      const mockMedia: MediaFile = {
        id: mediaId,
        product_id: '1',
        file_name: 'sample-file.jpg',
        original_name: 'sample.jpg',
        file_type: 'image/jpeg',
        file_size: 245760,
        file_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
        alt_text: 'Sample image',
        is_primary: false,
        sort_order: 1,
        uploaded_by: 'admin',
        uploaded_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockMedia;
    } catch (error) {
      console.error('Error fetching media by ID:', error);
      return null;
    }
  },

  // Bulk operations on media
  async bulkMediaOperation(request: BulkMediaRequest): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      const response = await fetch(`${API_BASE}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk operation');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      throw new Error('Failed to perform bulk media operation');
    }
  },

  // Get media statistics
  async getMediaStats(): Promise<MediaStats> {
    try {
      // Mock implementation - replace with actual API call
      const mockStats: MediaStats = {
        total_files: 156,
        total_size: 52428800, // 50MB
        by_type: {
          'image/jpeg': 89,
          'image/png': 34,
          'image/webp': 23,
          'video/mp4': 8,
          'application/pdf': 2
        },
        recent_uploads: 12,
        storage_used: 52428800, // 50MB
        storage_limit: 1073741824 // 1GB
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockStats;
    } catch (error) {
      console.error('Error fetching media stats:', error);
      throw new Error('Failed to fetch media statistics');
    }
  },

  // Validate file before upload
  validateFile(file: File, rules?: MediaValidationRules): FileValidationResult {
    const defaultRules: MediaValidationRules = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      maxFiles: 10,
      minDimensions: { width: 100, height: 100 },
      maxDimensions: { width: 4000, height: 4000 }
    };

    const validationRules = { ...defaultRules, ...rules };
    const errors: string[] = [];

    // Check file size
    if (file.size > validationRules.maxFileSize) {
      errors.push(`File size exceeds maximum allowed size of ${this.formatFileSize(validationRules.maxFileSize)}`);
    }

    // Check file type
    if (!validationRules.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${validationRules.allowedTypes.join(', ')}`);
    }

    // Check file name
    if (!file.name || file.name.trim().length === 0) {
      errors.push('File name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Generate thumbnail URL
  generateThumbnailUrl(originalUrl: string, width: number = 150, height: number = 150): string {
    // This would typically use your image processing service
    // For demo purposes, we'll use Unsplash's resize parameters
    if (originalUrl.includes('unsplash.com')) {
      return `${originalUrl.split('?')[0]}?w=${width}&h=${height}&fit=crop`;
    }
    return originalUrl;
  },

  // Check if file is image
  isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
  },

  // Check if file is video
  isVideoFile(fileType: string): boolean {
    return fileType.startsWith('video/');
  },

  // Get file extension from MIME type
  getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'application/pdf': 'pdf'
    };
    
    return mimeToExt[mimeType] || 'unknown';
  }
};
