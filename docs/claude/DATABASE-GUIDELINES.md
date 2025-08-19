# Database Guidelines - Formula PM V3

## 🚨 Critical Database Management Rules

### NEVER Trust Migration Files
The database has been **manually modified** beyond what's in migration files. Always verify the actual database state before making changes.

**Wrong Approach:**
```bash
# ❌ Looking at migration files to understand schema
cat supabase/migrations/*.sql
```

**Correct Approach:**
```sql
-- ✅ Check actual database state
mcp__supabase__execute_sql:
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'scope_items';
```

## 📊 Current Database Schema

### Active Tables (18 tables)
```
activity_logs          - User activity tracking
change_orders         - Project change requests
companies             - Company/client information
material_specs        - Material specifications
material_specs_pm_dashboard - PM view for materials
notification_preferences - User notification settings
notifications         - System notifications
project_members       - Project team assignments
projects             - Main projects table
punch_items          - Quality control items
rfis                 - Requests for information
scope_items          - Project scope breakdown
shop_drawing_comments - Drawing review comments
shop_drawings        - Construction drawings
subcontractors       - Subcontractor directory
task_comments        - Task discussion threads
tasks                - Project tasks
user_profiles        - User profiles & permissions
```

### Known Schema Modifications
These columns exist in production but may not be in migrations:
- `scope_items.actual_cost` - Track actual vs estimated costs
- `scope_items.start_date` - Task scheduling
- `scope_items.end_date` - Task completion dates
- `scope_items.priority` - Task prioritization
- `scope_items.subcontractor_id` - Subcontractor assignment

## 🔒 RLS (Row Level Security) Policies

### Current Working Pattern
Service role bypasses RLS for admin operations:

```sql
-- Service role can read all user_profiles (for permission checks)
CREATE POLICY "service_role_access" ON user_profiles
FOR SELECT TO service_role
USING (true);

-- Users can only see their own profile
CREATE POLICY "users_own_profile" ON user_profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);
```

### Common RLS Patterns

**Project-based access:**
```sql
-- Users see projects they're members of
CREATE POLICY "project_members_access" ON projects
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = projects.id
    AND user_id = auth.uid()
  )
);
```

**Permission-based access:**
```sql
-- Users with specific permissions can access
CREATE POLICY "permission_based_access" ON sensitive_table
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND 'required_permission' = ANY(permissions)
  )
);
```

## 🔧 Database Operations

### Checking Current Schema
```typescript
// Generate TypeScript types from actual database
mcp__supabase__generate_typescript_types

// Check specific table structure
mcp__supabase__execute_sql:
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Safe Migration Practices
1. **Always backup first** - Take a database backup before migrations
2. **Test on branch** - Use Supabase branches for testing
3. **Verify after migration** - Check that expected changes occurred
4. **Update types** - Regenerate TypeScript types after schema changes

### Common Gotchas
- ❌ Don't assume `completion_percentage` exists on scope_items (it doesn't)
- ❌ Don't try to remove `actual_cost` column (it's actively used)
- ❌ Don't trust migration file timestamps (manual changes bypass migrations)
- ✅ Always check actual database state before modifications
- ✅ Use service role for admin operations that need to bypass RLS

## 📝 SQL Patterns for Common Operations

### Get User Permissions
```sql
SELECT email, permissions 
FROM user_profiles 
WHERE email = 'admin@formulapm.com';
```

### Check Project Access
```sql
SELECT p.*, pm.role
FROM projects p
JOIN project_members pm ON pm.project_id = p.id
WHERE pm.user_id = 'user-uuid-here';
```

### Update User Permissions
```sql
UPDATE user_profiles 
SET permissions = permissions || ARRAY['new_permission']
WHERE email = 'user@example.com'
AND NOT ('new_permission' = ANY(permissions));
```

## 🚀 Performance Tips

1. **Index frequently queried columns** - Check existing indexes first
2. **Use proper JOIN order** - Start with smallest result set
3. **Limit SELECT columns** - Don't use `SELECT *` in production
4. **Consider materialized views** - For complex reporting queries
5. **Monitor slow queries** - Use Supabase dashboard analytics

---
*Last Updated: December 2024*