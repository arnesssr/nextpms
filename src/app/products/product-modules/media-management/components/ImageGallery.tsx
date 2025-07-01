'use client';

import React from 'react';
import { Star, Trash2, Edit2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MediaFile } from '../types';

interface ImageGalleryProps {
  productId?: string;
  mediaFiles: MediaFile[];
  onMediaSelect?: (media: MediaFile) => void;
  onMediaUpdate?: (media: MediaFile) => void;
  onMediaDelete?: (mediaId: string) => void;
  allowEdit?: boolean;
  allowDelete?: boolean;
}

export function ImageGallery({
  productId,
  mediaFiles,
  onMediaSelect,
  onMediaUpdate,
  onMediaDelete,
  allowEdit = true,
  allowDelete = true
}: ImageGalleryProps) {
  if (!mediaFiles || mediaFiles.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <Eye className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-500">No images uploaded yet</p>
        <p className="text-sm text-gray-400">Upload some images to get started</p>
      </div>
    );
  }

  const handleSetPrimary = (media: MediaFile) => {
    if (onMediaUpdate) {
      onMediaUpdate({ ...media, is_primary: true });
    }
  };

  const handleDelete = (mediaId: string) => {
    if (onMediaDelete && window.confirm('Are you sure you want to delete this image?')) {
      onMediaDelete(mediaId);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {mediaFiles.map((media) => (
        <div
          key={media.id}
          className="relative group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Image */}
          <div className="aspect-square relative bg-gray-100">
            {media.media_type === 'image' ? (
              <img
                src={media.file_path || '/placeholder-image.png'}
                alt={media.alt_text || media.file_name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => onMediaSelect?.(media)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Eye className="h-8 w-8" />
                <span className="sr-only">{media.file_name}</span>
              </div>
            )}
            
            {/* Primary badge */}
            {media.is_primary && (
              <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                <Star className="h-3 w-3 mr-1" />
                Primary
              </Badge>
            )}

            {/* Actions overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                {allowEdit && !media.is_primary && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetPrimary(media)}
                    className="text-xs"
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                {allowEdit && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onMediaSelect?.(media)}
                    className="text-xs"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
                {allowDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(media.id)}
                    className="text-xs"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Image info */}
          <div className="p-2 bg-white">
            <p className="text-xs font-medium text-gray-900 truncate">
              {media.file_name}
            </p>
            <p className="text-xs text-gray-500">
              {media.file_size ? `${(media.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
            </p>
            {media.alt_text && (
              <p className="text-xs text-gray-400 truncate mt-1">
                {media.alt_text}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
