# Formula PM V3 - Project Context for Claude

## 🚨 CRITICAL CONTEXT

### Project Vision
Formula PM V3 is a **complete rebuild** of v2 focusing on:
- **SIMPLICITY** over complexity (v2 had 448-line useAuth hook!)
- **FLEXIBLE PERMISSIONS** - Admin-configurable without code changes
- **FAST NAVIGATION** - < 500ms between pages
- **CONSTRUCTION-FOCUSED** - Built for real construction workflows
- **MOBILE-FIRST** - Field workers are primary users

## ✅ COMPLETED FOUNDATION (Phase 1)

### 🎉 Tasks 1-9.6 Complete - Foundation SOLID! 
- ✅ **Next.js 15 Project** - App Router with construction optimizations
- ✅ **Dependencies Installed** - All packages from package-dependencies.md  
- ✅ **Tailwind + Shadcn/ui** - Complete component system
- ✅ **Supabase Integration** - Database, auth, API clients configured
- ✅ **Database Schema** - 13 consolidated tables with proper relationships
- ✅ **User Profile Trigger** - Automatic profile creation working perfectly
- ✅ **Admin User Created** - Full permissions, login tested and working
- ✅ **Simplified Auth System** - 3 focused hooks replace 448-line v2 hook
- ✅ **API Protection** - Middleware with construction site optimizations
- ✅ **Dashboard APIs Validated** - All 5 APIs tested and working with authentication
- ✅ **Smart Navigation** - Mobile-first tabbed interface with permissions
- ✅ **Dashboard** - Role-specific views with realistic construction data
- ✅ **Comprehensive Testing** - Database, APIs, authentication all validated
- ✅ **Code Repository** - Pushed to GitHub (105 files, 22K+ lines)

### 🏗️ Architecture Achievements
- **Database**: 13/13 tables accessible, consolidated migration applied
- **Authentication**: Admin login working, session management solid
- **APIs**: Activity feed, metrics, critical tasks, project progress, role data - all responding
- **Performance**: API response times 200-500ms, <500ms navigation targets MET
- **Mobile-First**: Touch-optimized for construction sites and tablets  
- **Security**: Dynamic permission system with RBAC architecture working
- **Testing**: Comprehensive test suites validate all core functionality
- **Data Quality**: Realistic construction activities (electrical, plumbing, HVAC, etc.)
- **Type-Safe**: Complete TypeScript implementation throughout

## 🚀 CURRENT STATUS - Foundation Complete, Phase 2 Ready

**Working Directory**: `C:\Users\Kerem\Desktop\PMV3`
**Reference Files**: `C:\Users\Kerem\Desktop\PMV3\formulapmv3copiedfromv2` (READ-ONLY)

### 📊 TESTING RESULTS (All Green!)
- **Database Connection**: ✅ PASS - All 13 tables accessible  
- **Authentication**: ✅ PASS - Admin user login working
- **Dashboard APIs**: ✅ PASS - All 5 APIs responding with realistic data
  - Activity Feed: 10 construction activities (tasks, drawings, milestones)
  - Critical Tasks: Urgent items for attention
  - Metrics: KPIs and performance indicators  
  - Project Progress: Overall project status
  - Role Data: User role-specific information
- **Environment**: ✅ PASS - All variables configured
- **Repository**: ✅ PASS - Code pushed to https://github.com/keramy/PMV3

### 🎯 Next Priority: Core Features (Tasks 10-21)
1. **Task 10**: 🚧 **IN PROGRESS** - Project workspace foundation with tabbed interface
2. **Task 11**: Scope management with Excel import/export
3. **Task 12**: Shop drawings approval workflow
4. **Task 13**: Material specs approval workflow
5. **Task 14**: Task management system with comments
6. **Task 15**: Timeline/Gantt chart visualization
7. **Task 16**: Milestones tracking system
8. **Task 17**: RFIs (Request for Information) workflow
9. **Task 18**: Change orders workflow with internal/client approval
10. **Task 19**: QC/Punch lists quality control tracking
11. **Task 20**: Subcontractors/suppliers management
12. **Task 21**: Client portal access system

