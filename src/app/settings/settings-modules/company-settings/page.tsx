'use client';

import { Building2 } from 'lucide-react';
import CompanySettingsForm from './components/CompanySettingsForm';

export default function CompanySettingsPage() {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Company Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your company information and branding
          </p>
        </div>
      </div>

      {/* Company Settings Form */}
      <CompanySettingsForm />
    </div>
  );
}