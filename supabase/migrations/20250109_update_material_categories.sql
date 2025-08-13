-- Migration: update_material_categories  
-- Updates material categories to new simplified system
-- Author: Formula PM V3 Development Team
-- Date: 2025-01-09

-- =============================================
-- 1. MIGRATE EXISTING CATEGORY DATA
-- =============================================

-- Map old construction categories to new material-based categories
UPDATE material_specs 
SET category = CASE 
    WHEN category = 'construction' THEN 'stone'        -- Building materials → Stone/concrete
    WHEN category = 'millwork' THEN 'wood'            -- Custom woodwork → Wood
    WHEN category = 'electrical' THEN 'hardware'      -- Electrical components → Hardware
    WHEN category = 'mechanical' THEN 'hardware'      -- HVAC/plumbing → Hardware
    WHEN category = 'finishes' THEN 'paint'           -- Surface finishes → Paint
    WHEN category = 'fixtures' THEN 'hardware'        -- Fixtures → Hardware
    WHEN category = 'hardware' THEN 'hardware'        -- Hardware stays hardware
    WHEN category = 'specialties' THEN 'miscellaneous' -- Specialties → Miscellaneous
    ELSE 'miscellaneous'                               -- Default for unknown
END
WHERE category IS NOT NULL;

-- =============================================
-- 2. ADD CONSTRAINT FOR NEW CATEGORIES
-- =============================================

-- Add check constraint to ensure only valid categories are used
ALTER TABLE material_specs 
DROP CONSTRAINT IF EXISTS material_specs_category_check;

ALTER TABLE material_specs 
ADD CONSTRAINT material_specs_category_check 
CHECK (category IN (
    'wood',
    'metal', 
    'glass',
    'stone',
    'paint',
    'floor',
    'fabric',
    'hardware',
    'miscellaneous'
));

-- =============================================
-- 3. UPDATE TABLE COMMENTS
-- =============================================

-- Update column comment to reflect new categories
COMMENT ON COLUMN material_specs.category IS 'Material category: wood, metal, glass, stone, paint, floor, fabric, hardware, miscellaneous. Based on actual material type rather than trade.';

-- =============================================
-- 4. UPDATE STATISTICS FUNCTION (IF NEEDED)
-- =============================================

-- The calculateStatistics function in the API will automatically work with new categories
-- No database changes needed since it uses dynamic category counting

-- =============================================
-- 5. UPDATE PM DASHBOARD VIEW
-- =============================================

-- The material_specs_pm_dashboard view doesn't need changes
-- It just displays the category field as-is

-- =============================================
-- 6. LOG MIGRATION COMPLETION
-- =============================================

-- Insert completion log
DO $$
BEGIN
    -- Insert completion log if admin user exists
    IF EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE 'admin' = ANY(permissions) OR 'approve_material_specs' = ANY(permissions)
        LIMIT 1
    ) THEN
        INSERT INTO activity_logs (
            project_id,
            user_id, 
            action,
            description,
            created_at
        )
        SELECT 
            NULL as project_id,
            id as user_id,
            'system_migration' as action,
            'Updated material categories to simplified material-based system (wood, metal, glass, etc.)' as description,
            NOW() as created_at
        FROM user_profiles 
        WHERE 'admin' = ANY(permissions) OR 'approve_material_specs' = ANY(permissions)
        LIMIT 1;
    END IF;
END $$;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================