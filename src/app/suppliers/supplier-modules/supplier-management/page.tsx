'use client';

import { Users } from 'lucide-react';
import { SuppliersList } from './components/SuppliersList';

export default function SupplierManagementPage() {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Supplier Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage all your suppliers, contacts, and relationships
          </p>
        </div>
      </div>

      {/* Suppliers List Component */}
      <SuppliersList />
    </div>
  );
}
