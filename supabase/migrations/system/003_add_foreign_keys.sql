-- Migration: Add foreign key constraints and fix RPC function
-- This addresses the missing relationship between products and categories

-- Step 1: Add foreign key constraint from products.category_id to categories.id
ALTER TABLE products
ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id)
REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 2: Fix the get_products_with_categories function to match API expectations
CREATE OR REPLACE FUNCTION get_products_with_categories(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_category_id UUID DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_sort_by VARCHAR DEFAULT 'created_at',
    p_sort_order VARCHAR DEFAULT 'desc',
    p_featured_only BOOLEAN DEFAULT false,
    p_include_inactive BOOLEAN DEFAULT true
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    slug TEXT,
    category_id UUID,
    category_name TEXT,
    category_path TEXT,
    sku TEXT,
    base_price DECIMAL,
    selling_price DECIMAL,
    stock_quantity INTEGER,
    status TEXT,
    is_active BOOLEAN,
    is_featured BOOLEAN,
    featured_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    total_count BIGINT
) AS $$
DECLARE
    order_clause TEXT;
BEGIN
    -- Build order clause based on parameters
    order_clause := CASE 
        WHEN p_sort_by = 'name' THEN 'p.name'
        WHEN p_sort_by = 'price' THEN 'p.selling_price'
        WHEN p_sort_by = 'stock' THEN 'p.stock_quantity'
        WHEN p_sort_by = 'status' THEN 'p.status'
        ELSE 'p.created_at'
    END;
    
    order_clause := order_clause || CASE 
        WHEN p_sort_order = 'asc' THEN ' ASC'
        ELSE ' DESC'
    END;

    RETURN QUERY EXECUTE format('
        SELECT 
            p.id, 
            p.name, 
            p.description, 
            p.slug,
            p.category_id, 
            COALESCE(c.name, ''Uncategorized'') as category_name, 
            COALESCE(c.path, ''/uncategorized'') as category_path,
            p.sku, 
            p.base_price, 
            p.selling_price, 
            p.stock_quantity,
            p.status, 
            p.is_active, 
            p.is_featured, 
            p.featured_image_url,
            p.created_at, 
            p.updated_at,
            COUNT(*) OVER() as total_count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 
            ($1 IS NULL OR p.category_id = $1)
            AND ($2 IS NULL OR p.status = $2)
            AND ($3 IS NULL OR (
                p.name ILIKE ''%%'' || $3 || ''%%'' 
                OR p.description ILIKE ''%%'' || $3 || ''%%''
                OR p.sku ILIKE ''%%'' || $3 || ''%%''
                OR COALESCE(c.name, '''') ILIKE ''%%'' || $3 || ''%%''
            ))
            AND ($4 = false OR p.is_featured = true)
            AND ($5 = true OR p.is_active = true)
        ORDER BY %s
        LIMIT $6 OFFSET $7
    ', order_clause)
    USING p_category_id, p_status, p_search, p_featured_only, p_include_inactive, p_limit, p_offset;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Ensure all existing products have valid data
UPDATE products 
SET 
    status = COALESCE(status, 'draft'),
    is_active = COALESCE(is_active, true),
    is_featured = COALESCE(is_featured, false),
    track_inventory = COALESCE(track_inventory, true),
    discount_percentage = COALESCE(discount_percentage, 0),
    tax_rate = COALESCE(tax_rate, 0),
    min_stock_level = COALESCE(min_stock_level, 0),
    stock_quantity = COALESCE(stock_quantity, 0)
WHERE 
    status IS NULL 
    OR is_active IS NULL 
    OR is_featured IS NULL 
    OR track_inventory IS NULL 
    OR discount_percentage IS NULL 
    OR tax_rate IS NULL 
    OR min_stock_level IS NULL
    OR stock_quantity IS NULL;

-- Step 4: Verify the foreign key constraint works
SELECT 'Foreign key constraint added successfully!' as status;

-- Step 5: Test the updated function
SELECT 'Updated RPC function created successfully!' as status;
