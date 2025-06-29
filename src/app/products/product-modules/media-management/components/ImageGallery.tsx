'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Image as ImageIcon, 
  Star, 
  Edit, 
  Trash2, 
  Download, 
  Eye,
  X,
  Check,
  Move,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ImageGalleryProps, MediaFile } from '../types';
import { mediaService } from '../services/mediaService';

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  productId,
  mediaFiles,
  onMediaSelect,
  onMediaDelete,
  onMediaUpdate,
  allowEdit = true,
  allowDelete = true
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [editingMedia, setEditingMedia] = useState<string | null>(null);
  const [editAltText, setEditAltText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleMediaClick = (media: MediaFile) => {
    setSelectedMedia(media);
    onMediaSelect?.(media);
  };

  const handleEdit = (media: MediaFile) => {
    setEditingMedia(media.id);
    setEditAltText(media.alt_text || '');
  };

  const handleSaveEdit = async () => {
    if (!editingMedia) return;

    try {
      await onMediaUpdate?.({
        ...mediaFiles.find(m => m.id === editingMedia)!,
        alt_text: editAltText
      });
      setEditingMedia(null);
      setEditAltText('');
    } catch (error) {
      console.error('Failed to update media:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingMedia(null);
    setEditAltText('');
  };

  const handleSetPrimary = async (media: MediaFile) => {
    try {
      // First, unset any existing primary image
      const currentPrimary = mediaFiles.find(m => m.is_primary);
      if (currentPrimary && currentPrimary.id !== media.id) {
        await onMediaUpdate?.({
          ...currentPrimary,
          is_primary: false
        });
      }

      // Set the new primary image
      await onMediaUpdate?.({
        ...media,
        is_primary: !media.is_primary
      });
    } catch (error) {
      console.error('Failed to set primary image:', error);
    }
  };

  const handleDownload = (media: MediaFile) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = media.file_url;
    link.download = media.original_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPrimaryImage = () => {
    return mediaFiles.find(media => media.is_primary) || mediaFiles[0];
  };

  if (mediaFiles.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No images uploaded</h3>
            <p className="text-muted-foreground">
              Upload some images to see them here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Media Gallery</h3>
          <p className="text-sm text-muted-foreground">
            {mediaFiles.length} image{mediaFiles.length > 1 ? 's' : ''} uploaded
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Primary Image Preview */}
      {getPrimaryImage() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              Primary Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getPrimaryImage()!.file_url}
                  alt={getPrimaryImage()!.alt_text || 'Primary product image'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{getPrimaryImage()!.original_name}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {getPrimaryImage()!.alt_text || 'No alt text'}
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{mediaService.formatFileSize(getPrimaryImage()!.file_size)}</span>
                  <span>•</span>
                  <span>{getPrimaryImage()!.file_type}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Grid/List */}
      <Card>
        <CardContent className="p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaFiles.map((media) => (
                <div
                  key={media.id}
                  className={`
                    relative group border rounded-lg overflow-hidden cursor-pointer transition-all
                    ${selectedMedia?.id === media.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}
                  `}
                  onClick={() => handleMediaClick(media)}
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={media.thumbnail_url || media.file_url}
                      alt={media.alt_text || media.original_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Primary Badge */}
                  {media.is_primary && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Primary
                      </Badge>
                    </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all">
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleMediaClick(media)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          {allowEdit && (
                            <>
                              <DropdownMenuItem onClick={() => handleEdit(media)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetPrimary(media)}>
                                <Star className="w-4 h-4 mr-2" />
                                {media.is_primary ? 'Unset Primary' : 'Set Primary'}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => handleDownload(media)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          {allowDelete && (
                            <DropdownMenuItem 
                              onClick={() => onMediaDelete?.(media.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{media.original_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {mediaService.formatFileSize(media.file_size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {mediaFiles.map((media) => (
                <div
                  key={media.id}
                  className={`
                    flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all
                    ${selectedMedia?.id === media.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => handleMediaClick(media)}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={media.thumbnail_url || media.file_url}
                      alt={media.alt_text || media.original_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* File Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{media.original_name}</h4>
                      {media.is_primary && (
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Primary
                        </Badge>
                      )}
                    </div>
                    
                    {editingMedia === media.id ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          value={editAltText}
                          onChange={(e) => setEditAltText(e.target.value)}
                          placeholder="Alt text"
                          className="text-sm"
                        />
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {media.alt_text || 'No alt text'}
                      </p>
                    )}
                    
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>{mediaService.formatFileSize(media.file_size)}</span>
                      <span>{media.file_type}</span>
                      <span>Uploaded {new Date(media.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    {allowEdit && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(media);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetPrimary(media);
                          }}
                          className={media.is_primary ? 'bg-yellow-50 border-yellow-200' : ''}
                        >
                          <Star className={`w-4 h-4 ${media.is_primary ? 'text-yellow-500 fill-current' : ''}`} />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(media);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {allowDelete && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMediaDelete?.(media.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Media Preview Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <Button
              className="absolute top-4 right-4 z-10"
              variant="secondary"
              size="sm"
              onClick={() => setSelectedMedia(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <img
              src={selectedMedia.file_url}
              alt={selectedMedia.alt_text || selectedMedia.original_name}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            
            <div className="p-4 border-t">
              <h3 className="font-semibold">{selectedMedia.original_name}</h3>
              <p className="text-sm text-muted-foreground">{selectedMedia.alt_text}</p>
              <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                <span>{mediaService.formatFileSize(selectedMedia.file_size)}</span>
                <span>{selectedMedia.file_type}</span>
                <span>Uploaded {new Date(selectedMedia.uploaded_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
