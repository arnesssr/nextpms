'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  RotateCcw, 
  Settings, 
  AlertCircle, 
  CheckCircle, 
  Package,
  TrendingDown
} from "lucide-react";

interface ReorderRule {
  id: string;
  itemName: string;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  status: 'active' | 'triggered' | 'disabled';
}

export default function AutoReorderComponent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [rules, setRules] = useState<ReorderRule[]>([
    {
      id: '1',
      itemName: 'Office Paper A4',
      currentStock: 50,
      reorderPoint: 100,
      reorderQuantity: 500,
      status: 'triggered'
    },
    {
      id: '2',
      itemName: 'Printer Ink Cartridge',
      currentStock: 25,
      reorderPoint: 20,
      reorderQuantity: 50,
      status: 'active'
    },
    {
      id: '3',
      itemName: 'Desk Chairs',
      currentStock: 8,
      reorderPoint: 5,
      reorderQuantity: 20,
      status: 'active'
    }
  ]);

  const triggeredRules = rules.filter(rule => rule.status === 'triggered');
  const activeRules = rules.filter(rule => rule.status === 'active');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <RotateCcw className="h-8 w-8 mr-3 text-blue-600" />
            Auto Reorder
          </h1>
          <p className="text-muted-foreground">
            Automatically generate purchase orders when stock levels fall below reorder points
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-reorder-toggle">Enable Auto Reorder</Label>
            <Switch 
              id="auto-reorder-toggle"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Triggered Rules</p>
                <p className="text-2xl font-bold text-red-600">{triggeredRules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">{activeRules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Monitored</p>
                <p className="text-2xl font-bold">{rules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Triggered Rules Section */}
      {triggeredRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Immediate Action Required
            </CardTitle>
            <CardDescription>
              The following items have fallen below their reorder points
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {triggeredRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                <div className="space-y-1">
                  <p className="font-medium">{rule.itemName}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Current: {rule.currentStock}</span>
                    <span>Reorder Point: {rule.reorderPoint}</span>
                    <span>Suggested Qty: {rule.reorderQuantity}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="destructive">
                    Create PO
                  </Button>
                  <Button size="sm" variant="outline">
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reorder Rules Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reorder Rules</CardTitle>
              <CardDescription>
                Manage automatic reorder points and quantities for your inventory items
              </CardDescription>
            </div>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Add New Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{rule.itemName}</p>
                    <Badge 
                      variant={rule.status === 'triggered' ? 'destructive' : 
                              rule.status === 'active' ? 'default' : 'secondary'}
                    >
                      {rule.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-6 mt-2">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Stock: {rule.currentStock}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Reorder at: {rule.reorderPoint}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Order qty: {rule.reorderQuantity}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    {rule.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Auto Reorder Settings</CardTitle>
          <CardDescription>
            Configure global settings for automatic reordering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="check-frequency">Check Frequency (hours)</Label>
              <Input id="check-frequency" type="number" defaultValue="24" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-time">Default Lead Time (days)</Label>
              <Input id="lead-time" type="number" defaultValue="7" />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Send email alerts when reorder rules are triggered
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-create Purchase Orders</p>
              <p className="text-sm text-muted-foreground">
                Automatically create POs without manual approval
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
