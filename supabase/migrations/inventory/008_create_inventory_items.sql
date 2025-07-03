-- Migration: Create inventory_items table
-- Created: 2024-12-30
-- Description: Main inventory tracking table for product stock management

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Product relationship (REQUIRED)
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Location and warehouse information
    location_id VARCHAR(50) NOT NULL DEFAULT 'main_warehouse',
    location_name VARCHAR(100) DEFAULT 'Main Warehouse',
    shelf_location VARCHAR(50), -- Specific shelf/bin location
    zone VARCHAR(50), -- Warehouse zone/section
    
    -- Stock quantities
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    quantity_incoming INTEGER NOT NULL DEFAULT 0, -- Expected stock coming in
    quantity_allocated INTEGER NOT NULL DEFAULT 0, -- Stock allocated for orders
    
    -- Stock level thresholds
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    reorder_point INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    
    -- Cost tracking
    unit_cost DECIMAL(12,4) DEFAULT 0,
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity_on_hand * unit_cost) STORED,
    last_purchase_cost DECIMAL(12,4),
    average_cost DECIMAL(12,4) DEFAULT 0,
    
    -- Batch/lot tracking
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    manufacture_date DATE,
    
    -- Physical characteristics
    weight_per_unit DECIMAL(10,3), -- in kg
    volume_per_unit DECIMAL(10,3), -- in cubic meters
    
    -- Status and flags
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, discontinued, quarantine
    is_tracked BOOLEAN NOT NULL DEFAULT TRUE,
    is_serialized BOOLEAN NOT NULL DEFAULT FALSE,
    is_perishable BOOLEAN NOT NULL DEFAULT FALSE,
    requires_quality_check BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Last movement tracking
    last_movement_date TIMESTAMP WITH TIME ZONE,
    last_movement_type VARCHAR(50),
    last_counted_date TIMESTAMP WITH TIME ZONE,
    last_counted_by VARCHAR(255),
    
    -- Audit fields
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_quantities CHECK (
        quantity_on_hand >= 0 AND 
        quantity_reserved >= 0 AND 
        quantity_incoming >= 0 AND
        quantity_allocated >= 0
    ),
    CONSTRAINT valid_costs CHECK (
        unit_cost >= 0 AND 
        COALESCE(last_purchase_cost, 0) >= 0 AND 
        COALESCE(average_cost, 0) >= 0
    ),
    CONSTRAINT valid_stock_levels CHECK (
        min_stock_level >= 0 AND 
        COALESCE(max_stock_level, 0) >= 0 AND
        reorder_point >= 0 AND
        reorder_quantity >= 0
    ),
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'discontinued', 'quarantine')),
    CONSTRAINT valid_dates CHECK (
        expiry_date IS NULL OR manufacture_date IS NULL OR expiry_date > manufacture_date
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_id ON inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location_id ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_quantity_available ON inventory_items(quantity_available);
CREATE INDEX IF NOT EXISTS idx_inventory_items_min_stock ON inventory_items(min_stock_level) WHERE quantity_available <= min_stock_level;
CREATE INDEX IF NOT EXISTS idx_inventory_items_batch_lot ON inventory_items(batch_number, lot_number) WHERE batch_number IS NOT NULL OR lot_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiry ON inventory_items(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_last_movement ON inventory_items(last_movement_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_items_created_at ON inventory_items(created_at DESC);

-- Unique constraint for product per location
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_items_product_location 
ON inventory_items(product_id, location_id) 
WHERE status = 'active';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_items_updated_at();

-- Function to sync inventory with products table stock_quantity
CREATE OR REPLACE FUNCTION sync_product_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the products table stock_quantity with sum of all locations
    UPDATE products 
    SET stock_quantity = (
        SELECT COALESCE(SUM(quantity_available), 0)
        FROM inventory_items 
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND status = 'active'
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync product stock quantity
CREATE TRIGGER trigger_sync_product_stock_quantity
    AFTER INSERT OR UPDATE OR DELETE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION sync_product_stock_quantity();

-- Enable Row Level Security
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Authenticated users can view inventory
CREATE POLICY "Authenticated users can view inventory items" ON inventory_items
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert inventory items
CREATE POLICY "Authenticated users can insert inventory items" ON inventory_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update inventory items
CREATE POLICY "Authenticated users can update inventory items" ON inventory_items
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete inventory items
CREATE POLICY "Authenticated users can delete inventory items" ON inventory_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create view for inventory with product information
CREATE OR REPLACE VIEW inventory_with_products AS
SELECT 
    i.*,
    p.name as product_name,
    p.sku as product_sku,
    p.barcode as product_barcode,
    p.selling_price as product_selling_price,
    p.cost_price as product_cost_price,
    c.name as category_name,
    -- Get primary product image from media table
    m.file_path as primary_image_path,
    m.bucket_name as primary_image_bucket,
    -- Stock status calculations
    CASE 
        WHEN i.quantity_available <= 0 THEN 'out_of_stock'
        WHEN i.quantity_available <= i.min_stock_level THEN 'low_stock'
        WHEN i.quantity_available >= COALESCE(i.max_stock_level, 999999) THEN 'overstock'
        ELSE 'in_stock'
    END as stock_status,
    -- Value calculations
    (i.quantity_available * i.unit_cost) as inventory_value,
    (i.quantity_available * p.selling_price) as potential_revenue
FROM inventory_items i
LEFT JOIN products p ON i.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN media m ON p.id = m.product_id AND m.is_primary = TRUE AND m.usage_type = 'product_primary';

-- Function to get low stock items
CREATE OR REPLACE FUNCTION get_low_stock_items(
    p_location_id VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    product_id UUID,
    product_name TEXT,
    product_sku TEXT,
    location_id VARCHAR,
    location_name VARCHAR,
    quantity_available INTEGER,
    min_stock_level INTEGER,
    reorder_point INTEGER,
    reorder_quantity INTEGER,
    stock_status TEXT,
    primary_image_path TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id, i.product_id, i.product_name, i.product_sku,
        i.location_id, i.location_name,
        i.quantity_available, i.min_stock_level, i.reorder_point, i.reorder_quantity,
        i.stock_status, i.primary_image_path
    FROM inventory_with_products i
    WHERE 
        i.quantity_available <= i.min_stock_level
        AND i.status = 'active'
        AND (p_location_id IS NULL OR i.location_id = p_location_id)
    ORDER BY 
        i.quantity_available ASC,
        i.product_name ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Add table comments for documentation
COMMENT ON TABLE inventory_items IS 'Main inventory tracking table for product stock management across locations';
COMMENT ON COLUMN inventory_items.id IS 'Unique identifier for inventory item';
COMMENT ON COLUMN inventory_items.product_id IS 'Reference to the product being tracked';
COMMENT ON COLUMN inventory_items.location_id IS 'Identifier for storage location/warehouse';
COMMENT ON COLUMN inventory_items.quantity_available IS 'Computed available quantity (on_hand - reserved)';
COMMENT ON COLUMN inventory_items.quantity_reserved IS 'Quantity reserved for pending orders';
COMMENT ON COLUMN inventory_items.total_cost IS 'Computed total inventory value (quantity * unit_cost)';
COMMENT ON COLUMN inventory_items.status IS 'Inventory status: active, inactive, discontinued, quarantine';
COMMENT ON COLUMN inventory_items.batch_number IS 'Batch number for tracking purposes';
COMMENT ON COLUMN inventory_items.expiry_date IS 'Expiration date for perishable items';

-- Verify the migration
SELECT 'Inventory items table created successfully!' as status;
