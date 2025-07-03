import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching adjustments by reason...');
    
    // Check if table exists first
    const { data: testData, error: testError } = await supabase
      .from('stock_adjustments')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Error testing stock_adjustments table:', testError);
      return NextResponse.json([]);
    }

    // Get all adjustments
    const { data: adjustments, error } = await supabase
      .from('stock_adjustments')
      .select('*');

    if (error) {
      console.error('Error fetching adjustments for by-reason:', error);
      return NextResponse.json(
        { error: 'Failed to fetch adjustments by reason' },
        { status: 500 }
      );
    }

    // Group adjustments by reason
    const reasonStats = new Map();

    adjustments.forEach(adjustment => {
      const reason = adjustment.reason;
      
      if (!reasonStats.has(reason)) {
        reasonStats.set(reason, {
          reason,
          count: 0,
          totalQuantity: 0,
          percentage: 0
        });
      }

      const reasonData = reasonStats.get(reason);
      reasonData.count++;
      reasonData.totalQuantity += Math.abs(adjustment.quantity_change || 0);
    });

    // Calculate percentages
    const totalAdjustments = adjustments.length;
    reasonStats.forEach(reasonData => {
      reasonData.percentage = totalAdjustments > 0 
        ? (reasonData.count / totalAdjustments) * 100 
        : 0;
    });

    const result = Array.from(reasonStats.values())
      .sort((a, b) => b.count - a.count);

    console.log('Calculated adjustments by reason:', result.length, 'reasons');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Unexpected error in by-reason:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
