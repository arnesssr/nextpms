import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orders';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the order details
    const orderResult = await OrderService.getOrderById(params.id);
    
    if (!orderResult.success || !orderResult.data) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Order not found' 
        },
        { status: 404 }
      );
    }

    const order = orderResult.data;

    // Validate order can have a shipping label
    if (order.status === 'cancelled' || order.status === 'delivered') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot generate shipping label for cancelled or delivered orders' 
        },
        { status: 400 }
      );
    }

    // In a real implementation, this would integrate with a shipping carrier API
    // For now, we'll generate a mock shipping label URL
    const mockLabelData = {
      orderId: order.id,
      orderNumber: order.order_number,
      carrier: order.shipping_carrier || 'USPS',
      trackingNumber: order.tracking_number || `MOCK-${Date.now()}`,
      shipFrom: {
        name: 'Your Company',
        address: '123 Business St',
        city: 'Business City',
        state: 'BC',
        postalCode: '12345',
        country: 'USA'
      },
      shipTo: {
        name: order.shipping_name,
        address1: order.shipping_address_line_1,
        address2: order.shipping_address_line_2,
        city: order.shipping_city,
        state: order.shipping_state,
        postalCode: order.shipping_postal_code,
        country: order.shipping_country
      },
      weight: '2.5 lbs', // Mock weight
      dimensions: '12x8x4 inches', // Mock dimensions
      serviceType: 'Ground',
      generatedAt: new Date().toISOString()
    };

    // In production, this would be a real PDF URL from the carrier
    // For now, we'll create a data URL that represents the label
    const labelUrl = `data:application/pdf;base64,${Buffer.from(JSON.stringify(mockLabelData)).toString('base64')}`;

    // Update order with tracking number if not already set
    if (!order.tracking_number) {
      await OrderService.updateOrder(params.id, {
        tracking_number: mockLabelData.trackingNumber,
        shipping_carrier: mockLabelData.carrier
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        labelUrl,
        trackingNumber: mockLabelData.trackingNumber,
        carrier: mockLabelData.carrier,
        labelData: mockLabelData
      }
    });
  } catch (error) {
    console.error('Error in POST /api/orders/[id]/shipping-label:', error);
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
