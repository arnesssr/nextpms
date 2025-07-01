-- Migration: Create media table for file management
-- Created: 2024-12-30
-- Description: Table to store media files (images, documents) with relationships to products and other entities

-- Create media table
CREATE TABLE IF NOT EXISTS media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- File information
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- Supabase storage path
    bucket_name VARCHAR(50) NOT NULL DEFAULT 'media',
    file_size INTEGER, -- Size in bytes
    mime_type VARCHAR(100),
    file_extension VARCHAR(10),
    
    -- Display and metadata
    alt_text TEXT,
    caption TEXT,
    description TEXT,
    
    -- Relationships (flexible - can link to different entities)
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    user_id UUID, -- For user avatars, etc.
    
    -- Organization
    media_type VARCHAR(50) CHECK (media_type IN ('image', 'document', 'video', 'audio', 'other')),
    usage_type VARCHAR(50) CHECK (usage_type IN ('product_primary', 'product_gallery', 'product_document', 'category_banner', 'user_avatar', 'general')),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    
    -- Status and visibility
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'restricted')),
    
    -- Tags and categorization
    tags TEXT[], -- Array of tags for easier searching
    
    -- Audit fields
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_product_id ON media(product_id);
CREATE INDEX IF NOT EXISTS idx_media_category_id ON media(category_id);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_media_type ON media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_usage_type ON media(usage_type);
CREATE INDEX IF NOT EXISTS idx_media_is_primary ON media(is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_bucket_path ON media(bucket_name, file_path);
CREATE INDEX IF NOT EXISTS idx_media_tags ON media USING GIN(tags);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE FUNCTION update_media_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view public media
CREATE POLICY "Public media is viewable by everyone" ON media
    FOR SELECT USING (visibility = 'public' AND is_active = TRUE);

-- Policy: Authenticated users can view their own media
CREATE POLICY "Users can view own media" ON media
    FOR SELECT USING (created_by = current_user::text OR visibility = 'public');

-- Policy: Authenticated users can insert media
CREATE POLICY "Authenticated users can insert media" ON media
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update their own media
CREATE POLICY "Users can update own media" ON media
    FOR UPDATE USING (created_by = current_user::text);

-- Policy: Users can delete their own media
CREATE POLICY "Users can delete own media" ON media
    FOR DELETE USING (created_by = current_user::text);

-- Create a function to get optimized media URL (will be used in application)
CREATE OR REPLACE FUNCTION get_media_url(media_record media, transform_options TEXT DEFAULT '')
RETURNS TEXT AS $$
BEGIN
    -- This function can be enhanced to generate optimized URLs
    -- For now, it returns the basic storage URL structure
    RETURN CONCAT('/storage/v1/object/public/', media_record.bucket_name, '/', media_record.file_path);
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy media querying with product information
CREATE OR REPLACE VIEW media_with_products AS
SELECT 
    m.*,
    p.name as product_name,
    p.sku as product_sku,
    c.name as category_name
FROM media m
LEFT JOIN products p ON m.product_id = p.id
LEFT JOIN categories c ON m.category_id = c.id;

-- Add constraints to ensure data integrity
ALTER TABLE media ADD CONSTRAINT check_primary_media_per_product 
    EXCLUDE (product_id WITH =) WHERE (is_primary = TRUE AND product_id IS NOT NULL);

-- Add comments for documentation
COMMENT ON TABLE media IS 'Stores media files (images, documents, videos) with flexible relationships to various entities';
COMMENT ON COLUMN media.id IS 'Unique identifier for the media file';
COMMENT ON COLUMN media.file_name IS 'Original filename';
COMMENT ON COLUMN media.file_path IS 'Path in Supabase storage bucket';
COMMENT ON COLUMN media.bucket_name IS 'Supabase storage bucket name';
COMMENT ON COLUMN media.product_id IS 'Reference to product (if this media belongs to a product)';
COMMENT ON COLUMN media.category_id IS 'Reference to category (if this media belongs to a category)';
COMMENT ON COLUMN media.media_type IS 'Type of media: image, document, video, audio, other';
COMMENT ON COLUMN media.usage_type IS 'How the media is used: product_primary, product_gallery, etc.';
COMMENT ON COLUMN media.is_primary IS 'Whether this is the primary/main media for the related entity';
COMMENT ON COLUMN media.tags IS 'Array of tags for categorization and search';
