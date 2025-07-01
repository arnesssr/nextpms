import { 
  MediaFile, 
  MediaUploadRequest, 
  MediaUpdateRequest, 
  BulkMediaRequest,
  MediaStats,
  FileValidationResult,
  MediaValidationRules
} from '../types';
import { supabase } from '@/lib/supabaseClient';

// Supabase Storage Configuration using environment variables
const STORAGE_BUCKET = process.env.SUPABASE_S3_BUCKET_NAME || 'media-files';
const STORAGE_URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Validate storage configuration
if (!STORAGE_BUCKET || !STORAGE_URL_BASE) {
  console.warn('Missing Supabase storage configuration. Using defaults.');
}

export const mediaService = {
  // Get media files for a specific product
  async getProductMedia(productId: string): Promise<MediaFile[]> {
    try {
      // Replace the mock implementation with actual API call to fetch media files from Supabase or other backend service.
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('product_id', productId);

      if (error) {
        console.error('Error fetching media from database:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error; // Throw the original error so we can see the details
      }

      // Transform database fields to match frontend MediaFile interface
      const transformedData = (data || []).map(item => mediaService.transformDbToMediaFile(item));
      return transformedData;
    } catch (error) {
      console.error('Error fetching product media:', error);
      throw new Error('Failed to fetch product media');
    }
  },

  // Upload media files
  async uploadMedia(request: MediaUploadRequest): Promise<MediaFile[]> {
    try {
      // Validate files first
      const validationResults = request.files.map(file => mediaService.validateFile(file));
      const invalidFiles = validationResults.filter(result => !result.isValid);
      
      if (invalidFiles.length > 0) {
        const errors = invalidFiles.flatMap(result => result.errors);
        throw new Error(`File validation failed: ${errors.join(', ')}`);
      }

      const uploadedFiles: MediaFile[] = [];

      // Upload each file to Supabase storage and create database records
      for (let index = 0; index < request.files.length; index++) {
        const file = request.files[index];
        const fileExt = mediaService.getFileExtension(file.type);
        const fileName = `${request.product_id}-${Date.now()}-${index}.${fileExt}`;
        const filePath = `products/${request.product_id}/${fileName}`;

        // Upload file to Supabase Storage using correct bucket name
        const { data: storageData, error: storageError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file);

        if (storageError) {
          console.error('Error uploading to storage:', storageError);
          throw new Error(`Failed to upload ${file.name}: ${storageError.message}`);
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        // Create database record using correct schema mapping
        const mediaRecord = {
          product_id: request.product_id,
          file_name: fileName,
          file_path: filePath, // Database uses file_path, not storage_path
          bucket_name: STORAGE_BUCKET,
          file_size: file.size,
          mime_type: file.type,
          file_extension: fileExt,
          alt_text: request.alt_texts?.[index] || `${file.name} for product ${request.product_id}`,
          media_type: mediaService.getMediaType(file.type),
          usage_type: 'product_gallery' as const,
          is_primary: request.is_primary_indices?.includes(index) || false,
          display_order: index + 1, // Database uses display_order, not sort_order
          is_active: true,
          visibility: 'public' as const,
          created_by: 'system', // Will be updated with proper user ID later
        };

        const { data: dbData, error: dbError } = await supabase
          .from('media')
          .insert(mediaRecord)
          .select()
          .single();

        if (dbError) {
          console.error('Error creating media record:', dbError);
          // Clean up uploaded file on database error
          await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
          throw new Error(`Failed to create media record for ${file.name}: ${dbError.message}`);
        }

        // Transform database record to MediaFile interface before adding to results
        const transformedFile = mediaService.transformDbToMediaFile(dbData);
        uploadedFiles.push(transformedFile);
      }

      return uploadedFiles;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error('Failed to upload media files');
    }
  },

  // Update media metadata
  async updateMedia(request: MediaUpdateRequest): Promise<MediaFile> {
    try {
      const updateData: any = {};
      
      if (request.alt_text !== undefined) updateData.alt_text = request.alt_text;
      if (request.is_primary !== undefined) updateData.is_primary = request.is_primary;
      if (request.sort_order !== undefined) updateData.display_order = request.sort_order; // Database uses display_order
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('media')
        .update(updateData)
        .eq('id', request.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating media:', error);
        throw new Error(`Failed to update media: ${error.message}`);
      }

      if (!data) {
        throw new Error('Media file not found');
      }

      // Transform database record to MediaFile interface before returning
      return mediaService.transformDbToMediaFile(data);
    } catch (error) {
      console.error('Error updating media:', error);
      throw new Error('Failed to update media');
    }
  },

  // Delete media file
  async deleteMedia(mediaId: string): Promise<void> {
    try {
      // First, get the media record to retrieve file path for storage deletion
      const { data: mediaRecord, error: fetchError } = await supabase
        .from('media')
        .select('file_path, bucket_name')
        .eq('id', mediaId)
        .single();

      if (fetchError) {
        console.error('Error fetching media for deletion:', fetchError);
        throw new Error('Failed to find media file for deletion');
      }

      // Delete from storage first
      if (mediaRecord?.file_path) {
        const { error: storageError } = await supabase.storage
          .from(mediaRecord.bucket_name || STORAGE_BUCKET)
          .remove([mediaRecord.file_path]);

        if (storageError) {
          console.warn('Warning: Failed to delete file from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete database record
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId);

      if (error) {
        console.error('Error deleting media from database:', error);
        throw new Error('Failed to delete media file from database');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new Error('Failed to delete media file');
    }
  },

  // Get media by ID
  async getMediaById(mediaId: string): Promise<MediaFile | null> {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('id', mediaId)
        .single();

      if (error) {
        console.error('Error fetching media by ID:', error);
        throw new Error('Failed to fetch media by ID');
      }

      if (!data) {
        return null;
      }

      // Transform database record to MediaFile interface
      return mediaService.transformDbToMediaFile(data);
    } catch (error) {
      console.error('Error fetching media by ID:', error);
      return null;
    }
  },

  // Bulk operations on media
  async bulkMediaOperation(request: BulkMediaRequest): Promise<void> {
    try {
      // Perform bulk operation logic on media
      const { data, error } = await supabase
        .rpc('bulk_media_operation', request);

      if (error) {
        console.error('Error performing bulk operation:', error);
        throw new Error('Failed to perform bulk media operation');
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      throw new Error('Failed to perform bulk media operation');
    }
  },

  // Get media statistics
  async getMediaStats(): Promise<MediaStats> {
    try {
      // Fetch media statistics from Supabase
      const { data, error } = await supabase
        .rpc('get_media_stats');

      if (error) {
        console.error('Error fetching media statistics:', error);
        throw new Error('Failed to fetch media statistics');
      }

      return data;
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
      errors.push(`File size exceeds maximum allowed size of ${mediaService.formatFileSize(validationRules.maxFileSize)}`);
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
  },

  // Get media type from MIME type
  getMediaType(mimeType: string): 'image' | 'document' | 'video' | 'audio' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  },

  // Transform database record to MediaFile interface
  transformDbToMediaFile(dbRecord: any): MediaFile {
    // Generate public URL from storage path
    const { data: urlData } = supabase.storage
      .from(dbRecord.bucket_name || STORAGE_BUCKET)
      .getPublicUrl(dbRecord.file_path);

    return {
      id: dbRecord.id,
      product_id: dbRecord.product_id,
      file_name: dbRecord.file_name,
      original_name: dbRecord.file_name, // Database doesn't store original name separately
      file_type: dbRecord.mime_type || 'unknown',
      file_size: dbRecord.file_size || 0,
      file_url: urlData.publicUrl,
      thumbnail_url: mediaService.isImageFile(dbRecord.mime_type || '') 
        ? mediaService.generateThumbnailUrl(urlData.publicUrl) 
        : urlData.publicUrl,
      alt_text: dbRecord.alt_text || '',
      is_primary: dbRecord.is_primary || false,
      sort_order: dbRecord.display_order || 0,
      uploaded_by: dbRecord.created_by || 'system',
      uploaded_at: dbRecord.created_at,
      updated_at: dbRecord.updated_at,
      // Additional fields from database
      bucket_name: dbRecord.bucket_name,
      storage_path: dbRecord.file_path,
      mime_type: dbRecord.mime_type,
      file_extension: dbRecord.file_extension,
      media_type: dbRecord.media_type,
      usage_type: dbRecord.usage_type,
      is_active: dbRecord.is_active,
      is_featured: dbRecord.is_featured,
      visibility: dbRecord.visibility,
      tags: dbRecord.tags,
      description: dbRecord.description,
      caption: dbRecord.caption,
    };
  }
};
