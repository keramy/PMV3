-- Migration: enhance_shop_drawings_approval_workflow
-- Enhances shop drawings with approval workflow, version control, and permission-based access
-- Author: Formula PM V3 Development Team
-- Date: 2025-01-08

-- =============================================
-- 1. CREATE ENUMS FOR SHOP DRAWINGS
-- =============================================

-- Create approval stage enum for the workflow
CREATE TYPE shop_drawing_approval_stage AS ENUM (
  'not_submitted',
  'internal_review',
  'client_review', 
  'approved',
  'approved_with_comments',
  'rejected',
  'resubmit_required'
);

-- Create shop drawing category enum
CREATE TYPE shop_drawing_category AS ENUM (
  'architectural',
  'structural',
  'mechanical',
  'electrical',
  'plumbing',
  'hvac',
  'fire_protection',
  'technology',
  'specialty'
);

-- Create trade enum
CREATE TYPE construction_trade AS ENUM (
  'general_contractor',
  'electrical',
  'plumbing', 
  'hvac',
  'structural_steel',
  'concrete',
  'masonry',
  'roofing',
  'glazing',
  'flooring',
  'painting',
  'fire_protection',
  'technology',
  'landscaping',
  'specialty'
);

-- Create priority enum
CREATE TYPE priority_level AS ENUM (
  'low',
  'medium', 
  'high',
  'critical'
);

-- =============================================
-- 2. ENHANCE EXISTING SHOP_DRAWINGS TABLE
-- =============================================

-- Add new columns to existing shop_drawings table
ALTER TABLE shop_drawings 
ADD COLUMN scope_item_id uuid REFERENCES scope_items(id) ON DELETE SET NULL,
ADD COLUMN approval_stage shop_drawing_approval_stage DEFAULT 'not_submitted',
ADD COLUMN category shop_drawing_category,
ADD COLUMN trade construction_trade,
ADD COLUMN priority priority_level DEFAULT 'medium',
ADD COLUMN internal_reviewer_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
ADD COLUMN internal_review_date timestamp with time zone,
ADD COLUMN internal_approved boolean DEFAULT false,
ADD COLUMN client_reviewer_name text,
ADD COLUMN client_review_date timestamp with time zone,
ADD COLUMN client_approved boolean DEFAULT false,
ADD COLUMN final_approval_date timestamp with time zone,
ADD COLUMN rejection_reason text,
ADD COLUMN requires_resubmission boolean DEFAULT false,
ADD COLUMN estimated_review_days integer DEFAULT 5,
ADD COLUMN actual_review_days integer,
ADD COLUMN drawing_type text, -- e.g., 'fabrication', 'coordination', 'as_built'
ADD COLUMN sheet_count integer DEFAULT 1,
ADD COLUMN contractor_name text,
ADD COLUMN consultant_name text;

-- Update the existing status column to use new enum values
-- First, let's see what status values exist and update the constraint
ALTER TABLE shop_drawings DROP CONSTRAINT IF EXISTS shop_drawings_status_check;

-- Add new status constraint with enhanced values
ALTER TABLE shop_drawings ADD CONSTRAINT shop_drawings_status_check 
CHECK (status IN ('draft', 'pending', 'in_review', 'approved', 'rejected', 'on_hold', 'archived'));

-- =============================================
-- 3. CREATE SHOP_DRAWING_COMMENTS TABLE
-- =============================================

CREATE TABLE shop_drawing_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_drawing_id uuid NOT NULL REFERENCES shop_drawings(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    comment_type text NOT NULL CHECK (comment_type IN ('internal', 'client', 'system')),
    comment text NOT NULL,
    is_resolved boolean DEFAULT false,
    parent_comment_id uuid REFERENCES shop_drawing_comments(id) ON DELETE CASCADE,
    attachment_url text,
    markup_data jsonb, -- Store drawing markup/annotation data
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add comment for the table
COMMENT ON TABLE shop_drawing_comments IS 'Comments and feedback for shop drawing approval workflow';

-- =============================================
-- 4. CREATE SHOP_DRAWING_REVISIONS TABLE  
-- =============================================

CREATE TABLE shop_drawing_revisions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_drawing_id uuid NOT NULL REFERENCES shop_drawings(id) ON DELETE CASCADE,
    revision_number text NOT NULL, -- e.g., 'A', 'B', 'C', etc.
    revision_description text,
    file_url text,
    file_name text,
    file_size integer,
    uploaded_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    is_current boolean DEFAULT false, -- Only one revision should be current
    superseded_by uuid REFERENCES shop_drawing_revisions(id) ON DELETE SET NULL,
    approval_stage shop_drawing_approval_stage DEFAULT 'not_submitted',
    created_at timestamp with time zone DEFAULT now(),
    
    -- Ensure unique revision numbers per drawing
    UNIQUE(shop_drawing_id, revision_number)
);

-- Add comment for the table
COMMENT ON TABLE shop_drawing_revisions IS 'Version control for shop drawing revisions and file history';

