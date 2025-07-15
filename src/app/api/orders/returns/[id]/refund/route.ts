import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface ProcessRefundRequest {
  amount: number;
  method: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: ProcessRefundRequest = await request.json();
    
    // Validate request
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Valid refund amount is required' 
        },
        { status: 400 }
      );
    }

    if (!body.method) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Refund method is required' 
        },
        { status: 400 }
      );
    }

    // Get the return request
    const { data: returnRequest, error } = await supabase
      .from('return_requests')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !returnRequest) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Return request not found' 
        },
        { status: 404 }
      );
    }

    if (returnRequest.status !== 'approved') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Refund can only be processed for approved returns' 
        },
        { status: 400 }
      );
    }

    if (body.amount > returnRequest.total_refund_amount) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Refund amount exceeds total return amount' 
        },
        { status: 400 }
      );
    }

    // Process refund
    // This is where you would integrate with a payment gateway for real refunds
    const transactionId = `REFUND-${Date.now()}-${Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6)}`; // Mock transaction ID

    // Update return request
    const { error: updateError } = await supabase
      .from('return_requests')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_transaction_id: transactionId
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('Error updating return request:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to update return request' 
        },
        { status: 500 }
      );
    }

    // Add to order timeline
    await supabase
      .from('order_timeline')
      .insert({
        order_id: returnRequest.order_id,
        status: 'refund_processed',
        description: `Refund processed: ${transactionId}`,
        created_by: returnRequest.customer_id
      });

    return NextResponse.json({
      success: true,
      data: {
        refundId: transactionId
      }
    });
  } catch (error) {
    console.error('Error in POST /api/orders/returns/[id]/refund:', error);
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
