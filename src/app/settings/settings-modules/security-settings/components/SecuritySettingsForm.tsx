import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Key, Shield, Smartphone } from 'lucide-react';

const SecuritySettingsForm: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Update your password and secure your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter your new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long and include a mix of letters, numbers, and special characters.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button className="w-full sm:w-auto">
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <Smartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                <Label htmlFor="enable-2fa">Enable Two-Factor Authentication</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Require a verification code when signing in
              </p>
            </div>
            <Switch id="enable-2fa" />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Two-Factor Method</Label>
            <Select defaultValue="app">
              <SelectTrigger>
                <SelectValue placeholder="Select authentication method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="app">Authenticator App</SelectItem>
                <SelectItem value="sms">SMS Text Message</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="security-key">Security Key</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="w-full sm:w-auto">
            <Key className="h-4 w-4 mr-2" />
            Setup Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login Sessions</CardTitle>
          <CardDescription>
            Manage your active sessions and devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-start p-3 border rounded-md">
              <div>
                <p className="font-medium">Chrome on Windows</p>
                <p className="text-sm text-muted-foreground">Current session</p>
                <p className="text-xs text-muted-foreground mt-1">Last active: Just now</p>
                <p className="text-xs text-muted-foreground">IP: 192.168.1.1</p>
              </div>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                Terminate
              </Button>
            </div>

            <div className="flex justify-between items-start p-3 border rounded-md">
              <div>
                <p className="font-medium">Safari on macOS</p>
                <p className="text-xs text-muted-foreground mt-1">Last active: 2 days ago</p>
                <p className="text-xs text-muted-foreground">IP: 192.168.1.2</p>
              </div>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                Terminate
              </Button>
            </div>

            <div className="flex justify-between items-start p-3 border rounded-md">
              <div>
                <p className="font-medium">Mobile App on iPhone</p>
                <p className="text-xs text-muted-foreground mt-1">Last active: 5 days ago</p>
                <p className="text-xs text-muted-foreground">IP: 192.168.1.3</p>
              </div>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                Terminate
              </Button>
            </div>
          </div>

          <Button variant="outline" className="w-full sm:w-auto">
            <Shield className="h-4 w-4 mr-2" />
            Terminate All Other Sessions
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            Additional security settings for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="login-alerts">Login Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for new sign-ins
              </p>
            </div>
            <Switch id="login-alerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="suspicious-activity">Suspicious Activity Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about unusual account activity
              </p>
            </div>
            <Switch id="suspicious-activity" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="password-expiry">Password Expiry</Label>
              <p className="text-sm text-muted-foreground">
                Require password change every 90 days
              </p>
            </div>
            <Switch id="password-expiry" />
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

export default SecuritySettingsForm;