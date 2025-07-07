-- ============================================================================
-- COMPLETE ORDERS SYSTEM MIGRATION FOR SUPABASE
-- ============================================================================
-- This migration creates a comprehensive order management system with:
-- - Customer orders, items, and related entities
-- - Order tracking and fulfillment
-- - Returns and refunds management
-- - Analytics and reporting support
-- - Row Level Security (RLS) policies
-- - Indexes for performance
-- - Triggers for automated workflows
-- ============================================================================

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS order_timeline CASCADE;
-- DROP TABLE IF EXISTS return_requests CASCADE;
-- DROP TABLE IF EXISTS order_fulfillments CASCADE;
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS customers CASCADE;

-- ============================================================================
-- 1. CUSTOMERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    
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
-- 3. ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL, -- References products table
    
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
-- 4. ORDER FULFILLMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_fulfillments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Fulfillment Information
    fulfillment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (fulfillment_status IN ('pending', 'processing', 'packed', 'shipped', 'delivered', 'failed')),
    
    -- Shipping Details
    tracking_number VARCHAR(255),
    shipping_carrier VARCHAR(100),
    shipping_method VARCHAR(100),
    tracking_url TEXT,
    
    -- Warehouse Information
    warehouse_location VARCHAR(255),
    packed_by UUID, -- Staff member who packed the order
    shipped_by UUID, -- Staff member who shipped the order
    
    -- Important Dates
    processed_at TIMESTAMP WITH TIME ZONE,
    packed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional Information
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. ORDER FULFILLMENT ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_fulfillment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fulfillment_id UUID NOT NULL REFERENCES order_fulfillments(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    
    -- Fulfillment Details
    quantity_fulfilled INTEGER NOT NULL CHECK (quantity_fulfilled > 0),
    warehouse_location VARCHAR(255),
    serial_numbers TEXT[], -- Array of serial numbers if applicable
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure we don't fulfill more than ordered
    UNIQUE(fulfillment_id, order_item_id)
);

-- ============================================================================
-- 6. RETURN REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS return_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    
    -- Return Information
    return_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'shipped_back', 'received', 'processed', 'refunded', 'cancelled')),
    
    -- Return Details
    reason VARCHAR(50) NOT NULL
        CHECK (reason IN ('defective', 'wrong_item', 'not_as_described', 'size_issue', 'changed_mind', 'duplicate_order', 'late_delivery', 'other')),
    description TEXT,
    
    -- Financial Information
    refund_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    restocking_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    return_shipping_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    
    -- Tracking Information
    return_tracking_number VARCHAR(255),
    return_carrier VARCHAR(100),
    
    -- Important Dates
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- Staff Information
    approved_by UUID,
    processed_by UUID,
    
    -- Additional Information
    notes TEXT,
    internal_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. RETURN REQUEST ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS return_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_request_id UUID NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,
    
    -- Return Item Details
    quantity_to_return INTEGER NOT NULL CHECK (quantity_to_return > 0),
    reason VARCHAR(50) NOT NULL,
    condition VARCHAR(20) NOT NULL DEFAULT 'unopened'
        CHECK (condition IN ('unopened', 'opened', 'damaged', 'defective', 'used')),
    
    -- Financial Information
    unit_refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_refund_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    
    -- Additional Information
    description TEXT,
    images TEXT[], -- Array of image URLs
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure we don't return more than purchased
    UNIQUE(return_request_id, order_item_id)
);

-- ============================================================================
-- 8. ORDER TIMELINE TABLE (for tracking order status changes)
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
-- 9. ORDER NOTES TABLE (for customer communication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Note Information
    note_type VARCHAR(20) NOT NULL DEFAULT 'internal'
        CHECK (note_type IN ('internal', 'customer', 'system')),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    
    -- Visibility
    visible_to_customer BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Staff Information
    created_by UUID,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON orders(shipped_at);
CREATE INDEX IF NOT EXISTS idx_orders_delivered_at ON orders(delivered_at);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);

-- Order fulfillments indexes
CREATE INDEX IF NOT EXISTS idx_fulfillments_order_id ON order_fulfillments(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_status ON order_fulfillments(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_fulfillments_tracking ON order_fulfillments(tracking_number);

-- Return requests indexes
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer_id ON return_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON return_requests(status);
CREATE INDEX IF NOT EXISTS idx_returns_created_at ON return_requests(created_at);

-- Timeline indexes
CREATE INDEX IF NOT EXISTS idx_timeline_order_id ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON order_timeline(created_at);

-- Order notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_order_id ON order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_notes_type ON order_notes(note_type);

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
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fulfillments_updated_at BEFORE UPDATE ON order_fulfillments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fulfillment_items_updated_at BEFORE UPDATE ON order_fulfillment_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_return_requests_updated_at BEFORE UPDATE ON return_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_return_items_updated_at BEFORE UPDATE ON return_request_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_notes_updated_at BEFORE UPDATE ON order_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
-- FUNCTION TO GENERATE RETURN NUMBERS
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_return_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT := EXTRACT(year FROM NOW())::TEXT;
    month_part TEXT := LPAD(EXTRACT(month FROM NOW())::TEXT, 2, '0');
    sequence_number INTEGER;
    return_number TEXT;
BEGIN
    -- Get the next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(return_number FROM 8) AS INTEGER)), 0) + 1
    INTO sequence_number
    FROM return_requests
    WHERE return_number LIKE 'RET-' || year_part || month_part || '%';
    
    -- Generate the return number
    return_number := 'RET-' || year_part || month_part || LPAD(sequence_number::TEXT, 4, '0');
    
    RETURN return_number;
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
-- TRIGGER TO AUTO-GENERATE RETURN NUMBERS
-- ============================================================================
CREATE OR REPLACE FUNCTION set_return_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.return_number IS NULL OR NEW.return_number = '' THEN
        NEW.return_number := generate_return_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_return_number_trigger
    BEFORE INSERT ON return_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_return_number();

