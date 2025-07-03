import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching adjustments summary...');
    
    // Check if table exists first
    const { data: testData, error: testError } = await supabase
      .from('stock_adjustments')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Error testing stock_adjustments table:', testError);
      // Return empty summary if table doesn't exist
      return NextResponse.json({
        totalAdjustments: 0,
        pendingAdjustments: 0,
        approvedAdjustments: 0,
        rejectedAdjustments: 0,
        totalIncreases: 0,
        totalDecreases: 0,
        totalCostImpact: 0,
        adjustmentsToday: 0,
        adjustmentsThisWeek: 0,
        adjustmentsThisMonth: 0
      });
    }

    // Get all adjustments for calculations
    const { data: adjustments, error } = await supabase
      .from('stock_adjustments')
      .select('*');

    if (error) {
      console.error('Error fetching adjustments for summary:', error);
      return NextResponse.json(
        { error: 'Failed to fetch adjustments summary' },
        { status: 500 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const summary = {
      totalAdjustments: adjustments.length,
      pendingAdjustments: adjustments.filter(a => a.status === 'pending').length,
      approvedAdjustments: adjustments.filter(a => a.status === 'approved').length,
      rejectedAdjustments: adjustments.filter(a => a.status === 'rejected').length,
      totalIncreases: adjustments.filter(a => a.quantity_change > 0).length,
      totalDecreases: adjustments.filter(a => a.quantity_change < 0).length,
      totalCostImpact: adjustments.reduce((sum, a) => sum + (a.cost_impact || 0), 0),
      adjustmentsToday: adjustments.filter(a => new Date(a.created_at) >= today).length,
      adjustmentsThisWeek: adjustments.filter(a => new Date(a.created_at) >= weekStart).length,
      adjustmentsThisMonth: adjustments.filter(a => new Date(a.created_at) >= monthStart).length
    };

    console.log('Calculated summary:', summary);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Unexpected error in summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