## 🔧 Tech Stack (IMPLEMENTED)

### Core Framework
- **Framework**: Next.js 15 with App Router ✅
- **Database**: Supabase PostgreSQL (v2 schema preserved) ✅
- **Styling**: Tailwind CSS + Shadcn/ui ✅
- **Language**: TypeScript throughout ✅
- **Data**: @tanstack/react-query for caching ✅
- **Forms**: react-hook-form + zod ✅
- **Charts**: recharts (Gantt, timelines) ✅
- **Files**: react-dropzone, xlsx/exceljs ✅
- **Deployment**: Vercel (ready)

## 🗂️ Current File Structure

```
src/
├── app/
│   ├── dashboard/ (✅ Role-specific dashboard with parallel routes)
│   ├── projects/[id]/ (✅ Project workspace foundation)
│   ├── api/ (✅ Protected API routes with construction optimizations)
│   └── layout.tsx (✅ Main app layout)
├── components/
│   ├── dashboard/ (✅ Metrics, charts, activity feeds)
│   ├── layout/ (✅ AppShell, MainNav)
│   ├── project/ (✅ ProjectNav, ProjectStatus)
│   └── ui/ (✅ Shadcn/ui components)
├── hooks/
│   ├── useAuth.ts (✅ 28 lines - simplified from v2's 448 lines)
│   ├── usePermissions.ts (✅ 48 lines - O(1) permission checking)
│   ├── useAuthActions.ts (✅ 75 lines - auth actions only)
│   └── useDashboardData.ts (✅ React Query hooks)
├── lib/
│   ├── supabase.ts (✅ Optimized clients)
│   ├── permissions.ts (✅ Dynamic permission system)
│   ├── api-middleware.ts (✅ Construction site optimizations)
│   └── database/queries.ts (✅ Pre-built construction queries)
└── providers/
    ├── QueryProvider.tsx (✅ React Query setup)
    └── ProjectProvider.tsx (✅ Project context)
```

## 🔐 Dynamic Permission System (IMPLEMENTED)

### Revolutionary Permission Arrays
```typescript
// NO MORE FIXED ROLES! ✅
user_profile {
  job_title: "Project Manager"  // Just descriptive text
  permissions: [               // Real access control
    "create_projects",
    "view_project_costs", 
    "internal_review_drawings"
  ]
}

// Usage in components ✅
const { hasPermission } = usePermissions()
{hasPermission('view_project_costs') && <BudgetInfo />}
```

## 📱 Mobile-First Construction Features (IMPLEMENTED)

### Construction Site Optimizations
- **Touch Targets**: 44px minimum for work gloves ✅
- **Network Resilience**: 30-second timeouts, retry logic ✅
- **Offline Caching**: 24-hour session persistence ✅
- **Performance**: <500ms navigation achieved ✅
- **Real-time Updates**: Construction workflow coordination ✅

## 🔄 Environment Setup

### Required Environment Variables
```bash
# Copy template and fill in values
cp .env.local.template .env.local

# Required variables:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup
```bash
# Apply database schema (v2 schema preserved)
supabase db push

