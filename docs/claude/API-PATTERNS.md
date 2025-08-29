# API Patterns - Formula PM V3

## 🚀 API Route Structure

All API routes follow Next.js 15 App Router conventions in `/src/app/api/`

### File Organization
```
/api/
├── scope/                  # Scope management
│   ├── route.ts           # GET (list), POST (create)
│   ├── [id]/
│   │   └── route.ts       # GET, PUT, DELETE (single item)
│   └── excel/
│       ├── import/route.ts # POST (Excel import)
│       └── export/route.ts # GET (Excel export)
├── tasks/                  # Task management
├── shop-drawings/          # Drawing management
├── material-specs/         # Material specifications
└── dashboard/             # Dashboard endpoints
    ├── metrics/
    ├── activity/
    └── critical-tasks/
```

## 🛡️ API Middleware Pattern

All routes use centralized middleware from `/src/lib/api/middleware.ts`:

### Basic Authenticated Route
```typescript
import { apiMiddleware } from '@/lib/api/middleware'

export const GET = apiMiddleware.auth(
  async (user, request) => {
    // user is authenticated with id, email, permissions
    const data = await fetchData(user.id)
    return NextResponse.json({ data })
  }
)
```

### Permission-Protected Route
```typescript
import { SCOPE_PERMISSIONS } from '@/types/scope'

export const POST = apiMiddleware.permissions(
  SCOPE_PERMISSIONS.CREATE, // ['view_scope', 'manage_scope_items']
  async (user, request) => {
    const body = await request.json()
    const result = await createItem(body)
    return NextResponse.json({ data: result })
  }
)
```

### Validated Query Parameters
```typescript
const querySchema = z.object({
  project_id: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['active', 'completed']).optional(),
  search: z.string().max(100).optional()
})

export const GET = apiMiddleware.queryValidate(
  querySchema,
  async (params, user, request) => {
    // params are validated and typed
    const { page, limit, project_id } = params
    // ... fetch data
  }
)
```

### Body Validation
```typescript
const createSchema = z.object({
  name: z.string().min(1).max(200),
  project_id: z.string().uuid(),
  status: z.enum(['pending', 'active']),
  assigned_to: z.string().uuid().optional()
})

export const POST = apiMiddleware.validate(
  createSchema,
  async (data, user, request) => {
    // data is validated and typed
    const created = await db.items.create(data)
    return NextResponse.json({ data: created })
  }
)
```

## 📊 Response Patterns

### Success Response
```typescript
return NextResponse.json({
  data: result,           // Main data
  pagination: {          // Optional pagination
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5
  },
  statistics: {          // Optional statistics
    total_items: 100,
    completed: 45
  }
}, { status: 200 })
```

### Error Response
```typescript
// Use built-in ApiResponses helpers
return ApiResponses.unauthorized('Please login')
return ApiResponses.forbidden('Insufficient permissions')
return ApiResponses.badRequest('Invalid data', validationDetails)
return ApiResponses.notFound('Resource not found')
return ApiResponses.internalError('Something went wrong')
```

## 🔍 Common API Patterns

