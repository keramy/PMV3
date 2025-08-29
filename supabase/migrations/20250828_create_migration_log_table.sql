-- Create Migration Log Table
-- Date: 2025-08-28  
-- Purpose: Create the missing migration_log table for tracking migration execution

BEGIN;

-- ============================================================================
-- CREATE MIGRATION LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.migration_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    migration_name text NOT NULL UNIQUE,
    description text,
    executed_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Add some indexes for performance
CREATE INDEX IF NOT EXISTS idx_migration_log_name ON migration_log(migration_name);
CREATE INDEX IF NOT EXISTS idx_migration_log_executed_at ON migration_log(executed_at);

-- Enable RLS for security (only admins should see migration logs)
ALTER TABLE migration_log ENABLE ROW LEVEL SECURITY;

-- Create policy for migration log access (admin only)
CREATE POLICY "migration_log_admin_only" ON migration_log
FOR ALL
USING (
  COALESCE(
    (SELECT permissions_bitwise & 262144 FROM user_profiles WHERE id = auth.uid()),
    0
  ) > 0
);

-- ============================================================================
-- LOG THIS MIGRATION
-- ============================================================================

INSERT INTO public.migration_log (migration_name, description, executed_at)
VALUES (
  '20250828_create_migration_log_table',
  'Created migration_log table for tracking migration execution history',
  NOW()
);

SELECT 'Migration log table created successfully!' as status;

COMMIT;