'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  Package, 
  Activity, 
  Settings, 
  Building2,
  BarChart3,
  Wrench
} from 'lucide-react';

// Import module components
import StockList from '../inventory-modules/stock/components/StockList';
import { MovementsList } from '../inventory-modules/movements/components/MovementsList';
import { AdjustmentsList } from '../inventory-modules/adjustments/components/AdjustmentsList';
import { WarehouseList } from '../inventory-modules/warehouses/components/WarehouseList';

interface InventoryTabsProps {
  // Stock props
  stocks: any[];
  stocksLoading: boolean;
  stocksError: string | null;
  onEditStock?: (stock: any) => void;
  onDeleteStock?: (stockId: string) => void;
  onViewStock?: (stock: any) => void;
  selectedWarehouseId?: string;
  onWarehouseChange?: (warehouseId: string, warehouse: any) => void;
  onStockRefresh?: () => void;
  
  // Movements props
  movements: any[];
  movementsLoading: boolean;
  movementsError: string | null;
  onDeleteMovement?: (id: string) => void;
  onViewMovement?: (movement: any) => void;
  onMovementsRefresh?: () => void;
  onCreateStockIn?: () => void;
  onCreateStockOut?: () => void;
  
  // Adjustments props
  adjustments: any[];
  adjustmentsLoading: boolean;
  adjustmentsError: string | null;
  
  // Warehouse props
  onWarehouseSelect?: (warehouse: any) => void;
}

const inventoryModules = [
  {
    id: 'overview',
    label: 'Overview',
    icon: BarChart3,
    description: 'Inventory overview and statistics'
  },
  {
    id: 'stock',
    label: 'Stock',
    icon: Package,
    description: 'Manage stock levels and items'
  },
  {
    id: 'movements',
    label: 'Movements',
    icon: Activity,
    description: 'Track stock in and out movements'
  },
  {
    id: 'adjustments',
    label: 'Adjustments',
    icon: Settings,
    description: 'Stock adjustments and corrections'
  },
  {
    id: 'warehouses',
    label: 'Warehouses',
    icon: Building2,
    description: 'Manage warehouse locations'
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: Wrench,
    description: 'Inventory utilities and tools'
  }
];

export const InventoryTabs: React.FC<InventoryTabsProps> = ({
  stocks,
  stocksLoading,
  stocksError,
  onEditStock,
  onDeleteStock,
  onViewStock,
  selectedWarehouseId,
  onWarehouseChange,
  onStockRefresh,
  movements,
  movementsLoading,
  movementsError,
  onDeleteMovement,
  onViewMovement,
  onMovementsRefresh,
  onCreateStockIn,
  onCreateStockOut,
  adjustments,
  adjustmentsLoading,
  adjustmentsError,
  onWarehouseSelect
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = (moduleId: string) => {
    switch (moduleId) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">{stocks.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Stock Value</p>
                    <p className="text-2xl font-bold">
                      ${stocks.reduce((sum, item) => 
                        sum + ((item.quantity_on_hand || 0) * (item.unit_cost || 0)), 0
                      ).toFixed(2)}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                    <p className="text-2xl font-bold">
                      {stocks.filter(item => 
                        (item.quantity_on_hand || 0) <= (item.min_stock_level || 0) && 
                        (item.quantity_on_hand || 0) > 0
                      ).length}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-500" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                    <p className="text-2xl font-bold">
                      {stocks.filter(item => (item.quantity_on_hand || 0) === 0).length}
                    </p>
                  </div>
                  <Settings className="h-8 w-8 text-red-500" />
                </div>
              </Card>
            </div>
            
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={onCreateStockIn}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Activity className="h-6 w-6 mb-2 text-green-600" />
                    <p className="text-sm font-medium">Stock In</p>
                  </button>
                  <button
                    onClick={onCreateStockOut}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Activity className="h-6 w-6 mb-2 text-red-600" />
                    <p className="text-sm font-medium">Stock Out</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('adjustments')}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-6 w-6 mb-2 text-blue-600" />
                    <p className="text-sm font-medium">Adjustment</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('warehouses')}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Building2 className="h-6 w-6 mb-2 text-purple-600" />
                    <p className="text-sm font-medium">Warehouses</p>
                  </button>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Movements</h3>
                <MovementsList 
                  movements={movements.slice(0, 5)}
                  loading={movementsLoading}
                  onRefresh={onMovementsRefresh}
                  onDelete={onDeleteMovement}
                  onView={onViewMovement}
                  onCreateStockIn={onCreateStockIn}
                  onCreateStockOut={onCreateStockOut}
                  showStats={false}
                  showActions={false}
                />
              </div>
            </Card>
          </div>
        );
      
      case 'stock':
        return (
          <StockList 
            stocks={stocks} 
            onEdit={onEditStock}
            onDelete={onDeleteStock}
            onView={onViewStock}
            selectedWarehouseId={selectedWarehouseId}
            onWarehouseChange={onWarehouseChange}
          />
        );
      
      case 'movements':
        return (
          <MovementsList 
            movements={movements}
            loading={movementsLoading}
            onRefresh={onMovementsRefresh}
            onDelete={onDeleteMovement}
            onView={onViewMovement}
            onCreateStockIn={onCreateStockIn}
            onCreateStockOut={onCreateStockOut}
          />
        );
      
      case 'adjustments':
        return (
          <AdjustmentsList 
            adjustments={adjustments}
            loading={adjustmentsLoading}
            showStats={false}
          />
        );
        
      case 'warehouses':
        return (
          <WarehouseList 
            selectedWarehouseId={selectedWarehouseId}
            onWarehouseSelect={onWarehouseSelect}
          />
        );
        
      case 'tools':
        return (
          <div className="text-center py-12">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Inventory tools coming soon</p>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Module content not available</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1">
          {inventoryModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <TabsTrigger
                key={module.id}
                value={module.id}
                className="flex flex-col items-center justify-center py-3 px-4 space-y-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <IconComponent size={18} />
                <span className="text-xs font-medium hidden sm:block">{module.label}</span>
                <span className="text-xs text-muted-foreground sm:hidden">{module.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content */}
        {inventoryModules.map((module) => (
          <TabsContent key={module.id} value={module.id} className="mt-6">
            {renderTabContent(module.id)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
