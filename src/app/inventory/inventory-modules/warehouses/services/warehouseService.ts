import { 
  Warehouse, 
  WarehouseFilter, 
  CreateWarehouseRequest, 
  UpdateWarehouseRequest, 
  WarehouseStats,
  WarehouseZone,
  WarehouseLocation
} from '../types/warehouse.types';

// API Base URL - adjust according to your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class WarehouseService {
  
  // Transform API response to match Warehouse interface
  private static transformApiResponseToWarehouse(apiWarehouse: any): Warehouse {
    console.log('Transforming warehouse API response:', apiWarehouse);
    
    try {
      const result = {
        id: apiWarehouse.id,
        name: apiWarehouse.name,
        code: apiWarehouse.code,
        description: apiWarehouse.description,
        address: {
          street: apiWarehouse.address?.street || apiWarehouse.address_line1 || '',
          city: apiWarehouse.address?.city || apiWarehouse.city || '',
          state: apiWarehouse.address?.state || apiWarehouse.state || '',
          zipCode: apiWarehouse.address?.zipCode || apiWarehouse.postal_code || '',
          country: apiWarehouse.address?.country || apiWarehouse.country || ''
        },
        contactInfo: {
          phone: apiWarehouse.contact_info?.phone || apiWarehouse.phone,
          email: apiWarehouse.contact_info?.email || apiWarehouse.email,
          manager: apiWarehouse.contact_info?.manager || apiWarehouse.manager_name
        },
        isActive: apiWarehouse.is_active ?? apiWarehouse.isActive ?? true,
        isDefault: apiWarehouse.is_default ?? apiWarehouse.isDefault ?? false,
        capacity: apiWarehouse.capacity ? {
          maxVolume: apiWarehouse.capacity.max_volume,
          maxWeight: apiWarehouse.capacity.max_weight,
          maxItems: apiWarehouse.capacity.max_items
        } : (apiWarehouse.max_capacity ? {
          maxVolume: apiWarehouse.max_volume_m3,
          maxWeight: apiWarehouse.max_weight_kg,
          maxItems: apiWarehouse.max_capacity
        } : undefined),
        zones: apiWarehouse.zones?.map((zone: any) => this.transformApiResponseToZone(zone)),
        createdAt: apiWarehouse.created_at || apiWarehouse.createdAt,
        updatedAt: apiWarehouse.updated_at || apiWarehouse.updatedAt,
        // Add missing properties that might be expected
        totalInventoryItems: apiWarehouse.total_inventory_items || 0,
        totalQuantity: apiWarehouse.total_quantity || 0,
        totalInventoryValue: apiWarehouse.total_inventory_value || 0,
        uniqueProducts: apiWarehouse.unique_products || 0
      };
      
      console.log('Transformed warehouse result:', result);
      return result;
    } catch (error) {
      console.error('Error transforming warehouse:', error, apiWarehouse);
      throw error;
    }
  }

  private static transformApiResponseToZone(apiZone: any): WarehouseZone {
    return {
      id: apiZone.id,
      warehouseId: apiZone.warehouse_id || apiZone.warehouseId,
      name: apiZone.name,
      code: apiZone.code,
      description: apiZone.description,
      zoneType: apiZone.zone_type || apiZone.zoneType,
      temperature: apiZone.temperature ? {
        min: apiZone.temperature.min,
        max: apiZone.temperature.max,
        unit: apiZone.temperature.unit
      } : undefined,
      isActive: apiZone.is_active ?? apiZone.isActive ?? true,
      capacity: apiZone.capacity ? {
        maxVolume: apiZone.capacity.max_volume,
        maxWeight: apiZone.capacity.max_weight,
        maxItems: apiZone.capacity.max_items
      } : undefined,
      parentZoneId: apiZone.parent_zone_id || apiZone.parentZoneId,
      locations: apiZone.locations?.map((location: any) => this.transformApiResponseToLocation(location)),
      createdAt: apiZone.created_at || apiZone.createdAt,
      updatedAt: apiZone.updated_at || apiZone.updatedAt
    };
  }

  private static transformApiResponseToLocation(apiLocation: any): WarehouseLocation {
    return {
      id: apiLocation.id,
      warehouseId: apiLocation.warehouse_id || apiLocation.warehouseId,
      zoneId: apiLocation.zone_id || apiLocation.zoneId,
      name: apiLocation.name,
      code: apiLocation.code,
      locationType: apiLocation.location_type || apiLocation.locationType,
      position: {
        aisle: apiLocation.position?.aisle || apiLocation.aisle,
        bay: apiLocation.position?.bay || apiLocation.bay,
        shelf: apiLocation.position?.shelf || apiLocation.shelf,
        bin: apiLocation.position?.bin || apiLocation.bin,
        level: apiLocation.position?.level || apiLocation.level
      },
      barcode: apiLocation.barcode,
      qrCode: apiLocation.qr_code || apiLocation.qrCode,
      isActive: apiLocation.is_active ?? apiLocation.isActive ?? true,
      isPickable: apiLocation.is_pickable ?? apiLocation.isPickable ?? true,
      capacity: apiLocation.capacity ? {
        maxVolume: apiLocation.capacity.max_volume,
        maxWeight: apiLocation.capacity.max_weight,
        maxItems: apiLocation.capacity.max_items
      } : undefined,
      currentUtilization: apiLocation.current_utilization ? {
        volume: apiLocation.current_utilization.volume,
        weight: apiLocation.current_utilization.weight,
        items: apiLocation.current_utilization.items
      } : undefined,
      restrictions: apiLocation.restrictions ? {
        productTypes: apiLocation.restrictions.product_types,
        hazmatAllowed: apiLocation.restrictions.hazmat_allowed,
        temperatureControlled: apiLocation.restrictions.temperature_controlled
      } : undefined,
      createdAt: apiLocation.created_at || apiLocation.createdAt,
      updatedAt: apiLocation.updated_at || apiLocation.updatedAt
    };
  }

  // Get all warehouses with optional filtering
  static async getWarehouses(filters?: WarehouseFilter): Promise<Warehouse[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${API_BASE_URL}/warehouses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch warehouses: ${response.statusText}`);
      }
      
      const result = await response.json();
      const rawData = result.data || [];
      
      // Transform each item to match Warehouse interface
      return rawData.map((item: any) => this.transformApiResponseToWarehouse(item));
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      throw error;
    }
  }

  // Get single warehouse by ID
  static async getWarehouseById(id: string): Promise<Warehouse> {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch warehouse: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.transformApiResponseToWarehouse(result.data || result);
    } catch (error) {
      console.error('Error fetching warehouse by ID:', error);
      throw error;
    }
  }

  // Create new warehouse
  static async createWarehouse(warehouseData: CreateWarehouseRequest): Promise<Warehouse> {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(warehouseData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create warehouse: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.transformApiResponseToWarehouse(result.data || result);
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  }

  // Update existing warehouse
  static async updateWarehouse(warehouseData: UpdateWarehouseRequest): Promise<Warehouse> {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/${warehouseData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(warehouseData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update warehouse: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.transformApiResponseToWarehouse(result.data || result);
    } catch (error) {
      console.error('Error updating warehouse:', error);
      throw error;
    }
  }

  // Delete warehouse
  static async deleteWarehouse(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete warehouse: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      throw error;
    }
  }

  // Get warehouse statistics
  static async getWarehouseStats(): Promise<WarehouseStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/stats`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch warehouse stats: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching warehouse stats:', error);
      throw error;
    }
  }

  // Get zones for a specific warehouse
  static async getWarehouseZones(warehouseId: string): Promise<WarehouseZone[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/${warehouseId}/zones`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch warehouse zones: ${response.statusText}`);
      }
      
      const result = await response.json();
      const rawData = result.data || [];
      
      return rawData.map((zone: any) => this.transformApiResponseToZone(zone));
    } catch (error) {
      console.error('Error fetching warehouse zones:', error);
      throw error;
    }
  }

  // Get locations for a specific warehouse/zone
  static async getWarehouseLocations(warehouseId: string, zoneId?: string): Promise<WarehouseLocation[]> {
    try {
      const queryParams = zoneId ? `?zone_id=${zoneId}` : '';
      const response = await fetch(`${API_BASE_URL}/warehouses/${warehouseId}/locations${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch warehouse locations: ${response.statusText}`);
      }
      
      const result = await response.json();
      const rawData = result.data || [];
      
      return rawData.map((location: any) => this.transformApiResponseToLocation(location));
    } catch (error) {
      console.error('Error fetching warehouse locations:', error);
      throw error;
    }
  }
}
