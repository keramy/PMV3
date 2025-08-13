# Enhanced Shop Drawings Approval Workflow - Migration Guide

## Overview

This migration enhances Formula PM V3's shop drawings functionality with a complete approval workflow system, version control, and permission-based access designed specifically for construction project management.

## Files Created

1. **Migration File**: `supabase/migrations/20250108_enhance_shop_drawings_approval_workflow.sql`
2. **Database Helpers**: `src/lib/database/shop-drawings-helpers.ts`
3. **React Hook**: `src/hooks/useShopDrawings.ts`
4. **Enhanced Types**: Updated `src/types/database.ts`

## How to Apply the Migration

### Step 1: Apply the Supabase Migration

```bash
# Navigate to your project directory
cd C:\Users\Kerem\Desktop\PMV3

# Apply the migration to your Supabase database
supabase db push

# Or apply the specific migration file
supabase migration up
```

### Step 2: Verify Migration Success

After applying the migration, verify that the new tables and columns were created:

```sql
-- Check new columns in shop_drawings table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'shop_drawings' AND table_schema = 'public';

-- Verify new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'shop_drawing_%';
```

## New Database Schema

### Enhanced shop_drawings table

**New Columns Added:**
- `scope_item_id` - Links to scope items
- `approval_stage` - Workflow stage enum
- `category` - Drawing category (architectural, electrical, etc.)
- `trade` - Construction trade responsible
- `priority` - Priority level (low, medium, high, critical)
- `internal_reviewer_id` - Internal reviewer assignment
- `internal_review_date` - When internal review started
- `internal_approved` - Internal approval status
- `client_reviewer_name` - Client reviewer name
- `client_review_date` - When client review started
- `client_approved` - Client approval status
- `final_approval_date` - Final approval timestamp
- `rejection_reason` - Reason for rejection
- `requires_resubmission` - Resubmission flag
- `estimated_review_days` - Expected review duration
- `actual_review_days` - Actual review duration
- `drawing_type` - Type of drawing
- `sheet_count` - Number of sheets
- `contractor_name` - Contractor responsible
- `consultant_name` - Consultant name

### New Tables

#### shop_drawing_comments
- `id` (uuid, primary key)
- `shop_drawing_id` (references shop_drawings)
- `user_id` (references user_profiles)
- `comment_type` ('internal', 'client', 'system')
- `comment` (text content)
- `is_resolved` (boolean)
- `parent_comment_id` (for threaded comments)
- `attachment_url` (optional file)
- `markup_data` (jsonb for drawing annotations)
- `created_at`, `updated_at`

#### shop_drawing_revisions
- `id` (uuid, primary key)
- `shop_drawing_id` (references shop_drawings)
- `revision_number` (A, B, C, etc.)
- `revision_description` (change description)
- `file_url`, `file_name`, `file_size`
- `uploaded_by` (references user_profiles)
- `is_current` (only one revision can be current)
- `superseded_by` (references another revision)
- `approval_stage` (stage of this revision)
- `created_at`

### New Enums

- `shop_drawing_approval_stage`
- `shop_drawing_category`
- `construction_trade`
- `priority_level`

### New View

**shop_drawings_dashboard** - Optimized view combining data from all related tables for dashboard performance.

## Permission System

### New Shop Drawing Permissions

Add these permissions to user profiles as needed:

```sql
-- Example: Grant shop drawing permissions to a project manager
UPDATE user_profiles 
SET permissions = permissions || ARRAY[
  'view_shop_drawings',
  'create_shop_drawings',
  'review_shop_drawings',
  'comment_shop_drawings',
  'internal_review_drawings'
]
WHERE id = 'user_id_here';
```

**Available Permissions:**
- `view_shop_drawings` - Basic viewing access
- `create_shop_drawings` - Can create/submit new drawings
- `review_shop_drawings` - Can perform internal reviews
- `comment_shop_drawings` - Can add comments and feedback
- `admin_shop_drawings` - Full administrative access
- `internal_review_drawings` - Can perform internal approval
- `client_review_drawings` - Can represent client reviews

## Usage Examples

### 1. Basic Usage in Components

```typescript
import { useShopDrawings, useShopDrawingComments } from '@/hooks/useShopDrawings'

function ShopDrawingsPage({ projectId }: { projectId: string }) {
  const { 
    drawings, 
    isLoading, 
    createDrawing, 
    updateApproval 
  } = useShopDrawings(projectId)

  // Create new drawing
  const handleCreateDrawing = () => {
    createDrawing({
      project_id: projectId,
      title: 'Steel Fabrication Details',
      category: 'structural',
      trade: 'structural_steel',
      priority: 'high',
      estimated_review_days: 7
    })
  }

  // Update approval stage
  const handleApproval = (drawingId: string) => {
    updateApproval(drawingId, {
      approval_stage: 'internal_review',
      internal_reviewer_id: currentUser.id
    })
  }

  return (
    <div>
      {drawings.map(drawing => (
        <ShopDrawingCard 
          key={drawing.id} 
          drawing={drawing} 
          onApprove={() => handleApproval(drawing.id)}
        />
      ))}
    </div>
  )
}
```

