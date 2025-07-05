'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Search } from 'lucide-react';
import { OrderFiltersProps } from '../types';
import { OrderStatus, PaymentStatus } from '@/types';

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
  { value: 'refunded', label: 'Refunded' }
];

const paymentStatusOptions: { value: PaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'partially_refunded', label: 'Partially Refunded' }
];

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset
}) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const addStatusFilter = (status: OrderStatus) => {
    const currentStatuses = filters.status || [];
    if (!currentStatuses.includes(status)) {
      updateFilter('status', [...currentStatuses, status]);
    }
  };

  const removeStatusFilter = (status: OrderStatus) => {
    const currentStatuses = filters.status || [];
    updateFilter('status', currentStatuses.filter(s => s !== status));
  };

  const addPaymentStatusFilter = (status: PaymentStatus) => {
    const currentStatuses = filters.payment_status || [];
    if (!currentStatuses.includes(status)) {
      updateFilter('payment_status', [...currentStatuses, status]);
    }
  };

  const removePaymentStatusFilter = (status: PaymentStatus) => {
    const currentStatuses = filters.payment_status || [];
    updateFilter('payment_status', currentStatuses.filter(s => s !== status));
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== '' && 
    (!Array.isArray(value) || value.length > 0)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onReset}>
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Orders</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              placeholder="Search by order number, customer name..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Order Status */}
        <div className="space-y-2">
          <Label>Order Status</Label>
          <Select onValueChange={addStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Add status filter" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {filters.status && filters.status.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.status.map((status) => (
                <Badge key={status} variant="secondary" className="cursor-pointer">
                  {statusOptions.find(s => s.value === status)?.label}
                  <X 
                    className="ml-1 h-3 w-3" 
                    onClick={() => removeStatusFilter(status)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Payment Status */}
        <div className="space-y-2">
          <Label>Payment Status</Label>
          <Select onValueChange={addPaymentStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Add payment status filter" />
            </SelectTrigger>
            <SelectContent>
              {paymentStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {filters.payment_status && filters.payment_status.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.payment_status.map((status) => (
                <Badge key={status} variant="secondary" className="cursor-pointer">
                  {paymentStatusOptions.find(s => s.value === status)?.label}
                  <X 
                    className="ml-1 h-3 w-3" 
                    onClick={() => removePaymentStatusFilter(status)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date_from">From Date</Label>
            <Input
              id="date_from"
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => updateFilter('date_from', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_to">To Date</Label>
            <Input
              id="date_to"
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => updateFilter('date_to', e.target.value)}
            />
          </div>
        </div>

        {/* Amount Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_amount">Min Amount</Label>
            <Input
              id="min_amount"
              type="number"
              placeholder="0.00"
              value={filters.min_amount || ''}
              onChange={(e) => updateFilter('min_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_amount">Max Amount</Label>
            <Input
              id="max_amount"
              type="number"
              placeholder="1000.00"
              value={filters.max_amount || ''}
              onChange={(e) => updateFilter('max_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};