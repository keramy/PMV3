# Formula PM V3 - Clean Migration Instructions

## ⚠️ WARNING
This will DELETE ALL DATA in your Supabase database. Only proceed if you have no data to preserve!

## Step 1: Clean Reset (Remove Old Tables)

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/xrrrtwrfadcilwkgwacs/sql/new
2. Copy and paste the contents of: `supabase/migrations/00_clean_reset.sql`
3. Click "Run" to execute
4. You should see: "Public schema reset complete. Ready for V3 migration."

## Step 2: Apply V3 Schema

1. Stay in the SQL Editor
2. Click "New Query" to create a new tab
3. Copy and paste the contents of: `supabase/migrations/20250124000000_complete_database_setup.sql`
4. Click "Run" to execute
5. This will create all 13 Formula PM V3 tables

## Step 3: Verify Installation

1. Go to: http://localhost:3000/test-supabase
2. Click "Rerun Test"
3. You should see:
   - ✅ All environment variables configured
   - ✅ Connection healthy
   - ✅ All 7 tables found (companies, user_profiles, projects, scope_items, tasks, shop_drawings, material_specs)

## Alternative: Using Supabase CLI

If you prefer command line:

```bash
# Reset the database
npx supabase db reset --db-url "postgresql://postgres:535425Keramy!@db.xrrrtwrfadcilwkgwacs.supabase.co:5432/postgres"

# When prompted, type 'y' to confirm
```

## What Gets Created

### 13 Core Tables:
- `companies` - Multi-tenant support
- `user_profiles` - Users with dynamic permissions
- `clients` - Client organizations
- `subcontractors` - Construction subcontractors
- `projects` - Construction projects
- `scope_items` - Project scope management
- `tasks` - Task management
- `task_comments` - Task collaboration
- `shop_drawings` - Drawing approval workflow
- `material_specs` - Material specifications
- `milestones` - Project milestones
- `rfis` - Request for Information
- `change_orders` - Change order workflow

### Key Features:
- ✅ Dynamic permission system (no fixed roles!)
- ✅ Row Level Security (RLS) policies
- ✅ Construction-specific enums
- ✅ Optimized indexes for performance
- ✅ Audit trail support

## Troubleshooting

If you encounter errors:

1. **Permission denied**: Make sure you're using the correct database password
2. **Table already exists**: Run the clean reset SQL again
3. **Connection issues**: Check your .env.local file has correct credentials

## Next Steps

After successful migration:
1. The app is ready to use with V3 schema
2. You can create users and start testing
3. All construction workflows are available

---

**Database Credentials** (already in .env.local):
- Project: xrrrtwrfadcilwkgwacs
- Password: 535425Keramy!