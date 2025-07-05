'use client';

import { Button } from '@/components/ui/button';
import { SidebarLayout } from '@/components/layout/Sidebar';
import { AnalyticsModuleTabs } from './components';
import { Download, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <p className="text-muted-foreground">
              Insights and performance metrics for your business
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Analytics Tabs */}
        <AnalyticsModuleTabs />
      </div>
    </SidebarLayout>
  );
}
