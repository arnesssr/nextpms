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
  RotateCcw
} from 'lucide-react';
import { InventoryItem, Product } from '@/types';

// Import module components
import { AdjustmentsList } from './inventory-modules/adjustments/components/AdjustmentsList';
import { CreateAdjustmentModal } from './inventory-modules/adjustments/components/CreateAdjustmentModal';
import { MovementsList } from './inventory-modules/movements/components/MovementsList';
import { StockInModal } from './inventory-modules/movements/components/StockInModal';
import { StockOutModal } from './inventory-modules/movements/components/StockOutModal';
import StockList from './inventory-modules/stock/components/StockList';

// Import hooks
import { useAdjustments } from './inventory-modules/adjustments/hooks/useAdjustments';
import { useMovements } from './inventory-modules/movements/hooks/useMovements';
import { useStock } from './inventory-modules/stock/hooks/useStock';

// Import types
import { CreateAdjustmentRequest } from './inventory-modules/adjustments/types/adjustments.types';
import { CreateMovementRequest } from './inventory-modules/movements/types/movements.types';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Use hooks for module data
  const { stocks, loading: stocksLoading, error: stocksError, fetchStocks } = useStock();
  const { adjustments, loading: adjustmentsLoading, error: adjustmentsError } = useAdjustments();
  const { movements, loading: movementsLoading, error: movementsError } = useMovements();

  // Load data on component mount
  useEffect(() => {
    console.log('InventoryPage: Component mounted, calling fetchStocks');
    fetchStocks();
  }, []); // Empty dependency array to run only once on mount

  // Debug log when stocks data changes
  useEffect(() => {
    console.log('InventoryPage: Stocks data changed:', {
      stocksLength: stocks.length,
      stocks: stocks,
      stocksLoading,
      stocksError
    });
  }, [stocks, stocksLoading, stocksError]);

  // Add temporary direct product fetch for display
  const [tempProducts, setTempProducts] = useState([]);
  const [tempLoading, setTempLoading] = useState(false);

  const fetchProductsDirectly = async () => {
    setTempLoading(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      console.log('Direct products fetch:', data);
      if (data.data) {
        setTempProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products directly:', error);
    } finally {
      setTempLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsDirectly();
  }, []);

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
        price: productData.selling_price || stock.unitPrice || 0,
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

  // Get unique locations for filter
  const locations = [...new Set(enhancedInventory.map(item => item.location))];

  return (
    <SidebarLayout>
      <div className="space-y-6">
{/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
            <p className="text-muted-foreground">
              Monitor and manage your stock levels
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Stock
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={() => {
              // TODO: Implement auto reorder functionality
              console.log('Auto reorder triggered');
            }}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Auto Reorder
            </Button>
            <Button variant="outline" onClick={() => {
              // TODO: Implement generate purchase orders functionality
              console.log('Generate purchase orders triggered');
            }}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Generate PO
            </Button>
            <Button onClick={() => setIsAdjustmentModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adjust Stock
            </Button>
          </div>
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
                  {/* Debug Info */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800">Debug Info:</h4>
                    <div className="text-sm text-yellow-700 mt-2 space-y-1">
                      <p>Stocks Loading: {stocksLoading ? 'Yes' : 'No'}</p>
                      <p>Stocks Count: {stocks.length}</p>
                      <p>Stocks Error: {stocksError || 'None'}</p>
                      <p>Temp Products Count: {tempProducts.length}</p>
                      <p>Temp Loading: {tempLoading ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  
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
                          {locations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Temporary Products Display */}
                  {tempProducts.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold mb-3 text-green-700">📦 Temporary Products Display (Real Data):</h4>
                      <div className="bg-white rounded-lg shadow border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {tempProducts.map((product: any) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.sku || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {product.stock_quantity || 0}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      (product.stock_quantity || 0) > 10
                                        ? 'bg-green-100 text-green-800'
                                        : (product.stock_quantity || 0) > 0
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {(product.stock_quantity || 0) > 10 ? 'In Stock' : (product.stock_quantity || 0) > 0 ? 'Low Stock' : 'Out of Stock'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${product.selling_price || '0.00'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Original Inventory Table */}
                  <div className="mb-6">
                    <h4 className="text-md font-semibold mb-3 text-blue-700">📋 Inventory API Data:</h4>
                    <InventoryTable 
                      inventory={filteredInventory}
                      onStockAdjustment={handleStockAdjustment}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="stock" className="mt-6">
                <div className="space-y-4">
                  {/* Stock Tab Debug Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800">Stock Tab Debug:</h4>
                    <div className="text-sm text-blue-700 mt-2 space-y-1">
                      <p>Loading: {stocksLoading ? 'Yes' : 'No'}</p>
                      <p>Error: {stocksError || 'None'}</p>
                      <p>Stocks Count: {stocks.length}</p>
                    </div>
                  </div>
                  
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
                    <StockList stocks={stocks} />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="movements" className="mt-6">
                <div className="space-y-4">
                  {/* Movements Tab Debug Info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800">Movements Tab Debug:</h4>
                    <div className="text-sm text-green-700 mt-2 space-y-1">
                      <p>Loading: {movementsLoading ? 'Yes' : 'No'}</p>
                      <p>Error: {movementsError || 'None'}</p>
                      <p>Movements Count: {movements.length}</p>
                    </div>
                  </div>
                  
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
                    <MovementsList movements={movements} />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="adjustments" className="mt-6">
                <div className="space-y-4">
                  {/* Adjustments Tab Debug Info */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800">Adjustments Tab Debug:</h4>
                    <div className="text-sm text-purple-700 mt-2 space-y-1">
                      <p>Loading: {adjustmentsLoading ? 'Yes' : 'No'}</p>
                      <p>Error: {adjustmentsError || 'None'}</p>
                      <p>Adjustments Count: {adjustments.length}</p>
                    </div>
                  </div>
                  
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
                    <AdjustmentsList adjustments={adjustments} />
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
          products={[]}
        />
      </div>
    </SidebarLayout>
  );
}
