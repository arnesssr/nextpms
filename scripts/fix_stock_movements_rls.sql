-- Fix RLS policies for stock_movements table
-- This script disables RLS temporarily to allow service role operations

-- Disable RLS for stock_movements table
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled, use these policies instead:
-- DROP POLICY IF EXISTS "Authenticated users can view stock movements" ON stock_movements;
-- DROP POLICY IF EXISTS "Authenticated users can insert stock movements" ON stock_movements;
-- DROP POLICY IF EXISTS "Authenticated users can update stock movements" ON stock_movements;
-- DROP POLICY IF EXISTS "Authenticated users can delete stock movements" ON stock_movements;

-- CREATE POLICY "Service role can do everything" ON stock_movements FOR ALL USING (true);
-- CREATE POLICY "Anon can read stock movements" ON stock_movements FOR SELECT USING (true);

-- Verify the table is accessible
SELECT 'stock_movements RLS disabled successfully!' as status;
SELECT COUNT(*) as existing_movements FROM stock_movements;
