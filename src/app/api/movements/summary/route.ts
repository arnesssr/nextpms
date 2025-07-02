import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Get movements for the specified period
    const { data: movements, error } = await supabase
      .from('stock_movements')
      .select('movement_type, quantity, unit_cost, created_at')
      .gte('created_at', dateFrom.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching movements for summary:', error);
      return NextResponse.json(
        { error: 'Failed to fetch movement summary' },
        { status: 500 }
      );
    }

    const movementsData = movements || [];

    // Calculate summary statistics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const summary = {
      totalMovements: movementsData.length,
      totalStockIn: movementsData
        .filter(m => m.movement_type === 'in')
        .reduce((sum, m) => sum + m.quantity, 0),
      totalStockOut: movementsData
        .filter(m => m.movement_type === 'out')
        .reduce((sum, m) => sum + m.quantity, 0),
      totalValue: movementsData
        .reduce((sum, m) => sum + (m.quantity * (m.unit_cost || 0)), 0),
      movementsToday: movementsData
        .filter(m => new Date(m.created_at) >= today).length,
      movementsThisWeek: movementsData
        .filter(m => new Date(m.created_at) >= weekStart).length,
      movementsThisMonth: movementsData
        .filter(m => new Date(m.created_at) >= monthStart).length
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
