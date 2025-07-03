-- Create stock_locations table for inventory location management
CREATE TABLE stock_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Hierarchical structure
    parent_id UUID REFERENCES stock_locations(id) ON DELETE SET NULL,
    path TEXT, -- Will store the full path like 'WH1/A/A1/A1-01'
    level INTEGER DEFAULT 0,
    
    -- Location type and attributes
    location_type VARCHAR(50) NOT NULL DEFAULT 'bin', -- warehouse, zone, aisle, rack, shelf, bin
    is_active BOOLEAN DEFAULT true,
    is_pickable BOOLEAN DEFAULT true, -- Can items be picked from this location
    is_receivable BOOLEAN DEFAULT true, -- Can items be received into this location
    
    -- Physical attributes
    capacity_volume DECIMAL(10,2), -- cubic units
    capacity_weight DECIMAL(10,2), -- weight units
    current_utilization DECIMAL(5,2) DEFAULT 0, -- percentage
    
    -- Location coordinates/address
    warehouse_zone VARCHAR(50),
    aisle VARCHAR(50),
    rack VARCHAR(50),
    shelf VARCHAR(50),
    bin VARCHAR(50),
    
    -- Operational settings
    cycle_count_frequency INTEGER DEFAULT 90, -- days
    last_cycle_count_date DATE,
    requires_approval BOOLEAN DEFAULT false,
    temperature_controlled BOOLEAN DEFAULT false,
    hazmat_approved BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX idx_stock_locations_parent_id ON stock_locations(parent_id);
CREATE INDEX idx_stock_locations_location_code ON stock_locations(location_code);
CREATE INDEX idx_stock_locations_location_type ON stock_locations(location_type);
CREATE INDEX idx_stock_locations_is_active ON stock_locations(is_active);
CREATE INDEX idx_stock_locations_path ON stock_locations(path);
CREATE INDEX idx_stock_locations_warehouse_zone ON stock_locations(warehouse_zone);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stock_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_locations_updated_at
    BEFORE UPDATE ON stock_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_locations_updated_at();

-- Create function to calculate and update location path
CREATE OR REPLACE FUNCTION update_location_path()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate the full path for the location
    WITH RECURSIVE location_path AS (
        SELECT 
            id, 
            parent_id, 
            location_code,
            location_code AS path_segment,
            0 AS level
        FROM stock_locations 
        WHERE id = NEW.id
        
        UNION ALL
        
        SELECT 
            sl.id, 
            sl.parent_id, 
            sl.location_code,
            sl.location_code || '/' || lp.path_segment AS path_segment,
            lp.level + 1
        FROM stock_locations sl
        INNER JOIN location_path lp ON sl.id = lp.parent_id
    )
    SELECT 
        path_segment,
        level
    INTO NEW.path, NEW.level
    FROM location_path 
    WHERE parent_id IS NULL;
    
    -- Handle case where no parent is found (root location)
    IF NEW.path IS NULL THEN
        NEW.path := NEW.location_code;
        NEW.level := 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location_path
    BEFORE INSERT OR UPDATE ON stock_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_location_path();

-- Create function to update current utilization
CREATE OR REPLACE FUNCTION update_location_utilization()
RETURNS TRIGGER AS $$
BEGIN
    -- This will be called when inventory items are added/removed
    -- Calculate utilization based on inventory items in this location
    UPDATE stock_locations 
    SET current_utilization = (
        SELECT COALESCE(
            (SUM(ii.quantity_on_hand * COALESCE(p.volume, 1)) / 
             NULLIF(capacity_volume, 0)) * 100, 
            0
        )
        FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        WHERE ii.location_id = NEW.location_id
    )
    WHERE id = NEW.location_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert default locations
INSERT INTO stock_locations (location_code, name, description, location_type, is_active, is_pickable, is_receivable) VALUES
('MAIN-WH', 'Main Warehouse', 'Primary warehouse facility', 'warehouse', true, false, true),
('RECEIVING', 'Receiving Area', 'Temporary location for incoming inventory', 'zone', true, false, true),
('SHIPPING', 'Shipping Area', 'Temporary location for outgoing inventory', 'zone', true, true, false),
('RETURNS', 'Returns Area', 'Location for returned items processing', 'zone', true, true, true),
('DAMAGED', 'Damaged Goods', 'Location for damaged inventory', 'zone', true, false, false),
('QC', 'Quality Control', 'Location for items under quality inspection', 'zone', true, false, false);

-- Create RLS policies
ALTER TABLE stock_locations ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read locations
CREATE POLICY "Users can view stock locations" ON stock_locations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for inventory managers to manage locations
CREATE POLICY "Inventory managers can manage stock locations" ON stock_locations
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'inventory_manager' OR 
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'warehouse_manager'
    );

-- Create view for location hierarchy
CREATE OR REPLACE VIEW stock_locations_hierarchy AS
WITH RECURSIVE location_tree AS (
    -- Root locations (no parent)
    SELECT 
        id,
        location_code,
        name,
        description,
        parent_id,
        path,
        level,
        location_type,
        is_active,
        ARRAY[id] as ancestors,
        ARRAY[location_code] as ancestor_codes
    FROM stock_locations 
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Child locations
    SELECT 
        sl.id,
        sl.location_code,
        sl.name,
        sl.description,
        sl.parent_id,
        sl.path,
        sl.level,
        sl.location_type,
        sl.is_active,
        lt.ancestors || sl.id,
        lt.ancestor_codes || sl.location_code
    FROM stock_locations sl
    INNER JOIN location_tree lt ON sl.parent_id = lt.id
)
SELECT 
    id,
    location_code,
    name,
    description,
    parent_id,
    path,
    level,
    location_type,
    is_active,
    ancestors,
    ancestor_codes,
    array_to_string(ancestor_codes, ' > ') as full_path_display
FROM location_tree
ORDER BY path;

-- Create view for location utilization summary
CREATE OR REPLACE VIEW stock_locations_utilization AS
SELECT 
    sl.id,
    sl.location_code,
    sl.name,
    sl.location_type,
    sl.capacity_volume,
    sl.capacity_weight,
    sl.current_utilization,
    COALESCE(inventory_summary.total_items, 0) as total_items,
    COALESCE(inventory_summary.total_value, 0) as total_inventory_value,
    COALESCE(inventory_summary.unique_products, 0) as unique_products
FROM stock_locations sl
LEFT JOIN (
    SELECT 
        location_id,
        COUNT(*) as total_items,
        SUM(quantity_on_hand * unit_cost) as total_value,
        COUNT(DISTINCT product_id) as unique_products
    FROM inventory_items
    WHERE quantity_on_hand > 0
    GROUP BY location_id
) inventory_summary ON sl.id = inventory_summary.location_id
WHERE sl.is_active = true;

-- Add comments for documentation
COMMENT ON TABLE stock_locations IS 'Hierarchical storage locations for inventory management';
COMMENT ON COLUMN stock_locations.path IS 'Full hierarchical path of the location';
COMMENT ON COLUMN stock_locations.level IS 'Depth level in the location hierarchy';
COMMENT ON COLUMN stock_locations.current_utilization IS 'Current space utilization percentage';
COMMENT ON VIEW stock_locations_hierarchy IS 'Recursive view showing complete location hierarchy';
COMMENT ON VIEW stock_locations_utilization IS 'Summary view of location utilization and inventory statistics';
