import { supabase } from '@/lib/supabaseClient';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface TrackedOrder {
  id: string;
  order_number: string;
  customer_id: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'returned';
  tracking_number?: string;
  shipping_carrier?: string;
  tracking_url?: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  last_updated: string;
  tracking_updates: TrackingUpdate[];
}

interface TrackingUpdate {
  id?: string;
  order_id: string;
  status: string;
  location?: string;
  description: string;
  timestamp: string;
}

export class OrderTrackingService {
  /**
   * Get tracked orders (shipped or delivered)
   */
  static async getTrackedOrders(filters?: {
    tracking_number?: string;
    customer_id?: string;
    status?: string;
  }): Promise<ApiResponse<TrackedOrder[]>> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_id,
          status,
          tracking_number,
          shipping_carrier,
          tracking_url,
          created_at,
          shipped_at,
          delivered_at,
          updated_at
        `)
        .not('tracking_number', 'is', null)
        .in('status', ['shipped', 'delivered'])
        .order('created_at', { ascending: false });

      if (filters?.tracking_number) {
        query = query.eq('tracking_number', filters.tracking_number);
      }
      if (filters?.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }
      if (filters?.status && ['shipped', 'delivered'].includes(filters.status)) {
        query = query.eq('status', filters.status);
      }

      const { data: orders, error } = await query;

      if (error) {
        console.error('Error fetching tracked orders:', error);
        return {
          success: false,
          message: error.message
        };
      }

      // Get tracking updates for each order
      const trackedOrders = await Promise.all(
        (orders || []).map(async (order) => {
          const { data: updates } = await supabase
            .from('order_tracking_updates')
            .select('*')
            .eq('order_id', order.id)
            .order('timestamp', { ascending: true });

          // Generate basic tracking updates if none exist
          const trackingUpdates: TrackingUpdate[] = updates || [];
          
          if (trackingUpdates.length === 0) {
            // Add default tracking events
            trackingUpdates.push({
              order_id: order.id,
              status: 'Order Placed',
              description: 'Order has been placed successfully',
              timestamp: order.created_at
            });

            if (order.shipped_at) {
              trackingUpdates.push({
                order_id: order.id,
                status: 'Shipped',
                location: 'Fulfillment Center',
                description: 'Package has been shipped',
                timestamp: order.shipped_at
              });
            }

            if (order.delivered_at) {
              trackingUpdates.push({
                order_id: order.id,
                status: 'Delivered',
                location: 'Destination',
                description: 'Package has been delivered',
                timestamp: order.delivered_at
              });
            }
          }

          return {
            ...order,
            status: order.status === 'shipped' ? 'in_transit' : order.status,
            last_updated: order.updated_at,
            tracking_updates: trackingUpdates
          } as TrackedOrder;
        })
      );

      return {
        success: true,
        data: trackedOrders
      };
    } catch (error) {
      console.error('Error in getTrackedOrders:', error);
      return {
        success: false,
        message: 'Failed to fetch tracked orders'
      };
    }
  }

  /**
   * Update tracking information for an order
   */
  static async updateTrackingInfo(
    orderId: string,
    trackingData: {
      trackingNumber: string;
      carrier: string;
      trackingUrl?: string;
    }
  ): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingData.trackingNumber,
          shipping_carrier: trackingData.carrier,
          tracking_url: trackingData.trackingUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating tracking info:', error);
        return {
          success: false,
          message: error.message
        };
      }

      // Add tracking update event
      await this.addTrackingUpdate(orderId, {
        status: 'Tracking Updated',
        description: `Tracking number: ${trackingData.trackingNumber}`,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error in updateTrackingInfo:', error);
      return {
        success: false,
        message: 'Failed to update tracking info'
      };
    }
  }

  /**
   * Add a tracking update/event
   */
  static async addTrackingUpdate(
    orderId: string,
    update: {
      status: string;
      location?: string;
      description: string;
      timestamp?: string;
    }
  ): Promise<ApiResponse<TrackingUpdate>> {
    try {
      const { data, error } = await supabase
        .from('order_tracking_updates')
        .insert({
          order_id: orderId,
          status: update.status,
          location: update.location,
          description: update.description,
          timestamp: update.timestamp || new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding tracking update:', error);
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error in addTrackingUpdate:', error);
      return {
        success: false,
        message: 'Failed to add tracking update'
      };
    }
  }

  /**
   * Get tracking history for a specific order
   */
  static async getTrackingHistory(orderId: string): Promise<ApiResponse<TrackingUpdate[]>> {
    try {
      const { data, error } = await supabase
        .from('order_tracking_updates')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching tracking history:', error);
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
      console.error('Error in getTrackingHistory:', error);
      return {
        success: false,
        message: 'Failed to fetch tracking history'
      };
    }
  }

  /**
   * Track order by tracking number (public tracking)
   */
  static async trackByNumber(trackingNumber: string): Promise<ApiResponse<{
    order: TrackedOrder | null;
    isValid: boolean;
  }>> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          tracking_number,
          shipping_carrier,
          tracking_url,
          created_at,
          shipped_at,
          delivered_at,
          updated_at,
          shipping_city,
          shipping_state
        `)
        .eq('tracking_number', trackingNumber)
        .single();

      if (error || !order) {
        return {
          success: true,
          data: {
            order: null,
            isValid: false
          }
        };
      }

      // Get tracking updates
      const { data: updates } = await supabase
        .from('order_tracking_updates')
        .select('*')
        .eq('order_id', order.id)
        .order('timestamp', { ascending: true });

      const trackedOrder: TrackedOrder = {
        ...order,
        customer_id: 'hidden', // Hide customer ID for public tracking
        status: order.status === 'shipped' ? 'in_transit' : order.status,
        last_updated: order.updated_at,
        tracking_updates: updates || []
      };

      return {
        success: true,
        data: {
          order: trackedOrder,
          isValid: true
        }
      };
    } catch (error) {
      console.error('Error in trackByNumber:', error);
      return {
        success: false,
        message: 'Failed to track order'
      };
    }
  }

  /**
   * Sync tracking status with carrier (mock implementation)
   */
  static async syncCarrierTracking(orderId: string): Promise<ApiResponse<boolean>> {
    try {
      // Get order tracking info
      const { data: order, error } = await supabase
        .from('orders')
        .select('tracking_number, shipping_carrier')
        .eq('id', orderId)
        .single();

      if (error || !order || !order.tracking_number) {
        return {
          success: false,
          message: 'Order or tracking number not found'
        };
      }

      // In production, this would call the actual carrier API
      // For now, we'll simulate tracking updates
      const mockUpdates = [
        {
          status: 'In Transit',
          location: 'Distribution Center',
          description: 'Package is in transit to destination',
          timestamp: new Date().toISOString()
        }
      ];

      // Add mock tracking updates
      for (const update of mockUpdates) {
        await this.addTrackingUpdate(orderId, update);
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error in syncCarrierTracking:', error);
      return {
        success: false,
        message: 'Failed to sync tracking'
      };
    }
  }
}
