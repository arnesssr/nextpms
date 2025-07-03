'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWarehouses } from '@/app/inventory/inventory-modules/warehouses/hooks/useWarehouses';
import { Warehouse } from '@/app/inventory/inventory-modules/warehouses/types/warehouse.types';
import { CreateWarehouseModal } from '@/app/inventory/inventory-modules/warehouses/components/CreateWarehouseModal';
import { 
  Building2, 
  MapPin, 
  Package,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

interface WarehouseSelectorProps {
  selectedWarehouseId?: string;
  onWarehouseChange: (warehouseId: string, warehouse: Warehouse | null) => void;
  placeholder?: string;
  showStats?: boolean;
  allowAll?: boolean;
  allowCreate?: boolean;
  allowDelete?: boolean;
  className?: string;
  disabled?: boolean;
}

export function WarehouseSelector({
  selectedWarehouseId,
  onWarehouseChange,
  placeholder = "Select warehouse...",
  showStats = true,
  allowAll = true,
  allowCreate = true,
  allowDelete = false,
  className = "",
  disabled = false
}: WarehouseSelectorProps) {
  const { warehouses, loading, error, fetchWarehouses, deleteWarehouse } = useWarehouses();
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchWarehouses({ isActive: true });
  }, [fetchWarehouses]);

  useEffect(() => {
    if (selectedWarehouseId && warehouses.length > 0) {
      const warehouse = warehouses.find(wh => wh.id === selectedWarehouseId);
      setSelectedWarehouse(warehouse || null);
    } else if (!selectedWarehouseId) {
      setSelectedWarehouse(null);
    }
  }, [selectedWarehouseId, warehouses]);

  const handleValueChange = (value: string) => {
    if (value === 'all') {
      setSelectedWarehouse(null);
      onWarehouseChange('all', null);
      return;
    }

    const warehouse = warehouses.find(wh => wh.id === value);
    setSelectedWarehouse(warehouse || null);
    onWarehouseChange(value, warehouse || null);
  };

  const handleCreateWarehouse = () => {
    setIsCreateModalOpen(true);
  };

  const handleWarehouseCreated = (newWarehouse: Warehouse) => {
    // Refresh the warehouses list
    fetchWarehouses({ isActive: true });
    // Select the newly created warehouse
    setSelectedWarehouse(newWarehouse);
    onWarehouseChange(newWarehouse.id, newWarehouse);
    setIsCreateModalOpen(false);
  };

  const handleDeleteWarehouse = async (warehouse: Warehouse, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Check safety conditions
    if (warehouse.isDefault) {
      alert('Cannot delete the default warehouse.');
      return;
    }
    
    if (warehouse.totalInventoryItems && warehouse.totalInventoryItems > 0) {
      alert(`Cannot delete ${warehouse.name}. It contains ${warehouse.totalInventoryItems} inventory items.`);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${warehouse.name}? This action cannot be undone.`)) {
      try {
        const success = await deleteWarehouse(warehouse.id);
        if (success) {
          // If the deleted warehouse was selected, switch to 'all'
          if (selectedWarehouseId === warehouse.id) {
            onWarehouseChange('all', null);
          }
          // Refresh warehouses list
          fetchWarehouses({ isActive: true });
        } else {
          alert('Failed to delete warehouse. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting warehouse:', error);
        alert('Failed to delete warehouse. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-500">Loading warehouses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-red-600 ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Error loading warehouses</span>
      </div>
    );
  }

  const getDisplayValue = () => {
    if (selectedWarehouseId === 'all') return 'All Warehouses';
    if (selectedWarehouse) {
      return (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4" />
          <span>{selectedWarehouse.name}</span>
          {selectedWarehouse.isDefault && (
            <Badge variant="secondary" className="text-xs">Default</Badge>
          )}
        </div>
      );
    }
    return placeholder;
  };

  return (
    <>
    <div className={`min-w-[200px] ${className}`}>
      <Select
        value={selectedWarehouseId || ''}
        onValueChange={handleValueChange}
        disabled={disabled || warehouses.length === 0}
      >
        <SelectTrigger>
          <SelectValue>
            {getDisplayValue()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allowAll && (
            <SelectItem value="all">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>All Warehouses</span>
              </div>
            </SelectItem>
          )}
          
          {warehouses.map((warehouse) => (
            <SelectItem key={warehouse.id} value={warehouse.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{warehouse.name}</span>
                      <span className="text-xs text-gray-500">({warehouse.code})</span>
                      {warehouse.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    {showStats && (
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <Package className="h-3 w-3" />
                          <span>{warehouse.totalInventoryItems || 0} items</span>
                        </span>
                        {warehouse.city && warehouse.state && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{warehouse.city}, {warehouse.state}</span>
                          </span>
                        )}
                        {warehouse.utilizationPercentage && warehouse.utilizationPercentage.volume && (
                          <span className={`px-1 py-0.5 rounded text-xs ${
                            warehouse.utilizationPercentage.volume > 80 
                              ? 'bg-red-100 text-red-700'
                              : warehouse.utilizationPercentage.volume > 60
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {warehouse.utilizationPercentage.volume.toFixed(0)}% utilized
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
          
          {warehouses.length === 0 && (
            <SelectItem value="none" disabled>
              <div className="flex items-center space-x-2 text-gray-500">
                <AlertCircle className="h-4 w-4" />
                <span>No warehouses available</span>
              </div>
            </SelectItem>
          )}
          
          {/* Create Warehouse Option */}
          {allowCreate && (
            <>
              <div className="border-t border-gray-200 my-1" />
              <div className="p-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCreateWarehouse}
                  className="w-full justify-start"
                  disabled={disabled}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Warehouse
                </Button>
              </div>
            </>
          )}
        </SelectContent>
      </Select>
      
      {selectedWarehouse && showStats && (
        <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Total Items:</span> {selectedWarehouse.totalInventoryItems || 0}
            </div>
            <div>
              <span className="font-medium">Products:</span> {selectedWarehouse.uniqueProducts || 0}
            </div>
            <div>
              <span className="font-medium">Total Quantity:</span> {selectedWarehouse.totalQuantity || 0}
            </div>
            <div>
              <span className="font-medium">Value:</span> ${(selectedWarehouse.totalInventoryValue || 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
    
    {/* Create Warehouse Modal */}
    <CreateWarehouseModal
      isOpen={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
      onSuccess={handleWarehouseCreated}
    />
    </>
  );
}

export default WarehouseSelector;
