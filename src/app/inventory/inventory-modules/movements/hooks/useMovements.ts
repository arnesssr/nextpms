import { useState, useEffect, useCallback } from 'react';
import { 
  Movement, 
  CreateMovementRequest, 
  MovementFilter,
  MovementsByProduct,
  BulkMovementRequest
} from '../types/movements.types';
import { movementsService } from '../services/movementsService';

export interface UseMovementsReturn {
  // Data
  movements: Movement[];
  movementsByProduct: MovementsByProduct[];
  suppliers: string[];
  locations: string[];
  
  // Loading states
  loading: boolean;
  creating: boolean;
  deleting: boolean;
  suppliersLoading: boolean;
  locationsLoading: boolean;
  
  // Error state
  error: string | null;
  
  // Filter state
  filter: MovementFilter;
  
  // Actions
  loadMovements: () => Promise<void>;
  loadMovementsByProduct: () => Promise<void>;
  loadSuppliers: () => Promise<void>;
  loadLocations: () => Promise<void>;
  createMovement: (request: CreateMovementRequest) => Promise<Movement | null>;
  createBulkMovements: (request: BulkMovementRequest) => Promise<Movement[] | null>;
  deleteMovement: (id: string) => Promise<boolean>;
  setFilter: (filter: MovementFilter) => void;
  clearFilter: () => void;
  refreshData: () => Promise<void>;
}

const initialFilter: MovementFilter = {};

export function useMovements(initialFilterOverride?: MovementFilter): UseMovementsReturn {
  // State
  const [movements, setMovements] = useState<Movement[]>([]);
  const [movementsByProduct, setMovementsByProduct] = useState<MovementsByProduct[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<MovementFilter>({
    ...initialFilter,
    ...initialFilterOverride
  });

  // Clear error when filter changes
  useEffect(() => {
    setError(null);
  }, [filter]);

  // Load movements
  const loadMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await movementsService.getMovements(filter);
      setMovements(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load movements';
      setError(errorMessage);
      console.error('Error loading movements:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);


  // Load movements by product
  const loadMovementsByProduct = useCallback(async () => {
    try {
      setError(null);
      
      const data = await movementsService.getMovementsByProduct(filter);
      setMovementsByProduct(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load movements by product';
      setError(errorMessage);
      console.error('Error loading movements by product:', err);
    }
  }, [filter]);

  // Load suppliers
  const loadSuppliers = useCallback(async () => {
    try {
      setSuppliersLoading(true);
      
      const data = await movementsService.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error('Error loading suppliers:', err);
      setSuppliers([]); // Set empty array on error
    } finally {
      setSuppliersLoading(false);
    }
  }, []);

  // Load locations
  const loadLocations = useCallback(async () => {
    try {
      setLocationsLoading(true);
      
      const data = await movementsService.getLocations();
      setLocations(data);
    } catch (err) {
      console.error('Error loading locations:', err);
      setLocations([]); // Set empty array on error
    } finally {
      setLocationsLoading(false);
    }
  }, []);

  // Create movement
  const createMovement = useCallback(async (request: CreateMovementRequest): Promise<Movement | null> => {
    try {
      setCreating(true);
      setError(null);
      
      const newMovement = await movementsService.createMovement(request);
      
      // Add to the beginning of the list (most recent first)
      setMovements(prev => [newMovement, ...prev]);
      
      
      return newMovement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create movement';
      setError(errorMessage);
      console.error('Error creating movement:', err);
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  // Create bulk movements
  const createBulkMovements = useCallback(async (request: BulkMovementRequest): Promise<Movement[] | null> => {
    try {
      setCreating(true);
      setError(null);
      
      const newMovements = await movementsService.createBulkMovements(request);
      
      // Add to the beginning of the list (most recent first)
      setMovements(prev => [...newMovements, ...prev]);
      
      
      return newMovements;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bulk movements';
      setError(errorMessage);
      console.error('Error creating bulk movements:', err);
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  // Delete movement
  const deleteMovement = useCallback(async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);
      
      await movementsService.deleteMovement(id);
      
      // Remove from local state
      setMovements(prev => prev.filter(movement => movement.id !== id));
      
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete movement';
      setError(errorMessage);
      console.error('Error deleting movement:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  }, []);

  // Set filter
  const setFilter = useCallback((newFilter: MovementFilter) => {
    setFilterState(newFilter);
  }, []);

  // Clear filter
  const clearFilter = useCallback(() => {
    setFilterState(initialFilter);
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadMovements(),
      loadMovementsByProduct()
    ]);
  }, [loadMovements, loadMovementsByProduct]);

  // Initial load when filter changes
  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  return {
    // Data
    movements,
    movementsByProduct,
    suppliers,
    locations,
    
    // Loading states
    loading,
    creating,
    deleting,
    suppliersLoading,
    locationsLoading,
    
    // Error state
    error,
    
    // Filter state
    filter,
    
    // Actions
    loadMovements,
    loadMovementsByProduct,
    loadSuppliers,
    loadLocations,
    createMovement,
    createBulkMovements,
    deleteMovement,
    setFilter,
    clearFilter,
    refreshData
  };
}
