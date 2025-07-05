import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orders';
import { CreateOrderRequest, OrderFilters } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const filters: OrderFilters = {};
    
    // Status filter
    const status = searchParams.get('status');
    if (status && status !== 'all') {
      filters.status = status.split(',') as any;
    }
    
    // Payment status filter
    const paymentStatus = searchParams.get('payment_status');
    if (paymentStatus && paymentStatus !== 'all') {
      filters.payment_status = paymentStatus.split(',') as any;
    }
    
    // Customer filter
    const customerId = searchParams.get('customer_id');
    if (customerId) {
      filters.customer_id = customerId;
    }
    
    // Date filters
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;
    
    // Amount filters
    const minAmount = searchParams.get('min_amount');
    const maxAmount = searchParams.get('max_amount');
    if (minAmount) filters.min_amount = parseFloat(minAmount);
    if (maxAmount) filters.max_amount = parseFloat(maxAmount);
    
    // Search filter
    const search = searchParams.get('search');
    if (search) filters.search = search;

    const result = await OrderService.getOrders(filters, page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();
    
    // Validate required fields
    if (!body.customer_id || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Customer ID and items are required',
          data: null
        },
        { status: 400 }
      );
    }

    if (!body.shipping_address) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Shipping address is required',
          data: null
        },
        { status: 400 }
      );
    }

    const result = await OrderService.createOrder(body);
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
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