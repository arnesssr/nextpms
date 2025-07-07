-- ============================================================================
-- FIX ORDER NUMBER GENERATION FUNCTION
-- ============================================================================
-- This fixes the duplicate order number issue by improving the generation logic

-- Drop the existing function and trigger
DROP TRIGGER IF EXISTS set_order_number_trigger ON orders;
DROP FUNCTION IF EXISTS generate_order_number();
DROP FUNCTION IF EXISTS set_order_number();

-- Create improved order number generation function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT := EXTRACT(year FROM NOW())::TEXT;
    month_part TEXT := LPAD(EXTRACT(month FROM NOW())::TEXT, 2, '0');
    sequence_number INTEGER;
    new_order_number TEXT;
    max_attempts INTEGER := 100;
    attempt_count INTEGER := 0;
BEGIN
    LOOP
        -- Get the next sequence number for this month
        SELECT COALESCE(MAX(
            CASE 
                WHEN orders.order_number ~ '^ORD-[0-9]{6}[0-9]+$' 
                THEN CAST(SUBSTRING(orders.order_number FROM 9) AS INTEGER)
                ELSE 0
            END
        ), 0) + 1 + attempt_count
        INTO sequence_number
        FROM orders
        WHERE orders.order_number LIKE 'ORD-' || year_part || month_part || '%';
        
        -- Generate the order number
        new_order_number := 'ORD-' || year_part || month_part || LPAD(sequence_number::TEXT, 4, '0');
        
        -- Check if this order number already exists
        IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) THEN
            RETURN new_order_number;
        END IF;
        
        -- Increment attempt count to avoid infinite loop
        attempt_count := attempt_count + 1;
        IF attempt_count >= max_attempts THEN
            -- If we can't generate a unique number, use timestamp
            new_order_number := 'ORD-' || year_part || month_part || EXTRACT(epoch FROM NOW())::bigint::TEXT;
            RETURN new_order_number;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger function
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Test the function to make sure it works
DO $$
DECLARE
    test_number TEXT;
BEGIN
    test_number := generate_order_number();
    RAISE NOTICE 'Generated test order number: %', test_number;
END $$;
