'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorBoundaryProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
  showDetails?: boolean;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
  title = 'Error Loading Categories',
  showDetails = false
}) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="mx-auto w-16 h-16 text-red-500 mb-6">
          <AlertTriangle className="w-full h-full" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-8 max-w-md">
          {message}
        </p>
        
        {onRetry && (
          <Button onClick={onRetry} className="flex items-center space-x-2">
            <RefreshCw size={16} />
            <span>Try Again</span>
          </Button>
        )}
        
        {showDetails && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">
              View technical details
            </summary>
            <pre className="mt-2 text-xs text-gray-400 bg-gray-100 p-3 rounded max-w-md overflow-auto">
              {message}
            </pre>
          </details>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            If the problem persists, please contact support
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorBoundary;
