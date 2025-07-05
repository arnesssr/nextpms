'use client';

import { Database } from 'lucide-react';
import IntegrationSettingsForm from './components/IntegrationSettingsForm';

export default function IntegrationSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Database className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Integration Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage connected services and API settings
          </p>
        </div>
      </div>

      {/* Integration Settings Form */}
      <IntegrationSettingsForm />
    </div>
  );
}