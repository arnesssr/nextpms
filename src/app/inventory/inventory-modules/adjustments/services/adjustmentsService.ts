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

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class AdjustmentsService {
  private apiUrl = `${API_BASE_URL}/adjustments`;

  async fetchAdjustments(filter?: AdjustmentFilter): Promise<Adjustment[]> {
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
      console.log('Fetching adjustments from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch adjustments: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      console.log('Raw adjustments data:', rawData);
      
      // Map API response to Adjustment interface
      const adjustments: Adjustment[] = (rawData || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.products?.name || 'Unknown Product',
        productSku: item.products?.sku || '',
        type: item.adjustment_type as AdjustmentType,
        reason: item.reason as AdjustmentReason,
        quantityBefore: item.quantity_before,
        quantityAfter: item.quantity_after,
        quantityChange: item.quantity_change,
        unitOfMeasure: 'units',
        location: item.location,
        reference: item.reference,
        notes: item.notes,
        userId: item.created_by,
        userName: item.created_by,
        approvedBy: item.approved_by,
        approvedAt: item.approved_at ? new Date(item.approved_at) : undefined,
        status: item.status as AdjustmentStatus,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        costImpact: item.cost_impact
      }));
      
      return adjustments;
    } catch (error) {
      console.error('Error fetching adjustments:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  async getAdjustmentById(id: string): Promise<Adjustment | null> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch adjustment: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching adjustment by ID:', error);
      return null;
    }
  }

  async createAdjustment(request: CreateAdjustmentRequest): Promise<Adjustment> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create adjustment: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating adjustment:', error);
      throw error;
    }
  }

  async updateAdjustment(request: UpdateAdjustmentRequest): Promise<Adjustment> {
    try {
      const response = await fetch(`${this.apiUrl}/${request.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update adjustment: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating adjustment:', error);
      throw error;
    }
  }

  async approveAdjustments(request: AdjustmentApprovalRequest): Promise<Adjustment[]> {
    try {
      const response = await fetch(`${this.apiUrl}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to approve adjustments: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error approving adjustments:', error);
      throw error;
    }
  }

  async createBulkAdjustments(request: BulkAdjustmentRequest): Promise<Adjustment[]> {
    try {
      const response = await fetch(`${this.apiUrl}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create bulk adjustments: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating bulk adjustments:', error);
      throw error;
    }
  }

  async fetchAdjustmentSummary(filter?: AdjustmentFilter): Promise<AdjustmentSummary> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${this.apiUrl}/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch adjustment summary: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching adjustment summary:', error);
      // Return empty summary to prevent UI crashes
      return {
        totalAdjustments: 0,
        pendingAdjustments: 0,
        approvedAdjustments: 0,
        rejectedAdjustments: 0,
        totalIncreases: 0,
        totalDecreases: 0,
        totalCostImpact: 0,
        adjustmentsToday: 0,
        adjustmentsThisWeek: 0,
        adjustmentsThisMonth: 0
      };
    }
  }

  async fetchAdjustmentsByProduct(filter?: AdjustmentFilter): Promise<AdjustmentsByProduct[]> {
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
        throw new Error(`Failed to fetch adjustments by product: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching adjustments by product:', error);
      return [];
    }
  }

  async fetchAdjustmentsByReason(filter?: AdjustmentFilter): Promise<AdjustmentsByReason[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${this.apiUrl}/by-reason${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch adjustments by reason: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching adjustments by reason:', error);
      return [];
    }
  }

  async deleteAdjustment(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete adjustment: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting adjustment:', error);
      throw error;
    }
  }
}

export const adjustmentsService = new AdjustmentsService();
