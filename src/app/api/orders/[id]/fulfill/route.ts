import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orders';
import { supabase } from '@/lib/supabaseClient';

interface FulfillmentRequest {
  status: string;
  shipmentInfo?: {
    carrier: string;
    trackingNumber: string;
    trackingUrl?: string;
    shippedAt?: string;
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: FulfillmentRequest = await request.json();
    
    // Validate the request
    if (!body.status) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Status is required' 
        },
        { status: 400 }
      );
    }

    // Validate status is valid for fulfillment
    const validStatuses = ['confirmed', 'processing', 'packed', 'shipped', 'delivered'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid fulfillment status' 
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status: body.status,
      updated_at: new Date().toISOString()
    };

    // If shipping info is provided, update tracking details
    if (body.shipmentInfo) {
      updateData.tracking_number = body.shipmentInfo.trackingNumber;
      updateData.shipping_carrier = body.shipmentInfo.carrier;
      updateData.tracking_url = body.shipmentInfo.trackingUrl;
      
      // Set shipped_at timestamp if status is shipped
      if (body.status === 'shipped') {
        updateData.shipped_at = body.shipmentInfo.shippedAt || new Date().toISOString();
      }
    }

    // Set delivered_at timestamp if status is delivered
    if (body.status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    // Update the order
    const result = await OrderService.updateOrder(params.id, updateData);

    // If successful, also create a fulfillment record
    if (result.success && body.status === 'shipped' && body.shipmentInfo) {
      // Create fulfillment record
      const { error: fulfillmentError } = await supabase
        .from('order_fulfillments')
        .insert({
          order_id: params.id,
          fulfillment_status: 'shipped',
          tracking_number: body.shipmentInfo.trackingNumber,
          shipping_carrier: body.shipmentInfo.carrier,
          tracking_url: body.shipmentInfo.trackingUrl,
          shipped_at: updateData.shipped_at
        });

      if (fulfillmentError) {
        console.error('Error creating fulfillment record:', fulfillmentError);
      }

      // Update order items status
      await supabase
        .from('order_items')
        .update({ 
          status: 'shipped',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', params.id);
    }

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in PUT /api/orders/[id]/fulfill:', error);
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
