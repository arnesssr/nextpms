'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Download, RefreshCw, Save, Upload } from 'lucide-react';
import { 
  User,
  Shield,
  Bell,
  Settings as SettingsIcon,
  Database,
  Building2,
  Receipt,
  Palette
} from 'lucide-react';

import ProfileSettingsPage from '../settings-modules/profile-settings/page';
import SecuritySettingsPage from '../settings-modules/security-settings/page';
import NotificationSettingsPage from '../settings-modules/notification-settings/page';
import CompanySettingsPage from '../settings-modules/company-settings/page';
import InvoiceSettingsPage from '../settings-modules/invoice-settings/page';
import IntegrationSettingsPage from '../settings-modules/integration-settings/page';
import SystemSettingsPage from '../settings-modules/system-settings/page';
import AppearanceSettingsPage from '../settings-modules/appearance-settings/page';

export default function SettingsTabs() {
  const [activeTab, setActiveTab] = useState('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement save all settings functionality
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportSettings = () => {
    // TODO: Implement export settings functionality
    console.log('Exporting settings...');
  };

  const handleImportSettings = () => {
    // TODO: Implement import settings functionality
    console.log('Importing settings...');
  };

  const settingsTabs = [
    {
      value: 'profile',
      label: 'Profile',
      icon: User,
      component: ProfileSettingsPage
    },
    {
      value: 'security',
      label: 'Security',
      icon: Shield,
      component: SecuritySettingsPage
    },
    {
      value: 'notifications',
      label: 'Notifications',
      icon: Bell,
      component: NotificationSettingsPage
    },
    {
      value: 'appearance',
      label: 'Appearance',
      icon: Palette,
      component: AppearanceSettingsPage
    },
    {
      value: 'company',
      label: 'Company',
      icon: Building2,
      component: CompanySettingsPage
    },
    {
      value: 'invoice',
      label: 'Invoice',
      icon: Receipt,
      component: InvoiceSettingsPage
    },
    {
      value: 'integrations',
      label: 'Integrations',
      icon: Database,
      component: IntegrationSettingsPage
    },
    {
      value: 'system',
      label: 'System',
      icon: SettingsIcon,
      component: SystemSettingsPage
    }
  ];

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Settings</h2>
          <p className="text-xs text-muted-foreground sm:text-sm md:text-base">
            Manage your account and application preferences
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button variant="outline" onClick={handleImportSettings} size="sm" className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            <span>Import</span>
          </Button>
          <Button variant="outline" onClick={handleExportSettings} size="sm" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            <span>Export</span>
          </Button>
          {hasUnsavedChanges && (
            <Button onClick={handleSaveAll} disabled={isSaving} size="sm" className="w-full sm:w-auto">
              {isSaving ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? 'Saving...' : 'Save All'}
            </Button>
          )}
        </div>
      </div>

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 sm:p-4 md:pt-6">
            <div className="flex items-start space-x-2 text-amber-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">
                You have unsaved changes. Remember to save your settings.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4 md:space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 min-w-[350px] gap-1 h-auto p-1 sm:min-w-0">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value} 
                  className="flex flex-col items-center space-y-1 px-1 py-2 min-h-[60px] sm:flex-row sm:space-x-2 sm:space-y-0 sm:px-3 sm:py-2 sm:min-h-[40px] text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate text-[10px] sm:text-xs leading-tight">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {settingsTabs.map((tab) => {
          const Component = tab.component;
          return (
            <TabsContent key={tab.value} value={tab.value} className="space-y-3 sm:space-y-4 md:space-y-6 mt-3 sm:mt-4">
              <Component />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}