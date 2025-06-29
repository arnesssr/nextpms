'use client';

import React from 'react';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Star, 
  Package, 
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Circle,
  FolderTree,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Category, CategoryCardProps } from '../types';

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  viewMode = 'grid',
  isSelected = false,
  onSelect
}) => {
  
  const handleSelect = (checked: boolean) => {
    onSelect?.(checked);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle className="w-3 h-3" />
      : <XCircle className="w-3 h-3" />;
  };

  const getCategoryInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // List View Layout
  if (viewMode === 'list') {
    return (
      <Card className={`hover:shadow-md transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Selection Checkbox */}
              {onSelect && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleSelect}
                  className="mr-2"
                />
              )}

              {/* Category Avatar/Icon */}
              <div className="flex-shrink-0">
                {category.image_url ? (
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={category.image_url} alt={category.name} />
                    <AvatarFallback style={{ backgroundColor: category.color || '#e2e8f0' }}>
                      {getCategoryInitials(category.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color || '#e2e8f0' }}
                  >
                    {category.icon ? (
                      <span className="text-lg">{category.icon}</span>
                    ) : (
                      <Package className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                )}
              </div>

              {/* Category Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {category.name}
                  </h3>
                  {category.is_featured && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center">
                    <FolderTree className="h-3 w-3 mr-1" />
                    {category.path}
                  </span>
                  
                  <span className="flex items-center">
                    <Package className="h-3 w-3 mr-1" />
                    {category.product_count} products
                  </span>
                  
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(category.created_at)}
                  </span>
                  
                  {category.sort_order !== null && category.sort_order !== undefined && (
                    <span className="flex items-center">
                      <Circle className="h-3 w-3 mr-1" />
                      Order: {category.sort_order}
                    </span>
                  )}
                </div>

                {category.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {truncateText(category.description, 120)}
                  </p>
                )}
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center space-x-4">
              <Badge className={getStatusColor(category.is_active)}>
                {getStatusIcon(category.is_active)}
                <span className="ml-1">
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </Badge>

              {showActions && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView?.(category)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(category)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onView?.(category)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(category)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Category
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(category.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View Layout (Default)
  return (
    <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {/* Selection Checkbox */}
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleSelect}
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Status Badge */}
            <Badge className={getStatusColor(category.is_active)}>
              {getStatusIcon(category.is_active)}
              <span className="ml-1">
                {category.is_active ? 'Active' : 'Inactive'}
              </span>
            </Badge>
          </div>

          {/* Actions Menu */}
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onView?.(category)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(category)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Category
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Products
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete?.(category.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0" onClick={() => onView?.(category)}>
        {/* Category Icon/Image */}
        <div className="flex justify-center mb-4">
          {category.image_url ? (
            <Avatar className="h-16 w-16">
              <AvatarImage src={category.image_url} alt={category.name} />
              <AvatarFallback style={{ backgroundColor: category.color || '#e2e8f0' }}>
                {getCategoryInitials(category.name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div 
              className="h-16 w-16 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: category.color || '#e2e8f0' }}
            >
              {category.icon ? (
                <span className="text-2xl">{category.icon}</span>
              ) : (
                <Package className="h-8 w-8 text-gray-600" />
              )}
            </div>
          )}
        </div>

        {/* Category Info */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-1">
            <CardTitle className="text-lg font-semibold truncate">
              {category.name}
            </CardTitle>
            {category.is_featured && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>

          {/* Hierarchy Path */}
          {category.level > 0 && (
            <div className="flex items-center justify-center text-xs text-gray-500">
              <FolderTree className="h-3 w-3 mr-1" />
              <span className="truncate">{category.path}</span>
            </div>
          )}

          {/* Description */}
          {category.description && (
            <p className="text-sm text-gray-600 line-clamp-3 px-2">
              {truncateText(category.description, 100)}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 pt-2 border-t">
            <div className="flex items-center">
              <Package className="h-3 w-3 mr-1" />
              <span>{category.product_count}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(category.created_at)}</span>
            </div>
            
            {category.sort_order !== null && category.sort_order !== undefined && (
              <div className="flex items-center">
                <Circle className="h-3 w-3 mr-1" />
                <span>#{category.sort_order}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {showActions && (
            <div className="flex justify-center space-x-2 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(category);
                }}
                className="h-8"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(category);
                }}
                className="h-8"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
