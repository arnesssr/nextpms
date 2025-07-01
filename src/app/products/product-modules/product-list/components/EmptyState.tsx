// EmptyState.tsx
import React from 'react';
import { Package, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No products found',
  message = 'There are no products available at the moment. Use the "Add Product" button in the top navigation to create your first product.',
  actionLabel = 'Add Product',
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Package className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{message}</p>
    </div>
  );
};

export default EmptyState;
