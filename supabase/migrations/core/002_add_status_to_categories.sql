-- Migration: Add status column to categories table
-- This adds the missing 'status' column that the application expects

-- Add status column to categories table
ALTER TABLE categories 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active' 
CHECK (status IN ('active', 'inactive', 'draft', 'archived'));

-- Create index for status column for performance
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);

-- Update existing records to set status based on is_active field
UPDATE categories 
SET status = CASE 
    WHEN is_active = true THEN 'active'
    ELSE 'inactive'
END;

-- Add comment to document the column
COMMENT ON COLUMN categories.status IS 'Category status: active, inactive, draft, or archived';
