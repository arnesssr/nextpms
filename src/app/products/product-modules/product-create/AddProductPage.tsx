'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProductForm } from '@/components/forms/ProductForm';
import { Product } from '@/types/products';

interface AddProductPageProps {
  onProductCreated?: (product: Product) => void;
}

export default function AddProductPage({ onProductCreated }: AddProductPageProps) {
  const router = useRouter();

  const handleSuccess = (product: Product) => {
    onProductCreated?.(product);
    // Navigate back to products list or to the newly created product
    router.push(`/products/${product.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCancel}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product by filling out the information below.
          </p>
        </div>
      </div>

      {/* Product Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Enter the basic information, pricing, inventory, and other details for your new product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
