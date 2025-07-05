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
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Supplier } from '../types/suppliers.types';
import { useSuppliers } from '../hooks/useSuppliers';

interface DeleteSupplierModalProps {
  supplier: Supplier;
  open: boolean;
  onClose: () => void;
}

export const DeleteSupplierModal: React.FC<DeleteSupplierModalProps> = ({ supplier, open, onClose }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteSupplier } = useSuppliers();

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteSupplier(supplier.id);
      alert(`✅ Supplier "${supplier.companyName}" deleted successfully!`);
      onClose();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Failed to delete supplier');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-red-600">Delete Supplier</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{supplier.companyName}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This will permanently remove the supplier and all associated data from your system.
          </p>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Supplier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
