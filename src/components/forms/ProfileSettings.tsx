'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Camera, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Globe,
  Building
} from 'lucide-react';

// Form validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  bio: z.string().optional(),
  timezone: z.string(),
  language: z.string(),
  publicProfile: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSettingsProps {
  onSettingsChange: () => void;
}

export function ProfileSettings({ onSettingsChange }: ProfileSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('https://via.placeholder.com/100x100');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      company: 'Acme Corp',
      jobTitle: 'Product Manager',
      bio: 'Experienced product manager with a passion for building great user experiences.',
      timezone: 'America/New_York',
      language: 'en',
      publicProfile: true,
    }
  });

  const watchedValues = watch();

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual API call
      console.log('Saving profile:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement file upload
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      onSettingsChange();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      {/* Profile Picture */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Profile Picture</CardTitle>
          <CardDescription className="text-sm">
            Upload a profile picture to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Avatar className="h-24 w-24 sm:h-20 sm:w-20">
              <AvatarImage src={avatarUrl} alt="Profile picture" />
              <AvatarFallback className="text-lg">
                {watchedValues.firstName?.[0]}{watchedValues.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left w-full sm:w-auto">
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <label htmlFor="avatar">
                <Button type="button" variant="outline" asChild className="w-full sm:w-auto h-12 sm:h-10">
                  <span className="cursor-pointer">
                    <Camera className="mr-2 h-4 w-4" />
                    Change Picture
                  </span>
                </Button>
              </label>
              <p className="text-sm text-muted-foreground mt-2">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
          <CardDescription className="text-sm">
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                className="h-12 sm:h-10"
                onChange={(e) => {
                  register('firstName').onChange(e);
                  onSettingsChange();
                }}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                className="h-12 sm:h-10"
                onChange={(e) => {
                  register('lastName').onChange(e);
                  onSettingsChange();
                }}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="pl-10 h-12 sm:h-10"
                onChange={(e) => {
                  register('email').onChange(e);
                  onSettingsChange();
                }}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                {...register('phone')}
                className="pl-10 h-12 sm:h-10"
                onChange={(e) => {
                  register('phone').onChange(e);
                  onSettingsChange();
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Professional Information</CardTitle>
          <CardDescription className="text-sm">
            Add your work details and professional background
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">Company</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="company"
                  {...register('company')}
                  className="pl-10 h-12 sm:h-10"
                  onChange={(e) => {
                    register('company').onChange(e);
                    onSettingsChange();
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-sm font-medium">Job Title</Label>
              <Input
                id="jobTitle"
                {...register('jobTitle')}
                className="h-12 sm:h-10"
                onChange={(e) => {
                  register('jobTitle').onChange(e);
                  onSettingsChange();
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              rows={4}
              placeholder="Tell us a bit about yourself..."
              className="min-h-[100px] resize-none"
              onChange={(e) => {
                register('bio').onChange(e);
                onSettingsChange();
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Preferences</CardTitle>
          <CardDescription className="text-sm">
            Customize your experience and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
              <Select 
                value={watchedValues.timezone} 
                onValueChange={(value) => {
                  setValue('timezone', value);
                  onSettingsChange();
                }}
              >
                <SelectTrigger className="h-12 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">GMT</SelectItem>
                  <SelectItem value="Europe/Paris">CET</SelectItem>
                  <SelectItem value="Asia/Tokyo">JST</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium">Language</Label>
              <Select 
                value={watchedValues.language} 
                onValueChange={(value) => {
                  setValue('language', value);
                  onSettingsChange();
                }}
              >
                <SelectTrigger className="h-12 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 py-3">
            <div className="flex-1">
              <Label htmlFor="publicProfile" className="text-sm font-medium cursor-pointer">Public Profile</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Make your profile visible to other users
              </p>
            </div>
            <Switch
              id="publicProfile"
              checked={watchedValues.publicProfile}
              className="ml-auto"
              onCheckedChange={(checked) => {
                setValue('publicProfile', checked);
                onSettingsChange();
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button 
          type="submit" 
          disabled={isSubmitting || !isDirty}
          className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
