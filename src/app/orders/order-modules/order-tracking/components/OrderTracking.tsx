'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Order } from '@/types';

export const OrderTracking: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchShippedOrders();
  }, []);

  const fetchShippedOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders?status=shipped,delivered');
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

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>Order Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Track shipped orders and monitor delivery status.
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search by order number, tracking number, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p>Loading orders...</p>
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Truck className="mx-auto h-12 w-12 mb-4" />
              <p>No shipped orders found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <h3 className="font-semibold">#{order.id}</h3>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${order.total.toFixed(2)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Customer & Shipping Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Customer</h4>
                    <p className="text-sm text-muted-foreground">
                      Customer: {order.customerId}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>{order.shippingAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking Information */}
                {order.status === 'shipped' && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Tracking Number</h4>
                        <p className="text-lg font-mono text-blue-600">
                          TRK{order.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Track Package
                      </Button>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 className="font-medium mb-3">Order Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Order Created</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    {order.status === 'shipped' || order.status === 'delivered' ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Order Shipped</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.updatedAt)}
                          </p>
                        </div>
                      </div>
                    ) : null}
                    
                    {order.status === 'delivered' && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Order Delivered</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Items ({order.items?.length || 0})</h4>
                  <div className="space-y-2">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-muted rounded">
                        <span>Product {item.productId}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{(order.items?.length || 0) - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};