'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/Sidebar';
import { ProductModuleTabs } from './components/ProductModuleTabs';
import { useProducts } from './product-modules/product-list/hooks/useProducts';
import { ProductForm } from '@/components/forms/ProductForm';
import { ImportExportDialog } from '@/components/dialogs/ImportExportDialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Plus, 
  Download,
  Upload
} from 'lucide-react';
import { Product } from './product-modules/product-catalog/types';

export default function ProductsPage() {
  const router = useRouter();
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const { products, fetchProducts } = useProducts();

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductFormOpen(true);
  };

  const handleCreateProduct = () => {
    router.push('/products/product-modules/product-create');
  };

  const handleViewProduct = (product: Product) => {
    console.log('🔍 View Details handled by ProductCatalogList modal');
    // This is now handled by the ProductDetailModal in ProductCatalogList
    // No navigation needed - modal opens instead
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    const productName = product?.name || 'this product';
    
    if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      try {
        // Import the product service
        const { ProductService } = await import('@/services/products');
        await ProductService.deleteProduct(productId);
        
        // Refresh the page or update the products list
        window.location.reload();
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    console.log('📋 Duplicate clicked for product:', product.name, 'ID:', product.id);
    
    try {
      // Import the product service
      const { ProductService } = await import('@/services/products');
      
      console.log('🔄 Creating duplicate product...');
      
      // Create a duplicate with modified name and SKU
      const duplicateData = {
        name: `${product.name} (Copy)`,
        description: product.description || '',
        category_id: product.category_id,
        base_price: product.base_price || product.selling_price || 0,
        selling_price: product.selling_price || 0,
        stock_quantity: 0, // Start with 0 stock for duplicate
        status: 'draft', // Always create duplicates as draft
        is_active: true,
        is_featured: false,
        is_digital: false,
        track_inventory: true,
        requires_shipping: true,
        min_stock_level: product.min_stock_level || 0,
        discount_percentage: 0,
        tax_rate: 0,
      };
      
      console.log('📤 Sending duplicate data:', duplicateData);
      
      const result = await ProductService.createProduct(duplicateData);
      
      console.log('📥 Duplicate result:', result);
      
      if (result.success) {
        // Navigate to edit the new duplicate
        console.log('✅ Duplicate created, navigating to edit...');
        router.push(`/products/create?duplicate=${result.data.id}`);
      } else {
        throw new Error(result.error || 'Failed to duplicate product');
      }
    } catch (error) {
      console.error('❌ Failed to duplicate product:', error);
      alert('Failed to duplicate product. Please try again.');
    }
  };

  const handleFormClose = () => {
    setIsProductFormOpen(false);
    setSelectedProduct(null);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header with Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Products</h2>
              <p className="text-muted-foreground">
                Manage your product catalog and inventory
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => setIsImportExportOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsImportExportOpen(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => router.push('/products/product-modules/product-create')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
              {/* Sheet for editing existing products */}
              <Sheet open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
                <SheetContent className="w-full sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-4xl overflow-y-auto">
                  <SheetHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
                    <SheetTitle>
                      Edit Product
                    </SheetTitle>
                    <SheetDescription>
                      Update product information and settings
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6">
                    <ProductForm 
                      product={selectedProduct} 
                      onClose={handleFormClose}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Import/Export Dialog */}
              <ImportExportDialog 
                open={isImportExportOpen}
                onOpenChange={setIsImportExportOpen}
                onImportComplete={() => {
                  // Refresh products after import
                  fetchProducts();
                }}
              />
            </div>
          </div>

          {/* Product Module Tabs - Now at the top */}
          <ProductModuleTabs 
            onCreateProduct={handleCreateProduct}
            onEditProduct={handleEditProduct}
            onViewProduct={handleViewProduct}
            onDeleteProduct={handleDeleteProduct}
            onDuplicateProduct={handleDuplicateProduct}
          />
        </div>
      </div>
    </SidebarLayout>
  );
}
