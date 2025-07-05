'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSupplierOrder } from '../hooks/useSupplierOrders';
import { format } from 'date-fns';
import { Printer, FileText, Edit } from 'lucide-react';

interface ViewOrderModalProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

export function ViewOrderModal({ orderId, open, onClose }: ViewOrderModalProps) {
  const { order, loading, error } = useSupplierOrder(orderId);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'submitted':
        return 'outline';
      case 'confirmed':
        return 'default';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'partially_delivered':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'partial':
        return 'outline';
      case 'pending':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading order details...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : !order ? (
          <div className="flex items-center justify-center h-64">
            <p>Order not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
                <div className="flex items-center mt-1">
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Created on {format(new Date(order.orderDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Supplier</h3>
                <p>{order.supplierName}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Order Details</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Date:</span>
                    <span>{format(new Date(order.orderDate), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Delivery:</span>
                    <span>{format(new Date(order.expectedDeliveryDate), 'MMM d, yyyy')}</span>
                  </div>
                  {order.actualDeliveryDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actual Delivery:</span>
                      <span>{format(new Date(order.actualDeliveryDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Shipping Information</h3>
                <div className="space-y-1">
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingMethod && (
                    <p className="mt-2">
                      <span className="text-muted-foreground">Shipping Method:</span> {order.shippingMethod}
                    </p>
                  )}
                  {order.trackingNumber && (
                    <p>
                      <span className="text-muted-foreground">Tracking Number:</span> {order.trackingNumber}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Payment Information</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Terms:</span>
                    <span>{order.paymentTerms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{format(new Date(order.paymentDueDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Order Items */}
            <div>
              <h3 className="font-medium mb-4">Order Items</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium">{item.productName}</div>
                          {item.notes && (
                            <div className="text-xs text-muted-foreground mt-1">{item.notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {item.sku}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                          ${item.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <Badge variant={getStatusBadgeVariant(item.status)}>
                            {item.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Order Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>${order.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>${order.shippingCost.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount:</span>
                    <span>-${order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            {order.notes && (
              <div>
                <h3 className="font-medium mb-2">Notes</h3>
                <div className="p-3 bg-muted rounded-md">
                  {order.notes}
                </div>
              </div>
            )}
            
            {/* Attachments */}
            {order.attachments && order.attachments.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Attachments</h3>
                <div className="space-y-2">
                  {order.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      <a 
                        href={attachment} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {attachment.split('/').pop()}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}