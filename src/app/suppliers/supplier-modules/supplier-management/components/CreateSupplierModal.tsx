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
    // Basic validation
    if (!form.name.trim() || !form.companyName.trim() || !form.email.trim() || !form.phone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSupplier(form);
      // Success feedback
      console.log('Supplier created successfully');
      
      // Reset form
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
      
      onClose();
    } catch (error) {
      console.error('Error creating supplier:', error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Failed to create supplier');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Supplier</DialogTitle>
          <DialogDescription>
            Add a new supplier to your database. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="companyName" className="text-right">
              Company
            </Label>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="col-span-3"
            />
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

