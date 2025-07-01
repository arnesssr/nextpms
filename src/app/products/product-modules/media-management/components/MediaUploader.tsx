'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaFile } from '../types';

interface MediaUploaderProps {
  productId?: string;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  onUploadComplete?: (files: MediaFile[]) => void;
  onUploadError?: (error: string) => void;
}

export function MediaUploader({
  productId,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  onUploadComplete,
  onUploadError
}: MediaUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      // Check file type
      if (!acceptedFileTypes.includes(file.type)) {
        onUploadError?.(`File type ${file.type} is not supported`);
        return false;
      }
      
      // Check file size
      if (file.size > maxFileSize) {
        onUploadError?.(`File ${file.name} is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) {
      return;
    }

    if (validFiles.length > maxFiles) {
      onUploadError?.(`Too many files. Maximum allowed is ${maxFiles}`);
      return;
    }

    setUploading(true);

    try {
      // Upload each file via API
      const uploadPromises = validFiles.map(async (file) => {
        if (!productId) {
          throw new Error('Product ID is required for upload');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('media_type', 'image');
        formData.append('usage_type', 'product_gallery');
        formData.append('is_primary', 'false');
        formData.append('alt_text', file.name.replace(/\.[^/.]+$/, ''));

        const response = await fetch(`/api/products/${productId}/media`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || `Upload failed for ${file.name}`);
        }

        return result.media;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      onUploadComplete?.(uploadedFiles);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [acceptedFileTypes, maxFileSize, maxFiles, productId, onUploadComplete, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
      } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex flex-col items-center space-y-4">
        <Upload className={`h-12 w-12 transition-colors ${
          isDragOver ? 'text-blue-500' : uploading ? 'text-orange-500' : 'text-gray-400'
        }`} />
        <div className="text-center">
          <p className={`text-lg font-medium transition-colors ${
            isDragOver ? 'text-blue-900' : uploading ? 'text-orange-900' : 'text-gray-900'
          }`}>
            {uploading ? 'Uploading files...' : 
             isDragOver ? 'Drop your images here!' : 
             'Drop multiple images here or click to select'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Supports: {acceptedFileTypes.join(', ')}
          </p>
          <p className="text-sm text-gray-500">
            Upload up to {maxFiles} files, {maxFileSize / (1024 * 1024)}MB each
          </p>
          <p className="text-xs text-blue-600 mt-2 font-medium">
            💡 You can select multiple files at once!
          </p>
        </div>
        <div>
          <input
            type="file"
            multiple
            accept={acceptedFileTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>
      </div>
    </div>
  );
}
