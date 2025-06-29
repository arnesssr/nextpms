'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  RefreshCw, 
  Database, 
  Cloud, 
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Download,
  Upload,
  Settings
} from "lucide-react";

interface SyncStatus {
  id: string;
  name: string;
  status: 'success' | 'error' | 'warning' | 'running' | 'idle';
  lastSync: string;
  nextSync: string;
  itemsProcessed: number;
  totalItems: number;
  message?: string;
}

export default function SyncToolsComponent() {
  const [isGlobalSyncing, setIsGlobalSyncing] = useState(false);
  
  const [syncStatuses] = useState<SyncStatus[]>([
    {
      id: '1',
      name: 'Stock Levels',
      status: 'success',
      lastSync: '2024-01-15 14:30:00',
      nextSync: '2024-01-15 15:00:00',
      itemsProcessed: 1245,
      totalItems: 1245,
      message: 'All stock levels synchronized successfully'
    },
    {
      id: '2',
      name: 'Product Catalog',
      status: 'warning',
      lastSync: '2024-01-15 14:25:00',
      nextSync: '2024-01-15 15:00:00',
      itemsProcessed: 890,
      totalItems: 892,
      message: '2 products failed validation'
    },
    {
      id: '3',
      name: 'Supplier Data',
      status: 'running',
      lastSync: '2024-01-15 14:20:00',
      nextSync: '2024-01-15 15:00:00',
      itemsProcessed: 45,
      totalItems: 120,
      message: 'Synchronizing supplier information...'
    },
    {
      id: '4',
      name: 'Price Updates',
      status: 'error',
      lastSync: '2024-01-15 13:30:00',
      nextSync: '2024-01-15 15:00:00',
      itemsProcessed: 0,
      totalItems: 567,
      message: 'Connection timeout - retrying in 5 minutes'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'idle': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'idle': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const runningCount = syncStatuses.filter(s => s.status === 'running').length;
  const errorCount = syncStatuses.filter(s => s.status === 'error').length;
  const successCount = syncStatuses.filter(s => s.status === 'success').length;

  const handleGlobalSync = () => {
    setIsGlobalSyncing(true);
    // Simulate sync process
    setTimeout(() => {
      setIsGlobalSyncing(false);
    }, 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <RefreshCw className="h-8 w-8 mr-3 text-blue-600" />
            Sync Tools
          </h1>
          <p className="text-muted-foreground">
            Synchronize inventory data with external systems and databases
          </p>
        </div>
        <Button 
          onClick={handleGlobalSync}
          disabled={isGlobalSyncing || runningCount > 0}
        >
          {isGlobalSyncing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Sync All
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Successful</p>
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Running</p>
                <p className="text-2xl font-bold text-blue-600">{runningCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Errors</p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Total Sources</p>
                <p className="text-2xl font-bold">{syncStatuses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common synchronization tasks and utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              <span>Import Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Upload className="h-6 w-6 mb-2" />
              <span>Export Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              <span>Sync Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle>Synchronization Status</CardTitle>
          <CardDescription>
            Monitor the status of all data synchronization processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {syncStatuses.map((sync) => (
              <div key={sync.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(sync.status)}
                    <h3 className="font-semibold">{sync.name}</h3>
                    <Badge className={getStatusColor(sync.status)}>
                      {sync.status}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {sync.status === 'running' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{sync.itemsProcessed} / {sync.totalItems} items</span>
                    </div>
                    <Progress value={(sync.itemsProcessed / sync.totalItems) * 100} />
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Last Sync:</span>
                    <br />
                    {sync.lastSync}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Next Sync:</span>
                    <br />
                    {sync.nextSync}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Items:</span>
                    <br />
                    {sync.itemsProcessed.toLocaleString()} / {sync.totalItems.toLocaleString()}
                  </div>
                </div>
                
                {sync.message && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                    {sync.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Data Sources</CardTitle>
          <CardDescription>
            Manage external systems and data connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-blue-500" />
                <div>
                  <h4 className="font-medium">Main Database</h4>
                  <p className="text-sm text-muted-foreground">PostgreSQL - Primary inventory database</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Connected
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Cloud className="h-6 w-6 text-purple-500" />
                <div>
                  <h4 className="font-medium">Cloud Backup</h4>
                  <p className="text-sm text-muted-foreground">AWS S3 - Automated backup storage</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Connected
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-6 w-6 text-orange-500" />
                <div>
                  <h4 className="font-medium">Supplier API</h4>
                  <p className="text-sm text-muted-foreground">External supplier product catalog</p>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                Rate Limited
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
