import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received bulk adjustment creation request:', body);
    
    // Validate required fields
    if (!body.adjustments || !Array.isArray(body.adjustments)) {
      return NextResponse.json(
        { error: 'Adjustments array is required' },
        { status: 400 }
      );
    }

    const adjustmentsToCreate = body.adjustments;
    const batchReference = body.batchReference || `BULK-${Date.now()}`;
    const batchNotes = body.notes || '';

    console.log('Creating bulk adjustments:', adjustmentsToCreate.length, 'items');

    const createdAdjustments = [];
    const errors = [];
    
    for (let i = 0; i < adjustmentsToCreate.length; i++) {
      const adjustmentRequest = adjustmentsToCreate[i];
      
      try {
        // Validate individual adjustment
        if (!adjustmentRequest.product_id) {
          errors.push(`Adjustment ${i + 1}: Product ID is required`);
          continue;
        }
        
        if (!adjustmentRequest.adjustment_type) {
          errors.push(`Adjustment ${i + 1}: Adjustment type is required`);
          continue;
        }
        
        if (adjustmentRequest.quantity_after === undefined || adjustmentRequest.quantity_before === undefined) {
          errors.push(`Adjustment ${i + 1}: Both quantity_before and quantity_after are required`);
          continue;
        }
        
        if (!adjustmentRequest.reason) {
          errors.push(`Adjustment ${i + 1}: Reason is required`);
          continue;
        }

        // Verify the product exists
        const { data: productExists, error: productError } = await supabase
          .from('products')
          .select('id, name, sku')
          .eq('id', adjustmentRequest.product_id)
          .single();
        
        if (productError || !productExists) {
          errors.push(`Adjustment ${i + 1}: Product with ID ${adjustmentRequest.product_id} not found`);
          continue;
        }
        
        // Calculate quantity change
        const quantityChange = adjustmentRequest.quantity_after - adjustmentRequest.quantity_before;
        
        // Create adjustment record
        const adjustmentData = {
          product_id: adjustmentRequest.product_id,
          adjustment_type: adjustmentRequest.adjustment_type,
          reason: adjustmentRequest.reason,
          quantity_before: parseInt(adjustmentRequest.quantity_before),
          quantity_after: parseInt(adjustmentRequest.quantity_after),
          quantity_change: quantityChange,
          location: adjustmentRequest.location || 'Main Warehouse',
          reference: adjustmentRequest.reference || batchReference,
          notes: adjustmentRequest.notes 
            ? (batchNotes ? `${batchNotes}\n\n${adjustmentRequest.notes}` : adjustmentRequest.notes)
            : batchNotes,
          created_by: adjustmentRequest.created_by || 'system',
          status: adjustmentRequest.status || 'pending',
          cost_impact: adjustmentRequest.cost_impact || 0
        };

        const { data, error } = await supabase
          .from('stock_adjustments')
          .insert(adjustmentData)
          .select(`
            *,
            products (
              name,
              sku,
              barcode
            )
          `)
          .single();

        if (error) {
          console.error(`Error creating adjustment ${i + 1}:`, error);
          errors.push(`Adjustment ${i + 1}: ${error.message}`);
          continue;
        }
        
        if (data) {
          createdAdjustments.push(data);
        }
        
      } catch (err) {
        console.error(`Unexpected error creating adjustment ${i + 1}:`, err);
        errors.push(`Adjustment ${i + 1}: Unexpected error - ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Return results
    const response = {
      created: createdAdjustments,
      errors: errors,
      summary: {
        total: adjustmentsToCreate.length,
        successful: createdAdjustments.length,
        failed: errors.length
      }
    };

    console.log('Bulk creation completed:', response.summary);

    if (createdAdjustments.length === 0) {
      return NextResponse.json(
        { 
          error: 'No adjustments were created',
          details: errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in bulk adjustment creation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
