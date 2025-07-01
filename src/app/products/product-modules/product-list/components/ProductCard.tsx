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
    formattedSKU
  } = formatProductData.formatProductCard(product);

  if (viewMode === 'list') {
    return (
      <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {(product.gallery_images && product.gallery_images.length > 0) || product.featured_image_url ? (
                <img 
                  src={product.featured_image_url || product.gallery_images?.[0]} 
                  alt={product.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">{initials}</span>
                </div>
              )}
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
        {(product.gallery_images && product.gallery_images.length > 0) || product.featured_image_url ? (
          <img 
            src={product.featured_image_url || product.gallery_images?.[0]} 
            alt={product.name}
            className="h-32 w-32 rounded-lg object-cover"
          />
        ) : (
          <div className="h-32 w-32 rounded-lg bg-gray-200 flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-400" />
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

