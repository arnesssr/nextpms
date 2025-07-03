import { useState, useEffect, useCallback } from 'react';
import { 
  Adjustment, 
  CreateAdjustmentRequest, 
  UpdateAdjustmentRequest,
  AdjustmentFilter, 
  AdjustmentSummary,
  AdjustmentsByProduct,
  AdjustmentsByReason,
  BulkAdjustmentRequest,
  AdjustmentApprovalRequest
} from '../types/adjustments.types';
import { adjustmentsService } from '../services/adjustmentsService';

export interface UseAdjustmentsReturn {
  // Data
  adjustments: Adjustment[];
  summary: AdjustmentSummary | null;
  adjustmentsByProduct: AdjustmentsByProduct[];
  adjustmentsByReason: AdjustmentsByReason[];
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  approving: boolean;
  deleting: boolean;
  
  // Error state
  error: string | null;
  
  // Filter state
  filter: AdjustmentFilter;
  
  // Actions
  loadAdjustments: () => Promise<void>;
  loadSummary: () => Promise<void>;
  loadAdjustmentsByProduct: () => Promise<void>;
  loadAdjustmentsByReason: () => Promise<void>;
  createAdjustment: (request: CreateAdjustmentRequest) => Promise<Adjustment | null>;
  updateAdjustment: (request: UpdateAdjustmentRequest) => Promise<Adjustment | null>;
  createBulkAdjustments: (request: BulkAdjustmentRequest) => Promise<Adjustment[] | null>;
  approveAdjustments: (request: AdjustmentApprovalRequest) => Promise<Adjustment[] | null>;
  deleteAdjustment: (id: string) => Promise<boolean>;
  setFilter: (filter: AdjustmentFilter) => void;
  clearFilter: () => void;
  refreshData: () => Promise<void>;
}

const initialFilter: AdjustmentFilter = {};

