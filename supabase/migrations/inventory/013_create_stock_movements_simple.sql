-- Migration: Create stock_movements table (Simplified)
-- Created: 2025-01-02
-- Description: Basic stock movements table for inventory tracking

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Movement identification
    movement_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'MOV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    movement_type VARCHAR(20) NOT NULL, -- in, out, transfer, adjustment
    
    -- Product and location information
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Location details
    location_from_id VARCHAR(50),
    location_from_name VARCHAR(100),
    location_to_id VARCHAR(50) NOT NULL DEFAULT 'main_warehouse',
    location_to_name VARCHAR(100) DEFAULT 'Main Warehouse',
    
    -- Movement quantities
    quantity INTEGER NOT NULL,
    quantity_before INTEGER,
    quantity_after INTEGER,
    
    -- Cost information
    unit_cost DECIMAL(12,4) DEFAULT 0,
    total_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Movement details
    reason VARCHAR(50) NOT NULL, -- purchase, sale, transfer, adjustment, damage, etc.
    reason_description TEXT,
    
    -- Reference documents
    reference_type VARCHAR(30),
    reference_id UUID,
    reference_number VARCHAR(100),
    
    -- Status and approval
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, cancelled
    
    -- Audit fields
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_quantity CHECK (quantity > 0),
    CONSTRAINT valid_unit_cost CHECK (unit_cost >= 0),
    CONSTRAINT valid_movement_type CHECK (
        movement_type IN ('in', 'out', 'transfer', 'adjustment')
    ),
    CONSTRAINT valid_status CHECK (
        status IN ('pending', 'completed', 'cancelled')
    ),
    CONSTRAINT valid_reason CHECK (
        reason IN ('purchase', 'sale', 'transfer', 'adjustment', 'damage', 'return', 'manual')
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_status ON stock_movements(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_location_to ON stock_movements(location_to_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stock_movements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_update_stock_movements_updated_at
    BEFORE UPDATE ON stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_movements_updated_at();

-- Enable Row Level Security
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Authenticated users can view stock movements
CREATE POLICY "Authenticated users can view stock movements" ON stock_movements
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert stock movements
CREATE POLICY "Authenticated users can insert stock movements" ON stock_movements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update stock movements
CREATE POLICY "Authenticated users can update stock movements" ON stock_movements
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete stock movements
CREATE POLICY "Authenticated users can delete stock movements" ON stock_movements
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample movements for testing (optional)
INSERT INTO stock_movements (
    product_id, 
    movement_type, 
    quantity, 
    reason, 
    location_to_id, 
    location_to_name,
    unit_cost,
    status,
    created_by
) 
SELECT 
    p.id,
    'in' as movement_type,
    CASE 
        WHEN p.stock_quantity > 0 THEN p.stock_quantity
        ELSE 10
    END as quantity,
    'manual' as reason,
    'main_warehouse' as location_to_id,
    'Main Warehouse' as location_to_name,
    COALESCE(p.cost_price, 0) as unit_cost,
    'completed' as status,
    'system' as created_by
FROM products p
WHERE p.is_active = true
LIMIT 10
ON CONFLICT DO NOTHING;

-- Verify the migration
SELECT 'Stock movements table created successfully!' as status;
SELECT COUNT(*) as movements_created FROM stock_movements;
