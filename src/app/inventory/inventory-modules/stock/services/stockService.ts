import { 
  Stock, 
  StockFilter, 
  CreateStockRequest, 
  UpdateStockRequest, 
  StockSummary,
  StockStatus 
} from '../types/stock.types';

// API Base URL - adjust according to your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class StockService {
  
  // Transform API response to match Stock interface
  private static transformApiResponseToStock(apiStock: any): Stock {
    const productData = apiStock.products || apiStock.product || {};
    
    // Determine stock status based on quantity and thresholds
    const currentQty = apiStock.quantity_available || apiStock.quantity || apiStock.quantity_on_hand || 0;
    const minQty = apiStock.min_stock_level || apiStock.minStockLevel || 0;
    const maxQty = apiStock.max_stock_level || apiStock.maxStockLevel || null;
    
    let stockStatus: StockStatus = 'in_stock';
    if (currentQty === 0) {
      stockStatus = 'out_of_stock';
    } else if (minQty > 0 && currentQty <= minQty) {
      stockStatus = 'low_stock';
    } else if (maxQty && maxQty > 0 && currentQty >= maxQty) {
      stockStatus = 'overstocked';
    }
    
    // Enhanced cost calculation with fallback logic
    const unitCost = apiStock.unit_cost || 
                     productData.cost_price || 
                     apiStock.cost_per_unit || 
                     apiStock.costPerUnit || 
                     productData.selling_price || // Fallback to selling price if no cost available
                     0;
    
    return {
      id: apiStock.id,
      productId: apiStock.product_id || apiStock.productId,
      productName: productData.name || apiStock.productName || 'Unknown Product',
      productSku: productData.sku || apiStock.productSku || 'N/A',
      currentQuantity: currentQty,
      minimumQuantity: minQty,
      maximumQuantity: maxQty, // Keep null if not set
      unitOfMeasure: apiStock.unit_of_measure || apiStock.unitOfMeasure || 'units',
      location: apiStock.location_name || apiStock.location || 'Main Warehouse',
      warehouseId: apiStock.location_id || apiStock.warehouseId,
      costPerUnit: unitCost,
      totalValue: unitCost * currentQty,
      status: stockStatus,
      lastUpdated: apiStock.updated_at ? new Date(apiStock.updated_at) : (apiStock.lastUpdated ? new Date(apiStock.lastUpdated) : new Date()),
      lastRestocked: apiStock.last_restocked || apiStock.lastRestocked || null,
      notes: apiStock.notes || '',
      createdAt: apiStock.created_at || apiStock.createdAt,
      updatedAt: apiStock.updated_at || apiStock.updatedAt
    };
  }

  // Get all stock items with optional filtering
  static async getStocks(filters?: StockFilter): Promise<Stock[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Handle warehouse filtering
            if (key === 'warehouseId' && value !== 'all') {
              queryParams.append('location_id', value.toString());
            } else if (key !== 'warehouseId') {
              queryParams.append(key, value.toString());
            }
          }
        });
      }
      
      const url = `${API_BASE_URL}/inventory${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stocks: ${response.statusText}`);
      }
      
      const result = await response.json();
      const rawData = result.data || [];
      
      // Transform each item to match Stock interface
      return rawData.map((item: any) => this.transformApiResponseToStock(item));
    } catch (error) {
      console.error('Error fetching stocks:', error);
      throw error;
    }
  }

  // Get single stock item by ID
  static async getStockById(id: string): Promise<Stock> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.transformApiResponseToStock(result.data || result);
    } catch (error) {
      console.error('Error fetching stock by ID:', error);
      throw error;
    }
  }

  // Create new stock entry
  static async createStock(stockData: CreateStockRequest): Promise<Stock> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create stock: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating stock:', error);
      throw error;
    }
  }

  // Update existing stock
  static async updateStock(stockData: UpdateStockRequest): Promise<Stock> {
    try {
      // Map the frontend field names to database field names
      const { id, ...updateFields } = stockData;
      const mappedFields: any = {};
      
      if (updateFields.minimumQuantity !== undefined) {
        mappedFields.min_stock_level = updateFields.minimumQuantity;
      }
      if (updateFields.maximumQuantity !== undefined) {
        mappedFields.max_stock_level = updateFields.maximumQuantity;
      }
      if (updateFields.currentQuantity !== undefined) {
        mappedFields.quantity_on_hand = updateFields.currentQuantity;
      }
      if (updateFields.costPerUnit !== undefined) {
        mappedFields.unit_cost = updateFields.costPerUnit;
      }
      if (updateFields.location !== undefined) {
        mappedFields.location_name = updateFields.location;
      }
      if (updateFields.warehouseId !== undefined) {
        mappedFields.location_id = updateFields.warehouseId;
      }
      
      console.log('Updating stock with mapped fields:', mappedFields);
      
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedFields),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to update stock: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.transformApiResponseToStock(result);
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  // Delete stock item
  static async deleteStock(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete stock: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting stock:', error);
      throw error;
    }
  }

  // Get stock summary/dashboard data
  static async getStockSummary(): Promise<StockSummary> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/summary`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock summary: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching stock summary:', error);
      throw error;
    }
  }

  // Get low stock items
  static async getLowStockItems(): Promise<Stock[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory?low_stock=true`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch low stock items: ${response.statusText}`);
      }
      
      const result = await response.json();
      const rawData = result.data || [];
      
      // Transform each item to match Stock interface
      return rawData.map((item: any) => this.transformApiResponseToStock(item));
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  }

  // Bulk update stock quantities
  static async bulkUpdateQuantities(updates: { id: string; quantity: number }[]): Promise<Stock[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/bulk-update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to bulk update stock: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error bulk updating stock:', error);
      throw error;
    }
  }
}
