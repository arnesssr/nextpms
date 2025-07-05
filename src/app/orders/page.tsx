'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/Sidebar';
import { OrderModuleTabs } from './components/OrderModuleTabs';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Download,
  Upload
} from 'lucide-react';
import { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();

  const handleCreateOrder = () => {
    // This will be handled by the OrderModuleTabs component
    console.log('Create order clicked');
  };

  const handleEditOrder = (order: Order) => {
    console.log('Edit order:', order);
    // Handle order editing
  };

  const handleViewOrder = (order: Order) => {
    console.log('View order:', order);
    // Handle order viewing
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Refresh the orders list
          window.location.reload();
        } else {
          alert('Failed to delete order');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order');
      }
    }
  };

  const handleFulfillOrder = (order: Order) => {
    console.log('Fulfill order:', order);
    // Handle order fulfillment
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header with Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
              <p className="text-muted-foreground">
                Manage and track your customer orders
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
              <Button onClick={handleCreateOrder}>
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </div>
          </div>

          {/* Order Module Tabs */}
          <OrderModuleTabs 
            onCreateOrder={handleCreateOrder}
            onEditOrder={handleEditOrder}
            onViewOrder={handleViewOrder}
            onDeleteOrder={handleDeleteOrder}
            onFulfillOrder={handleFulfillOrder}
          />
        </div>
      </div>
    </SidebarLayout>
  );
}
