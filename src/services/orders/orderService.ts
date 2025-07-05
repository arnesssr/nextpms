import { supabase } from '@/lib/supabaseClient';
import { Order, CreateOrderRequest, OrderItem } from '@/types';

interface OrderFilters {
  status?: string;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export class OrderService {
  /**
   * Get all orders with optional filtering
   */
  static async getOrders(filters: OrderFilters = {}): Promise<ApiResponse<Order[]>> {
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('createdAt', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.customerId) {
        query = query.eq('customerId', filters.customerId);
      }

      if (filters.search) {
        query = query.or(`id.ilike.%${filters.search}%,customerId.ilike.%${filters.search}%`);
      }

      // Apply pagination
      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
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
      console.error('Error in getOrders:', error);
      return {
        success: false,
        message: 'Failed to fetch orders'
      };
    }
  }

  /**
   * Get a single order by ID
   */
  static async getOrderById(id: string): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error in getOrderById:', error);
      return {
        success: false,
        message: 'Failed to fetch order'
      };
    }
  }

  /**
   * Create a new order
   */
  static async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    try {
      // Calculate total from items (simplified)
      const total = orderData.items.reduce((sum, item) => sum + (item.quantity * 10), 0); // Placeholder price

      const newOrder: Omit<Order, 'id'> = {
        customerId: orderData.customerId,
        status: 'pending',
        items: orderData.items.map(item => ({
          id: `item_${Date.now()}_${Math.random()}`,
          productId: item.productId,
          quantity: item.quantity,
          price: 10 // Placeholder price
        })),
        total: total,
        shippingAddress: orderData.shippingAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error in createOrder:', error);
      return {
        success: false,
        message: 'Failed to create order'
      };
    }
  }

  /**
   * Update an existing order
   */
  static async updateOrder(id: string, updates: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating order:', error);
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error in updateOrder:', error);
      return {
        success: false,
        message: 'Failed to update order'
      };
    }
  }

  /**
   * Delete an order
   */
  static async deleteOrder(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting order:', error);
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error in deleteOrder:', error);
      return {
        success: false,
        message: 'Failed to delete order'
      };
    }
  }

  /**
   * Get order statistics
   */
  static async getOrderStats(): Promise<ApiResponse<any>> {
    try {
      // This would typically involve multiple queries to get various stats
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status, total, createdAt');

      if (error) {
        console.error('Error fetching order stats:', error);
        return {
          success: false,
          message: error.message
        };
      }

      const stats = {
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
        completedOrders: orders?.filter(o => o.status === 'delivered').length || 0,
        totalRevenue: orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error in getOrderStats:', error);
      return {
        success: false,
        message: 'Failed to fetch order statistics'
      };
    }
  }
}