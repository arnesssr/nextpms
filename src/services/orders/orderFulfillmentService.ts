import { supabase } from '@/lib/supabaseClient';
import { Order } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface FulfillmentRecord {
  id: string;
  order_id: string;
  fulfillment_status: string;
  tracking_number?: string;
  shipping_carrier?: string;
  tracking_url?: string;
  warehouse_location?: string;
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface BulkUpdateResult {
  processedCount: number;
  failedCount: number;
  results: Array<{
    orderId: string;
    success: boolean;
    error?: string;
  }>;
}

export class OrderFulfillmentService {
  /**
   * Update order fulfillment status
   */
  static async updateOrderStatus(
    orderId: string,
    status: string,
    shipmentInfo?: {
      carrier?: string;
      trackingNumber?: string;
      trackingUrl?: string;
    }
  ): Promise<ApiResponse<Order>> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      // Add shipping info if provided
      if (shipmentInfo) {
        if (shipmentInfo.trackingNumber) {
          updateData.tracking_number = shipmentInfo.trackingNumber;
        }
        if (shipmentInfo.carrier) {
          updateData.shipping_carrier = shipmentInfo.carrier;
        }
        if (shipmentInfo.trackingUrl) {
          updateData.tracking_url = shipmentInfo.trackingUrl;
        }
      }

      // Set timestamps based on status
      if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      // Update the order
      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        return {
          success: false,
          message: error.message
        };
      }

      // Update order items status if needed
      if (['shipped', 'delivered', 'cancelled'].includes(status)) {
        await supabase
          .from('order_items')
          .update({ 
            status: status === 'cancelled' ? 'cancelled' : status,
            updated_at: new Date().toISOString()
          })
          .eq('order_id', orderId);
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return {
        success: false,
        message: 'Failed to update order status'
      };
    }
  }

  /**
   * Bulk update multiple orders
   */
  static async bulkUpdateOrders(
    orderIds: string[],
    action: 'start_processing' | 'mark_packed' | 'mark_shipped' | 'mark_delivered' | 'cancel'
  ): Promise<ApiResponse<BulkUpdateResult>> {
    try {
      const actionToStatus: Record<string, string> = {
        'start_processing': 'processing',
        'mark_packed': 'packed',
        'mark_shipped': 'shipped',
        'mark_delivered': 'delivered',
        'cancel': 'cancelled'
      };

      const newStatus = actionToStatus[action];
      const results = await Promise.all(
        orderIds.map(async (orderId) => {
          try {
            const result = await this.updateOrderStatus(orderId, newStatus);
            return {
              orderId,
              success: result.success,
              error: result.message
            };
          } catch (error) {
            return {
              orderId,
              success: false,
              error: 'Failed to process order'
            };
          }
        })
      );

      const processedCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;

      return {
        success: true,
        data: {
          processedCount,
          failedCount,
          results
        }
      };
    } catch (error) {
      console.error('Error in bulkUpdateOrders:', error);
      return {
        success: false,
        message: 'Failed to bulk update orders'
      };
    }
  }

  /**
   * Create fulfillment record
   */
  static async createFulfillmentRecord(
    orderId: string,
    fulfillmentData: {
      status: string;
      trackingNumber?: string;
      carrier?: string;
      trackingUrl?: string;
      warehouseLocation?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<FulfillmentRecord>> {
    try {
      const { data, error } = await supabase
        .from('order_fulfillments')
        .insert({
          order_id: orderId,
          fulfillment_status: fulfillmentData.status,
          tracking_number: fulfillmentData.trackingNumber,
          shipping_carrier: fulfillmentData.carrier,
          tracking_url: fulfillmentData.trackingUrl,
          warehouse_location: fulfillmentData.warehouseLocation,
          notes: fulfillmentData.notes,
          shipped_at: fulfillmentData.status === 'shipped' ? new Date().toISOString() : null,
          delivered_at: fulfillmentData.status === 'delivered' ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating fulfillment record:', error);
        return {
          success: false,
          message: error.message
        };
      }

      // Create fulfillment items if order is shipped
      if (fulfillmentData.status === 'shipped') {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('id, quantity')
          .eq('order_id', orderId);

        if (orderItems && orderItems.length > 0) {
          const fulfillmentItems = orderItems.map(item => ({
            fulfillment_id: data.id,
            order_item_id: item.id,
            quantity_fulfilled: item.quantity,
            warehouse_location: fulfillmentData.warehouseLocation
          }));

          await supabase
            .from('order_fulfillment_items')
            .insert(fulfillmentItems);
        }
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error in createFulfillmentRecord:', error);
      return {
        success: false,
        message: 'Failed to create fulfillment record'
      };
    }
  }

  /**
   * Get fulfillment history for an order
   */
  static async getFulfillmentHistory(orderId: string): Promise<ApiResponse<FulfillmentRecord[]>> {
    try {
      const { data, error } = await supabase
        .from('order_fulfillments')
        .select(`
          *,
          items:order_fulfillment_items(*)
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching fulfillment history:', error);
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error in getFulfillmentHistory:', error);
      return {
        success: false,
        message: 'Failed to fetch fulfillment history'
      };
    }
  }

  /**
   * Generate shipping label (mock implementation)
   */
  static async generateShippingLabel(orderId: string): Promise<ApiResponse<{
    labelUrl: string;
    trackingNumber: string;
    carrier: string;
  }>> {
    try {
      // In production, this would integrate with shipping carrier APIs
      const trackingNumber = `SHIP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const carrier = 'USPS'; // Default carrier
      
      // Update order with tracking info
      await this.updateOrderStatus(orderId, 'shipped', {
        trackingNumber,
        carrier,
        trackingUrl: `https://tracking.example.com/${trackingNumber}`
      });

      // Create fulfillment record
      await this.createFulfillmentRecord(orderId, {
        status: 'shipped',
        trackingNumber,
        carrier
      });

      return {
        success: true,
        data: {
          labelUrl: `data:application/pdf;base64,mock-label-${orderId}`,
          trackingNumber,
          carrier
        }
      };
    } catch (error) {
      console.error('Error in generateShippingLabel:', error);
      return {
        success: false,
        message: 'Failed to generate shipping label'
      };
    }
  }
}
