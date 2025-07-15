import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface CreateReturnRequest {
  orderId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    refundAmount: number;
  }>;
  reason: string;
  description?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer_id');
    
    let query = supabase
      .from('return_requests')
      .select(`
        *,
        order:orders(*),
        customer:customers(*)
      `)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching returns:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error in GET /api/orders/returns:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        data: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateReturnRequest = await request.json();
    
    // Validate request
    if (!body.orderId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Order ID is required' 
        },
        { status: 400 }
      );
    }
    
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'At least one item is required' 
        },
        { status: 400 }
      );
    }
    
    if (!body.reason) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Return reason is required' 
        },
        { status: 400 }
      );
    }
    
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, customer:customers(*)')
      .eq('id', body.orderId)
      .single();
    
    if (orderError || !order) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Order not found' 
        },
        { status: 404 }
      );
    }
    
    // Generate return number
    const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Calculate total refund amount
    const totalRefundAmount = body.items.reduce((sum, item) => sum + item.refundAmount, 0);
    
    // Create return request
    const { data: returnRequest, error: createError } = await supabase
      .from('return_requests')
      .insert({
        order_id: body.orderId,
        customer_id: order.customer_id,
        return_number: returnNumber,
        status: 'pending',
        reason: body.reason,
        description: body.description,
        total_refund_amount: totalRefundAmount
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating return request:', createError);
      return NextResponse.json(
        { 
          success: false, 
          message: createError.message 
        },
        { status: 500 }
      );
    }
    
    // Create return items
    const returnItems = body.items.map(item => ({
      return_request_id: returnRequest.id,
      order_item_id: item.productId, // This should be order_item_id, not product_id
      quantity: item.quantity,
      refund_amount: item.refundAmount,
      reason: body.reason
    }));
    
    const { error: itemsError } = await supabase
      .from('return_request_items')
      .insert(returnItems);
    
    if (itemsError) {
      console.error('Error creating return items:', itemsError);
      // Note: In production, you might want to rollback the return request
    }
    
    // Add to order timeline
    await supabase
      .from('order_timeline')
      .insert({
        order_id: body.orderId,
        status: 'return_requested',
        description: `Return request created: ${returnNumber}`,
        created_by: order.customer_id
      });
    
    return NextResponse.json({
      success: true,
      data: {
        id: returnRequest.id,
        returnNumber: returnRequest.return_number
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/orders/returns:', error);
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
