-- ============================================================================
-- SIMPLIFIED ORDERS SYSTEM MIGRATION FOR SUPABASE (NO CUSTOMER TABLE)
-- ============================================================================
-- This migration creates a simplified order management system without
-- dependency on a separate customers table. Customer info is stored
-- directly in the orders table as shipping/billing information.
-- ============================================================================

-- ============================================================================
-- 1. ORDERS TABLE (Simplified)
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(255) NOT NULL, -- Simple string for guest customers
    
    -- Order Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded')),
    
    -- Financial Information
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    shipping_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Payment Information
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    
    -- Shipping Information
    shipping_name VARCHAR(255) NOT NULL,
    shipping_address_line_1 VARCHAR(255) NOT NULL,
    shipping_address_line_2 VARCHAR(255),
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL DEFAULT 'USA',
    shipping_phone VARCHAR(50),
    
    -- Billing Information (optional, defaults to shipping if null)
    billing_name VARCHAR(255),
    billing_address_line_1 VARCHAR(255),
    billing_address_line_2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),
    billing_phone VARCHAR(50),
    
    -- Tracking and Fulfillment
    tracking_number VARCHAR(255),
    shipping_carrier VARCHAR(100),
    tracking_url TEXT,
    
    -- Additional Information
    notes TEXT,
    internal_notes TEXT, -- Private notes not visible to customer
    
    -- Important Dates
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID, -- Reference to auth.users if needed
    updated_by UUID
);

-- ============================================================================
-- 2. ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL, -- Simple string for product reference
    
    -- Product Information (snapshot at time of order)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    product_image_url TEXT,
    
    -- Pricing and Quantity
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
    
    -- Fulfillment tracking per item
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. ORDER TIMELINE TABLE (for tracking order status changes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Timeline Information
    status VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    
    -- Additional Data
    metadata JSONB, -- Store additional context data
    
    -- Staff Information
    created_by UUID, -- Staff member who made the change
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON orders(shipped_at);
CREATE INDEX IF NOT EXISTS idx_orders_delivered_at ON orders(delivered_at);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_name ON orders(shipping_name);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);

-- Timeline indexes
CREATE INDEX IF NOT EXISTS idx_timeline_order_id ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON order_timeline(created_at);

-- ============================================================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- ============================================================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION TO GENERATE ORDER NUMBERS
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT := EXTRACT(year FROM NOW())::TEXT;
    month_part TEXT := LPAD(EXTRACT(month FROM NOW())::TEXT, 2, '0');
    sequence_number INTEGER;
    order_number TEXT;
BEGIN
    -- Get the next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 8) AS INTEGER)), 0) + 1
    INTO sequence_number
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_part || month_part || '%';
    
    -- Generate the order number
    order_number := 'ORD-' || year_part || month_part || LPAD(sequence_number::TEXT, 4, '0');
    
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER TO AUTO-GENERATE ORDER NUMBERS
-- ============================================================================
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- ============================================================================
-- FUNCTION TO UPDATE ORDER TOTALS WHEN ITEMS CHANGE
-- ============================================================================
CREATE OR REPLACE FUNCTION update_order_totals_on_item_change()
RETURNS TRIGGER AS $$
DECLARE
    order_record RECORD;
BEGIN
    -- Get the order ID (works for INSERT, UPDATE, DELETE)
    IF TG_OP = 'DELETE' THEN
        SELECT id INTO order_record FROM orders WHERE id = OLD.order_id;
    ELSE
        SELECT id INTO order_record FROM orders WHERE id = NEW.order_id;
    END IF;
    
    -- Update the order totals
    UPDATE orders
    SET subtotal = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM order_items
        WHERE order_id = order_record.id
    ),
    total_amount = subtotal + tax_amount + shipping_amount - discount_amount,
    updated_at = NOW()
    WHERE id = order_record.id;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for order item changes
CREATE TRIGGER update_order_totals_on_item_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_totals_on_item_change();

