'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { CreateOrderRequest } from '@/types';

interface OrderCreateProps {
  onOrderCreated?: () => void;
}

interface OrderItem {
  productId: string;
  quantity: number;
}

export const OrderCreate: React.FC<OrderCreateProps> = ({ onOrderCreated }) => {
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ productId: '', quantity: 1 }]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  // Remove this function since we're using a simple string for shipping address

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || items.some(item => !item.productId || item.quantity <= 0)) {
      alert('Please fill in all required fields');
      return;
    }

    if (!shippingAddress) {
      alert('Please fill in shipping address');
      return;
    }

    setLoading(true);

    try {
      const orderData: CreateOrderRequest = {
        customerId: customerId,
        items: items.filter(item => item.productId && item.quantity > 0),
        shippingAddress: shippingAddress
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Order created successfully!');
        // Reset form
        setCustomerId('');
        setItems([{ productId: '', quantity: 1 }]);
        setShippingAddress('');
        setNotes('');
        onOrderCreated?.();
      } else {
        alert(`Failed to create order: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Create New Order</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Input
                id="customer"
                placeholder="Customer ID (temporary - will be replaced with customer selector)"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              />
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Order Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
              
              {items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Product ID</Label>
                      <Input
                        placeholder="Product ID"
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Unit Price (Auto-calculated)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="10.00"
                        value="10.00"
                        disabled
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">Shipping Address *</Label>
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter complete shipping address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  rows={4}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or notes for this order..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => onOrderCreated?.()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Order...' : 'Create Order'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};