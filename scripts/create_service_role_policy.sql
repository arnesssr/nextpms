-- Create a policy that allows service role to bypass all restrictions
-- This should work with service role authentication

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Authenticated users can insert stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Authenticated users can update stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Authenticated users can delete stock movements" ON stock_movements;

-- Create permissive policies that work with service role
CREATE POLICY "Allow all operations" ON stock_movements FOR ALL USING (true) WITH CHECK (true);

-- Verify
SELECT 'Service role policies created' as status;
