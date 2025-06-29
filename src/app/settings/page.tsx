'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/Sidebar';
import { ProfileSettings } from '@/components/forms/ProfileSettings';
import { SecuritySettings } from '@/components/forms/SecuritySettings';
import { NotificationSettings } from '@/components/forms/NotificationSettings';
import IntegrationSettings from '@/components/forms/IntegrationSettings';
import SystemSettings from '@/components/forms/SystemSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User,
  Shield,
  Bell,
  Settings as SettingsIcon,
  Database,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Download,
  Upload
} from 'lucide-react';

export default function SettingsPage() {
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
      description: 'Personal information and preferences',
      component: ProfileSettings
    },
    {
      value: 'security',
      label: 'Security',
      icon: Shield,
      description: 'Password, 2FA, and access controls',
      component: SecuritySettings
    },
    {
      value: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Email and push notification preferences',
      component: NotificationSettings
    },
    {
      value: 'integrations',
      label: 'Integrations',
      icon: Database,
      description: 'Connected services and API settings',
      component: IntegrationSettings
    },
    {
      value: 'system',
      label: 'System',
      icon: SettingsIcon,
      description: 'Application and performance settings',
      component: SystemSettings
    }
  ];

  return (
    <SidebarLayout>
      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4 md:space-y-6 md:p-6">
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
            <TabsList className="grid w-full grid-cols-5 min-w-[350px] gap-1 h-auto p-1 sm:min-w-0">
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
                <Card>
                  <CardHeader className="space-y-2 p-3 sm:p-4 md:p-6 pb-3 sm:pb-4">
                    <div className="flex items-center space-x-2">
                      <tab.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <CardTitle className="text-base sm:text-lg md:text-xl">{tab.label} Settings</CardTitle>
                    </div>
                    <CardDescription className="text-xs sm:text-sm">{tab.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 md:px-6 md:pb-6">
                    <Component onSettingsChange={() => setHasUnsavedChanges(true)} />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* System Status */}
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base md:text-lg">System Status</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Current system health and connection status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:px-6 md:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <div className="flex items-center space-x-2 p-2 sm:p-3 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">Database Connected</span>
              </div>
              <div className="flex items-center space-x-2 p-2 sm:p-3 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">API Services</span>
              </div>
              <div className="flex items-center space-x-2 p-2 sm:p-3 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">WebSocket Active</span>
              </div>
              <div className="flex items-center space-x-2 p-2 sm:p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">Cache Warming</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base md:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:px-6 md:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <Button variant="outline" className="justify-start h-auto py-2 px-3 sm:py-3 sm:px-4" size="sm">
                <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Clear Cache</span>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-2 px-3 sm:py-3 sm:px-4" size="sm">
                <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Export Data</span>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-2 px-3 sm:py-3 sm:px-4" size="sm">
                <Database className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Backup Settings</span>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-2 px-3 sm:py-3 sm:px-4" size="sm">
                <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Test Connections</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
