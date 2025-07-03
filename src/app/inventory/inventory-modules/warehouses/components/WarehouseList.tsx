'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useWarehouses } from '../hooks/useWarehouses';
import { Warehouse } from '../types/warehouse.types';
import { CreateWarehouseModal } from './CreateWarehouseModal';
import { EditWarehouseModal } from './EditWarehouseModal';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Package,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  Plus,
  Star,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WarehouseListProps {
  onWarehouseSelect?: (warehouse: Warehouse) => void;
  selectedWarehouseId?: string;
}

export function WarehouseList({ 
  onWarehouseSelect, 
  selectedWarehouseId 
}: WarehouseListProps) {
  const { warehouses, loading, error, fetchWarehouses, deleteWarehouse } = useWarehouses();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [deleteWarehouseId, setDeleteWarehouseId] = useState<string | null>(null);
  const [deleteWarehouseName, setDeleteWarehouseName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleCreateWarehouse = () => {
    setIsCreateModalOpen(true);
  };

  const handleWarehouseCreated = (newWarehouse: Warehouse) => {
    fetchWarehouses(); // Refresh the list
    setIsCreateModalOpen(false);
  };

  const handleDeleteClick = (warehouse: Warehouse) => {
    // Check if warehouse has inventory
    if (warehouse.totalInventoryItems && warehouse.totalInventoryItems > 0) {
      alert(`Cannot delete ${warehouse.name}. It contains ${warehouse.totalInventoryItems} inventory items. Please move or remove all inventory first.`);
      return;
    }

    // Check if it's the default warehouse
    if (warehouse.isDefault) {
      alert('Cannot delete the default warehouse. Please set another warehouse as default first.');
      return;
    }

    setDeleteWarehouseId(warehouse.id);
    setDeleteWarehouseName(warehouse.name);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteWarehouseId) return;

    setIsDeleting(true);
    try {
      const success = await deleteWarehouse(deleteWarehouseId);
      if (success) {
        setDeleteWarehouseId(null);
        setDeleteWarehouseName('');
        fetchWarehouses(); // Refresh the list
      } else {
        alert('Failed to delete warehouse. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      alert('Failed to delete warehouse. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteWarehouseId(null);
    setDeleteWarehouseName('');
  };

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsEditModalOpen(true);
  };

  const handleWarehouseUpdated = (updatedWarehouse: Warehouse) => {
    fetchWarehouses(); // Refresh the list
    setIsEditModalOpen(false);
    setSelectedWarehouse(null);
  };

  const handleView = (warehouse: Warehouse) => {
    // TODO: Implement view details functionality
    console.log('View warehouse:', warehouse);
    alert(`Warehouse Details:\n\nName: ${warehouse.name}\nCode: ${warehouse.code}\nLocation: ${warehouse.city ? `${warehouse.city}, ${warehouse.state}` : 'No address'}\nInventory: ${warehouse.totalInventoryItems} items\nCapacity: ${warehouse.maxCapacity || 'Unlimited'}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading warehouses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 font-medium">Error loading warehouses</p>
          <p className="text-sm text-gray-600">{error}</p>
          <Button onClick={() => fetchWarehouses()} className="mt-3" size="sm">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Warehouse Management</h3>
            <p className="text-sm text-gray-600">
              Manage your warehouse locations and settings
            </p>
          </div>
          <Button onClick={handleCreateWarehouse}>
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        </div>

        {/* Warehouse Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Warehouse</TableHead>
                <TableHead className="w-[200px]">Location</TableHead>
                <TableHead className="w-[150px]">Manager</TableHead>
                <TableHead className="w-[130px]">Contact</TableHead>
                <TableHead className="w-[120px]">Inventory</TableHead>
                <TableHead className="w-[100px]">Capacity</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((warehouse) => (
                <TableRow 
                  key={warehouse.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedWarehouseId === warehouse.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : ''
                  }`}
                  onClick={() => onWarehouseSelect?.(warehouse)}
                >
                  {/* Warehouse Name & Code */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm truncate" title={warehouse.name}>
                            {warehouse.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Code: {warehouse.code}
                          </div>
                        </div>
                      </div>
                      {warehouse.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 pl-6" title={warehouse.description}>
                          {warehouse.description}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    {warehouse.city && warehouse.state ? (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                        <span className="truncate" title={`${warehouse.city}, ${warehouse.state}`}>
                          {warehouse.city}, {warehouse.state}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No address</span>
                    )}
                  </TableCell>

                  {/* Manager */}
                  <TableCell>
                    {warehouse.managerName ? (
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                        <span className="truncate" title={warehouse.managerName}>
                          {warehouse.managerName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No manager</span>
                    )}
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    <div className="space-y-1">
                      {warehouse.phone && (
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate" title={warehouse.phone}>
                            {warehouse.phone}
                          </span>
                        </div>
                      )}
                      {warehouse.email && (
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate" title={warehouse.email}>
                            {warehouse.email}
                          </span>
                        </div>
                      )}
                      {!warehouse.phone && !warehouse.email && (
                        <span className="text-gray-400 text-sm">No contact</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Inventory */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Package className="h-3.5 w-3.5 text-gray-600" />
                      <span className="font-medium text-sm">
                        {warehouse.totalInventoryItems || 0}
                      </span>
                      <span className="text-xs text-gray-500">items</span>
                    </div>
                  </TableCell>

                  {/* Capacity */}
                  <TableCell>
                    {warehouse.maxCapacity ? (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">
                          {warehouse.totalQuantity || 0} / {warehouse.maxCapacity}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              (warehouse.utilizationPercentage?.volume || 0) > 80 
                                ? 'bg-red-500' 
                                : (warehouse.utilizationPercentage?.volume || 0) > 60 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                            }`}
                            style={{ 
                              width: `${Math.min(warehouse.utilizationPercentage?.volume || 0, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Unlimited</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      {warehouse.isDefault && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 w-fit">
                          <Star className="h-2.5 w-2.5 mr-1" />
                          Default
                        </Badge>
                      )}
                      {!warehouse.isActive && (
                        <Badge variant="destructive" className="text-xs px-2 py-0.5 w-fit">
                          Inactive
                        </Badge>
                      )}
                      {warehouse.isActive && !warehouse.isDefault && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 w-fit">
                          Active
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(warehouse);
                        }}
                        title="View Details"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(warehouse);
                        }}
                        title="Edit Warehouse"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(warehouse);
                        }}
                        disabled={warehouse.isDefault || (warehouse.totalInventoryItems && warehouse.totalInventoryItems > 0)}
                        title={
                          warehouse.isDefault 
                            ? "Cannot delete default warehouse" 
                            : (warehouse.totalInventoryItems && warehouse.totalInventoryItems > 0)
                            ? "Cannot delete warehouse with inventory"
                            : "Delete warehouse"
                        }
                        className={`h-8 w-8 p-0 ${
                          warehouse.isDefault || (warehouse.totalInventoryItems && warehouse.totalInventoryItems > 0)
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {warehouses.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first warehouse location.
            </p>
            <Button onClick={handleCreateWarehouse}>
              <Plus className="mr-2 h-4 w-4" />
              Create Warehouse
            </Button>
          </div>
        )}
      </div>

      {/* Create Warehouse Modal */}
      <CreateWarehouseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleWarehouseCreated}
      />

      {/* Edit Warehouse Modal */}
      <EditWarehouseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedWarehouse(null);
        }}
        onSuccess={handleWarehouseUpdated}
        warehouse={selectedWarehouse}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteWarehouseId} onOpenChange={handleDeleteCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Delete Warehouse</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteWarehouseName}</strong>? 
              This action cannot be undone and will permanently remove the warehouse from your system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleDeleteCancel} 
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Warehouse
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
