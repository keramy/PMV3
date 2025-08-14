# Formula PM V3 - UI to Production Implementation Plan

## 📋 Overview
This document tracks the integration of UI preview components with real APIs, database, and authentication. All UI components are built and styled - this plan focuses on connecting them to live data.

**Status**: 🎨 UI Complete → 🔌 API Integration Phase

---

## 🏗️ Phase 1: Core Infrastructure (Required First)

### Authentication & Context Setup
- [ ] **Wrap UI components with AuthProvider**
  - Files: `src/app/ui-preview/page.tsx`, `src/app/ui-preview/projects/[id]/page.tsx`
  - Add `const { user, profile } = useAuth()` to components
  - Show loading state while auth loads

- [ ] **Add permission checking to navigation**
  - File: `src/app/ui-preview/components/sidebar.tsx`
  - Use `hasPermission()` to show/hide menu items
  - Gray out restricted sections

- [ ] **User context for avatars and names**
  - Files: Shop drawings comments, dashboard activity feed
  - Replace "KT" hardcoded initials with `user.first_name[0] + user.last_name[0]`

### API Client Infrastructure
- [ ] **Setup React Query in UI Preview**
  - Wrap components in `QueryProvider`
  - Add loading states with skeletons
  - Add error boundaries for failed requests

- [ ] **Create API helper functions**
  - Add `src/hooks/useShopDrawings.ts`
  - Add `src/hooks/useComments.ts`
  - Add `src/hooks/useDashboardData.ts`

---

## 📊 Phase 2: Dashboard Components

### Main Dashboard (src/app/ui-preview/components/dashboard.tsx)
- [ ] **Replace mock KPI data**
  - Current: Static `kpiCards` array
  - Target: `GET /api/dashboard/metrics?project_id=${projectId}`
  - Add loading skeleton for cards

- [ ] **Connect activity feed**
  - Current: Static `recentActivity` array
  - Target: `GET /api/dashboard/activity?limit=10`
  - Add real-time updates every 30s

- [ ] **Wire project navigation**
  - Current: `router.push(\`/ui-preview/projects/\${projectId}\`)`
  - Target: `router.push(\`/projects/\${projectId}/workspace\`)`

- [ ] **Add error handling**
  - Show "Unable to load dashboard data" message
  - Retry button for failed requests
  - Graceful degradation for partial failures

### Projects Table (src/app/ui-preview/components/projects-table.tsx)
- [ ] **Fetch real projects**
  - Current: Static `projects` array
  - Target: `GET /api/projects?status=active&limit=50`
  - Add search/filter parameters

- [ ] **Add pagination**
  - Server-side pagination for large project lists
  - "Load more" or numbered pagination

- [ ] **Connect filters**
  - Status filter → API parameter
  - Search → debounced API call
  - Sort → API orderBy parameter

---

## 🏗️ Phase 3: Shop Drawings System

### Shop Drawings Table (src/app/ui-preview/components/shop-drawings-table.tsx)
- [ ] **Replace mock drawings data**
  - Current: Static `drawings` array  
  - Target: `GET /api/shop-drawings?project_id=${projectId}`
  - Add loading skeleton with table rows

- [ ] **Connect action buttons**
  - Download: Link to `drawing.file_url` or file storage
  - Submit to Client: `PUT /api/shop-drawings/${id}` status update
  - Add success/error toasts

- [ ] **Wire responsibility filters**
  - Current: Static filter buttons
  - Target: Add `responsibility` parameter to API call
  - Update counts dynamically

### Comments Modal (Already has structure, needs API)
- [ ] **Load comments**
  - Replace `getMockComments()` with:
  - `GET /api/shop-drawings/${drawingId}/comments`
  - Add loading spinner in modal

- [ ] **Post new comments**
  - Current: `console.log` in `handleAddComment()`
  - Target: `POST /api/shop-drawings/${drawingId}/comments`
  - Refresh comments list after successful post

- [ ] **Add comment type selector**
  - Dropdown with: General, Submittal, Client Feedback, Revision Request
  - Restrict types based on user permissions

- [ ] **Real-time updates**
  - Use React Query to refetch comments every 30s
  - Show "New comments" indicator
  - Auto-scroll to latest comment

---

## 📋 Phase 4: Scope Management

### Scope Table (src/app/ui-preview/components/scope-table.tsx)
- [ ] **Connect to scope API**
  - Current: Static scope data
  - Target: `GET /api/scope?project_id=${projectId}`
  - Maintain expandable row functionality

- [ ] **Wire multi-select filters**
  - Category checkboxes → API `category` array parameter
  - Assigned To → API `assigned_to` array parameter
  - Update statistics in real-time

- [ ] **Add Excel import/export**
  - Import button → file upload → `POST /api/scope/import`
  - Export button → `GET /api/scope/export` → download file

- [ ] **Connect expandable details**
  - Load additional data when row expands
  - `GET /api/scope/${id}/details` for cost breakdown