export function useAdjustments(initialFilterOverride?: AdjustmentFilter): UseAdjustmentsReturn {
  // State
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [summary, setSummary] = useState<AdjustmentSummary | null>(null);
  const [adjustmentsByProduct, setAdjustmentsByProduct] = useState<AdjustmentsByProduct[]>([]);
  const [adjustmentsByReason, setAdjustmentsByReason] = useState<AdjustmentsByReason[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<AdjustmentFilter>({
    ...initialFilter,
    ...initialFilterOverride
  });

  // Clear error when filter changes
  useEffect(() => {
    setError(null);
  }, [filter]);

  // Load adjustments
  const loadAdjustments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await adjustmentsService.fetchAdjustments(filter);
      setAdjustments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load adjustments';
      setError(errorMessage);
      console.error('Error loading adjustments:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Load summary
  const loadSummary = useCallback(async () => {
    try {
      setError(null);
      
      const data = await adjustmentsService.fetchAdjustmentSummary(filter);
      setSummary(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load summary';
      setError(errorMessage);
      console.error('Error loading adjustment summary:', err);
    }
  }, [filter]);

  // Load adjustments by product
  const loadAdjustmentsByProduct = useCallback(async () => {
    try {
      setError(null);
      
      const data = await adjustmentsService.fetchAdjustmentsByProduct(filter);
      setAdjustmentsByProduct(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load adjustments by product';
      setError(errorMessage);
      console.error('Error loading adjustments by product:', err);
    }
  }, [filter]);

  // Load adjustments by reason
  const loadAdjustmentsByReason = useCallback(async () => {
    try {
      setError(null);
      
      const data = await adjustmentsService.fetchAdjustmentsByReason(filter);
      setAdjustmentsByReason(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load adjustments by reason';
      setError(errorMessage);
      console.error('Error loading adjustments by reason:', err);
    }
  }, [filter]);

  // Create adjustment
  const createAdjustment = useCallback(async (request: CreateAdjustmentRequest): Promise<Adjustment | null> => {
    try {
      setCreating(true);
      setError(null);
      
      const newAdjustment = await adjustmentsService.createAdjustment(request);
      
      // Add to the beginning of the list (most recent first)
      setAdjustments(prev => [newAdjustment, ...prev]);
      
      // Reload summary to get updated stats
      await loadSummary();
      
      return newAdjustment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create adjustment';
      setError(errorMessage);
      console.error('Error creating adjustment:', err);
      return null;
    } finally {
      setCreating(false);
    }
  }, [loadSummary]);

  // Update adjustment
  const updateAdjustment = useCallback(async (request: UpdateAdjustmentRequest): Promise<Adjustment | null> => {
    try {
      setUpdating(true);
      setError(null);
      
      const updatedAdjustment = await adjustmentsService.updateAdjustment(request);
      
      // Update in local state
      setAdjustments(prev => prev.map(adjustment => 
        adjustment.id === updatedAdjustment.id ? updatedAdjustment : adjustment
      ));
      
      // Reload summary to get updated stats
      await loadSummary();
      
      return updatedAdjustment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update adjustment';
      setError(errorMessage);
      console.error('Error updating adjustment:', err);
      return null;
    } finally {
      setUpdating(false);
    }
  }, [loadSummary]);

  // Create bulk adjustments
  const createBulkAdjustments = useCallback(async (request: BulkAdjustmentRequest): Promise<Adjustment[] | null> => {
    try {
      setCreating(true);
      setError(null);
      
      const newAdjustments = await adjustmentsService.createBulkAdjustments(request);
      
      // Add to the beginning of the list (most recent first)
      setAdjustments(prev => [...newAdjustments, ...prev]);
      
      // Reload summary to get updated stats
      await loadSummary();
      
      return newAdjustments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bulk adjustments';
      setError(errorMessage);
      console.error('Error creating bulk adjustments:', err);
      return null;
    } finally {
      setCreating(false);
    }
  }, [loadSummary]);

  // Approve/reject adjustments
  const approveAdjustments = useCallback(async (request: AdjustmentApprovalRequest): Promise<Adjustment[] | null> => {
    try {
      setApproving(true);
      setError(null);
      
      const updatedAdjustments = await adjustmentsService.approveAdjustments(request);
      
      // Update in local state
      setAdjustments(prev => prev.map(adjustment => {
        const updated = updatedAdjustments.find(ua => ua.id === adjustment.id);
        return updated || adjustment;
      }));
      
      // Reload summary to get updated stats
      await loadSummary();
      
      return updatedAdjustments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process adjustment approval';
      setError(errorMessage);
      console.error('Error processing adjustment approval:', err);
      return null;
    } finally {
      setApproving(false);
    }
  }, [loadSummary]);

  // Delete adjustment
  const deleteAdjustment = useCallback(async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);
      
      await adjustmentsService.deleteAdjustment(id);
      
      // Remove from local state
      setAdjustments(prev => prev.filter(adjustment => adjustment.id !== id));
      
      // Reload summary to get updated stats
      await loadSummary();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete adjustment';
      setError(errorMessage);
      console.error('Error deleting adjustment:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  }, [loadSummary]);

  // Set filter
  const setFilter = useCallback((newFilter: AdjustmentFilter) => {
    setFilterState(newFilter);
  }, []);

  // Clear filter
  const clearFilter = useCallback(() => {
    setFilterState(initialFilter);
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadAdjustments(),
      loadSummary(),
      loadAdjustmentsByProduct(),
      loadAdjustmentsByReason()
    ]);
  }, [loadAdjustments, loadSummary, loadAdjustmentsByProduct, loadAdjustmentsByReason]);

  // Initial load when filter changes
  useEffect(() => {
    loadAdjustments();
  }, [loadAdjustments]);

  return {
    // Data
    adjustments,
    summary,
    adjustmentsByProduct,
    adjustmentsByReason,
    
    // Loading states
    loading,
    creating,
    updating,
    approving,
    deleting,
    
    // Error state
    error,
    
    // Filter state
    filter,
    
    // Actions
    loadAdjustments,
    loadSummary,
    loadAdjustmentsByProduct,
    loadAdjustmentsByReason,
    createAdjustment,
    updateAdjustment,
    createBulkAdjustments,
    approveAdjustments,
    deleteAdjustment,
    setFilter,
    clearFilter,
    refreshData
  };
}
