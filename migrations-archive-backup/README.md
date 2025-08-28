# ⚠️ ARCHIVED MIGRATION FILES - DO NOT EXECUTE

**WARNING: These files are ARCHIVED and should NEVER be executed!**

## Purpose
These are the original migration files that were consolidated into `20250827_complete_consolidated_migration.sql`. They are kept here for reference only.

## ❌ DO NOT RUN THESE MIGRATIONS
- These files contain duplicate schema definitions
- Running them would create table conflicts
- They contain circular RLS dependencies that cause infinite recursion
- They were replaced by the consolidated migration for good reasons

## What happened?
- **Date**: August 27, 2025
- **Action**: All 18 migration files consolidated into single comprehensive migration
- **Reason**: Fix circular dependencies, schema mismatches, and migration tracking issues
- **Result**: Clean, working database schema without recurring problems

## Files archived:
- 20250107_complete_schema.sql (original base schema)
- 20250108_enhance_shop_drawings_approval_workflow.sql
- 20250109_*.sql (material specs, notifications, task comments)
- 20250112_add_cost_tracking_to_scope_items.sql
- 20250113_add_subcontractor_to_scope_items.sql
- 20250122*.sql (enhanced permission system)
- 202508*.sql (August 2025 RLS fixes)

## Current active migration:
**Only use**: `../20250827_complete_consolidated_migration.sql`

## If you need to reference old logic:
✅ Safe: Read these files for reference
❌ NEVER: Execute or apply these files to any database

---
**This directory is excluded from Git and should never be pushed to production!**