# Seed with construction data
supabase db seed
```

## 📅 8-Week Timeline Progress

- **Week 1-2**: ✅ Foundation Complete (Tasks 1-9)
- **Week 3-4**: 🚧 Core features (Tasks 10-14) ← CURRENT FOCUS
- **Week 5**: Advanced features (Tasks 15-21)
- **Week 6**: Admin panel (Tasks 25-27)  
- **Week 7**: Polish (Task 28-29)
- **Week 8**: Deployment (Task 30)

## 🎯 Success Metrics (Current Status)

- **Performance**: ✅ Navigation < 500ms ACHIEVED
- **Simplicity**: ✅ No function > 50 lines MAINTAINED
- **Flexibility**: ✅ Dynamic permissions IMPLEMENTED
- **Completeness**: 🚧 30% complete (9/30 tasks)
- **Mobile**: ✅ Touch-optimized for tablets ACHIEVED

## 🛠️ MCP TOOLS INTEGRATION GUIDE

### 🎯 Available MCP Tools & Construction Use Cases

#### **🎭 Playwright (Browser Automation)**
- **End-to-end testing** of construction workflows
- **Client demo recordings** with automated screenshots  
- **QA validation** of mobile-responsive interfaces
- **Performance testing** on construction site network conditions

#### **🗄️ Supabase (Database & Backend)**
- **Branch management** for safe database changes
- **Performance optimization** of construction queries
- **Health monitoring** of production database
- **Edge Functions** for construction-specific serverless logic

#### **🐙 GitHub (Code Management)**
- **Feature branch workflows** for construction modules
- **Code reviews** and collaboration management
- **Issue tracking** for construction-specific bugs
- **Release management** and deployment coordination

#### **🧠 Memory (Knowledge Persistence)**
- **Construction project context** persistence across sessions
- **User preference learning** and workflow optimization
- **Complex relationship tracking** between projects, tasks, stakeholders
- **Historical decision reasoning** for similar construction scenarios

#### **📁 Filesystem (Local Operations)**
- **Configuration file management** for development
- **Batch processing** of construction documents
- **Template and asset management** for project setup
- **Local development environment** optimization

#### **🐘 PostgreSQL (Database Direct Access)**
- **Performance tuning** for construction-specific queries
- **Complex reporting** requiring raw SQL analysis
- **Index optimization** for large construction datasets
- **Database health monitoring** for production systems

#### **🌐 Web Fetching (External APIs)**
- **External construction API** integration and testing
- **Vendor API connections** for material pricing updates
- **Regulatory compliance** data fetching and validation
- **Documentation updates** and reference material access

### 🚀 MCP Optimization Strategies

#### **Development Cycle Integration:**
```
Supabase branches → GitHub PRs → Playwright testing → Production
Memory system tracks decision patterns across features
```

#### **Performance Monitoring Stack:**
```
PostgreSQL analysis → Query optimization recommendations
Supabase health monitoring → Production alerts
Web fetching → External API performance tracking
```

#### **Quality Assurance Pipeline:**
```
Playwright automation → Construction workflow validation
GitHub integration → Code review and issue tracking  
Filesystem operations → Test artifact management
```

#### **When to Use Each Tool:**
- **New Feature Development**: GitHub branches + Supabase branches + Memory context
- **Database Changes**: Supabase migration + PostgreSQL analysis + Health monitoring
- **UI/UX Testing**: Playwright automation + Screenshot capture + Performance validation
- **External Integration**: Web fetching + API testing + Error handling validation
- **Production Issues**: PostgreSQL diagnostics + Supabase logs + GitHub issue creation

## 💡 Key Reminders for Continued Development

1. **Reference v2 patterns**: Use `formulapmv3copiedfromv2/` for business logic patterns
2. **Maintain simplicity**: Keep functions under 50 lines
3. **Permission-first**: Every UI element checks permissions
4. **Mobile-ready**: Test on tablets, optimize for touch
5. **Performance**: Maintain <500ms navigation target
6. **Construction focus**: Build for real construction workflows
7. **MCP Integration**: Use appropriate MCP tools for each development phase

## 🚀 Ready to Continue

**Status**: Foundation solid, Phase 2 ready to begin
**Next**: Task 10 - Project workspace foundation with tabbed interface
**Focus**: Core construction features (scope, drawings, tasks)

---

**Last Updated**: January 2025  
**Phase**: Foundation Complete (Tasks 1-9) ✅  
**Next**: Core Features (Tasks 10-21) 🚧