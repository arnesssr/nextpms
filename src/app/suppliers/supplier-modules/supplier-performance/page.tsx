'use client';

import { TrendingUp } from 'lucide-react';
import { PerformanceDashboard } from './components/PerformanceDashboard';

export default function SupplierPerformancePage() {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <TrendingUp className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Supplier Performance</h2>
          <p className="text-sm text-muted-foreground">
            Track and analyze supplier performance metrics
          </p>
        </div>
      </div>

      {/* Performance Dashboard Component */}
      <PerformanceDashboard />
    </div>
  );
}