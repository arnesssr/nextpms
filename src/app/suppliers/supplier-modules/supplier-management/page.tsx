'use client';

import { SupplierList } from './components/SupplierList';
import { SidebarLayout } from '@/components/layout/Sidebar';

export default function SupplierManagementPage() {
  return (
    <SidebarLayout>
      <SupplierList />
    </SidebarLayout>
  );
}
