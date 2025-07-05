import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';

const NotificationSettingsForm: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Configure which emails you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <Label htmlFor="all-emails">All Email Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Master toggle for all email notifications
              </p>
            </div>
            <Switch id="all-emails" defaultChecked />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="account-emails">Account Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Security alerts and account changes
                </p>
              </div>
              <Switch id="account-emails" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails">Marketing</Label>
                <p className="text-sm text-muted-foreground">
                  New features, promotions, and newsletters
                </p>
              </div>
              <Switch id="marketing-emails" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order-emails">Orders & Invoices</Label>
                <p className="text-sm text-muted-foreground">
                  Order confirmations, updates, and invoices
                </p>
              </div>
              <Switch id="order-emails" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminder-emails">Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Task deadlines and appointment reminders
                </p>
              </div>
              <Switch id="reminder-emails" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="comment-emails">Comments & Mentions</Label>
                <p className="text-sm text-muted-foreground">
                  When someone comments or mentions you
                </p>
              </div>
              <Switch id="comment-emails" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Configure notifications on your devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <Smartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                <Label htmlFor="all-push">All Push Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Master toggle for all push notifications
              </p>
            </div>
            <Switch id="all-push" defaultChecked />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order-push">Orders & Payments</Label>
                <p className="text-sm text-muted-foreground">
                  New orders, payment confirmations
                </p>
              </div>
              <Switch id="order-push" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="inventory-push">Inventory Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Low stock, out of stock notifications
                </p>
              </div>
              <Switch id="inventory-push" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="message-push">Messages</Label>
                <p className="text-sm text-muted-foreground">
                  New messages from customers or team
                </p>
              </div>
              <Switch id="message-push" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="comment-push">Comments & Mentions</Label>
                <p className="text-sm text-muted-foreground">
                  When someone comments or mentions you
                </p>
              </div>
              <Switch id="comment-push" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>In-App Notifications</CardTitle>
          <CardDescription>
            Configure notifications within the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                <Label htmlFor="all-inapp">All In-App Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Master toggle for all in-app notifications
              </p>
            </div>
            <Switch id="all-inapp" defaultChecked />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="task-inapp">Task Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Task assignments, status changes
                </p>
              </div>
              <Switch id="task-inapp" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="message-inapp">Messages</Label>
                <p className="text-sm text-muted-foreground">
                  New messages and chat notifications
                </p>
              </div>
              <Switch id="message-inapp" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-inapp">System Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  System updates and maintenance alerts
                </p>
              </div>
              <Switch id="system-inapp" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="comment-inapp">Comments & Mentions</Label>
                <p className="text-sm text-muted-foreground">
                  When someone comments or mentions you
                </p>
              </div>
              <Switch id="comment-inapp" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Additional notification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notification-sound">Notification Sound</Label>
            <Select defaultValue="default">
              <SelectTrigger id="notification-sound">
                <SelectValue placeholder="Select sound" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="chime">Chime</SelectItem>
                <SelectItem value="bell">Bell</SelectItem>
                <SelectItem value="ping">Ping</SelectItem>
                <SelectItem value="none">None (Silent)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-frequency">Notification Frequency</Label>
            <Select defaultValue="realtime">
              <SelectTrigger id="notification-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="do-not-disturb">Do Not Disturb</Label>
              <p className="text-sm text-muted-foreground">
                Temporarily pause all notifications
              </p>
            </div>
            <Switch id="do-not-disturb" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="quiet-hours">Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                Silence notifications during specific hours
              </p>
            </div>
            <Switch id="quiet-hours" />
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

export default NotificationSettingsForm;