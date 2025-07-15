import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('tracking_number');
    const customerId = searchParams.get('customer_id');
    
    // Build query
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
        delivered_at
      `)
      .not('tracking_number', 'is', null)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (trackingNumber) {
      query = query.eq('tracking_number', trackingNumber);
    }
    
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    
    // Only get shipped or delivered orders
    query = query.in('status', ['shipped', 'delivered']);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tracked orders:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: error.message 
        },
        { status: 500 }
      );
    }
    
    // Transform data to match expected format
    const trackedOrders = (data || []).map(order => ({
      id: order.id,
      customerId: order.customer_id,
      status: order.status === 'shipped' ? 'in_transit' : 'delivered',
      dateOrdered: order.created_at,
      lastUpdated: order.delivered_at || order.shipped_at || order.created_at,
      trackingInfo: order.tracking_number ? {
        carrier: order.shipping_carrier,
        trackingNumber: order.tracking_number,
        trackingUrl: order.tracking_url
      } : undefined,
      trackingUpdates: [
        {
          date: order.created_at,
          status: 'Order Placed',
          location: 'Online'
        },
        ...(order.shipped_at ? [{
          date: order.shipped_at,
          status: 'Shipped',
          location: 'Fulfillment Center'
        }] : []),
        ...(order.delivered_at ? [{
          date: order.delivered_at,
          status: 'Delivered',
          location: 'Destination'
        }] : [])
      ]
    }));
    
    return NextResponse.json({
      success: true,
      data: trackedOrders
    });
  } catch (error) {
    console.error('Error in GET /api/orders/tracking:', error);
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
