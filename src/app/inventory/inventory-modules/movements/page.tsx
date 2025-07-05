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
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function MovementsPage() {
  const {
    movements,
    suppliers,
    locations,
    loading,
    creating,
    error,
    suppliersLoading,
    locationsLoading,
    filter,
    loadMovements,
    loadSuppliers,
    loadLocations,
    createMovement,
    deleteMovement,
    setFilter,
    refreshData
  } = useMovements();

  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  
  // Debug logging for modal states
  React.useEffect(() => {
    console.log('Modal states changed:', {
      stockIn: isStockInModalOpen,
      stockOut: isStockOutModalOpen
    });
  }, [isStockInModalOpen, isStockOutModalOpen]);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

  // Customer data (still hardcoded for stock out)
  const customers = ['Tech Solutions Inc', 'Digital Corp', 'Innovation Labs', 'Future Systems'];

  // Load suppliers and locations on mount
  React.useEffect(() => {
    loadSuppliers();
    loadLocations();
  }, [loadSuppliers, loadLocations]);

  const handleStockInSave = async (request: CreateMovementRequest) => {
    console.log('Saving stock in request:', request);
    const newMovement = await createMovement(request);
    if (newMovement) {
      console.log('Stock in created successfully:', newMovement);
      toast.success('Stock in recorded successfully');
      setIsStockInModalOpen(false);
    } else {
      console.error('Failed to create stock in movement');
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
        </div>


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
          onCreateStockIn={() => {
            console.log('Create Stock In clicked!');
            alert('Create Stock In clicked!');
            setIsStockInModalOpen(true);
          }}
          onCreateStockOut={() => setIsStockOutModalOpen(true)}
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
