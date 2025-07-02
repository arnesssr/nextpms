-- Fix for the location path function - removes array_reverse() dependency
-- Run this to replace the problematic function

-- Drop the existing function and trigger
DROP TRIGGER IF EXISTS trigger_update_location_path ON stock_locations;
DROP FUNCTION IF EXISTS update_location_path();

-- Create a corrected function that builds the path correctly without array_reverse
CREATE OR REPLACE FUNCTION update_location_path()
RETURNS TRIGGER AS $$
BEGIN
    -- Build path by traversing up the hierarchy
    WITH RECURSIVE location_hierarchy AS (
        -- Start with the current location
        SELECT 
            id,
            parent_id,
            location_code,
            location_code AS path_segment,
            0 AS level
        FROM stock_locations 
        WHERE id = NEW.id
        
        UNION ALL
        
        -- Recursively get parent locations
        SELECT 
            sl.id,
            sl.parent_id,
            sl.location_code,
            sl.location_code || '/' || lh.path_segment AS path_segment,
            lh.level + 1
        FROM stock_locations sl
        INNER JOIN location_hierarchy lh ON sl.id = lh.parent_id
    )
    SELECT 
        path_segment,
        level
    INTO NEW.path, NEW.level
    FROM location_hierarchy 
    WHERE parent_id IS NULL;
    
    -- If no parent found (root level), use just the location code
    IF NEW.path IS NULL THEN
        NEW.path := NEW.location_code;
        NEW.level := 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_update_location_path
    BEFORE INSERT OR UPDATE ON stock_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_location_path();

-- Alternative simpler approach - Update existing records to fix their paths
-- This builds paths by walking up the hierarchy for each location
UPDATE stock_locations SET path = (
    WITH RECURSIVE location_path AS (
        SELECT 
            id,
            parent_id,
            location_code,
            location_code AS current_path,
            0 AS depth
        FROM stock_locations s1
        WHERE s1.id = stock_locations.id
        
        UNION ALL
        
        SELECT 
            p.id,
            p.parent_id,
            p.location_code,
            p.location_code || '/' || lp.current_path,
            lp.depth + 1
        FROM stock_locations p
        INNER JOIN location_path lp ON p.id = lp.parent_id
    )
    SELECT current_path
    FROM location_path
    WHERE parent_id IS NULL
    LIMIT 1
);

-- Update levels for all locations
UPDATE stock_locations SET level = (
    WITH RECURSIVE location_levels AS (
        SELECT 
            id,
            parent_id,
            0 AS computed_level
        FROM stock_locations s1
        WHERE s1.id = stock_locations.id AND parent_id IS NULL
        
        UNION ALL
        
        SELECT 
            s.id,
            s.parent_id,
            ll.computed_level + 1
        FROM stock_locations s
        INNER JOIN location_levels ll ON s.parent_id = ll.id
    )
    SELECT COALESCE(MAX(computed_level), 0)
    FROM location_levels
);

-- Verify the fix by showing some sample paths
SELECT id, location_code, parent_id, path, level 
FROM stock_locations 
ORDER BY path;
