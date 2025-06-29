-- Fix for the get_products_with_categories function
-- This resolves the PostgreSQL type mismatch error

CREATE OR REPLACE FUNCTION get_products_with_categories(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_category_id UUID DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),                    -- Changed from TEXT to VARCHAR(255)
    description TEXT,
    slug VARCHAR(255),                    -- Changed from TEXT to VARCHAR(255)
    category_id UUID,
    category_name VARCHAR(255),           -- Changed from TEXT to VARCHAR(255)
    category_path VARCHAR(255),           -- Changed from TEXT to VARCHAR(255)
    sku VARCHAR(100),                     -- Changed from TEXT to VARCHAR(100)
    base_price DECIMAL(12,2),             -- Added precision
    selling_price DECIMAL(12,2),          -- Added precision
    stock_quantity INTEGER,
    status VARCHAR(20),                   -- Changed from TEXT to VARCHAR(20)
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
        COALESCE(c.name, 'Unknown Category'::VARCHAR(255)) as category_name, 
        COALESCE(c.path, 'unknown'::VARCHAR(255)) as category_path,
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

-- Test the function to make sure it works
SELECT 'Function updated successfully!' as status;
SELECT * FROM get_products_with_categories(5, 0, NULL, NULL, NULL);
