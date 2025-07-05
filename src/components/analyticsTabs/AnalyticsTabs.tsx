'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  ShoppingBag, 
  Package 
} from 'lucide-react';
import SalesAnalyticsPage from '@/app/analytics/analytics-modules/sales-analytics/page';
import ProductAnalyticsPage from '@/app/analytics/analytics-modules/product-analytics/page';
import InventoryAnalyticsPage from '@/app/analytics/analytics-modules/inventory-analytics/page';

export function AnalyticsTabs() {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="sales" className="flex items-center">
          <BarChart3 className="mr-2 h-4 w-4" />
          Sales
        </TabsTrigger>
        <TabsTrigger value="products" className="flex items-center">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Products
        </TabsTrigger>
        <TabsTrigger value="inventory" className="flex items-center">
          <Package className="mr-2 h-4 w-4" />
          Inventory
        </TabsTrigger>
      </TabsList>
      <TabsContent value="sales">
        <SalesAnalyticsPage />
      </TabsContent>
      <TabsContent value="products">
        <ProductAnalyticsPage />
      </TabsContent>
      <TabsContent value="inventory">
        <InventoryAnalyticsPage />
      </TabsContent>
    </Tabs>
  );
}