'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { useSupplierOrder, useSupplierOrders } from '../hooks/useSupplierOrders';
import { Loader2 } from 'lucide-react';

interface DeleteOrderModalProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

export function DeleteOrderModal({ orderId, open, onClose }: DeleteOrderModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { order } = useSupplierOrder(orderId);
  const { deleteOrder } = useSupplierOrders();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteOrder(orderId);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the order{' '}
            <span className="font-medium">{order?.orderNumber}</span> from the system.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Order'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}