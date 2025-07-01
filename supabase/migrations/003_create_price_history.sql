-- Migration: Create price_history table for tracking price changes
-- Run this in your Supabase SQL Editor

-- Step 1: Create price_history table
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Product relationship (REQUIRED)
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Price change details
    old_price DECIMAL(12,2) NOT NULL,
    new_price DECIMAL(12,2) NOT NULL,
    price_difference DECIMAL(12,2) GENERATED ALWAYS AS (new_price - old_price) STORED,
    percentage_change DECIMAL(8,4) GENERATED ALWAYS AS (
        CASE 
            WHEN old_price = 0 THEN NULL 
            ELSE ((new_price - old_price) / old_price) * 100 
        END
    ) STORED,
    
    -- Change context
    change_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- manual, bulk_update, import, discount, promotion, etc.
    change_reason TEXT, -- Optional reason for the change
    change_source VARCHAR(100), -- e.g., 'dashboard', 'bulk_update', 'api', 'import'
    
    -- Additional context data (JSON for flexibility)
    metadata JSONB DEFAULT '{}', -- Can store bulk operation ID, discount details, etc.
    
    -- Audit fields
    changed_by UUID, -- User who made the change (can be NULL for system changes)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_prices CHECK (old_price >= 0 AND new_price >= 0),
    CONSTRAINT valid_change_type CHECK (change_type IN (
        'manual', 'bulk_update', 'import', 'discount', 'promotion', 
        'cost_adjustment', 'market_adjustment', 'system_auto'
    ))
);

-- Step 2: Create indexes for performance
CREATE INDEX idx_price_history_product_id ON price_history(product_id);
CREATE INDEX idx_price_history_created_at ON price_history(created_at);
CREATE INDEX idx_price_history_change_type ON price_history(change_type);
CREATE INDEX idx_price_history_changed_by ON price_history(changed_by);

-- Composite index for common queries (recent changes for a product)
CREATE INDEX idx_price_history_product_date ON price_history(product_id, created_at DESC);