---

## 🧭 Phase 5: Navigation & Routing

### Breadcrumbs (src/components/ui/breadcrumb.tsx)
- [ ] **Connect to real routing**
  - Current: URL parameters (?view=dashboard)
  - Target: Proper Next.js routes (/dashboard, /projects, etc.)
  - Maintain current breadcrumb logic

- [ ] **Add route guards**
  - Check permissions before navigation
  - Redirect to dashboard if no access
  - Show loading state during permission check

### Sidebar Navigation (src/app/ui-preview/components/sidebar.tsx)
- [ ] **Add permission-based visibility**
  - Check `hasPermission()` for each menu item
  - Hide or gray out restricted items
  - Update active states based on real routes

- [ ] **Sync with project context**
  - Show current project name in project workspace
  - Update navigation based on project permissions

### URL Parameters → Real Routing
- [ ] **Convert view parameters to routes**
  - `/ui-preview?view=dashboard` → `/dashboard`
  - `/ui-preview?view=projects` → `/projects`
  - `/ui-preview?view=shop-drawings` → `/shop-drawings`

---

## 🏢 Phase 6: Project Workspace

### Project Tabs (src/app/ui-preview/projects/[id]/components/project-tabs.tsx)
- [ ] **Load project data**
  - Fetch project details for header
  - Update tab badges with real counts
  - `GET /api/projects/${id}/summary`

- [ ] **Connect each tab**
  - Overview → Project dashboard data
  - Scope → Scope items for this project
  - Drawings → Shop drawings filtered by project
  - Materials → Material specs for project
  - Tasks → Project tasks

- [ ] **Add lazy loading**
  - Only load tab data when tab is selected
  - Cache loaded data for quick switching
  - Show loading state on tab switch

### Project Sidebar (src/app/ui-preview/projects/[id]/components/project-sidebar.tsx)
- [ ] **Connect to main navigation**
  - Current: URL parameters
  - Target: Real routes with proper authentication
  - Maintain existing functionality

---

## 🧪 Testing Checklist

### Performance Testing (Construction Sites)
- [ ] **Slow network simulation**
  - Test with Chrome DevTools "Slow 3G"
  - Ensure <500ms navigation target maintained
  - Add timeout handling for slow connections

- [ ] **Offline mode handling**
  - Test with network disabled
  - Show appropriate "offline" messages
  - Cache critical data for offline viewing

### Permission Testing
- [ ] **Different user roles**
  - Test with PM, Admin, Field Worker accounts
  - Verify proper menu visibility
  - Test restricted action buttons

### Mobile Responsiveness
- [ ] **Tablet testing (primary construction device)**
  - Test on iPad/Android tablets
  - Verify touch targets are 44px minimum
  - Test modal usability on mobile

### Data Scale Testing
- [ ] **Large datasets**
  - Test with 100+ shop drawings
  - Test with 1000+ scope items
  - Verify pagination performance

---

## 📁 Integration Code Status

### Files with API Integration Ready (Commented)
- `src/app/ui-preview/components/shop-drawings-table.tsx` ✅
- `src/app/ui-preview/components/dashboard.tsx` 🔄 (Next)
- `src/app/ui-preview/components/scope-table.tsx` 🔄 (Next)
- `src/app/ui-preview/components/sidebar.tsx` 🔄 (Next)

### Integration Pattern
```typescript
// Current: Mock data
const mockData = [...]

// TODO: Replace with API call
/*
const { data, isLoading, error } = useQuery({
  queryKey: ['shop-drawings', projectId],
  queryFn: () => fetch(`/api/shop-drawings?project_id=${projectId}`).then(r => r.json())
})

if (isLoading) return <LoadingSkeleton />
if (error) return <ErrorBoundary />
*/
```

---

## 🎯 Success Metrics

### Technical Metrics
- [ ] All API calls respond within 500ms average
- [ ] Zero TypeScript compilation errors
- [ ] 95%+ test coverage on new integrations
- [ ] No console errors in production

### User Experience Metrics  
- [ ] Navigation feels instant (<100ms perceived)
- [ ] Comments load within 2 seconds
- [ ] Tables handle 500+ items smoothly
- [ ] Mobile experience matches desktop functionality

### Business Metrics
- [ ] Construction teams can use on job sites
- [ ] Project managers can track progress effectively
- [ ] Client interactions are streamlined
- [ ] Approval workflows reduce delays

---

## 📝 Notes for Developers

1. **Start with authentication** - Nothing works without proper user context
2. **Use React Query** - Already configured, provides caching and loading states
3. **Test incrementally** - Connect one component at a time
4. **Keep mock data** - Comment it out for easy testing/debugging
5. **Error boundaries** - Wrap major sections to prevent app crashes
6. **Loading states** - Every API call needs a loading state
7. **Mobile first** - Test on tablets throughout development

---

*Last Updated: January 2025*
*UI Implementation: ✅ Complete*  
*API Integration: 🔄 In Progress*