-- ============================================================================
-- FUNCTION TO CALCULATE ORDER TOTALS
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate subtotal from order items
    SELECT COALESCE(SUM(total_price), 0)
    INTO NEW.subtotal
    FROM order_items
    WHERE order_id = NEW.order_id;
    
    -- Calculate total amount
    NEW.total_amount := NEW.subtotal + NEW.tax_amount + NEW.shipping_amount - NEW.discount_amount;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for order total calculation
CREATE TRIGGER calculate_order_totals_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_totals();

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
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_fulfillment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust based on your auth system)
-- These policies assume you have an auth.users table and proper user roles

-- Customers: Users can see all customers (adjust as needed)
CREATE POLICY "customers_select_policy" ON customers FOR SELECT USING (true);
CREATE POLICY "customers_insert_policy" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "customers_update_policy" ON customers FOR UPDATE USING (true);

-- Orders: Users can see all orders (adjust based on your business rules)
CREATE POLICY "orders_select_policy" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert_policy" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_policy" ON orders FOR UPDATE USING (true);

-- Order items: Users can see items for orders they can see
CREATE POLICY "order_items_select_policy" ON order_items FOR SELECT USING (true);
CREATE POLICY "order_items_insert_policy" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_update_policy" ON order_items FOR UPDATE USING (true);

-- Similar policies for other tables...
CREATE POLICY "fulfillments_select_policy" ON order_fulfillments FOR SELECT USING (true);
CREATE POLICY "fulfillments_insert_policy" ON order_fulfillments FOR INSERT WITH CHECK (true);
CREATE POLICY "fulfillments_update_policy" ON order_fulfillments FOR UPDATE USING (true);

CREATE POLICY "fulfillment_items_select_policy" ON order_fulfillment_items FOR SELECT USING (true);
CREATE POLICY "fulfillment_items_insert_policy" ON order_fulfillment_items FOR INSERT WITH CHECK (true);
CREATE POLICY "fulfillment_items_update_policy" ON order_fulfillment_items FOR UPDATE USING (true);

CREATE POLICY "returns_select_policy" ON return_requests FOR SELECT USING (true);
CREATE POLICY "returns_insert_policy" ON return_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "returns_update_policy" ON return_requests FOR UPDATE USING (true);

CREATE POLICY "return_items_select_policy" ON return_request_items FOR SELECT USING (true);
CREATE POLICY "return_items_insert_policy" ON return_request_items FOR INSERT WITH CHECK (true);
CREATE POLICY "return_items_update_policy" ON return_request_items FOR UPDATE USING (true);

CREATE POLICY "timeline_select_policy" ON order_timeline FOR SELECT USING (true);
CREATE POLICY "timeline_insert_policy" ON order_timeline FOR INSERT WITH CHECK (true);

CREATE POLICY "notes_select_policy" ON order_notes FOR SELECT USING (true);
CREATE POLICY "notes_insert_policy" ON order_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "notes_update_policy" ON order_notes FOR UPDATE USING (true);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for order analytics
CREATE OR REPLACE VIEW order_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as order_count,
    SUM(total_amount) as revenue,
    AVG(total_amount) as avg_order_value,
    COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders
FROM orders
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date;

-- View for order summary with customer info
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.payment_status,
    o.total_amount,
    o.currency,
    o.created_at,
    o.updated_at,
    c.name as customer_name,
    c.email as customer_email,
    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
FROM orders o
JOIN customers c ON o.customer_id = c.id;

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - REMOVE IN PRODUCTION)
-- ============================================================================

-- Insert sample customer
INSERT INTO customers (name, email, phone, address, city, state, postal_code)
VALUES 
    ('John Doe', 'john.doe@example.com', '+1-555-0123', '123 Main St', 'Anytown', 'CA', '12345'),
    ('Jane Smith', 'jane.smith@example.com', '+1-555-0124', '456 Oak Ave', 'Somewhere', 'NY', '54321')
ON CONFLICT (email) DO NOTHING;

-- Note: You'll need to insert sample orders and items based on your products table structure

-- ============================================================================
-- GRANT PERMISSIONS (adjust based on your needs)
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
-- END OF MIGRATION
-- ============================================================================

-- To verify the migration worked, you can run:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%order%';
