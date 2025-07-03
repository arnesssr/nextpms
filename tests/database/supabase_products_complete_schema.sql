-- ==================================================================
-- COMPLETE PRODUCTS DATABASE SCHEMA FOR SUPABASE
-- Production-ready, scalable, maintainable, and secure
-- ==================================================================

-- Drop existing function with conflicts
DROP FUNCTION IF EXISTS get_products_with_categories(integer, integer, text, text, text);
DROP FUNCTION IF EXISTS get_products_with_categories(integer, integer, uuid, varchar, text);

-- ==================================================================
-- 1. ENSURE PRODUCTS TABLE HAS ALL REQUIRED FIELDS
-- ==================================================================

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add missing columns with proper defaults
    BEGIN
        ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory_quantity INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE products ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END;
END $$;

-- ==================================================================
-- 2. UPDATE EXISTING DATA TO ENSURE CONSISTENCY
-- ==================================================================

-- Sync inventory_quantity with stock_quantity if different
UPDATE products 
SET inventory_quantity = stock_quantity 
WHERE inventory_quantity IS NULL OR inventory_quantity != stock_quantity;

-- Ensure all products have valid status
UPDATE products 
SET status = 'draft' 
WHERE status IS NULL OR status NOT IN ('draft', 'published', 'archived');

-- Ensure all required boolean fields have values
UPDATE products 
SET 
    is_active = COALESCE(is_active, true),
    is_featured = COALESCE(is_featured, false),
    track_inventory = COALESCE(track_inventory, true),
    is_digital = COALESCE(is_digital, false),
    requires_shipping = COALESCE(requires_shipping, true)
WHERE 
    is_active IS NULL 
    OR is_featured IS NULL 
    OR track_inventory IS NULL 
    OR is_digital IS NULL 
    OR requires_shipping IS NULL;

-- Ensure all numeric fields have proper defaults
UPDATE products 
SET 
    discount_percentage = COALESCE(discount_percentage, 0),
    tax_rate = COALESCE(tax_rate, 0),
    min_stock_level = COALESCE(min_stock_level, 0),
    average_rating = COALESCE(average_rating, 0),
    review_count = COALESCE(review_count, 0),
    total_sales = COALESCE(total_sales, 0),
    revenue_generated = COALESCE(revenue_generated, 0),
    sort_order = COALESCE(sort_order, 0)
WHERE 
    discount_percentage IS NULL 
    OR tax_rate IS NULL 
    OR min_stock_level IS NULL 
    OR average_rating IS NULL 
    OR review_count IS NULL 
    OR total_sales IS NULL 
    OR revenue_generated IS NULL 
    OR sort_order IS NULL;

-- Set visibility for existing products
UPDATE products 
SET visibility = 'public' 
WHERE visibility IS NULL;

-- ==================================================================
-- 3. ADD INDEXES FOR PERFORMANCE
-- ==================================================================

