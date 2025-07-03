import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseAnonymousClient } from '@/lib/supabaseServer';

// Define the API response format
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

// Helper function to create error responses
function createErrorResponse(message: string, status: number = 400, details?: string): NextResponse<ApiResponse> {
  return NextResponse.json(
    { error: message, details },
    { status }
  );
}

// Helper function to create success responses
function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { data },
    { status }
  );
}

// GET /api/suppliers/summary - Get supplier statistics and summary data
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseAnonymousClient();

    // Get total suppliers count
    const { count: totalSuppliers, error: totalError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error fetching total suppliers count:', totalError);
      return createErrorResponse('Failed to fetch supplier summary', 500, totalError.message);
    }

    // Get active suppliers count
    const { count: activeSuppliers, error: activeError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (activeError) {
      console.error('Error fetching active suppliers count:', activeError);
      return createErrorResponse('Failed to fetch supplier summary', 500, activeError.message);
    }

    // Get inactive suppliers count
    const { count: inactiveSuppliers, error: inactiveError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'inactive');

    if (inactiveError) {
      console.error('Error fetching inactive suppliers count:', inactiveError);
      return createErrorResponse('Failed to fetch supplier summary', 500, inactiveError.message);
    }

    // Get suspended suppliers count
    const { count: suspendedSuppliers, error: suspendedError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'suspended');

    if (suspendedError) {
      console.error('Error fetching suspended suppliers count:', suspendedError);
      return createErrorResponse('Failed to fetch supplier summary', 500, suspendedError.message);
    }

    // Get pending suppliers count
    const { count: pendingSuppliers, error: pendingError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) {
      console.error('Error fetching pending suppliers count:', pendingError);
      return createErrorResponse('Failed to fetch supplier summary', 500, pendingError.message);
    }

    // Get suppliers by type (basic aggregation)
    const { data: suppliersByType, error: typeError } = await supabase
      .from('suppliers')
      .select('supplier_type');

    if (typeError) {
      console.error('Error fetching suppliers by type:', typeError);
      return createErrorResponse('Failed to fetch supplier summary', 500, typeError.message);
    }

    // Process suppliers by type
    const typeStats: Record<string, number> = {};
    suppliersByType?.forEach(supplier => {
      const type = supplier.supplier_type || 'unknown';
      typeStats[type] = (typeStats[type] || 0) + 1;
    });

    const suppliers_by_type = Object.entries(typeStats).map(([type, count]) => ({
      type,
      count,
      percentage: totalSuppliers ? Math.round((count / totalSuppliers) * 100) : 0
    }));

    // Get recent suppliers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentSuppliers, error: recentError } = await supabase
      .from('suppliers')
      .select(`
        id,
        name,
        code,
        email,
        phone,
        status,
        supplier_type,
        created_at,
        updated_at
      `)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Error fetching recent suppliers:', recentError);
      return createErrorResponse('Failed to fetch supplier summary', 500, recentError.message);
    }

    // Get top suppliers by rating (if rating field exists)
    const { data: topSuppliers, error: topError } = await supabase
      .from('suppliers')
      .select(`
        id,
        name,
        code,
        email,
        phone,
        status,
        supplier_type,
        rating,
        created_at,
        updated_at
      `)
      .not('rating', 'is', null)
      .order('rating', { ascending: false })
      .limit(5);

    if (topError) {
      console.error('Error fetching top suppliers:', topError);
      return createErrorResponse('Failed to fetch supplier summary', 500, topError.message);
    }

    // Calculate average rating
    const ratingsData = topSuppliers?.filter(s => s.rating !== null) || [];
    const averageRating = ratingsData.length > 0 
      ? ratingsData.reduce((sum, s) => sum + (s.rating || 0), 0) / ratingsData.length 
      : 0;

    // Build summary response
    const summary = {
      total_suppliers: totalSuppliers || 0,
      active_suppliers: activeSuppliers || 0,
      inactive_suppliers: inactiveSuppliers || 0,
      suspended_suppliers: suspendedSuppliers || 0,
      pending_suppliers: pendingSuppliers || 0,
      total_orders: 0, // TODO: Implement if orders table exists
      total_order_value: 0, // TODO: Implement if orders table exists
      average_rating: Math.round(averageRating * 10) / 10,
      suppliers_by_type,
      suppliers_by_performance: [
        {
          status: 'excellent',
          count: ratingsData.filter(s => (s.rating || 0) >= 4.5).length,
          percentage: ratingsData.length > 0 ? Math.round((ratingsData.filter(s => (s.rating || 0) >= 4.5).length / ratingsData.length) * 100) : 0
        },
        {
          status: 'good',
          count: ratingsData.filter(s => (s.rating || 0) >= 3.5 && (s.rating || 0) < 4.5).length,
          percentage: ratingsData.length > 0 ? Math.round((ratingsData.filter(s => (s.rating || 0) >= 3.5 && (s.rating || 0) < 4.5).length / ratingsData.length) * 100) : 0
        },
        {
          status: 'fair',
          count: ratingsData.filter(s => (s.rating || 0) >= 2.5 && (s.rating || 0) < 3.5).length,
          percentage: ratingsData.length > 0 ? Math.round((ratingsData.filter(s => (s.rating || 0) >= 2.5 && (s.rating || 0) < 3.5).length / ratingsData.length) * 100) : 0
        },
        {
          status: 'poor',
          count: ratingsData.filter(s => (s.rating || 0) < 2.5).length,
          percentage: ratingsData.length > 0 ? Math.round((ratingsData.filter(s => (s.rating || 0) < 2.5).length / ratingsData.length) * 100) : 0
        },
        {
          status: 'not_rated',
          count: (totalSuppliers || 0) - ratingsData.length,
          percentage: totalSuppliers ? Math.round(((totalSuppliers - ratingsData.length) / totalSuppliers) * 100) : 0
        }
      ],
      top_suppliers: topSuppliers?.map(supplier => ({
        ...supplier,
        address: [supplier.address_line_1, supplier.address_line_2, supplier.city, supplier.state]
          .filter(Boolean)
          .join(', '),
        createdAt: supplier.created_at,
        updatedAt: supplier.updated_at
      })) || [],
      recent_suppliers: recentSuppliers?.map(supplier => ({
        ...supplier,
        address: [supplier.address_line_1, supplier.address_line_2, supplier.city, supplier.state]
          .filter(Boolean)
          .join(', '),
        createdAt: supplier.created_at,
        updatedAt: supplier.updated_at
      })) || []
    };

    return createSuccessResponse(summary);
  } catch (error) {
    console.error('Unexpected error in GET /api/suppliers/summary:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
