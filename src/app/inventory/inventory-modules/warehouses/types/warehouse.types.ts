export interface Warehouse {
  id: string;
  name: string;
  code: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    phone?: string;
    email?: string;
    manager?: string;
  };
  isActive: boolean;
  isDefault: boolean;
  capacity?: {
    maxVolume?: number;
    maxWeight?: number;
    maxItems?: number;
  };
  zones?: WarehouseZone[];
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseZone {
  id: string;
  warehouseId: string;
  name: string;
  code: string;
  description?: string;
  zoneType: ZoneType;
  temperature?: {
    min: number;
    max: number;
    unit: 'celsius' | 'fahrenheit';
  };
  isActive: boolean;
  capacity?: {
    maxVolume?: number;
    maxWeight?: number;
    maxItems?: number;
  };
  parentZoneId?: string; // For sub-zones
  locations?: WarehouseLocation[];
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseLocation {
  id: string;
  warehouseId: string;
  zoneId?: string;
  name: string;
  code: string;
  locationType: LocationType;
  position: {
    aisle?: string;
    bay?: string;
    shelf?: string;
    bin?: string;
    level?: number;
  };
  barcode?: string;
  qrCode?: string;
  isActive: boolean;
  isPickable: boolean;
  capacity?: {
    maxVolume?: number;
    maxWeight?: number;
    maxItems?: number;
  };
  currentUtilization?: {
    volume?: number;
    weight?: number;
    items?: number;
  };
  restrictions?: {
    productTypes?: string[];
    hazmatAllowed?: boolean;
    temperatureControlled?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export enum ZoneType {
  RECEIVING = 'receiving',
  STORAGE = 'storage',
  PICKING = 'picking',
  PACKING = 'packing',
  SHIPPING = 'shipping',
  RETURNS = 'returns',
  QUARANTINE = 'quarantine',
  STAGING = 'staging',
  BULK = 'bulk',
  REFRIGERATED = 'refrigerated',
  FROZEN = 'frozen',
  HAZMAT = 'hazmat'
}

export enum LocationType {
  SHELF = 'shelf',
  BIN = 'bin',
  PALLET = 'pallet',
  FLOOR = 'floor',
  RACK = 'rack',
  DRAWER = 'drawer',
  CAGE = 'cage',
  VAULT = 'vault',
  COOLER = 'cooler',
  FREEZER = 'freezer'
}

export interface WarehouseFilter {
  search?: string;
  isActive?: boolean;
  city?: string;
  state?: string;
  hasCapacity?: boolean;
}

export interface CreateWarehouseRequest {
  name: string;
  code: string;
  description?: string;
  address: Warehouse['address'];
  contactInfo?: Warehouse['contactInfo'];
  isActive?: boolean;
  isDefault?: boolean;
  capacity?: Warehouse['capacity'];
}

export interface UpdateWarehouseRequest {
  id: string;
  name?: string;
  code?: string;
  description?: string;
  address?: Partial<Warehouse['address']>;
  contactInfo?: Partial<Warehouse['contactInfo']>;
  isActive?: boolean;
  isDefault?: boolean;
  capacity?: Partial<Warehouse['capacity']>;
}

export interface WarehouseStats {
  totalWarehouses: number;
  activeWarehouses: number;
  totalCapacity: {
    volume?: number;
    weight?: number;
    items?: number;
  };
  totalUtilization: {
    volume?: number;
    weight?: number;
    items?: number;
  };
  utilizationPercentage: {
    volume?: number;
    weight?: number;
    items?: number;
  };
}
