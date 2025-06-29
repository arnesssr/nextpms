'use client';

import { useState } from 'react';
import { ProductCatalogList } from './components/ProductCatalogList';
import { Product } from './types';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductCatalogPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleCreateProduct = () => {
    console.log('Create new product');
    setShowCreateModal(true);
  };

  const handleEditProduct = (product: Product) => {
    console.log('Edit product:', product);
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleViewProduct = (product: Product) => {
    console.log('View product details:', product);
    setSelectedProduct(product);
    // Navigate to product detail page or show modal
  };

  const handleDeleteProduct = (productId: string) => {
    console.log('Delete product:', productId);
    if (window.confirm('Are you sure you want to delete this product?')) {
      // The hook will handle the actual deletion
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    console.log('Duplicate product:', product);
    // Create a copy of the product with a new SKU
  };

  const handleExportProducts = () => {
    console.log('Export products to CSV/Excel');
    // Implement export functionality
  };

  const handleImportProducts = () => {
    console.log('Import products from CSV/Excel');
    // Implement import functionality
  };

  const handleBulkSettings = () => {
    console.log('Open bulk operations settings');
    // Implement bulk operations
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground">
            Manage your complete product inventory with advanced cataloging features
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportProducts}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportProducts}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkSettings}
          >
            <Settings className="mr-2 h-4 w-4" />
            Bulk Actions
          </Button>
          
          <Button onClick={handleCreateProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +10% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,180</div>
            <p className="text-xs text-muted-foreground">
              95.6% of total inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">24</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">8</div>
            <p className="text-xs text-muted-foreground">
              Immediate restock needed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product Catalog List */}
      <ProductCatalogList
        onCreateProduct={handleCreateProduct}
        onEditProduct={handleEditProduct}
        onViewProduct={handleViewProduct}
        onDeleteProduct={handleDeleteProduct}
        onDuplicateProduct={handleDuplicateProduct}
      />

      {/* Modals would go here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Product</CardTitle>
              <CardDescription>
                Add a new product to your catalog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Product creation form would go here...
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateModal(false)}>
                  Create Product
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Product</CardTitle>
              <CardDescription>
                Update {selectedProduct.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Product edit form would go here...
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                }}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
