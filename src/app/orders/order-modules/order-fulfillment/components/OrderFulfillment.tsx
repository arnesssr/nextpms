'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Package, Truck, CheckCircle } from 'lucide-react';
import { Order } from '@/types';

interface OrderFulfillmentProps {
  onOrderFulfilled?: () => void;
}

export const OrderFulfillment: React.FC<OrderFulfillmentProps> = ({ onOrderFulfilled }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('');
  const [notes, setNotes] = useState('');
  const [fulfilling, setFulfilling] = useState(false);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders?status=confirmed,processing');
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfillOrder = async () => {
    if (!selectedOrder || !trackingNumber) {
      alert('Please select an order and enter a tracking number');
      return;
    }

    setFulfilling(true);

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}/fulfill`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'shipped',
          shipmentInfo: {
            carrier: shippingCarrier || 'USPS',
            trackingNumber: trackingNumber,
            trackingUrl: `https://tracking.example.com/${trackingNumber}`
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Order fulfilled successfully!');
        setSelectedOrder(null);
        setTrackingNumber('');
        setShippingCarrier('');
        setNotes('');
        fetchPendingOrders();
        onOrderFulfilled?.();
      } else {
        alert(`Failed to fulfill order: ${result.message}`);
      }
    } catch (error) {
      console.error('Error fulfilling order:', error);
      alert('Failed to fulfill order. Please try again.');
    } finally {
      setFulfilling(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Order Fulfillment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Process and fulfill confirmed orders by adding tracking information and updating status.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Ready for Fulfillment</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4" />
                <p>No orders ready for fulfillment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">#{order.order_number || order.id}</h4>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Customer: {order.shipping_name || order.customer_id || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total: ${(order.total_amount || order.total || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Items: {order.items?.length || 0}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fulfillment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Fulfill Selected Order</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedOrder ? (
              <div className="space-y-4">
                {/* Order Details */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">#{selectedOrder.order_number || selectedOrder.id}</h4>
                  <p className="text-sm text-muted-foreground">
                    Customer: {selectedOrder.shipping_name || selectedOrder.customer_id || 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total: ${(selectedOrder.total_amount || selectedOrder.total || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Shipping to: {selectedOrder.shipping_address_line_1 || selectedOrder.shippingAddress || 'No address'}
                  </p>
                </div>

                {/* Order Items */}
                <div>
                  <Label className="text-sm font-medium">Order Items</Label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-muted rounded">
                        <span>{item.product_name || `Product ${item.product_id || item.productId}`}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking Information */}
                <div className="space-y-2">
                  <Label htmlFor="tracking">Tracking Number *</Label>
                  <Input
                    id="tracking"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carrier">Shipping Carrier</Label>
                  <Input
                    id="carrier"
                    placeholder="e.g., UPS, FedEx, USPS"
                    value={shippingCarrier}
                    onChange={(e) => setShippingCarrier(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Fulfillment Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any notes about the fulfillment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleFulfillOrder}
                  disabled={fulfilling || !trackingNumber}
                  className="w-full"
                >
                  {fulfilling ? (
                    'Fulfilling Order...'
                  ) : (
                    <>
                      <Truck className="mr-2 h-4 w-4" />
                      Mark as Shipped
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="mx-auto h-12 w-12 mb-4" />
                <p>Select an order to fulfill</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};