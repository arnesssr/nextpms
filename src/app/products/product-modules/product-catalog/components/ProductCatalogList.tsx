'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Copy, 
  Trash2,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Product } from '../types';
import { useProductCatalog } from '../hooks/useProductCatalog';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductCatalogListProps {
  onCreateProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onDuplicateProduct?: (product: Product) => void;
}

export function ProductCatalogList({
  onCreateProduct,
  onEditProduct,
  onViewProduct,
  onDeleteProduct,
  onDuplicateProduct
}: ProductCatalogListProps) {
  const { products, loading, error, refreshProducts } = useProductCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Product detail modal state
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories;
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'sku':
          aValue = a.sku.toLowerCase();
          bValue = b.sku.toLowerCase();
          break;
        case 'price':
          aValue = Number(a.selling_price || a.base_price || 0);
          bValue = Number(b.selling_price || b.base_price || 0);
          break;
        case 'stock':
          aValue = a.current_stock;
          bValue = b.current_stock;
          break;
        case 'created':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
            <XCircle className="w-3 h-3 mr-1" />
            Archived
          </Badge>
        );
      // Legacy status support
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status || 'Unknown'}
          </Badge>
        );
    }
  };

  const getStockStatus = (currentStock: number, minStock: number = 10) => {
    if (currentStock === 0) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Out of Stock
        </Badge>
      );
    } else if (currentStock <= minStock) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Low Stock
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          In Stock
        </Badge>
      );
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 mb-4">Error loading products: {error}</p>
            <Button onClick={refreshProducts} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Catalog
          </CardTitle>
          <CardDescription>
            Manage your product catalog with advanced search and filtering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products by name, SKU, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="active">Active (Legacy)</SelectItem>
                <SelectItem value="inactive">Inactive (Legacy)</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="sku-asc">SKU A-Z</SelectItem>
                <SelectItem value="sku-desc">SKU Z-A</SelectItem>
                <SelectItem value="price-asc">Price Low-High</SelectItem>
                <SelectItem value="price-desc">Price High-Low</SelectItem>
                <SelectItem value="stock-asc">Stock Low-High</SelectItem>
                <SelectItem value="stock-desc">Stock High-Low</SelectItem>
                <SelectItem value="created-desc">Newest First</SelectItem>
                <SelectItem value="created-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredAndSortedProducts.length} of {products.length} products
            </span>
            {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first product"
                  }
                </p>
                {onCreateProduct && (
                  <Button onClick={onCreateProduct}>
                    <Package className="mr-2 h-4 w-4" />
                    Create Product
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    Product Name
                    {sortBy === 'name' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('sku')}
                  >
                    SKU
                    {sortBy === 'sku' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('price')}
                  >
                    Price
                    {sortBy === 'price' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('stock')}
                  >
                    Stock
                    {sortBy === 'stock' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      {product.category && (
                        <Badge variant="outline">{product.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {(product.selling_price || product.base_price || 0).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        {product.current_stock}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>{getStockStatus(product.current_stock)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            console.log('🔍 View Details clicked for:', product.name);
                            setSelectedProductId(product.id);
                            setIsDetailModalOpen(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {onEditProduct && (
                            <DropdownMenuItem onClick={() => onEditProduct(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Product
                            </DropdownMenuItem>
                          )}
                          {onDuplicateProduct && (
                            <DropdownMenuItem onClick={() => onDuplicateProduct(product)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {onDeleteProduct && (
                            <DropdownMenuItem 
                              onClick={() => onDeleteProduct(product.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Product Detail Modal */}
      <ProductDetailModal
        productId={selectedProductId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProductId(null);
        }}
        onEdit={(product) => {
          console.log('✏️ Edit from modal:', product.name);
          if (onEditProduct) {
            onEditProduct(product);
          }
        }}
        onDelete={(productId) => {
          console.log('🗑️ Delete from modal:', productId);
          if (onDeleteProduct) {
            onDeleteProduct(productId);
          }
          // Refresh the list after deletion
          refreshProducts();
        }}
      />
    </div>
  );
}
