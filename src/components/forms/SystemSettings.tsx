import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    // Performance Settings
    enableCaching: true,
    enableCompression: true,
    maxConcurrentRequests: '10',
    requestTimeout: '30',
    
    // Application Settings
    enableMaintenance: false,
    enableDebugMode: false,
    logLevel: 'info',
    sessionTimeout: '60',
    
    // Storage Settings
    enableAutoBackup: true,
    backupFrequency: 'daily',
    maxStorageSize: '10',
    enableDataRetention: true,
    dataRetentionDays: '365',
    
    // System Monitoring
    enableHealthCheck: true,
    enablePerformanceMonitoring: true,
    enableErrorTracking: true,
    alertThreshold: '80'
  });

  const handleSwitchChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving system settings:', settings);
    // TODO: Implement actual save functionality
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      enableCaching: true,
      enableCompression: true,
      maxConcurrentRequests: '10',
      requestTimeout: '30',
      enableMaintenance: false,
      enableDebugMode: false,
      logLevel: 'info',
      sessionTimeout: '60',
      enableAutoBackup: true,
      backupFrequency: 'daily',
      maxStorageSize: '10',
      enableDataRetention: true,
      dataRetentionDays: '365',
      enableHealthCheck: true,
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      alertThreshold: '80'
    });
  };

  return (
    <div className="space-y-6">
      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Settings</CardTitle>
          <CardDescription>
            Configure system performance and optimization settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-caching">Enable Caching</Label>
              <p className="text-sm text-muted-foreground">
                Improve performance by caching frequently accessed data
              </p>
            </div>
            <Switch
              id="enable-caching"
              checked={settings.enableCaching}
              onCheckedChange={(checked) => handleSwitchChange('enableCaching', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-compression">Enable Compression</Label>
              <p className="text-sm text-muted-foreground">
                Compress responses to reduce bandwidth usage
              </p>
            </div>
            <Switch
              id="enable-compression"
              checked={settings.enableCompression}
              onCheckedChange={(checked) => handleSwitchChange('enableCompression', checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-requests">Max Concurrent Requests</Label>
              <Input
                id="max-requests"
                type="number"
                value={settings.maxConcurrentRequests}
                onChange={(e) => handleInputChange('maxConcurrentRequests', e.target.value)}
                min="1"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-timeout">Request Timeout (seconds)</Label>
              <Input
                id="request-timeout"
                type="number"
                value={settings.requestTimeout}
                onChange={(e) => handleInputChange('requestTimeout', e.target.value)}
                min="5"
                max="300"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            General application configuration and behavior settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable maintenance mode to restrict access
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={settings.enableMaintenance}
              onCheckedChange={(checked) => handleSwitchChange('enableMaintenance', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="debug-mode">Debug Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable detailed logging and debugging information
              </p>
            </div>
            <Switch
              id="debug-mode"
              checked={settings.enableDebugMode}
              onCheckedChange={(checked) => handleSwitchChange('enableDebugMode', checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="log-level">Log Level</Label>
              <Select value={settings.logLevel} onValueChange={(value) => handleInputChange('logLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="verbose">Verbose</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                min="5"
                max="480"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage & Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Storage & Backup</CardTitle>
          <CardDescription>
            Configure data storage, backup, and retention policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">Automatic Backup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically backup system data at regular intervals
              </p>
            </div>
            <Switch
              id="auto-backup"
              checked={settings.enableAutoBackup}
              onCheckedChange={(checked) => handleSwitchChange('enableAutoBackup', checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select value={settings.backupFrequency} onValueChange={(value) => handleInputChange('backupFrequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-storage">Max Storage Size (GB)</Label>
              <Input
                id="max-storage"
                type="number"
                value={settings.maxStorageSize}
                onChange={(e) => handleInputChange('maxStorageSize', e.target.value)}
                min="1"
                max="1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retention-days">Data Retention (days)</Label>
              <Input
                id="retention-days"
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) => handleInputChange('dataRetentionDays', e.target.value)}
                min="30"
                max="2555"
                disabled={!settings.enableDataRetention}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="data-retention">Enable Data Retention Policy</Label>
              <p className="text-sm text-muted-foreground">
                Automatically delete old data based on retention policy
              </p>
            </div>
            <Switch
              id="data-retention"
              checked={settings.enableDataRetention}
              onCheckedChange={(checked) => handleSwitchChange('enableDataRetention', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>System Monitoring</CardTitle>
          <CardDescription>
            Configure system monitoring and alerting settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="health-check">Health Check Monitoring</Label>
              <p className="text-sm text-muted-foreground">
                Monitor system health and availability
              </p>
            </div>
            <Switch
              id="health-check"
              checked={settings.enableHealthCheck}
              onCheckedChange={(checked) => handleSwitchChange('enableHealthCheck', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="performance-monitoring">Performance Monitoring</Label>
              <p className="text-sm text-muted-foreground">
                Track system performance metrics and usage statistics
              </p>
            </div>
            <Switch
              id="performance-monitoring"
              checked={settings.enablePerformanceMonitoring}
              onCheckedChange={(checked) => handleSwitchChange('enablePerformanceMonitoring', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="error-tracking">Error Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Automatically track and report system errors
              </p>
            </div>
            <Switch
              id="error-tracking"
              checked={settings.enableErrorTracking}
              onCheckedChange={(checked) => handleSwitchChange('enableErrorTracking', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="alert-threshold">Alert Threshold (%)</Label>
            <Input
              id="alert-threshold"
              type="number"
              value={settings.alertThreshold}
              onChange={(e) => handleInputChange('alertThreshold', e.target.value)}
              min="50"
              max="95"
              placeholder="CPU/Memory usage threshold for alerts"
            />
            <p className="text-sm text-muted-foreground">
              System will send alerts when CPU or memory usage exceeds this threshold
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default SystemSettings;
