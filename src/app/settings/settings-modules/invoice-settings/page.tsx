'use client';

import { Receipt } from 'lucide-react';
import InvoiceSettingsForm from './components/InvoiceSettingsForm';

export default function InvoiceSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Receipt className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Invoice Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure invoice templates and payment options
          </p>
        </div>
      </div>

      {/* Invoice Settings Form */}
      <InvoiceSettingsForm />
    </div>
  );
}