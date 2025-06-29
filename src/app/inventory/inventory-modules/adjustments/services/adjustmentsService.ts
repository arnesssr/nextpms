import { 
  Adjustment, 
  CreateAdjustmentRequest, 
  UpdateAdjustmentRequest,
  AdjustmentFilter, 
  AdjustmentSummary,
  AdjustmentsByProduct,
  AdjustmentsByReason,
  BulkAdjustmentRequest,
  AdjustmentApprovalRequest,
  AdjustmentType,
  AdjustmentReason,
  AdjustmentStatus
} from '../types/adjustments.types';

// Mock data for development
const mockAdjustments: Adjustment[] = [
  {
    id: 'adj-1',
    productId: '1',
    productName: 'Wireless Headphones',
    productSku: 'WH-001',
    type: AdjustmentType.DECREASE,
    reason: AdjustmentReason.DAMAGE,
    quantityBefore: 50,
    quantityAfter: 47,
    quantityChange: -3,
    unitOfMeasure: 'pcs',
    location: 'Warehouse A',
    warehouseId: 'wh-a',
    reference: 'DMG-2024-001',
    notes: 'Water damage during transport - 3 units affected',
    userId: 'user-1',
    userName: 'John Doe',
    approvedBy: 'manager-1',
    approvedAt: new Date('2024-02-05T14:30:00Z'),
    status: AdjustmentStatus.APPROVED,
    createdAt: new Date('2024-02-05T10:00:00Z'),
    updatedAt: new Date('2024-02-05T14:30:00Z'),
    batchNumber: 'AT-WH-2024-01',
    costImpact: -897.00
  },
  {
    id: 'adj-2',
    productId: '2',
    productName: 'Smart Watch Pro',
    productSku: 'SW-002',
    type: AdjustmentType.INCREASE,
    reason: AdjustmentReason.STOCK_FOUND,
    quantityBefore: 23,
    quantityAfter: 25,
    quantityChange: 2,
    unitOfMeasure: 'pcs',
    location: 'Warehouse B',
    warehouseId: 'wh-b',
    reference: 'FOUND-2024-001',
    notes: 'Found 2 units during warehouse reorganization',
    userId: 'user-2',
    userName: 'Jane Smith',
    status: AdjustmentStatus.PENDING,
    createdAt: new Date('2024-02-06T09:15:00Z'),
    updatedAt: new Date('2024-02-06T09:15:00Z'),
    batchNumber: 'ST-SW-2024-02',
    costImpact: 640.00
  },
  {
    id: 'adj-3',
    productId: '4',
    productName: 'Bluetooth Speaker',
    productSku: 'BS-004',
    type: AdjustmentType.RECOUNT,
    reason: AdjustmentReason.CYCLE_COUNT,
    quantityBefore: 12,
    quantityAfter: 8,
    quantityChange: -4,
    unitOfMeasure: 'pcs',
    location: 'Warehouse A',
    warehouseId: 'wh-a',
    reference: 'CC-2024-002',
    notes: 'Cycle count revealed discrepancy - system showed 12, physical count 8',
    userId: 'user-3',
    userName: 'Mike Wilson',
    approvedBy: 'manager-1',
    approvedAt: new Date('2024-02-04T16:00:00Z'),
    status: AdjustmentStatus.APPROVED,
    createdAt: new Date('2024-02-04T14:00:00Z'),
    updatedAt: new Date('2024-02-04T16:00:00Z'),
    costImpact: -599.96
  },
  {
    id: 'adj-4',
    productId: '3',
    productName: 'Gaming Mouse',
    productSku: 'GM-003',
    type: AdjustmentType.DECREASE,
    reason: AdjustmentReason.THEFT,
    quantityBefore: 67,
    quantityAfter: 65,
    quantityChange: -2,
    unitOfMeasure: 'pcs',
    location: 'Store Front',
    reference: 'THEFT-2024-001',
    notes: 'Security footage confirmed theft of 2 units',
    userId: 'user-4',
    userName: 'Sarah Connor',
    status: AdjustmentStatus.PENDING,
    createdAt: new Date('2024-02-07T11:30:00Z'),
    updatedAt: new Date('2024-02-07T11:30:00Z'),
    costImpact: -159.98
  },
  {
    id: 'adj-5',
    productId: '5',
    productName: 'USB-C Hub',
    productSku: 'UH-005',
    type: AdjustmentType.INCREASE,
    reason: AdjustmentReason.RETURN_FROM_CUSTOMER,
    quantityBefore: 0,
    quantityAfter: 3,
    quantityChange: 3,
    unitOfMeasure: 'pcs',
    location: 'Warehouse A',
    warehouseId: 'wh-a',
    reference: 'RET-2024-003',
    notes: 'Customer returned 3 units - refurbished and restocked',
    userId: 'user-1',
    userName: 'John Doe',
    approvedBy: 'manager-2',
    approvedAt: new Date('2024-02-03T13:45:00Z'),
    status: AdjustmentStatus.APPROVED,
    createdAt: new Date('2024-02-03T10:20:00Z'),
    updatedAt: new Date('2024-02-03T13:45:00Z'),
    costImpact: 179.97
  }
];

