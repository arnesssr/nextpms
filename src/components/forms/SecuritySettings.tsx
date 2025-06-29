'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Monitor,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Download
} from 'lucide-react';

interface SecuritySettingsProps {
  onSettingsChange: () => void;
}

export function SecuritySettings({ onSettingsChange }: SecuritySettingsProps) {
  const [settings, setSettings] = useState({
    twoFactorEnabled: true,
    loginNotifications: true,
    sessionTimeout: '4h',
    passwordExpiryDays: 90,
    requirePasswordChange: false,
    allowMultipleSessions: true,
    trustedDevicesEnabled: true,
    auditLogRetention: '1y',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    onSettingsChange();
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Mock active sessions data
  const activeSessions = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, US',
      ip: '192.168.1.100',
      lastActive: '2 minutes ago',
      current: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, US',
      ip: '192.168.1.101',
      lastActive: '1 hour ago',
      current: false,
    },
    {
      id: '3',
      device: 'Firefox on MacOS',
      location: 'New York, US',
      ip: '192.168.1.102',
      lastActive: '3 days ago',
      current: false,
    },
  ];

  // Mock recent security events
  const securityEvents = [
    {
      id: '1',
      type: 'login_success',
      description: 'Successful login from Chrome on Windows',
      timestamp: '2024-01-15 09:30:15',
      ip: '192.168.1.100',
      status: 'success',
    },
    {
      id: '2',
      type: 'password_changed',
      description: 'Password successfully changed',
      timestamp: '2024-01-14 14:22:30',
      ip: '192.168.1.100',
      status: 'success',
    },
    {
      id: '3',
      type: 'failed_login',
      description: 'Failed login attempt - incorrect password',
      timestamp: '2024-01-13 08:15:45',
      ip: '203.0.113.1',
      status: 'warning',
    },
    {
      id: '4',
      type: '2fa_enabled',
      description: 'Two-factor authentication enabled',
      timestamp: '2024-01-12 16:45:20',
      ip: '192.168.1.100',
      status: 'success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <CardTitle className="text-lg">Password Management</CardTitle>
          </div>
          <CardDescription>
            Change your password and configure password policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => handlePasswordChange('current', e.target.value)}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => handlePasswordChange('new', e.target.value)}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button>Update Password</Button>
            <Button variant="outline">Generate Strong Password</Button>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label>Password Expiry</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically expire passwords after specified days
                </p>
              </div>
              <Select 
                value={settings.passwordExpiryDays.toString()} 
                onValueChange={(value) => handleSettingChange('passwordExpiryDays', parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="0">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require a verification code in addition to your password
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.twoFactorEnabled && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Enabled
                </Badge>
              )}
              <Switch
                checked={settings.twoFactorEnabled}
                onCheckedChange={(checked) => handleSettingChange('twoFactorEnabled', checked)}
              />
            </div>
          </div>

          {settings.twoFactorEnabled && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4" />
                <span className="font-medium">Authenticator App</span>
                <Badge variant="outline">Primary</Badge>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  View Backup Codes
                </Button>
                <Button variant="outline" size="sm">
                  Regenerate Codes
                </Button>
                <Button variant="outline" size="sm">
                  Reconfigure App
                </Button>
              </div>
            </div>
          )}

          {!settings.twoFactorEnabled && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is disabled. Enable it for better security.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <CardTitle className="text-lg">Session Management</CardTitle>
          </div>
          <CardDescription>
            Manage your active sessions and login preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Login Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified of new logins
                </p>
              </div>
              <Switch
                checked={settings.loginNotifications}
                onCheckedChange={(checked) => handleSettingChange('loginNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Multiple Sessions</Label>
                <p className="text-sm text-muted-foreground">
                  Allow multiple active sessions
                </p>
              </div>
              <Switch
                checked={settings.allowMultipleSessions}
                onCheckedChange={(checked) => handleSettingChange('allowMultipleSessions', checked)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Session Timeout</Label>
              <p className="text-sm text-muted-foreground">
                Automatically log out after inactivity
              </p>
            </div>
            <Select 
              value={settings.sessionTimeout} 
              onValueChange={(value) => handleSettingChange('sessionTimeout', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30m">30 minutes</SelectItem>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="4h">4 hours</SelectItem>
                <SelectItem value="8h">8 hours</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Active Sessions</h4>
              <Button variant="outline" size="sm">
                <XCircle className="mr-2 h-4 w-4" />
                End All Sessions
              </Button>
            </div>

            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    <Monitor className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{session.device}</span>
                        {session.current && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {session.location}
                        </span>
                        <span>{session.ip}</span>
                        <span className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {session.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="outline" size="sm">
                      End Session
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Audit Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle className="text-lg">Security Audit Log</CardTitle>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Log
            </Button>
          </div>
          <CardDescription>
            Monitor security events and access attempts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Log Retention Period</Label>
              <p className="text-sm text-muted-foreground">
                How long to keep security audit logs
              </p>
            </div>
            <Select 
              value={settings.auditLogRetention} 
              onValueChange={(value) => handleSettingChange('auditLogRetention', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 months</SelectItem>
                <SelectItem value="6m">6 months</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
                <SelectItem value="2y">2 years</SelectItem>
                <SelectItem value="forever">Forever</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-4">Recent Security Events</h4>
            <div className="space-y-2">
              {securityEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {event.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {event.status === 'warning' && (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{event.description}</div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {event.timestamp}
                        </span>
                        <span>{event.ip}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={event.status === 'success' ? 'secondary' : 'outline'}
                    className={
                      event.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : event.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : ''
                    }
                  >
                    {event.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
