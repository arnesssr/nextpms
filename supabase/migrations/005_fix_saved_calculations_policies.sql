-- Migration: Fix saved_calculations table policies and add product relationship
-- Created: 2024-12-30
-- Description: Fix RLS policies and optionally link calculations to products

-- Add optional product_id column for linking calculations to specific products
ALTER TABLE saved_calculations 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Create index for product relationship
CREATE INDEX IF NOT EXISTS idx_saved_calculations_product_id ON saved_calculations(product_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own saved calculations" ON saved_calculations;
DROP POLICY IF EXISTS "Users can insert own saved calculations" ON saved_calculations;
DROP POLICY IF EXISTS "Users can update own saved calculations" ON saved_calculations;
DROP POLICY IF EXISTS "Users can delete own saved calculations" ON saved_calculations;

-- Create more flexible RLS policies that work with different auth setups
-- Policy: Users can view their own saved calculations (supports both user ID and email)
CREATE POLICY "Users can view own saved calculations" ON saved_calculations
    FOR SELECT USING (
        created_by = auth.uid()::text OR 
        created_by = auth.email() OR
        created_by = 'anonymous'
    );

-- Policy: Users can insert their own saved calculations
CREATE POLICY "Users can insert own saved calculations" ON saved_calculations
    FOR INSERT WITH CHECK (
        created_by = auth.uid()::text OR 
        created_by = auth.email() OR
        created_by = 'anonymous'
    );

-- Policy: Users can update their own saved calculations
CREATE POLICY "Users can update own saved calculations" ON saved_calculations
    FOR UPDATE USING (
        created_by = auth.uid()::text OR 
        created_by = auth.email() OR
        created_by = 'anonymous'
    );

-- Policy: Users can delete their own saved calculations
CREATE POLICY "Users can delete own saved calculations" ON saved_calculations
    FOR DELETE USING (
        created_by = auth.uid()::text OR 
        created_by = auth.email() OR
        created_by = 'anonymous'
    );

-- Temporarily disable RLS for testing (can be re-enabled later)
-- ALTER TABLE saved_calculations DISABLE ROW LEVEL SECURITY;

-- Add comment for the new product relationship
COMMENT ON COLUMN saved_calculations.product_id IS 'Optional reference to the product this calculation was made for';
