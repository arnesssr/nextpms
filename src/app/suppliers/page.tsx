'use client';

import { SidebarLayout } from '@/components/layout/Sidebar';
import SuppliersTabs from './components/SuppliersTabs';

export default function SuppliersPage() {
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your supplier relationships and procurement processes
          </p>
        </div>
        
        <SuppliersTabs />
      </div>
    </SidebarLayout>
  );
}