-- Step 3: Create function to automatically log price changes
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if selling_price actually changed
    IF OLD.selling_price != NEW.selling_price THEN
        INSERT INTO price_history (
            product_id,
            old_price,
            new_price,
            change_type,
            change_reason,
            change_source,
            metadata,
            changed_by
        ) VALUES (
            NEW.id,
            OLD.selling_price,
            NEW.selling_price,
            COALESCE(NEW.price_change_type, 'manual'), -- Use product's metadata if available
            NEW.price_change_reason, -- Use product's metadata if available
            COALESCE(NEW.price_change_source, 'dashboard'),
            CASE 
                WHEN NEW.price_change_metadata IS NOT NULL THEN NEW.price_change_metadata
                ELSE '{}'::jsonb
            END,
            NEW.updated_by -- Assumes we track who updated the product
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to auto-log price changes
CREATE TRIGGER product_price_change_trigger
    AFTER UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION log_price_change();

-- Step 5: Create function to get recent price changes
CREATE OR REPLACE FUNCTION get_recent_price_changes(
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0,
    p_product_id UUID DEFAULT NULL,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    id UUID,
    product_id UUID,
    product_name TEXT,
    product_sku TEXT,
    category_name TEXT,
    old_price DECIMAL,
    new_price DECIMAL,
    price_difference DECIMAL,
    percentage_change DECIMAL,
    change_type TEXT,
    change_reason TEXT,
    change_source TEXT,
    changed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ph.id,
        ph.product_id,
        p.name as product_name,
        p.sku as product_sku,
        c.name as category_name,
        ph.old_price,
        ph.new_price,
        ph.price_difference,
        ph.percentage_change,
        ph.change_type,
        ph.change_reason,
        ph.change_source,
        ph.changed_by,
        ph.created_at
    FROM price_history ph
    INNER JOIN products p ON ph.product_id = p.id
    INNER JOIN categories c ON p.category_id = c.id
    WHERE 
        (p_product_id IS NULL OR ph.product_id = p_product_id)
        AND ph.created_at >= NOW() - INTERVAL '1 day' * p_days
    ORDER BY ph.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create function to get price history stats
CREATE OR REPLACE FUNCTION get_price_history_stats(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_changes INTEGER,
    price_increases INTEGER,
    price_decreases INTEGER,
    avg_increase_percentage DECIMAL,
    avg_decrease_percentage DECIMAL,
    most_changed_product_id UUID,
    most_changed_product_name TEXT,
    most_changed_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total_changes,
            COUNT(*) FILTER (WHERE price_difference > 0) as price_increases,
            COUNT(*) FILTER (WHERE price_difference < 0) as price_decreases,
            AVG(percentage_change) FILTER (WHERE price_difference > 0) as avg_increase_percentage,
            AVG(percentage_change) FILTER (WHERE price_difference < 0) as avg_decrease_percentage
        FROM price_history
        WHERE created_at >= NOW() - INTERVAL '1 day' * p_days
    ),
    most_changed AS (
        SELECT 
            ph.product_id,
            p.name as product_name,
            COUNT(*) as change_count,
            ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rn
        FROM price_history ph
        INNER JOIN products p ON ph.product_id = p.id
        WHERE ph.created_at >= NOW() - INTERVAL '1 day' * p_days
        GROUP BY ph.product_id, p.name
    )
    SELECT 
        s.total_changes::INTEGER,
        s.price_increases::INTEGER,
        s.price_decreases::INTEGER,
        s.avg_increase_percentage::DECIMAL,
        s.avg_decrease_percentage::DECIMAL,
        mc.product_id,
        mc.product_name,
        mc.change_count
    FROM stats s
    LEFT JOIN most_changed mc ON mc.rn = 1;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create function to manually log price changes (for bulk operations)
CREATE OR REPLACE FUNCTION log_bulk_price_change(
    p_product_id UUID,
    p_old_price DECIMAL,
    p_new_price DECIMAL,
    p_change_type VARCHAR DEFAULT 'bulk_update',
    p_change_reason TEXT DEFAULT NULL,
    p_change_source VARCHAR DEFAULT 'bulk_update',
    p_metadata JSONB DEFAULT '{}',
    p_changed_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_record_id UUID;
BEGIN
    INSERT INTO price_history (
        product_id,
        old_price,
        new_price,
        change_type,
        change_reason,
        change_source,
        metadata,
        changed_by
    ) VALUES (
        p_product_id,
        p_old_price,
        p_new_price,
        p_change_type,
        p_change_reason,
        p_change_source,
        p_metadata,
        p_changed_by
    ) RETURNING id INTO new_record_id;
    
    RETURN new_record_id;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create view for easy price history analysis
CREATE OR REPLACE VIEW price_history_analysis AS
SELECT 
    ph.id,
    ph.product_id,
    p.name as product_name,
    p.sku as product_sku,
    c.name as category_name,
    c.path as category_path,
    ph.old_price,
    ph.new_price,
    ph.price_difference,
    ph.percentage_change,
    ph.change_type,
    ph.change_reason,
    ph.change_source,
    ph.metadata,
    ph.changed_by,
    ph.created_at,
    -- Analysis fields
    CASE 
        WHEN ph.price_difference > 0 THEN 'increase'
        WHEN ph.price_difference < 0 THEN 'decrease'
        ELSE 'no_change'
    END as change_direction,
    ABS(ph.percentage_change) as abs_percentage_change,
    -- Current product info
    p.selling_price as current_price,
    p.status as current_status,
    p.is_active as currently_active
FROM price_history ph
INNER JOIN products p ON ph.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id;

-- Step 9: Enable Row Level Security
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Step 10: Create policies for price_history
-- Allow read access to authenticated users
CREATE POLICY "Price history is viewable by authenticated users" ON price_history
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert/update for authenticated users (for manual logging)
CREATE POLICY "Price history is manageable by authenticated users" ON price_history
    FOR ALL USING (auth.role() = 'authenticated');

-- Step 11: Add helpful columns to products table for tracking change context
-- (These are optional and used by the trigger to provide more context)
DO $$
BEGIN
    -- Add columns only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price_change_type') THEN
        ALTER TABLE products ADD COLUMN price_change_type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price_change_reason') THEN
        ALTER TABLE products ADD COLUMN price_change_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price_change_source') THEN
        ALTER TABLE products ADD COLUMN price_change_source VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price_change_metadata') THEN
        ALTER TABLE products ADD COLUMN price_change_metadata JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_by') THEN
        ALTER TABLE products ADD COLUMN updated_by UUID;
    END IF;
END
$$;

-- Verify everything works
SELECT 'Price history migration completed successfully!' as status;

-- Show table structure
\d price_history;

-- Test the stats function
SELECT * FROM get_price_history_stats(30);
