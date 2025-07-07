import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/components/theme-provider';
import { Sun, Moon, Laptop, Check, Palette, Layout, Layers, Type } from 'lucide-react';

const AppearanceSettingsForm: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [fontSizePreference, setFontSizePreference] = useState('medium');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [borderRadius, setBorderRadius] = useState('medium');
  const [compactMode, setCompactMode] = useState(false);

  // Theme options with icons
  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Light mode with bright background and dark text' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark mode with dark background and light text' },
    { value: 'system', label: 'System', icon: Laptop, description: 'Follow your system preferences' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Choose your preferred color theme for the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div 
                  key={option.value}
                  className={`relative flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${theme === option.value ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => setTheme(option.value)}
                >
                  {theme === option.value && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`p-3 rounded-full ${theme === option.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">{option.description}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch 
              id="high-contrast" 
              checked={highContrastMode}
              onCheckedChange={setHighContrastMode}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout & Typography</CardTitle>
          <CardDescription>
            Customize the layout and text appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Font Size</Label>
            <RadioGroup 
              value={fontSizePreference} 
              onValueChange={setFontSizePreference}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              <div className={`flex items-center space-x-2 border rounded-md p-3 ${fontSizePreference === 'small' ? 'border-primary' : 'border-border'}`}>
                <RadioGroupItem value="small" id="font-small" />
                <Label htmlFor="font-small" className="flex-1 cursor-pointer">
                  <span className="text-sm">Small</span>
                </Label>
              </div>
              <div className={`flex items-center space-x-2 border rounded-md p-3 ${fontSizePreference === 'medium' ? 'border-primary' : 'border-border'}`}>
                <RadioGroupItem value="medium" id="font-medium" />
                <Label htmlFor="font-medium" className="flex-1 cursor-pointer">
                  <span className="text-base">Medium</span>
                </Label>
              </div>
              <div className={`flex items-center space-x-2 border rounded-md p-3 ${fontSizePreference === 'large' ? 'border-primary' : 'border-border'}`}>
                <RadioGroupItem value="large" id="font-large" />
                <Label htmlFor="font-large" className="flex-1 cursor-pointer">
                  <span className="text-lg">Large</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Border Radius</Label>
            <Select value={borderRadius} onValueChange={setBorderRadius}>
              <SelectTrigger>
                <SelectValue placeholder="Select border radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing for a more compact layout
              </p>
            </div>
            <Switch 
              id="compact-mode" 
              checked={compactMode}
              onCheckedChange={setCompactMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">Interface Animations</Label>
              <p className="text-sm text-muted-foreground">
                Enable smooth transitions and animations
              </p>
            </div>
            <Switch 
              id="animations" 
              checked={animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See how your settings will look
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`border rounded-lg p-4 ${theme === 'dark' ? 'bg-card text-card-foreground' : 'bg-background text-foreground'}`}>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Sample Content</h3>
              </div>
              
              <p className="text-sm text-muted-foreground">
                This is a preview of how your content will appear with the selected theme and layout settings.
              </p>
              
              <div className="flex space-x-2">
                <Button size="sm" variant="default">Primary Button</Button>
                <Button size="sm" variant="outline">Secondary Button</Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="border rounded p-2">
                  <p className="text-xs font-medium">Card Example</p>
                  <p className="text-xs text-muted-foreground">Sample card content</p>
                </div>
                <div className="border rounded p-2">
                  <p className="text-xs font-medium">Card Example</p>
                  <p className="text-xs text-muted-foreground">Sample card content</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          Reset to Defaults
        </Button>
        <Button>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AppearanceSettingsForm;