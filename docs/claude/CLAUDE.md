# Formula PM V3 - Documentation Hub

## 🚀 Project Overview

Formula PM V3 is a **construction project management platform** built with:
- **Next.js 15** App Router for performance
- **Supabase** for database and authentication  
- **TypeScript** for type safety
- **Tailwind CSS + Shadcn/ui** for UI
- **React Query** for data fetching

### Core Principles
- **SIMPLICITY** - Clean, maintainable code (no 400+ line files)
- **MOBILE-FIRST** - Optimized for construction site tablets
- **PERMISSION-BASED** - Dynamic RBAC system
- **PERFORMANCE** - Sub-500ms page navigation

## 📚 Documentation Structure

### Essential Guides
- [**Database Guidelines**](./DATABASE-GUIDELINES.md) - Schema management, RLS policies, migrations
- [**Authentication Patterns**](./AUTHENTICATION-PATTERNS.md) - Auth hooks, API middleware, session management
- [**API Development**](./API-PATTERNS.md) - Route patterns, middleware usage, error handling
- [**Bitwise Permissions**](./PERMISSIONS-BITWISE.md) - Complete bitwise permission system guide

### Development Guides  
- [**Component Architecture**](./COMPONENT-ARCHITECTURE.md) - UI components, hooks, providers
- [**Development Guidelines**](./DEVELOPMENT-GUIDELINES.md) - Code style, testing, best practices
- [**Technical Stack**](./TECHNICAL-STACK.md) - Dependencies, file structure, environment setup

### Feature Documentation
- [**Workflows**](./WORKFLOWS.md) - Shop drawings, material specs, scope management
- [**UI Design System**](./UI-DESIGN-SYSTEM.md) - Colors, typography, components, mobile patterns

### Reference
- [**Troubleshooting**](./TROUBLESHOOTING.md) - Common issues and solutions
- [**MCP Integration**](./MCP-INTEGRATION.md) - Supabase MCP tools usage

## ⚠️ Critical Reminders

### Database Management
- **NEVER** assume schema from migration files
- **ALWAYS** use `mcp__supabase__execute_sql` to check actual database state
- Database has been manually modified beyond migrations

### Authentication
- All API routes must use `apiMiddleware.permissions()` or `apiMiddleware.auth()`
- Service role authentication uses `createClient` from `@supabase/supabase-js`
- Hooks must include `x-user-id` header in API calls

### Current Status
- **18 Database Tables**: Working with proper RLS policies
- **Authentication**: Fixed service role access (December 2024)
- **API Routes**: 30+ endpoints using centralized middleware
- **UI Components**: Project workspace with 5 main tabs

## 🔗 Quick Links

### Active Development
- Main application: `http://localhost:3002`
- Database: Supabase project (check .env.local)
- Repository: `https://github.com/keramy/PMV3`

### Key Files
- API Middleware: `/src/lib/api/middleware.ts`
- Auth Hook: `/src/hooks/useAuth.ts`
- Database Types: `/src/types/database.generated.ts`
- Project Layout: `/src/app/projects/[id]/page.tsx`

---
*Last Updated: December 2024*
*For Claude AI context - keep this file under 150 lines*