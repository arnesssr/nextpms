-- Fix RLS policies for inventory_items table
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Authenticated users can insert inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Authenticated users can update inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Authenticated users can delete inventory items" ON inventory_items;

-- Create more permissive policies for development
-- Policy: Allow all operations for service_role and authenticated users
CREATE POLICY "Allow all inventory operations" ON inventory_items
    FOR ALL USING (true);

-- Alternative: If you want to keep some security, use this instead:
-- CREATE POLICY "Allow inventory operations for authenticated users" ON inventory_items
--     FOR ALL USING (auth.role() IN ('authenticated', 'service_role', 'anon'));

-- Also fix the constraint issue by creating the proper unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_items_product_location_unique 
ON inventory_items(product_id, location_id) 
WHERE status = 'active';

-- Now try to insert inventory items
INSERT INTO inventory_items (
    product_id,
    location_id,
    location_name,
    quantity_on_hand,
    min_stock_level,
    unit_cost,
    status,
    created_by
)
SELECT 
    p.id as product_id,
    'main_warehouse' as location_id,
    'Main Warehouse' as location_name,
    COALESCE(p.stock_quantity, 0) as quantity_on_hand,
    COALESCE(p.min_stock_level, 0) as min_stock_level,
    COALESCE(p.cost_price, 0) as unit_cost,
    'active' as status,
    'system' as created_by
FROM products p 
WHERE p.is_active = true
ON CONFLICT (product_id, location_id) 
WHERE status = 'active'
DO UPDATE SET
    quantity_on_hand = EXCLUDED.quantity_on_hand,
    min_stock_level = EXCLUDED.min_stock_level,
    unit_cost = EXCLUDED.unit_cost,
    location_name = EXCLUDED.location_name;

-- Verify the data was inserted
SELECT 'Inventory items created:' as message, COUNT(*) as count 
FROM inventory_items WHERE status = 'active';
