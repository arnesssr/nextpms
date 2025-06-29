'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  RotateCcw, 
  RefreshCw, 
  FileBarChart, 
  AlertTriangle,
  TrendingUp,
  Package,
  Settings
} from "lucide-react";

export default function InventoryToolsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Tools</h1>
        <p className="text-muted-foreground">
          Manage your inventory operations with automated tools and utilities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Auto Reorder Tool */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Auto Reorder</CardTitle>
            </div>
            <CardDescription>
              Automatically generate purchase orders when stock levels fall below reorder points
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Items monitored</span>
              <span className="text-sm font-medium">247</span>
            </div>
            <Separator />
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                View Rules
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Orders */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Purchase Orders</CardTitle>
            </div>
            <CardDescription>
              Create and manage purchase orders for inventory replenishment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending POs</span>
              <Badge variant="secondary">12</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This month</span>
              <span className="text-sm font-medium">₱245,000</span>
            </div>
            <Separator />
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1">
                Create PO
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                View All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sync Tools */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Sync Tools</CardTitle>
            </div>
            <CardDescription>
              Synchronize inventory data with external systems and warehouses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last sync</span>
              <span className="text-sm font-medium">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connected systems</span>
              <Badge variant="outline">3</Badge>
            </div>
            <Separator />
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1">
                Sync Now
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Reports */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileBarChart className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Inventory Reports</CardTitle>
            </div>
            <CardDescription>
              Generate detailed reports and analytics for inventory management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Scheduled reports</span>
              <Badge variant="outline">5</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last generated</span>
              <span className="text-sm font-medium">Today</span>
            </div>
            <Separator />
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1">
                Generate
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
            </div>
            <CardDescription>
              Monitor and manage low stock alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active alerts</span>
              <Badge variant="destructive">8</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Critical items</span>
              <span className="text-sm font-medium text-red-600">3</span>
            </div>
            <Separator />
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1">
                View Alerts
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demand Forecasting */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg">Demand Forecasting</CardTitle>
            </div>
            <CardDescription>
              Predict future inventory needs based on historical data and trends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Accuracy rate</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                89%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Forecast period</span>
              <span className="text-sm font-medium">90 days</span>
            </div>
            <Separator />
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1">
                View Forecast
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Commonly used inventory management actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <RotateCcw className="h-4 w-4 mr-2" />
              Bulk Reorder
            </Button>
            <Button variant="outline" className="justify-start">
              <FileBarChart className="h-4 w-4 mr-2" />
              Export Inventory
            </Button>
            <Button variant="outline" className="justify-start">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All Systems
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
