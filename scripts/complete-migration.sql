-- Complete Categories Migration - Run this in Supabase SQL Editor
-- This will create everything needed for the category system

-- Step 1: Drop existing table if any issues and recreate
DROP TABLE IF EXISTS categories CASCADE;
DROP VIEW IF EXISTS category_stats CASCADE;

-- Step 2: Create the complete categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 0,
    path TEXT NOT NULL DEFAULT '',
    image_url TEXT,
    icon VARCHAR(100),
    color VARCHAR(7),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    seo_title VARCHAR(255),
    seo_description TEXT,
    meta_keywords TEXT[],
    product_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_featured ON categories(is_featured);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_created_at ON categories(created_at);

-- Step 4: Create the stats view (REQUIRED for the stats API)
CREATE VIEW category_stats AS
SELECT 
    COUNT(*)::INTEGER as total_categories,
    COUNT(*) FILTER (WHERE is_active = true)::INTEGER as active_categories,
    COUNT(*) FILTER (WHERE is_featured = true)::INTEGER as featured_categories,
    COUNT(*) FILTER (WHERE product_count > 0)::INTEGER as categories_with_products,
    COALESCE(AVG(product_count), 0)::REAL as average_products_per_category,
    COALESCE(MAX(level), 0)::INTEGER as max_depth,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::INTEGER as recent_categories
FROM categories;

-- Step 5: Create function to get category tree (for tree API)
CREATE OR REPLACE FUNCTION get_category_tree()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    slug TEXT,
    parent_id UUID,
    level INTEGER,
    path TEXT,
    image_url TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER,
    is_active BOOLEAN,
    is_featured BOOLEAN,
    product_count INTEGER,
    children_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE category_tree AS (
        -- Base case: root categories
        SELECT 
            c.id, c.name, c.description, c.slug, c.parent_id, c.level, c.path,
            c.image_url, c.icon, c.color, c.sort_order, c.is_active, c.is_featured,
            c.product_count,
            (SELECT COUNT(*)::INTEGER FROM categories child WHERE child.parent_id = c.id) as children_count
        FROM categories c
        WHERE c.parent_id IS NULL
        
        UNION ALL
        
        -- Recursive case: child categories
        SELECT 
            c.id, c.name, c.description, c.slug, c.parent_id, c.level, c.path,
            c.image_url, c.icon, c.color, c.sort_order, c.is_active, c.is_featured,
            c.product_count,
            (SELECT COUNT(*)::INTEGER FROM categories child WHERE child.parent_id = c.id) as children_count
        FROM categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
    )
    SELECT * FROM category_tree
    ORDER BY level, sort_order, name;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policies for categories
-- Allow read access to all users
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Categories are editable by everyone" ON categories
    FOR ALL USING (true);

-- Step 8: Test the setup by inserting a sample category
INSERT INTO categories (name, slug, description, sort_order, is_active, is_featured, path) VALUES
('Electronics', 'electronics', 'Electronic devices and gadgets', 1, true, true, 'Electronics');

-- Verify everything works
SELECT 'Migration completed successfully!' as status;
SELECT * FROM category_stats;
SELECT * FROM categories;
