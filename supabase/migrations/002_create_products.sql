-- Migration: Create products table and related structures
-- Run this in your Supabase SQL Editor

-- Step 1: Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- Category relationship (REQUIRED - products must belong to a category)
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    
    -- Product details
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    weight DECIMAL(10,3), -- in kg
    dimensions_length DECIMAL(10,2), -- in cm
    dimensions_width DECIMAL(10,2),
    dimensions_height DECIMAL(10,2),
    
    -- Pricing
    base_price DECIMAL(12,2) NOT NULL,
    selling_price DECIMAL(12,2) NOT NULL,
    cost_price DECIMAL(12,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Inventory
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    track_inventory BOOLEAN NOT NULL DEFAULT true,
    
    -- Status and visibility
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, published, archived
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_digital BOOLEAN NOT NULL DEFAULT false,
    
    -- Media
    featured_image_url TEXT,
    gallery_images TEXT[], -- Array of image URLs
    
    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,
    meta_keywords TEXT[],
    
    -- Product attributes/variants (JSON for flexibility)
    attributes JSONB DEFAULT '{}',
    variants JSONB DEFAULT '[]',
    
    -- Shipping
    requires_shipping BOOLEAN NOT NULL DEFAULT true,
    shipping_weight DECIMAL(10,3),
    shipping_dimensions JSONB,
    
    -- Ratings and reviews
    average_rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Sales tracking
    total_sales INTEGER DEFAULT 0,
    revenue_generated DECIMAL(12,2) DEFAULT 0,
    
    -- Audit fields
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_price CHECK (base_price >= 0 AND selling_price >= 0),
    CONSTRAINT valid_stock CHECK (stock_quantity >= 0),
    CONSTRAINT valid_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    CONSTRAINT valid_rating CHECK (average_rating >= 0 AND average_rating <= 5),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- Step 2: Create indexes for performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_stock_quantity ON products(stock_quantity);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_selling_price ON products(selling_price);

-- Full text search index
CREATE INDEX idx_products_search ON products 
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(brand, '')));

-- Step 3: Create trigger for updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Create function to update category product count
CREATE OR REPLACE FUNCTION update_category_product_count_real(p_category_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE categories 
    SET product_count = (
        SELECT COUNT(*) 
        FROM products 
        WHERE category_id = p_category_id 
        AND status = 'published' 
        AND is_active = true
    )
    WHERE id = p_category_id;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create triggers to automatically update category product counts
CREATE OR REPLACE FUNCTION update_category_counts_on_product_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        PERFORM update_category_product_count_real(NEW.category_id);
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Update old category if category changed
        IF OLD.category_id != NEW.category_id THEN
            PERFORM update_category_product_count_real(OLD.category_id);
        END IF;
        -- Update new category
        PERFORM update_category_product_count_real(NEW.category_id);
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        PERFORM update_category_product_count_real(OLD.category_id);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER product_category_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_category_counts_on_product_change();

-- Step 6: Create product stats view
CREATE OR REPLACE VIEW product_stats AS
SELECT 
    COUNT(*)::INTEGER as total_products,
    COUNT(*) FILTER (WHERE status = 'published')::INTEGER as published_products,
    COUNT(*) FILTER (WHERE status = 'draft')::INTEGER as draft_products,
    COUNT(*) FILTER (WHERE is_active = true)::INTEGER as active_products,
    COUNT(*) FILTER (WHERE is_featured = true)::INTEGER as featured_products,
    COUNT(*) FILTER (WHERE stock_quantity <= min_stock_level AND track_inventory = true)::INTEGER as low_stock_products,
    COUNT(*) FILTER (WHERE stock_quantity = 0 AND track_inventory = true)::INTEGER as out_of_stock_products,
    COALESCE(AVG(selling_price), 0)::REAL as average_price,
    COALESCE(SUM(stock_quantity), 0)::INTEGER as total_stock_value,
    COALESCE(SUM(revenue_generated), 0)::REAL as total_revenue,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::INTEGER as recent_products
FROM products;

-- Step 7: Create function to get products with category info
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
        p.id, p.name, p.description, p.slug,
        p.category_id, c.name as category_name, c.path as category_path,
        p.sku, p.base_price, p.selling_price, p.stock_quantity,
        p.status, p.is_active, p.is_featured, p.featured_image_url,
        p.created_at, p.updated_at
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE 
        (p_category_id IS NULL OR p.category_id = p_category_id)
        AND (p_status IS NULL OR p.status = p_status)
        AND (p_search IS NULL OR (
            p.name ILIKE '%' || p_search || '%' 
            OR p.description ILIKE '%' || p_search || '%'
            OR p.sku ILIKE '%' || p_search || '%'
            OR c.name ILIKE '%' || p_search || '%'
        ))
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Step 9: Create policies for products
-- Allow read access to all users for published products
CREATE POLICY "Published products are viewable by everyone" ON products
    FOR SELECT USING (status = 'published' AND is_active = true);

-- Allow all operations for authenticated users (we'll refine this later)
CREATE POLICY "Products are manageable by authenticated users" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Step 10: Update category product counts for existing categories
SELECT update_category_product_count_real(id) FROM categories;

-- Verify everything works
SELECT 'Products migration completed successfully!' as status;
SELECT * FROM product_stats;
SELECT COUNT(*) as total_categories, 
       SUM(product_count) as total_product_count_in_categories 
FROM categories;
