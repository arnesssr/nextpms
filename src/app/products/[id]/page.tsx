'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign, 
  Eye,
  Calendar,
  Tag,
  BarChart3
} from 'lucide-react';
import { ProductService } from '@/services/products';

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category_id: string;
  category_name: string;
  base_price: number;
  selling_price: number;
  cost_price?: number;
  stock_quantity: number;
  min_stock_level: number;
  status: string;
  is_active: boolean;
  is_featured: boolean;
  featured_image_url?: string;
  gallery_images?: string[];
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface ProductDetailPageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getProduct(params.id);
        if (response.success) {
          setProduct(response.data);
        } else {
          setError(response.error || 'Failed to fetch product');
        }
      } catch (err) {
        setError('Failed to fetch product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleEdit = () => {
    router.push(`/products/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (!product) return;
    
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      try {
        await ProductService.deleteProduct(product.id);
        router.push('/products');
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. Please try again.');
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

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (error || !product) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{error || 'Product not found'}</p>
            <Button onClick={() => router.push('/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/products')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">SKU: {product.sku}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Product Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {product.description || 'No description available'}
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Category</h4>
                    <p>{product.category_name || 'Uncategorized'}</p>
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

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Selling Price</p>
                  <p className="text-2xl font-bold">${product.selling_price?.toFixed(2) || '0.00'}</p>
                </div>
                {product.base_price && (
                  <div>
                    <p className="text-sm text-muted-foreground">Base Price</p>
                    <p className="text-lg">${product.base_price.toFixed(2)}</p>
                  </div>
                )}
                {product.cost_price && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Price</p>
                    <p className="text-lg">${product.cost_price.toFixed(2)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Current Stock</p>
                  <p className="text-2xl font-bold">{product.stock_quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Minimum Level</p>
                  <p className="text-lg">{product.min_stock_level}</p>
                </div>
                <div className="mt-2">
                  {getStockStatus(product.stock_quantity, product.min_stock_level)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Details Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Active</h4>
                    <p>{product.is_active ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Featured</h4>
                    <p>{product.is_featured ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
                    <p>{new Date(product.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Last Updated</h4>
                    <p>{new Date(product.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Change History
                </CardTitle>
                <CardDescription>Recent changes to this product</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Change history will be available in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Product Analytics
                </CardTitle>
                <CardDescription>Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics will be available in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
}
