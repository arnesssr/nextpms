import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('History API called for ID:', params.id);
  
  try {
    // Simple response with mock data for now to test JSON parsing
    const mockHistory = [
      {
        date: new Date().toISOString(),
        action: 'Initial Stock Entry',
        quantityChanged: 100,
        newQuantity: 100,
        user: 'System'
      },
      {
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        action: 'Stock Adjustment (+20)',
        quantityChanged: 20,
        newQuantity: 120,
        user: 'Admin'
      }
    ];

    return NextResponse.json({
      success: true,
      history: mockHistory,
      item: {
        id: params.id,
        name: 'Test Product',
        sku: 'TEST-001'
      }
    });
    
  } catch (error) {
    console.error('Error in history API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatMovementAction(movementType: string, quantityChange: number): string {
  const absChange = Math.abs(quantityChange);
  
  switch (movementType?.toLowerCase()) {
    case 'in':
    case 'stock_in':
    case 'purchase':
      return `Stock In (+${absChange})`;
    case 'out':
    case 'stock_out':
    case 'sale':
      return `Stock Out (-${absChange})`;
    case 'adjustment':
      return quantityChange >= 0 
        ? `Stock Adjustment (+${absChange})`
        : `Stock Adjustment (-${absChange})`;
    case 'transfer':
      return `Stock Transfer (${quantityChange >= 0 ? '+' : ''}${quantityChange})`;
    case 'return':
      return `Stock Return (+${absChange})`;
    case 'damaged':
      return `Damaged Stock (-${absChange})`;
    case 'lost':
      return `Lost Stock (-${absChange})`;
    default:
      return quantityChange >= 0 
        ? `Stock Change (+${absChange})`
        : `Stock Change (-${absChange})`;
  }
}
