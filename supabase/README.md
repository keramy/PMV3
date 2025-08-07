# Formula PM V3 Supabase Configuration

This directory contains the complete Supabase configuration for Formula PM V3, optimized for construction project management workflows with enhanced performance for construction sites.

## Overview

Formula PM V3 uses Supabase as its backend database and authentication system. The configuration is based on the proven V2 architecture but enhanced with:

- **Dynamic Permission System**: No fixed roles - fully configurable permissions
- **Construction Site Optimizations**: Extended timeouts and resilient connections
- **Performance Enhancements**: Optimized queries and caching for mobile devices
- **Enhanced RLS Policies**: Granular security for construction project data

## Directory Structure

```
supabase/
├── config.toml              # Supabase local development configuration
├── migrations/              # Database schema migrations
│   └── 20250124000000_complete_database_setup.sql
├── seed.sql                 # Initial data for development
└── README.md               # This file
```

## Configuration Files

### config.toml
Main Supabase configuration optimized for construction workflows:
- **Extended JWT expiry**: 4 hours (14400 seconds) for field workers
- **Increased file size limit**: 100MB for construction drawings
- **Optimized realtime settings**: Throttled for poor connectivity
- **Construction-specific auth settings**

### Database Migration
The main migration file `20250124000000_complete_database_setup.sql` contains:
- Complete V2 schema with V3 enhancements
- Dynamic permission system (no fixed roles)
- Optimized indexes for construction queries
- Row Level Security policies for multi-tenant access
- Utility functions for permission checking
- Construction-specific enums and types

## Key Features

### 1. Dynamic Permission System
Instead of fixed roles, users have configurable permission arrays:
```sql
-- User profiles table with dynamic permissions
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  permissions TEXT[] DEFAULT '{}',  -- Dynamic permissions
  -- ... other fields
);
```

### 2. Construction-Optimized Tables
Core tables designed for construction workflows:
- **projects**: Project lifecycle management
- **scope_items**: Construction scope tracking with enhanced V3 fields
- **tasks**: Task management with construction priorities
- **shop_drawings**: Drawing approval workflow
- **material_specs**: Material specification management
- **milestones**: Construction milestone tracking
- **rfis**: Request for Information workflow
- **change_orders**: Change order management

### 3. Performance Optimizations
- **Strategic indexes** for common construction queries
- **Optimized RLS policies** for company-level isolation
- **Utility functions** for permission checking
- **Connection health checks** for construction sites

### 4. Row Level Security (RLS)
Comprehensive security model:
- **Company-level isolation**: Users only see their company's data
- **Project-level access**: Granular project access control
- **Permission-based actions**: Dynamic permission checking
- **Audit-friendly**: All actions logged with user context

## Environment Variables Required

Create a `.env.local` file with these variables:

```bash
# Core Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Construction Site Optimizations
NEXT_PUBLIC_CONNECTION_TIMEOUT=30000
NEXT_PUBLIC_OFFLINE_MODE=true
NEXT_PUBLIC_JWT_EXPIRY=14400

# Optional Performance Settings
NEXT_PUBLIC_ENABLE_QUERY_CACHE=true
NEXT_PUBLIC_MAX_FILE_SIZE=50
```

## Database Schema Overview

### Core Entity Relationships
```
companies
├── user_profiles (dynamic permissions)
├── projects
│   ├── scope_items (enhanced V3)
│   ├── tasks
│   ├── shop_drawings
│   ├── material_specs
│   ├── milestones
│   ├── rfis
│   └── change_orders
├── clients
└── subcontractors
```

### Permission Categories
- **Project Management**: create_projects, edit_projects, view_project_costs
- **Scope Management**: manage_scope_items, assign_subcontractors, approve_scope_changes
- **Drawing Workflow**: upload_drawings, internal_review_drawings, approve_drawings
- **Task Management**: create_tasks, assign_tasks, complete_tasks
- **Administration**: manage_users, manage_permissions, manage_company_settings
- **Finance**: view_project_budgets, manage_change_orders, approve_invoices

## Development Setup

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase-cli
   ```

2. **Initialize local development**:
   ```bash
   supabase start
   ```

3. **Apply migrations**:
   ```bash
   supabase db reset
   ```

4. **Seed development data** (optional):
   ```bash
   supabase db seed
   ```

## Production Deployment

1. **Create Supabase project** at https://supabase.com
2. **Run migrations**:
   ```bash
   supabase db push
   ```
3. **Configure authentication** in Supabase dashboard
4. **Set up storage buckets** for construction documents
5. **Configure RLS policies** (already included in migration)

## Construction Site Optimizations

### Connection Resilience
- Extended timeouts (30 seconds) for poor connectivity
- Graceful degradation when offline
- Connection health monitoring
- Optimized retry logic

### Mobile Performance
- Paginated queries for mobile devices
- Compressed data transfers
- Strategic caching of frequently accessed data
- Optimized real-time subscriptions

### Security Features
- Multi-tenant data isolation
- Granular permission system
- Audit logging for compliance
- Secure file upload handling

## API Integration

The database is integrated with Next.js through:
- **Client-side queries**: `src/lib/supabase.ts`
- **Server-side operations**: `src/lib/supabase/server.ts`
- **Query helpers**: `src/lib/database/queries.ts`
- **Type definitions**: `src/types/database.ts`

## Monitoring and Maintenance

### Health Checks
Use the provided utility functions:
```typescript
import { checkDatabaseConnection, measureConnectionLatency } from '@/lib/database/queries'

// Check connection
const isConnected = await checkDatabaseConnection()

// Measure latency (useful for construction sites)
const latency = await measureConnectionLatency()
```

### Performance Monitoring
- Monitor query performance in Supabase dashboard
- Track connection latency for construction sites
- Monitor RLS policy performance
- Analyze slow queries and optimize

## Support and Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Formula PM V3 Docs**: See `/docs` directory
- **Construction Workflows**: See workflow-specific documentation
- **API Reference**: Auto-generated from TypeScript types

## Migration History

- **20250124000000**: Complete database setup with V3 enhancements
- Future migrations will be added here with descriptions

---

**Note**: This configuration is optimized for construction project management. For other use cases, adjust the schema, permissions, and optimizations accordingly.