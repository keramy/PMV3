# Troubleshooting Guide - Formula PM V3

## 🔴 Critical Issues & Solutions

### Access Denied / 403 Forbidden Errors

**Symptoms:**
- "Access Denied" message on scope, materials, or drawings tabs
- API returns 403 Forbidden
- Console shows "permission denied for table user_profiles"

**Root Cause:**
Service role client not properly authenticated with PostgreSQL

**Solution:**
```typescript
// ✅ CORRECT - In /src/lib/api/middleware.ts
import { createClient } from '@supabase/supabase-js'
const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// ❌ WRONG - This breaks service role auth
import { createServerClient } from '@supabase/ssr'
// Don't use with custom cookies for service role!
```

### Missing User Permissions

**Symptoms:**
- User can login but sees no data
- API returns "Insufficient permissions"

**Solution:**
Update user permissions in database:
```sql
UPDATE user_profiles 
SET permissions = ARRAY[
  'view_all_projects',
  'create_projects',
  'view_scope',
  'manage_scope_items',
  'view_materials',
  'view_drawings',
  'view_tasks'
]
WHERE email = 'user@example.com';
```

### Routes Manifest Error

**Symptoms:**
```
Error: ENOENT: no such file or directory, 
open '.next/routes-manifest.json'
```

**Solution:**
Clear Next.js cache and rebuild:
```powershell
# Windows PowerShell
Remove-Item -Recurse -Force .next
npm run dev
```

### Tasks API 400 Bad Request

**Symptoms:**
- Tasks API returns 400
- Query validation fails

**Root Cause:**
URL parameters are strings but schema expects numbers/booleans

**Solution:**
Use `z.coerce` in validation schemas:
```typescript
const schema = z.object({
  page: z.coerce.number().default(1),      // Coerces string to number
  limit: z.coerce.number().default(20),
  active: z.coerce.boolean().optional()    // Coerces "true"/"false"
})
```

## 🟡 Common Development Issues

### Port Already in Use

**Symptom:**
```
Port 3000 is in use by process 18912, 
using available port 3001 instead.
```

**Solutions:**
1. Kill the process using the port:
```powershell
# Find process
netstat -ano | findstr :3000
# Kill process (replace PID)
taskkill /PID 18912 /F
```

2. Or just use the alternate port shown

### TypeScript Errors After Database Changes

**Symptom:**
Type errors after modifying database schema

**Solution:**
Regenerate types from actual database:
```typescript
// Using Supabase MCP
mcp__supabase__generate_typescript_types

// Then update your types file:
// /src/types/database.generated.ts
```

### Authentication Loop

**Symptom:**
Redirected to login repeatedly

**Potential Causes & Solutions:**

1. **Expired session:**
   - Clear cookies and login again

2. **RLS policies blocking user_profiles:**
   - Check RLS policies allow user to read own profile

3. **Missing middleware configuration:**
   - Ensure middleware.ts is in project root
   - Check matcher patterns include your routes

### Slow API Responses

**Symptoms:**
- APIs take > 2 seconds
- Timeouts on construction sites

**Solutions:**

1. **Add database indexes:**
```sql
CREATE INDEX idx_scope_items_project 
ON scope_items(project_id);
```

2. **Limit query results:**
```typescript
// Always paginate
.select('*')
.range(0, 20)
```

3. **Use select specific columns:**
```typescript
// Don't select everything
.select('id, name, status')  // ✅
.select('*')                  // ❌
```

## 🟢 Development Environment Issues

### Environment Variables Not Loading

**Symptom:**
"NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solution:**
1. Check `.env.local` exists (not `.env`)
2. Variables starting with `NEXT_PUBLIC_` are client-side
3. Restart dev server after changes

### PWA Manifest Icon Error

**Symptom:**
Browser console: "Resource size is not correct"

**Solution:**
Use specific icon sizes in manifest.json:
```json
"icons": [
  {
    "src": "/logos/logo-f.png",
    "sizes": "192x192",  // ✅ Specific size
    "type": "image/png"
  }
]
```

### Database Schema Mismatch

**Symptom:**
"Column does not exist" errors

**Never Trust Migrations:**
```typescript
// ❌ WRONG
// Looking at migration files for schema

// ✅ CORRECT
// Check actual database
mcp__supabase__execute_sql:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'your_table';
```

## 🔧 Debug Commands

### Check Running Processes (Windows)
```powershell
# See Node processes
tasklist | findstr node

# See what's using a port
netstat -ano | findstr :3002
```

### Database Debugging
```sql
-- Check user permissions
SELECT email, permissions 
FROM user_profiles 
WHERE email = 'user@example.com';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Test service role access
-- Run as service_role via Supabase dashboard
SELECT * FROM user_profiles LIMIT 1;
```

### Clear All Caches
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Clear node_modules cache  
Remove-Item -Recurse -Force node_modules/.cache

# Clear npm cache
npm cache clean --force
```

## 📞 Getting Help

### Information to Provide
1. Error message (exact)
2. Browser console errors
3. Network tab showing failed requests
4. Recent changes made
5. Environment (development/production)

### Quick Checks Before Asking
- [ ] Dev server is running
- [ ] Database is accessible
- [ ] User is logged in
- [ ] User has correct permissions
- [ ] No TypeScript errors
- [ ] Browser cache cleared

---
*Last Updated: December 2024*