### 2. Comments and Revisions

```typescript
function ShopDrawingDetail({ drawingId }: { drawingId: string }) {
  const { comments, addComment } = useShopDrawingComments(drawingId)
  const { revisions, addRevision } = useShopDrawingRevisions(drawingId)

  const handleAddComment = () => {
    addComment({
      shop_drawing_id: drawingId,
      user_id: currentUser.id,
      comment_type: 'internal',
      comment: 'Please revise the connection details'
    })
  }

  const handleAddRevision = (file: File) => {
    addRevision({
      shop_drawing_id: drawingId,
      revision_number: 'B',
      revision_description: 'Updated connection details',
      file_url: uploadedFileUrl,
      file_name: file.name,
      file_size: file.size,
      uploaded_by: currentUser.id,
      is_current: true
    })
  }

  return (
    <div>
      <CommentsSection comments={comments} onAddComment={handleAddComment} />
      <RevisionsSection revisions={revisions} onAddRevision={handleAddRevision} />
    </div>
  )
}
```

### 3. Critical Drawings Dashboard

```typescript
function CriticalDrawingsDashboard({ projectId }: { projectId: string }) {
  const { data: criticalDrawings } = useCriticalShopDrawings(projectId)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Critical Shop Drawings</h2>
      {criticalDrawings?.data?.map(drawing => (
        <div key={drawing.id} className="border-l-4 border-red-500 pl-4">
          <h3>{drawing.title}</h3>
          <p className="text-sm text-red-600">
            {drawing.approval_stage === 'rejected' 
              ? 'Rejected - requires resubmission'
              : `Due ${new Date(drawing.due_date).toLocaleDateString()}`
            }
          </p>
        </div>
      ))}
    </div>
  )
}
```

### 4. Direct Database Queries

```typescript
// Get dashboard data with filters
const { data } = await getShopDrawingsDashboard(projectId, {
  approval_stage: 'internal_review',
  trade: 'electrical',
  priority: 'high',
  limit: 20
})

// Search drawings
const { data } = await searchShopDrawings(projectId, 'lighting', {
  category: ['electrical'],
  approval_stage: ['pending', 'internal_review']
})

// Get statistics
const stats = await getShopDrawingStats(projectId)
console.log(stats.by_stage) // { not_submitted: 5, internal_review: 3, approved: 12 }
```

## Mobile Optimization Features

### 1. Performance Optimizations
- **Lightweight queries** for mobile connections
- **Paginated results** to reduce data transfer
- **Smart caching** with React Query
- **Optimistic updates** for better UX

### 2. Offline Support
```typescript
// Preload critical data for offline viewing
const { data } = await preloadCriticalShopDrawings(projectId)
```

### 3. Touch-Optimized Components
- 44px minimum touch targets for work gloves
- Swipe gestures for mobile navigation
- Optimized for tablet viewing on construction sites

## Construction Site Features

### 1. Role-Based Dashboards
```typescript
// Get drawings pending current user's review
const { data } = usePendingReviews(currentUser.id)
```

### 2. Priority-Based Alerts
```typescript
// Check if drawing needs immediate attention
const isCritical = isDrawingCritical(drawing)
```

### 3. Bulk Operations
```typescript
const { bulkUpdate } = useShopDrawingBulkOperations(projectId)

// Bulk assign reviewer
bulkUpdate(selectedDrawingIds, {
  internal_reviewer_id: reviewerId
})
```

## Row Level Security (RLS)

The migration includes comprehensive RLS policies that:

1. **Restrict access** to project team members only
2. **Permission-based operations** using the user_profiles.permissions array
3. **Automatic filtering** based on user roles
4. **Secure comment and revision access**

Users can only:
- View drawings for projects they're assigned to
- Create drawings if they have `create_shop_drawings` permission
- Review drawings if they're the assigned reviewer or have review permissions
- Comment on drawings they have access to

## Troubleshooting

### Common Issues

1. **Migration fails with foreign key error**
   - Ensure `scope_items` and `user_profiles` tables exist
   - Check that existing data has valid references

2. **Permission denied errors**
   - Verify RLS policies are applied correctly
   - Check user has required permissions in `user_profiles.permissions` array

3. **Performance issues**
   - Ensure indexes were created (check migration logs)
   - Use pagination for large datasets
   - Consider preloading critical data for mobile

### Verification Queries

```sql
-- Check if all indexes were created
SELECT indexname FROM pg_indexes WHERE tablename LIKE 'shop_drawing%';

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE 'shop_drawing%';

-- Test permission-based access
SELECT * FROM shop_drawings WHERE project_id = 'your_project_id';
```

## Next Steps

1. **Apply the migration** to your Supabase database
2. **Update your components** to use the new enhanced types and hooks
3. **Configure user permissions** for your team members
4. **Test the approval workflow** with sample data
5. **Integrate with file upload** for drawing attachments
6. **Add real-time subscriptions** for live updates

This enhanced shop drawings system provides a production-ready approval workflow optimized for construction project management with Formula PM V3's performance and mobile-first requirements.