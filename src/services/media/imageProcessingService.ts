// Enhanced Image Processing Service - Phase 2
// Handles image optimization, resizing, thumbnail generation, and metadata extraction

import imageCompression from 'browser-image-compression';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  preserveExif?: boolean;
  progressive?: boolean;
}

export interface ThumbnailSizes {
  thumbnail: { width: 150, height: 150 };
  small: { width: 300, height: 300 };
  medium: { width: 600, height: 600 };
  large: { width: 1200, height: 1200 };
}

export interface ProcessedImage {
  file: File;
  width: number;
  height: number;
  size: number;
  format: string;
  quality: number;
}

export interface ImageMetadata {
  originalName: string;
  originalSize: number;
  originalDimensions: { width: number; height: number };
  processedSize: number;
  processedDimensions: { width: number; height: number };
  compressionRatio: number;
  format: string;
  hasExif: boolean;
  exifData?: any;
  createdAt: string;
}

export interface ProcessingProgress {
  step: 'validation' | 'compression' | 'thumbnails' | 'metadata' | 'complete';
  progress: number;
  message: string;
}

export class ImageProcessingService {
  private static readonly DEFAULT_QUALITY = 0.8;
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  /**
   * Process a single image with optimization and thumbnail generation
   */
  static async processImage(
    file: File,
    options: ImageProcessingOptions = {},
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<{
    optimizedImage: ProcessedImage;
    thumbnails: Record<keyof ThumbnailSizes, ProcessedImage>;
    metadata: ImageMetadata;
  }> {
    try {
      // Step 1: Validation
      onProgress?.({
        step: 'validation',
        progress: 10,
        message: 'Validating image...'
      });

      await this.validateImage(file);

      // Step 2: Extract metadata
      onProgress?.({
        step: 'metadata',
        progress: 20,
        message: 'Extracting metadata...'
      });

      const originalDimensions = await this.getImageDimensions(file);
      const exifData = await this.extractExifData(file);

      // Step 3: Optimize main image
      onProgress?.({
        step: 'compression',
        progress: 40,
        message: 'Optimizing image...'
      });

      const optimizedImage = await this.optimizeImage(file, {
        maxWidth: options.maxWidth || 1920,
        maxHeight: options.maxHeight || 1080,
        quality: options.quality || this.DEFAULT_QUALITY,
        format: options.format || 'webp',
        preserveExif: options.preserveExif || false
      });

      // Step 4: Generate thumbnails
      onProgress?.({
        step: 'thumbnails',
        progress: 70,
        message: 'Generating thumbnails...'
      });

      const thumbnails = await this.generateThumbnails(file);

      // Step 5: Compile metadata
      onProgress?.({
        step: 'complete',
        progress: 100,
        message: 'Processing complete'
      });

      const processedDimensions = await this.getImageDimensions(optimizedImage.file);

      const metadata: ImageMetadata = {
        originalName: file.name,
        originalSize: file.size,
        originalDimensions,
        processedSize: optimizedImage.size,
        processedDimensions,
        compressionRatio: ((file.size - optimizedImage.size) / file.size) * 100,
        format: optimizedImage.format,
        hasExif: !!exifData,
        exifData: options.preserveExif ? exifData : undefined,
        createdAt: new Date().toISOString()
      };

      return {
        optimizedImage,
        thumbnails,
        metadata
      };

    } catch (error) {
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate image file
   */
  private static async validateImage(file: File): Promise<void> {
    // Check file type
    if (!this.SUPPORTED_FORMATS.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Supported types: ${this.SUPPORTED_FORMATS.join(', ')}`);
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size too large: ${this.formatFileSize(file.size)}. Maximum allowed: ${this.formatFileSize(this.MAX_FILE_SIZE)}`);
    }

    // Check if file is actually an image
    try {
      await this.getImageDimensions(file);
    } catch (error) {
      throw new Error('Invalid image file or corrupted data');
    }
  }

  /**
   * Optimize image with compression and format conversion
   */
  private static async optimizeImage(
    file: File,
    options: Required<ImageProcessingOptions>
  ): Promise<ProcessedImage> {
    try {
      const compressionOptions = {
        maxSizeMB: 2, // 2MB max after compression
        maxWidthOrHeight: Math.max(options.maxWidth, options.maxHeight),
        useWebWorker: true,
        fileType: options.format === 'webp' ? 'image/webp' : 
                  options.format === 'jpeg' ? 'image/jpeg' : 'image/png',
        quality: options.quality,
        preserveExif: options.preserveExif,
        initialQuality: options.progressive ? 0.6 : options.quality
      };

      const compressedFile = await imageCompression(file, compressionOptions);
      const dimensions = await this.getImageDimensions(compressedFile);

      return {
        file: compressedFile,
        width: dimensions.width,
        height: dimensions.height,
        size: compressedFile.size,
        format: compressedFile.type,
        quality: options.quality
      };

    } catch (error) {
      throw new Error(`Image optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate thumbnails in multiple sizes
   */
  private static async generateThumbnails(
    file: File
  ): Promise<Record<keyof ThumbnailSizes, ProcessedImage>> {
    const sizes: ThumbnailSizes = {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 }
    };

    const thumbnails = {} as Record<keyof ThumbnailSizes, ProcessedImage>;

    for (const [sizeKey, dimensions] of Object.entries(sizes)) {
      try {
        const thumbnailOptions = {
          maxSizeMB: 1,
          maxWidthOrHeight: Math.max(dimensions.width, dimensions.height),
          useWebWorker: true,
          fileType: 'image/webp',
          quality: 0.8,
          preserveExif: false
        };

        const thumbnailFile = await imageCompression(file, thumbnailOptions);
        const thumbnailDimensions = await this.getImageDimensions(thumbnailFile);

        thumbnails[sizeKey as keyof ThumbnailSizes] = {
          file: thumbnailFile,
          width: thumbnailDimensions.width,
          height: thumbnailDimensions.height,
          size: thumbnailFile.size,
          format: thumbnailFile.type,
          quality: 0.8
        };

      } catch (error) {
        console.warn(`Failed to generate ${sizeKey} thumbnail:`, error);
        // Create a fallback thumbnail using the original file
        thumbnails[sizeKey as keyof ThumbnailSizes] = {
          file: file,
          width: dimensions.width,
          height: dimensions.height,
          size: file.size,
          format: file.type,
          quality: 1
        };
      }
    }

    return thumbnails;
  }

  /**
   * Get image dimensions
   */
  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  /**
   * Extract EXIF data from image
   */
  private static async extractExifData(file: File): Promise<any> {
    try {
      // For browser environment, we'll use a simpler approach
      // In a full implementation, you'd use exifr library
      return {
        extracted: false,
        reason: 'EXIF extraction not implemented in browser environment'
      };
    } catch (error) {
      console.warn('EXIF extraction failed:', error);
      return null;
    }
  }

  /**
   * Batch process multiple images
   */
  static async processImageBatch(
    files: File[],
    options: ImageProcessingOptions = {},
    onProgress?: (fileIndex: number, progress: ProcessingProgress) => void
  ): Promise<Array<{
    originalFile: File;
    optimizedImage: ProcessedImage;
    thumbnails: Record<keyof ThumbnailSizes, ProcessedImage>;
    metadata: ImageMetadata;
  }>> {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await this.processImage(
          file, 
          options, 
          (progress) => onProgress?.(i, progress)
        );

        results.push({
          originalFile: file,
          ...result
        });

      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error);
        // Continue with other files
      }
    }

    return results;
  }

  /**
   * Utility: Format file size
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Utility: Get optimal format for file
   */
  static getOptimalFormat(file: File): 'webp' | 'jpeg' | 'png' {
    // WebP for most cases (best compression)
    if (file.type.includes('png') && file.size < 1024 * 1024) {
      return 'png'; // Keep small PNGs as PNG for transparency
    }
    
    return 'webp'; // Default to WebP for best compression
  }

  /**
   * Utility: Calculate recommended quality based on file size
   */
  static getRecommendedQuality(file: File): number {
    if (file.size > 5 * 1024 * 1024) return 0.6; // Large files: lower quality
    if (file.size > 2 * 1024 * 1024) return 0.7; // Medium files: medium quality
    return 0.8; // Small files: higher quality
  }
}

export default ImageProcessingService;
