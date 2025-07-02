import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Get movements grouped by product for the specified period
    const { data: movements, error } = await supabase
      .from('stock_movements')
      .select(`
        product_id,
        movement_type,
        quantity,
        created_at,
        products (
          name,
          sku
        )
      `)
      .gte('created_at', dateFrom.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching movements by product:', error);
      return NextResponse.json(
        { error: 'Failed to fetch movements by product' },
        { status: 500 }
      );
    }

    const movementsData = movements || [];

    // Group movements by product
    const productMovements = new Map();

    movementsData.forEach(movement => {
      const productId = movement.product_id;
      
      if (!productMovements.has(productId)) {
        productMovements.set(productId, {
          productId: productId,
          productName: movement.products?.name || 'Unknown Product',
          productSku: movement.products?.sku || 'N/A',
          totalIn: 0,
          totalOut: 0,
          netMovement: 0,
          lastMovement: movement.created_at,
          movementCount: 0
        });
      }

      const productData = productMovements.get(productId);
      
      if (movement.movement_type === 'in') {
        productData.totalIn += movement.quantity;
      } else if (movement.movement_type === 'out') {
        productData.totalOut += movement.quantity;
      }
      
      productData.netMovement = productData.totalIn - productData.totalOut;
      productData.movementCount++;
      
      if (new Date(movement.created_at) > new Date(productData.lastMovement)) {
        productData.lastMovement = movement.created_at;
      }
    });

    const result = Array.from(productMovements.values())
      .sort((a, b) => b.movementCount - a.movementCount);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
