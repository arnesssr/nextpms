import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orders';

export async function GET(request: NextRequest) {
  try {
    // Only provide basic order statistics
    const result = await OrderService.getOrderStats();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/orders/stats:', error);
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
