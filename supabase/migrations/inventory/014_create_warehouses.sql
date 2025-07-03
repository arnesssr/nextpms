-- Migration: Create warehouses table and integrate with existing inventory
-- Created: 2025-07-02
-- Description: Add proper warehouse management to existing inventory system

-- Create warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(50) PRIMARY KEY, -- Custom ID like 'main_warehouse', 'warehouse_2', etc.
    
    -- Basic information
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL, -- Short code for reference
    description TEXT,
    
    -- Address information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    
    -- Contact information
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_name VARCHAR(255),
    
    -- Operational settings
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Capacity and physical properties
    max_capacity INTEGER, -- Maximum items that can be stored
    max_volume_m3 DECIMAL(12,3), -- Maximum volume in cubic meters
    max_weight_kg DECIMAL(12,2), -- Maximum weight in kilograms
    
    -- Current utilization (calculated automatically)
    current_items INTEGER DEFAULT 0,
    current_volume_m3 DECIMAL(12,3) DEFAULT 0,
    current_weight_kg DECIMAL(12,2) DEFAULT 0,
    utilization_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Operational flags
    supports_receiving BOOLEAN NOT NULL DEFAULT TRUE,
    supports_shipping BOOLEAN NOT NULL DEFAULT TRUE,
    supports_returns BOOLEAN NOT NULL DEFAULT TRUE,
    supports_transfers BOOLEAN NOT NULL DEFAULT TRUE,
    is_temperature_controlled BOOLEAN NOT NULL DEFAULT FALSE,
    is_hazmat_approved BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Temperature settings
    min_temperature_c DECIMAL(5,2),
    max_temperature_c DECIMAL(5,2),
    temperature_unit VARCHAR(1) DEFAULT 'C' CHECK (temperature_unit IN ('C', 'F')),
    
    -- Business hours
    operating_hours JSONB, -- Store as {"monday": {"open": "08:00", "close": "18:00"}, ...}
    
    -- Additional metadata
    tags TEXT[], -- Array of tags for categorization
    custom_fields JSONB, -- Flexible custom fields
    
    -- Audit fields
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_capacity CHECK (max_capacity IS NULL OR max_capacity > 0),
    CONSTRAINT valid_volume CHECK (max_volume_m3 IS NULL OR max_volume_m3 > 0),
    CONSTRAINT valid_weight CHECK (max_weight_kg IS NULL OR max_weight_kg > 0),
    CONSTRAINT valid_utilization CHECK (utilization_percentage >= 0 AND utilization_percentage <= 100),
    CONSTRAINT valid_temperature_range CHECK (
        (min_temperature_c IS NULL AND max_temperature_c IS NULL) OR
        (min_temperature_c IS NOT NULL AND max_temperature_c IS NOT NULL AND min_temperature_c <= max_temperature_c)
    )
    -- Note: Only one default warehouse constraint is handled by trigger
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);
CREATE INDEX IF NOT EXISTS idx_warehouses_is_active ON warehouses(is_active);
CREATE INDEX IF NOT EXISTS idx_warehouses_is_default ON warehouses(is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_warehouses_city_state ON warehouses(city, state) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_warehouses_utilization ON warehouses(utilization_percentage);
CREATE INDEX IF NOT EXISTS idx_warehouses_tags_gin ON warehouses USING GIN(tags) WHERE tags IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_warehouses_custom_fields_gin ON warehouses USING GIN(custom_fields) WHERE custom_fields IS NOT NULL;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_warehouses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = COALESCE(NEW.updated_by, NEW.created_by);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_update_warehouses_updated_at
    BEFORE UPDATE ON warehouses
    FOR EACH ROW
    EXECUTE FUNCTION update_warehouses_updated_at();

-- Create function to ensure only one default warehouse
CREATE OR REPLACE FUNCTION ensure_one_default_warehouse()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a warehouse as default, unset all others
    IF NEW.is_default = TRUE THEN
        UPDATE warehouses 
        SET is_default = FALSE 
        WHERE id != NEW.id AND is_default = TRUE;
    END IF;
    
    -- Ensure at least one warehouse is always default if this is the only active warehouse
    IF OLD.is_default = TRUE AND NEW.is_default = FALSE THEN
        -- Check if there are other default warehouses
        IF NOT EXISTS (SELECT 1 FROM warehouses WHERE is_default = TRUE AND id != NEW.id) THEN
            -- If no other default exists, find another active warehouse to make default
            UPDATE warehouses 
            SET is_default = TRUE 
            WHERE id = (
                SELECT id FROM warehouses 
                WHERE is_active = TRUE AND id != NEW.id 
                ORDER BY created_at ASC 
                LIMIT 1
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure one default warehouse
CREATE TRIGGER trigger_ensure_one_default_warehouse
    AFTER INSERT OR UPDATE ON warehouses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_one_default_warehouse();

-- Create function to calculate warehouse utilization
CREATE OR REPLACE FUNCTION calculate_warehouse_utilization()
RETURNS TRIGGER AS $$
DECLARE
    v_warehouse_id VARCHAR(50);
    v_current_items INTEGER;
    v_current_volume DECIMAL(12,3);
    v_current_weight DECIMAL(12,2);
    v_utilization DECIMAL(5,2);
    v_max_capacity INTEGER;
BEGIN
    -- Determine which warehouse to update
    IF TG_OP = 'DELETE' THEN
        v_warehouse_id := OLD.location_id;
    ELSE
        v_warehouse_id := NEW.location_id;
    END IF;
    
    -- Calculate current utilization for the warehouse
    SELECT 
        COALESCE(SUM(quantity_on_hand), 0),
        COALESCE(SUM(quantity_on_hand * COALESCE(weight_per_unit, 0)), 0),
        COALESCE(SUM(quantity_on_hand * COALESCE(volume_per_unit, 0)), 0)
    INTO v_current_items, v_current_weight, v_current_volume
    FROM inventory_items
    WHERE location_id = v_warehouse_id AND status = 'active';
    
    -- Get warehouse max capacity
    SELECT max_capacity INTO v_max_capacity
    FROM warehouses
    WHERE id = v_warehouse_id;
    
    -- Calculate utilization percentage
    IF v_max_capacity IS NOT NULL AND v_max_capacity > 0 THEN
        v_utilization := (v_current_items::DECIMAL / v_max_capacity::DECIMAL) * 100;
    ELSE
        v_utilization := 0;
    END IF;
    
    -- Update warehouse utilization
    UPDATE warehouses
    SET 
        current_items = v_current_items,
        current_weight_kg = v_current_weight,
        current_volume_m3 = v_current_volume,
        utilization_percentage = v_utilization,
        updated_at = NOW()
    WHERE id = v_warehouse_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update warehouse utilization when inventory changes
CREATE TRIGGER trigger_calculate_warehouse_utilization
    AFTER INSERT OR UPDATE OR DELETE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_warehouse_utilization();

-- Foreign key constraint will be added after warehouse insertion

-- Enable Row Level Security
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

-- RLS Policies (More permissive for API access)
-- Policy: Allow service role and authenticated users to view warehouses
CREATE POLICY "Allow read access to warehouses" ON warehouses
    FOR SELECT USING (true);

-- Policy: Allow service role and authenticated users to insert warehouses
CREATE POLICY "Allow insert access to warehouses" ON warehouses
    FOR INSERT WITH CHECK (true);

-- Policy: Allow service role and authenticated users to update warehouses
CREATE POLICY "Allow update access to warehouses" ON warehouses
    FOR UPDATE USING (true);

-- Policy: Allow service role and authenticated users to delete empty warehouses
CREATE POLICY "Allow delete access to empty warehouses" ON warehouses
    FOR DELETE USING (
        NOT EXISTS (
            SELECT 1 FROM inventory_items 
            WHERE location_id = warehouses.id AND status = 'active'
        )
    );

-- Create view for warehouse summary with inventory statistics
CREATE OR REPLACE VIEW warehouses_with_stats AS
SELECT 
    w.*,
    -- Inventory summary
    COALESCE(inv_summary.total_inventory_items, 0) as total_inventory_items,
    COALESCE(inv_summary.total_quantity, 0) as total_quantity,
    COALESCE(inv_summary.total_inventory_value, 0) as total_inventory_value,
    COALESCE(inv_summary.unique_products, 0) as unique_products,
    COALESCE(inv_summary.low_stock_items, 0) as low_stock_items,
    COALESCE(inv_summary.out_of_stock_items, 0) as out_of_stock_items,
    
    -- Status calculations
    CASE 
        WHEN w.max_capacity IS NOT NULL AND w.current_items >= w.max_capacity THEN TRUE
        ELSE FALSE
    END as is_at_capacity,
    
    CASE 
        WHEN w.max_capacity IS NOT NULL AND w.utilization_percentage >= 80 THEN TRUE
        ELSE FALSE
    END as is_near_capacity,
    
    -- Calculated utilization if not stored
    CASE 
        WHEN w.max_capacity IS NOT NULL AND w.max_capacity > 0 THEN
            (COALESCE(inv_summary.total_quantity, 0)::DECIMAL / w.max_capacity::DECIMAL) * 100
        ELSE 0
    END as calculated_utilization_percentage

FROM warehouses w
LEFT JOIN (
    SELECT 
        location_id,
        COUNT(*) as total_inventory_items,
        SUM(quantity_on_hand) as total_quantity,
        SUM(quantity_on_hand * unit_cost) as total_inventory_value,
        COUNT(DISTINCT product_id) as unique_products,
        COUNT(*) FILTER (WHERE quantity_available <= min_stock_level AND quantity_available > 0) as low_stock_items,
        COUNT(*) FILTER (WHERE quantity_available <= 0) as out_of_stock_items
    FROM inventory_items
    WHERE status = 'active'
    GROUP BY location_id
) inv_summary ON w.id = inv_summary.location_id;

-- Insert default warehouse (upgrade existing 'main_warehouse' location)
INSERT INTO warehouses (
    id, 
    name, 
    code, 
    description, 
    is_active, 
    is_default,
    supports_receiving,
    supports_shipping,
    supports_returns,
    supports_transfers,
    created_by
) VALUES (
    'main_warehouse',
    'Main Warehouse',
    'MAIN',
    'Primary warehouse location for inventory storage',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    'system'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    is_default = EXCLUDED.is_default,
    updated_at = NOW();

-- Add foreign key constraint to inventory_items (if not exists)
-- Note: This will validate that location_id references a valid warehouse
DO $$
BEGIN
    -- Check if foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_inventory_items_warehouse' 
        AND table_name = 'inventory_items'
    ) THEN
        -- Add foreign key constraint
        ALTER TABLE inventory_items 
        ADD CONSTRAINT fk_inventory_items_warehouse 
        FOREIGN KEY (location_id) REFERENCES warehouses(id);
    END IF;
END $$;

-- Create function to get warehouses with filters
CREATE OR REPLACE FUNCTION get_warehouses(
    p_include_inactive BOOLEAN DEFAULT FALSE,
    p_city VARCHAR DEFAULT NULL,
    p_state VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id VARCHAR,
    name VARCHAR,
    code VARCHAR,
    description TEXT,
    city VARCHAR,
    state VARCHAR,
    is_active BOOLEAN,
    is_default BOOLEAN,
    total_inventory_items BIGINT,
    total_quantity BIGINT,
    utilization_percentage DECIMAL,
    is_at_capacity BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id, w.name, w.code, w.description, w.city, w.state,
        w.is_active, w.is_default,
        w.total_inventory_items, w.total_quantity,
        w.utilization_percentage, w.is_at_capacity
    FROM warehouses_with_stats w
    WHERE 
        (p_include_inactive OR w.is_active = TRUE)
        AND (p_city IS NULL OR w.city ILIKE '%' || p_city || '%')
        AND (p_state IS NULL OR w.state ILIKE '%' || p_state || '%')
    ORDER BY 
        w.is_default DESC,
        w.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get warehouse by ID with stats
CREATE OR REPLACE FUNCTION get_warehouse_by_id(p_warehouse_id VARCHAR)
RETURNS TABLE (
    id VARCHAR,
    name VARCHAR,
    code VARCHAR,
    description TEXT,
    address_line1 VARCHAR,
    address_line2 VARCHAR,
    city VARCHAR,
    state VARCHAR,
    postal_code VARCHAR,
    country VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    manager_name VARCHAR,
    is_active BOOLEAN,
    is_default BOOLEAN,
    max_capacity INTEGER,
    current_items INTEGER,
    utilization_percentage DECIMAL,
    total_inventory_items BIGINT,
    total_quantity BIGINT,
    total_inventory_value DECIMAL,
    unique_products BIGINT,
    low_stock_items BIGINT,
    out_of_stock_items BIGINT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id, w.name, w.code, w.description,
        w.address_line1, w.address_line2, w.city, w.state, w.postal_code, w.country,
        w.phone, w.email, w.manager_name,
        w.is_active, w.is_default,
        w.max_capacity, w.current_items, w.utilization_percentage,
        w.total_inventory_items, w.total_quantity, w.total_inventory_value,
        w.unique_products, w.low_stock_items, w.out_of_stock_items,
        w.created_at, w.updated_at
    FROM warehouses_with_stats w
    WHERE w.id = p_warehouse_id;
END;
$$ LANGUAGE plpgsql;

-- Add table comments for documentation
COMMENT ON TABLE warehouses IS 'Master table for warehouse/location management';
COMMENT ON COLUMN warehouses.id IS 'Unique warehouse identifier (matches location_id in inventory_items)';
COMMENT ON COLUMN warehouses.code IS 'Short code for warehouse reference (e.g., MAIN, WH2)';
COMMENT ON COLUMN warehouses.is_default IS 'Whether this is the default warehouse for new inventory';
COMMENT ON COLUMN warehouses.max_capacity IS 'Maximum number of items that can be stored';
COMMENT ON COLUMN warehouses.utilization_percentage IS 'Current utilization percentage (auto-calculated)';
COMMENT ON COLUMN warehouses.operating_hours IS 'Business hours stored as JSON object';
COMMENT ON COLUMN warehouses.custom_fields IS 'Flexible custom fields for warehouse-specific data';

-- Update inventory items to ensure they have valid warehouse references
-- This will update the location_name field to match the warehouse name
UPDATE inventory_items 
SET location_name = (
    SELECT name 
    FROM warehouses 
    WHERE warehouses.id = inventory_items.location_id
)
WHERE EXISTS (
    SELECT 1 
    FROM warehouses 
    WHERE warehouses.id = inventory_items.location_id
);

-- Verify the migration
SELECT 'Warehouses table created successfully!' as status;
SELECT COUNT(*) as warehouses_created FROM warehouses;
SELECT COUNT(*) as inventory_items_with_valid_warehouses 
FROM inventory_items i 
JOIN warehouses w ON i.location_id = w.id;
