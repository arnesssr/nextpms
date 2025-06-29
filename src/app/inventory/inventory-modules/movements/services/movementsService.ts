import { 
  Movement, 
  CreateMovementRequest, 
  MovementFilter, 
  MovementSummary,
  MovementsByProduct,
  BulkMovementRequest,
  MovementType,
  MovementReason
} from '../types/movements.types';

// Mock data for development
const mockMovements: Movement[] = [
  {
    id: 'mov-1',
    productId: '1',
    productName: 'Wireless Headphones',
    productSku: 'WH-001',
    type: MovementType.IN,
    quantity: 50,
    unitOfMeasure: 'pcs',
    reason: MovementReason.PURCHASE,
    location: 'Warehouse A',
    warehouseId: 'wh-a',
    reference: 'PO-2024-001',
    notes: 'Initial stock purchase',
    userId: 'user-1',
    userName: 'John Doe',
    timestamp: new Date('2024-02-01T09:00:00Z'),
    beforeQuantity: 0,
    afterQuantity: 50,
    unitCost: 250.00,
    totalCost: 12500.00,
    supplier: 'AudioTech Ltd',
    batchNumber: 'AT-WH-2024-01'
  },
  {
    id: 'mov-2',
    productId: '1',
    productName: 'Wireless Headphones',
    productSku: 'WH-001',
    type: MovementType.OUT,
    quantity: 5,
    unitOfMeasure: 'pcs',
    reason: MovementReason.SALE,
    location: 'Warehouse A',
    warehouseId: 'wh-a',
    reference: 'INV-2024-001',
    notes: 'Online order fulfillment',
    userId: 'user-2',
    userName: 'Jane Smith',
    timestamp: new Date('2024-02-02T14:30:00Z'),
    beforeQuantity: 50,
    afterQuantity: 45,
    customer: 'Tech Solutions Inc'
  },
  {
    id: 'mov-3',
    productId: '2',
    productName: 'Smart Watch Pro',
    productSku: 'SW-002',
    type: MovementType.IN,
    quantity: 30,
    unitOfMeasure: 'pcs',
    reason: MovementReason.PURCHASE,
    location: 'Warehouse A',
    warehouseId: 'wh-a',
    reference: 'PO-2024-002',
    notes: 'Restocking for new product launch',
    userId: 'user-1',
    userName: 'John Doe',
    timestamp: new Date('2024-02-03T10:15:00Z'),
    beforeQuantity: 20,
    afterQuantity: 50,
    unitCost: 320.00,
    totalCost: 9600.00,
    supplier: 'SmartTech Corp',
    batchNumber: 'ST-SW-2024-02'
  },
  {
    id: 'mov-4',
    productId: '4',
    productName: 'Bluetooth Speaker',
    productSku: 'BS-004',
    type: MovementType.OUT,
    quantity: 2,
    unitOfMeasure: 'pcs',
    reason: MovementReason.DAMAGED,
    location: 'Warehouse A',
    warehouseId: 'wh-a',
    reference: 'DMG-2024-001',
    notes: 'Water damage during shipment',
    userId: 'user-3',
    userName: 'Mike Wilson',
    timestamp: new Date('2024-02-03T16:45:00Z'),
    beforeQuantity: 10,
    afterQuantity: 8
  },
  {
    id: 'mov-5',
    productId: '3',
    productName: 'Gaming Mouse',
    productSku: 'GM-003',
    type: MovementType.TRANSFER,
    quantity: 10,
    unitOfMeasure: 'pcs',
    reason: MovementReason.TRANSFER_OUT,
    location: 'Warehouse A',
    warehouseId: 'wh-a',
    reference: 'TRF-2024-001',
    notes: 'Transfer to Warehouse B for regional distribution',
    userId: 'user-1',
    userName: 'John Doe',
    timestamp: new Date('2024-02-04T11:20:00Z'),
    beforeQuantity: 77,
    afterQuantity: 67
  }
];

class MovementsService {
  private apiUrl = '/api/movements';

