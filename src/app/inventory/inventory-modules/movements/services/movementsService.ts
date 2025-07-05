import { 
  Movement, 
  CreateMovementRequest, 
  MovementFilter,
  MovementsByProduct,
  BulkMovementRequest,
  MovementType,
  MovementReason
} from '../types/movements.types';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class MovementsService {
  private apiUrl = `${API_BASE_URL}/movements`;
  private suppliersUrl = `${API_BASE_URL}/suppliers`;

  async getMovements(filter?: MovementFilter): Promise<Movement[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${this.apiUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('Fetching movements from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch movements: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      console.log('Raw movements data:', rawData);
      
      // Map API response to Movement interface
      const movements: Movement[] = (rawData || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.products?.name || 'Unknown Product',
        productSku: item.products?.sku || '',
        type: item.movement_type as MovementType,
        quantity: item.quantity,
        unitOfMeasure: 'units',
        reason: item.reason as MovementReason,
        location: item.location_to_name || item.location_to_id,
        warehouseId: item.location_to_id,
        reference: item.reference_number,
        notes: item.notes,
        userId: item.created_by,
        userName: item.created_by,
        timestamp: new Date(item.created_at),
        beforeQuantity: item.quantity_before || 0,
        afterQuantity: item.quantity_after || item.quantity,
        unitCost: item.unit_cost,
        totalCost: item.total_cost || (item.quantity * (item.unit_cost || 0)),
        batchNumber: item.batch_number,
        expiryDate: item.expiry_date ? new Date(item.expiry_date) : undefined
      }));
      
      return movements;
    } catch (error) {
      console.error('Error fetching movements:', error);
      throw error;
    }
  }

  async getMovementById(id: string): Promise<Movement | null> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch movement: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching movement by ID:', error);
      throw error;
    }
  }

  async createMovement(request: CreateMovementRequest): Promise<Movement> {
    try {
      // Build notes with supplier info if provided
      let notes = request.notes || '';
      if (request.supplier) {
        notes = notes ? `Supplier: ${request.supplier}. ${notes}` : `Supplier: ${request.supplier}`;
      }
      
      // Map frontend request to API format
      const apiRequest = {
        product_id: request.productId,
        movement_type: request.type,
        quantity: request.quantity,
        reason: request.reason,
        location_to_id: request.location,
        location_to_name: request.location,
        location_from_id: request.warehouseId,
        location_from_name: request.warehouseId,
        unit_cost: request.unitCost || 0,
        reference_number: request.reference,
        notes: notes,
        created_by: 'current_user', // TODO: Get from auth context
        auto_process: true // Auto-complete the movement
      };

      console.log('Sending API request:', apiRequest);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequest),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || errorData.details || `Failed to create movement: ${response.statusText}`);
        } catch (parseError) {
          throw new Error(`Failed to create movement: ${response.statusText}`);
        }
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      // Map API response back to frontend format
      const movement: Movement = {
        id: result.id,
        productId: result.product_id,
        productName: result.products?.name || 'Unknown Product',
        productSku: result.products?.sku || '',
        type: result.movement_type as MovementType,
        quantity: result.quantity,
        unitOfMeasure: 'units', // Default unit
        reason: result.reason as MovementReason,
        location: result.location_to_name || result.location_to_id,
        warehouseId: result.location_to_id,
        reference: result.reference_number,
        notes: result.notes,
        userId: result.created_by,
        userName: result.created_by,
        timestamp: new Date(result.created_at),
        beforeQuantity: result.quantity_before || 0,
        afterQuantity: result.quantity_after || result.quantity,
        unitCost: result.unit_cost,
        totalCost: result.total_cost || (result.quantity * (result.unit_cost || 0)),
        supplier: request.supplier,
        customer: request.customer,
        batchNumber: request.batchNumber,
        expiryDate: request.expiryDate
      };
      
      return movement;
    } catch (error) {
      console.error('Error creating movement:', error);
      throw error;
    }
  }

  async createBulkMovements(request: BulkMovementRequest): Promise<Movement[]> {
    try {
      const response = await fetch(`${this.apiUrl}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create bulk movements: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating bulk movements:', error);
      throw error;
    }
  }


  async getMovementsByProduct(filter?: MovementFilter): Promise<MovementsByProduct[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${this.apiUrl}/by-product${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch movements by product: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching movements by product:', error);
      throw error;
    }
  }

  async deleteMovement(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete movement: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting movement:', error);
      throw error;
    }
  }

  async getSuppliers(): Promise<string[]> {
    try {
      const response = await fetch(this.suppliersUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to load suppliers: ${response.statusText}`);
      }
      
      const data = await response.json();
      const supplierNames = data.data?.map((s: any) => s.name) || [];
      
      // Remove duplicates
      const uniqueSuppliers = [...new Set(supplierNames)];
      console.log('Loaded suppliers from API:', uniqueSuppliers);
      
      return uniqueSuppliers;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  async getLocations(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouses`);
      
      if (!response.ok) {
        throw new Error(`Failed to load warehouses: ${response.statusText}`);
      }
      
      const data = await response.json();
      const warehouseNames = data.data?.map((w: any) => w.name) || [];
      
      // Remove duplicates
      const uniqueLocations = [...new Set(warehouseNames)];
      console.log('Loaded locations from API:', uniqueLocations);
      
      return uniqueLocations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }
}

export const movementsService = new MovementsService();
