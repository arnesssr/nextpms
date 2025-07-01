'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Settings,
  Zap,
  FileImage,
  Star,
  Info
} from 'lucide-react';

import ImageProcessingService, {
  ImageProcessingOptions,
  ProcessingProgress,
  ProcessedImage,
  ImageMetadata
} from '@/services/media/imageProcessingService';

export interface EnhancedMediaUploaderProps {
  productId?: string;
  maxFiles?: number;
  maxFileSize?: number;
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
}

export interface UploadResult {
  originalFile: File;
  optimizedImage: ProcessedImage;
  thumbnails: Record<string, ProcessedImage>;
  metadata: ImageMetadata;
  uploadedUrls?: {
    original: string;
    thumbnails: Record<string, string>;
  };
}

interface ProcessingState {
  file: File;
  progress: ProcessingProgress;
  result?: UploadResult;
  error?: string;
}

export const EnhancedMediaUploader: React.FC<EnhancedMediaUploaderProps> = ({
  productId,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  onUploadComplete,
  onUploadError
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processingStates, setProcessingStates] = useState<ProcessingState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Processing options
  const [processingOptions, setProcessingOptions] = useState<ImageProcessingOptions>({
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'webp',
    preserveExif: false,
    progressive: true
  });

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
      onUploadError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Add new files
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  }, [selectedFiles, maxFiles, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: maxFileSize,
    multiple: true
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processImages = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProcessingStates(selectedFiles.map(file => ({
      file,
      progress: { step: 'validation', progress: 0, message: 'Waiting...' }
    })));

    try {
      const results = await ImageProcessingService.processImageBatch(
        selectedFiles,
        processingOptions,
        (fileIndex, progress) => {
          setProcessingStates(prev => 
            prev.map((state, index) => 
              index === fileIndex 
                ? { ...state, progress }
                : state
            )
          );
        }
      );

      // Update states with results
      setProcessingStates(prev => 
        prev.map((state, index) => ({
          ...state,
          result: results[index] || undefined,
          progress: results[index] 
            ? { step: 'complete', progress: 100, message: 'Processed successfully' }
            : { step: 'complete', progress: 0, message: 'Processing failed' }
        }))
      );

    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadProcessedImages = async () => {
    const processedResults = processingStates
      .filter(state => state.result)
      .map(state => state.result!);

    if (processedResults.length === 0) {
      onUploadError?.('No processed images to upload');
      return;
    }

    setIsUploading(true);

    try {
      // Here you would implement the actual upload to Supabase S3
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful upload
      const uploadResults = processedResults.map(result => ({
        ...result,
        uploadedUrls: {
          original: `https://example.com/uploads/${result.originalFile.name}`,
          thumbnails: {
            thumbnail: `https://example.com/uploads/thumbnails/${result.originalFile.name}`,
            small: `https://example.com/uploads/small/${result.originalFile.name}`,
            medium: `https://example.com/uploads/medium/${result.originalFile.name}`,
            large: `https://example.com/uploads/large/${result.originalFile.name}`
          }
        }
      }));

      onUploadComplete?.(uploadResults);

      // Clear files after successful upload
      setSelectedFiles([]);
      setProcessingStates([]);

    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const getProgressColor = (step: string) => {
    switch (step) {
      case 'validation': return 'bg-yellow-500';
      case 'metadata': return 'bg-blue-500';
      case 'compression': return 'bg-purple-500';
      case 'thumbnails': return 'bg-green-500';
      case 'complete': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Enhanced Media Upload
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Phase 2
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
            <div>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports JPEG, PNG, WebP, GIF up to {formatFileSize(maxFileSize)}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span>✨ Auto-optimization</span>
                    <span>📐 Multiple sizes</span>
                    <span>🗜️ Smart compression</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Processing Options
            </CardTitle>
            <Switch
              checked={showAdvancedOptions}
              onCheckedChange={setShowAdvancedOptions}
            />
          </div>
        </CardHeader>
        {showAdvancedOptions && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxWidth">Max Width</Label>
                <Input
                  id="maxWidth"
                  type="number"
                  value={processingOptions.maxWidth}
                  onChange={(e) => setProcessingOptions(prev => ({
                    ...prev,
                    maxWidth: parseInt(e.target.value)
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="maxHeight">Max Height</Label>
                <Input
                  id="maxHeight"
                  type="number"
                  value={processingOptions.maxHeight}
                  onChange={(e) => setProcessingOptions(prev => ({
                    ...prev,
                    maxHeight: parseInt(e.target.value)
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quality">Quality</Label>
                <Input
                  id="quality"
                  type="number"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={processingOptions.quality}
                  onChange={(e) => setProcessingOptions(prev => ({
                    ...prev,
                    quality: parseFloat(e.target.value)
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="format">Format</Label>
                <Select
                  value={processingOptions.format}
                  onValueChange={(value: 'webp' | 'jpeg' | 'png') => 
                    setProcessingOptions(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webp">WebP (Best compression)</SelectItem>
                    <SelectItem value="jpeg">JPEG (Standard)</SelectItem>
                    <SelectItem value="png">PNG (Lossless)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="preserveExif"
                checked={processingOptions.preserveExif}
                onCheckedChange={(checked) => 
                  setProcessingOptions(prev => ({ ...prev, preserveExif: checked }))
                }
              />
              <Label htmlFor="preserveExif">Preserve EXIF data</Label>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files ({selectedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => {
                const processingState = processingStates[index];
                const hasResult = processingState?.result;

                return (
                  <div key={`${file.name}-${index}`} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <FileImage className="w-8 h-8 text-gray-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{file.name}</p>
                        {hasResult && (
                          <Badge className="bg-green-100 text-green-800">
                            Processed
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        {hasResult && (
                          <>
                            <span>→</span>
                            <span>{formatFileSize(hasResult.optimizedImage.size)}</span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(hasResult.metadata.compressionRatio)}% smaller
                            </Badge>
                          </>
                        )}
                      </div>

                      {processingState && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span>{processingState.progress.message}</span>
                            {processingState.progress.step !== 'complete' && isProcessing && (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            )}
                          </div>
                          <Progress 
                            value={processingState.progress.progress} 
                            className="h-1 mt-1"
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isProcessing || isUploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={processImages}
                disabled={isProcessing || isUploading || selectedFiles.length === 0}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Process Images
                  </>
                )}
              </Button>

              <Button
                onClick={uploadProcessedImages}
                disabled={isUploading || processingStates.filter(s => s.result).length === 0}
                variant="default"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to Storage
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Results */}
      {processingStates.some(s => s.result) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processingStates
                .filter(state => state.result)
                .map((state, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{state.result!.originalFile.name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Original:</span> {formatFileSize(state.result!.metadata.originalSize)}
                      </div>
                      <div>
                        <span className="text-gray-500">Optimized:</span> {formatFileSize(state.result!.metadata.processedSize)}
                      </div>
                      <div>
                        <span className="text-gray-500">Format:</span> {state.result!.metadata.format}
                      </div>
                      <div>
                        <span className="text-gray-500">Thumbnails:</span> {Object.keys(state.result!.thumbnails).length}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedMediaUploader;
