'use client'

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProductForm } from '@/components/forms/ProductForm';
import { Product, CreateProductData } from '@/types/products';

interface AddProductModalProps {
  onProductCreated?: (product: Product) => void;
  trigger?: React.ReactNode;
}

export default function AddProductModal({ onProductCreated, trigger }: AddProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = (product: Product) => {
    setIsOpen(false);
    onProductCreated?.(product);
  };

  const defaultTrigger = (
    <Button onClick={() => setIsOpen(true)} className="gap-2">
      <Plus className="h-4 w-4" />
      Add Product
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        defaultTrigger
      )}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product by filling out the information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <ProductForm
              onSuccess={handleSuccess}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
