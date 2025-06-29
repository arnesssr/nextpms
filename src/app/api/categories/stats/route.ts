import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseAnonymousClient } from '@/lib/supabaseServer';

// GET /api/categories/stats
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseAnonymousClient();
    
    const { data, error } = await supabase
      .from('category_stats')
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
