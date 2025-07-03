'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Warehouse, 
  WarehouseFilter, 
  CreateWarehouseRequest, 
  UpdateWarehouseRequest, 
  WarehouseStats 
} from '../types/warehouse.types';
import { WarehouseService } from '../services/warehouseService';

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all warehouses with optional filters
  const fetchWarehouses = useCallback(async (filters?: WarehouseFilter) => {
    console.log('fetchWarehouses called with filters:', filters);
    setLoading(true);
    setError(null);
    
    try {
      const warehouseData = await WarehouseService.getWarehouses(filters);
      console.log('Warehouse data received:', warehouseData);
      setWarehouses(warehouseData);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new warehouse
  const createWarehouse = async (warehouseData: CreateWarehouseRequest): Promise<Warehouse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newWarehouse = await WarehouseService.createWarehouse(warehouseData);
      setWarehouses(prev => [...prev, newWarehouse]);
      return newWarehouse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create warehouse');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update existing warehouse
  const updateWarehouse = async (warehouseData: UpdateWarehouseRequest): Promise<Warehouse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedWarehouse = await WarehouseService.updateWarehouse(warehouseData);
      setWarehouses(prev => 
        prev.map(warehouse => 
          warehouse.id === warehouseData.id ? updatedWarehouse : warehouse
        )
      );
      return updatedWarehouse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update warehouse');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete warehouse
  const deleteWarehouse = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await WarehouseService.deleteWarehouse(id);
      setWarehouses(prev => prev.filter(warehouse => warehouse.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete warehouse');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get single warehouse by ID
  const getWarehouseById = async (id: string): Promise<Warehouse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const warehouse = await WarehouseService.getWarehouseById(id);
      return warehouse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch warehouse');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get default warehouse
  const getDefaultWarehouse = useCallback((): Warehouse | null => {
    return warehouses.find(warehouse => warehouse.isDefault) || null;
  }, [warehouses]);

  // Get active warehouses
  const getActiveWarehouses = useCallback((): Warehouse[] => {
    return warehouses.filter(warehouse => warehouse.isActive);
  }, [warehouses]);

  return {
    warehouses,
    loading,
    error,
    fetchWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    getWarehouseById,
    getDefaultWarehouse,
    getActiveWarehouses,
    clearError: () => setError(null)
  };
};

export const useWarehouseStats = () => {
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const statsData = await WarehouseService.getWarehouseStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch warehouse stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    clearError: () => setError(null)
  };
};

export const useDefaultWarehouse = () => {
  const [defaultWarehouse, setDefaultWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDefaultWarehouse = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const warehouses = await WarehouseService.getWarehouses();
      const defaultWh = warehouses.find(wh => wh.isDefault) || warehouses[0] || null;
      setDefaultWarehouse(defaultWh);
    } catch (err) {
      console.error('Error fetching default warehouse:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch default warehouse');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDefaultWarehouse();
  }, [fetchDefaultWarehouse]);

  return {
    defaultWarehouse,
    loading,
    error,
    refetch: fetchDefaultWarehouse,
    clearError: () => setError(null)
  };
};
