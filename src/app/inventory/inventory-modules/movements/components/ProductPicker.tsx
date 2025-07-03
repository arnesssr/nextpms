'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Package, AlertTriangle, Check, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductRow } from '@/types/products';
import { productService } from '@/services/products/productService';

export interface ProductWithStock extends ProductRow {
  availableStock?: number;
  reservedStock?: number;
}

interface ProductPickerProps {
  value?: ProductWithStock | null;
  onSelect: (product: ProductWithStock | null) => void;
  placeholder?: string;
  disabled?: boolean;
  showStockInfo?: boolean;
  filterOutOfStock?: boolean;
  className?: string;
}

export function ProductPicker({
  value,
  onSelect,
  placeholder = "Search products...",
  disabled = false,
  showStockInfo = true,
  filterOutOfStock = false,
  className = ""
}: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load products with stock information
  const loadProducts = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getProducts({
        search: search || undefined,
        status: 'published',
        is_active: true,
        limit: 50,
        sort_by: 'name',
        sort_order: 'asc'
      });

      if (response.success) {
        // Transform products to include stock information
        const productsWithStock: ProductWithStock[] = response.data.map(product => ({
          ...product,
          availableStock: product.stock_quantity || 0,
          reservedStock: 0 // This would come from inventory service in real implementation
        }));

        // Filter out of stock products if requested
        const filteredProducts = filterOutOfStock 
          ? productsWithStock.filter(p => (p.availableStock || 0) > 0)
          : productsWithStock;

        setProducts(filteredProducts);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filterOutOfStock]);

  // Load products on mount and when search changes
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2 || searchQuery.trim().length === 0) {
        loadProducts(searchQuery.trim());
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadProducts]);

  const handleSelect = (product: ProductWithStock) => {
    onSelect(product);
    setOpen(false);
  };

  const getStockStatus = (product: ProductWithStock) => {
    const available = product.availableStock || 0;
    const minStock = product.min_stock_level || 0;

    if (available === 0) {
      return { 
        label: 'Out of Stock', 
        variant: 'destructive' as const,
        textColor: 'text-red-600'
      };
    } else if (available <= minStock) {
      return { 
        label: 'Low Stock', 
        variant: 'secondary' as const,
        textColor: 'text-orange-600'
      };
    } else {
      return { 
        label: 'In Stock', 
        variant: 'outline' as const,
        textColor: 'text-green-600'
      };
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Product Display */}
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setOpen(!open)}
        disabled={disabled}
      >
        {value ? (
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span className="truncate">{value.name}</span>
            {showStockInfo && (
              <Badge variant="outline" className="ml-2">
                {value.availableStock || 0} available
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>{placeholder}</span>
          </div>
        )}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Dropdown */}
      {open && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[400px] overflow-hidden">
          <CardContent className="p-0">
            {/* Search Input */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Products List */}
            <div className="max-h-[300px] overflow-y-auto">
              {loading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading products...
                </div>
              )}
              
              {error && (
                <div className="p-4 text-center text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4 mx-auto mb-2" />
                  {error}
                </div>
              )}
              
              {!loading && !error && products.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No products found
                </div>
              )}
              
              {!loading && !error && products.length > 0 && (
                <div>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const isSelected = value?.id === product.id;
                    
                    return (
                      <div
                        key={product.id}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                          isSelected ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => handleSelect(product)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium">{product.name}</h4>
                              {isSelected && <Check className="h-4 w-4 text-green-600" />}
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                SKU: {product.sku || 'N/A'}
                              </span>
                              <span className="text-xs font-medium">
                                {formatPrice(product.selling_price)}
                              </span>
                            </div>
                            
                            {showStockInfo && (
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant={stockStatus.variant} className="text-xs">
                                  {stockStatus.label}
                                </Badge>
                                <span className={`text-xs font-medium ${stockStatus.textColor}`}>
                                  {product.availableStock || 0} available
                                </span>
                                {product.min_stock_level && (
                                  <span className="text-xs text-muted-foreground">
                                    (Min: {product.min_stock_level})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backdrop to close dropdown */}
      {open && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
