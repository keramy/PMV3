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
interface AppUserProfile {
  id: string
  email: string
  permissions_bitwise: number  // Bitwise permission value
  role?: string | null
  assigned_projects?: string[]
  job_title?: string
  // Legacy permissions array generated from bitwise for compatibility
  permissions?: string[]
}
```

### Bitwise Permission System
```typescript
// User has bitwise permission value (e.g. 268435455 for admin)
const { hasPermission, canViewCosts, isAdmin } = usePermissions()

// Permission checking uses efficient bitwise operations
const canManageScope = hasPermission('manage_scope_items') // Maps to PERMISSIONS.MANAGE_SCOPE
const canViewFinancials = hasPermission('view_financial_data') // Maps to PERMISSIONS.VIEW_FINANCIAL_DATA

// Common bitwise permission values:
// Admin: 268435455 (all 28 permission bits)
// Project Manager: 184549375
// Team Member: 4718594  
// Client: 34818
```

## 🐛 Common Authentication Issues & Fixes

### Issue: "Access Denied" on API calls
**Cause**: Missing bitwise permissions in user_profiles
**Fix**: Update user permissions using bitwise values
```sql
-- Set admin permissions (all 28 bits)
UPDATE user_profiles 
SET permissions_bitwise = 268435455, role = 'admin'
WHERE email = 'admin@example.com';

-- Set project manager permissions
UPDATE user_profiles 
SET permissions_bitwise = 184549375, role = 'project_manager'
WHERE email = 'pm@example.com';
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

## 🔥 NEW: Bitwise Permission Troubleshooting

### Issue: "permissions column does not exist"
**Cause**: Middleware trying to access removed permissions array column
**Fix**: Our middleware now properly uses `permissions_bitwise` column
```typescript
// ✅ FIXED in middleware.ts
const { data: profile } = await supabase
  .from('user_profiles')
  .select('permissions_bitwise, role')
  .eq('id', userId)
  .single()
```

### Issue: User permissions showing as 0 or null
**Cause**: User has no bitwise permissions assigned
**Fix**: Assign proper role-based permissions
```sql
-- Assign admin permissions
UPDATE user_profiles 
SET permissions_bitwise = 268435455, role = 'admin'
WHERE email = 'user@example.com';

-- Check user bitwise permissions
SELECT email, permissions_bitwise, role
FROM user_profiles 
WHERE email = 'user@example.com';

-- Check if user has specific permission (e.g. VIEW_SCOPE = 2)
SELECT email, (permissions_bitwise & 2) > 0 as can_view_scope
FROM user_profiles 
WHERE email = 'user@example.com';
```

---
*Last Updated: December 2024 - Bitwise System Implementation*