class AdjustmentsService {
  private apiUrl = '/api/adjustments';

  async getAdjustments(filter?: AdjustmentFilter): Promise<Adjustment[]> {
    // In a real app, this would make an API call
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    let filteredAdjustments = [...mockAdjustments];

    if (filter) {
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredAdjustments = filteredAdjustments.filter(adjustment =>
          adjustment.productName.toLowerCase().includes(searchLower) ||
          adjustment.productSku.toLowerCase().includes(searchLower) ||
          adjustment.reference?.toLowerCase().includes(searchLower) ||
          adjustment.notes?.toLowerCase().includes(searchLower)
        );
      }

      if (filter.productId) {
        filteredAdjustments = filteredAdjustments.filter(adjustment => 
          adjustment.productId === filter.productId
        );
      }

      if (filter.type) {
        filteredAdjustments = filteredAdjustments.filter(adjustment => 
          adjustment.type === filter.type
        );
      }

      if (filter.reason) {
        filteredAdjustments = filteredAdjustments.filter(adjustment => 
          adjustment.reason === filter.reason
        );
      }

      if (filter.status) {
        filteredAdjustments = filteredAdjustments.filter(adjustment => 
          adjustment.status === filter.status
        );
      }

      if (filter.location) {
        filteredAdjustments = filteredAdjustments.filter(adjustment => 
          adjustment.location === filter.location
        );
      }

      if (filter.warehouseId) {
        filteredAdjustments = filteredAdjustments.filter(adjustment => 
          adjustment.warehouseId === filter.warehouseId
        );
      }

      if (filter.userId) {
        filteredAdjustments = filteredAdjustments.filter(adjustment => 
          adjustment.userId === filter.userId
        );
      }

      if (filter.dateFrom) {
        filteredAdjustments = filteredAdjustments.filter(adjustment => 
          new Date(adjustment.createdAt) >= filter.dateFrom!
        );
      }

      if (filter.dateTo) {
        filteredAdjustments = filteredAdjustments.filter(adjustment => 
          new Date(adjustment.createdAt) <= filter.dateTo!
        );
      }

      if (filter.minQuantityChange !== undefined) {
        filteredAdjustments = filteredAdjustments.filter(adjustment => 
          Math.abs(adjustment.quantityChange) >= filter.minQuantityChange!
        );
      }

      if (filter.maxQuantityChange !== undefined) {
        filteredAdjustments = filteredAdjustments.filter(adjustment => 
          Math.abs(adjustment.quantityChange) <= filter.maxQuantityChange!
        );
      }

      if (filter.requiresApproval !== undefined) {
        if (filter.requiresApproval) {
          filteredAdjustments = filteredAdjustments.filter(adjustment => 
            adjustment.status === AdjustmentStatus.PENDING
          );
        }
      }
    }

