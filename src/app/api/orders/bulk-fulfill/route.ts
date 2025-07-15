import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orders';
import { supabase } from '@/lib/supabaseClient';

interface BulkFulfillmentRequest {
  orderIds: string[];
  action: 'start_processing' | 'mark_packed' | 'mark_shipped' | 'mark_delivered' | 'cancel';
}

export async function PUT(request: NextRequest) {
  try {
    const body: BulkFulfillmentRequest = await request.json();
    
    // Validate the request
    if (!body.orderIds || !Array.isArray(body.orderIds) || body.orderIds.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Order IDs array is required' 
        },
        { status: 400 }
      );
    }

    if (!body.action) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Action is required' 
        },
        { status: 400 }
      );
    }

    // Map action to status
    const actionToStatus: Record<string, string> = {
      'start_processing': 'processing',
      'mark_packed': 'packed',
      'mark_shipped': 'shipped',
      'mark_delivered': 'delivered',
      'cancel': 'cancelled'
    };

    const newStatus = actionToStatus[body.action];
    if (!newStatus) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid action' 
        },
        { status: 400 }
      );
    }

    // Process each order
    const results = await Promise.all(
      body.orderIds.map(async (orderId) => {
        try {
          const updateData: any = {
            status: newStatus,
            updated_at: new Date().toISOString()
          };

          // Set timestamps based on action
          if (body.action === 'mark_shipped') {
            updateData.shipped_at = new Date().toISOString();
          } else if (body.action === 'mark_delivered') {
            updateData.delivered_at = new Date().toISOString();
          } else if (body.action === 'cancel') {
            updateData.cancelled_at = new Date().toISOString();
          }

          // Update the order
          const result = await OrderService.updateOrder(orderId, updateData);

          // If successful and action is shipped, create fulfillment record
          if (result.success && body.action === 'mark_shipped') {
            await supabase
              .from('order_fulfillments')
              .insert({
                order_id: orderId,
                fulfillment_status: 'shipped',
                shipped_at: updateData.shipped_at
              });

            // Update order items status
            await supabase
              .from('order_items')
              .update({ 
                status: 'shipped',
                updated_at: new Date().toISOString()
              })
              .eq('order_id', orderId);
          }

          return { orderId, success: result.success, error: result.message };
        } catch (error) {
          console.error(`Error processing order ${orderId}:`, error);
          return { orderId, success: false, error: 'Failed to process order' };
        }
      })
    );

    // Count successful updates
    const processedCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      data: {
        processedCount,
        failedCount,
        results
      }
    });
  } catch (error) {
    console.error('Error in PUT /api/orders/bulk-fulfill:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        data: null
      },
      { status: 500 }
    );
  }
}
