'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, ShoppingCart } from 'lucide-react';
import SupplierManagementPage from '../supplier-modules/supplier-management/page';
import SupplierPerformancePage from '../supplier-modules/supplier-performance/page';
import SupplierOrdersPage from '../supplier-modules/supplier-orders/page';

export default function SuppliersTabs() {
  return (
    <Tabs defaultValue="management" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="management" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Management
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Performance
        </TabsTrigger>
        <TabsTrigger value="orders" className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Orders
        </TabsTrigger>
      </TabsList>

      <TabsContent value="management">
        <SupplierManagementPage />
      </TabsContent>

      <TabsContent value="performance">
        <SupplierPerformancePage />
      </TabsContent>

      <TabsContent value="orders">
        <SupplierOrdersPage />
      </TabsContent>
    </Tabs>
  );
}
