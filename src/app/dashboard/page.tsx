'use client';

import { useState, useEffect } from 'react';
import { SidebarLayout } from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart,
  AlertCircle,
  DollarSign,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [lowStockData, setLowStockData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch stats
        const statsResponse = await fetch('/api/dashboard/stats');
        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch stats');
        }
        const stats = await statsResponse.json();
        
        // Fetch low stock items
        const lowStockResponse = await fetch('/api/dashboard/low-stock');
        if (!lowStockResponse.ok) {
          const errorData = await lowStockResponse.json();
          throw new Error(errorData.error || 'Failed to fetch low stock items');
        }
        const lowStock = await lowStockResponse.json();
        
        setStatsData(stats);
        setLowStockData(lowStock.items || []);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Prepare stats for display
  const stats = statsData ? [
    {
      title: 'Total Products',
      value: formatNumber(statsData.totalProducts.value),
      icon: Package,
      change: `${statsData.totalProducts.change > 0 ? '+' : ''}${statsData.totalProducts.change}%`,
      changeType: statsData.totalProducts.changeType,
    },
    {
      title: 'Total Orders',
      value: formatNumber(statsData.totalOrders?.value || 0),
      icon: ShoppingCart,
      change: `${(statsData.totalOrders?.change || 0) > 0 ? '+' : ''}${statsData.totalOrders?.change || 0}%`,
      changeType: statsData.totalOrders?.changeType || 'increase',
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(statsData.revenue.value),
      icon: DollarSign,
      change: `${statsData.revenue.change > 0 ? '+' : ''}${statsData.revenue.change}%`,
      changeType: statsData.revenue.changeType,
    },
    {
      title: 'Low Stock Items',
      value: formatNumber(statsData.lowStockItems.value),
      icon: AlertCircle,
      change: `${statsData.lowStockItems.change > 0 ? '+' : ''}${statsData.lowStockItems.change}%`,
      changeType: statsData.lowStockItems.changeType,
    },
  ] : [];


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

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
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

        {/* Low Stock Alert */}
        <Card className="max-w-2xl mx-auto">
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
                {lowStockData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All products are well stocked!
                  </p>
                ) : (
                  <>
                    {lowStockData.map((product) => (
                      <div key={product.name} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            SKU: {product.sku}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-amber-600">
                          {product.current_stock} left
                        </Badge>
                      </div>
                    ))}
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => router.push('/inventory')}
                    >
                      View All Inventory
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
