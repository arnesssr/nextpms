'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Sparkles } from 'lucide-react';
import { ProductFormModern } from '@/components/forms/ProductFormModern';
import { Product } from '@/types/products';
import { Badge } from '@/components/ui/badge';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-100/30 to-cyan-100/30 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Simplified Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            className="group hover:bg-white/80 backdrop-blur-sm transition-all duration-200 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Products
          </Button>
        </div>

        {/* Product Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-8 lg:p-10">
            <ProductFormModern
              onSuccess={handleSuccess}
              onClose={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
