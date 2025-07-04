'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users } from 'lucide-react';
import SupplierManagementPage from '../supplier-modules/supplier-management/page';

export default function SuppliersTabs() {
  return (
    <Tabs defaultValue="management" className="w-full">
      <TabsList className="grid w-full grid-cols-1">
        <TabsTrigger value="management" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Management
        </TabsTrigger>
      </TabsList>

      <TabsContent value="management">
        <SupplierManagementPage />
      </TabsContent>

      {/* Future tabs can be added here */}
    </Tabs>
  );
}
