-- Migration: Create stock_movements table
-- Created: 2024-12-30
-- Description: Track all inventory movements (in/out/transfer) for audit and history

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Movement identification
    movement_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'MOV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('movement_sequence')::TEXT, 6, '0'),
    movement_type VARCHAR(20) NOT NULL, -- in, out, transfer, adjustment, return, damage, expired
    
    -- Product and location information
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    
    -- Location details (for transfers, both from and to are populated)
    location_from_id VARCHAR(50),
    location_from_name VARCHAR(100),
    location_to_id VARCHAR(50) NOT NULL DEFAULT 'main_warehouse',
    location_to_name VARCHAR(100) DEFAULT 'Main Warehouse',
    
    -- Movement quantities
    quantity INTEGER NOT NULL,
    quantity_before INTEGER, -- Quantity before this movement
    quantity_after INTEGER, -- Quantity after this movement
    
    -- Cost information
    unit_cost DECIMAL(12,4) DEFAULT 0,
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    
    -- Movement details
    reason VARCHAR(50) NOT NULL, -- purchase, sale, transfer, adjustment, damage, expired, return, etc.
    reason_description TEXT,
    
    -- Batch/lot tracking
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    
    -- Reference documents
    reference_type VARCHAR(30), -- purchase_order, sales_order, transfer_order, adjustment, manual
    reference_id UUID, -- Reference to external document (PO, SO, etc.)
    reference_number VARCHAR(100), -- Human readable reference
    
    -- Status and approval
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, completed, cancelled
    requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Physical movement tracking
    processed_by VARCHAR(255),
    processed_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional metadata
    notes TEXT,
    tags TEXT[], -- Array of tags for categorization
    
    -- Audit fields
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_quantity CHECK (quantity > 0),
    CONSTRAINT valid_unit_cost CHECK (unit_cost >= 0),
    CONSTRAINT valid_movement_type CHECK (
        movement_type IN ('in', 'out', 'transfer', 'adjustment', 'return', 'damage', 'expired', 'allocation', 'reservation')
    ),
    CONSTRAINT valid_status CHECK (
        status IN ('pending', 'approved', 'completed', 'cancelled')
    ),
    CONSTRAINT valid_reason CHECK (
        reason IN ('purchase', 'sale', 'transfer', 'adjustment', 'damage', 'expired', 'return', 'shrinkage', 'found', 'manual', 'allocation', 'reservation', 'production', 'consumption')
    ),
    CONSTRAINT valid_location_for_transfer CHECK (
        movement_type != 'transfer' OR (location_from_id IS NOT NULL AND location_to_id IS NOT NULL AND location_from_id != location_to_id)
    ),
    CONSTRAINT valid_approval CHECK (
        NOT requires_approval OR (approved_by IS NOT NULL AND approved_at IS NOT NULL) OR status != 'completed'
    )
);

