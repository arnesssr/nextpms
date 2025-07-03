-- Migration: Create saved_calculations table for pricing calculator results
-- Created: 2024-12-30
-- Description: Table to store saved pricing calculations from the pricing calculator

-- Create saved_calculations table
CREATE TABLE IF NOT EXISTS saved_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    calculation_type VARCHAR(50) NOT NULL CHECK (calculation_type IN ('single_product', 'competitor_analysis', 'bulk_pricing', 'break_even')),
    input_data JSONB NOT NULL,
    results JSONB NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_calculations_created_by ON saved_calculations(created_by);
CREATE INDEX IF NOT EXISTS idx_saved_calculations_calculation_type ON saved_calculations(calculation_type);
CREATE INDEX IF NOT EXISTS idx_saved_calculations_created_at ON saved_calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_calculations_is_favorite ON saved_calculations(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_saved_calculations_tags ON saved_calculations USING GIN(tags);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_calculations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_update_saved_calculations_updated_at
    BEFORE UPDATE ON saved_calculations
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_calculations_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE saved_calculations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own saved calculations
CREATE POLICY "Users can view own saved calculations" ON saved_calculations
    FOR SELECT USING (created_by = current_user::text);

-- Policy: Users can insert their own saved calculations
CREATE POLICY "Users can insert own saved calculations" ON saved_calculations
    FOR INSERT WITH CHECK (created_by = current_user::text);

-- Policy: Users can update their own saved calculations
CREATE POLICY "Users can update own saved calculations" ON saved_calculations
    FOR UPDATE USING (created_by = current_user::text);

-- Policy: Users can delete their own saved calculations
CREATE POLICY "Users can delete own saved calculations" ON saved_calculations
    FOR DELETE USING (created_by = current_user::text);

-- Add comments for documentation
COMMENT ON TABLE saved_calculations IS 'Stores saved pricing calculations from the pricing calculator';
COMMENT ON COLUMN saved_calculations.id IS 'Unique identifier for the saved calculation';
COMMENT ON COLUMN saved_calculations.name IS 'User-defined name for the calculation';
COMMENT ON COLUMN saved_calculations.description IS 'Optional description of the calculation';
COMMENT ON COLUMN saved_calculations.calculation_type IS 'Type of calculation: single_product, competitor_analysis, bulk_pricing, break_even';
COMMENT ON COLUMN saved_calculations.input_data IS 'JSON object containing all input parameters used in the calculation';
COMMENT ON COLUMN saved_calculations.results IS 'JSON object containing all calculation results';
COMMENT ON COLUMN saved_calculations.is_favorite IS 'Whether this calculation is marked as favorite by the user';
COMMENT ON COLUMN saved_calculations.tags IS 'Array of tags for categorizing calculations';
COMMENT ON COLUMN saved_calculations.created_by IS 'User who created this calculation';
COMMENT ON COLUMN saved_calculations.created_at IS 'Timestamp when the calculation was created';
COMMENT ON COLUMN saved_calculations.updated_at IS 'Timestamp when the calculation was last updated';
