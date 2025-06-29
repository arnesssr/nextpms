'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/Sidebar';
import { OrdersTable } from '@/components/tables/OrdersTable';
import { OrderStatusPipeline } from '@/components/charts/OrderStatusPipeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Order } from '@/types';

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock order data - will be replaced with real API calls
  const mockOrders: Order[] = [
    {
      id: 'ORD-001',
      customerId: 'cust-1',
      status: 'processing',
      items: [
        { id: 'item-1', productId: '1', quantity: 2, price: 299.99 },
        { id: 'item-2', productId: '2', quantity: 1, price: 399.99 }
      ],
      total: 999.97,
      shippingAddress: '123 Main St, New York, NY 10001',
      createdAt: '2024-02-01T10:30:00Z',
      updatedAt: '2024-02-01T14:20:00Z'
    },
    {
      id: 'ORD-002',
      customerId: 'cust-2',
      status: 'shipped',
      items: [
        { id: 'item-3', productId: '3', quantity: 1, price: 79.99 }
      ],
      total: 79.99,
      shippingAddress: '456 Oak Ave, Los Angeles, CA 90210',
      createdAt: '2024-02-02T09:15:00Z',
      updatedAt: '2024-02-02T16:45:00Z'
    },
    {
      id: 'ORD-003',
      customerId: 'cust-3',
      status: 'delivered',
      items: [
        { id: 'item-4', productId: '4', quantity: 3, price: 149.99 }
      ],
      total: 449.97,
      shippingAddress: '789 Pine St, Chicago, IL 60601',
      createdAt: '2024-01-28T11:20:00Z',
      updatedAt: '2024-01-30T13:10:00Z'
    },
    {
      id: 'ORD-004',
      customerId: 'cust-4',
      status: 'pending',
      items: [
        { id: 'item-5', productId: '2', quantity: 1, price: 399.99 },
        { id: 'item-6', productId: '5', quantity: 2, price: 59.99 }
      ],
      total: 519.97,
      shippingAddress: '321 Elm St, Miami, FL 33101',
      createdAt: '2024-02-03T08:45:00Z',
      updatedAt: '2024-02-03T08:45:00Z'
    },
    {
      id: 'ORD-005',
      customerId: 'cust-5',
      status: 'cancelled',
      items: [
        { id: 'item-7', productId: '1', quantity: 1, price: 299.99 }
      ],
      total: 299.99,
      shippingAddress: '654 Maple Dr, Seattle, WA 98101',
      createdAt: '2024-01-25T15:30:00Z',
      updatedAt: '2024-01-26T09:20:00Z'
    },
    {
      id: 'ORD-006',
      customerId: 'cust-6',
      status: 'confirmed',
      items: [
        { id: 'item-8', productId: '3', quantity: 2, price: 79.99 },
        { id: 'item-9', productId: '4', quantity: 1, price: 149.99 }
      ],
      total: 309.97,
      shippingAddress: '987 Cedar Ln, Boston, MA 02101',
      createdAt: '2024-02-03T12:00:00Z',
      updatedAt: '2024-02-03T14:30:00Z'
    }
  ];

  // Mock customer data
  const customers = {
    'cust-1': { name: 'John Doe', email: 'john@example.com' },
    'cust-2': { name: 'Jane Smith', email: 'jane@example.com' },
    'cust-3': { name: 'Bob Johnson', email: 'bob@example.com' },
    'cust-4': { name: 'Alice Brown', email: 'alice@example.com' },
    'cust-5': { name: 'Charlie Wilson', email: 'charlie@example.com' },
    'cust-6': { name: 'Diana Davis', email: 'diana@example.com' }
  };

  // Calculate stats
  const totalOrders = mockOrders.length;
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
  const processingOrders = mockOrders.filter(o => o.status === 'processing').length;
  const shippedOrders = mockOrders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = mockOrders.filter(o => o.status === 'delivered').length;
  const totalRevenue = mockOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0);

  // Order status counts for pipeline
  const statusCounts = {
    pending: pendingOrders,
    confirmed: mockOrders.filter(o => o.status === 'confirmed').length,
    processing: processingOrders,
    shipped: shippedOrders,
    delivered: deliveredOrders,
    cancelled: mockOrders.filter(o => o.status === 'cancelled').length
  };

  // Filter orders based on search and filters
  const filteredOrders = mockOrders.filter(order => {
    const customer = customers[order.customerId as keyof typeof customers];
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            <p className="text-muted-foreground">
              Manage and track your customer orders
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                All time orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shippedOrders}</div>
              <p className="text-xs text-muted-foreground">
                Shipped orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Pipeline</CardTitle>
            <CardDescription>
              Visual overview of order progression
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderStatusPipeline statusCounts={statusCounts} />
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>
                  {filteredOrders.length} of {totalOrders} orders
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search orders or customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <OrdersTable 
              orders={filteredOrders}
              customers={customers}
            />
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
