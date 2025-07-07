-- Get a sample customer ID for testing order creation
-- Run this in Supabase SQL editor to get a customer ID to use in the Order Create form

SELECT 
    id,
    name,
    email
FROM customers 
LIMIT 1;
