-- ============================================================================
-- ADD DELETE POLICIES FOR ORDERS SYSTEM
-- ============================================================================
-- This migration adds the missing DELETE policies for all order-related tables
-- that have RLS enabled but are missing DELETE permissions.
-- ============================================================================

-- Orders table - Allow DELETE operations
CREATE POLICY "orders_delete_policy" ON orders FOR DELETE USING (true);

-- Order items table - Allow DELETE operations
CREATE POLICY "order_items_delete_policy" ON order_items FOR DELETE USING (true);

-- Order fulfillments table - Allow DELETE operations  
CREATE POLICY "fulfillments_delete_policy" ON order_fulfillments FOR DELETE USING (true);

-- Order fulfillment items table - Allow DELETE operations
CREATE POLICY "fulfillment_items_delete_policy" ON order_fulfillment_items FOR DELETE USING (true);

-- Return requests table - Allow DELETE operations
CREATE POLICY "returns_delete_policy" ON return_requests FOR DELETE USING (true);

-- Return request items table - Allow DELETE operations
CREATE POLICY "return_items_delete_policy" ON return_request_items FOR DELETE USING (true);

-- Order timeline table - Allow DELETE operations
CREATE POLICY "timeline_delete_policy" ON order_timeline FOR DELETE USING (true);

-- Order notes table - Allow DELETE operations
CREATE POLICY "notes_delete_policy" ON order_notes FOR DELETE USING (true);

-- Customers table - Allow DELETE operations
CREATE POLICY "customers_delete_policy" ON customers FOR DELETE USING (true);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- You can run these queries to verify the policies are created:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' AND cmd = 'DELETE';
-- ============================================================================
