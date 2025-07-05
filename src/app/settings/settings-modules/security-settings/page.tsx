'use client';

import { Shield } from 'lucide-react';
import SecuritySettingsForm from './components/SecuritySettingsForm';

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <Shield className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Security Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your password, 2FA, and access controls
          </p>
        </div>
      </div>

      {/* Security Settings Form */}
      <SecuritySettingsForm />
    </div>
  );
}