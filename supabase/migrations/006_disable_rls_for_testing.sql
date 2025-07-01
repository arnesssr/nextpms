-- Migration: Temporarily disable RLS for development testing
-- Created: 2024-12-30
-- Description: Disable RLS on saved_calculations table for development

-- Temporarily disable RLS for testing
ALTER TABLE saved_calculations DISABLE ROW LEVEL SECURITY;

-- Add a comment explaining this is temporary
COMMENT ON TABLE saved_calculations IS 'Stores saved pricing calculations from the pricing calculator (RLS temporarily disabled for development)';

-- Note: To re-enable RLS later, run:
-- ALTER TABLE saved_calculations ENABLE ROW LEVEL SECURITY;
