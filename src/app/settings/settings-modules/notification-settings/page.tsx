'use client';

import { Bell } from 'lucide-react';
import NotificationSettingsForm from './components/NotificationSettingsForm';

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Bell className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Notification Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your email and push notification preferences
          </p>
        </div>
      </div>

      {/* Notification Settings Form */}
      <NotificationSettingsForm />
    </div>
  );
}