'use client';

import React, { useState, useEffect } from 'react';
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
  product_id: string;
  quantity: number;
  unit_price: number;
}

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
        // If no products from API, add some sample products for testing
        const sampleProducts = [
          { id: 'sample-1', name: 'Sample Product 1', sku: 'SKU-001', price: 10.99 },
          { id: 'sample-2', name: 'Sample Product 2', sku: 'SKU-002', price: 25.50 },
          { id: 'sample-3', name: 'Sample Product 3', sku: 'SKU-003', price: 15.75 }
        ];
        console.log('Using sample products:', sampleProducts);
        setProducts(sampleProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to sample products on error
      const sampleProducts = [
        { id: 'sample-1', name: 'Sample Product 1', sku: 'SKU-001', price: 10.99 },
        { id: 'sample-2', name: 'Sample Product 2', sku: 'SKU-002', price: 25.50 },
        { id: 'sample-3', name: 'Sample Product 3', sku: 'SKU-003', price: 15.75 }
      ];
      console.log('Using fallback sample products:', sampleProducts);
      setProducts(sampleProducts);
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
    if (selectedProduct) {
      updateItem(index, 'product_id', productId);
      updateItem(index, 'unit_price', selectedProduct.price || 0);
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
      const orderData: CreateOrderRequest = {
        customer_id: `guest_${Date.now()}`, // Generate a guest customer ID
        items: items.filter(item => item.product_id && item.quantity > 0),
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
        setItems([{ product_id: '', quantity: 1, unit_price: 0.00 }]);
        setShippingName('');
        setShippingAddressLine1('');
        setShippingCity('');
        setShippingState('');
        setShippingPostalCode('');
        setShippingCountry('USA');
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
            {/* Guest Order Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Guest Order:</strong> This order will be created as a guest order using the shipping information provided.
              </p>
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
                              {product.sku} - {product.name} (${(product.price || 0).toFixed(2)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {item.product_id && (
                        <div className="text-xs text-muted-foreground">
                          {(() => {
                            const selectedProduct = products.find(p => p.id === item.product_id);
                            return selectedProduct ? `SKU: ${selectedProduct.sku}` : '';
                          })()} 
                        </div>
                      )}
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
                      <Label>Unit Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        required
                      />
                      <div className="text-xs text-muted-foreground">
                        Auto-filled from product, can be manually adjusted
                      </div>
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Mexico">Mexico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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