-- =============================================
-- 5. CREATE TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for shop_drawing_comments
CREATE TRIGGER update_shop_drawing_comments_updated_at 
    BEFORE UPDATE ON shop_drawing_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. CREATE INDEXES FOR MOBILE PERFORMANCE
-- =============================================

-- Indexes for shop_drawings table
CREATE INDEX idx_shop_drawings_scope_item_id ON shop_drawings(scope_item_id);
CREATE INDEX idx_shop_drawings_approval_stage ON shop_drawings(approval_stage);
CREATE INDEX idx_shop_drawings_category ON shop_drawings(category);
CREATE INDEX idx_shop_drawings_trade ON shop_drawings(trade);
CREATE INDEX idx_shop_drawings_priority ON shop_drawings(priority);
CREATE INDEX idx_shop_drawings_internal_reviewer ON shop_drawings(internal_reviewer_id);
CREATE INDEX idx_shop_drawings_due_date ON shop_drawings(due_date);
CREATE INDEX idx_shop_drawings_project_status ON shop_drawings(project_id, approval_stage);
CREATE INDEX idx_shop_drawings_project_priority ON shop_drawings(project_id, priority);

-- Indexes for shop_drawing_comments table
CREATE INDEX idx_shop_drawing_comments_drawing_id ON shop_drawing_comments(shop_drawing_id);
CREATE INDEX idx_shop_drawing_comments_user_id ON shop_drawing_comments(user_id);
CREATE INDEX idx_shop_drawing_comments_type ON shop_drawing_comments(comment_type);
CREATE INDEX idx_shop_drawing_comments_created_at ON shop_drawing_comments(created_at DESC);
CREATE INDEX idx_shop_drawing_comments_resolved ON shop_drawing_comments(is_resolved);

-- Indexes for shop_drawing_revisions table
CREATE INDEX idx_shop_drawing_revisions_drawing_id ON shop_drawing_revisions(shop_drawing_id);
CREATE INDEX idx_shop_drawing_revisions_current ON shop_drawing_revisions(shop_drawing_id, is_current) WHERE is_current = true;
CREATE INDEX idx_shop_drawing_revisions_uploaded_by ON shop_drawing_revisions(uploaded_by);
CREATE INDEX idx_shop_drawing_revisions_created_at ON shop_drawing_revisions(created_at DESC);

-- =============================================
-- 7. SETUP ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE shop_drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_drawing_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_drawing_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shop_drawings table
-- Users can view drawings for projects they have access to
CREATE POLICY "Users can view shop drawings for their projects" ON shop_drawings
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid()
        )
        OR 
        project_id IN (
            SELECT id FROM projects 
            WHERE created_by = auth.uid() OR project_manager = auth.uid()
        )
    );

-- Users with specific permissions can create drawings
CREATE POLICY "Users can create shop drawings with permission" ON shop_drawings
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE 'create_shop_drawings' = ANY(permissions)
        )
    );

-- Users can update drawings they created or have review permissions
CREATE POLICY "Users can update shop drawings with permission" ON shop_drawings
    FOR UPDATE USING (
        submitted_by = auth.uid()
        OR
        internal_reviewer_id = auth.uid()  
        OR
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE 'review_shop_drawings' = ANY(permissions)
            OR 'admin_shop_drawings' = ANY(permissions)
        )
    );

-- Only admins can delete drawings
CREATE POLICY "Admins can delete shop drawings" ON shop_drawings
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE 'admin_shop_drawings' = ANY(permissions)
        )
    );

-- RLS Policies for shop_drawing_comments table
-- Users can view comments for drawings they have access to
CREATE POLICY "Users can view comments for accessible drawings" ON shop_drawing_comments
    FOR SELECT USING (
        shop_drawing_id IN (
            SELECT id FROM shop_drawings
            WHERE project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
            OR project_id IN (
                SELECT id FROM projects WHERE created_by = auth.uid() OR project_manager = auth.uid()
            )
        )
    );

-- Users can create comments with permission
CREATE POLICY "Users can create comments with permission" ON shop_drawing_comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE 'comment_shop_drawings' = ANY(permissions)
        )
    );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON shop_drawing_comments
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own comments or admins can delete any
CREATE POLICY "Users can delete own comments or admins can delete any" ON shop_drawing_comments
    FOR DELETE USING (
        user_id = auth.uid()
        OR
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE 'admin_shop_drawings' = ANY(permissions)
        )
    );

-- RLS Policies for shop_drawing_revisions table
-- Users can view revisions for drawings they have access to
CREATE POLICY "Users can view revisions for accessible drawings" ON shop_drawing_revisions
    FOR SELECT USING (
        shop_drawing_id IN (
            SELECT id FROM shop_drawings
            WHERE project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
            OR project_id IN (
                SELECT id FROM projects WHERE created_by = auth.uid() OR project_manager = auth.uid()
            )
        )
    );

-- Users can create revisions with permission
CREATE POLICY "Users can create revisions with permission" ON shop_drawing_revisions
    FOR INSERT WITH CHECK (
        uploaded_by = auth.uid()
        AND
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE 'create_shop_drawings' = ANY(permissions)
        )
    );

