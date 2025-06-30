-- Fix products with invalid category references

-- 1. First, let's see what categories we have available
SELECT 
    id,
    name,
    slug,
    path,
    parent_id,
    created_at
FROM categories
ORDER BY name;

-- 2. Check products with invalid category_id
SELECT 
    p.id,
    p.name as product_name,
    p.category_id,
    c.name as category_name,
    CASE 
        WHEN c.id IS NULL THEN 'INVALID CATEGORY'
        ELSE 'VALID'
    END as status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE c.id IS NULL;

-- 3. If you have a default category, update products with invalid category_id
-- Replace 'DEFAULT_CATEGORY_ID' with your actual default category ID

-- To get the first available category ID (run this first to get the ID):
-- SELECT id FROM categories ORDER BY created_at LIMIT 1;

-- Then update products with invalid categories (uncomment and replace with actual category ID):
/*
UPDATE products 
SET category_id = 'YOUR_DEFAULT_CATEGORY_ID_HERE'
WHERE category_id IS NULL 
   OR category_id NOT IN (SELECT id FROM categories);
*/

-- 4. Alternative: Create a default "General" category if none exists
INSERT INTO categories (name, slug, path, description)
SELECT 'General', 'general', '/general', 'Default category for uncategorized products'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'general');

-- 5. Update products with invalid categories to use the "General" category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'general' LIMIT 1)
WHERE category_id IS NULL 
   OR category_id NOT IN (SELECT id FROM categories);

-- 6. Verify the fix
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN c.id IS NOT NULL THEN 1 END) as products_with_valid_categories,
    COUNT(CASE WHEN c.id IS NULL THEN 1 END) as products_with_invalid_categories
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- 7. Test the RPC function again
SELECT 
    id,
    name,
    category_id,
    category_name,
    category_path,
    status
FROM get_products_with_categories(10, 0, NULL, NULL, NULL)
ORDER BY created_at DESC;
