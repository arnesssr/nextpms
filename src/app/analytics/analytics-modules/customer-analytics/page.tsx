'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  CalendarDays,
  PieChart
} from 'lucide-react';
import { useCustomerAnalytics } from './hooks/useCustomerAnalytics';
import { CustomerSegmentChart } from './components/CustomerSegmentChart';
import { CustomerRetentionChart } from './components/CustomerRetentionChart';

export default function CustomerAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [segmentType, setSegmentType] = useState('demographics');
  
  const { customerData, isLoading, error } = useCustomerAnalytics(timeRange);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading customer analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading customer analytics: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Customer Analytics</h3>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <CalendarDays className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerData.overview.totalCustomers.toLocaleString()}
            </div>
            <div className={`flex items-center text-xs ${customerData.overview.customerGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="ml-1">
                {customerData.overview.customerGrowth > 0 ? '+' : ''}{customerData.overview.customerGrowth.toFixed(1)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerData.overview.newCustomers.toLocaleString()}
            </div>
            <div className={`flex items-center text-xs ${customerData.overview.newCustomerGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="ml-1">
                {customerData.overview.newCustomerGrowth > 0 ? '+' : ''}{customerData.overview.newCustomerGrowth.toFixed(1)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerData.overview.retentionRate.toFixed(1)}%
            </div>
            <div className={`flex items-center text-xs ${customerData.overview.retentionGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="ml-1">
                {customerData.overview.retentionGrowth > 0 ? '+' : ''}{customerData.overview.retentionGrowth.toFixed(1)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Lifetime Value</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${customerData.overview.avgLifetimeValue.toLocaleString()}
            </div>
            <div className={`flex items-center text-xs ${customerData.overview.lifetimeValueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="ml-1">
                {customerData.overview.lifetimeValueGrowth > 0 ? '+' : ''}{customerData.overview.lifetimeValueGrowth.toFixed(1)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segmentation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Segmentation</CardTitle>
              <CardDescription>
                Analysis of customer segments and demographics
              </CardDescription>
            </div>
            <Select value={segmentType} onValueChange={setSegmentType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="demographics">Demographics</SelectItem>
                <SelectItem value="spending">Spending Habits</SelectItem>
                <SelectItem value="frequency">Purchase Frequency</SelectItem>
                <SelectItem value="location">Geographic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <CustomerSegmentChart data={customerData.segmentation[segmentType]} />
        </CardContent>
      </Card>

      {/* Customer Retention */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Retention</CardTitle>
          <CardDescription>
            Customer retention rates over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerRetentionChart data={customerData.retention} />
        </CardContent>
      </Card>

      {/* Customer Behavior Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Behavior</CardTitle>
          <CardDescription>
            Insights into customer behavior patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="engagement">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
              <TabsTrigger value="conversion">Conversion</TabsTrigger>
            </TabsList>
            <TabsContent value="engagement" className="pt-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Customer engagement metrics will be displayed here
                </p>
              </div>
            </TabsContent>
            <TabsContent value="acquisition" className="pt-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Customer acquisition metrics will be displayed here
                </p>
              </div>
            </TabsContent>
            <TabsContent value="conversion" className="pt-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Customer conversion metrics will be displayed here
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}