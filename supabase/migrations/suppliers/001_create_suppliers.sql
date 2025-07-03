-- Migration: Create suppliers table
-- Created: 2025-07-03
-- Description: Core suppliers table for vendor management

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic information
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE, -- Supplier code/reference
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    
    -- Address information
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    
    -- Business information
    tax_id VARCHAR(50), -- Tax identification number
    business_registration VARCHAR(100), -- Business registration number
    business_type VARCHAR(50), -- corporation, llc, sole_proprietorship, etc.
    
    -- Contact information
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    
    -- Payment and terms
    payment_terms VARCHAR(100), -- "Net 30", "Net 60", "COD", etc.
    credit_limit DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Performance metrics
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5), -- 0-5 rating
    lead_time_days INTEGER DEFAULT 0, -- Average lead time in days
    minimum_order_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Status and categorization
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, suspended, pending
    supplier_type VARCHAR(50), -- manufacturer, distributor, wholesaler, service_provider
    category VARCHAR(100), -- electronics, clothing, food, etc.
    
    -- Notes and additional info
    notes TEXT,
    internal_notes TEXT, -- Private notes not visible to supplier
    
    -- Audit fields
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_order_date TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (
        status IN ('active', 'inactive', 'suspended', 'pending')
    ),
    CONSTRAINT valid_business_type CHECK (
        business_type IN ('corporation', 'llc', 'partnership', 'sole_proprietorship', 'other')
    ),
    CONSTRAINT valid_supplier_type CHECK (
        supplier_type IN ('manufacturer', 'distributor', 'wholesaler', 'service_provider', 'other')
    ),
    CONSTRAINT valid_rating CHECK (
        rating IS NULL OR (rating >= 0 AND rating <= 5)
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_supplier_type ON suppliers(supplier_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON suppliers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suppliers_last_order_date ON suppliers(last_order_date DESC);

-- Partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(name) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_suppliers_by_type ON suppliers(created_at DESC, supplier_type) WHERE status = 'active';

-- Full-text search index for name and notes
CREATE INDEX IF NOT EXISTS idx_suppliers_search ON suppliers USING gin(to_tsvector('english', name || ' ' || COALESCE(notes, '')));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_suppliers_updated_at();

-- Create function to generate supplier code
CREATE OR REPLACE FUNCTION generate_supplier_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate supplier code if not provided
    IF NEW.code IS NULL OR NEW.code = '' THEN
        -- Create code from first 3 letters of name + random number
        NEW.code := UPPER(LEFT(REGEXP_REPLACE(NEW.name, '[^A-Za-z]', '', 'g'), 3)) || 
                   LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM suppliers WHERE code = NEW.code) LOOP
            NEW.code := UPPER(LEFT(REGEXP_REPLACE(NEW.name, '[^A-Za-z]', '', 'g'), 3)) || 
                       LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to generate supplier code
CREATE TRIGGER trigger_generate_supplier_code
    BEFORE INSERT ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION generate_supplier_code();

-- Enable Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Authenticated users can view suppliers
CREATE POLICY "Authenticated users can view suppliers" ON suppliers
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert suppliers
CREATE POLICY "Authenticated users can insert suppliers" ON suppliers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update suppliers
CREATE POLICY "Authenticated users can update suppliers" ON suppliers
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete suppliers
CREATE POLICY "Authenticated users can delete suppliers" ON suppliers
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create view for supplier summary information
CREATE OR REPLACE VIEW suppliers_summary AS
SELECT 
    s.*,
    -- Calculate total orders (when we have orders table)
    0 as total_orders,
    0 as total_order_value,
    -- Performance indicators
    CASE 
        WHEN s.status = 'active' AND s.rating >= 4 THEN 'excellent'
        WHEN s.status = 'active' AND s.rating >= 3 THEN 'good'
        WHEN s.status = 'active' AND s.rating >= 2 THEN 'fair'
        WHEN s.status = 'active' THEN 'poor'
        ELSE 'inactive'
    END as performance_status,
    -- Days since last order
    CASE 
        WHEN s.last_order_date IS NOT NULL THEN 
            EXTRACT(DAY FROM NOW() - s.last_order_date)::INTEGER
        ELSE NULL
    END as days_since_last_order
FROM suppliers s;

-- Add table comments for documentation
COMMENT ON TABLE suppliers IS 'Core suppliers table for vendor and supplier management';
COMMENT ON COLUMN suppliers.id IS 'Unique identifier for supplier';
COMMENT ON COLUMN suppliers.name IS 'Supplier company name';
COMMENT ON COLUMN suppliers.code IS 'Unique supplier code/reference';
COMMENT ON COLUMN suppliers.status IS 'Supplier status: active, inactive, suspended, pending';
COMMENT ON COLUMN suppliers.supplier_type IS 'Type of supplier: manufacturer, distributor, etc.';
COMMENT ON COLUMN suppliers.rating IS 'Supplier performance rating (0-5)';
COMMENT ON COLUMN suppliers.payment_terms IS 'Payment terms like "Net 30", "COD", etc.';
COMMENT ON COLUMN suppliers.lead_time_days IS 'Average lead time in days';

-- Insert sample data for testing
INSERT INTO suppliers (
    name, email, phone, address_line_1, city, state, postal_code,
    primary_contact_name, primary_contact_email, payment_terms,
    supplier_type, category, rating, lead_time_days, status
) VALUES 
(
    'AudioTech Ltd', 'orders@audiotech.com', '+1-555-0101',
    '123 Tech Street', 'San Francisco', 'CA', '94105',
    'John Smith', 'john.smith@audiotech.com', 'Net 30',
    'manufacturer', 'electronics', 4.5, 14, 'active'
),
(
    'SmartTech Corp', 'procurement@smarttech.com', '+1-555-0102', 
    '456 Innovation Ave', 'Austin', 'TX', '73301',
    'Sarah Johnson', 'sarah@smarttech.com', 'Net 45',
    'distributor', 'electronics', 4.2, 10, 'active'
),
(
    'ElectroSupply Inc', 'sales@electrosupply.com', '+1-555-0103',
    '789 Supply Chain Dr', 'Chicago', 'IL', '60601',
    'Mike Wilson', 'mike@electrosupply.com', 'Net 30',
    'wholesaler', 'electronics', 3.8, 7, 'active'
),
(
    'TechVendor Co', 'info@techvendor.com', '+1-555-0104',
    '321 Vendor Blvd', 'Seattle', 'WA', '98101',
    'Lisa Chen', 'lisa@techvendor.com', 'COD',
    'service_provider', 'electronics', 4.1, 5, 'active'
)
ON CONFLICT (code) DO NOTHING;

-- Verify the migration
SELECT 'Suppliers table created successfully!' as status;
SELECT COUNT(*) as sample_suppliers_created FROM suppliers;
