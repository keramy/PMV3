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
4. **Permissions**: Check user has specific permissions, not just high-level ones
5. **Testing**: Always run `npm run type-check` before committing

## Current Status
- **Production Ready**: Core functionality working
- **Active Tables**: 18 database tables with RLS
- **API Routes**: 30+ endpoints with middleware
- **Auth Fixed**: December 2024 service role fix applied
- **Dev Server**: Runs on http://localhost:3002

---
*For comprehensive documentation, see `/docs/claude/` directory*
*Original documentation backed up to `CLAUDE.md.backup`*