'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  Image, 
  X, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  FileImage,
  Star
} from 'lucide-react';
import { MediaUploaderProps } from '../types';
import { useMediaUpload } from '../hooks/useMediaUpload';
import { mediaService } from '../services/mediaService';

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  productId,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  onUploadComplete,
  onUploadError
}) => {
  const { currentUploads, uploadProgress, uploadFiles, retryUpload, clearUploads } = useMediaUpload();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [altTexts, setAltTexts] = useState<string[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState<number>(-1);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(rejection => 
        `${rejection.file.name}: ${rejection.errors.map((e: any) => e.message).join(', ')}`
      );
      onUploadError?.(errors.join('\n'));
      return;
    }

    // Validate total file count
    if (selectedFiles.length + acceptedFiles.length > maxFiles) {
      onUploadError?.(` Maximum ${maxFiles} files allowed`);
      return;
    }

    // Add new files
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    setAltTexts(prev => [...prev, ...acceptedFiles.map(f => f.name.split('.')[0])]);
  }, [selectedFiles, maxFiles, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFileTypes.map(type => `.${mediaService.getFileExtension(type)}`)
    },
    maxSize: maxFileSize,
    multiple: true
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setAltTexts(prev => prev.filter((_, i) => i !== index));
    if (primaryIndex === index) {
      setPrimaryIndex(-1);
    } else if (primaryIndex > index) {
      setPrimaryIndex(prev => prev - 1);
    }
  };

  const updateAltText = (index: number, value: string) => {
    setAltTexts(prev => prev.map((text, i) => i === index ? value : text));
  };

  const setPrimary = (index: number) => {
    setPrimaryIndex(index === primaryIndex ? -1 : index);
  };

  const handleUpload = async () => {
    if (!productId || selectedFiles.length === 0) return;

    try {
      await uploadFiles(
        selectedFiles, 
        productId, 
        { 
          altTexts, 
          primaryIndices: primaryIndex >= 0 ? [primaryIndex] : undefined 
        }
      );
      
      // Clear selected files on successful upload
      setSelectedFiles([]);
      setAltTexts([]);
      setPrimaryIndex(-1);
      
      onUploadComplete?.([]); // Media files would be provided by the hook
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const getUploadStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Upload className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors min-h-[200px] flex items-center justify-center
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 text-gray-400">
                {isDragActive ? (
                  <Upload className="w-full h-full text-blue-500" />
                ) : (
                  <FileImage className="w-full h-full" />
                )}
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop files here' : 'Drag & drop images here'}
                </p>
                <p className="text-sm text-gray-500">
                  or <span className="text-blue-600 font-medium">browse files</span>
                </p>
              </div>
              
              <div className="text-xs text-gray-400 space-y-1">
                <p>Supported formats: JPG, PNG, WebP, GIF</p>
                <p>Max file size: {mediaService.formatFileSize(maxFileSize)}</p>
                <p>Max files: {maxFiles}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFiles([]);
                    setAltTexts([]);
                    setPrimaryIndex(-1);
                  }}
                >
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-3">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-start gap-3 p-3 border rounded-lg">
                    {/* File Preview */}
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      {primaryIndex === index && (
                        <div className="absolute top-1 right-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        </div>
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {mediaService.formatFileSize(file.size)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPrimary(index)}
                            className={primaryIndex === index ? 'bg-yellow-50 border-yellow-200' : ''}
                          >
                            <Star className={`w-3 h-3 ${primaryIndex === index ? 'text-yellow-500 fill-current' : ''}`} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Alt Text Input */}
                      <Input
                        placeholder="Alt text (optional)"
                        value={altTexts[index] || ''}
                        onChange={(e) => updateAltText(index, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={handleUpload} 
                disabled={!productId || selectedFiles.length === 0}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {currentUploads.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Upload Progress</h3>
                <Button variant="outline" size="sm" onClick={clearUploads}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Overall Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
              
              {/* Individual File Progress */}
              <div className="space-y-2">
                {currentUploads.map((upload, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded">
                    <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={upload.preview_url}
                        alt={upload.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{upload.file.name}</span>
                        <div className="flex items-center gap-2">
                          {getUploadStatusIcon(upload.status)}
                          <Badge variant={
                            upload.status === 'completed' ? 'default' :
                            upload.status === 'error' ? 'destructive' : 'secondary'
                          }>
                            {upload.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {upload.status === 'uploading' || upload.status === 'processing' ? (
                        <Progress value={upload.upload_progress} className="h-1 mt-1" />
                      ) : null}
                      
                      {upload.error_message && (
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-red-600">{upload.error_message}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => retryUpload(index)}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
