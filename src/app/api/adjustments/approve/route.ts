import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received adjustment approval request:', body);
    
    // Validate required fields
    if (!body.adjustmentIds || !Array.isArray(body.adjustmentIds)) {
      return NextResponse.json(
        { error: 'Adjustment IDs array is required' },
        { status: 400 }
      );
    }
    
    if (body.approved === undefined) {
      return NextResponse.json(
        { error: 'Approved flag is required' },
        { status: 400 }
      );
    }

    const adjustmentIds = body.adjustmentIds;
    const approved = body.approved;
    const approvalNotes = body.approvalNotes || '';
    const approvedBy = body.approvedBy || 'system';

    console.log('Processing approval for adjustments:', adjustmentIds);

    // Update all specified adjustments
    const updates = [];
    
    for (const adjustmentId of adjustmentIds) {
      const updateData = {
        status: approved ? 'approved' : 'rejected',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add approval notes to existing notes if provided
      if (approvalNotes) {
        // First get the current adjustment to append to notes
        const { data: currentAdj } = await supabase
          .from('stock_adjustments')
          .select('notes')
          .eq('id', adjustmentId)
          .single();
        
        const existingNotes = currentAdj?.notes || '';
        updateData.notes = existingNotes 
          ? `${existingNotes}\n\nApproval Notes: ${approvalNotes}`
          : `Approval Notes: ${approvalNotes}`;
      }

      const { data, error } = await supabase
        .from('stock_adjustments')
        .update(updateData)
        .eq('id', adjustmentId)
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
        console.error('Error updating adjustment:', adjustmentId, error);
        continue; // Skip this one but continue with others
      }

      if (data) {
        updates.push(data);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No adjustments were updated' },
        { status: 400 }
      );
    }

    console.log('Successfully updated adjustments:', updates.length);
    return NextResponse.json(updates);
  } catch (error) {
    console.error('Unexpected error in adjustment approval:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
