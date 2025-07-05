import { NextRequest, NextResponse } from 'next/server';
import { OrderService, OrderAnalyticsService } from '@/services/orders';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'basic';

    if (type === 'analytics') {
      const period = searchParams.get('period') as 'day' | 'week' | 'month' | 'year' || 'month';
      const startDate = searchParams.get('start_date') || undefined;
      const endDate = searchParams.get('end_date') || undefined;

      const result = await OrderAnalyticsService.getOrderAnalytics(period, startDate, endDate);
      return NextResponse.json(result);
    } else if (type === 'trends') {
      const days = parseInt(searchParams.get('days') || '30');
      const result = await OrderAnalyticsService.getRevenueTrends(days);
      return NextResponse.json(result);
    } else if (type === 'customers') {
      const result = await OrderAnalyticsService.getCustomerAnalytics();
      return NextResponse.json(result);
    } else {
      // Basic stats
      const result = await OrderService.getOrderStats();
      return NextResponse.json(result);
    }
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