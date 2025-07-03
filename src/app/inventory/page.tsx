'use client';

import { useState, useEffect } from 'react';
import { SidebarLayout } from '@/components/layout/Sidebar';
import { InventoryTable } from '@/components/tables/InventoryTable';
import { StockAdjustmentModal } from '@/components/forms/StockAdjustmentModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  DollarSign,
  BarChart3,
  Zap,
  Settings,
  ArrowUp,
  ArrowDown,
  Activity,
  CheckCircle,
  Clock,
  ShoppingCart,
  RotateCcw,
  Building2
} from 'lucide-react';
import { InventoryItem, Product } from '@/types';

// Import module components
import { AdjustmentsList } from './inventory-modules/adjustments/components/AdjustmentsList';
import { CreateAdjustmentModal } from './inventory-modules/adjustments/components/CreateAdjustmentModal';
import { MovementsList } from './inventory-modules/movements/components/MovementsList';
import { StockInModal } from './inventory-modules/movements/components/StockInModal';
import { StockOutModal } from './inventory-modules/movements/components/StockOutModal';
import StockList from './inventory-modules/stock/components/StockList';
import { WarehouseList } from './inventory-modules/warehouses/components/WarehouseList';

// Import hooks
import { useAdjustments } from './inventory-modules/adjustments/hooks/useAdjustments';
import { useMovements } from './inventory-modules/movements/hooks/useMovements';
import { useStock } from './inventory-modules/stock/hooks/useStock';
import { useDefaultWarehouse } from './inventory-modules/warehouses/hooks/useWarehouses';

