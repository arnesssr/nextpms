// Global Media Service - Integration layer for product media management
// This service integrates media functionality with the product system

import { supabase } from '@/lib/supabaseClient';
import { 
  Media, 
  MediaUploadRequest, 
  MediaUploadResponse,
  MediaSearchParams,
  MediaApiResponse,
  MediaTransformOptions,
  OptimizedMediaUrl,
  BulkMediaOperation,
  MEDIA_CONFIGS
} from '@/types/media';

export class ProductMediaService {
  /**
   * Upload media for a specific product
   */
  static async uploadProductMedia(productId: string, request: Omit<MediaUploadRequest, 'product_id'>): Promise<MediaUploadResponse> {
    try {
      const mediaRequest: MediaUploadRequest = {
        ...request,
        product_id: productId
      };
      
      return await ProductMediaService.uploadMedia(mediaRequest);
    } catch (error) {
      console.error('Error uploading product media:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }
  
  /**
   * Get all media for a specific product
   */
  static async getProductMedia(productId: string, usageType?: string): Promise<MediaApiResponse<Media[]>> {
    try {
      let query = supabase
        .from('media_with_products')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true);
      
      if (usageType) {
        query = query.eq('usage_type', usageType);
      }
      
      query = query.order('display_order', { ascending: true })
                   .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        return {
          success: false,
          error: { code: 'FETCH_ERROR', message: error.message }
        };
      }
      
      return {
        success: true,
        data: data as Media[]
      };
      
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }
  
  /**
   * Get primary image for a product
   */
  static async getProductPrimaryImage(productId: string): Promise<MediaApiResponse<Media | null>> {
    try {
      const { data, error } = await supabase
        .from('media_with_products')
        .select('*')
        .eq('product_id', productId)
        .eq('is_primary', true)
        .eq('media_type', 'image')
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        return {
          success: false,
          error: { code: 'FETCH_ERROR', message: error.message }
        };
      }
      
      return {
        success: true,
        data: data as Media || null
      };
      
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }
  
  /**
   * Set primary image for a product
   */
  static async setProductPrimaryImage(productId: string, mediaId: string): Promise<MediaApiResponse<boolean>> {
    try {
      // First, remove primary status from all images for this product
      await supabase
        .from('media')
        .update({ is_primary: false })
        .eq('product_id', productId)
        .eq('media_type', 'image');
      
      // Then set the new primary image
      const { error } = await supabase
        .from('media')
        .update({ is_primary: true })
        .eq('id', mediaId)
        .eq('product_id', productId);
      
      if (error) {
        return {
          success: false,
          error: { code: 'UPDATE_ERROR', message: error.message }
        };
      }
      
      return {
        success: true,
        data: true
      };
      
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }
  
  /**
   * Reorder media for a product
   */
  static async reorderProductMedia(productId: string, mediaIds: string[]): Promise<MediaApiResponse<boolean>> {
    try {
      const updatePromises = mediaIds.map((mediaId, index) => 
        supabase
          .from('media')
          .update({ display_order: index })
          .eq('id', mediaId)
          .eq('product_id', productId)
      );
      
      const results = await Promise.all(updatePromises);
      
      const hasErrors = results.some(result => result.error);
      if (hasErrors) {
        return {
          success: false,
          error: { code: 'UPDATE_ERROR', message: 'Failed to reorder some media items' }
        };
      }
      
      return {
        success: true,
        data: true
      };
      
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }
  
  /**
   * Delete all media for a product (used when deleting product)
   */
  static async deleteProductMedia(productId: string): Promise<MediaApiResponse<boolean>> {
    try {
      // Get all media files for the product
      const mediaResult = await ProductMediaService.getProductMedia(productId);
      
      if (!mediaResult.success || !mediaResult.data) {
        return {
          success: true,
          data: true // No media to delete
        };
      }
      
      // Delete files from storage
      const deletePromises = mediaResult.data.map(async (media) => {
        if (media.file_path) {
          const { error } = await supabase.storage
            .from(media.bucket_name || 'media-files')
            .remove([media.file_path]);
          
          if (error) {
            console.warn(`Failed to delete file ${media.file_path} from storage:`, error);
          }
        }
      });
      
      await Promise.all(deletePromises);
      
      // Delete database records
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('product_id', productId);
      
      if (error) {
        return {
          success: false,
          error: { code: 'DELETE_ERROR', message: error.message }
        };
      }
      
      return {
        success: true,
        data: true
      };
      
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }
  
  
  /**
   * Helper method to get file extension from MIME type
   */
  private static getFileExtension(mimeType: string): string {
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
  
  /**
   * Helper method to get media type from MIME type
   */
  private static getMediaType(mimeType: string): 'image' | 'document' | 'video' | 'audio' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  }
  
  /**
   * Update product featured_image_url when primary image changes
   */
  static async updateProductFeaturedImage(productId: string): Promise<MediaApiResponse<boolean>> {
    try {
      const primaryImageResponse = await ProductMediaService.getProductPrimaryImage(productId);
      
      if (!primaryImageResponse.success) {
        return primaryImageResponse;
      }
      
      const featuredImageUrl = primaryImageResponse.data 
        ? ProductMediaService.getOptimizedUrls(primaryImageResponse.data).medium
        : null;
      
      const { error } = await supabase
        .from('products')
        .update({ featured_image_url: featuredImageUrl })
        .eq('id', productId);
      
      if (error) {
        return {
          success: false,
          error: { code: 'UPDATE_ERROR', message: error.message }
        };
      }
      
      return {
        success: true,
        data: true
      };
      
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }
  
  /**
   * Core upload functionality
   */
  private static async uploadMedia(request: MediaUploadRequest): Promise<MediaUploadResponse> {
    try {
      const { file, product_id, category_id, media_type, usage_type, ...metadata } = request;
      
      // Get configuration for this usage type
      const config = MEDIA_CONFIGS[usage_type] || MEDIA_CONFIGS.general;
      
      // Validate file size
      if (file.size > (config.maxFileSize || 20 * 1024 * 1024)) {
        return {
          success: false,
          error: `File size exceeds limit of ${(config.maxFileSize || 20 * 1024 * 1024) / (1024 * 1024)}MB`
        };
      }
      
      // Validate file type
      if (config.allowedMimeTypes && !config.allowedMimeTypes.some(type => 
        type === file.type || (type.endsWith('/*') && file.type.startsWith(type.replace('*', '')))
      )) {
        return {
          success: false,
          error: `File type ${file.type} is not allowed for ${usage_type}`
        };
      }
      
      // Generate unique file path
      const fileExtension = file.name.split('.').pop() || '';
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}_${randomId}.${fileExtension}`;
      
      // Determine folder structure
      let filePath = '';
      if (product_id) {
        filePath = `products/${product_id}/${usage_type}/${fileName}`;
      } else if (category_id) {
        filePath = `categories/${category_id}/${fileName}`;
      } else {
        filePath = `general/${usage_type}/${fileName}`;
      }
      
      const bucketName = config.bucketName || 'media';
      
      // Upload file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        return {
          success: false,
          error: `Upload failed: ${uploadError.message}`
        };
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create media record
      const mediaRecord = {
        file_name: file.name,
        file_path: uploadData.path,
        bucket_name: bucketName,
        file_size: file.size,
        mime_type: file.type,
        file_extension: fileExtension,
        product_id: product_id || null,
        category_id: category_id || null,
        media_type,
        usage_type,
        is_primary: metadata.is_primary || false,
        display_order: 0,
        alt_text: metadata.alt_text || '',
        caption: metadata.caption || '',
        description: metadata.description || '',
        tags: metadata.tags || [],
        visibility: metadata.visibility || 'public',
        created_by: user?.id || 'anonymous'
      };
      
      const { data: media, error: dbError } = await supabase
        .from('media')
        .insert(mediaRecord)
        .select()
        .single();
      
      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from(bucketName).remove([uploadData.path]);
        return {
          success: false,
          error: `Database error: ${dbError.message}`
        };
      }
      
      // If this is a primary image for a product, update the product's featured_image_url
      if (product_id && media_type === 'image' && metadata.is_primary) {
        await ProductMediaService.updateProductFeaturedImage(product_id);
      }
      
      return {
        success: true,
        media: media as Media
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Get optimized URLs for media
   */
  static getOptimizedUrls(media: Media, options: MediaTransformOptions = {}): OptimizedMediaUrl {
    const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${media.bucket_name}/${media.file_path}`;
    
    // For non-image files, return the original URL for all sizes
    if (!media.mime_type?.startsWith('image/')) {
      return {
        original: baseUrl,
        thumbnail: baseUrl,
        medium: baseUrl,
        large: baseUrl
      };
    }
    
    const createTransformUrl = (width: number, height: number) => {
      const params = new URLSearchParams({
        width: width.toString(),
        height: height.toString(),
        resize: options.resize || 'cover',
        quality: (options.quality || 80).toString(),
        ...(options.format && { format: options.format })
      });
      
      return `${baseUrl}?${params.toString()}`;
    };
    
    return {
      original: baseUrl,
      thumbnail: createTransformUrl(150, 150),
      medium: createTransformUrl(400, 400),
      large: createTransformUrl(800, 800)
    };
  }
}

// Export the service
export const productMediaService = ProductMediaService;
