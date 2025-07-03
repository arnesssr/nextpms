-- Diagnostic script to check category relationships

-- 1. Check all products and their category relationships
SELECT 
    p.id,
    p.name as product_name,
    p.category_id,
    c.id as actual_category_id,
    c.name as category_name,
    c.slug as category_slug,
    CASE 
        WHEN c.id IS NULL THEN 'MISSING CATEGORY'
        WHEN p.category_id = c.id THEN 'VALID RELATIONSHIP'
        ELSE 'MISMATCH'
    END as relationship_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 2. Check for products with invalid category_id
SELECT 
    COUNT(*) as total_products,
    COUNT(c.id) as products_with_valid_categories,
    COUNT(*) - COUNT(c.id) as products_with_invalid_categories
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- 3. List all available categories
SELECT 
    id,
    name,
    slug,
    parent_id,
    product_count,
    created_at
FROM categories
ORDER BY name;

-- 4. Test the RPC function specifically
SELECT 
    id,
    name,
    category_id,
    category_name,
    category_path
FROM get_products_with_categories(5, 0, NULL, NULL, NULL)
ORDER BY created_at DESC;
