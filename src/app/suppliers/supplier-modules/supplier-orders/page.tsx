'use client';

import { ShoppingCart } from 'lucide-react';
import { SupplierOrdersList } from './components/SupplierOrdersList';

export default function SupplierOrdersPage() {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <ShoppingCart className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Supplier Orders</h2>
          <p className="text-sm text-muted-foreground">
            Manage purchase orders and track deliveries
          </p>
        </div>
      </div>

      {/* Supplier Orders List Component */}
      <SupplierOrdersList />
    </div>
  );
}