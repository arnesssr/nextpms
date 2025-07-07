'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Package,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OrderCardProps } from '../types';
import { OrderListService } from '../services';

interface ExtendedOrderCardProps extends OrderCardProps {
  viewMode?: 'compact' | 'expanded';
}

export const OrderCard: React.FC<ExtendedOrderCardProps> = ({
  order,
  onEdit,
  onView,
  onDelete,
  onFulfill,
  viewMode = 'compact'
}) => {
  const formattedOrder = OrderListService.formatOrderForDisplay(order);

  const handleEdit = () => {
    onEdit?.(order);
  };

  const handleView = () => {
    onView?.(order);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete order ${order.id}?`)) {
      onDelete?.(order.id);
    }
  };

  const handleFulfill = () => {
    onFulfill?.(order);
  };

  const canFulfill = order.status === 'confirmed' || order.status === 'processing';

  if (viewMode === 'compact') {
    return (
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-base">#{order.order_number || order.id}</h3>
              <Badge className={formattedOrder.statusColor} variant="secondary">
                {order.status}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {canFulfill && (
                  <DropdownMenuItem onClick={handleFulfill}>
                    <Package className="mr-2 h-4 w-4" />
                    Fulfill
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Compact Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground truncate">
                {order.shipping_name || order.customer_id || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{formattedOrder.formattedTotal}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{order.items?.length || 0} items</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{formattedOrder.formattedDate}</span>
            </div>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex space-x-2 mt-3">
            <Button variant="outline" size="sm" onClick={handleView} className="flex-1">
              <Eye className="mr-1 h-3 w-3" />
              View
            </Button>
            {canFulfill && (
              <Button size="sm" onClick={handleFulfill} className="flex-1">
                <Package className="mr-1 h-3 w-3" />
                Fulfill
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Expanded view (original layout)
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-lg">#{order.order_number || order.id}</h3>
            <Badge className={formattedOrder.statusColor}>
              {order.status}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Order
              </DropdownMenuItem>
              {canFulfill && (
                <DropdownMenuItem onClick={handleFulfill}>
                  <Package className="mr-2 h-4 w-4" />
                  Fulfill Order
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Customer: {order.shipping_name || order.customer_id || 'Unknown'}</span>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formattedOrder.formattedTotal}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>{order.items?.length || 0} items</span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formattedOrder.formattedDate}</span>
        </div>

        {/* Shipping Address */}
        <div className="text-sm text-muted-foreground">
          <p className="font-medium">Shipping to:</p>
          <p className="truncate">
            {order.shipping_name && (
              <span>{order.shipping_name}<br /></span>
            )}
            {order.shipping_address_line_1 || order.shippingAddress || 'No address provided'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleView} className="flex-1">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          {canFulfill && (
            <Button size="sm" onClick={handleFulfill} className="flex-1">
              <Package className="mr-2 h-4 w-4" />
              Fulfill
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
