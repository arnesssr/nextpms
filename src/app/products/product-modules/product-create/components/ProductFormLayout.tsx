'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProductFormSectionProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  accentColor?: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
}

const accentStyles = {
  blue: {
    border: 'border-l-blue-500',
    header: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    description: 'text-blue-700',
  },
  green: {
    border: 'border-l-green-500',
    header: 'bg-gradient-to-r from-green-50 to-emerald-50',
    icon: 'text-green-600',
    title: 'text-green-900',
    description: 'text-green-700',
  },
  purple: {
    border: 'border-l-purple-500',
    header: 'bg-gradient-to-r from-purple-50 to-violet-50',
    icon: 'text-purple-600',
    title: 'text-purple-900',
    description: 'text-purple-700',
  },
  orange: {
    border: 'border-l-orange-500',
    header: 'bg-gradient-to-r from-orange-50 to-amber-50',
    icon: 'text-orange-600',
    title: 'text-orange-900',
    description: 'text-orange-700',
  },
  indigo: {
    border: 'border-l-indigo-500',
    header: 'bg-gradient-to-r from-indigo-50 to-purple-50',
    icon: 'text-indigo-600',
    title: 'text-indigo-900',
    description: 'text-indigo-700',
  },
};

export function ProductFormSection({
  title,
  description,
  icon,
  children,
  className,
  headerClassName,
  accentColor = 'blue',
}: ProductFormSectionProps) {
  const styles = accentStyles[accentColor];

  return (
    <Card className={cn('border-l-4 shadow-sm hover:shadow-md transition-shadow duration-200', styles.border, className)}>
      <CardHeader className={cn(styles.header, 'rounded-t-lg', headerClassName)}>
        <CardTitle className={cn('flex items-center gap-2', styles.title)}>
          <span className={styles.icon}>{icon}</span>
          {title}
        </CardTitle>
        {description && (
          <CardDescription className={styles.description}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {children}
      </CardContent>
    </Card>
  );
}

interface FormFieldWrapperProps {
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export function FormFieldWrapper({ children, error, className }: FormFieldWrapperProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
      {error && (
        <p className="text-sm text-red-600 font-medium flex items-center mt-1 animate-in slide-in-from-top-1">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}

interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {children}
    </div>
  );
}

interface StyledInputProps {
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function StyledInputWrapper({ icon, className, children }: StyledInputProps) {
  if (!icon) return <>{children}</>;

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        {icon}
      </div>
      <div className={cn(icon && 'pl-12', className)}>
        {children}
      </div>
    </div>
  );
}

export function FormActions({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-end gap-4 pt-6 border-t border-gray-200', className)}>
      {children}
    </div>
  );
}
