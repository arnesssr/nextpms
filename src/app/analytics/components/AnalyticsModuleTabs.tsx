'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  ShoppingBag, 
  Package,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';

// Import module components
import SalesAnalyticsPage from '../analytics-modules/sales-analytics/page';
import ProductAnalyticsPage from '../analytics-modules/product-analytics/page';
import InventoryAnalyticsPage from '../analytics-modules/inventory-analytics/page';
import CustomerAnalyticsPage from '../analytics-modules/customer-analytics/page';
import RevenueAnalyticsPage from '../analytics-modules/revenue-analytics/page';
import TrendsAnalyticsPage from '../analytics-modules/trends-analytics/page';

const analyticsModules = [
  {
    id: 'sales',
    label: 'Sales Analytics',
    icon: BarChart3,
    description: 'Sales performance metrics and trends'
  },
  {
    id: 'products',
    label: 'Product Analytics',
    icon: ShoppingBag,
    description: 'Product performance and category analysis'
  },
  {
    id: 'inventory',
    label: 'Inventory Analytics',
    icon: Package,
    description: 'Inventory performance and stock analysis'
  },
  {
    id: 'revenue',
    label: 'Revenue Analytics',
    icon: DollarSign,
    description: 'Revenue streams and financial metrics'
  },
  {
    id: 'customers',
    label: 'Customer Analytics',
    icon: Users,
    description: 'Customer behavior and demographics'
  },
  {
    id: 'trends',
    label: 'Market Trends',
    icon: TrendingUp,
    description: 'Market trends and forecasting'
  }
];

export const AnalyticsModuleTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const renderTabContent = (moduleId: string) => {
    switch (moduleId) {
      case 'sales':
        return <SalesAnalyticsPage />;
      
      case 'products':
        return <ProductAnalyticsPage />;
      
      case 'inventory':
        return <InventoryAnalyticsPage />;
      
      case 'revenue':
        return <RevenueAnalyticsPage />;
      
      case 'customers':
        return <CustomerAnalyticsPage />;
      
      case 'trends':
        return <TrendsAnalyticsPage />;
      
      default:
        return (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Module content not available</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6 gap-1 h-auto p-1">
          {analyticsModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <TabsTrigger
                key={module.id}
                value={module.id}
                className="flex flex-col items-center justify-center py-3 px-4 space-y-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <IconComponent size={18} />
                <span className="text-xs font-medium hidden sm:block">{module.label.split(' ')[0]}</span>
                <span className="text-xs text-muted-foreground sm:hidden">{module.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content */}
        {analyticsModules.map((module) => (
          <TabsContent key={module.id} value={module.id} className="mt-6">
            {renderTabContent(module.id)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};