  async getMovements(filter?: MovementFilter): Promise<Movement[]> {
    // In a real app, this would make an API call
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    let filteredMovements = [...mockMovements];

    if (filter) {
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredMovements = filteredMovements.filter(movement =>
          movement.productName.toLowerCase().includes(searchLower) ||
          movement.productSku.toLowerCase().includes(searchLower) ||
          movement.reference?.toLowerCase().includes(searchLower) ||
          movement.notes?.toLowerCase().includes(searchLower)
        );
      }

      if (filter.productId) {
        filteredMovements = filteredMovements.filter(movement => 
          movement.productId === filter.productId
        );
      }

      if (filter.type) {
        filteredMovements = filteredMovements.filter(movement => 
          movement.type === filter.type
        );
      }

      if (filter.reason) {
        filteredMovements = filteredMovements.filter(movement => 
          movement.reason === filter.reason
        );
      }

      if (filter.location) {
        filteredMovements = filteredMovements.filter(movement => 
          movement.location === filter.location
        );
      }

      if (filter.warehouseId) {
        filteredMovements = filteredMovements.filter(movement => 
          movement.warehouseId === filter.warehouseId
        );
      }

      if (filter.userId) {
        filteredMovements = filteredMovements.filter(movement => 
          movement.userId === filter.userId
        );
      }

      if (filter.dateFrom) {
        filteredMovements = filteredMovements.filter(movement => 
          new Date(movement.timestamp) >= filter.dateFrom!
        );
      }

      if (filter.dateTo) {
        filteredMovements = filteredMovements.filter(movement => 
          new Date(movement.timestamp) <= filter.dateTo!
        );
      }

      if (filter.minQuantity !== undefined) {
        filteredMovements = filteredMovements.filter(movement => 
          movement.quantity >= filter.minQuantity!
        );
      }

      if (filter.maxQuantity !== undefined) {
        filteredMovements = filteredMovements.filter(movement => 
          movement.quantity <= filter.maxQuantity!
        );
      }
    }

    return filteredMovements.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getMovementById(id: string): Promise<Movement | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const movement = mockMovements.find(m => m.id === id);
    return movement || null;
  }

  async createMovement(request: CreateMovementRequest): Promise<Movement> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, this would create via API and return the created movement
    const newMovement: Movement = {
      id: `mov-${Date.now()}`,
      productName: 'Product Name', // Would be fetched from product service
      productSku: 'PROD-SKU', // Would be fetched from product service
      userId: 'current-user-id', // Would come from auth context
      userName: 'Current User', // Would come from auth context
      timestamp: new Date(),
      beforeQuantity: 0, // Would be calculated based on current stock
      afterQuantity: request.quantity, // Would be calculated
      unitOfMeasure: 'pcs', // Would come from product data
      totalCost: request.unitCost ? request.unitCost * request.quantity : undefined,
      ...request
    };

    return newMovement;
  }

  async createBulkMovements(request: BulkMovementRequest): Promise<Movement[]> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // In a real app, this would create multiple movements via API
    const createdMovements: Movement[] = [];
    
    for (const movementRequest of request.movements) {
      const movement = await this.createMovement(movementRequest);
      createdMovements.push(movement);
    }

    return createdMovements;
  }

  async getMovementSummary(filter?: MovementFilter): Promise<MovementSummary> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const movements = await this.getMovements(filter);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const summary: MovementSummary = {
      totalMovements: movements.length,
      totalStockIn: movements
        .filter(m => m.type === MovementType.IN)
        .reduce((sum, m) => sum + m.quantity, 0),
      totalStockOut: movements
        .filter(m => m.type === MovementType.OUT)
        .reduce((sum, m) => sum + m.quantity, 0),
      totalValue: movements
        .reduce((sum, m) => sum + (m.totalCost || 0), 0),
      movementsToday: movements
        .filter(m => new Date(m.timestamp) >= today).length,
      movementsThisWeek: movements
        .filter(m => new Date(m.timestamp) >= weekStart).length,
      movementsThisMonth: movements
        .filter(m => new Date(m.timestamp) >= monthStart).length
    };

    return summary;
  }

  async getMovementsByProduct(filter?: MovementFilter): Promise<MovementsByProduct[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const movements = await this.getMovements(filter);
    const productMovements = new Map<string, MovementsByProduct>();

    movements.forEach(movement => {
      const key = movement.productId;
      
      if (!productMovements.has(key)) {
        productMovements.set(key, {
          productId: movement.productId,
          productName: movement.productName,
          productSku: movement.productSku,
          totalIn: 0,
          totalOut: 0,
          netMovement: 0,
          lastMovement: movement.timestamp,
          movementCount: 0
        });
      }

      const productData = productMovements.get(key)!;
      
      if (movement.type === MovementType.IN) {
        productData.totalIn += movement.quantity;
      } else if (movement.type === MovementType.OUT) {
        productData.totalOut += movement.quantity;
      }
      
      productData.netMovement = productData.totalIn - productData.totalOut;
      productData.movementCount++;
      
      if (new Date(movement.timestamp) > new Date(productData.lastMovement)) {
        productData.lastMovement = movement.timestamp;
      }
    });

    return Array.from(productMovements.values())
      .sort((a, b) => b.movementCount - a.movementCount);
  }

  async deleteMovement(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, this would delete via API
    const index = mockMovements.findIndex(m => m.id === id);
    if (index > -1) {
      mockMovements.splice(index, 1);
    }
  }
}

export const movementsService = new MovementsService();
