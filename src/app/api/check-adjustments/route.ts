import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // First, use regular client to check
    const { supabase } = await import('@/lib/supabaseClient');
    
    const { data: regularData, error: regularError } = await supabase
      .from('stock_adjustments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    // Then try with service role if available
    let serviceRoleData = null;
    let serviceRoleError = null;
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      const result = await supabaseAdmin
        .from('stock_adjustments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      serviceRoleData = result.data;
      serviceRoleError = result.error;
    }

    return NextResponse.json({
      regularClient: {
        data: regularData,
        error: regularError?.message,
        count: regularData?.length || 0
      },
      serviceRoleClient: {
        available: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        data: serviceRoleData,
        error: serviceRoleError?.message,
        count: serviceRoleData?.length || 0
      },
      analysis: {
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        regularCanRead: !regularError && regularData !== null,
        serviceCanRead: !serviceRoleError && serviceRoleData !== null,
        dataDifference: (serviceRoleData?.length || 0) - (regularData?.length || 0)
      }
    });
  } catch (error) {
    console.error('Check adjustments error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
