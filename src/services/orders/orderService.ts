import { supabase } from '@/lib/supabaseClient';
import { Order, CreateOrderRequest, OrderItem, OrderFilters, OrderStats } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class OrderService {
  /**
   * Get all orders with filtering and pagination
   */
  static async getOrders(
    filters: OrderFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Order[]>> {
    try {
      // Build the select query with joins
      let countQuery = supabase
        .from('orders')
        .select('id', { count: 'exact', head: true });

      let dataQuery = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters to both queries
      const applyFilters = (query: any) => {
        // Status filter (can be array)
        if (filters.status && filters.status.length > 0) {
          query = query.in('status', filters.status);
        }

        // Payment status filter (can be array)
        if (filters.payment_status && filters.payment_status.length > 0) {
          query = query.in('payment_status', filters.payment_status);
        }

        // Customer filter
        if (filters.customer_id) {
          query = query.eq('customer_id', filters.customer_id);
        }

        // Date range filters
        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from);
        }
        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to);
        }

        // Amount range filters
        if (filters.min_amount !== undefined) {
          query = query.gte('total_amount', filters.min_amount);
        }
        if (filters.max_amount !== undefined) {
          query = query.lte('total_amount', filters.max_amount);
        }

        // Search filter (order number, shipping name)
        if (filters.search) {
          query = query.or(
            `order_number.ilike.%${filters.search}%,shipping_name.ilike.%${filters.search}%`
          );
        }

        return query;
      };

      // Apply filters
      countQuery = applyFilters(countQuery);
      dataQuery = applyFilters(dataQuery);

      // Apply pagination to data query
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      dataQuery = dataQuery.range(from, to);

      // Execute both queries
      const [{ count }, { data, error }] = await Promise.all([
        countQuery,
        dataQuery
      ]);

      if (error) {
        console.error('Error fetching orders:', error);
        return {
          success: false,
          message: error.message
        };
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages
        }
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
   * Get a single order by ID with full details
   */
  static async getOrderById(id: string): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          timeline:order_timeline(*),
          fulfillments:order_fulfillments(*)
        `)
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
      // Calculate subtotal from items
      const subtotal = orderData.items.reduce((sum, item) => {
        const unitPrice = item.unit_price || 0;
        return sum + (item.quantity * unitPrice);
      }, 0);

      // Calculate tax (8% default)
      const taxAmount = subtotal * 0.08;
      
      // Calculate shipping (free over $100, otherwise $10)
      const shippingAmount = orderData.shipping_amount || (subtotal > 100 ? 0 : 10);
      
      // Calculate discount
      const discountAmount = orderData.discount_amount || 0;
      
      // Calculate total
      const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

      // Validate products exist and are active
      const productIds = orderData.items.map(item => item.product_id);
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id, name, sku, selling_price, stock_quantity, is_active')
        .in('id', productIds);

      if (productError) {
        console.error('Error validating products:', productError);
        return {
          success: false,
          message: 'Failed to validate products'
        };
      }

      // Check if all products exist and are active
      const foundProductIds = products?.map(p => p.id) || [];
      const missingProducts = productIds.filter(id => !foundProductIds.includes(id));
      
      if (missingProducts.length > 0) {
        return {
          success: false,
          message: `Products not found: ${missingProducts.join(', ')}`
        };
      }

      // Check if products are active and have sufficient stock
      const productMap = new Map(products?.map(p => [p.id, p]) || []);
      const validationErrors = [];
      
      for (const item of orderData.items) {
        const product = productMap.get(item.product_id);
        
        if (!product?.is_active) {
          validationErrors.push(`Product ${product?.name || item.product_id} is not available`);
          continue;
        }
        
        if (product.stock_quantity < item.quantity) {
          validationErrors.push(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`);
          continue;
        }
        
        // Validate price isn't too far from the actual product price (allow 10% variance)
        const priceVariance = Math.abs(item.unit_price - product.selling_price) / product.selling_price;
        if (priceVariance > 0.1) {
          validationErrors.push(`Price for ${product.name} is significantly different from current price`);
        }
      }
      
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: validationErrors.join(', ')
        };
      }

      // Prepare order data
      const orderInsert = {
        customer_id: orderData.customer_id,
        status: 'pending',
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        currency: 'USD',
        payment_status: 'pending',
        payment_method: orderData.payment_method,
        // Shipping address
        shipping_name: orderData.shipping_address.name,
        shipping_address_line_1: orderData.shipping_address.address_line_1,
        shipping_address_line_2: orderData.shipping_address.address_line_2,
        shipping_city: orderData.shipping_address.city,
        shipping_state: orderData.shipping_address.state,
        shipping_postal_code: orderData.shipping_address.postal_code,
        shipping_country: orderData.shipping_address.country,
        shipping_phone: orderData.shipping_address.phone,
        // Billing address (if provided)
        billing_name: orderData.billing_address?.name,
        billing_address_line_1: orderData.billing_address?.address_line_1,
        billing_address_line_2: orderData.billing_address?.address_line_2,
        billing_city: orderData.billing_address?.city,
        billing_state: orderData.billing_address?.state,
        billing_postal_code: orderData.billing_address?.postal_code,
        billing_country: orderData.billing_address?.country,
        billing_phone: orderData.billing_address?.phone,
        notes: orderData.notes
      };

      // Create order first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderInsert])
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return {
          success: false,
          message: orderError.message
        };
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: `Product ${item.product_id}`, // This should come from products table
        product_sku: `SKU-${item.product_id}`, // This should come from products table
        quantity: item.quantity,
        unit_price: item.unit_price || 0,
        total_price: item.quantity * (item.unit_price || 0),
        status: 'pending'
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Rollback order creation
        await supabase.from('orders').delete().eq('id', order.id);
        return {
          success: false,
          message: itemsError.message
        };
      }

      // Fetch the complete order with relations
      const { data: completeOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', order.id)
        .single();

      if (fetchError) {
        console.error('Error fetching complete order:', fetchError);
        return {
          success: false,
          message: fetchError.message
        };
      }

      return {
        success: true,
        data: completeOrder
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
  static async updateOrder(id: string, updates: any): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          items:order_items(*)
        `)
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
      // First, check if the order exists
      const { data: existingOrder, error: checkError } = await supabase
        .from('orders')
        .select('id, order_number')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.error('Error checking order existence:', checkError);
        return {
          success: false,
          message: `Order not found: ${checkError.message}`
        };
      }
      
      if (!existingOrder) {
        return {
          success: false,
          message: 'Order not found'
        };
      }
      
      // Delete the order (cascade delete will handle related records)
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting order:', deleteError);
        return {
          success: false,
          message: `Failed to delete order: ${deleteError.message}`
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
  static async getOrderStats(): Promise<ApiResponse<OrderStats>> {
    try {
      // Get all orders for stats calculation
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status, payment_status, total_amount, created_at');

      if (error) {
        console.error('Error fetching order stats:', error);
        return {
          success: false,
          message: error.message
        };
      }

      const allOrders = orders || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get orders from today
      const todayOrders = allOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      // Calculate stats
      const stats: OrderStats = {
        total_orders: allOrders.length,
        pending_orders: allOrders.filter(o => o.status === 'pending').length,
        processing_orders: allOrders.filter(o => o.status === 'processing').length,
        shipped_orders: allOrders.filter(o => o.status === 'shipped').length,
        delivered_orders: allOrders.filter(o => o.status === 'delivered').length,
        cancelled_orders: allOrders.filter(o => o.status === 'cancelled').length,
        total_revenue: allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        average_order_value: allOrders.length > 0 
          ? allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / allOrders.length
          : 0,
        orders_today: todayOrders.length,
        revenue_today: todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
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