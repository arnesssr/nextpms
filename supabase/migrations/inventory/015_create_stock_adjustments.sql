-- Migration: Create stock_adjustments table
-- Created: 2025-07-03
-- Description: Track inventory adjustments for audit and reporting

-- Create stock_adjustments table
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Product reference
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Adjustment details
    adjustment_type VARCHAR(20) NOT NULL, -- increase, decrease, recount
    reason VARCHAR(50) NOT NULL, -- stock_found, damage, theft, expiry, counting_error, etc.
    
    -- Quantity information
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    quantity_change INTEGER NOT NULL, -- calculated: quantity_after - quantity_before
    
    -- Location and reference
    location VARCHAR(100) NOT NULL DEFAULT 'Main Warehouse',
    reference VARCHAR(100), -- PO number, invoice, batch reference, etc.
    notes TEXT,
    
    -- Financial impact
    cost_impact DECIMAL(12,2) DEFAULT 0, -- financial impact of the adjustment
    
    -- Approval workflow
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, draft
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_adjustment_type CHECK (
        adjustment_type IN ('increase', 'decrease', 'recount')
    ),
    CONSTRAINT valid_status CHECK (
        status IN ('pending', 'approved', 'rejected', 'draft')
    ),
    CONSTRAINT valid_reason CHECK (
        reason IN (
            'stock_found', 'return_from_customer', 'supplier_credit', 'production_yield', 'counting_error',
            'damage', 'theft', 'expiry', 'quality_issue', 'shrinkage', 'sample_used', 'disposal',
            'cycle_count', 'physical_inventory', 'system_error', 'reconciliation'
        )
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product_id ON stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_type ON stock_adjustments(adjustment_type);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_reason ON stock_adjustments(reason);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_status ON stock_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_location ON stock_adjustments(location);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_created_at ON stock_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_approved_at ON stock_adjustments(approved_at DESC);

-- Partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_pending ON stock_adjustments(created_at DESC) WHERE status = 'pending';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stock_adjustments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_update_stock_adjustments_updated_at
    BEFORE UPDATE ON stock_adjustments
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_adjustments_updated_at();

-- Enable Row Level Security
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Authenticated users can view adjustments
CREATE POLICY "Authenticated users can view adjustments" ON stock_adjustments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert adjustments
CREATE POLICY "Authenticated users can insert adjustments" ON stock_adjustments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update adjustments
CREATE POLICY "Authenticated users can update adjustments" ON stock_adjustments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete adjustments (only if not approved)
CREATE POLICY "Authenticated users can delete unapproved adjustments" ON stock_adjustments
    FOR DELETE USING (auth.role() = 'authenticated' AND status != 'approved');

-- Create view for adjustments with product information
CREATE OR REPLACE VIEW stock_adjustments_with_details AS
SELECT 
    sa.*,
    p.name as product_name,
    p.sku as product_sku,
    p.barcode as product_barcode,
    c.name as category_name,
    -- Get primary product image from media table
    m.file_path as primary_image_path,
    m.bucket_name as primary_image_bucket,
    -- Adjustment direction indicator
    CASE 
        WHEN sa.quantity_change > 0 THEN 'increase'
        WHEN sa.quantity_change < 0 THEN 'decrease'
        ELSE 'neutral'
    END as adjustment_direction,
    -- Status indicators
    CASE 
        WHEN sa.status = 'approved' THEN TRUE
        ELSE FALSE
    END as is_approved,
    CASE 
        WHEN sa.status = 'pending' THEN TRUE
        ELSE FALSE
    END as needs_approval
FROM stock_adjustments sa
LEFT JOIN products p ON sa.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN media m ON p.id = m.product_id AND m.is_primary = TRUE AND m.usage_type = 'product_primary';

-- Function to get recent adjustments with filters
CREATE OR REPLACE FUNCTION get_recent_adjustments(
    p_days INTEGER DEFAULT 30,
    p_product_id UUID DEFAULT NULL,
    p_adjustment_type VARCHAR DEFAULT NULL,
    p_reason VARCHAR DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    product_id UUID,
    product_name TEXT,
    product_sku TEXT,
    adjustment_type VARCHAR,
    reason VARCHAR,
    quantity_before INTEGER,
    quantity_after INTEGER,
    quantity_change INTEGER,
    location VARCHAR,
    reference VARCHAR,
    notes TEXT,
    cost_impact DECIMAL,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    primary_image_path TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.id, sa.product_id, sa.product_name, sa.product_sku,
        sa.adjustment_type, sa.reason,
        sa.quantity_before, sa.quantity_after, sa.quantity_change,
        sa.location, sa.reference, sa.notes, sa.cost_impact,
        sa.status, sa.created_at, sa.approved_at,
        sa.primary_image_path
    FROM stock_adjustments_with_details sa
    WHERE 
        sa.created_at >= (CURRENT_DATE - INTERVAL '%s DAYS')::TIMESTAMP WITH TIME ZONE
        AND (p_product_id IS NULL OR sa.product_id = p_product_id)
        AND (p_adjustment_type IS NULL OR sa.adjustment_type = p_adjustment_type)
        AND (p_reason IS NULL OR sa.reason = p_reason)
        AND (p_status IS NULL OR sa.status = p_status)
    ORDER BY 
        sa.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Add table comments for documentation
COMMENT ON TABLE stock_adjustments IS 'Tracks inventory adjustments for audit and reporting purposes';
COMMENT ON COLUMN stock_adjustments.id IS 'Unique identifier for adjustment';
COMMENT ON COLUMN stock_adjustments.adjustment_type IS 'Type of adjustment: increase, decrease, or recount';
COMMENT ON COLUMN stock_adjustments.reason IS 'Reason for the adjustment';
COMMENT ON COLUMN stock_adjustments.quantity_change IS 'Net change in quantity (positive for increase, negative for decrease)';
COMMENT ON COLUMN stock_adjustments.cost_impact IS 'Financial impact of the adjustment';
COMMENT ON COLUMN stock_adjustments.status IS 'Approval status: pending, approved, rejected, or draft';

-- Verify the migration
SELECT 'Stock adjustments table created successfully!' as status;
