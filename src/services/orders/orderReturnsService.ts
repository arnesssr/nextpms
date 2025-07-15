import { supabase } from '@/lib/supabaseClient';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ReturnRequest {
  id: string;
  order_id: string;
  customer_id: string;
  return_number: string;
  status: 'pending' | 'approved' | 'rejected' | 'shipped_back' | 'received' | 'refunded' | 'cancelled';
  reason: string;
  description?: string;
  total_refund_amount: number;
  refund_transaction_id?: string;
  approved_at?: string;
  rejected_at?: string;
  received_at?: string;
  refunded_at?: string;
  created_at: string;
  updated_at: string;
}

interface ReturnItem {
  id: string;
  return_request_id: string;
  order_item_id: string;
  quantity: number;
  refund_amount: number;
  reason: string;
}

interface CreateReturnData {
  orderId: string;
  items: Array<{
    orderItemId: string;
    quantity: number;
    refundAmount: number;
  }>;
  reason: string;
  description?: string;
}

export class OrderReturnsService {
  /**
   * Get all return requests with filters
   */
  static async getReturns(filters?: {
    status?: string;
    customer_id?: string;
    order_id?: string;
  }): Promise<ApiResponse<ReturnRequest[]>> {
    try {
      let query = supabase
        .from('return_requests')
        .select(`
          *,
          items:return_request_items(*),
          order:orders(*),
          customer:customers(*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }
      if (filters?.order_id) {
        query = query.eq('order_id', filters.order_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching returns:', error);
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
      console.error('Error in getReturns:', error);
      return {
        success: false,
        message: 'Failed to fetch returns'
      };
    }
  }

  /**
   * Create a new return request
   */
  static async createReturn(returnData: CreateReturnData): Promise<ApiResponse<ReturnRequest>> {
    try {
      // Validate order exists and is eligible for return
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', returnData.orderId)
        .single();

      if (orderError || !order) {
        return {
          success: false,
          message: 'Order not found'
        };
      }

      // Check if order is eligible for return
      if (!['delivered', 'shipped'].includes(order.status)) {
        return {
          success: false,
          message: 'Order is not eligible for return'
        };
      }

      // Generate return number
      const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // Calculate total refund amount
      const totalRefundAmount = returnData.items.reduce((sum, item) => sum + item.refundAmount, 0);

      // Create return request
      const { data: returnRequest, error: createError } = await supabase
        .from('return_requests')
        .insert({
          order_id: returnData.orderId,
          customer_id: order.customer_id,
          return_number: returnNumber,
          status: 'pending',
          reason: returnData.reason,
          description: returnData.description,
          total_refund_amount: totalRefundAmount
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating return request:', createError);
        return {
          success: false,
          message: createError.message
        };
      }

      // Create return items
      const returnItems = returnData.items.map(item => ({
        return_request_id: returnRequest.id,
        order_item_id: item.orderItemId,
        quantity: item.quantity,
        refund_amount: item.refundAmount,
        reason: returnData.reason
      }));

      const { error: itemsError } = await supabase
        .from('return_request_items')
        .insert(returnItems);

      if (itemsError) {
        console.error('Error creating return items:', itemsError);
        // Consider rolling back the return request
      }

      // Add to order timeline
      await supabase
        .from('order_timeline')
        .insert({
          order_id: returnData.orderId,
          status: 'return_requested',
          description: `Return request created: ${returnNumber}`,
          created_by: order.customer_id
        });

      return {
        success: true,
        data: returnRequest
      };
    } catch (error) {
      console.error('Error in createReturn:', error);
      return {
        success: false,
        message: 'Failed to create return request'
      };
    }
  }

  /**
   * Update return request status
   */
  static async updateReturn(
    returnId: string,
    status: ReturnRequest['status'],
    notes?: string
  ): Promise<ApiResponse<ReturnRequest>> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.notes = notes;
      }

      // Set status-specific timestamps
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else if (status === 'rejected') {
        updateData.rejected_at = new Date().toISOString();
      } else if (status === 'received') {
        updateData.received_at = new Date().toISOString();
      } else if (status === 'refunded') {
        updateData.refunded_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('return_requests')
        .update(updateData)
        .eq('id', returnId)
        .select()
        .single();

      if (error) {
        console.error('Error updating return:', error);
        return {
          success: false,
          message: error.message
        };
      }

      // Update order status if return is approved
      if (status === 'approved') {
        await supabase
          .from('orders')
          .update({ 
            status: 'returned',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.order_id);
      }

      // Add to order timeline
      await supabase
        .from('order_timeline')
        .insert({
          order_id: data.order_id,
          status: `return_${status}`,
          description: `Return ${status}: ${data.return_number}`,
          created_by: data.customer_id
        });

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error in updateReturn:', error);
      return {
        success: false,
        message: 'Failed to update return'
      };
    }
  }

  /**
   * Process refund for approved return
   */
  static async processRefund(
    returnId: string,
    refundData: {
      amount: number;
      method: string;
      notes?: string;
    }
  ): Promise<ApiResponse<{ refundId: string }>> {
    try {
      // Get return request
      const { data: returnRequest, error } = await supabase
        .from('return_requests')
        .select('*')
        .eq('id', returnId)
        .single();

      if (error || !returnRequest) {
        return {
          success: false,
          message: 'Return request not found'
        };
      }

      if (returnRequest.status !== 'approved') {
        return {
          success: false,
          message: 'Return must be approved before processing refund'
        };
      }

      if (refundData.amount > returnRequest.total_refund_amount) {
        return {
          success: false,
          message: 'Refund amount exceeds approved amount'
        };
      }

      // Generate refund transaction ID (in production, this would come from payment gateway)
      const refundId = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // Update return request
      const { error: updateError } = await supabase
        .from('return_requests')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          refund_transaction_id: refundId,
          updated_at: new Date().toISOString()
        })
        .eq('id', returnId);

      if (updateError) {
        console.error('Error updating return request:', updateError);
        return {
          success: false,
          message: 'Failed to update return request'
        };
      }

      // Update order payment status
      await supabase
        .from('orders')
        .update({
          payment_status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', returnRequest.order_id);

      // Add to order timeline
      await supabase
        .from('order_timeline')
        .insert({
          order_id: returnRequest.order_id,
          status: 'refund_processed',
          description: `Refund processed: ${refundId} - Amount: $${refundData.amount}`,
          created_by: returnRequest.customer_id
        });

      return {
        success: true,
        data: { refundId }
      };
    } catch (error) {
      console.error('Error in processRefund:', error);
      return {
        success: false,
        message: 'Failed to process refund'
      };
    }
  }

  /**
   * Get return statistics
   */
  static async getReturnStats(): Promise<ApiResponse<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    refunded: number;
    totalRefundAmount: number;
    avgProcessingTime: number;
  }>> {
    try {
      const { data: returns, error } = await supabase
        .from('return_requests')
        .select('*');

      if (error) {
        console.error('Error fetching return stats:', error);
        return {
          success: false,
          message: error.message
        };
      }

      const allReturns = returns || [];
      
      // Calculate average processing time
      const processedReturns = allReturns.filter(r => r.refunded_at || r.rejected_at);
      let avgProcessingTime = 0;
      
      if (processedReturns.length > 0) {
        const totalTime = processedReturns.reduce((sum, ret) => {
          const created = new Date(ret.created_at).getTime();
          const processed = new Date(ret.refunded_at || ret.rejected_at).getTime();
          return sum + (processed - created);
        }, 0);
        avgProcessingTime = Math.round(totalTime / processedReturns.length / (1000 * 60 * 60 * 24)); // Days
      }

      return {
        success: true,
        data: {
          total: allReturns.length,
          pending: allReturns.filter(r => r.status === 'pending').length,
          approved: allReturns.filter(r => r.status === 'approved').length,
          rejected: allReturns.filter(r => r.status === 'rejected').length,
          refunded: allReturns.filter(r => r.status === 'refunded').length,
          totalRefundAmount: allReturns
            .filter(r => r.status === 'refunded')
            .reduce((sum, r) => sum + r.total_refund_amount, 0),
          avgProcessingTime
        }
      };
    } catch (error) {
      console.error('Error in getReturnStats:', error);
      return {
        success: false,
        message: 'Failed to fetch return statistics'
      };
    }
  }
}
