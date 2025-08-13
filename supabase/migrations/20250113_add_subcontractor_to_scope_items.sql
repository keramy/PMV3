-- Formula PM V3: Add subcontractor relationship to scope_items
-- This migration links scope items to subcontractors table for proper contractor management

-- Add subcontractor_id column to scope_items table
ALTER TABLE scope_items 
ADD COLUMN IF NOT EXISTS subcontractor_id UUID REFERENCES subcontractors(id) ON DELETE SET NULL;

-- Create index for performance on subcontractor lookups
CREATE INDEX IF NOT EXISTS idx_scope_items_subcontractor_id ON scope_items(subcontractor_id);

-- Add comment to document the relationship
COMMENT ON COLUMN scope_items.subcontractor_id IS 'Links scope item to assigned subcontractor for work execution';

-- Update RLS policies to include subcontractor relationship
-- Policy for viewing scope items (includes subcontractor data)
DROP POLICY IF EXISTS "Users can view scope items in their projects" ON scope_items;
CREATE POLICY "Users can view scope items in their projects" ON scope_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = scope_items.project_id
            AND pm.user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND 'view_all_projects' = ANY(up.permissions)
        )
    );

-- Policy for creating scope items
DROP POLICY IF EXISTS "Users can create scope items with permission" ON scope_items;
CREATE POLICY "Users can create scope items with permission" ON scope_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND 'create_scope_items' = ANY(up.permissions)
        )
    );

-- Policy for updating scope items
DROP POLICY IF EXISTS "Users can update scope items with permission" ON scope_items;
CREATE POLICY "Users can update scope items with permission" ON scope_items
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND 'edit_scope_items' = ANY(up.permissions)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND 'edit_scope_items' = ANY(up.permissions)
        )
    );

-- Policy for deleting scope items
DROP POLICY IF EXISTS "Users can delete scope items with permission" ON scope_items;
CREATE POLICY "Users can delete scope items with permission" ON scope_items
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND 'delete_scope_items' = ANY(up.permissions)
        )
    );

-- Grant necessary permissions
GRANT SELECT ON subcontractors TO authenticated;
GRANT SELECT ON scope_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON scope_items TO authenticated;