'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Order } from '@/types';

interface ReturnRequest {
  id: string;
  order_id: string;
  order: Order;
  items: Array<{
    order_item_id: string;
    quantity: number;
    reason: string;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  reason: string;
  notes?: string;
  refund_amount: number;
  created_at: string;
  updated_at: string;
}

export const OrderReturns: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDeliveredOrders();
    fetchReturns();
  }, []);

  const fetchDeliveredOrders = async () => {
    try {
      const response = await fetch('/api/orders?status=delivered');
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchReturns = async () => {
    try {
      // This would be a real API call in production
      setReturns([]);
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReturn = async () => {
    if (!selectedOrder || !returnReason) {
      alert('Please select an order and provide a return reason');
      return;
    }

    setProcessing(true);

    try {
      // In a real implementation, this would create a return request
      const returnRequest = {
        id: `RET-${Date.now()}`,
        order_id: selectedOrder.id,
        order: selectedOrder,
        items: selectedOrder.items?.map(item => ({
          order_item_id: item.id,
          quantity: item.quantity,
          reason: returnReason
        })) || [],
        status: 'pending' as const,
        reason: returnReason,
        refund_amount: parseFloat(refundAmount) || selectedOrder.total,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setReturns(prev => [returnRequest, ...prev]);
      
      alert('Return request created successfully!');
      setSelectedOrder(null);
      setReturnReason('');
      setReturnNotes('');
      setRefundAmount('');
    } catch (error) {
      console.error('Error creating return:', error);
      alert('Failed to create return request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessReturn = async (returnId: string, action: 'approve' | 'reject') => {
    try {
      // In a real implementation, this would update the return status
      setReturns(prev => prev.map(ret => 
        ret.id === returnId 
          ? { ...ret, status: action === 'approve' ? 'approved' : 'rejected' }
          : ret
      ));
      
      alert(`Return ${action}d successfully!`);
    } catch (error) {
      console.error('Error processing return:', error);
      alert('Failed to process return. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <RotateCcw className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RotateCcw className="h-5 w-5" />
            <span>Order Returns & Refunds</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage return requests and process refunds for delivered orders.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Return Request */}
        <Card>
          <CardHeader>
            <CardTitle>Create Return Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Selection */}
            <div className="space-y-2">
              <Label>Select Delivered Order</Label>
              <Select onValueChange={(value) => {
                const order = orders.find(o => o.id === value);
                setSelectedOrder(order || null);
                setRefundAmount(order?.total.toString() || '');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an order" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      #{order.id} - {order.customerId} - ${order.total.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOrder && (
              <>
                {/* Order Details */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">#{selectedOrder.id}</h4>
                  <p className="text-sm text-muted-foreground">
                    Customer: {selectedOrder.customerId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total: ${selectedOrder.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Items: {selectedOrder.items?.length || 0}
                  </p>
                </div>

                {/* Return Reason */}
                <div className="space-y-2">
                  <Label htmlFor="reason">Return Reason *</Label>
                  <Select onValueChange={setReturnReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select return reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defective">Defective Product</SelectItem>
                      <SelectItem value="wrong_item">Wrong Item Received</SelectItem>
                      <SelectItem value="not_as_described">Not as Described</SelectItem>
                      <SelectItem value="damaged_shipping">Damaged in Shipping</SelectItem>
                      <SelectItem value="customer_changed_mind">Customer Changed Mind</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Refund Amount */}
                <div className="space-y-2">
                  <Label htmlFor="refund">Refund Amount</Label>
                  <Input
                    id="refund"
                    type="number"
                    step="0.01"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional details about the return..."
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCreateReturn}
                  disabled={processing || !returnReason}
                  className="w-full"
                >
                  {processing ? 'Creating Return...' : 'Create Return Request'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Return Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Return Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Loading returns...</p>
              </div>
            ) : returns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <RotateCcw className="mx-auto h-12 w-12 mb-4" />
                <p>No return requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {returns.map((returnRequest) => (
                  <div key={returnRequest.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(returnRequest.status)}
                        <h4 className="font-medium">{returnRequest.id}</h4>
                      </div>
                      <Badge className={getStatusColor(returnRequest.status)}>
                        {returnRequest.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Order:</span> #{returnRequest.order?.id}
                      </p>
                      <p>
                        <span className="font-medium">Customer:</span> {returnRequest.order?.customerId}
                      </p>
                      <p>
                        <span className="font-medium">Reason:</span> {returnRequest.reason}
                      </p>
                      <p>
                        <span className="font-medium">Refund Amount:</span> ${returnRequest.refund_amount.toFixed(2)}
                      </p>
                      <p>
                        <span className="font-medium">Created:</span> {new Date(returnRequest.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {returnRequest.status === 'pending' && (
                      <div className="flex space-x-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => handleProcessReturn(returnRequest.id, 'approve')}
                          className="flex-1"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleProcessReturn(returnRequest.id, 'reject')}
                          className="flex-1"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};