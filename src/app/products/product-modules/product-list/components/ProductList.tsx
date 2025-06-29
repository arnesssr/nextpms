'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { usePagination } from '../hooks/usePagination';
import { Product } from '../../product-catalog/types';
import { ViewMode, SortField, SortOrder } from '../types';
import ProductCard from './ProductCard';
import Loading from './Loading';
import EmptyState from './EmptyState';
import ErrorBoundary from './ErrorBoundary';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import Pagination from './Pagination';
import ViewToggle from './ViewToggle';
import SortOptions from './SortOptions';
import { formatProductData } from '../services/formatProductData';

interface ProductListProps {
  onCreateProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  onCreateProduct,
  onEditProduct,
  onViewProduct,
}) => {
  const {
    products,
    loading,
    error,
    deleteProduct,
    searchProducts,
    filterProducts,
  } = useProducts();

  const { currentPage, totalPages, setPage, setTotalItems } = usePagination({ initialLimit: 12 });
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // Sort and filter products
  const processedProducts = React.useMemo(() => {
    let filtered = formatProductData.filterProducts(products, activeFilters);
    let sorted = formatProductData.sortProducts(filtered, sortField, sortOrder);
    return sorted;
  }, [products, activeFilters, sortField, sortOrder]);

  // Update total items when products change
  React.useEffect(() => {
    setTotalItems(processedProducts.length);
  }, [processedProducts.length, setTotalItems]);

  // Get paginated products
  const paginatedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * 12;
    const endIndex = startIndex + 12;
    return processedProducts.slice(startIndex, endIndex);
  }, [processedProducts, currentPage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchProducts(query);
    }
  };

  const handleFilter = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    setPage(1); // Reset to first page when filtering
  };

  const handleSort = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleRetryError = () => {
    // Retry logic here
    window.location.reload();
  };

  if (loading) {
    return <Loading message="Loading products..." />;
  }

  if (error) {
    return <ErrorBoundary message={error} onRetry={handleRetryError} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <button
          onClick={onCreateProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search and Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 flex gap-4">
            <SearchBar onSearch={handleSearch} value={searchQuery} />
            <FilterPanel onFilter={handleFilter} activeFilters={activeFilters} />
          </div>
          
          <div className="flex gap-4 items-center">
            <SortOptions 
              sortBy={sortField} 
              sortOrder={sortOrder} 
              onSortChange={handleSort} 
            />
            <ViewToggle 
              viewMode={viewMode} 
              onViewChange={setViewMode} 
            />
          </div>
        </div>
      </div>

      {/* Products Display */}
      {paginatedProducts.length === 0 ? (
        <EmptyState 
          title="No products found" 
          message="Try adjusting your search or filter criteria"
          onAction={onCreateProduct}
          actionLabel="Add Your First Product"
        />
      ) : (
        <>
          {/* Products Grid/List */}
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onView={onViewProduct}
                onEdit={onEditProduct}
                onDelete={handleDelete}
              />
            ))}
          </div>
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};
