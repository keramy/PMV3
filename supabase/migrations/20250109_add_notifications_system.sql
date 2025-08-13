-- ============================================================================
-- NOTIFICATIONS SYSTEM MIGRATION
-- Adds in-app notification support for Formula PM V3
-- ============================================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'task_assignment',
        'task_mention', 
        'task_status_change',
        'task_due_reminder',
        'task_comment',
        'project_update'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    in_app_enabled BOOLEAN DEFAULT true,
    mention_notifications BOOLEAN DEFAULT true,
    assignment_notifications BOOLEAN DEFAULT true,
    status_change_notifications BOOLEAN DEFAULT true,
    due_date_notifications BOOLEAN DEFAULT true,
    comment_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);
CREATE INDEX IF NOT EXISTS notifications_read_at_idx ON notifications(read_at);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- System can insert notifications (via service role)
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- RLS Policies for notification preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can manage own notification preferences" ON notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM user_profiles 
WHERE id NOT IN (SELECT user_id FROM notification_preferences);

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications 
        WHERE user_id = target_user_id 
        AND read_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_as_read(target_user_id UUID, notification_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
    update_count INTEGER;
BEGIN
    UPDATE notifications 
    SET read_at = NOW()
    WHERE user_id = target_user_id 
    AND id = ANY(notification_ids)
    AND read_at IS NULL;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    RETURN update_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    update_count INTEGER;
BEGIN
    UPDATE notifications 
    SET read_at = NOW()
    WHERE user_id = target_user_id 
    AND read_at IS NULL;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    RETURN update_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification creation helper function
CREATE OR REPLACE FUNCTION create_notification(
    target_user_id UUID,
    notification_type TEXT,
    notification_title TEXT,
    notification_message TEXT,
    notification_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    new_notification_id UUID;
    user_preferences RECORD;
BEGIN
    -- Check if user has this type of notification enabled
    SELECT * INTO user_preferences
    FROM notification_preferences 
    WHERE user_id = target_user_id;
    
    -- If no preferences found, create default ones
    IF NOT FOUND THEN
        INSERT INTO notification_preferences (user_id) VALUES (target_user_id);
        SELECT * INTO user_preferences
        FROM notification_preferences 
        WHERE user_id = target_user_id;
    END IF;
    
    -- Check if user wants this type of notification
    IF NOT user_preferences.in_app_enabled THEN
        RETURN NULL;
    END IF;
    
    -- Check specific notification type preferences
    IF notification_type = 'task_assignment' AND NOT user_preferences.assignment_notifications THEN
        RETURN NULL;
    END IF;
    
    IF notification_type = 'task_mention' AND NOT user_preferences.mention_notifications THEN
        RETURN NULL;
    END IF;
    
    IF notification_type = 'task_status_change' AND NOT user_preferences.status_change_notifications THEN
        RETURN NULL;
    END IF;
    
    IF notification_type = 'task_due_reminder' AND NOT user_preferences.due_date_notifications THEN
        RETURN NULL;
    END IF;
    
    IF notification_type = 'task_comment' AND NOT user_preferences.comment_notifications THEN
        RETURN NULL;
    END IF;
    
    -- Create the notification
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (target_user_id, notification_type, notification_title, notification_message, notification_data)
    RETURNING id INTO new_notification_id;
    
    RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE notifications IS 'In-app notifications for construction project management';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification delivery';
COMMENT ON FUNCTION create_notification IS 'Helper function to create notifications with preference checking';