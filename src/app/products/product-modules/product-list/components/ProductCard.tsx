// ProductCard.tsx
import React from 'react';
import { Eye, Edit, Trash2, Package } from 'lucide-react';
import { ProductWithCategory } from '@/types/products';
import { formatProductData } from '../services/formatProductData';

interface ProductCardProps {
  product: ProductWithCategory;
  onEdit?: (product: ProductWithCategory) => void;
  onDelete?: (productId: string) => void;
  onView?: (product: ProductWithCategory) => void;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete, 
  onView,
  viewMode = 'grid'
}) => {
  const {
    formattedPrice,
    stockStatus,
    statusInfo,
    initials,
    shortDescription,
    formattedSKU,
    primaryImage,
    galleryImages,
    hasImages
  } = formatProductData.formatProductCard(product);

  if (viewMode === 'list') {
    return (
      <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {hasImages && primaryImage ? (
                <img 
                  src={primaryImage} 
                  alt={product.name}
                  className="h-12 w-12 rounded-lg object-cover border shadow-sm"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ${hasImages && primaryImage ? 'hidden' : ''}`}>
                <span className="text-blue-700 font-semibold text-sm">{initials}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-500">{formattedSKU}</p>
              <p className="text-sm text-gray-600 truncate">{shortDescription}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">{formattedPrice}</p>
              <p className={`text-sm ${stockStatus.color}`}>{stockStatus.text}</p>
            </div>
            <div>
              <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onView?.(product)}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="View Product"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => onEdit?.(product)}
                className="text-green-600 hover:text-green-800 p-1"
                title="Edit Product"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete?.(product.id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete Product"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
        <div className="flex space-x-1">
          <button
            onClick={() => onView?.(product)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="View Product"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => onEdit?.(product)}
            className="text-green-600 hover:text-green-800 p-1"
            title="Edit Product"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete?.(product.id)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete Product"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex justify-center mb-4">
        {hasImages && primaryImage ? (
          <div className="relative">
            <img 
              src={primaryImage} 
              alt={product.name}
              className="h-32 w-32 rounded-lg object-cover border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />
            {galleryImages.length > 1 && (
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {galleryImages.length}
              </div>
            )}
          </div>
        ) : (
          <div className="h-32 w-32 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200">
            <div className="text-center">
              <Package className="h-8 w-8 text-gray-400 mx-auto mb-1" />
              <span className="text-gray-600 font-semibold text-sm">{initials}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{formattedSKU}</p>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{shortDescription}</p>
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-xl font-bold text-gray-900">{formattedPrice}</p>
            <p className={`text-sm ${stockStatus.color}`}>{stockStatus.text}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Stock: {product.stock_quantity || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

