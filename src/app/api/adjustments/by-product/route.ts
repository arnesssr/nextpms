import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching adjustments by product...');
    
    // Check if table exists first
    const { data: testData, error: testError } = await supabase
      .from('stock_adjustments')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Error testing stock_adjustments table:', testError);
      return NextResponse.json([]);
    }

    // Get adjustments with product info
    const { data: adjustments, error } = await supabase
      .from('stock_adjustments')
      .select(`
        *,
        products (
          name,
          sku,
          barcode
        )
      `);

    if (error) {
      console.error('Error fetching adjustments for by-product:', error);
      return NextResponse.json(
        { error: 'Failed to fetch adjustments by product' },
        { status: 500 }
      );
    }

    // Group adjustments by product
    const productAdjustments = new Map();

    adjustments.forEach(adjustment => {
      const productId = adjustment.product_id;
      
      if (!productAdjustments.has(productId)) {
        productAdjustments.set(productId, {
          productId,
          productName: adjustment.products?.name || 'Unknown Product',
          productSku: adjustment.products?.sku || 'N/A',
          totalAdjustments: 0,
          totalIncrease: 0,
          totalDecrease: 0,
          netAdjustment: 0,
          lastAdjustment: adjustment.created_at,
          avgAdjustmentSize: 0
        });
      }

      const productData = productAdjustments.get(productId);
      
      productData.totalAdjustments++;
      
      if (adjustment.quantity_change > 0) {
        productData.totalIncrease += adjustment.quantity_change;
      } else {
        productData.totalDecrease += Math.abs(adjustment.quantity_change);
      }
      
      productData.netAdjustment += adjustment.quantity_change;
      
      if (new Date(adjustment.created_at) > new Date(productData.lastAdjustment)) {
        productData.lastAdjustment = adjustment.created_at;
      }
    });

    // Calculate average adjustment size
    productAdjustments.forEach(productData => {
      productData.avgAdjustmentSize = productData.totalAdjustments > 0 
        ? Math.abs(productData.netAdjustment) / productData.totalAdjustments 
        : 0;
    });

    const result = Array.from(productAdjustments.values())
      .sort((a, b) => b.totalAdjustments - a.totalAdjustments);

    console.log('Calculated adjustments by product:', result.length, 'products');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Unexpected error in by-product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
