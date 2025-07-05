import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Database, Download, HardDrive, RefreshCw, Trash2, Upload } from 'lucide-react';

const SystemSettingsForm: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            View and manage system details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Application Version</Label>
              <p className="font-medium">NextPMS v1.5.2</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Last Updated</Label>
              <p className="font-medium">June 15, 2023</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Database Version</Label>
              <p className="font-medium">MySQL 8.0.28</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Server Environment</Label>
              <p className="font-medium">Production</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Put the application in maintenance mode
              </p>
            </div>
            <Switch id="maintenance-mode" />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Updates
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
          <CardDescription>
            Configure system performance settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cache-enabled">Enable Caching</Label>
              <Switch id="cache-enabled" defaultChecked />
            </div>
            <p className="text-sm text-muted-foreground">
              Improve performance by caching frequently accessed data
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cache-duration">Cache Duration (minutes)</Label>
            <Input
              id="cache-duration"
              type="number"
              defaultValue="60"
              min="5"
              max="1440"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="pagination-limit">Default Pagination Limit</Label>
            <Select defaultValue="25">
              <SelectTrigger id="pagination-limit">
                <SelectValue placeholder="Select limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 items per page</SelectItem>
                <SelectItem value="25">25 items per page</SelectItem>
                <SelectItem value="50">50 items per page</SelectItem>
                <SelectItem value="100">100 items per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="image-compression">Image Compression</Label>
              <span className="text-sm font-medium">75%</span>
            </div>
            <Slider
              id="image-compression"
              defaultValue={[75]}
              max={100}
              step={5}
              className="py-2"
            />
            <p className="text-sm text-muted-foreground">
              Higher compression reduces image quality but improves loading speed
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="lazy-loading">Lazy Loading</Label>
              <p className="text-sm text-muted-foreground">
                Load images and content only when visible
              </p>
            </div>
            <Switch id="lazy-loading" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>
            Manage system backups and restoration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">Automatic Backups</Label>
              <p className="text-sm text-muted-foreground">
                Schedule regular system backups
              </p>
            </div>
            <Switch id="auto-backup" defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backup-frequency">Backup Frequency</Label>
            <Select defaultValue="daily">
              <SelectTrigger id="backup-frequency">
                <SelectValue placeholder="Select frequency" />
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
            <Label htmlFor="backup-retention">Backup Retention (days)</Label>
            <Input
              id="backup-retention"
              type="number"
              defaultValue="30"
              min="1"
              max="365"
            />
            <p className="text-sm text-muted-foreground">
              Number of days to keep backups before automatic deletion
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Recent Backups</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">Full Backup - 2023-06-15</p>
                  <p className="text-xs text-muted-foreground">Size: 256 MB</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Restore
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">Full Backup - 2023-06-14</p>
                  <p className="text-xs text-muted-foreground">Size: 255 MB</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Restore
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Backup
            </Button>
            <Button>
              <HardDrive className="h-4 w-4 mr-2" />
              Create Backup Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs & Monitoring</CardTitle>
          <CardDescription>
            Configure system logging and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="log-level">Log Level</Label>
            <Select defaultValue="info">
              <SelectTrigger id="log-level">
                <SelectValue placeholder="Select log level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Determines the verbosity of system logs
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="log-retention">Log Retention (days)</Label>
            <Input
              id="log-retention"
              type="number"
              defaultValue="14"
              min="1"
              max="90"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="error-reporting">Error Reporting</Label>
              <p className="text-sm text-muted-foreground">
                Automatically report errors to developers
              </p>
            </div>
            <Switch id="error-reporting" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="performance-monitoring">Performance Monitoring</Label>
              <p className="text-sm text-muted-foreground">
                Track system performance metrics
              </p>
            </div>
            <Switch id="performance-monitoring" defaultChecked />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Logs
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-amber-50 text-amber-800 border-b border-amber-100">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 mt-0.5 text-amber-600" />
            <div>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription className="text-amber-700">
                These actions are destructive and cannot be undone
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between p-3 border border-red-200 rounded-md bg-red-50">
            <div>
              <p className="font-medium text-red-800">Reset Application</p>
              <p className="text-sm text-red-600">
                Reset the application to its default state
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Reset
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border border-red-200 rounded-md bg-red-50">
            <div>
              <p className="font-medium text-red-800">Purge All Data</p>
              <p className="text-sm text-red-600">
                Delete all data from the system
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Purge Data
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border border-red-200 rounded-md bg-red-50">
            <div>
              <p className="font-medium text-red-800">Delete Account</p>
              <p className="text-sm text-red-600">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          Cancel
        </Button>
        <Button>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default SystemSettingsForm;