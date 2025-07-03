-- Migration: Create categories table and related structures
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security (RLS)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 0,
    path TEXT NOT NULL,
    image_url TEXT,
    icon VARCHAR(100),
    color VARCHAR(7), -- Hex color code like #FF5733
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    
    -- SEO fields
    seo_title VARCHAR(255),
    seo_description TEXT,
    meta_keywords TEXT[], -- Array of keywords
    
    -- Product count (denormalized for performance)
    product_count INTEGER NOT NULL DEFAULT 0,
    
    -- Audit fields
    created_by UUID, -- Will reference users table later
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_level CHECK (level >= 0 AND level <= 5),
    CONSTRAINT valid_sort_order CHECK (sort_order >= 0),
    CONSTRAINT valid_product_count CHECK (product_count >= 0),
    CONSTRAINT valid_color CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(is_featured);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_categories_search ON categories 
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate category level based on parent hierarchy
CREATE OR REPLACE FUNCTION calculate_category_level(p_parent_id UUID)
RETURNS INTEGER AS $$
DECLARE
    parent_level INTEGER;
BEGIN
    IF p_parent_id IS NULL THEN
        RETURN 0;
    END IF;
    
    SELECT level INTO parent_level 
    FROM categories 
    WHERE id = p_parent_id;
    
    IF parent_level IS NULL THEN
        RETURN 0;
    END IF;
    
    RETURN parent_level + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to build category path
CREATE OR REPLACE FUNCTION build_category_path(p_category_id UUID)
RETURNS TEXT AS $$
DECLARE
    path_parts TEXT[];
    current_id UUID;
    current_name TEXT;
BEGIN
    current_id := p_category_id;
    path_parts := ARRAY[]::TEXT[];
    
    -- Build path from child to root
    WHILE current_id IS NOT NULL LOOP
        SELECT name, parent_id INTO current_name, current_id 
        FROM categories 
        WHERE id = current_id;
        
        IF current_name IS NOT NULL THEN
            path_parts := array_prepend(current_name, path_parts);
        END IF;
    END LOOP;
    
    RETURN array_to_string(path_parts, ' > ');
END;
$$ LANGUAGE plpgsql;

-- Function to update product count for a category
CREATE OR REPLACE FUNCTION update_category_product_count(p_category_id UUID)
RETURNS VOID AS $$
BEGIN
    -- This will be implemented when we create the products table
    -- For now, we'll just ensure the function exists
    UPDATE categories 
    SET product_count = 0 
    WHERE id = p_category_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to automatically set level and path on insert/update
CREATE OR REPLACE FUNCTION set_category_level_and_path()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate level
    NEW.level := calculate_category_level(NEW.parent_id);
    
    -- Prevent infinite recursion (max 5 levels)
    IF NEW.level > 5 THEN
        RAISE EXCEPTION 'Category hierarchy cannot exceed 5 levels';
    END IF;
    
    -- Build path (we'll update this after insert because we need the ID)
    IF NEW.parent_id IS NULL THEN
        NEW.path := NEW.name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set level before insert/update
CREATE TRIGGER set_category_level_and_path_trigger
    BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION set_category_level_and_path();

-- Trigger function to update path after insert
CREATE OR REPLACE FUNCTION update_category_path_after_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the path now that we have the ID
    UPDATE categories 
    SET path = build_category_path(NEW.id)
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update path after insert
CREATE TRIGGER update_category_path_after_insert_trigger
    AFTER INSERT ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_category_path_after_insert();

-- Function to get category tree structure
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

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
-- Allow read access to all users
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

-- Allow authenticated users to insert categories
CREATE POLICY "Authenticated users can insert categories" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update categories
CREATE POLICY "Authenticated users can update categories" ON categories
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete categories
CREATE POLICY "Authenticated users can delete categories" ON categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create a view for category statistics
CREATE OR REPLACE VIEW category_stats AS
SELECT 
    COUNT(*) as total_categories,
    COUNT(*) FILTER (WHERE is_active = true) as active_categories,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_categories,
    COUNT(*) FILTER (WHERE product_count > 0) as categories_with_products,
    COALESCE(AVG(product_count), 0) as average_products_per_category,
    COALESCE(MAX(level), 0) as max_depth,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent_categories
FROM categories;
