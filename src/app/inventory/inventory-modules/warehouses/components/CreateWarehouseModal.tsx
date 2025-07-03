'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useWarehouses } from '../hooks/useWarehouses';
import { CreateWarehouseRequest } from '../types/warehouse.types';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface CreateWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (warehouse: any) => void;
}

export function CreateWarehouseModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateWarehouseModalProps) {
  const { createWarehouse, loading, error } = useWarehouses();
  const [formData, setFormData] = useState<Partial<CreateWarehouseRequest>>({
    name: '',
    code: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    contactInfo: {
      phone: '',
      email: '',
      manager: ''
    },
    isActive: true,
    isDefault: false,
    capacity: {
      maxItems: undefined,
      maxVolume: undefined,
      maxWeight: undefined
    }
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSubmitError(null);
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address!,
        [field]: value
      }
    }));
    setSubmitError(null);
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo!,
        [field]: value
      }
    }));
    setSubmitError(null);
  };

  const handleCapacityChange = (field: string, value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    setFormData(prev => ({
      ...prev,
      capacity: {
        ...prev.capacity!,
        [field]: numValue
      }
    }));
    setSubmitError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.name?.trim()) {
      return 'Warehouse name is required';
    }
    if (!formData.code?.trim()) {
      return 'Warehouse code is required';
    }
    if (formData.code && formData.code.length < 2) {
      return 'Warehouse code must be at least 2 characters';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    try {
      const warehouseData: CreateWarehouseRequest = {
        name: formData.name!.trim(),
        code: formData.code!.trim().toUpperCase(),
        description: formData.description?.trim(),
        address: formData.address!,
        contactInfo: formData.contactInfo!,
        isActive: formData.isActive ?? true,
        isDefault: formData.isDefault ?? false,
        capacity: formData.capacity
      };

      const newWarehouse = await createWarehouse(warehouseData);
      
      if (newWarehouse) {
        setSubmitSuccess(true);
        onSuccess?.(newWarehouse);
        
        // Close modal after short success display
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Error creating warehouse:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to create warehouse');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        code: '',
        description: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US'
        },
        contactInfo: {
          phone: '',
          email: '',
          manager: ''
        },
        isActive: true,
        isDefault: false,
        capacity: {
          maxItems: undefined,
          maxVolume: undefined,
          maxWeight: undefined
        }
      });
      setSubmitError(null);
      setSubmitSuccess(false);
      onClose();
    }
  };

  if (submitSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Warehouse Created Successfully!
            </h3>
            <p className="text-sm text-gray-600 text-center">
              {formData.name} has been added to your warehouses.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span>Create New Warehouse</span>
          </DialogTitle>
          <DialogDescription>
            Add a new warehouse location to your inventory system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Warehouse Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Warehouse"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Warehouse Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., MAIN, WH1"
                    value={formData.code || ''}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    disabled={loading}
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description of the warehouse"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={loading}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  placeholder="123 Main Street"
                  value={formData.address?.street || ''}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={formData.address?.city || ''}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="NY"
                    value={formData.address?.state || ''}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="10001"
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="US"
                    value={formData.address?.country || 'US'}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>Phone</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.contactInfo?.phone || ''}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>Email</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="warehouse@company.com"
                    value={formData.contactInfo?.email || ''}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  placeholder="John Doe"
                  value={formData.contactInfo?.manager || ''}
                  onChange={(e) => handleContactChange('manager', e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Capacity & Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Capacity & Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxItems">Max Items</Label>
                  <Input
                    id="maxItems"
                    type="number"
                    placeholder="1000"
                    value={formData.capacity?.maxItems || ''}
                    onChange={(e) => handleCapacityChange('maxItems', e.target.value)}
                    disabled={loading}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxVolume">Max Volume (m³)</Label>
                  <Input
                    id="maxVolume"
                    type="number"
                    step="0.1"
                    placeholder="100.0"
                    value={formData.capacity?.maxVolume || ''}
                    onChange={(e) => handleCapacityChange('maxVolume', e.target.value)}
                    disabled={loading}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxWeight">Max Weight (kg)</Label>
                  <Input
                    id="maxWeight"
                    type="number"
                    step="0.1"
                    placeholder="1000.0"
                    value={formData.capacity?.maxWeight || ''}
                    onChange={(e) => handleCapacityChange('maxWeight', e.target.value)}
                    disabled={loading}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-xs text-gray-500">
                    Enable this warehouse for inventory operations
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive ?? true}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isDefault">Set as Default</Label>
                  <p className="text-xs text-gray-500">
                    Make this the default warehouse for new inventory
                  </p>
                </div>
                <Switch
                  id="isDefault"
                  checked={formData.isDefault ?? false}
                  onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {(submitError || error) && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{submitError || error}</span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name?.trim() || !formData.code?.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Create Warehouse
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
