-- Create price_history table to track product price changes
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    old_cost_price DECIMAL(10,2),
    new_cost_price DECIMAL(10,2),
    change_reason TEXT NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('manual_update', 'cost_change', 'promotion', 'bulk_update', 'automated_rule')),
    changed_by TEXT NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_price_history_product_id ON price_history(product_id);
CREATE INDEX idx_price_history_changed_at ON price_history(changed_at DESC);
CREATE INDEX idx_price_history_change_type ON price_history(change_type);

-- Enable Row Level Security (RLS)
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for price_history table
CREATE POLICY "Users can view all price history" 
ON price_history FOR SELECT 
USING (true);

CREATE POLICY "Users can insert price history" 
ON price_history FOR INSERT 
WITH CHECK (true);

-- Grant permissions to authenticated users
GRANT ALL ON price_history TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add some sample data for testing
INSERT INTO price_history (product_id, old_price, new_price, old_cost_price, new_cost_price, change_reason, change_type, changed_by)
SELECT 
    p.id,
    CASE WHEN p.selling_price > 10 THEN p.selling_price - 5 ELSE p.selling_price * 0.9 END as old_price,
    p.selling_price as new_price,
    CASE WHEN p.base_price > 5 THEN p.base_price - 2 ELSE p.base_price * 0.95 END as old_cost_price,
    p.base_price as new_cost_price,
    'Initial price adjustment for testing' as change_reason,
    'manual_update' as change_type,
    'system' as changed_by
FROM products p 
WHERE p.selling_price IS NOT NULL 
AND p.base_price IS NOT NULL 
LIMIT 5;
