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
4. **Permissions**: ✅ NEW ROLE-BASED SYSTEM ACTIVE - Use `usePermissionsEnhanced()` hook
5. **Client Security**: ✅ RLS-enforced project isolation for clients implemented
6. **Cost Visibility**: ✅ Database-level cost field protection working
7. **Admin Dashboard**: Available at `/admin/users` for role management
8. **Testing**: Always run `npm run type-check` before committing

## Current Status - UPDATED August 2025
- **Production Ready**: ✅ Core functionality + Enhanced Permissions working
- **Active Tables**: 18+ database tables with enhanced RLS policies
- **API Routes**: 30+ endpoints with middleware + Admin endpoints
- **Auth Fixed**: December 2024 service role fix applied
- **Permission System**: ✅ COMPLETE - 5-Role hierarchy (Aug 2025) implemented
  - admin(100) → technical_manager(80) → project_manager(60) → team_member(30) → client(10)
  - Individual cost visibility overrides working
  - Client project isolation via assigned_projects array
- **Recent Migrations**: 
  - `20250122120000_enhanced_permission_system_foundation.sql` ✅
  - `20250122120100_client_isolation_rls_policies.sql` ✅  
  - `20250122120200_migrate_existing_permissions_data.sql` ✅ (optional)
- **Dev Server**: Runs on http://localhost:3001 (port 3000 in use)

---
*For comprehensive documentation, see `/docs/claude/` directory*
*Original documentation backed up to `CLAUDE.md.backup`*
- run this app only on port:3000 . if port3000 is in use that means our app is running on that port