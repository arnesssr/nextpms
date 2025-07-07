-- Sample data for testing the orders system
-- Run this in your Supabase SQL editor after running the main migration

-- Insert sample customers (if they don't exist)
INSERT INTO customers (name, email, phone, address, city, state, postal_code, country)
VALUES 
  ('John Doe', 'john.doe@example.com', '+1-555-0123', '123 Main St', 'Anytown', 'CA', '12345', 'USA'),
  ('Jane Smith', 'jane.smith@example.com', '+1-555-0124', '456 Oak Ave', 'Somewhere', 'NY', '54321', 'USA'),
  ('Bob Johnson', 'bob.johnson@example.com', '+1-555-0125', '789 Pine Rd', 'Elsewhere', 'TX', '67890', 'USA'),
  ('Alice Brown', 'alice.brown@example.com', '+1-555-0126', '321 Elm St', 'Nowhere', 'FL', '98765', 'USA'),
  ('Charlie Wilson', 'charlie.wilson@example.com', '+1-555-0127', '654 Maple Ave', 'Anywhere', 'WA', '54321', 'USA')
ON CONFLICT (email) DO NOTHING;

-- Get customer IDs for order creation
DO $$
DECLARE
    customer1_id UUID;
    customer2_id UUID;
    customer3_id UUID;
    customer4_id UUID;
    customer5_id UUID;
    order1_id UUID;
    order2_id UUID;
    order3_id UUID;
    order4_id UUID;
    order5_id UUID;
BEGIN
    -- Get customer IDs
    SELECT id INTO customer1_id FROM customers WHERE email = 'john.doe@example.com';
    SELECT id INTO customer2_id FROM customers WHERE email = 'jane.smith@example.com';
    SELECT id INTO customer3_id FROM customers WHERE email = 'bob.johnson@example.com';
    SELECT id INTO customer4_id FROM customers WHERE email = 'alice.brown@example.com';
    SELECT id INTO customer5_id FROM customers WHERE email = 'charlie.wilson@example.com';

    -- Insert sample orders
    INSERT INTO orders (
        customer_id, status, subtotal, tax_amount, shipping_amount, discount_amount, total_amount,
        payment_status, payment_method,
        shipping_name, shipping_address_line_1, shipping_city, shipping_state, shipping_postal_code, shipping_country,
        notes, created_at
    ) VALUES 
    (
        customer1_id, 'delivered', 150.00, 12.00, 10.00, 0.00, 172.00,
        'paid', 'credit_card',
        'John Doe', '123 Main St', 'Anytown', 'CA', '12345', 'USA',
        'First test order',
        NOW() - INTERVAL '7 days'
    ),
    (
        customer2_id, 'shipped', 89.99, 7.20, 0.00, 10.00, 87.19,
        'paid', 'paypal',
        'Jane Smith', '456 Oak Ave', 'Somewhere', 'NY', '54321', 'USA',
        'Express shipping',
        NOW() - INTERVAL '3 days'
    ),
    (
        customer3_id, 'processing', 250.50, 20.04, 15.00, 25.00, 260.54,
        'paid', 'credit_card',
        'Bob Johnson', '789 Pine Rd', 'Elsewhere', 'TX', '67890', 'USA',
        'Bulk order discount applied',
        NOW() - INTERVAL '1 day'
    ),
    (
        customer4_id, 'pending', 45.00, 3.60, 10.00, 0.00, 58.60,
        'pending', 'bank_transfer',
        'Alice Brown', '321 Elm St', 'Nowhere', 'FL', '98765', 'USA',
        'Payment pending',
        NOW() - INTERVAL '2 hours'
    ),
    (
        customer5_id, 'cancelled', 199.99, 16.00, 20.00, 0.00, 235.99,
        'refunded', 'credit_card',
        'Charlie Wilson', '654 Maple Ave', 'Anywhere', 'WA', '54321', 'USA',
        'Customer requested cancellation',
        NOW() - INTERVAL '5 days'
    )
    RETURNING id INTO order1_id, order2_id, order3_id, order4_id, order5_id;

    -- Insert sample order items for each order
    -- Order 1 items
    INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, status)
    SELECT 
        o.id,
        gen_random_uuid(),
        'Premium Widget',
        'PWD-001',
        2,
        50.00,
        100.00,
        'delivered'
    FROM orders o WHERE o.customer_id = customer1_id AND o.status = 'delivered';

    INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, status)
    SELECT 
        o.id,
        gen_random_uuid(),
        'Standard Widget',
        'SWD-002',
        1,
        50.00,
        50.00,
        'delivered'
    FROM orders o WHERE o.customer_id = customer1_id AND o.status = 'delivered';

    -- Order 2 items
    INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, status)
    SELECT 
        o.id,
        gen_random_uuid(),
        'Gadget Pro',
        'GAD-003',
        3,
        29.99,
        89.97,
        'shipped'
    FROM orders o WHERE o.customer_id = customer2_id AND o.status = 'shipped';

    -- Order 3 items
    INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, status)
    SELECT 
        o.id,
        gen_random_uuid(),
        'Enterprise Solution',
        'ENT-004',
        1,
        200.50,
        200.50,
        'processing'
    FROM orders o WHERE o.customer_id = customer3_id AND o.status = 'processing';

    INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, status)
    SELECT 
        o.id,
        gen_random_uuid(),
        'Add-on Module',
        'ADM-005',
        1,
        50.00,
        50.00,
        'processing'
    FROM orders o WHERE o.customer_id = customer3_id AND o.status = 'processing';

    -- Order 4 items
    INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, status)
    SELECT 
        o.id,
        gen_random_uuid(),
        'Basic Widget',
        'BWD-006',
        3,
        15.00,
        45.00,
        'pending'
    FROM orders o WHERE o.customer_id = customer4_id AND o.status = 'pending';

    -- Order 5 items
    INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, status)
    SELECT 
        o.id,
        gen_random_uuid(),
        'Luxury Widget',
        'LWD-007',
        1,
        199.99,
        199.99,
        'cancelled'
    FROM orders o WHERE o.customer_id = customer5_id AND o.status = 'cancelled';

    RAISE NOTICE 'Sample data inserted successfully!';
END $$;
