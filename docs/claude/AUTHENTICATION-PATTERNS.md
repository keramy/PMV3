# Authentication Patterns - Formula PM V3

## 🔐 Current Authentication Architecture

### Core Authentication Hook
Located at `/src/hooks/useAuth.ts` - Simplified from v2's 448-line monster to ~100 lines.

```typescript
// Usage in components
const { user, profile, loading, isAuthenticated } = useAuth()

// Returns:
interface AuthState {
  user: User | null           // Supabase auth user
  profile: AppUserProfile | null  // User profile with permissions
  loading: boolean            // Loading state
  isAuthenticated: boolean    // Quick auth check
}
```

### Critical Fix: Service Role Authentication
**Problem**: Middleware couldn't read user_profiles table
**Solution**: Use `@supabase/supabase-js` createClient instead of SSR version

```typescript
// ✅ CORRECT - Works with service role
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

// ❌ WRONG - Breaks service role auth
import { createServerClient } from '@supabase/ssr'
// Don't use this with custom cookie config for service role!
```

## 📡 API Route Authentication

### Middleware Pattern (`/src/lib/api/middleware.ts`)

**Basic Authentication:**
```typescript
export const GET = apiMiddleware.auth(
  async (user, request) => {
    // user is authenticated
    // user.id, user.email, user.permissions available
    return NextResponse.json({ data })
  }
)
```

**Permission-Based Access:**
```typescript
export const GET = apiMiddleware.permissions(
  ['view_scope', 'manage_scope_items'], // Required permissions
  async (user, request) => {
    // User has required permissions
    return NextResponse.json({ data })
  }
)
```

**Query Validation + Auth:**
```typescript
const querySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(100).default(20)
})

export const GET = apiMiddleware.queryValidate(
  querySchema,
  async (validatedQuery, user, request) => {
    // Query is validated AND user is authenticated
    return NextResponse.json({ data })
  }
)
```

## 🎣 Client-Side API Calls

### Required Pattern for Hooks
All API hooks MUST include authentication headers:

```typescript
// ✅ CORRECT Hook Pattern
export function useProjectData(projectId: string) {
  const { profile } = useAuth()
  
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: { 'x-user-id': profile?.id || '' } // ← CRITICAL
      })
      
      if (!response.ok) {
        if (response.status === 401) throw new Error('UNAUTHORIZED')
        if (response.status === 403) throw new Error('FORBIDDEN')
        throw new Error(`Failed to fetch`)
      }
      
      return response.json()
    },
    enabled: !!profile?.id, // ← Only run when authenticated
  })
}
```

## 🔑 Permission System

### User Profile Structure
```typescript
interface UserProfile {
  id: string
  email: string
  permissions: string[]  // Dynamic permission array
  job_title?: string
  // ... other fields
}
```

### Common Permissions
```typescript
// Project permissions
'view_all_projects'    // See all company projects
'create_projects'      // Create new projects
'manage_all_projects'  // Edit/delete any project

// Feature permissions
'view_scope'          // View scope items
'manage_scope_items'  // Create/edit/delete scope
'view_materials'      // View material specs
'approve_material_specs' // PM approval rights
'view_drawings'       // View shop drawings
'manage_drawings'     // Upload/manage drawings
'view_tasks'         // View tasks
'manage_tasks'       // Create/edit tasks

// Financial permissions
'view_financial_data'  // See costs and budgets
'export_data'         // Export to Excel/CSV
```

## 🐛 Common Authentication Issues & Fixes

### Issue: "Access Denied" on API calls
**Cause**: Missing permissions in user_profiles
**Fix**: Update user permissions in database
```sql
UPDATE user_profiles 
SET permissions = ARRAY['view_scope', 'manage_scope_items', ...]
WHERE email = 'user@example.com';
```

### Issue: 401 Unauthorized
**Cause**: Missing or expired session
**Fix**: Check authentication state before API calls
```typescript
if (!profile?.id) {
  // Redirect to login or show auth required message
  return
}
```

### Issue: Service role can't read user_profiles
**Cause**: Wrong Supabase client initialization
**Fix**: Use `createClient` from `@supabase/supabase-js` (see above)

### Issue: Hooks not updating on auth change
**Cause**: Missing auth state subscription
**Fix**: Ensure useAuth hook subscribes to auth changes
```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      // Handle auth state changes
    }
  )
  return () => subscription.unsubscribe()
}, [])
```

## 🔒 Security Best Practices

1. **Never expose service role key** to client-side code
2. **Always validate permissions** at API route level
3. **Use RLS policies** as defense in depth
4. **Include user ID in API calls** for audit trails
5. **Handle auth errors gracefully** in UI
6. **Refresh tokens proactively** before expiration
7. **Clear sensitive data** on logout

## 📝 Testing Authentication

### Manual Testing Checklist
- [ ] Login flow works
- [ ] Logout clears all data
- [ ] Protected routes redirect when not authenticated
- [ ] API calls include proper headers
- [ ] Permission-based UI elements show/hide correctly
- [ ] Token refresh works before expiration
- [ ] Error states display properly

### Debug Endpoints
- `/auth-debug` - Authentication debugging page
- `/api/auth-debug` - API endpoint for auth testing

---
*Last Updated: December 2024*