-- ============================================================================
-- FUNCTION TO ADD TIMELINE ENTRIES ON STATUS CHANGES
-- ============================================================================
CREATE OR REPLACE FUNCTION add_order_timeline_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Only add timeline entry if status actually changed
    IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_timeline (order_id, status, description, created_by)
        VALUES (
            NEW.id,
            NEW.status,
            CASE NEW.status
                WHEN 'pending' THEN 'Order created and pending confirmation'
                WHEN 'confirmed' THEN 'Order confirmed and ready for processing'
                WHEN 'processing' THEN 'Order is being processed'
                WHEN 'shipped' THEN 'Order has been shipped'
                WHEN 'delivered' THEN 'Order has been delivered'
                WHEN 'cancelled' THEN 'Order has been cancelled'
                WHEN 'returned' THEN 'Order has been returned'
                WHEN 'refunded' THEN 'Order has been refunded'
                ELSE 'Order status updated to ' || NEW.status
            END,
            NEW.updated_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timeline trigger
CREATE TRIGGER add_order_timeline_entry_trigger
    AFTER INSERT OR UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION add_order_timeline_entry();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;

-- Simple policies - adjust based on your auth system
CREATE POLICY "orders_select_policy" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert_policy" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_policy" ON orders FOR UPDATE USING (true);

CREATE POLICY "order_items_select_policy" ON order_items FOR SELECT USING (true);
CREATE POLICY "order_items_insert_policy" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_update_policy" ON order_items FOR UPDATE USING (true);

CREATE POLICY "timeline_select_policy" ON order_timeline FOR SELECT USING (true);
CREATE POLICY "timeline_insert_policy" ON order_timeline FOR INSERT WITH CHECK (true);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample orders
INSERT INTO orders (
    customer_id, status, subtotal, tax_amount, shipping_amount, discount_amount, total_amount,
    payment_status, payment_method,
    shipping_name, shipping_address_line_1, shipping_city, shipping_state, shipping_postal_code, shipping_country,
    notes, created_at
) VALUES 
(
    'guest_1638360000000', 'delivered', 150.00, 12.00, 10.00, 0.00, 172.00,
    'paid', 'credit_card',
    'John Doe', '123 Main St', 'Anytown', 'CA', '12345', 'USA',
    'First test order',
    NOW() - INTERVAL '7 days'
),
(
    'guest_1638360001000', 'shipped', 89.99, 7.20, 0.00, 10.00, 87.19,
    'paid', 'paypal',
    'Jane Smith', '456 Oak Ave', 'Somewhere', 'NY', '54321', 'USA',
    'Express shipping',
    NOW() - INTERVAL '3 days'
),
(
    'guest_1638360002000', 'processing', 250.50, 20.04, 15.00, 25.00, 260.54,
    'paid', 'credit_card',
    'Bob Johnson', '789 Pine Rd', 'Elsewhere', 'TX', '67890', 'USA',
    'Bulk order discount applied',
    NOW() - INTERVAL '1 day'
),
(
    'guest_1638360003000', 'pending', 45.00, 3.60, 10.00, 0.00, 58.60,
    'pending', 'bank_transfer',
    'Alice Brown', '321 Elm St', 'Nowhere', 'FL', '98765', 'USA',
    'Payment pending',
    NOW() - INTERVAL '2 hours'
),
(
    'guest_1638360004000', 'cancelled', 199.99, 16.00, 20.00, 0.00, 235.99,
    'refunded', 'credit_card',
    'Charlie Wilson', '654 Maple Ave', 'Anywhere', 'WA', '54321', 'USA',
    'Customer requested cancellation',
    NOW() - INTERVAL '5 days'
);

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, status)
SELECT 
    o.id,
    'test_product_1',
    'Premium Widget',
    'PWD-001',
    2,
    50.00,
    100.00,
    'delivered'
FROM orders o WHERE o.shipping_name = 'John Doe';

INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, status)
SELECT 
    o.id,
    'test_product_2',
    'Standard Widget',
    'SWD-002',
    1,
    50.00,
    50.00,
    'delivered'
FROM orders o WHERE o.shipping_name = 'John Doe';

INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, status)
SELECT 
    o.id,
    'test_product_3',
    'Gadget Pro',
    'GAD-003',
    3,
    29.99,
    89.97,
    'shipped'
FROM orders o WHERE o.shipping_name = 'Jane Smith';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
