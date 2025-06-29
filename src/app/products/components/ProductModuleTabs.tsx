'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  Package, 
  List, 
  DollarSign, 
  Archive, 
  Images,
  TrendingUp
} from 'lucide-react';

// Import module components
import { ProductList } from '../product-modules/product-list/components/ProductList';
import { InventoryDashboard } from '../product-modules/inventory-management/components/InventoryDashboard';
import { PricingDashboard } from '../product-modules/pricing-management/components/PricingDashboard';
import { ProductCatalogList } from '../product-modules/product-catalog/components/ProductCatalogList';
import { Product } from '../product-modules/product-catalog/types';
import MediaManagementTab from './MediaManagementTab';

interface ProductModuleTabsProps {
  onCreateProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

const productModules = [
  {
    id: 'catalog',
    label: 'Product Catalog',
    icon: Package,
    description: 'Browse and manage your complete product catalog'
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Archive,
    description: 'Monitor stock levels and manage inventory'
  },
  {
    id: 'pricing',
    label: 'Pricing',
    icon: DollarSign,
    description: 'Manage product pricing and profit margins'
  },
  {
    id: 'list',
    label: 'Product List',
    icon: List,
    description: 'View products in grid or list format'
  },
  {
    id: 'media',
    label: 'Media',
    icon: Images,
    description: 'Manage product images and media files'
  }
];

export const ProductModuleTabs: React.FC<ProductModuleTabsProps> = ({
  onCreateProduct,
  onEditProduct,
  onViewProduct,
  onDeleteProduct
}) => {
  const [activeTab, setActiveTab] = useState('catalog');

  const renderTabContent = (moduleId: string) => {
    switch (moduleId) {
      case 'catalog':
        return (
          <ProductCatalogList
            onCreateProduct={onCreateProduct}
            onEditProduct={onEditProduct}
            onViewProduct={onViewProduct}
            onDeleteProduct={onDeleteProduct}
          />
        );
      
      case 'inventory':
        return <InventoryDashboard showFilters={true} />;
      
      case 'pricing':
        return <PricingDashboard showProductSelection={true} />;
      
      case 'list':
        return (
          <ProductList
            onCreateProduct={onCreateProduct}
            onEditProduct={onEditProduct}
            onViewProduct={onViewProduct}
          />
        );
      
      case 'media':
        return (
          <MediaManagementTab 
            productId="sample-product-1" // This should come from props or context
          />
        );
      
      default:
        return (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Module content not available</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 gap-1 h-auto p-1">
          {productModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <TabsTrigger
                key={module.id}
                value={module.id}
                className="flex flex-col items-center justify-center py-3 px-4 space-y-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <IconComponent size={18} />
                <span className="text-xs font-medium hidden sm:block">{module.label}</span>
                <span className="text-xs text-muted-foreground sm:hidden">{module.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content Description */}
        <div className="mt-4">
          {productModules.map((module) => (
            <div key={module.id} className={activeTab === module.id ? 'block' : 'hidden'}>
              <div className="flex items-center space-x-2 mb-4">
                <module.icon size={20} className="text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">{module.label}</h3>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Content */}
        {productModules.map((module) => (
          <TabsContent key={module.id} value={module.id} className="mt-6">
            {renderTabContent(module.id)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
