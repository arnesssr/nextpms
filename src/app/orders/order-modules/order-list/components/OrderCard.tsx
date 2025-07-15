'use client';

import React, { useState } from 'react';
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
  DollarSign,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    onEdit?.(order);
  };

  const handleView = () => {
    onView?.(order);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    console.log('OrderCard handleDeleteConfirm called for order:', order.id);
    setIsDeleting(true);
    try {
      await onDelete?.(order.id);
      console.log('OrderCard delete completed successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting order in OrderCard:', error);
      // Keep dialog open on error
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFulfill = () => {
    onFulfill?.(order);
  };

  const handleConfirmPayment = async () => {
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'confirmed',
          payment_status: 'paid'
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh the order list
        window.location.reload();
      } else {
        alert(`Failed to confirm payment: ${result.message}`);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Failed to confirm payment. Please try again.');
    }
  };

  const canFulfill = order.status === 'confirmed' || order.status === 'processing';
  const isPending = order.status === 'pending';

  if (viewMode === 'compact') {
    return (
      <>
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
                    onClick={handleDeleteClick}
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
              {isPending && (
                <Button size="sm" variant="default" onClick={handleConfirmPayment} className="flex-1">
                  <CreditCard className="mr-1 h-3 w-3" />
                  Confirm Payment
                </Button>
              )}
              {canFulfill && (
                <Button size="sm" onClick={handleFulfill} className="flex-1">
                  <Package className="mr-1 h-3 w-3" />
                  Fulfill
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog 
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
          orderNumber={order.order_number || order.id}
        />
      </>
    );
  }

  // Expanded view (original layout)
  return (
    <>
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
                  onClick={handleDeleteClick}
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
            {isPending && (
              <Button size="sm" variant="default" onClick={handleConfirmPayment} className="flex-1">
                <CreditCard className="mr-2 h-4 w-4" />
                Confirm Payment
              </Button>
            )}
            {canFulfill && (
              <Button size="sm" onClick={handleFulfill} className="flex-1">
                <Package className="mr-2 h-4 w-4" />
                Fulfill
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        orderNumber={order.order_number || order.id}
      />
    </>
  );
};

// Delete Confirmation Dialog (outside the main component return)
const DeleteConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  isDeleting, 
  orderNumber 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  orderNumber: string;
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span>Delete Order</span>
        </AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete order <strong>#{orderNumber}</strong>?
          This action cannot be undone and will permanently remove the order from the system.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isDeleting}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
        >
          {isDeleting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Order
            </>
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
