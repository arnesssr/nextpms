-- Diagnostic script to check product and category relationship issues

-- 1. Check products with invalid or missing categories
SELECT 
    p.id,
    p.name,
    p.category_id,
    p.status,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE c.id IS NULL;

-- 2. Check categories and their product counts
SELECT 
    c.id,
    c.name,
    c.product_count as stored_count,
    COUNT(p.id) as actual_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.status = 'published' AND p.is_active = true
GROUP BY c.id, c.name, c.product_count
ORDER BY c.name;

-- 3. Check products status distribution
SELECT 
    status,
    COUNT(*) as count
FROM products
GROUP BY status
ORDER BY status;

-- 4. Check products with null values in required fields
SELECT 
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE status IS NULL) as null_status,
    COUNT(*) FILTER (WHERE is_active IS NULL) as null_is_active,
    COUNT(*) FILTER (WHERE is_featured IS NULL) as null_is_featured,
    COUNT(*) FILTER (WHERE track_inventory IS NULL) as null_track_inventory
FROM products;

-- 5. Test the RPC function
SELECT 
    id,
    name,
    category_name,
    status,
    is_active
FROM get_products_with_categories(20, 0, NULL, NULL, NULL)
LIMIT 5;
