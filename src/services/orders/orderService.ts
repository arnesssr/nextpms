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

  /**
   * Validate products for order creation
   */
  static async validateProducts(items: Array<{
    product_id: string;
    quantity: number;
  }>): Promise<ApiResponse<Array<{
    product_id: string;
    valid: boolean;
    available: boolean;
    stock: number;
    message?: string;
  }>>> {
    try {
      const productIds = items.map(item => item.product_id);
      
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, sku, stock_quantity, is_active, selling_price')
        .in('id', productIds);

      if (error) {
        console.error('Error validating products:', error);
        return {
          success: false,
          message: error.message
        };
      }

      const productMap = new Map(products?.map(p => [p.id, p]) || []);
      const validationResults = items.map(item => {
        const product = productMap.get(item.product_id);
        
        if (!product) {
          return {
            product_id: item.product_id,
            valid: false,
            available: false,
            stock: 0,
            message: 'Product not found'
          };
        }

        if (!product.is_active) {
          return {
            product_id: item.product_id,
            valid: false,
            available: false,
            stock: product.stock_quantity,
            message: 'Product is not active'
          };
        }

        if (product.stock_quantity < item.quantity) {
          return {
            product_id: item.product_id,
            valid: false,
            available: true,
            stock: product.stock_quantity,
            message: `Insufficient stock. Available: ${product.stock_quantity}`
          };
        }

        return {
          product_id: item.product_id,
          valid: true,
          available: true,
          stock: product.stock_quantity
        };
      });

      const allValid = validationResults.every(r => r.valid);

      return {
        success: allValid,
        data: validationResults,
        message: allValid ? 'All products are valid' : 'Some products are invalid'
      };
    } catch (error) {
      console.error('Error in validateProducts:', error);
      return {
        success: false,
        message: 'Failed to validate products'
      };
    }
  }

  /**
   * Calculate order totals including tax and shipping
   */
  static async calculateTotals(orderData: {
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price?: number;
    }>;
    shipping_address: {
      city: string;
      state: string;
      country: string;
    };
    discount_code?: string;
  }): Promise<ApiResponse<{
    subtotal: number;
    tax_amount: number;
    shipping_amount: number;
    discount_amount: number;
    total_amount: number;
  }>> {
    try {
      // Calculate subtotal
      let subtotal = 0;
      
      // If unit prices are not provided, fetch from products
      if (orderData.items.some(item => !item.unit_price)) {
        const productIds = orderData.items.map(item => item.product_id);
        const { data: products } = await supabase
          .from('products')
          .select('id, selling_price')
          .in('id', productIds);
        
        const priceMap = new Map(products?.map(p => [p.id, p.selling_price]) || []);
        
        subtotal = orderData.items.reduce((sum, item) => {
          const price = item.unit_price || priceMap.get(item.product_id) || 0;
          return sum + (price * item.quantity);
        }, 0);
      } else {
        subtotal = orderData.items.reduce((sum, item) => {
          return sum + ((item.unit_price || 0) * item.quantity);
        }, 0);
      }

      // Calculate tax based on state (simplified - in production would use tax API)
      const taxRates: Record<string, number> = {
        'CA': 0.0875,  // California
        'NY': 0.08,    // New York
        'TX': 0.0625,  // Texas
        'FL': 0.06,    // Florida
        // Add more states as needed
      };
      const taxRate = taxRates[orderData.shipping_address.state] || 0.08; // Default 8%
      const taxAmount = subtotal * taxRate;

      // Calculate shipping (free over $100, otherwise based on location)
      let shippingAmount = 0;
      if (subtotal < 100) {
        if (orderData.shipping_address.country !== 'USA') {
          shippingAmount = 25; // International shipping
        } else {
          shippingAmount = 10; // Domestic shipping
        }
      }

      // Apply discount if code provided
      let discountAmount = 0;
      if (orderData.discount_code) {
        // In production, validate discount code from database
        const discountCodes: Record<string, number> = {
          'WELCOME10': 0.10,  // 10% off
          'SAVE20': 0.20,     // 20% off
          'FREESHIP': -1      // Free shipping
        };
        
        const discount = discountCodes[orderData.discount_code.toUpperCase()];
        if (discount === -1) {
          discountAmount = shippingAmount; // Free shipping
        } else if (discount > 0) {
          discountAmount = subtotal * discount;
        }
      }

      // Calculate total
      const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

      return {
        success: true,
        data: {
          subtotal: Math.round(subtotal * 100) / 100,
          tax_amount: Math.round(taxAmount * 100) / 100,
          shipping_amount: Math.round(shippingAmount * 100) / 100,
          discount_amount: Math.round(discountAmount * 100) / 100,
          total_amount: Math.round(totalAmount * 100) / 100
        }
      };
    } catch (error) {
      console.error('Error in calculateTotals:', error);
      return {
        success: false,
        message: 'Failed to calculate totals'
      };
    }
  }

  /**
   * Generate unique order number
   */
  static async generateOrderNumber(): Promise<string> {
    const prefix = 'ORD';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
