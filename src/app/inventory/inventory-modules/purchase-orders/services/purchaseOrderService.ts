import { 
  PurchaseOrder, 
  CreatePurchaseOrderRequest, 
  UpdatePurchaseOrderRequest, 
  PurchaseOrderFilter, 
  PurchaseOrderSummary,
  Supplier
} from '../types/purchase-order.types';

// API Base URL - adjust according to your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class PurchaseOrderService {
  
  // Transform API response to match PurchaseOrder interface
  private static transformApiResponseToPurchaseOrder(apiPO: any): PurchaseOrder {
    return {
      id: apiPO.id,
      poNumber: apiPO.po_number || apiPO.poNumber,
      supplierId: apiPO.supplier_id || apiPO.supplierId,
      supplierName: apiPO.supplier?.name || apiPO.supplierName || 'Unknown Supplier',
      supplierEmail: apiPO.supplier?.email || apiPO.supplierEmail,
      supplierPhone: apiPO.supplier?.phone || apiPO.supplierPhone,
      status: apiPO.status,
      orderDate: new Date(apiPO.order_date || apiPO.orderDate),
      expectedDeliveryDate: apiPO.expected_delivery_date ? new Date(apiPO.expected_delivery_date) : undefined,
      actualDeliveryDate: apiPO.actual_delivery_date ? new Date(apiPO.actual_delivery_date) : undefined,
      items: apiPO.items || [],
      subtotal: apiPO.subtotal || 0,
      taxAmount: apiPO.tax_amount || apiPO.taxAmount || 0,
      totalAmount: apiPO.total_amount || apiPO.totalAmount || 0,
      notes: apiPO.notes,
      createdBy: apiPO.created_by || apiPO.createdBy || 'Unknown',
      createdAt: new Date(apiPO.created_at || apiPO.createdAt),
      updatedAt: new Date(apiPO.updated_at || apiPO.updatedAt),
      approvedBy: apiPO.approved_by || apiPO.approvedBy,
      approvedAt: apiPO.approved_at ? new Date(apiPO.approved_at) : undefined,
    };
  }

  // Get all purchase orders with optional filtering
  static async getPurchaseOrders(filters?: PurchaseOrderFilter): Promise<PurchaseOrder[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${API_BASE_URL}/purchase-orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch purchase orders: ${response.statusText}`);
      }
      
      const result = await response.json();
      const rawData = result.data || result || [];
      
      return rawData.map((item: any) => this.transformApiResponseToPurchaseOrder(item));
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  }

  // Get single purchase order by ID
  static async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch purchase order: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.transformApiResponseToPurchaseOrder(result.data || result);
    } catch (error) {
      console.error('Error fetching purchase order by ID:', error);
      throw error;
    }
  }

  // Create new purchase order
  static async createPurchaseOrder(poData: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplier_id: poData.supplierId,
          expected_delivery_date: poData.expectedDeliveryDate?.toISOString(),
          items: poData.items.map(item => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice
          })),
          notes: poData.notes
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create purchase order: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.transformApiResponseToPurchaseOrder(result.data || result);
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }

  // Update existing purchase order
  static async updatePurchaseOrder(poData: UpdatePurchaseOrderRequest): Promise<PurchaseOrder> {
    try {
      const { id, ...updateFields } = poData;
      const mappedFields: any = {};
      
      if (updateFields.supplierId !== undefined) {
        mappedFields.supplier_id = updateFields.supplierId;
      }
      if (updateFields.expectedDeliveryDate !== undefined) {
        mappedFields.expected_delivery_date = updateFields.expectedDeliveryDate?.toISOString();
      }
      if (updateFields.items !== undefined) {
        mappedFields.items = updateFields.items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice
        }));
      }
      if (updateFields.notes !== undefined) {
        mappedFields.notes = updateFields.notes;
      }
      if (updateFields.status !== undefined) {
        mappedFields.status = updateFields.status;
      }
      
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedFields),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to update purchase order: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.transformApiResponseToPurchaseOrder(result.data || result);
    } catch (error) {
      console.error('Error updating purchase order:', error);
      throw error;
    }
  }

  // Delete purchase order
  static async deletePurchaseOrder(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete purchase order: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      throw error;
    }
  }

  // Get purchase order summary/dashboard data
  static async getPurchaseOrderSummary(): Promise<PurchaseOrderSummary> {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/summary`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch purchase order summary: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching purchase order summary:', error);
      throw error;
    }
  }

  // Get suppliers
  static async getSuppliers(): Promise<Supplier[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch suppliers: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result || [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  // Approve purchase order
  static async approvePurchaseOrder(id: string): Promise<PurchaseOrder> {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to approve purchase order: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.transformApiResponseToPurchaseOrder(result.data || result);
    } catch (error) {
      console.error('Error approving purchase order:', error);
      throw error;
    }
  }

  // Send purchase order to supplier
  static async sendPurchaseOrder(id: string): Promise<PurchaseOrder> {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}/send`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send purchase order: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.transformApiResponseToPurchaseOrder(result.data || result);
    } catch (error) {
      console.error('Error sending purchase order:', error);
      throw error;
    }
  }
}
