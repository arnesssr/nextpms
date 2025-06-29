'use client';

import React, { useState } from 'react';
import { SidebarLayout } from '@/components/layout/Sidebar';
import { MovementsList } from './components/MovementsList';
import { StockInModal } from './components/StockInModal';
import { StockOutModal } from './components/StockOutModal';
import { useMovements } from './hooks/useMovements';
import { CreateMovementRequest, Movement } from './types/movements.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function MovementsPage() {
  const {
    movements,
    summary,
    loading,
    creating,
    error,
    filter,
    loadMovements,
    loadSummary,
    createMovement,
    deleteMovement,
    setFilter,
    refreshData
  } = useMovements();

  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

  // Mock data for dropdowns
  const locations = ['Warehouse A', 'Warehouse B', 'Store Front', 'Distribution Center'];
  const suppliers = ['AudioTech Ltd', 'SmartTech Corp', 'ElectroSupply Inc', 'TechVendor Co'];
  const customers = ['Tech Solutions Inc', 'Digital Corp', 'Innovation Labs', 'Future Systems'];

  const handleStockInSave = async (request: CreateMovementRequest) => {
    const newMovement = await createMovement(request);
    if (newMovement) {
      toast.success('Stock in recorded successfully');
      setIsStockInModalOpen(false);
    } else {
      toast.error('Failed to record stock in');
    }
  };

  const handleStockOutSave = async (request: CreateMovementRequest) => {
    const newMovement = await createMovement(request);
    if (newMovement) {
      toast.success('Stock out recorded successfully');
      setIsStockOutModalOpen(false);
    } else {
      toast.error('Failed to record stock out');
    }
  };

  const handleDeleteMovement = async (id: string) => {
    const success = await deleteMovement(id);
    if (success) {
      toast.success('Movement deleted successfully');
    } else {
      toast.error('Failed to delete movement');
    }
  };

  const handleViewMovement = (movement: Movement) => {
    setSelectedMovement(movement);
    // In a real app, this might open a detailed view modal
    toast.info(`Viewing movement: ${movement.id}`);
  };

  const handleRefresh = async () => {
    await refreshData();
    toast.success('Data refreshed');
  };

  // Load summary when component mounts
  React.useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Stock Movements</h2>
            <p className="text-muted-foreground">
              Track all stock in and out movements with detailed history
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsStockOutModalOpen(true)}
              disabled={creating}
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Stock Out
            </Button>
            <Button 
              onClick={() => setIsStockInModalOpen(true)}
              disabled={creating}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Stock In
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalMovements}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.movementsToday} today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock In</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary.totalStockIn}</div>
                <p className="text-xs text-muted-foreground">
                  Items received
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Out</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{summary.totalStockOut}</div>
                <p className="text-xs text-muted-foreground">
                  Items dispatched
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Movement value
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Movements List */}
        <MovementsList
          movements={movements}
          loading={loading}
          onRefresh={handleRefresh}
          onFilter={setFilter}
          onDelete={handleDeleteMovement}
          onView={handleViewMovement}
          showStats={false} // We have summary cards above
        />

        {/* Stock In Modal */}
        <StockInModal
          isOpen={isStockInModalOpen}
          onClose={() => setIsStockInModalOpen(false)}
          onSave={handleStockInSave}
          locations={locations}
          suppliers={suppliers}
        />

        {/* Stock Out Modal */}
        <StockOutModal
          isOpen={isStockOutModalOpen}
          onClose={() => setIsStockOutModalOpen(false)}
          onSave={handleStockOutSave}
          locations={locations}
          customers={customers}
        />
      </div>
    </SidebarLayout>
  );
}
