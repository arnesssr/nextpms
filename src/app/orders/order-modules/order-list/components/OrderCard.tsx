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

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onEdit,
  onView,
  onDelete,
  onFulfill
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-lg">#{order.id}</h3>
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
          <span>Customer: {order.customerId}</span>
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
          <p className="truncate">{order.shippingAddress}</p>
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