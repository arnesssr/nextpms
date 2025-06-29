'use client';

import React from 'react';
import { Package, Plus, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<any>;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No categories found',
  message = 'Get started by creating your first category to organize your products.',
  actionLabel = 'Create Category',
  onAction,
  icon: Icon = FolderTree
}) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="mx-auto w-16 h-16 text-gray-400 mb-6">
          <Icon className="w-full h-full" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-500 mb-8 max-w-md">
          {message}
        </p>
        
        {onAction && (
          <Button onClick={onAction} className="flex items-center space-x-2">
            <Plus size={16} />
            <span>{actionLabel}</span>
          </Button>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-2">
            Categories help you organize your products efficiently
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-400">
            <span>• Hierarchical structure</span>
            <span>• Easy product assignment</span>
            <span>• Better navigation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
