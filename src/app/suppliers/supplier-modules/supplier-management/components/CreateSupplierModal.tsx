'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SupplierFormData } from '../types/suppliers.types';
import { useSuppliers } from '../hooks/useSuppliers';

interface CreateSupplierModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateSupplierModal: React.FC<CreateSupplierModalProps> = ({ open, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<SupplierFormData>({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    contactPerson: {
      name: '',
      title: '',
      email: '',
      phone: ''
    },
    businessType: 'manufacturer',
    supplierType: 'primary',
    paymentTerms: '',
    taxId: '',
    website: '',
    notes: ''
  });
  const { createSupplier } = useSuppliers();

  const handleChange = (field: keyof SupplierFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting) {
      console.log('⚠️ [CREATE_SUPPLIER_MODAL] Submission already in progress, ignoring...');
      return;
    }
    
    console.time('⏱️ [CREATE_SUPPLIER_MODAL] Total Submission Time');
    console.group('📝 [CREATE_SUPPLIER_MODAL] Submit Started');
    console.log('Form data:', form);
    
    // Basic validation
    if (!form.name.trim() || !form.companyName.trim() || !form.email.trim() || !form.phone.trim()) {
      console.error('Validation failed: Missing required fields');
      alert('Please fill in all required fields');
      console.groupEnd();
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('⚡ [CREATE_SUPPLIER_MODAL] Calling createSupplier service...');
      console.time('🕐 [CREATE_SUPPLIER_MODAL] Service Call Duration');
      
      const result = await createSupplier(form);
      
      console.timeEnd('🕐 [CREATE_SUPPLIER_MODAL] Service Call Duration');
      console.log('✅ [CREATE_SUPPLIER_MODAL] Supplier created successfully:', result);
      
      // Show success message
      console.log('🎉 [CREATE_SUPPLIER_MODAL] Showing success message');
      alert(`✅ Supplier "${form.companyName}" created successfully!`);
      
      // Reset form
      console.log('🔄 [CREATE_SUPPLIER_MODAL] Resetting form');
      setForm({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        contactPerson: {
          name: '',
          title: '',
          email: '',
          phone: ''
        },
        businessType: 'manufacturer',
        supplierType: 'primary',
        paymentTerms: '',
        taxId: '',
        website: '',
        notes: ''
      });
      
      console.log('🚪 [CREATE_SUPPLIER_MODAL] Closing modal');
      onClose();
    } catch (error) {
      console.error('❌ [CREATE_SUPPLIER_MODAL] Error creating supplier:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error
      });
      
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Failed to create supplier');
      }
    } finally {
      console.timeEnd('⏱️ [CREATE_SUPPLIER_MODAL] Total Submission Time');
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create Supplier</DialogTitle>
          <DialogDescription>
            Add a new supplier to your database. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="grid gap-6 py-4">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Company Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={form.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <select
                    id="businessType"
                    value={form.businessType}
                    onChange={(e) => handleChange('businessType', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="manufacturer">Manufacturer</option>
                    <option value="distributor">Distributor</option>
                    <option value="retailer">Retailer</option>
                    <option value="service_provider">Service Provider</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplierType">Supplier Type</Label>
                  <select
                    id="supplierType"
                    value={form.supplierType}
                    onChange={(e) => handleChange('supplierType', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="backup">Backup</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={form.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value)}
                    placeholder="Tax identification number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={form.paymentTerms}
                    onChange={(e) => handleChange('paymentTerms', e.target.value)}
                    placeholder="Net 30, Net 60, COD, etc."
                  />
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Primary Contact</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Primary contact person"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactTitle">Title</Label>
                  <Input
                    id="contactTitle"
                    value={form.contactPerson.title}
                    onChange={(e) => handleChange('contactPerson', { ...form.contactPerson, title: e.target.value })}
                    placeholder="Sales Manager, Account Rep, etc."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1-555-0123"
                  />
                </div>
              </div>
            </div>
            
            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Address</h3>
              
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={form.address.street}
                  onChange={(e) => handleChange('address', { ...form.address, street: e.target.value })}
                  placeholder="123 Business Street"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.address.city}
                    onChange={(e) => handleChange('address', { ...form.address, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={form.address.state}
                    onChange={(e) => handleChange('address', { ...form.address, state: e.target.value })}
                    placeholder="CA"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={form.address.zipCode}
                    onChange={(e) => handleChange('address', { ...form.address, zipCode: e.target.value })}
                    placeholder="12345"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.address.country}
                  onChange={(e) => handleChange('address', { ...form.address, country: e.target.value })}
                  placeholder="United States"
                />
              </div>
            </div>
            
            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any additional information about this supplier..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Supplier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