    return filteredAdjustments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAdjustmentById(id: string): Promise<Adjustment | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const adjustment = mockAdjustments.find(a => a.id === id);
    return adjustment || null;
  }

  async createAdjustment(request: CreateAdjustmentRequest): Promise<Adjustment> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Calculate the quantity change
    const quantityChange = request.quantityAfter - request.quantityBefore;
    
    // In a real app, this would create via API and return the created adjustment
    const newAdjustment: Adjustment = {
      id: `adj-${Date.now()}`,
      productName: 'Product Name', // Would be fetched from product service
      productSku: 'PROD-SKU', // Would be fetched from product service
      userId: 'current-user-id', // Would come from auth context
      userName: 'Current User', // Would come from auth context
      quantityChange,
      unitOfMeasure: 'pcs', // Would come from product data
      status: AdjustmentStatus.PENDING, // Default status for new adjustments
      createdAt: new Date(),
      updatedAt: new Date(),
      costImpact: quantityChange * 50, // Mock calculation
      ...request
    };

    // Add to mock data
    mockAdjustments.unshift(newAdjustment);
    
    return newAdjustment;
  }

  async updateAdjustment(request: UpdateAdjustmentRequest): Promise<Adjustment> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockAdjustments.findIndex(a => a.id === request.id);
    if (index === -1) {
      throw new Error('Adjustment not found');
    }

    const existingAdjustment = mockAdjustments[index];
    const updatedAdjustment: Adjustment = {
      ...existingAdjustment,
      ...request,
      updatedAt: new Date()
    };

    // Recalculate quantity change if quantityAfter is updated
    if (request.quantityAfter !== undefined) {
      updatedAdjustment.quantityChange = request.quantityAfter - updatedAdjustment.quantityBefore;
      updatedAdjustment.costImpact = updatedAdjustment.quantityChange * 50; // Mock calculation
    }

    mockAdjustments[index] = updatedAdjustment;
    return updatedAdjustment;
  }

  async approveAdjustments(request: AdjustmentApprovalRequest): Promise<Adjustment[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedAdjustments: Adjustment[] = [];
    
    for (const adjustmentId of request.adjustmentIds) {
      const index = mockAdjustments.findIndex(a => a.id === adjustmentId);
      if (index !== -1) {
        const adjustment = mockAdjustments[index];
        const updatedAdjustment: Adjustment = {
          ...adjustment,
          status: request.approved ? AdjustmentStatus.APPROVED : AdjustmentStatus.REJECTED,
          approvedBy: 'current-manager-id', // Would come from auth context
          approvedAt: new Date(),
          updatedAt: new Date(),
          notes: request.approvalNotes ? 
            `${adjustment.notes}\n\nApproval Notes: ${request.approvalNotes}` : 
            adjustment.notes
        };
        
        mockAdjustments[index] = updatedAdjustment;
        updatedAdjustments.push(updatedAdjustment);
      }
    }
    
    return updatedAdjustments;
  }

  async createBulkAdjustments(request: BulkAdjustmentRequest): Promise<Adjustment[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const createdAdjustments: Adjustment[] = [];
    
    for (const adjustmentRequest of request.adjustments) {
      const adjustment = await this.createAdjustment(adjustmentRequest);
      createdAdjustments.push(adjustment);
    }

    return createdAdjustments;
  }

  async getAdjustmentSummary(filter?: AdjustmentFilter): Promise<AdjustmentSummary> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const adjustments = await this.getAdjustments(filter);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const summary: AdjustmentSummary = {
      totalAdjustments: adjustments.length,
      pendingAdjustments: adjustments.filter(a => a.status === AdjustmentStatus.PENDING).length,
      approvedAdjustments: adjustments.filter(a => a.status === AdjustmentStatus.APPROVED).length,
      rejectedAdjustments: adjustments.filter(a => a.status === AdjustmentStatus.REJECTED).length,
      totalIncreases: adjustments.filter(a => a.quantityChange > 0).length,
      totalDecreases: adjustments.filter(a => a.quantityChange < 0).length,
      totalCostImpact: adjustments.reduce((sum, a) => sum + (a.costImpact || 0), 0),
      adjustmentsToday: adjustments.filter(a => new Date(a.createdAt) >= today).length,
      adjustmentsThisWeek: adjustments.filter(a => new Date(a.createdAt) >= weekStart).length,
      adjustmentsThisMonth: adjustments.filter(a => new Date(a.createdAt) >= monthStart).length
    };

    return summary;
  }

  async getAdjustmentsByProduct(filter?: AdjustmentFilter): Promise<AdjustmentsByProduct[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const adjustments = await this.getAdjustments(filter);
    const productAdjustments = new Map<string, AdjustmentsByProduct>();

    adjustments.forEach(adjustment => {
      const key = adjustment.productId;
      
      if (!productAdjustments.has(key)) {
        productAdjustments.set(key, {
          productId: adjustment.productId,
          productName: adjustment.productName,
          productSku: adjustment.productSku,
          totalAdjustments: 0,
          totalIncrease: 0,
          totalDecrease: 0,
          netAdjustment: 0,
          lastAdjustment: adjustment.createdAt,
          avgAdjustmentSize: 0
        });
      }

      const productData = productAdjustments.get(key)!;
      
      productData.totalAdjustments++;
      
      if (adjustment.quantityChange > 0) {
        productData.totalIncrease += adjustment.quantityChange;
      } else {
        productData.totalDecrease += Math.abs(adjustment.quantityChange);
      }
      
      productData.netAdjustment += adjustment.quantityChange;
      
      if (new Date(adjustment.createdAt) > new Date(productData.lastAdjustment)) {
        productData.lastAdjustment = adjustment.createdAt;
      }
    });

    // Calculate average adjustment size
    productAdjustments.forEach(productData => {
      productData.avgAdjustmentSize = Math.abs(productData.netAdjustment) / productData.totalAdjustments;
    });

    return Array.from(productAdjustments.values())
      .sort((a, b) => b.totalAdjustments - a.totalAdjustments);
  }

  async getAdjustmentsByReason(filter?: AdjustmentFilter): Promise<AdjustmentsByReason[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const adjustments = await this.getAdjustments(filter);
    const reasonStats = new Map<AdjustmentReason, AdjustmentsByReason>();

    adjustments.forEach(adjustment => {
      const reason = adjustment.reason;
      
      if (!reasonStats.has(reason)) {
        reasonStats.set(reason, {
          reason,
          count: 0,
          totalQuantity: 0,
          percentage: 0
        });
      }

      const reasonData = reasonStats.get(reason)!;
      reasonData.count++;
      reasonData.totalQuantity += Math.abs(adjustment.quantityChange);
    });

    // Calculate percentages
    const totalAdjustments = adjustments.length;
    reasonStats.forEach(reasonData => {
      reasonData.percentage = (reasonData.count / totalAdjustments) * 100;
    });

    return Array.from(reasonStats.values())
      .sort((a, b) => b.count - a.count);
  }

  async deleteAdjustment(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockAdjustments.findIndex(a => a.id === id);
    if (index > -1) {
      // Only allow deletion of draft or rejected adjustments
      const adjustment = mockAdjustments[index];
      if (adjustment.status === AdjustmentStatus.DRAFT || adjustment.status === AdjustmentStatus.REJECTED) {
        mockAdjustments.splice(index, 1);
      } else {
        throw new Error('Cannot delete approved or pending adjustments');
      }
    }
  }
}

export const adjustmentsService = new AdjustmentsService();