-- Create indexes for better performance (IF NOT EXISTS equivalent)
DO $$ 
BEGIN
    -- Performance indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_status_active') THEN
        CREATE INDEX idx_products_status_active ON products(status, is_active);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_category_status') THEN
        CREATE INDEX idx_products_category_status ON products(category_id, status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_visibility') THEN
        CREATE INDEX idx_products_visibility ON products(visibility);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_deleted_at') THEN
        CREATE INDEX idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_featured_active') THEN
        CREATE INDEX idx_products_featured_active ON products(is_featured, is_active) WHERE is_featured = true;
    END IF;
    
    -- Full text search index for better search performance
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_fulltext_search') THEN
        CREATE INDEX idx_products_fulltext_search ON products 
        USING gin(to_tsvector('english', 
            COALESCE(name, '') || ' ' || 
            COALESCE(description, '') || ' ' || 
            COALESCE(sku, '') || ' ' || 
            COALESCE(brand, '')
        ));
    END IF;
END $$;

-- ==================================================================
-- 4. UNIFIED PRODUCTS RETRIEVAL FUNCTION
-- ==================================================================

CREATE OR REPLACE FUNCTION get_products_with_categories(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_category_id UUID DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_sort_by VARCHAR DEFAULT 'created_at',
    p_sort_order VARCHAR DEFAULT 'desc',
    p_featured_only BOOLEAN DEFAULT false,
    p_include_inactive BOOLEAN DEFAULT false
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    slug VARCHAR(255),
    category_id UUID,
    category_name VARCHAR(255),
    category_path VARCHAR(255),
    category_slug VARCHAR(255),
    sku VARCHAR(100),
    base_price DECIMAL(12,2),
    selling_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    discount_percentage DECIMAL(5,2),
    stock_quantity INTEGER,
    inventory_quantity INTEGER,
    min_stock_level INTEGER,
    status VARCHAR(20),
    is_active BOOLEAN,
    is_featured BOOLEAN,
    is_digital BOOLEAN,
    featured_image_url TEXT,
    gallery_images TEXT[],
    average_rating DECIMAL(3,2),
    review_count INTEGER,
    total_sales INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_products AS (
        SELECT 
            p.id,
            p.name,
            p.description,
            p.slug,
            p.category_id,
            COALESCE(c.name, 'Uncategorized')::VARCHAR(255) as category_name,
            COALESCE(c.path, '/uncategorized')::VARCHAR(255) as category_path,
            COALESCE(c.slug, 'uncategorized')::VARCHAR(255) as category_slug,
            p.sku,
            p.base_price,
            p.selling_price,
            p.cost_price,
            p.discount_percentage,
            p.stock_quantity,
            COALESCE(p.inventory_quantity, p.stock_quantity) as inventory_quantity,
            p.min_stock_level,
            p.status,
            p.is_active,
            p.is_featured,
            p.is_digital,
            p.featured_image_url,
            p.gallery_images,
            p.average_rating,
            p.review_count,
            p.total_sales,
            p.created_at,
            p.updated_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 
            p.deleted_at IS NULL
            AND (p_include_inactive = true OR p.is_active = true)
            AND (p_category_id IS NULL OR p.category_id = p_category_id)
            AND (p_status IS NULL OR p.status = p_status)
            AND (p_featured_only = false OR p.is_featured = true)
            AND (p_search IS NULL OR (
                p.name ILIKE '%' || p_search || '%' 
                OR p.description ILIKE '%' || p_search || '%'
                OR p.sku ILIKE '%' || p_search || '%'
                OR p.brand ILIKE '%' || p_search || '%'
                OR COALESCE(c.name, '') ILIKE '%' || p_search || '%'
            ))
    ),
    total_count_cte AS (
        SELECT COUNT(*) as total_count FROM filtered_products
    )
    SELECT 
        fp.*,
        tc.total_count
    FROM filtered_products fp
    CROSS JOIN total_count_cte tc
    ORDER BY 
        CASE 
            WHEN p_sort_by = 'name' AND p_sort_order = 'asc' THEN fp.name
            WHEN p_sort_by = 'price' AND p_sort_order = 'asc' THEN fp.selling_price::TEXT
            WHEN p_sort_by = 'stock' AND p_sort_order = 'asc' THEN fp.stock_quantity::TEXT
            WHEN p_sort_by = 'rating' AND p_sort_order = 'asc' THEN fp.average_rating::TEXT
        END ASC,
        CASE 
            WHEN p_sort_by = 'name' AND p_sort_order = 'desc' THEN fp.name
            WHEN p_sort_by = 'price' AND p_sort_order = 'desc' THEN fp.selling_price::TEXT
            WHEN p_sort_by = 'stock' AND p_sort_order = 'desc' THEN fp.stock_quantity::TEXT
            WHEN p_sort_by = 'rating' AND p_sort_order = 'desc' THEN fp.average_rating::TEXT
            WHEN p_sort_by = 'updated_at' THEN fp.updated_at::TEXT
            ELSE fp.created_at::TEXT
        END DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================================
-- 5. PRODUCT STATISTICS FUNCTION
-- ==================================================================

CREATE OR REPLACE FUNCTION get_product_statistics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_products', COUNT(*),
        'published_products', COUNT(*) FILTER (WHERE status = 'published' AND is_active = true),
        'draft_products', COUNT(*) FILTER (WHERE status = 'draft'),
        'archived_products', COUNT(*) FILTER (WHERE status = 'archived'),
        'featured_products', COUNT(*) FILTER (WHERE is_featured = true AND is_active = true),
        'low_stock_products', COUNT(*) FILTER (WHERE stock_quantity <= min_stock_level AND track_inventory = true),
        'out_of_stock_products', COUNT(*) FILTER (WHERE stock_quantity = 0 AND track_inventory = true),
        'average_price', ROUND(AVG(selling_price)::numeric, 2),
        'total_inventory_value', ROUND(SUM(selling_price * stock_quantity)::numeric, 2),
        'total_revenue', ROUND(SUM(revenue_generated)::numeric, 2),
        'last_updated', NOW()
    )
    INTO result
    FROM products
    WHERE deleted_at IS NULL;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================================
-- 6. CATEGORY PRODUCT COUNT UPDATE FUNCTION
-- ==================================================================

CREATE OR REPLACE FUNCTION update_category_product_counts()
RETURNS VOID AS $$
BEGIN
    UPDATE categories 
    SET product_count = (
        SELECT COUNT(*) 
        FROM products 
        WHERE category_id = categories.id 
        AND status = 'published' 
        AND is_active = true 
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================================
-- 7. TRIGGERS FOR MAINTAINING DATA INTEGRITY
-- ==================================================================

-- Function to update category counts when products change
CREATE OR REPLACE FUNCTION maintain_category_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- For INSERT and UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update new category count
        IF NEW.category_id IS NOT NULL THEN
            UPDATE categories 
            SET product_count = (
                SELECT COUNT(*) 
                FROM products 
                WHERE category_id = NEW.category_id 
                AND status = 'published' 
                AND is_active = true 
                AND deleted_at IS NULL
            )
            WHERE id = NEW.category_id;
        END IF;
        
        -- If UPDATE and category changed, update old category count
        IF TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id THEN
            IF OLD.category_id IS NOT NULL THEN
                UPDATE categories 
                SET product_count = (
                    SELECT COUNT(*) 
                    FROM products 
                    WHERE category_id = OLD.category_id 
                    AND status = 'published' 
                    AND is_active = true 
                    AND deleted_at IS NULL
                )
                WHERE id = OLD.category_id;
            END IF;
        END IF;
        
        -- Sync inventory_quantity with stock_quantity
        IF NEW.stock_quantity IS DISTINCT FROM NEW.inventory_quantity THEN
            NEW.inventory_quantity = NEW.stock_quantity;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- For DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.category_id IS NOT NULL THEN
            UPDATE categories 
            SET product_count = (
                SELECT COUNT(*) 
                FROM products 
                WHERE category_id = OLD.category_id 
                AND status = 'published' 
                AND is_active = true 
                AND deleted_at IS NULL
            )
            WHERE id = OLD.category_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS products_category_count_trigger ON products;

-- Create the trigger
CREATE TRIGGER products_category_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION maintain_category_counts();

-- ==================================================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ==================================================================

-- Enable RLS if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public read access for published products" ON products;
DROP POLICY IF EXISTS "Authenticated users full access" ON products;

-- Public can view published, active products
CREATE POLICY "Public read access for published products" 
ON products FOR SELECT 
USING (
    status = 'published' 
    AND is_active = true 
    AND visibility = 'public'
    AND deleted_at IS NULL
);

-- Authenticated users have full access
CREATE POLICY "Authenticated users full access" 
ON products FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==================================================================
-- 9. REFRESH CATEGORY COUNTS AND VERIFY
-- ==================================================================

-- Update all category product counts
SELECT update_category_product_counts();

-- Test the function
SELECT 'Products database schema updated successfully!' as status;

-- Verify the function works
SELECT 
    id, 
    name, 
    category_name, 
    status, 
    is_active,
    stock_quantity,
    total_count
FROM get_products_with_categories(5, 0, NULL, NULL, NULL)
LIMIT 3;

-- Show statistics
SELECT get_product_statistics() as product_stats;