// Import types
import { CreateAdjustmentRequest } from './inventory-modules/adjustments/types/adjustments.types';
import { CreateMovementRequest } from './inventory-modules/movements/types/movements.types';
import { Warehouse } from './inventory-modules/warehouses/types/warehouse.types';
import { StockService } from './inventory-modules/stock/services/stockService';
// Import dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BulkStockLevelsModal from './inventory-modules/stock/components/BulkStockLevelsModal';
import { BulkReorderPointsModal } from '@/components/modals/BulkReorderPointsModal';
import { AutoReorderConfirmationModal } from '@/components/modals/AutoReorderConfirmationModal';
import StockDetailModal from './inventory-modules/stock/components/StockDetailModal';
import StockEditModal from './inventory-modules/stock/components/StockEditModal';
import PurchaseOrderModal from './inventory-modules/purchase-orders/components/PurchaseOrderModal';
import AutoReorderModal from './inventory-modules/auto-reorder/components/AutoReorderModal';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isEditStockModalOpen, setIsEditStockModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isWarehouseManagementOpen, setIsWarehouseManagementOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBulkReorderPointsModalOpen, setIsBulkReorderPointsModalOpen] = useState(false);
  const [isStockDetailOpen, setIsStockDetailOpen] = useState(false);
  const [selectedStockForView, setSelectedStockForView] = useState(null);
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] = useState(false);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);

  // Use hooks for module data
  const { stocks, loading: stocksLoading, error: stocksError, fetchStocks } = useStock();
  const { adjustments, loading: adjustmentsLoading, error: adjustmentsError } = useAdjustments();
  const { 
    movements, 
    loading: movementsLoading, 
    error: movementsError, 
    createMovement,
    deleteMovement,
    refreshData: refreshMovements
  } = useMovements();
  const { defaultWarehouse, loading: defaultWarehouseLoading, error: warehouseError } = useDefaultWarehouse();
  
  // State for warehouses and locations
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Load data on component mount
  useEffect(() => {
    console.log('InventoryPage: Component mounted, calling fetchStocks');
    fetchStocks();
    loadWarehousesAndSuppliers();
  }, []); // Empty dependency array to run only once on mount

  // Load warehouses and suppliers for modals
  const loadWarehousesAndSuppliers = async () => {
    try {
      // Load warehouses
      const warehousesResponse = await fetch('/api/warehouses');
      if (warehousesResponse.ok) {
        const warehousesData = await warehousesResponse.json();
        const warehouseNames = warehousesData.data?.map((w: any) => w.name) || [];
        setWarehouses(warehouseNames);
        setLocations(warehouseNames);
      }

      // Load suppliers (mock data for now - you can replace with actual API call)
      setSuppliers(['AudioTech Ltd', 'SmartTech Corp', 'ElectroSupply Inc', 'TechVendor Co']);
    } catch (error) {
      console.error('Error loading warehouses and suppliers:', error);
      // Fallback to default values
      setWarehouses(['Main Warehouse']);
      setLocations(['Main Warehouse']);
      setSuppliers(['AudioTech Ltd', 'SmartTech Corp', 'ElectroSupply Inc', 'TechVendor Co']);
    }
  };

  // Set default warehouse when loaded
  useEffect(() => {
    if (defaultWarehouse && selectedWarehouseId === 'all') {
      setSelectedWarehouseId(defaultWarehouse.id);
      setSelectedWarehouse(defaultWarehouse);
    }
  }, [defaultWarehouse, selectedWarehouseId]);

  // Debug log when stocks data changes
  useEffect(() => {
    console.log('InventoryPage: Stocks data changed:', {
      stocksLength: stocks.length,
      stocks: stocks,
      stocksLoading,
      stocksError
    });
  }, [stocks, stocksLoading, stocksError]);


  // Convert stocks data to match the InventoryTable format from API response
  const enhancedInventory = stocks.map(stock => {
    // Handle both direct stock data and nested product data from API
    const productData = stock.products || stock.product || {};
    
    return {
      id: stock.id,
      productId: stock.product_id || stock.productId || stock.id,
      quantity: stock.quantity_on_hand || stock.currentQuantity || 0,
      reservedQuantity: stock.quantity_reserved || stock.reservedQuantity || 0,
      lowStockThreshold: stock.min_stock_level || stock.minimumQuantity || 0,
      location: stock.location_name || stock.location || 'Unknown',
      lastUpdated: stock.updated_at || stock.lastUpdated || new Date().toISOString(),
      product: {
        id: stock.product_id || stock.productId || stock.id,
        name: productData.name || stock.productName || 'Unknown Product',
        sku: productData.sku || stock.productSku || 'N/A',
        price: productData.selling_price || productData.cost_price || stock.unit_cost || stock.unitPrice || stock.costPerUnit || 0,
        status: 'published' as const
      }
    };
  });

  // Calculate stats from real data
  const totalProducts = enhancedInventory.length;
  const totalStockValue = enhancedInventory.reduce((sum, item) => 
    sum + (item.quantity * (item.product?.price || 0)), 0
  );
  const lowStockItems = enhancedInventory.filter(item => 
    item.quantity <= item.lowStockThreshold && item.quantity > 0
  ).length;
  const outOfStockItems = enhancedInventory.filter(item => item.quantity === 0).length;
  const totalReservedItems = enhancedInventory.reduce((sum, item) => sum + item.reservedQuantity, 0);

  // Filter inventory based on search and filters
  const filteredInventory = enhancedInventory.filter(item => {
    const product = item.product;
    const matchesSearch = product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product?.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'low-stock') {
      matchesStatus = item.quantity <= item.lowStockThreshold && item.quantity > 0;
    } else if (statusFilter === 'out-of-stock') {
      matchesStatus = item.quantity === 0;
    } else if (statusFilter === 'in-stock') {
      matchesStatus = item.quantity > item.lowStockThreshold;
    }
    
    const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleStockAdjustment = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsAdjustmentModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAdjustmentModalOpen(false);
    setSelectedItem(null);
  };

  // Stock action handlers
  const handleEditStock = (stock: any) => {
    setSelectedStock(stock);
    setIsEditStockModalOpen(true);
  };

  const handleDeleteStock = async (stockId: string) => {
    const stockItem = stocks.find(s => s.id === stockId);
    const confirmMessage = stockItem 
      ? `Are you sure you want to delete "${stockItem.productName}" (SKU: ${stockItem.productSku})?\n\nThis action cannot be undone.`
      : 'Are you sure you want to delete this stock item? This action cannot be undone.';
    
    if (window.confirm(confirmMessage)) {
      try {
        await StockService.deleteStock(stockId);
        console.log('Successfully deleted stock with ID:', stockId);
        // Refresh the stocks after deletion
        fetchStocks();
        alert('Stock item deleted successfully.');
      } catch (error) {
        console.error('Failed to delete stock:', error);
        alert('Failed to delete stock item. Please try again.');
      }
    }
  };

  const handleViewStock = (stock: any) => {
    console.log('View stock details:', stock);
    setSelectedStockForView(stock);
    setIsStockDetailOpen(true);
  };

  const handleEditStockModalClose = () => {
    setIsEditStockModalOpen(false);
    setSelectedStock(null);
  };

  // Warehouse change handler
  const handleWarehouseChange = (warehouseId: string, warehouse: Warehouse | null) => {
    console.log('Warehouse changed:', warehouseId, warehouse);
    setSelectedWarehouseId(warehouseId);
    setSelectedWarehouse(warehouse);
    
    // Fetch stocks for the selected warehouse
    if (warehouseId === 'all') {
      fetchStocks();
    } else {
      fetchStocks({ warehouseId });
    }
  };

  // Get unique locations for filter
  const inventoryLocations = [...new Set(enhancedInventory.map(item => item.location))];

  // Action handlers for overview buttons
  const [isLoading, setIsLoading] = useState(false);

  const handleSyncStock = async () => {
    setIsLoading(true);
    try {
      console.log('Syncing stock data...');
      await fetchStocks();
      // Also sync with API utility endpoint
      const response = await fetch('/api/inventory/utilities/sync-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      console.log('Sync result:', result);
      alert('Stock data synced successfully!');
    } catch (error) {
      console.error('Error syncing stock:', error);
      alert('Failed to sync stock data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportInventory = () => {
    try {
      const csvData = [
        ['Product Name', 'SKU', 'Current Stock', 'Reserved', 'Location', 'Value', 'Status'],
        ...filteredInventory.map(item => [
          item.product?.name || 'N/A',
          item.product?.sku || 'N/A',
          item.quantity.toString(),
          item.reservedQuantity.toString(),
          item.location,
          `$${(item.quantity * (item.product?.price || 0)).toFixed(2)}`,
          item.quantity === 0 ? 'Out of Stock' : 
            item.quantity <= item.lowStockThreshold ? 'Low Stock' : 'In Stock'
        ])
      ];
      
      const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Inventory exported successfully');
    } catch (error) {
      console.error('Error exporting inventory:', error);
      alert('Failed to export inventory. Please try again.');
    }
  };

  const handleAutoReorder = async () => {
    try {
      console.log('Triggering auto reorder for low stock items...');
      const lowStockItems = enhancedInventory.filter(item => 
        item.quantity <= item.lowStockThreshold && item.quantity > 0
      );
      
      if (lowStockItems.length === 0) {
        alert('No low stock items found that require reordering.');
        return;
      }
      
      const message = `Found ${lowStockItems.length} items with low stock:\n\n` +
        lowStockItems.slice(0, 5).map(item => 
          `• ${item.product?.name} (${item.product?.sku}): ${item.quantity} remaining`
        ).join('\n') +
        (lowStockItems.length > 5 ? `\n...and ${lowStockItems.length - 5} more` : '') +
        '\n\nWould you like to generate purchase orders for these items?';
      
      if (confirm(message)) {
        setIsPurchaseOrderModalOpen(true);
      }
    } catch (error) {
      console.error('Error in auto reorder:', error);
      alert('Failed to process auto reorder. Please try again.');
    }
  };

  const handleBulkReorderPoints = () => {
    // Open the dedicated bulk reorder points modal
    setIsBulkReorderPointsModalOpen(true);
  };

  // Movement handlers
  const handleStockInSave = async (request: CreateMovementRequest) => {
    console.log('Creating stock in movement:', request);
    try {
      const newMovement = await createMovement(request);
      if (newMovement) {
        console.log('Stock in created successfully:', newMovement);
        alert('Stock in recorded successfully');
        setIsStockInModalOpen(false);
        // Refresh stock data to reflect changes
        fetchStocks();
      }
    } catch (error) {
      console.error('Failed to create stock in movement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to record stock in';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleStockOutSave = async (request: CreateMovementRequest) => {
    console.log('Creating stock out movement:', request);
    try {
      const newMovement = await createMovement(request);
      if (newMovement) {
        console.log('Stock out created successfully:', newMovement);
        alert('Stock out recorded successfully');
        setIsStockOutModalOpen(false);
        // Refresh stock data to reflect changes
        fetchStocks();
      }
    } catch (error) {
      console.error('Failed to create stock out movement:', error);
      alert('Failed to record stock out');
    }
  };

  const handleDeleteMovement = async (id: string) => {
    if (confirm('Are you sure you want to delete this movement?')) {
      try {
        const success = await deleteMovement(id);
        if (success) {
          alert('Movement deleted successfully');
          // Refresh stock data to reflect changes
          fetchStocks();
        }
      } catch (error) {
        console.error('Failed to delete movement:', error);
        alert('Failed to delete movement');
      }
    }
  };

  const handleViewMovement = (movement: any) => {
    console.log('Viewing movement:', movement);
    alert(`Viewing movement: ${movement.id}`);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
{/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          </div>
          <TooltipProvider>
            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleSyncStock}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isLoading ? 'Syncing stock data...' : 'Sync Stock Data'}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleExportInventory}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export Inventory Data</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsWarehouseManagementOpen(true)}
                  >
                    <Building2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Manage Warehouses</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleAutoReorder}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Auto Reorder Low Stock Items</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsBulkModalOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bulk Stock Level Management</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleBulkReorderPoints}
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bulk Set Reorder Points</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsPurchaseOrderModalOpen(true)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate Purchase Order</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon"
                    onClick={() => setIsAdjustmentModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create Stock Adjustment</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Inventory Modules Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>
              Manage your inventory across all modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="stock">
                  <Package className="mr-2 h-4 w-4" />
                  Stock
                </TabsTrigger>
                <TabsTrigger value="movements">
                  <Activity className="mr-2 h-4 w-4" />
                  Movements
                </TabsTrigger>
                <TabsTrigger value="adjustments">
                  <Settings className="mr-2 h-4 w-4" />
                  Adjustments
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Inventory Overview</h3>
                    <div className="flex space-x-2">
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search products..."
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
                          <SelectItem value="all">All Stock</SelectItem>
                          <SelectItem value="in-stock">In Stock</SelectItem>
                          <SelectItem value="low-stock">Low Stock</SelectItem>
                          <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {inventoryLocations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  
                  {/* Inventory Table */}
                  <div className="mb-6">
                    <InventoryTable 
                      inventory={filteredInventory}
                      onStockAdjustment={handleStockAdjustment}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="stock" className="mt-6">
                <div className="space-y-4">
                  
                  {stocksLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading stock data...</p>
                      </div>
                    </div>
                  ) : stocksError ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 font-medium">Error loading stock data</p>
                        <p className="text-sm text-gray-600">{stocksError}</p>
                        <Button onClick={fetchStocks} className="mt-3" size="sm">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retry
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <StockList 
                      stocks={stocks} 
                      onEdit={handleEditStock}
                      onDelete={handleDeleteStock}
                      onView={handleViewStock}
                      selectedWarehouseId={selectedWarehouseId}
                      onWarehouseChange={handleWarehouseChange}
                    />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="movements" className="mt-6">
                <div className="space-y-4">
                  
                  {movementsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading movements data...</p>
                      </div>
                    </div>
                  ) : movementsError ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 font-medium">Error loading movements data</p>
                        <p className="text-sm text-gray-600">{movementsError}</p>
                      </div>
                    </div>
                  ) : (
                    <MovementsList 
                      movements={movements}
                      loading={movementsLoading}
                      onRefresh={refreshMovements}
                      onDelete={handleDeleteMovement}
                      onView={handleViewMovement}
                      onCreateStockIn={() => setIsStockInModalOpen(true)}
                      onCreateStockOut={() => setIsStockOutModalOpen(true)}
                    />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="adjustments" className="mt-6">
                <div className="space-y-4">
                  
                  {adjustmentsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading adjustments data...</p>
                      </div>
                    </div>
                  ) : adjustmentsError ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 font-medium">Error loading adjustments data</p>
                        <p className="text-sm text-gray-600">{adjustmentsError}</p>
                      </div>
                    </div>
                  ) : (
                    <AdjustmentsList 
                      adjustments={adjustments}
                      loading={adjustmentsLoading}
                      showStats={false}
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>



        {/* Stock Adjustment Modal */}
        <StockAdjustmentModal
          isOpen={isAdjustmentModalOpen}
          onClose={handleModalClose}
          item={selectedItem}
          products={stocks.map(stock => ({
            id: stock.id,
            name: stock.productName,
            sku: stock.productSku,
            price: stock.costPerUnit || 0,
            stock: stock.currentQuantity,
            images: [],
            status: 'published' as const
          }))}
        />

        {/* Bulk Stock Levels Management */}
        <BulkStockLevelsModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={fetchStocks}
        />

        {/* Bulk Reorder Points Management */}
        <BulkReorderPointsModal
          isOpen={isBulkReorderPointsModalOpen}
          onClose={() => setIsBulkReorderPointsModalOpen(false)}
          onSuccess={fetchStocks}
        />

        {/* Stock Detail Modal */}
        <StockDetailModal
          isOpen={isStockDetailOpen}
          stock={selectedStockForView}
          onClose={() => setIsStockDetailOpen(false)}
          onEdit={handleEditStock}
        />

        <StockEditModal
          isOpen={isEditStockModalOpen}
          stock={selectedStock}
          onClose={handleEditStockModalClose}
          onSave={fetchStocks}
        />

        {/* Warehouse Management Modal */}
        {/* Purchase Order Modal */}
        <PurchaseOrderModal
          isOpen={isPurchaseOrderModalOpen}
          onClose={() => setIsPurchaseOrderModalOpen(false)}
          suppliers={[
            { id: '1', name: 'Supplier A', email: 'supplier.a@example.com', status: 'active' },
            { id: '2', name: 'Supplier B', email: 'supplier.b@example.com', status: 'active' },
            { id: '3', name: 'Supplier C', email: 'supplier.c@example.com', status: 'active' }
          ]}
          products={stocks.map(stock => ({
            id: stock.id,
            productId: stock.id,
            productName: stock.productName,
            productSku: stock.productSku,
            quantity: 1,
            unitPrice: stock.costPerUnit || 0,
            totalPrice: stock.costPerUnit || 0
          }))}
        />

        <Dialog open={isWarehouseManagementOpen} onOpenChange={setIsWarehouseManagementOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Warehouse Management</span>
              </DialogTitle>
              <DialogDescription>
                Manage your warehouse locations, view inventory distribution, and configure settings.
              </DialogDescription>
            </DialogHeader>
            <WarehouseList 
              selectedWarehouseId={selectedWarehouseId}
              onWarehouseSelect={(warehouse) => {
                setSelectedWarehouseId(warehouse.id);
                setSelectedWarehouse(warehouse);
                console.log('Selected warehouse:', warehouse);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Stock In Modal */}
        <StockInModal
          isOpen={isStockInModalOpen}
          onClose={() => setIsStockInModalOpen(false)}
          onSave={handleStockInSave}
          locations={locations.length > 0 ? locations : ['Main Warehouse']}
          suppliers={suppliers}
        />

        {/* Stock Out Modal */}
        <StockOutModal
          isOpen={isStockOutModalOpen}
          onClose={() => setIsStockOutModalOpen(false)}
          onSave={handleStockOutSave}
          locations={locations.length > 0 ? locations : ['Main Warehouse']}
          customers={['Tech Solutions Inc', 'Digital Corp', 'Innovation Labs', 'Future Systems']}
        />
      </div>
    </SidebarLayout>
  );
}
