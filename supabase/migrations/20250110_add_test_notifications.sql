/**
 * Add Test Notifications for Formula PM V3
 * Creates sample notifications for testing the notifications system
 * Uses proper notification types matching the CHECK constraint
 */

-- Insert test notifications for the admin user
-- Note: This uses the service role to bypass RLS policies
INSERT INTO notifications (user_id, type, title, message, data) VALUES 
(
    '2c481dc9-90f6-45b4-a5c7-d4c98add23e5',
    'task_assignment',
    'New Task Assignment: Foundation Inspection',
    'You have been assigned to inspect the foundation work for Building A',
    '{"project_id": "proj_1", "task_id": "task_1", "priority": "high", "assigned_by": "john@formulapm.com"}'::jsonb
),
(
    '2c481dc9-90f6-45b4-a5c7-d4c98add23e5',
    'project_update',
    'Shop Drawing Requires Review',
    'Structural drawings for Phase 1 are waiting for your approval',
    '{"project_id": "proj_1", "drawing_id": "drawing_1", "submitted_by": "contractor@company.com"}'::jsonb
),
(
    '2c481dc9-90f6-45b4-a5c7-d4c98add23e5',
    'task_status_change',
    'Task Status Updated: Rough Electrical Complete',
    'The rough electrical work has been marked as completed',
    '{"project_id": "proj_1", "task_id": "task_2", "old_status": "in_progress", "new_status": "completed", "changed_by": "electrician@crew.com"}'::jsonb
),
(
    '2c481dc9-90f6-45b4-a5c7-d4c98add23e5',
    'task_due_reminder',
    'Task Due Tomorrow: HVAC Inspection',
    'Your HVAC system inspection is due tomorrow',
    '{"project_id": "proj_1", "task_id": "task_3", "due_date": "2025-01-11", "days_until_due": 1}'::jsonb
),
(
    '2c481dc9-90f6-45b4-a5c7-d4c98add23e5',
    'task_comment',
    'New Comment on Plumbing Rough-in',
    'Site supervisor added a comment about the plumbing installation',
    '{"project_id": "proj_1", "task_id": "task_4", "comment_id": "comment_1", "commented_by": "supervisor@site.com", "comment_preview": "Looks good but need to check water pressure"}'::jsonb
);

-- Also insert one read notification to test filtering
INSERT INTO notifications (user_id, type, title, message, data, read_at) VALUES 
(
    '2c481dc9-90f6-45b4-a5c7-d4c98add23e5',
    'project_update',
    'Weekly Progress Report Available',
    'The weekly progress report for all active projects has been generated',
    '{"report_type": "weekly_progress", "generated_at": "2025-01-08T10:00:00Z"}'::jsonb,
    NOW() - INTERVAL '2 hours'
);