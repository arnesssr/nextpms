-- ============================================================================
-- ORDER FULFILLMENT TABLES MIGRATION
-- ============================================================================
-- This migration adds fulfillment tracking capabilities to the existing
-- orders system, enabling warehouse processing, shipping, and delivery tracking
-- ============================================================================

-- ============================================================================
-- 1. ORDER FULFILLMENTS TABLE
-- ============================================================================
-- This table tracks the main fulfillment record for each shipment
-- An order can have multiple fulfillments (partial shipments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_fulfillments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Fulfillment Information
    fulfillment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (fulfillment_status IN ('pending', 'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned')),
    
    -- Shipping Details
    tracking_number VARCHAR(255),
    shipping_carrier VARCHAR(100),
    shipping_method VARCHAR(100),
    tracking_url TEXT,
    shipping_label_url TEXT, -- URL to shipping label PDF
    
    -- Warehouse Information
    warehouse_location VARCHAR(255),
    packed_by UUID, -- Staff member who packed the order
    shipped_by UUID, -- Staff member who shipped the order
    
    -- Weight and Dimensions (for shipping cost calculation)
    package_weight DECIMAL(10,2), -- in pounds or kg
    package_length DECIMAL(10,2), -- in inches or cm
    package_width DECIMAL(10,2),
    package_height DECIMAL(10,2),
    
    -- Important Dates
    processing_started_at TIMESTAMP WITH TIME ZONE,
    packed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    in_transit_at TIMESTAMP WITH TIME ZONE,
    out_for_delivery_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_delivery_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery Information
    delivery_signature VARCHAR(255),
    delivery_notes TEXT,
    delivery_photo_url TEXT, -- Photo proof of delivery
    
    -- Additional Information
    notes TEXT,
    internal_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- ============================================================================
-- 2. ORDER FULFILLMENT ITEMS TABLE
-- ============================================================================
-- Tracks which items and quantities are included in each fulfillment
-- Enables partial fulfillment of orders
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_fulfillment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fulfillment_id UUID NOT NULL REFERENCES order_fulfillments(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    
    -- Fulfillment Details
    quantity_fulfilled INTEGER NOT NULL CHECK (quantity_fulfilled > 0),
    
    -- Warehouse Information
    warehouse_location VARCHAR(255),
    bin_location VARCHAR(100), -- Specific location in warehouse
    serial_numbers TEXT[], -- Array of serial numbers if applicable
    lot_numbers TEXT[], -- Array of lot numbers for batch tracking
    
    -- Quality Control
    quality_check_passed BOOLEAN DEFAULT TRUE,
    quality_check_notes TEXT,
    checked_by UUID,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure we don't fulfill the same item twice in the same fulfillment
    UNIQUE(fulfillment_id, order_item_id)
);

-- ============================================================================
-- 3. FULFILLMENT EVENTS TABLE (for detailed tracking)
-- ============================================================================
-- Tracks all events in the fulfillment process for complete visibility
-- ============================================================================
CREATE TABLE IF NOT EXISTS fulfillment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fulfillment_id UUID NOT NULL REFERENCES order_fulfillments(id) ON DELETE CASCADE,
    
    -- Event Information
    event_type VARCHAR(50) NOT NULL
        CHECK (event_type IN (
            'created', 'processing_started', 'item_picked', 'item_packed', 
            'label_printed', 'picked_up', 'in_transit', 'out_for_delivery',
            'delivery_attempted', 'delivered', 'returned_to_sender',
            'exception', 'delayed', 'damaged', 'lost'
        )),
    event_description TEXT NOT NULL,
    
    -- Location Information
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    location_country VARCHAR(100),
    location_postal_code VARCHAR(20),
    
    -- Additional Data
    metadata JSONB, -- Store carrier-specific tracking data
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Order fulfillments indexes
CREATE INDEX IF NOT EXISTS idx_fulfillments_order_id ON order_fulfillments(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_status ON order_fulfillments(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_fulfillments_tracking ON order_fulfillments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_fulfillments_carrier ON order_fulfillments(shipping_carrier);
CREATE INDEX IF NOT EXISTS idx_fulfillments_shipped_at ON order_fulfillments(shipped_at);
CREATE INDEX IF NOT EXISTS idx_fulfillments_delivered_at ON order_fulfillments(delivered_at);

-- Fulfillment items indexes
CREATE INDEX IF NOT EXISTS idx_fulfillment_items_fulfillment_id ON order_fulfillment_items(fulfillment_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_items_order_item_id ON order_fulfillment_items(order_item_id);

-- Fulfillment events indexes
CREATE INDEX IF NOT EXISTS idx_fulfillment_events_fulfillment_id ON fulfillment_events(fulfillment_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_events_type ON fulfillment_events(event_type);
CREATE INDEX IF NOT EXISTS idx_fulfillment_events_created_at ON fulfillment_events(created_at);

-- ============================================================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- ============================================================================

-- Apply update trigger to fulfillments table
CREATE TRIGGER update_fulfillments_updated_at 
    BEFORE UPDATE ON order_fulfillments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Apply update trigger to fulfillment items table
CREATE TRIGGER update_fulfillment_items_updated_at 
    BEFORE UPDATE ON order_fulfillment_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION TO UPDATE ORDER STATUS BASED ON FULFILLMENT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_order_status_from_fulfillment()
RETURNS TRIGGER AS $$
BEGIN
    -- Update order status when fulfillment status changes
    IF NEW.fulfillment_status = 'shipped' THEN
        UPDATE orders 
        SET status = 'shipped',
            shipped_at = COALESCE(NEW.shipped_at, NOW())
        WHERE id = NEW.order_id;
    ELSIF NEW.fulfillment_status = 'delivered' THEN
        UPDATE orders 
        SET status = 'delivered',
            delivered_at = COALESCE(NEW.delivered_at, NOW())
        WHERE id = NEW.order_id;
    ELSIF NEW.fulfillment_status = 'processing' THEN
        UPDATE orders 
        SET status = 'processing'
        WHERE id = NEW.order_id AND status = 'confirmed';
    END IF;
    
    -- Add fulfillment event
    INSERT INTO fulfillment_events (
        fulfillment_id, 
        event_type, 
        event_description,
        created_by
    ) VALUES (
        NEW.id,
        CASE NEW.fulfillment_status
            WHEN 'processing' THEN 'processing_started'
            WHEN 'packed' THEN 'item_packed'
            WHEN 'shipped' THEN 'picked_up'
            WHEN 'delivered' THEN 'delivered'
            ELSE NEW.fulfillment_status
        END,
        'Fulfillment status updated to ' || NEW.fulfillment_status,
        NEW.updated_by
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for fulfillment status changes
CREATE TRIGGER update_order_from_fulfillment_trigger
    AFTER UPDATE OF fulfillment_status ON order_fulfillments
    FOR EACH ROW
    WHEN (OLD.fulfillment_status IS DISTINCT FROM NEW.fulfillment_status)
    EXECUTE FUNCTION update_order_status_from_fulfillment();

-- ============================================================================
-- FUNCTION TO CHECK FULFILLMENT QUANTITIES
-- ============================================================================
CREATE OR REPLACE FUNCTION check_fulfillment_quantity()
RETURNS TRIGGER AS $$
DECLARE
    ordered_quantity INTEGER;
    already_fulfilled_quantity INTEGER;
BEGIN
    -- Get the ordered quantity
    SELECT quantity INTO ordered_quantity
    FROM order_items
    WHERE id = NEW.order_item_id;
    
    -- Get already fulfilled quantity (excluding current record on update)
    SELECT COALESCE(SUM(quantity_fulfilled), 0) INTO already_fulfilled_quantity
    FROM order_fulfillment_items
    WHERE order_item_id = NEW.order_item_id
    AND id != COALESCE(NEW.id, gen_random_uuid());
    
    -- Check if we're trying to fulfill more than ordered
    IF (already_fulfilled_quantity + NEW.quantity_fulfilled) > ordered_quantity THEN
        RAISE EXCEPTION 'Cannot fulfill more than ordered quantity. Ordered: %, Already fulfilled: %, Trying to fulfill: %',
            ordered_quantity, already_fulfilled_quantity, NEW.quantity_fulfilled;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for fulfillment quantity validation
CREATE TRIGGER check_fulfillment_quantity_trigger
    BEFORE INSERT OR UPDATE ON order_fulfillment_items
    FOR EACH ROW
    EXECUTE FUNCTION check_fulfillment_quantity();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE order_fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_fulfillment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_events ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust based on your auth system)
CREATE POLICY "fulfillments_select_policy" ON order_fulfillments FOR SELECT USING (true);
CREATE POLICY "fulfillments_insert_policy" ON order_fulfillments FOR INSERT WITH CHECK (true);
CREATE POLICY "fulfillments_update_policy" ON order_fulfillments FOR UPDATE USING (true);

CREATE POLICY "fulfillment_items_select_policy" ON order_fulfillment_items FOR SELECT USING (true);
CREATE POLICY "fulfillment_items_insert_policy" ON order_fulfillment_items FOR INSERT WITH CHECK (true);
CREATE POLICY "fulfillment_items_update_policy" ON order_fulfillment_items FOR UPDATE USING (true);

CREATE POLICY "fulfillment_events_select_policy" ON fulfillment_events FOR SELECT USING (true);
CREATE POLICY "fulfillment_events_insert_policy" ON fulfillment_events FOR INSERT WITH CHECK (true);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for orders ready for fulfillment
CREATE OR REPLACE VIEW orders_ready_for_fulfillment AS
SELECT 
    o.id,
    o.order_number,
    o.customer_id,
    o.shipping_name,
    o.shipping_address_line_1,
    o.shipping_city,
    o.shipping_state,
    o.shipping_postal_code,
    o.total_amount,
    o.created_at,
    COUNT(DISTINCT oi.id) as item_count,
    SUM(oi.quantity) as total_items
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'confirmed' 
    AND o.payment_status = 'paid'
    AND NOT EXISTS (
        SELECT 1 FROM order_fulfillments of 
        WHERE of.order_id = o.id 
        AND of.fulfillment_status NOT IN ('failed', 'returned')
    )
GROUP BY o.id
ORDER BY o.created_at ASC;

-- View for fulfillment summary
CREATE OR REPLACE VIEW fulfillment_summary AS
SELECT 
    of.id,
    of.order_id,
    o.order_number,
    of.fulfillment_status,
    of.tracking_number,
    of.shipping_carrier,
    of.shipped_at,
    of.delivered_at,
    COUNT(DISTINCT ofi.id) as items_fulfilled,
    SUM(ofi.quantity_fulfilled) as total_quantity_fulfilled
FROM order_fulfillments of
JOIN orders o ON of.order_id = o.id
LEFT JOIN order_fulfillment_items ofi ON of.id = ofi.fulfillment_id
GROUP BY of.id, o.order_number;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON order_fulfillments TO authenticated;
GRANT ALL ON order_fulfillment_items TO authenticated;
GRANT ALL ON fulfillment_events TO authenticated;
GRANT SELECT ON orders_ready_for_fulfillment TO authenticated;
GRANT SELECT ON fulfillment_summary TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- To verify the migration worked:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name LIKE '%fulfillment%';
