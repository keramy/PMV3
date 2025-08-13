-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create task_comments table for task management system
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    comment TEXT NOT NULL,
    comment_type TEXT DEFAULT 'comment' CHECK (comment_type IN ('comment', 'status_change', 'assignment', 'attachment')),
    mentions UUID[] DEFAULT ARRAY[]::UUID[], -- Array of mentioned user IDs
    attachments JSONB DEFAULT '[]'::jsonb, -- File metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add tags and attachments to tasks table if not exists
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_comments_mentions ON task_comments USING GIN(mentions);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);

-- RLS Policies
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Users can view comments on tasks they have access to
CREATE POLICY "task_comments_select_policy" ON task_comments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM tasks t 
        JOIN project_members pm ON t.project_id = pm.project_id 
        WHERE t.id = task_comments.task_id 
        AND pm.user_id = auth.uid()
    )
);

-- Users can create comments on tasks they have access to
CREATE POLICY "task_comments_insert_policy" ON task_comments FOR INSERT
WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM tasks t 
        JOIN project_members pm ON t.project_id = pm.project_id 
        WHERE t.id = task_comments.task_id 
        AND pm.user_id = auth.uid()
    )
);

-- Users can update their own comments
CREATE POLICY "task_comments_update_policy" ON task_comments FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "task_comments_delete_policy" ON task_comments FOR DELETE
USING (user_id = auth.uid());

-- Updated at trigger for task_comments
CREATE OR REPLACE TRIGGER update_task_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();