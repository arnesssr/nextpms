'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageCircle,
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  Clock,
  Users
} from 'lucide-react';

interface NotificationSettingsProps {
  onSettingsChange: () => void;
}

export function NotificationSettings({ onSettingsChange }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    // Email Notifications
    orderUpdates: true,
    inventoryAlerts: true,
    lowStockWarnings: true,
    productPublished: false,
    dailyReports: true,
    weeklyReports: true,
    securityAlerts: true,
    
    // Push Notifications
    pushOrderUpdates: true,
    pushInventoryAlerts: true,
    pushLowStock: true,
    pushSecurityAlerts: true,
    
    // Notification Timing
    quietHoursEnabled: true,
    quietStart: '22:00',
    quietEnd: '08:00',
    weekendNotifications: false,
    
    // Delivery Method
    emailFrequency: 'immediate',
    pushFrequency: 'immediate',
    summaryFrequency: 'daily',
  });

  const handleToggle = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    onSettingsChange();
  };

  const handleSelectChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    onSettingsChange();
  };

  const notificationCategories = [
    {
      title: 'Order Management',
      icon: ShoppingCart,
      description: 'Notifications about order status and customer activities',
      settings: [
        {
          key: 'orderUpdates',
          label: 'Order Status Updates',
          description: 'Get notified when orders change status',
          emailKey: 'orderUpdates',
          pushKey: 'pushOrderUpdates'
        }
      ]
    },
    {
      title: 'Inventory Management',
      icon: Package,
      description: 'Stock levels, low inventory, and product alerts',
      settings: [
        {
          key: 'inventoryAlerts',
          label: 'Inventory Changes',
          description: 'Stock adjustments and inventory movements',
          emailKey: 'inventoryAlerts',
          pushKey: 'pushInventoryAlerts'
        },
        {
          key: 'lowStockWarnings',
          label: 'Low Stock Warnings',
          description: 'When products fall below minimum thresholds',
          emailKey: 'lowStockWarnings',
          pushKey: 'pushLowStock'
        }
      ]
    },
    {
      title: 'Product Management',
      icon: TrendingUp,
      description: 'Product updates, publishing, and performance',
      settings: [
        {
          key: 'productPublished',
          label: 'Product Published',
          description: 'When products are successfully published',
          emailKey: 'productPublished',
          pushKey: null
        }
      ]
    },
    {
      title: 'Security & Account',
      icon: AlertTriangle,
      description: 'Security alerts and account changes',
      settings: [
        {
          key: 'securityAlerts',
          label: 'Security Alerts',
          description: 'Login attempts, password changes, and security events',
          emailKey: 'securityAlerts',
          pushKey: 'pushSecurityAlerts'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Notification Categories */}
      {notificationCategories.map((category) => {
        const Icon = category.icon;
        return (
          <Card key={category.title}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5" />
                <CardTitle className="text-lg">{category.title}</CardTitle>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.settings.map((setting) => (
                <div key={setting.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{setting.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 ml-4">
                    {/* Email Toggle */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <Switch
                        checked={settings[setting.emailKey as keyof typeof settings] as boolean}
                        onCheckedChange={(checked) => handleToggle(setting.emailKey, checked)}
                      />
                    </div>
                    
                    {/* Push Toggle */}
                    {setting.pushKey && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Push</span>
                        </div>
                        <Switch
                          checked={settings[setting.pushKey as keyof typeof settings] as boolean}
                          onCheckedChange={(checked) => handleToggle(setting.pushKey!, checked)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Reports & Summaries */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle className="text-lg">Reports & Summaries</CardTitle>
          </div>
          <CardDescription>
            Automated reports and periodic summaries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Daily Reports</Label>
                <p className="text-sm text-muted-foreground">Daily business summary</p>
              </div>
              <Switch
                checked={settings.dailyReports}
                onCheckedChange={(checked) => handleToggle('dailyReports', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Weekly analytics digest</p>
              </div>
              <Switch
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => handleToggle('weeklyReports', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Summary Frequency</Label>
            <Select 
              value={settings.summaryFrequency} 
              onValueChange={(value) => handleSelectChange('summaryFrequency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <CardTitle className="text-lg">Delivery Preferences</CardTitle>
          </div>
          <CardDescription>
            Control when and how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email Frequency</Label>
              <Select 
                value={settings.emailFrequency} 
                onValueChange={(value) => handleSelectChange('emailFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Push Frequency</Label>
              <Select 
                value={settings.pushFrequency} 
                onValueChange={(value) => handleSelectChange('pushFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg">Quiet Hours</CardTitle>
          </div>
          <CardDescription>
            Set specific times when you don't want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                Pause non-urgent notifications during specified hours
              </p>
            </div>
            <Switch
              checked={settings.quietHoursEnabled}
              onCheckedChange={(checked) => handleToggle('quietHoursEnabled', checked)}
            />
          </div>

          {settings.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select 
                  value={settings.quietStart} 
                  onValueChange={(value) => handleSelectChange('quietStart', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Select 
                  value={settings.quietEnd} 
                  onValueChange={(value) => handleSelectChange('quietEnd', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>Weekend Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications on weekends
              </p>
            </div>
            <Switch
              checked={settings.weekendNotifications}
              onCheckedChange={(checked) => handleToggle('weekendNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Notifications</CardTitle>
          <CardDescription>
            Send test notifications to verify your settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Test Email
            </Button>
            <Button variant="outline">
              <Smartphone className="mr-2 h-4 w-4" />
              Test Push
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
