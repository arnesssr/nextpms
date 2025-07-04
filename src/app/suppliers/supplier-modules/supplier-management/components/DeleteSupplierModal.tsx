'use client';

import React from 'react';
import { Supplier } from '../types/suppliers.types';

interface DeleteSupplierModalProps {
  supplier: Supplier;
  open: boolean;
  onClose: () => void;
}

export const DeleteSupplierModal: React.FC<DeleteSupplierModalProps> = ({ supplier, open, onClose }) => {
  // Placeholder component
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold mb-4 text-red-600">Delete Supplier</h2>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete {supplier.companyName}? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
