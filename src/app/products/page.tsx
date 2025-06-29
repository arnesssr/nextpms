'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/Sidebar';
import { ProductModuleTabs } from './components/ProductModuleTabs';
import { useProducts } from './product-modules/product-list/hooks/useProducts';
import { ProductForm } from '@/components/forms/ProductForm';
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
  const { products } = useProducts();

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductFormOpen(true);
  };

  const handleCreateProduct = () => {
    router.push('/products/create');
  };

  const handleViewProduct = (product: Product) => {
    // Handle product view logic
    console.log('Viewing product:', product);
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
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => router.push('/products/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
              {/* Sheet for editing existing products */}
              <Sheet open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
                <SheetContent className="w-[600px] sm:w-[700px]">
                  <SheetHeader>
                    <SheetTitle>
                      Edit Product
                    </SheetTitle>
                    <SheetDescription>
                      Update product information and settings
                    </SheetDescription>
                  </SheetHeader>
                  <ProductForm 
                    product={selectedProduct} 
                    onClose={handleFormClose}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Product Module Tabs - Now at the top */}
          <ProductModuleTabs 
            onCreateProduct={handleCreateProduct}
            onEditProduct={handleEditProduct}
            onViewProduct={handleViewProduct}
            onDeleteProduct={(id) => console.log('Delete product:', id)}
          />
        </div>
      </div>
    </SidebarLayout>
  );
}
