'use client';

import { User } from 'lucide-react';
import ProfileSettingsForm from './components/ProfileSettingsForm';

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <User className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Profile Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      {/* Profile Settings Form */}
      <ProfileSettingsForm />
    </div>
  );
}