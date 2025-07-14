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
    // Parse request body with size limit
    const body: CreateOrderRequest = await request.json();
    
    // Comprehensive validation
    const validationErrors = [];
    
    // Validate customer_id
    if (!body.customer_id || typeof body.customer_id !== 'string') {
      validationErrors.push('Customer ID is required');
    } else if (body.customer_id.length > 50) {
      validationErrors.push('Customer ID too long');
    }
    
    // Validate items
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      validationErrors.push('At least one item is required');
    } else if (body.items.length > 100) {
      validationErrors.push('Too many items (max 100)');
    } else {
      // Validate each item
      body.items.forEach((item, index) => {
        if (!item.product_id || typeof item.product_id !== 'string') {
          validationErrors.push(`Item ${index + 1}: Product ID is required`);
        } else if (!/^[a-zA-Z0-9-_]{1,50}$/.test(item.product_id)) {
          validationErrors.push(`Item ${index + 1}: Invalid product ID format - received: ${item.product_id}`);
        }
        
        if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0) {
          validationErrors.push(`Item ${index + 1}: Valid quantity is required`);
        } else if (item.quantity > 10000) {
          validationErrors.push(`Item ${index + 1}: Quantity too large`);
        }
        
        if (!item.unit_price || typeof item.unit_price !== 'number' || item.unit_price <= 0) {
          validationErrors.push(`Item ${index + 1}: Valid unit price is required`);
        } else if (item.unit_price > 1000000) {
          validationErrors.push(`Item ${index + 1}: Unit price too high`);
        }
      });
    }
    
    // Validate shipping address
    if (!body.shipping_address || typeof body.shipping_address !== 'object') {
      validationErrors.push('Shipping address is required');
    } else {
      const requiredFields = ['name', 'address_line_1', 'city', 'state', 'postal_code', 'country'];
      requiredFields.forEach(field => {
        if (!body.shipping_address[field] || typeof body.shipping_address[field] !== 'string') {
          validationErrors.push(`Shipping ${field.replace('_', ' ')} is required`);
        } else if (body.shipping_address[field].length > 100) {
          validationErrors.push(`Shipping ${field.replace('_', ' ')} too long`);
        }
      });
      
      // Validate postal code format
      if (body.shipping_address.postal_code && 
          !/^[A-Za-z0-9\s-]{3,10}$/.test(body.shipping_address.postal_code)) {
        validationErrors.push('Invalid postal code format');
      }
      
      // Validate country
      const allowedCountries = ['USA', 'Canada', 'Mexico'];
      if (!allowedCountries.includes(body.shipping_address.country)) {
        validationErrors.push('Invalid country');
      }
    }
    
    // Validate payment method
    const allowedPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'];
    if (!body.payment_method || !allowedPaymentMethods.includes(body.payment_method)) {
      validationErrors.push('Invalid payment method');
    }
    
    // Validate notes if provided
    if (body.notes && (typeof body.notes !== 'string' || body.notes.length > 1000)) {
      validationErrors.push('Notes too long (max 1000 characters)');
    }
    
    // Return validation errors if any
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validationErrors,
          data: null
        },
        { status: 400 }
      );
    }
    
    // Sanitize input to prevent XSS
    const sanitizeString = (str: string) => {
      return str.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '').trim();
    };
    
    const sanitizedBody = {
      ...body,
      customer_id: sanitizeString(body.customer_id),
      shipping_address: {
        ...body.shipping_address,
        name: sanitizeString(body.shipping_address.name),
        address_line_1: sanitizeString(body.shipping_address.address_line_1),
        address_line_2: body.shipping_address.address_line_2 ? 
          sanitizeString(body.shipping_address.address_line_2) : undefined,
        city: sanitizeString(body.shipping_address.city),
        state: sanitizeString(body.shipping_address.state),
        postal_code: sanitizeString(body.shipping_address.postal_code),
        country: sanitizeString(body.shipping_address.country),
        phone: body.shipping_address.phone ? 
          sanitizeString(body.shipping_address.phone) : undefined
      },
      notes: body.notes ? sanitizeString(body.notes) : undefined
    };
    
    const result = await OrderService.createOrder(sanitizedBody);
    
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
