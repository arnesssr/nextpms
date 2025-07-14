'use client';

import { SidebarLayout } from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertCircle,
  DollarSign,
  Users
} from 'lucide-react';

export default function Dashboard() {
  // Mock data - this will be replaced with real API calls
  const stats = [
    {
      title: 'Total Products',
      value: '1,234',
      icon: Package,
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      title: 'Total Orders',
      value: '856',
      icon: ShoppingCart,
      change: '+8%',
      changeType: 'increase' as const,
    },
    {
      title: 'Revenue',
      value: '$45,678',
      icon: DollarSign,
      change: '+15%',
      changeType: 'increase' as const,
    },
    {
      title: 'Low Stock Items',
      value: '23',
      icon: AlertCircle,
      change: '-5%',
      changeType: 'decrease' as const,
    },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', status: 'processing', total: '$124.99' },
    { id: 'ORD-002', customer: 'Jane Smith', status: 'shipped', total: '$89.50' },
    { id: 'ORD-003', customer: 'Bob Johnson', status: 'delivered', total: '$234.00' },
    { id: 'ORD-004', customer: 'Alice Brown', status: 'pending', total: '$156.75' },
  ];

  const lowStockProducts = [
    { name: 'Product A', stock: 5, threshold: 10 },
    { name: 'Product B', stock: 2, threshold: 15 },
    { name: 'Product C', stock: 8, threshold: 20 },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    {' '}from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Orders */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest orders from your customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                      <span className="text-sm font-medium">{order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>
                Products running low on inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Threshold: {product.threshold}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-amber-600">
                      {product.stock} left
                    </Badge>
                  </div>
                ))}
                <Button className="w-full mt-4" variant="outline">
                  View All Low Stock
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
