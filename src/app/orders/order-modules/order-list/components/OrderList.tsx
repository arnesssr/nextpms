'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Grid,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { OrderCard } from './OrderCard';
import { OrderFilters } from './OrderFilters';
import { useOrders } from '../hooks';
import { OrderListService } from '../services';
import { OrderListProps } from '../types';
import { OrderFilters as OrderFiltersType } from '@/types';

export const OrderList: React.FC<OrderListProps> = ({
  onCreateOrder,
  onEditOrder,
  onViewOrder,
  onDeleteOrder,
  onFulfillOrder
}) => {
  const {
    orders,
    loading,
    error,
    pagination,
    filters,
    applyFilters,
    changePage,
    changeLimit,
    refreshOrders,
    updateOrder,
    deleteOrder
  } = useOrders();

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    applyFilters({ ...filters, search: searchTerm });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFiltersChange = (newFilters: OrderFiltersType) => {
    applyFilters(newFilters);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    applyFilters({});
  };

  const handleExport = () => {
    OrderListService.downloadCSV(orders);
  };

  const handleEdit = async (order: any) => {
    onEditOrder?.(order);
  };

  const handleView = (order: any) => {
    onViewOrder?.(order);
  };

  const handleDelete = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. Please try again.');
    }
  };

  const handleFulfill = (order: any) => {
    onFulfillOrder?.(order);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading orders: {error}</p>
            <Button onClick={refreshOrders} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <p className="text-sm text-muted-foreground">
                {pagination.total} total orders
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={refreshOrders}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders by number, customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {/* Active Filters */}
          {Object.values(filters).some(value => 
            value !== undefined && value !== null && value !== '' && 
            (!Array.isArray(value) || value.length > 0)
          ) && (
            <div className="flex flex-wrap gap-2">
              {filters.status?.map(status => (
                <Badge key={status} variant="secondary">
                  Status: {status}
                </Badge>
              ))}
              {filters.payment_status?.map(status => (
                <Badge key={status} variant="secondary">
                  Payment: {status}
                </Badge>
              ))}
              {filters.search && (
                <Badge variant="secondary">
                  Search: {filters.search}
                </Badge>
              )}
              {(filters.date_from || filters.date_to) && (
                <Badge variant="secondary">
                  Date: {filters.date_from || 'Start'} - {filters.date_to || 'End'}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <OrderFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Orders List */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {loading ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <p className="text-lg font-medium">No orders found</p>
                  <p className="text-sm">Try adjusting your filters or create a new order</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Orders Grid/List */}
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                    onFulfill={handleFulfill}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Card className="mt-6">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                          {pagination.total} orders
                        </span>
                        <Select
                          value={pagination.limit.toString()}
                          onValueChange={(value) => changeLimit(parseInt(value))}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changePage(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        
                        <span className="text-sm">
                          Page {pagination.page} of {pagination.totalPages}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changePage(pagination.page + 1)}
                          disabled={pagination.page >= pagination.totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};