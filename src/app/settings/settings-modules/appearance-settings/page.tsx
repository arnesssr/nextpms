'use client';

import { Palette } from 'lucide-react';
import AppearanceSettingsForm from './components/AppearanceSettingsForm';

export default function AppearanceSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Palette className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Appearance Settings</h2>
          <p className="text-sm text-muted-foreground">
            Customize the look and feel of your application
          </p>
        </div>
      </div>

      {/* Appearance Settings Form */}
      <AppearanceSettingsForm />
    </div>
  );
}