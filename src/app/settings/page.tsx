'use client';

import { SidebarLayout } from '@/components/layout/Sidebar';
import SettingsTabs from './components/SettingsTabs';

export default function SettingsPage() {
  return (
    <SidebarLayout>
      <div className="p-3 sm:p-4 md:p-6">
        <SettingsTabs />
      </div>
    </SidebarLayout>
  );
}