'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, ShoppingCart, AlertCircle, Check, X, CheckCircle, Package } from 'lucide-react';
import { CreateOrderRequest } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import countries from 'world-countries';

interface OrderCreateProps {
  onOrderCreated?: () => void;
}

interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

interface ValidationError {
  field: string;
  message: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  selling_price: number;
  stock_quantity: number;
  is_active: boolean;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// Secure guest ID generation
const generateSecureGuestId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `guest_${crypto.randomUUID()}`;
  }
  
  // Fallback to more secure random generation
  const timestamp = Date.now();
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const randomString = Array.from(randomBytes, byte => 
    byte.toString(16).padStart(2, '0')
  ).join('');
  
  return `guest_${timestamp}_${randomString}`;
};

export const OrderCreate: React.FC<OrderCreateProps> = ({ onOrderCreated }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([{ product_id: '', quantity: 1, unit_price: 0.00 }]);
  const [shippingName, setShippingName] = useState('');
  const [shippingAddressLine1, setShippingAddressLine1] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingCountry, setShippingCountry] = useState('USA');
  const [notes, setNotes] = useState('');

  const [products, setProducts] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

useEffect(() => {
    fetchProducts();
  }, []);


  // Fetch products from API
  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const response = await fetch('/api/products');
      const result = await response.json();
      
      console.log('Products API response:', result);
      
      if (result.success && result.data) {
        console.log('Products loaded:', result.data.length);
        setProducts(result.data);
      } else {
        console.error('Failed to fetch products:', result);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, unit_price: 0.00 }]);
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

  // Handle product selection and auto-fill price
  const handleProductSelect = (index: number, productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    console.log('Selected product:', selectedProduct);
    if (selectedProduct) {
      const updatedItems = [...items];
      updatedItems[index] = {
        ...updatedItems[index],
        product_id: productId,
        unit_price: selectedProduct.selling_price || 0
      };
      console.log('Updated item:', updatedItems[index]);
      setItems(updatedItems);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.some(item => !item.product_id || item.quantity <= 0)) {
      alert('Please fill in all required product information');
      return;
    }

    if (!shippingName || !shippingAddressLine1 || !shippingCity || !shippingState || !shippingPostalCode) {
      alert('Please fill in all shipping address fields');
      return;
    }

    setLoading(true);

    try {
      const filteredItems = items.filter(item => item.product_id && item.quantity > 0);
      
      const orderData: CreateOrderRequest = {
        customer_id: generateSecureGuestId(), // Generate a secure guest customer ID
        items: filteredItems,
        shipping_address: {
          name: shippingName,
          address_line_1: shippingAddressLine1,
          city: shippingCity,
          state: shippingState,
          postal_code: shippingPostalCode,
          country: shippingCountry
        },
        payment_method: 'credit_card',
        notes: notes || undefined
      };

      console.log('Order data being sent:', orderData);
      console.log('Items to be sent:', filteredItems);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log('Order creation result:', result);

      if (result.success) {
        // Store the created order data
        setCreatedOrder(result.data);
        setShowSuccessModal(true);
        
        // Reset form
        setItems([{ product_id: '', quantity: 1, unit_price: 0.00 }]);
        setShippingName('');
        setShippingAddressLine1('');
        setShippingCity('');
        setShippingState('');
        setShippingPostalCode('');
        setShippingCountry('USA');
        setNotes('');
      } else {
        console.error('Order creation failed:', result);
        let errorMessage = result.message || 'Unknown error occurred';
        
        // If there are validation errors, show them
        if (result.errors && Array.isArray(result.errors)) {
          errorMessage = result.errors.join('\n');
        }
        
        alert(`Failed to create order: ${errorMessage}`);
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
            {/* Guest Order Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Guest Order:</strong> This order will be created as a guest order using the shipping information provided.
              </p>
            </div>

            {/* Order Items */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">Order Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
              
              {items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                    <div className="flex flex-col space-y-2">
                      <Label>Product *</Label>
                      <Select
                        value={item.product_id}
                        onValueChange={(value) => handleProductSelect(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.sku} - {product.name} (${(product.selling_price || 0).toFixed(2)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {item.product_id && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {(() => {
                            const selectedProduct = products.find(p => p.id === item.product_id);
                            return selectedProduct ? `SKU: ${selectedProduct.sku}` : '';
                          })()} 
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Label>Quantity</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          required
                        />
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="h-10 w-10 p-0 flex-shrink-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Label>Unit Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={item.unit_price || 0}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        required
                      />
                      <div className="text-xs text-muted-foreground">
                        Auto-filled from product, can be manually adjusted
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Shipping Address */}
            <div className="space-y-6 mt-8">
              <Label className="text-lg font-medium">Shipping Address *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="Recipient's full name"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 1</Label>
                  <Input
                    placeholder="Street address"
                    value={shippingAddressLine1}
                    onChange={(e) => setShippingAddressLine1(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="City"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    placeholder="State"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    placeholder="ZIP/Postal code"
                    value={shippingPostalCode}
                    onChange={(e) => setShippingPostalCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={shippingCountry} onValueChange={setShippingCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {countries
                        .sort((a, b) => a.name.common.localeCompare(b.name.common))
                        .map((country) => (
                          <SelectItem key={country.cca3} value={country.cca3}>
                            {country.flag} {country.name.common}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4 mt-8">
              <Label htmlFor="notes" className="text-lg font-medium">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or notes for this order..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
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
      
      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Order Created Successfully!
            </DialogTitle>
            <DialogDescription className="mt-2 text-gray-600">
              Your order has been processed and is now in the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Order Details</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Order ID: <span className="font-mono font-medium">{createdOrder?.id || 'N/A'}</span></div>
                <div>Status: <span className="font-medium text-orange-600">Pending</span></div>
                <div>Total Items: <span className="font-medium">{items.length}</span></div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSuccessModal(false);
                  onOrderCreated?.();
                }}
                className="flex-1"
              >
                View Orders
              </Button>
              <Button 
                onClick={() => setShowSuccessModal(false)}
                className="flex-1"
              >
                Create Another Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
