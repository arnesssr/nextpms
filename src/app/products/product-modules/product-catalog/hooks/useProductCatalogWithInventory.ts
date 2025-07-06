import { useMemo } from 'react';
import { useProductCatalog } from './useProductCatalog';
import { useInventory } from '../../inventory-management/hooks/useInventory';
import { Product } from '../types';

interface EnrichedProduct extends Product {
  // Real-time inventory fields
  realtime_stock: number;
  available_stock: number;
  reserved_quantity: number;
  inventory_location: string;
  last_inventory_update: string;
  low_stock_threshold: number;
  
  // Computed fields
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'no_available';
  stock_value: number;
}

interface UseProductCatalogWithInventoryState {
  products: EnrichedProduct[];
  loading: boolean;
  error: string | null;
  inventoryLoading: boolean;
  inventoryStats: {
    total_products: number;
    in_stock_count: number;
    low_stock_count: number;
    out_of_stock_count: number;
    total_stock_value: number;
  };
}

interface UseProductCatalogWithInventoryActions {
  refreshProducts: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => void;
  filterProducts: (filters: { status?: string; category?: string; supplier?: string }) => void;
}

export const useProductCatalogWithInventory = (): UseProductCatalogWithInventoryState & UseProductCatalogWithInventoryActions => {
  const {
    products,
    loading,
    error,
    refreshProducts,
    addProduct,
    editProduct,
    removeProduct,
    searchProducts,
    filterProducts
  } = useProductCatalog();
  
  const {
    inventory,
    loading: inventoryLoading,
    fetchAllInventory
  } = useInventory();

  // Enrich products with real-time inventory data
  const enrichedProducts = useMemo((): EnrichedProduct[] => {
    return products.map(product => {
      const inventoryItem = inventory.find(inv => inv.product_id === product.id);
      
      const realtimeStock = inventoryItem?.quantity || product.current_stock || 0;
      const reservedQuantity = inventoryItem?.reserved_quantity || 0;
      const availableStock = realtimeStock - reservedQuantity;
      const lowStockThreshold = inventoryItem?.low_stock_threshold || product.min_stock_level || 10;
      const price = product.selling_price || product.base_price || 0;
      
      // Determine stock status
      let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'no_available';
      if (realtimeStock === 0) {
        stockStatus = 'out_of_stock';
      } else if (availableStock <= 0) {
        stockStatus = 'no_available';
      } else if (availableStock <= lowStockThreshold) {
        stockStatus = 'low_stock';
      } else {
        stockStatus = 'in_stock';
      }

      return {
        ...product,
        // Real-time inventory fields
        realtime_stock: realtimeStock,
        available_stock: availableStock,
        reserved_quantity: reservedQuantity,
        inventory_location: inventoryItem?.location || 'Unknown',
        last_inventory_update: inventoryItem?.updated_at || product.updated_at,
        low_stock_threshold: lowStockThreshold,
        
        // Computed fields
        is_low_stock: stockStatus === 'low_stock',
        is_out_of_stock: stockStatus === 'out_of_stock' || stockStatus === 'no_available',
        stock_status: stockStatus,
        stock_value: realtimeStock * price,
        
        // Update existing fields with real-time data
        current_stock: realtimeStock,
        stock_quantity: realtimeStock
      };
    });
  }, [products, inventory]);

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    const stats = enrichedProducts.reduce(
      (acc, product) => {
        acc.total_products += 1;
        acc.total_stock_value += product.stock_value;
        
        switch (product.stock_status) {
          case 'in_stock':
            acc.in_stock_count += 1;
            break;
          case 'low_stock':
            acc.low_stock_count += 1;
            break;
          case 'out_of_stock':
          case 'no_available':
            acc.out_of_stock_count += 1;
            break;
        }
        
        return acc;
      },
      {
        total_products: 0,
        in_stock_count: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        total_stock_value: 0
      }
    );
    
    return stats;
  }, [enrichedProducts]);

  const refreshInventory = async () => {
    await fetchAllInventory();
  };

  return {
    products: enrichedProducts,
    loading,
    error,
    inventoryLoading,
    inventoryStats,
    refreshProducts,
    refreshInventory,
    addProduct,
    editProduct,
    removeProduct,
    searchProducts,
    filterProducts
  };
};

export type { EnrichedProduct };
