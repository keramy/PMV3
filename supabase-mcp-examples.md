# Supabase MCP Usage Examples for PMV3

## 1. Check Security Vulnerabilities
```bash
# Run security advisor - catches missing RLS policies
mcp__supabase__get_advisors --type security
```

## 2. Quick Database Queries
```sql
-- Check active projects
mcp__supabase__execute_sql --query "SELECT id, name, status FROM projects WHERE status = 'active'"

-- Get user permissions
mcp__supabase__execute_sql --query "SELECT permissions FROM user_profiles WHERE id = 'user_id'"
```

## 3. Apply Migrations
```bash
# Add new permission column
mcp__supabase__apply_migration --name "add_budget_permission" --query "ALTER TABLE user_profiles ADD COLUMN can_view_budget BOOLEAN DEFAULT false"
```

## 4. Generate TypeScript Types
```bash
# Auto-generate types from database schema
mcp__supabase__generate_typescript_types
```

## 5. Debug Issues with Logs
```bash
# Check API logs for errors
mcp__supabase__get_logs --service api

# Check auth issues
mcp__supabase__get_logs --service auth

# Database query performance
mcp__supabase__get_logs --service postgres
```

## 6. Deploy Edge Functions
```javascript
// Deploy a custom webhook handler
mcp__supabase__deploy_edge_function --name "project-webhook" --files [
  {
    name: "index.ts",
    content: `
      import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
      
      serve(async (req) => {
        const { project_id, event } = await req.json()
        // Handle project events
        return new Response(JSON.stringify({ success: true }))
      })
    `
  }
]
```

## 7. Create Development Branch
```bash
# Create isolated testing environment
mcp__supabase__create_branch --name "feature-timeline"

# Test migrations on branch before production
mcp__supabase__apply_migration --name "timeline_tables" --query "CREATE TABLE timelines (...)"

# Merge when ready
mcp__supabase__merge_branch --branch_id "branch_id"
```

## 8. Performance Monitoring
```bash
# Check for performance issues
mcp__supabase__get_advisors --type performance

# Analyze slow queries
mcp__supabase__execute_sql --query "
  SELECT query, mean_exec_time, calls 
  FROM pg_stat_statements 
  ORDER BY mean_exec_time DESC 
  LIMIT 10
"
```

## Key Benefits for PMV3:

1. **Faster Development**: Direct database access without leaving your IDE
2. **Better Debugging**: Real-time logs across all services
3. **Type Safety**: Auto-generate types whenever schema changes
4. **Security**: Proactive vulnerability detection
5. **Branch Testing**: Test migrations safely before production
6. **Performance**: Identify and fix slow queries quickly

## Common Workflow:

1. Make schema changes with `apply_migration`
2. Generate new types with `generate_typescript_types`
3. Check security with `get_advisors`
4. Test on branch before merging
5. Monitor with `get_logs` during development