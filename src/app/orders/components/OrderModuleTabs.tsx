'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Plus, 
  Package, 
  Truck,
  BarChart3,
  RotateCcw
} from 'lucide-react';

// Import module components
import { OrderList } from '../order-modules/order-list/components/OrderList';
import { OrderCreate } from '../order-modules/order-create/components/OrderCreate';
import { OrderFulfillment } from '../order-modules/order-fulfillment/components/OrderFulfillment';
import { OrderTracking } from '../order-modules/order-tracking/components/OrderTracking';
import { OrderReturns } from '../order-modules/order-returns/components/OrderReturns';
import { Order } from '@/types';

interface OrderModuleTabsProps {
  onCreateOrder?: () => void;
  onEditOrder?: (order: Order) => void;
  onViewOrder?: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
  onFulfillOrder?: (order: Order) => void;
}

const orderModules = [
  {
    id: 'list',
    label: 'Order List',
    icon: ShoppingCart,
    description: 'View and manage all orders'
  },
  {
    id: 'create',
    label: 'Create Order',
    icon: Plus,
    description: 'Create new orders'
  },
  {
    id: 'fulfillment',
    label: 'Fulfillment',
    icon: Package,
    description: 'Process and fulfill orders'
  },
  {
    id: 'tracking',
    label: 'Tracking',
    icon: Truck,
    description: 'Track order shipments'
  },
  {
    id: 'returns',
    label: 'Returns',
    icon: RotateCcw,
    description: 'Handle returns and refunds'
  }
];

export const OrderModuleTabs: React.FC<OrderModuleTabsProps> = ({
  onCreateOrder,
  onEditOrder,
  onViewOrder,
  onDeleteOrder,
  onFulfillOrder
}) => {
  const [activeTab, setActiveTab] = useState('list');

  const renderTabContent = (moduleId: string) => {
    switch (moduleId) {
      case 'list':
        return (
          <OrderList
            onCreateOrder={onCreateOrder}
            onEditOrder={onEditOrder}
            onViewOrder={onViewOrder}
            onDeleteOrder={onDeleteOrder}
            onFulfillOrder={onFulfillOrder}
          />
        );
      
      case 'create':
        return (
          <OrderCreate
            onOrderCreated={() => setActiveTab('list')}
          />
        );
      
      case 'fulfillment':
        return (
          <OrderFulfillment
            onOrderFulfilled={() => setActiveTab('list')}
          />
        );
      
      case 'tracking':
        return <OrderTracking />;
      
      case 'returns':
        return <OrderReturns />;
      
      default:
        return (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Module content not available</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 gap-1 h-auto p-1">
          {orderModules.map((module) => {
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

        {/* Tab Content */}
        {orderModules.map((module) => (
          <TabsContent key={module.id} value={module.id} className="mt-6">
            {renderTabContent(module.id)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};