-- Create sequence for movement numbers
CREATE SEQUENCE IF NOT EXISTS movement_sequence START 1;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory_item_id ON stock_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reason ON stock_movements(reason);
CREATE INDEX IF NOT EXISTS idx_stock_movements_status ON stock_movements(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_location_to ON stock_movements(location_to_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_location_from ON stock_movements(location_from_id) WHERE location_from_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movements_batch_lot ON stock_movements(batch_number, lot_number) WHERE batch_number IS NOT NULL OR lot_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_processed_at ON stock_movements(processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_number ON stock_movements(movement_number);

-- Partial indexes for performance on common queries
CREATE INDEX IF NOT EXISTS idx_stock_movements_pending ON stock_movements(created_at DESC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_stock_movements_completed_today ON stock_movements(processed_at DESC) WHERE processed_at >= CURRENT_DATE;

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

-- Function to process stock movement and update inventory
CREATE OR REPLACE FUNCTION process_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
    v_inventory_item_id UUID;
    v_current_quantity INTEGER;
    v_new_quantity INTEGER;
BEGIN
    -- Only process when status changes to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Find or create inventory item for the target location
        SELECT id, quantity_on_hand INTO v_inventory_item_id, v_current_quantity
        FROM inventory_items 
        WHERE product_id = NEW.product_id 
        AND location_id = NEW.location_to_id 
        AND status = 'active';
        
        -- If inventory item doesn't exist, create it
        IF v_inventory_item_id IS NULL THEN
            INSERT INTO inventory_items (product_id, location_id, location_name, quantity_on_hand, unit_cost)
            VALUES (NEW.product_id, NEW.location_to_id, NEW.location_to_name, 0, NEW.unit_cost)
            RETURNING id, quantity_on_hand INTO v_inventory_item_id, v_current_quantity;
        END IF;
        
        -- Calculate new quantity based on movement type
        CASE NEW.movement_type
            WHEN 'in' THEN
                v_new_quantity := v_current_quantity + NEW.quantity;
            WHEN 'out' THEN
                v_new_quantity := v_current_quantity - NEW.quantity;
            WHEN 'adjustment' THEN
                -- For adjustments, quantity represents the adjustment amount (can be negative)
                v_new_quantity := v_current_quantity + NEW.quantity;
            ELSE
                v_new_quantity := v_current_quantity + NEW.quantity;
        END CASE;
        
        -- Ensure quantity doesn't go below zero
        IF v_new_quantity < 0 THEN
            RAISE EXCEPTION 'Insufficient stock. Current: %, Requested: %, Movement: %', 
                v_current_quantity, NEW.quantity, NEW.movement_type;
        END IF;
        
        -- Update the inventory item
        UPDATE inventory_items 
        SET 
            quantity_on_hand = v_new_quantity,
            last_movement_date = NOW(),
            last_movement_type = NEW.movement_type,
            unit_cost = CASE 
                WHEN NEW.movement_type = 'in' AND NEW.unit_cost > 0 THEN
                    -- Update weighted average cost for stock-in movements
                    CASE 
                        WHEN quantity_on_hand = 0 THEN NEW.unit_cost
                        ELSE ((quantity_on_hand * unit_cost) + (NEW.quantity * NEW.unit_cost)) / (quantity_on_hand + NEW.quantity)
                    END
                ELSE unit_cost
            END
        WHERE id = v_inventory_item_id;
        
        -- Update movement record with before/after quantities
        UPDATE stock_movements 
        SET 
            inventory_item_id = v_inventory_item_id,
            quantity_before = v_current_quantity,
            quantity_after = v_new_quantity,
            processed_at = NOW()
        WHERE id = NEW.id;
        
        -- Handle transfer movements (reduce from source location)
        IF NEW.movement_type = 'transfer' AND NEW.location_from_id IS NOT NULL THEN
            UPDATE inventory_items 
            SET 
                quantity_on_hand = quantity_on_hand - NEW.quantity,
                last_movement_date = NOW(),
                last_movement_type = 'transfer_out'
            WHERE product_id = NEW.product_id 
            AND location_id = NEW.location_from_id 
            AND status = 'active'
            AND quantity_on_hand >= NEW.quantity;
            
            -- Check if the update affected any rows (sufficient stock)
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Insufficient stock at source location % for transfer', NEW.location_from_id;
            END IF;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to process stock movement
CREATE TRIGGER trigger_process_stock_movement
    AFTER INSERT OR UPDATE ON stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION process_stock_movement();

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

-- Policy: Authenticated users can delete stock movements (only if not processed)
CREATE POLICY "Authenticated users can delete unprocessed stock movements" ON stock_movements
    FOR DELETE USING (auth.role() = 'authenticated' AND status = 'pending');

-- Create view for stock movements with product information
CREATE OR REPLACE VIEW stock_movements_with_details AS
SELECT 
    sm.*,
    p.name as product_name,
    p.sku as product_sku,
    p.barcode as product_barcode,
    c.name as category_name,
    -- Get primary product image from media table
    m.file_path as primary_image_path,
    m.bucket_name as primary_image_bucket,
    -- Movement direction indicator
    CASE 
        WHEN sm.movement_type = 'in' THEN 'inbound'
        WHEN sm.movement_type = 'out' THEN 'outbound'
        WHEN sm.movement_type = 'transfer' THEN 'transfer'
        ELSE 'adjustment'
    END as movement_direction,
    -- Status indicators
    CASE 
        WHEN sm.status = 'completed' THEN TRUE
        ELSE FALSE
    END as is_processed
FROM stock_movements sm
LEFT JOIN products p ON sm.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN media m ON p.id = m.product_id AND m.is_primary = TRUE AND m.usage_type = 'product_primary';

-- Function to get recent stock movements
CREATE OR REPLACE FUNCTION get_recent_stock_movements(
    p_days INTEGER DEFAULT 7,
    p_product_id UUID DEFAULT NULL,
    p_location_id VARCHAR DEFAULT NULL,
    p_movement_type VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    movement_number VARCHAR,
    movement_type VARCHAR,
    product_name TEXT,
    product_sku TEXT,
    quantity INTEGER,
    unit_cost DECIMAL,
    total_cost DECIMAL,
    reason VARCHAR,
    status VARCHAR,
    location_to_name VARCHAR,
    location_from_name VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    primary_image_path TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sm.id, sm.movement_number, sm.movement_type,
        sm.product_name, sm.product_sku,
        sm.quantity, sm.unit_cost, sm.total_cost,
        sm.reason, sm.status,
        sm.location_to_name, sm.location_from_name,
        sm.created_at, sm.processed_at,
        sm.primary_image_path
    FROM stock_movements_with_details sm
    WHERE 
        sm.created_at >= (CURRENT_DATE - INTERVAL '%s DAYS')::TIMESTAMP WITH TIME ZONE
        AND (p_product_id IS NULL OR sm.product_id = p_product_id)
        AND (p_location_id IS NULL OR sm.location_to_id = p_location_id OR sm.location_from_id = p_location_id)
        AND (p_movement_type IS NULL OR sm.movement_type = p_movement_type)
    ORDER BY 
        sm.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to create stock movement (helper function for API)
CREATE OR REPLACE FUNCTION create_stock_movement(
    p_product_id UUID,
    p_movement_type VARCHAR,
    p_quantity INTEGER,
    p_reason VARCHAR,
    p_location_to_id VARCHAR DEFAULT 'main_warehouse',
    p_location_to_name VARCHAR DEFAULT 'Main Warehouse',
    p_location_from_id VARCHAR DEFAULT NULL,
    p_location_from_name VARCHAR DEFAULT NULL,
    p_unit_cost DECIMAL DEFAULT 0,
    p_reference_type VARCHAR DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_number VARCHAR DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_created_by VARCHAR DEFAULT 'system',
    p_auto_process BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
    v_movement_id UUID;
BEGIN
    -- Insert the stock movement
    INSERT INTO stock_movements (
        product_id, movement_type, quantity, reason,
        location_to_id, location_to_name, location_from_id, location_from_name,
        unit_cost, reference_type, reference_id, reference_number,
        notes, created_by, status
    ) VALUES (
        p_product_id, p_movement_type, p_quantity, p_reason,
        p_location_to_id, p_location_to_name, p_location_from_id, p_location_from_name,
        p_unit_cost, p_reference_type, p_reference_id, p_reference_number,
        p_notes, p_created_by, 
        CASE WHEN p_auto_process THEN 'completed' ELSE 'pending' END
    ) RETURNING id INTO v_movement_id;
    
    RETURN v_movement_id;
END;
$$ LANGUAGE plpgsql;

-- Add table comments for documentation
COMMENT ON TABLE stock_movements IS 'Tracks all inventory movements for audit and history';
COMMENT ON COLUMN stock_movements.id IS 'Unique identifier for stock movement';
COMMENT ON COLUMN stock_movements.movement_number IS 'Human readable movement reference number';
COMMENT ON COLUMN stock_movements.movement_type IS 'Type of movement: in, out, transfer, adjustment, etc.';
COMMENT ON COLUMN stock_movements.quantity IS 'Quantity being moved (always positive)';
COMMENT ON COLUMN stock_movements.quantity_before IS 'Stock quantity before this movement';
COMMENT ON COLUMN stock_movements.quantity_after IS 'Stock quantity after this movement';
COMMENT ON COLUMN stock_movements.reason IS 'Reason for the movement';
COMMENT ON COLUMN stock_movements.status IS 'Movement status: pending, approved, completed, cancelled';
COMMENT ON COLUMN stock_movements.reference_type IS 'Type of reference document (PO, SO, etc.)';

-- Verify the migration
SELECT 'Stock movements table created successfully!' as status;
