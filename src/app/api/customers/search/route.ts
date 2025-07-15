import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }
    
    // Search customers by name, email, or phone
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error searching customers:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: error.message,
          data: []
        },
        { status: 500 }
      );
    }
    
    // If no customers found, check if we should create a guest customer
    if (!data || data.length === 0) {
      // You could optionally suggest creating a new customer here
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No customers found'
      });
    }
    
    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error in GET /api/customers/search:', error);
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
