'use client';

import { useState } from 'react';
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
  const { stocks, isLoading: stocksLoading, error: stocksError } = useStock();
  const { adjustments, isLoading: adjustmentsLoading, error: adjustmentsError } = useAdjustments();
  const { movements, isLoading: movementsLoading, error: movementsError } = useMovements();

  // Mock product data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Wireless Headphones',
      description: 'Premium noise-cancelling wireless headphones',
      price: 299.99,
      categoryId: 'cat-1',
      images: ['https://via.placeholder.com/300x200'],
      status: 'published',
      stock: 45,
      sku: 'WH-001',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
    },
    {
      id: '2',
      name: 'Smart Watch Pro',
      description: 'Advanced fitness tracking smartwatch',
      price: 399.99,
      categoryId: 'cat-2',
      images: ['https://via.placeholder.com/300x200'],
      status: 'published',
      stock: 23,
      sku: 'SW-002',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-18T14:20:00Z',
    },
    {
      id: '3',
      name: 'Gaming Mouse',
      description: 'High-precision gaming mouse',
      price: 79.99,
      categoryId: 'cat-3',
      images: ['https://via.placeholder.com/300x200'],
      status: 'published',
      stock: 67,
      sku: 'GM-003',
      createdAt: '2024-01-25T11:30:00Z',
      updatedAt: '2024-01-26T09:15:00Z',
    },
    {
      id: '4',
      name: 'Bluetooth Speaker',
      description: 'Portable waterproof speaker',
      price: 149.99,
      categoryId: 'cat-1',
      images: ['https://via.placeholder.com/300x200'],
      status: 'published',
      stock: 8,
      sku: 'BS-004',
      createdAt: '2024-01-20T16:45:00Z',
      updatedAt: '2024-01-22T10:30:00Z',
    },
    {
      id: '5',
      name: 'USB-C Hub',
      description: '7-in-1 USB-C hub',
      price: 59.99,
      categoryId: 'cat-3',
      images: ['https://via.placeholder.com/300x200'],
      status: 'published',
      stock: 0,
      sku: 'UH-005',
      createdAt: '2024-01-05T08:20:00Z',
      updatedAt: '2024-01-30T13:45:00Z',
    },
    {
      id: '6',
      name: 'Wireless Charger',
      description: 'Fast wireless charging pad',
      price: 39.99,
      categoryId: 'cat-3',
      images: ['https://via.placeholder.com/300x200'],
      status: 'published',
      stock: 156,
      sku: 'WC-006',
      createdAt: '2024-01-12T14:20:00Z',
      updatedAt: '2024-01-15T11:30:00Z',
    }
  ];

  // Mock inventory data - will be replaced with real API calls
  const mockInventory: InventoryItem[] = [
    {
      id: 'inv-1',
      productId: '1',
      quantity: 45,
      reservedQuantity: 5,
      lowStockThreshold: 10,
      location: 'Warehouse A',
      lastUpdated: '2024-02-03T14:30:00Z'
    },
    {
      id: 'inv-2',
      productId: '2',
      quantity: 23,
      reservedQuantity: 3,
      lowStockThreshold: 15,
      location: 'Warehouse A',
      lastUpdated: '2024-02-03T12:15:00Z'
    },
    {
      id: 'inv-3',
      productId: '3',
      quantity: 67,
      reservedQuantity: 8,
      lowStockThreshold: 20,
      location: 'Warehouse B',
      lastUpdated: '2024-02-03T16:20:00Z'
    },
    {
      id: 'inv-4',
      productId: '4',
      quantity: 8,
      reservedQuantity: 2,
      lowStockThreshold: 10,
      location: 'Warehouse A',
      lastUpdated: '2024-02-03T09:45:00Z'
    },
    {
      id: 'inv-5',
      productId: '5',
      quantity: 0,
      reservedQuantity: 0,
      lowStockThreshold: 5,
      location: 'Warehouse B',
      lastUpdated: '2024-02-02T18:30:00Z'
    },
    {
      id: 'inv-6',
      productId: '6',
      quantity: 156,
      reservedQuantity: 12,
      lowStockThreshold: 25,
      location: 'Warehouse A',
      lastUpdated: '2024-02-03T11:10:00Z'
    }
  ];

  // Create a map for quick product lookup
  const productMap = mockProducts.reduce((map, product) => {
    map[product.id] = product;
    return map;
  }, {} as Record<string, Product>);

  // Enhanced inventory data with product info
  const enhancedInventory = mockInventory.map(item => ({
    ...item,
    product: productMap[item.productId]
  }));

  // Calculate stats
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
  const locations = [...new Set(mockInventory.map(item => item.location))];

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
                  
                  <InventoryTable 
                    inventory={filteredInventory}
                    onStockAdjustment={handleStockAdjustment}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="stock" className="mt-6">
                <StockList stocks={stocks} />
              </TabsContent>
              
              <TabsContent value="movements" className="mt-6">
                <MovementsList movements={movements} />
              </TabsContent>
              
              <TabsContent value="adjustments" className="mt-6">
                <AdjustmentsList adjustments={adjustments} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>



        {/* Stock Adjustment Modal */}
        <StockAdjustmentModal
          isOpen={isAdjustmentModalOpen}
          onClose={handleModalClose}
          item={selectedItem}
          products={mockProducts}
        />
      </div>
    </SidebarLayout>
  );
}
