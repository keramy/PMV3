# Formula PM V3 - AI Assistant Context

## 📚 Documentation Has Moved

The documentation has been reorganized for better maintainability and faster access.

**→ Main Documentation: [`/docs/claude/CLAUDE.md`](./docs/claude/CLAUDE.md)**

## Quick Links

### Essential Documentation
- [Database Guidelines](./docs/claude/DATABASE-GUIDELINES.md) - Schema, RLS, migrations
- [Authentication Patterns](./docs/claude/AUTHENTICATION-PATTERNS.md) - Auth system, patterns, fixes
- [API Patterns](./docs/claude/API-PATTERNS.md) - Route patterns, middleware
- [Development Guidelines](./docs/claude/DEVELOPMENT-GUIDELINES.md) - Code style, workflow
- [Troubleshooting](./docs/claude/TROUBLESHOOTING.md) - Common issues & solutions

## ⚠️ Critical Reminders for AI Assistants

1. **Database**: NEVER trust migration files - always check actual database state
2. **Auth**: Service role must use `createClient` from `@supabase/supabase-js`
3. **APIs**: All routes must use `apiMiddleware` for auth/validation
4. **Permissions**: ✅ PURE BITWISE SYSTEM ACTIVE - Use consolidated `usePermissions()` hook
5. **Client Security**: ✅ RLS-enforced project isolation for clients implemented
6. **Cost Visibility**: ✅ Database-level cost field protection working
7. **Admin Dashboard**: Available at `/admin/users` for role management
8. **Testing**: Always run `npm run type-check` before committing

## Current Status - UPDATED December 2024
- **Production Ready**: ✅ Core functionality + Enhanced Permissions working
- **Active Tables**: 18+ database tables with enhanced RLS policies
- **API Routes**: 30+ endpoints with middleware + Admin endpoints
- **Auth Fixed**: ✅ AUGUST 2025 - Console flood & infinite loops resolved
- **Database Schema**: ✅ AUGUST 2025 - All missing columns and relationships fixed
- **Permission System**: ✅ PURE BITWISE IMPLEMENTATION - Consolidated permission system
  - Single `usePermissions()` hook with all features
  - Pure bitwise permissions using PostgreSQL BIGINT
  - Eliminated hybrid system complexity
  - Admin bitwise: 268435455 (all 28 permission bits)
  - Middleware uses PermissionManager for efficient checking
- **Recent Migrations**: 
  - `20250122120000_enhanced_permission_system_foundation.sql` ✅
  - `20250122120100_client_isolation_rls_policies.sql` ✅  
  - `20250122120200_migrate_existing_permissions_data.sql` ✅ (optional)
  - `20250823_fix_missing_columns_schema.sql` ✅ (Aug 23, 2025)
- **Dev Server**: Runs on http://localhost:3000 (production standard port)

---
*For comprehensive documentation, see `/docs/claude/` directory*
*Original documentation backed up to `CLAUDE.md.backup`*
- **Port 3000**: Standard port - if occupied, app is already running
- **Database Fixes**: ✅ Duplicate foreign key constraints resolved
- **Middleware**: ✅ Pure bitwise permission loading implemented