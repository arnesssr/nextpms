import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orders';
import { UpdateOrderRequest } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await OrderService.getOrderById(params.id);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error('Error in GET /api/orders/[id]:', error);
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
    const body: UpdateOrderRequest = await request.json();
    
    const result = await OrderService.updateOrder(params.id, body);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in PUT /api/orders/[id]:', error);
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
    const result = await OrderService.deleteOrder(params.id);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in DELETE /api/orders/[id]:', error);
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