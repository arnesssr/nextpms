'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Edit, 
  Trash2, 
  Package, 
  DollarSign, 
  Eye,
  Calendar,
  Tag,
  BarChart3,
  X
} from 'lucide-react';
import { ProductService } from '@/services/products';
import { Product } from '../types';

interface ProductDetailModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function ProductDetailModal({ 
  productId, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: ProductDetailModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId && isOpen) {
      console.log('📄 Loading product details for:', productId);
      fetchProduct();
    }
  }, [productId, isOpen]);

  const fetchProduct = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ProductService.getProduct(productId);
      
      if (response.success) {
        setProduct(response.data);
        console.log('✅ Product loaded:', response.data.name);
      } else {
        setError(response.error || 'Failed to fetch product');
      }
    } catch (err) {
      console.error('❌ Error fetching product:', err);
      setError('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (product && onEdit) {
      onEdit(product);
      onClose();
    }
  };

  const handleDelete = () => {
    if (product && onDelete) {
      if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
        onDelete(product.id);
        onClose();
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock <= minStock) {
      return <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Product Details
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Package className="h-8 w-8 text-muted-foreground animate-pulse" />
            <p className="ml-2 text-muted-foreground">Loading product...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchProduct}>Try Again</Button>
          </div>
        )}

        {product && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{product.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>SKU: {product.sku}</span>
                  <span>•</span>
                  <span>ID: {product.id}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Main Info */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {product.description || 'No description available'}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Category</h4>
                        <p className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {product.category_name || 'Uncategorized'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                        <div className="mt-1">
                          {getStatusBadge(product.status)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Selling Price</p>
                      <p className="text-lg font-bold">${product.selling_price?.toFixed(2) || '0.00'}</p>
                    </div>
                    {product.base_price && (
                      <div>
                        <p className="text-xs text-muted-foreground">Base Price</p>
                        <p className="text-sm">${product.base_price.toFixed(2)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Inventory
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Stock</p>
                      <p className="text-lg font-bold">{product.stock_quantity || 0}</p>
                    </div>
                    
                    {product.min_stock_level && (
                      <div>
                        <p className="text-xs text-muted-foreground">Low Stock Alert</p>
                        <p className="text-sm">{product.min_stock_level} units</p>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      {getStockStatus(product.stock_quantity || 0, product.min_stock_level || 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Additional Details */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Active</p>
                        <p>{product.is_active ? '✅ Yes' : '❌ No'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Featured</p>
                        <p>{product.is_featured ? '⭐ Yes' : '⚪ No'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p>{new Date(product.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Updated</p>
                        <p>{new Date(product.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-4">
                      <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">History tracking coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
