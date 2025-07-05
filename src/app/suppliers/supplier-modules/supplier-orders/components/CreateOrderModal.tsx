'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupplierOrders } from '../hooks/useSupplierOrders';
import { CreateSupplierOrderRequest } from '../types';
import { Loader2, Plus, Trash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateOrderModal({ open, onClose }: CreateOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateSupplierOrderRequest>({
    supplierId: '',
    expectedDeliveryDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Default to 2 weeks from now
    items: [
      {
        productId: '',
        quantity: 1,
        unitPrice: 0,
      }
    ],
    paymentTerms: 'Net 30',
    paymentDueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    notes: ''
  });

  const { createOrder } = useSupplierOrders();

  // Mock suppliers for the demo
  const suppliers = [
    { id: 'sup_001', name: 'Acme Supplies' },
    { id: 'sup_002', name: 'Global Manufacturing' },
    { id: 'sup_003', name: 'Tech Components Inc' },
    { id: 'sup_004', name: 'Quality Parts Ltd' }
  ];

  // Mock products for the demo
  const products = [
    { id: 'prod_001', name: 'Widget A', price: 10.5 },
    { id: 'prod_002', name: 'Widget B', price: 15.75 },
    { id: 'prod_003', name: 'Component X', price: 5.25 },
    { id: 'prod_004', name: 'Component Y', price: 7.5 },
    { id: 'prod_005', name: 'Circuit Board A', price: 45 },
    { id: 'prod_006', name: 'Widget C', price: 12.25 },
    { id: 'prod_007', name: 'Precision Gear', price: 8.75 },
    { id: 'prod_008', name: 'Mounting Bracket', price: 3.5 }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createOrder(formData);
      onClose();
    } catch (error) {
      console.error('Failed to create order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupplierChange = (supplierId: string) => {
    setFormData(prev => ({ ...prev, supplierId }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    
    // If changing product, also update the unit price
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
        unitPrice: product ? product.price : 0
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
    }
    
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          quantity: 1,
          unitPrice: 0
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return; // Don't remove the last item
    
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Supplier Order</DialogTitle>
          <DialogDescription>
            Create a new purchase order for a supplier.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier Selection */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Select 
              value={formData.supplierId} 
              onValueChange={handleSupplierChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Expected Delivery Date */}
          <div className="space-y-2">
            <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
            <Input 
              id="expectedDeliveryDate"
              type="date"
              value={formData.expectedDeliveryDate.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                expectedDeliveryDate: new Date(e.target.value) 
              }))}
              required
            />
          </div>
          
          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Order Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center p-4 border rounded-md">
                <div className="col-span-5">
                  <Label htmlFor={`product-${index}`}>Product</Label>
                  <Select 
                    value={item.productId} 
                    onValueChange={(value) => handleItemChange(index, 'productId', value)}
                    required
                  >
                    <SelectTrigger id={`product-${index}`}>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input 
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor={`price-${index}`}>Unit Price</Label>
                  <Input 
                    id={`price-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Total</Label>
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                </div>
                
                <div className="col-span-1 flex items-end justify-end">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end">
              <div className="w-1/3 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>${(calculateSubtotal() * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>$75.00</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${(calculateSubtotal() + (calculateSubtotal() * 0.08) + 75).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Terms */}
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Select 
              value={formData.paymentTerms} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: value }))}
            >
              <SelectTrigger id="paymentTerms">
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Net 15">Net 15</SelectItem>
                <SelectItem value="Net 30">Net 30</SelectItem>
                <SelectItem value="Net 45">Net 45</SelectItem>
                <SelectItem value="Net 60">Net 60</SelectItem>
                <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes"
              placeholder="Add any special instructions or notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}