import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface UpdateReturnRequest {
  status: 'pending' | 'approved' | 'rejected' | 'shipped_back' | 'received' | 'refunded' | 'cancelled';
  notes?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('return_requests')
      .select(`
        *,
        order:orders(*),
        customer:customers(*),
        items:return_request_items(*)
      `)
      .eq('id', params.id)
      .single();
    
    if (error) {
      console.error('Error fetching return request:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: error.message 
        },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in GET /api/orders/returns/[id]:', error);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateReturnRequest = await request.json();
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'shipped_back', 'received', 'refunded', 'cancelled'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid status' 
        },
        { status: 400 }
      );
    }
    
    // Get current return request
    const { data: currentReturn, error: fetchError } = await supabase
      .from('return_requests')
      .select('*, order:orders(*)')
      .eq('id', params.id)
      .single();
    
    if (fetchError || !currentReturn) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Return request not found' 
        },
        { status: 404 }
      );
    }
    
    // Update return request
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (body.status) {
      updateData.status = body.status;
      
      // Set status-specific timestamps
      if (body.status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else if (body.status === 'rejected') {
        updateData.rejected_at = new Date().toISOString();
      } else if (body.status === 'received') {
        updateData.received_at = new Date().toISOString();
      } else if (body.status === 'refunded') {
        updateData.refunded_at = new Date().toISOString();
      }
    }
    
    if (body.notes) {
      updateData.notes = body.notes;
    }
    
    const { data, error } = await supabase
      .from('return_requests')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating return request:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: error.message 
        },
        { status: 500 }
      );
    }
    
    // Update order status if return is approved
    if (body.status === 'approved' && currentReturn.order) {
      await supabase
        .from('orders')
        .update({ 
          status: 'returned',
          updated_at: new Date().toISOString()
        })
        .eq('id', currentReturn.order_id);
    }
    
    // Add to order timeline
    await supabase
      .from('order_timeline')
      .insert({
        order_id: currentReturn.order_id,
        status: `return_${body.status}`,
        description: `Return ${body.status}: ${currentReturn.return_number}`,
        created_by: currentReturn.customer_id
      });
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in PUT /api/orders/returns/[id]:', error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if return can be deleted (only pending returns)
    const { data: returnRequest, error: fetchError } = await supabase
      .from('return_requests')
      .select('status')
      .eq('id', params.id)
      .single();
    
    if (fetchError || !returnRequest) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Return request not found' 
        },
        { status: 404 }
      );
    }
    
    if (returnRequest.status !== 'pending') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Only pending returns can be deleted' 
        },
        { status: 400 }
      );
    }
    
    // Delete return request (cascade will handle items)
    const { error } = await supabase
      .from('return_requests')
      .delete()
      .eq('id', params.id);
    
    if (error) {
      console.error('Error deleting return request:', error);
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
      data: true
    });
  } catch (error) {
    console.error('Error in DELETE /api/orders/returns/[id]:', error);
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
