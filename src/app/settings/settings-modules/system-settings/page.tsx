'use client';

import { Settings } from 'lucide-react';
import SystemSettingsForm from './components/SystemSettingsForm';

export default function SystemSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-100 rounded-lg">
          <Settings className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">System Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage application and performance settings
          </p>
        </div>
      </div>

      {/* System Settings Form */}
      <SystemSettingsForm />
    </div>
  );
}