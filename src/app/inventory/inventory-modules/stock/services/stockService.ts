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
  
  // Get all stock items with optional filtering
  static async getStocks(filters?: StockFilter): Promise<Stock[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${API_BASE_URL}/stock${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stocks: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching stocks:', error);
      throw error;
    }
  }

  // Get single stock item by ID
  static async getStockById(id: string): Promise<Stock> {
    try {
      const response = await fetch(`${API_BASE_URL}/stock/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching stock by ID:', error);
      throw error;
    }
  }

  // Create new stock entry
  static async createStock(stockData: CreateStockRequest): Promise<Stock> {
    try {
      const response = await fetch(`${API_BASE_URL}/stock`, {
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
      const response = await fetch(`${API_BASE_URL}/stock/${stockData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update stock: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  // Delete stock item
  static async deleteStock(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/stock/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/stock/summary`);
      
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
      const response = await fetch(`${API_BASE_URL}/stock/low-stock`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch low stock items: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  }

  // Bulk update stock quantities
  static async bulkUpdateQuantities(updates: { id: string; quantity: number }[]): Promise<Stock[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stock/bulk-update`, {
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
