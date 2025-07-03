-- Migration: Create stock_locations table
-- Created: 2024-12-30
-- Description: Manage warehouse locations and storage areas for inventory

-- Create stock_locations table
CREATE TABLE IF NOT EXISTS stock_locations (
    id VARCHAR(50) PRIMARY KEY, -- Custom ID like 'main_warehouse', 'storage_a1', etc.
    
    -- Location identification
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL, -- Short code for quick reference
    barcode VARCHAR(100) UNIQUE, -- Barcode for location scanning
    
    -- Location hierarchy
    parent_location_id VARCHAR(50) REFERENCES stock_locations(id) ON DELETE SET NULL,
    location_type VARCHAR(30) NOT NULL DEFAULT 'warehouse', -- warehouse, zone, aisle, shelf, bin
    level INTEGER NOT NULL DEFAULT 1, -- Hierarchy level (1=warehouse, 2=zone, 3=aisle, etc.)
    path TEXT, -- Full path like 'Main Warehouse > Zone A > Aisle 1 > Shelf 2'
    
    -- Physical properties
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_pickable BOOLEAN NOT NULL DEFAULT TRUE, -- Can items be picked from this location
    is_receivable BOOLEAN NOT NULL DEFAULT TRUE, -- Can items be received to this location
    is_bulk_location BOOLEAN NOT NULL DEFAULT FALSE, -- For bulk storage
    is_temperature_controlled BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Capacity and constraints
    max_capacity INTEGER, -- Maximum units that can be stored
    max_weight_kg DECIMAL(10,2), -- Maximum weight in kg
    max_volume_m3 DECIMAL(10,3), -- Maximum volume in cubic meters
    current_utilization_pct DECIMAL(5,2) DEFAULT 0, -- Current utilization percentage
    
    -- Temperature requirements
    min_temperature_c DECIMAL(5,2), -- Minimum temperature in Celsius
    max_temperature_c DECIMAL(5,2), -- Maximum temperature in Celsius
    humidity_controlled BOOLEAN NOT NULL DEFAULT FALSE,
    min_humidity_pct DECIMAL(5,2), -- Minimum humidity percentage
    max_humidity_pct DECIMAL(5,2), -- Maximum humidity percentage
    
    -- Location properties
    is_hazmat_approved BOOLEAN NOT NULL DEFAULT FALSE, -- Approved for hazardous materials
    is_quarantine_location BOOLEAN NOT NULL DEFAULT FALSE, -- For quarantined items
    is_returns_location BOOLEAN NOT NULL DEFAULT FALSE, -- For returned items
    is_staging_location BOOLEAN NOT NULL DEFAULT FALSE, -- For staging/preparation
    
    -- Physical address/coordinates
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    
    -- Warehouse coordinates (for navigation)
    coordinate_x DECIMAL(10,3), -- X coordinate within warehouse
    coordinate_y DECIMAL(10,3), -- Y coordinate within warehouse
    coordinate_z DECIMAL(10,3), -- Z coordinate (height/level)
    
    -- Pick sequence and routing
    pick_sequence INTEGER, -- Order for picking routes
    zone_id VARCHAR(50), -- Zone assignment for picking
    pick_method VARCHAR(20) DEFAULT 'manual', -- manual, automated, conveyor
    
    -- Equipment and restrictions
    equipment_required TEXT[], -- Array of required equipment
    access_restrictions TEXT[], -- Array of access restrictions
    storage_types TEXT[], -- Array of allowed storage types
    
    -- Contact and management
    location_manager VARCHAR(255), -- Person responsible for this location
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- Operational hours
    operating_hours_start TIME,
    operating_hours_end TIME,
    operating_days INTEGER[], -- Array of weekdays (1=Monday, 7=Sunday)
    
    -- Additional metadata
    description TEXT,
    notes TEXT,
    tags TEXT[], -- Array of tags for categorization
    custom_fields JSONB, -- Flexible custom fields
    
    -- Audit fields
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_location_type CHECK (
        location_type IN ('warehouse', 'zone', 'aisle', 'shelf', 'bin', 'rack', 'floor', 'dock', 'staging', 'quarantine', 'returns')
    ),
    CONSTRAINT valid_level CHECK (level >= 1 AND level <= 10),
    CONSTRAINT valid_capacity CHECK (max_capacity IS NULL OR max_capacity > 0),
    CONSTRAINT valid_weight CHECK (max_weight_kg IS NULL OR max_weight_kg > 0),
    CONSTRAINT valid_volume CHECK (max_volume_m3 IS NULL OR max_volume_m3 > 0),
    CONSTRAINT valid_utilization CHECK (current_utilization_pct >= 0 AND current_utilization_pct <= 100),
    CONSTRAINT valid_temperature_range CHECK (
        (min_temperature_c IS NULL AND max_temperature_c IS NULL) OR
        (min_temperature_c IS NOT NULL AND max_temperature_c IS NOT NULL AND min_temperature_c <= max_temperature_c)
    ),
    CONSTRAINT valid_humidity_range CHECK (
        (min_humidity_pct IS NULL AND max_humidity_pct IS NULL) OR
        (min_humidity_pct IS NOT NULL AND max_humidity_pct IS NOT NULL AND min_humidity_pct <= max_humidity_pct AND min_humidity_pct >= 0 AND max_humidity_pct <= 100)
    ),
    CONSTRAINT valid_coordinates CHECK (
        (coordinate_x IS NULL AND coordinate_y IS NULL AND coordinate_z IS NULL) OR
        (coordinate_x IS NOT NULL AND coordinate_y IS NOT NULL)
    ),
    CONSTRAINT valid_pick_method CHECK (
        pick_method IN ('manual', 'automated', 'conveyor', 'robot', 'drone')
    ),
    CONSTRAINT valid_operating_hours CHECK (
        (operating_hours_start IS NULL AND operating_hours_end IS NULL) OR
        (operating_hours_start IS NOT NULL AND operating_hours_end IS NOT NULL)
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_locations_parent_id ON stock_locations(parent_location_id);
CREATE INDEX IF NOT EXISTS idx_stock_locations_type ON stock_locations(location_type);
CREATE INDEX IF NOT EXISTS idx_stock_locations_level ON stock_locations(level);
CREATE INDEX IF NOT EXISTS idx_stock_locations_code ON stock_locations(code);
CREATE INDEX IF NOT EXISTS idx_stock_locations_zone ON stock_locations(zone_id) WHERE zone_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_locations_pick_sequence ON stock_locations(pick_sequence) WHERE pick_sequence IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_locations_coordinates ON stock_locations(coordinate_x, coordinate_y) WHERE coordinate_x IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_locations_barcode ON stock_locations(barcode) WHERE barcode IS NOT NULL;

-- Partial indexes for active locations
CREATE INDEX IF NOT EXISTS idx_stock_locations_active ON stock_locations(name) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_stock_locations_pickable ON stock_locations(pick_sequence) WHERE is_active = TRUE AND is_pickable = TRUE;
CREATE INDEX IF NOT EXISTS idx_stock_locations_receivable ON stock_locations(created_at) WHERE is_active = TRUE AND is_receivable = TRUE;

-- GIN indexes for array columns
CREATE INDEX IF NOT EXISTS idx_stock_locations_equipment_gin ON stock_locations USING GIN(equipment_required) WHERE equipment_required IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_locations_restrictions_gin ON stock_locations USING GIN(access_restrictions) WHERE access_restrictions IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_locations_storage_types_gin ON stock_locations USING GIN(storage_types) WHERE storage_types IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_locations_tags_gin ON stock_locations USING GIN(tags) WHERE tags IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_locations_custom_fields_gin ON stock_locations USING GIN(custom_fields) WHERE custom_fields IS NOT NULL;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stock_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = COALESCE(NEW.updated_by, NEW.created_by);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_update_stock_locations_updated_at
    BEFORE UPDATE ON stock_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_locations_updated_at();

-- Function to update location path when hierarchy changes
CREATE OR REPLACE FUNCTION update_location_path()
RETURNS TRIGGER AS $$
DECLARE
    v_path TEXT;
    v_parent_path TEXT;
BEGIN
    -- Get parent path if parent exists
    IF NEW.parent_location_id IS NOT NULL THEN
        SELECT path INTO v_parent_path
        FROM stock_locations
        WHERE id = NEW.parent_location_id;
        
        IF v_parent_path IS NOT NULL THEN
            v_path := v_parent_path || ' > ' || NEW.name;
        ELSE
            v_path := NEW.name;
        END IF;
    ELSE
        v_path := NEW.name;
    END IF;
    
    -- Update the path
    NEW.path = v_path;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update path automatically
CREATE TRIGGER trigger_update_location_path
    BEFORE INSERT OR UPDATE ON stock_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_location_path();

-- Function to update utilization percentage
CREATE OR REPLACE FUNCTION update_location_utilization()
RETURNS TRIGGER AS $$
DECLARE
    v_location_id TEXT;
    v_total_quantity INTEGER;
    v_max_capacity INTEGER;
    v_utilization DECIMAL(5,2);
BEGIN
    -- Determine which location to update
    IF TG_OP = 'DELETE' THEN
        v_location_id := OLD.location_id;
    ELSE
        v_location_id := NEW.location_id;
    END IF;
    
    -- Get total quantity and max capacity for the location
    SELECT 
        COALESCE(SUM(ii.quantity_on_hand), 0),
        sl.max_capacity
    INTO v_total_quantity, v_max_capacity
    FROM stock_locations sl
    LEFT JOIN inventory_items ii ON sl.id = ii.location_id AND ii.status = 'active'
    WHERE sl.id = v_location_id
    GROUP BY sl.max_capacity;
    
    -- Calculate utilization percentage
    IF v_max_capacity IS NOT NULL AND v_max_capacity > 0 THEN
        v_utilization := (v_total_quantity::DECIMAL / v_max_capacity::DECIMAL) * 100;
    ELSE
        v_utilization := 0;
    END IF;
    
    -- Update the location utilization
    UPDATE stock_locations
    SET current_utilization_pct = v_utilization
    WHERE id = v_location_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update utilization when inventory changes
CREATE TRIGGER trigger_update_location_utilization
    AFTER INSERT OR UPDATE OR DELETE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_location_utilization();

-- Enable Row Level Security
ALTER TABLE stock_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Authenticated users can view stock locations
CREATE POLICY "Authenticated users can view stock locations" ON stock_locations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert stock locations
CREATE POLICY "Authenticated users can insert stock locations" ON stock_locations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update stock locations
CREATE POLICY "Authenticated users can update stock locations" ON stock_locations
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete stock locations (only if no inventory)
CREATE POLICY "Authenticated users can delete empty stock locations" ON stock_locations
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        NOT EXISTS (
            SELECT 1 FROM inventory_items 
            WHERE location_id = stock_locations.id AND status = 'active'
        )
    );

-- Create view for location hierarchy
CREATE OR REPLACE VIEW stock_locations_hierarchy AS
WITH RECURSIVE location_tree AS (
    -- Base case: root locations (no parent)
    SELECT 
        id, name, code, parent_location_id, location_type, level, path,
        is_active, is_pickable, is_receivable,
        ARRAY[id]::VARCHAR[] as ancestors,
        0 as depth
    FROM stock_locations
    WHERE parent_location_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child locations
    SELECT 
        sl.id, sl.name, sl.code, sl.parent_location_id, sl.location_type, sl.level, sl.path,
        sl.is_active, sl.is_pickable, sl.is_receivable,
        lt.ancestors || sl.id,
        lt.depth + 1
    FROM stock_locations sl
    INNER JOIN location_tree lt ON sl.parent_location_id = lt.id
)
SELECT * FROM location_tree;

-- Create view for locations with inventory summary
CREATE OR REPLACE VIEW stock_locations_with_inventory AS
SELECT 
    sl.*,
    -- Inventory summary
    COALESCE(inv_summary.total_items, 0) as total_inventory_items,
    COALESCE(inv_summary.total_quantity, 0) as total_quantity,
    COALESCE(inv_summary.total_value, 0) as total_inventory_value,
    COALESCE(inv_summary.unique_products, 0) as unique_products,
    -- Utilization calculation
    CASE 
        WHEN sl.max_capacity IS NOT NULL AND sl.max_capacity > 0 THEN
            (COALESCE(inv_summary.total_quantity, 0)::DECIMAL / sl.max_capacity::DECIMAL) * 100
        ELSE 0
    END as calculated_utilization_pct,
    -- Status indicators
    CASE 
        WHEN sl.max_capacity IS NOT NULL AND COALESCE(inv_summary.total_quantity, 0) >= sl.max_capacity THEN TRUE
        ELSE FALSE
    END as is_at_capacity,
    CASE 
        WHEN sl.max_capacity IS NOT NULL AND (COALESCE(inv_summary.total_quantity, 0)::DECIMAL / sl.max_capacity::DECIMAL) > 0.8 THEN TRUE
        ELSE FALSE
    END as is_near_capacity
FROM stock_locations sl
LEFT JOIN (
    SELECT 
        location_id,
        COUNT(*) as total_items,
        SUM(quantity_on_hand) as total_quantity,
        SUM(quantity_on_hand * unit_cost) as total_value,
        COUNT(DISTINCT product_id) as unique_products
    FROM inventory_items
    WHERE status = 'active'
    GROUP BY location_id
) inv_summary ON sl.id = inv_summary.location_id;

-- Function to get child locations
CREATE OR REPLACE FUNCTION get_child_locations(
    p_parent_id VARCHAR(50) DEFAULT NULL,
    p_include_inactive BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id VARCHAR,
    name VARCHAR,
    code VARCHAR,
    location_type VARCHAR,
    level INTEGER,
    path TEXT,
    is_active BOOLEAN,
    total_items INTEGER,
    total_quantity INTEGER,
    utilization_pct DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sl.id, sl.name, sl.code, sl.location_type, sl.level, sl.path,
        sl.is_active,
        COALESCE(inv_summary.total_items, 0)::INTEGER as total_items,
        COALESCE(inv_summary.total_quantity, 0)::INTEGER as total_quantity,
        sl.current_utilization_pct as utilization_pct
    FROM stock_locations sl
    LEFT JOIN (
        SELECT 
            location_id,
            COUNT(*)::INTEGER as total_items,
            SUM(quantity_on_hand)::INTEGER as total_quantity
        FROM inventory_items
        WHERE status = 'active'
        GROUP BY location_id
    ) inv_summary ON sl.id = inv_summary.location_id
    WHERE 
        (p_parent_id IS NULL OR sl.parent_location_id = p_parent_id)
        AND (p_include_inactive OR sl.is_active = TRUE)
    ORDER BY 
        sl.location_type, sl.pick_sequence, sl.name;
END;
$$ LANGUAGE plpgsql;

-- Function to find optimal pick path
CREATE OR REPLACE FUNCTION get_pick_path(
    p_location_ids VARCHAR(50)[]
)
RETURNS TABLE (
    location_id VARCHAR,
    name VARCHAR,
    coordinate_x DECIMAL,
    coordinate_y DECIMAL,
    pick_sequence INTEGER,
    zone_id VARCHAR,
    optimal_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sl.id, sl.name, sl.coordinate_x, sl.coordinate_y, sl.pick_sequence, sl.zone_id,
        ROW_NUMBER() OVER (
            ORDER BY 
                sl.zone_id,
                sl.pick_sequence,
                sl.coordinate_x,
                sl.coordinate_y
        )::INTEGER as optimal_order
    FROM stock_locations sl
    WHERE sl.id = ANY(p_location_ids)
    AND sl.is_active = TRUE
    AND sl.is_pickable = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Insert default locations
INSERT INTO stock_locations (
    id, name, code, location_type, level, is_active, is_pickable, is_receivable,
    description, created_by
) VALUES 
    ('main_warehouse', 'Main Warehouse', 'MAIN', 'warehouse', 1, TRUE, TRUE, TRUE, 'Primary warehouse location', 'system'),
    ('staging_area', 'Staging Area', 'STAGE', 'staging', 1, TRUE, FALSE, TRUE, 'Staging area for incoming/outgoing items', 'system'),
    ('returns_area', 'Returns Area', 'RETURNS', 'returns', 1, TRUE, TRUE, TRUE, 'Area for returned items processing', 'system'),
    ('quarantine_area', 'Quarantine Area', 'QUAR', 'quarantine', 1, TRUE, FALSE, FALSE, 'Quarantine area for inspection', 'system')
ON CONFLICT (id) DO NOTHING;

-- Add table comments for documentation
COMMENT ON TABLE stock_locations IS 'Master table for all warehouse locations and storage areas';
COMMENT ON COLUMN stock_locations.id IS 'Unique location identifier (can be custom like main_warehouse)';
COMMENT ON COLUMN stock_locations.code IS 'Short code for location reference';
COMMENT ON COLUMN stock_locations.location_type IS 'Type of location (warehouse, zone, aisle, shelf, bin, etc.)';
COMMENT ON COLUMN stock_locations.level IS 'Hierarchy level (1=warehouse, 2=zone, 3=aisle, etc.)';
COMMENT ON COLUMN stock_locations.path IS 'Full hierarchical path for easy navigation';
COMMENT ON COLUMN stock_locations.is_pickable IS 'Whether items can be picked from this location';
COMMENT ON COLUMN stock_locations.is_receivable IS 'Whether items can be received to this location';
COMMENT ON COLUMN stock_locations.max_capacity IS 'Maximum units that can be stored';
COMMENT ON COLUMN stock_locations.current_utilization_pct IS 'Current utilization percentage';
COMMENT ON COLUMN stock_locations.pick_sequence IS 'Order for picking routes optimization';
COMMENT ON COLUMN stock_locations.coordinate_x IS 'X coordinate within warehouse for navigation';
COMMENT ON COLUMN stock_locations.coordinate_y IS 'Y coordinate within warehouse for navigation';

-- Verify the migration
SELECT 'Stock locations table created successfully!' as status;
