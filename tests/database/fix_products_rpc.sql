-- Fix the get_products_with_categories function to handle categories properly
CREATE OR REPLACE FUNCTION get_products_with_categories(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_category_id UUID DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_search TEXT DEFAULT NULL
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
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.slug,
        p.category_id, 
        COALESCE(c.name, 'Uncategorized') as category_name, 
        COALESCE(c.path, '/uncategorized') as category_path,
        p.sku, 
        p.base_price, 
        p.selling_price, 
        p.stock_quantity,
        p.status, 
        p.is_active, 
        p.is_featured, 
        p.featured_image_url,
        p.created_at, 
        p.updated_at
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 
        (p_category_id IS NULL OR p.category_id = p_category_id)
        AND (p_status IS NULL OR p.status = p_status)
        AND (p_search IS NULL OR (
            p.name ILIKE '%' || p_search || '%' 
            OR p.description ILIKE '%' || p_search || '%'
            OR p.sku ILIKE '%' || p_search || '%'
            OR COALESCE(c.name, '') ILIKE '%' || p_search || '%'
        ))
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Also ensure that all products have a valid status
UPDATE products 
SET status = 'draft' 
WHERE status IS NULL OR status NOT IN ('draft', 'published', 'archived');

-- Make sure all required fields are not null
UPDATE products 
SET 
    is_active = COALESCE(is_active, true),
    is_featured = COALESCE(is_featured, false),
    track_inventory = COALESCE(track_inventory, true),
    discount_percentage = COALESCE(discount_percentage, 0),
    tax_rate = COALESCE(tax_rate, 0),
    min_stock_level = COALESCE(min_stock_level, 0)
WHERE 
    is_active IS NULL 
    OR is_featured IS NULL 
    OR track_inventory IS NULL 
    OR discount_percentage IS NULL 
    OR tax_rate IS NULL 
    OR min_stock_level IS NULL;