### List with Filters
```typescript
export const GET = apiMiddleware.queryValidate(
  listSchema,
  async (params, user, request) => {
    const supabase = await createClient()
    
    let query = supabase
      .from('items')
      .select('*', { count: 'exact' })
    
    // Apply filters
    if (params.project_id) {
      query = query.eq('project_id', params.project_id)
    }
    
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`)
    }
    
    // Pagination
    const offset = (params.page - 1) * params.limit
    query = query.range(offset, offset + params.limit - 1)
    
    // Sorting
    query = query.order(params.sort_field, { 
      ascending: params.sort_direction === 'asc' 
    })
    
    const { data, count, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / params.limit)
      }
    })
  }
)
```

### Create with Validation
```typescript
export const POST = apiMiddleware.validate(
  createSchema,
  async (data, user, request) => {
    const supabase = await createClient()
    
    // Add audit fields
    const itemData = {
      ...data,
      created_by: user.id,
      created_at: new Date().toISOString()
    }
    
    const { data: created, error } = await supabase
      .from('items')
      .insert(itemData)
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') { // Unique violation
        return ApiResponses.badRequest('Item already exists')
      }
      throw error
    }
    
    return NextResponse.json({ data: created }, { status: 201 })
  }
)
```

### Update with Permissions
```typescript
export const PUT = apiMiddleware.permissions(
  ['manage_items'],
  async (user, request, { params }) => {
    const { id } = params
    const body = await request.json()
    const supabase = await createClient()
    
    // Validate update data
    const updateData = updateSchema.parse(body)
    
    // Add audit fields
    updateData.updated_by = user.id
    updateData.updated_at = new Date().toISOString()
    
    const { data: updated, error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return ApiResponses.notFound('Item not found')
      }
      throw error
    }
    
    return NextResponse.json({ data: updated })
  }
)
```

## 🎯 Best Practices

### DO:
- ✅ Use centralized middleware for auth/validation
- ✅ Return consistent response structures
- ✅ Include pagination for list endpoints
- ✅ Add proper TypeScript types
- ✅ Handle specific database errors
- ✅ Include audit fields (created_by, updated_at)
- ✅ Use transactions for multi-table operations

### DON'T:
- ❌ Duplicate auth/validation logic
- ❌ Return raw database errors to client
- ❌ Use `SELECT *` without limits
- ❌ Forget to validate UUID parameters
- ❌ Mix business logic with route handlers
- ❌ Return sensitive data without permission checks

## 🐛 Common Issues

### Issue: Query parameters not validating
**Solution**: Use `z.coerce` for type conversion
```typescript
z.coerce.number() // Converts string to number
z.coerce.boolean() // Converts "true"/"false" to boolean
```

### Issue: 500 errors on database operations
**Solution**: Wrap in try/catch and handle specific errors
```typescript
try {
  const result = await supabase.from('table').select()
  // ...
} catch (error) {
  console.error('[API Error]', error)
  return ApiResponses.internalError('Database operation failed')
}
```

### Issue: CORS errors
**Solution**: CORS is handled automatically by Next.js, check if calling correct URL

## 🔥 NEW: Bitwise Permission Middleware

### Updated Middleware Implementation
Our middleware now uses the efficient bitwise permission system:

```typescript
// /src/lib/api/middleware.ts - Updated for bitwise
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest): Promise<Response> => {
    // Get user permissions from database using bitwise column
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('permissions_bitwise, role') // ✅ No more permissions array
      .eq('id', middlewareUserId)
      .single()
    
    if (profile) {
      user.permissions_bitwise = profile.permissions_bitwise || 0
      user.role = profile.role || null
      // Generate permissions array from bitwise for compatibility
      user.permissions = PermissionManager.getPermissionNames(user.permissions_bitwise)
    }
    
    return await handler(user, request)
  }
}
```

### Bitwise Permission Mapping
```typescript  
// Middleware maps old Permission strings to bitwise constants
const PERMISSION_MAPPING: Partial<Record<Permission, number>> = {
  'manage_scope_items': PERMISSIONS.MANAGE_SCOPE,        // 256
  'view_financial_data': PERMISSIONS.VIEW_FINANCIAL_DATA, // 32
  'approve_shop_drawings': PERMISSIONS.APPROVE_SHOP_DRAWINGS, // 16384
  'manage_users': PERMISSIONS.MANAGE_ALL_USERS,          // 262144
  // ... complete mapping
}

// Efficient bitwise permission check
const hasRequiredPermission = permissions.some(permission => {
  const bitwiseConstant = PERMISSION_MAPPING[permission]
  return PermissionManager.hasPermission(user.permissions_bitwise!, bitwiseConstant)
})
```

### Fixed Issues
- ✅ **"permissions column does not exist"** - Middleware now uses `permissions_bitwise`  
- ✅ **Duplicate foreign key constraints** - Removed duplicate `tasks_project_id_fkey`
- ✅ **Hybrid permission complexity** - Pure bitwise system implementation
- ✅ **Performance improvements** - Single integer vs array operations

---
*Last Updated: December 2024 - Bitwise System Integration*