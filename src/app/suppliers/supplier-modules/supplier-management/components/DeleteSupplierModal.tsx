'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSuppliers } from '../hooks/useSuppliers';
import { Supplier } from '../types/supplier';

interface DeleteSupplierModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteSupplierModal({
  supplier,
  isOpen,
  onClose,
  onSuccess,
}: DeleteSupplierModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteSupplier } = useSuppliers();

  const handleDelete = async () => {
    if (!supplier) return;

    setIsDeleting(true);
    try {
      await deleteSupplier(supplier.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete supplier:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">Delete Supplier</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isDeleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this supplier? This action cannot be undone.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-900">{supplier.name}</p>
            <p className="text-sm text-gray-600">{supplier.email}</p>
            <p className="text-sm text-gray-600">{supplier.phone}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Deleting...' : 'Delete Supplier'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Named export for easier importing
export { DeleteSupplierModal };