-- Only uploaders and admins can update revisions
CREATE POLICY "Uploaders and admins can update revisions" ON shop_drawing_revisions
    FOR UPDATE USING (
        uploaded_by = auth.uid()
        OR
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE 'admin_shop_drawings' = ANY(permissions)
        )
    );

-- Only admins can delete revisions
CREATE POLICY "Admins can delete revisions" ON shop_drawing_revisions
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE 'admin_shop_drawings' = ANY(permissions)
        )
    );

-- =============================================
-- 8. CREATE HELPER FUNCTIONS
-- =============================================

-- Function to automatically calculate review days when approval stage changes
CREATE OR REPLACE FUNCTION calculate_review_days()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate actual review days when moving to approved/rejected states
    IF NEW.approval_stage IN ('approved', 'approved_with_comments', 'rejected') 
       AND OLD.approval_stage != NEW.approval_stage 
       AND NEW.submitted_at IS NOT NULL THEN
        NEW.actual_review_days = EXTRACT(DAYS FROM (NOW() - NEW.submitted_at))::integer;
    END IF;
    
    -- Set final approval date when fully approved
    IF NEW.approval_stage = 'approved' AND OLD.approval_stage != 'approved' THEN
        NEW.final_approval_date = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to shop_drawings table
CREATE TRIGGER calculate_review_days_trigger
    BEFORE UPDATE ON shop_drawings
    FOR EACH ROW EXECUTE FUNCTION calculate_review_days();

-- Function to ensure only one current revision per drawing
CREATE OR REPLACE FUNCTION ensure_single_current_revision()
RETURNS TRIGGER AS $$
BEGIN
    -- If this revision is being set as current, unset all others for this drawing
    IF NEW.is_current = true THEN
        UPDATE shop_drawing_revisions 
        SET is_current = false 
        WHERE shop_drawing_id = NEW.shop_drawing_id 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to shop_drawing_revisions table
CREATE TRIGGER ensure_single_current_revision_trigger
    BEFORE INSERT OR UPDATE ON shop_drawing_revisions
    FOR EACH ROW EXECUTE FUNCTION ensure_single_current_revision();

-- =============================================
-- 9. CREATE USEFUL VIEWS FOR CONSTRUCTION WORKFLOWS
-- =============================================

-- View for shop drawing dashboard with all relevant info
CREATE VIEW shop_drawings_dashboard AS
SELECT 
    sd.id,
    sd.project_id,
    p.name as project_name,
    sd.drawing_number,
    sd.title,
    sd.approval_stage,
    sd.category,
    sd.trade,
    sd.priority,
    sd.due_date,
    sd.submitted_at,
    sd.internal_approved,
    sd.client_approved,
    sd.actual_review_days,
    sd.estimated_review_days,
    up_submitter.first_name || ' ' || up_submitter.last_name as submitted_by_name,
    up_reviewer.first_name || ' ' || up_reviewer.last_name as internal_reviewer_name,
    si.title as scope_item_title,
    -- Count of unresolved comments
    (SELECT COUNT(*) FROM shop_drawing_comments sdc 
     WHERE sdc.shop_drawing_id = sd.id AND sdc.is_resolved = false) as unresolved_comments,
    -- Latest revision info
    sdr.revision_number as current_revision,
    sdr.file_url as current_file_url,
    sd.created_at,
    sd.updated_at
FROM shop_drawings sd
LEFT JOIN projects p ON sd.project_id = p.id
LEFT JOIN user_profiles up_submitter ON sd.submitted_by = up_submitter.id  
LEFT JOIN user_profiles up_reviewer ON sd.internal_reviewer_id = up_reviewer.id
LEFT JOIN scope_items si ON sd.scope_item_id = si.id
LEFT JOIN shop_drawing_revisions sdr ON sd.id = sdr.shop_drawing_id AND sdr.is_current = true;

-- =============================================
-- 10. INSERT SAMPLE PERMISSIONS FOR SHOP DRAWINGS
-- =============================================

-- Note: These would typically be added through an admin interface
-- Adding common shop drawing permissions that can be assigned to users

-- The permissions array in user_profiles can include:
-- 'view_shop_drawings' - Basic viewing access
-- 'create_shop_drawings' - Can create/submit new drawings  
-- 'review_shop_drawings' - Can perform internal reviews
-- 'comment_shop_drawings' - Can add comments and feedback
-- 'admin_shop_drawings' - Full administrative access
-- 'internal_review_drawings' - Can perform internal approval
-- 'client_review_drawings' - Can represent client reviews (for client portal users)

COMMENT ON COLUMN user_profiles.permissions IS 'Array of permissions including shop drawing permissions: view_shop_drawings, create_shop_drawings, review_shop_drawings, comment_shop_drawings, admin_shop_drawings, internal_review_drawings, client_review_drawings';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Add a completion log (will only insert if admin user exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE 'admin_shop_drawings' = ANY(permissions) 
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
            'Enhanced shop drawings approval workflow migration completed' as description,
            NOW() as created_at
        FROM user_profiles 
        WHERE 'admin_shop_drawings' = ANY(permissions)
        LIMIT 1;
    END IF;
END $$;