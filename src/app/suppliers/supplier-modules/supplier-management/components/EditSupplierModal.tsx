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
import { Supplier, SupplierFormData } from '../types/suppliers.types';
import { useSuppliers } from '../hooks/useSuppliers';

interface EditSupplierModalProps {
  supplier: Supplier;
  open: boolean;
  onClose: () => void;
}

export const EditSupplierModal: React.FC<EditSupplierModalProps> = ({ supplier, open, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<SupplierFormData>({
    name: supplier.name,
    companyName: supplier.companyName,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    contactPerson: supplier.contactPerson,
    businessType: supplier.businessType,
    supplierType: supplier.supplierType,
    paymentTerms: supplier.paymentTerms,
    taxId: supplier.taxId,
    website: supplier.website || '',
    notes: supplier.notes || ''
  });
  
  const { updateSupplier } = useSuppliers();

  const handleChange = (field: keyof SupplierFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // Basic validation
    if (!form.name.trim() || !form.companyName.trim() || !form.email.trim() || !form.phone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSupplier(supplier.id, form);
      alert(`✅ Supplier "${form.companyName}" updated successfully!`);
      onClose();
    } catch (error) {
      console.error('Error updating supplier:', error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Failed to update supplier');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Supplier</DialogTitle>
          <DialogDescription>
            Update supplier information for {supplier.companyName}.
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visual:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="backup">Backup</option>
                  </select>
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
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1-555-0123"
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
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Supplier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
