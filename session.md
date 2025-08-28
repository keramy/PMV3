normally admin should have all prviligies and permissions. is that a good idea if we wrap permissions and give
  them a numeric something. so we can hadnle better? What would be the best practice

● ★ Insight ─────────────────────────────────────
  Permission System Design: You're absolutely right! The current array-based permissions system is complex and hard
   to manage. A numeric/hierarchical system would be much more efficient and follows industry best practices.

  Admin Access Pattern: Yes, admins should have blanket access to everything without complex RLS lookups - this is
  both a security and performance best practice.

  Current Problem: Our RLS policies are doing expensive database JOINs to check permissions when we could use
  simple role/level checks.
  ─────────────────────────────────────────────────

  🎯 Permission System Best Practices Analysis

  Current System Issues:

  -- CURRENT: Complex array-based permissions
  permissions: ['view_projects', 'create_tasks', 'edit_scope', ...]

  -- PROBLEMS:
  - Hard to check (array operations in SQL)
  - Difficult to maintain
  - No hierarchy
  - Expensive RLS policy evaluations

  Better Approaches:

  Option A: Role-Based (Simplest)

  -- Add to user_profiles table
  role: 'admin' | 'project_manager' | 'team_member' | 'client'

  -- RLS becomes ultra-simple:
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
    OR created_by = (SELECT auth.uid())
  )

  Option B: Numeric Permission Levels

  -- Add to user_profiles table
  permission_level: INTEGER -- 0=none, 50=team_member, 75=project_manager, 100=admin

  -- RLS becomes:
  USING (
    (SELECT permission_level FROM user_profiles WHERE id = auth.uid()) >= 75
    OR created_by = (SELECT auth.uid())
  )

  Option C: Bitwise Permissions (Most Flexible)

  -- Add to user_profiles table
  permissions: BIGINT -- Each bit represents a permission

  -- Constants:
  VIEW_PROJECTS = 1 << 0  -- 1
  EDIT_PROJECTS = 1 << 1  -- 2
  DELETE_PROJECTS = 1 << 2 -- 4
  ADMIN_ALL = (1 << 31) - 1 -- All permissions

  -- Check in RLS:
  USING (
    (SELECT permissions FROM user_profiles WHERE id = auth.uid()) & 1 > 0 -- has VIEW_PROJECTS
    OR (SELECT permissions FROM user_profiles WHERE id = auth.uid()) & (1 << 31) > 0 -- is admin
  )

  🏆 Recommended Solution: Hybrid Approach

  -- Add to user_profiles table:
  role: TEXT NOT NULL DEFAULT 'team_member'
  permission_level: INTEGER NOT NULL DEFAULT 10

  -- Role hierarchy:
  - 'admin' (level 100) - Full access to everything
  - 'company_admin' (level 90) - Company-wide access
  - 'project_manager' (level 75) - Project management
  - 'team_lead' (level 50) - Team coordination
  - 'team_member' (level 25) - Basic access
  - 'client' (level 10) - Read-only access

  Ultra-Simple RLS Policies:

  -- Projects: Admin sees all, others see their projects
  CREATE POLICY "projects_access" ON projects FOR SELECT USING (
    (SELECT permission_level FROM user_profiles WHERE id = auth.uid()) >= 100 -- Admin
    OR created_by = (SELECT auth.uid()) -- Creator
    OR project_manager = (SELECT auth.uid()) -- Manager
  );

  -- Tasks: Admin + project members
  CREATE POLICY "tasks_access" ON tasks FOR SELECT USING (
    (SELECT permission_level FROM user_profiles WHERE id = auth.uid()) >= 100 -- Admin
    OR created_by = (SELECT auth.uid()) -- Creator
  );

  Benefits of This Approach:

  ✅ Performance - Simple numeric comparisons, no JOINs
  ✅ Maintainable - Clear hierarchy everyone understands✅ Flexible - Can adjust levels without code changes
  ✅ Admin Power - Admins bypass all restrictions
  ✅ Simple RLS - No complex subqueries or recursion

  Would you like me to implement this hierarchical permission system to fix all the current issues?

> what about when i want to hide the cost from client or team member ?

● ★ Insight ─────────────────────────────────────
  Excellent Security Question: Cost visibility is a critical business requirement! You need granular control over
  sensitive financial data - role levels alone won't handle this nuanced access control.

  Real-World Scenario: A project manager might see projects but not costs, while a financial admin sees costs but
  not all projects. This requires combining role hierarchy with specific permissions.

  Solution: We need a hybrid system that combines role levels with specific permission flags for sensitive data
  like costs.
  ─────────────────────────────────────────────────

  🎯 Enhanced Permission System for Cost Visibility

  The Challenge:

  - Admin: See everything including costs
  - Project Manager: See project details but maybe not costs
  - Team Member: See tasks but not costs
  - Client: See progress but definitely not costs
  - Financial Admin: See costs but maybe not all projects

  🏆 Recommended Solution: Role + Permission Flags

  Database Schema:

  -- Enhanced user_profiles table
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'team_member';
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS permission_level INTEGER NOT NULL DEFAULT 10;
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS permission_flags BIGINT NOT NULL DEFAULT 0;

  -- Permission flag constants (bitwise)
  VIEW_COSTS = 1 << 0     -- 1   - Can see cost fields
  EDIT_COSTS = 1 << 1     -- 2   - Can modify costs
  VIEW_ALL_PROJECTS = 1 << 2  -- 4   - See all company projects
  MANAGE_USERS = 1 << 3   -- 8   - User management
  ADMIN_ACCESS = 1 << 10  -- 1024 - Full admin override

  Role Definitions:

  -- Standard roles with default permissions
  'admin': level 100, flags = 1024 (ADMIN_ACCESS - overrides everything)
  'financial_admin': level 90, flags = 3 (VIEW_COSTS + EDIT_COSTS)
  'project_manager': level 75, flags = 4 (VIEW_ALL_PROJECTS)
  'team_lead': level 50, flags = 1 (VIEW_COSTS - for budgeting)
  'team_member': level 25, flags = 0 (no cost access)
  'client': level 10, flags = 0 (no cost access)

  Smart RLS Policies for Cost Fields:

  Scope Items with Cost Protection:

  -- Basic access policy
  CREATE POLICY "scope_items_access" ON scope_items FOR SELECT USING (
    -- Admin override
    (SELECT permission_flags FROM user_profiles WHERE id = auth.uid()) & 1024 > 0
    -- OR project member
    OR project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

  -- Separate policy for cost columns using column-level security
  -- This returns NULL for cost fields if user doesn't have VIEW_COSTS permission
  CREATE OR REPLACE FUNCTION mask_cost_fields(
    user_id UUID,
    unit_cost NUMERIC,
    total_cost NUMERIC,
    budget_allocated NUMERIC
  ) RETURNS RECORD AS $$
  DECLARE
    user_flags BIGINT;
    result RECORD;
  BEGIN
    SELECT permission_flags INTO user_flags
    FROM user_profiles
    WHERE id = user_id;

    -- Admin or has VIEW_COSTS permission
    IF (user_flags & 1024 > 0) OR (user_flags & 1 > 0) THEN
      SELECT unit_cost, total_cost, budget_allocated INTO result;
    ELSE
      SELECT NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC INTO result;
    END IF;

    RETURN result;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  Application-Level Implementation:

  API Middleware Enhancement:

  // In API middleware - check cost permissions
  const userPermissions = await getUserPermissions(userId);

  const canViewCosts =
    userPermissions.flags & PERMISSION_FLAGS.VIEW_COSTS ||
    userPermissions.flags & PERMISSION_FLAGS.ADMIN_ACCESS ||
    userPermissions.level >= 100; // Admin level

  // Filter response based on permissions
  if (!canViewCosts) {
    // Remove cost fields from response
    data = data.map(item => ({
      ...item,
      unit_cost: null,
      total_cost: null,
      budget_allocated: null
    }));
  }

  UI-Level Implementation:

  // In React components
  const { user, permissions } = useAuth();

  const canViewCosts =
    permissions.flags & PERMISSION_FLAGS.VIEW_COSTS ||
    permissions.level >= 100;

  return (
    <div>
      <span>Quantity: {item.quantity}</span>
      {canViewCosts && (
        <span>Cost: ${item.unit_cost}</span>
      )}
    </div>
  );

  🎯 Benefits of This Approach:

  ✅ Granular Control - Role + specific permissions for sensitive data
  ✅ Performance - Simple bitwise operations, no complex queries
  ✅ Flexible - Can combine permissions (VIEW_COSTS + EDIT_PROJECTS)
  ✅ Secure - Multiple layers: RLS + API + UI
  ✅ Admin Override - Admins always see everything
  ✅ Client-Safe - Clients never see costs at any level

  Example Permission Combinations:

  Admin: level=100, flags=1024 → Sees everything
  Financial Manager: level=90, flags=3 → Sees costs, can edit costs
  Project Manager: level=75, flags=1 → Sees costs for budgeting
  Team Lead: level=50, flags=1 → Sees costs for planning
  Team Member: level=25, flags=0 → No cost visibility
  Client: level=10, flags=0 → No cost visibility

  This gives you precise control over who sees costs while maintaining the simple role hierarchy for other
  permissions. Would you like me to implement this enhanced system?

> Can we consolidate project manager and team lead? so we have fewer roles. Instead of financial manager can we
  name it Technical Manager ?

● ★ Insight ─────────────────────────────────────
  Great Consolidation Ideas: Fewer roles = simpler system to manage. "Technical Manager" makes perfect sense for
  construction - they need cost visibility for technical decisions and budgeting, not just financial oversight.

  Role Optimization: Combining project manager + team lead eliminates the overlap while keeping clear hierarchy.
  This is more practical for construction teams.
  ─────────────────────────────────────────────────

  🎯 Streamlined Role System for Construction Teams

  Consolidated Role Structure:

  5 Clear Roles Instead of 6:

  -- SIMPLIFIED HIERARCHY
  'admin'            - level 100, flags 1024 (ADMIN_ACCESS - everything)
  'technical_manager' - level 80,  flags 3    (VIEW_COSTS + EDIT_COSTS)
  'project_manager'   - level 60,  flags 1    (VIEW_COSTS for budgeting)
  'team_member'       - level 30,  flags 0    (no cost access)
  'client'           - level 10,  flags 0    (read-only, no costs)

  Role Definitions for Construction:

  Admin (level 100)

  - Who: Company owners, IT administrators
  - Access: Everything - full override
  - Permissions: All flags including ADMIN_ACCESS

  Technical Manager (level 80)

  - Who: Senior engineers, cost estimators, technical leads
  - Access: Can see AND edit all costs for technical decisions
  - Permissions: VIEW_COSTS + EDIT_COSTS flags
  - Why: They need cost data for:
    - Material specifications and alternatives
    - Technical feasibility vs budget
    - Engineering change orders

  Project Manager (level 60)

  - Who: Project coordinators, site supervisors
  - Access: Can see costs but not edit them
  - Permissions: VIEW_COSTS flag only
  - Why: They need cost visibility for:
    - Project planning and scheduling
    - Progress reporting to clients
    - Resource allocation decisions

  Team Member (level 30)

  - Who: Field workers, junior staff, subcontractors
  - Access: See tasks, progress, but no financial data
  - Permissions: No cost flags
  - Why: They focus on execution, not budgeting

  Client (level 10)

  - Who: Property owners, external stakeholders
  - Access: Progress visibility only, no costs or internal details
  - Permissions: No cost flags
  - Why: They see progress but not internal financials

  Permission Matrix:

  | Role              | Level | View Costs | Edit Costs | Manage Projects | Admin Override |
  |-------------------|-------|------------|------------|-----------------|----------------|
  | Admin             | 100   | ✅          | ✅          | ✅               | ✅              |
  | Technical Manager | 80    | ✅          | ✅          | ✅               | ❌              |
  | Project Manager   | 60    | ✅          | ❌          | ✅               | ❌              |
  | Team Member       | 30    | ❌          | ❌          | ❌               | ❌              |
  | Client            | 10    | ❌          | ❌          | ❌               | ❌              |

  Construction-Specific Examples:

  Scope Item Cost Visibility:

  // Technical Manager sees:
  {
    title: "Install HVAC System",
    quantity: 1,
    unit_cost: 15000,      // ✅ Can see and edit
    total_cost: 15000,     // ✅ Can see and edit
    specification: "Carrier 5-ton unit"
  }

  // Project Manager sees:
  {
    title: "Install HVAC System",
    quantity: 1,
    unit_cost: 15000,      // ✅ Can see (for planning)
    total_cost: 15000,     // ✅ Can see (for planning)
    specification: "Carrier 5-ton unit"
    // ❌ Cannot edit costs
  }

  // Team Member sees:
  {
    title: "Install HVAC System",
    quantity: 1,
    unit_cost: null,       // ❌ Hidden
    total_cost: null,      // ❌ Hidden
    specification: "Carrier 5-ton unit"
  }

  // Client sees:
  {
    title: "HVAC Installation",  // ✅ Progress visibility
    status: "In Progress",       // ✅ Status updates
    completion: "65%",           // ✅ Progress tracking
    // ❌ No costs, no technical specs
  }

  Real-World Construction Scenarios:

  Material Change Request:

  - Technical Manager: "We need to upgrade to commercial-grade fixtures (+$5,000)"
  - Project Manager: "I see the cost impact, let me check the budget allocation"
  - Team Member: "I'll install whatever is specified"
  - Client: "I see the change request is approved and in progress"

  Budget Review Meeting:

  - Admin: Sees all costs, profits, overhead
  - Technical Manager: Sees material costs, labor estimates, change orders
  - Project Manager: Sees project budget vs actual, milestone costs
  - Team Member: Sees their task assignments and deadlines
  - Client: Sees progress milestones and completion dates

  This streamlined system is perfect for construction teams - clear hierarchy, appropriate cost visibility, and
  easier to manage than 6+ roles!

> /model
  ⎿  Set model to opusplan (claude-opus-4-1-20250805)


● Previous query still processing. Please try again.

● ★ Insight ─────────────────────────────────────
  Critical Design Question: You're absolutely right to think about flexibility! A rigid role system would be
  frustrating. You need both default role templates AND the ability to customize individual permissions.

  Real Scenario: A Project Manager might temporarily need cost editing abilities for a specific project without
  becoming a Technical Manager. Or you might want to revoke someone's cost visibility without changing their title.

  Solution: Separate display title from actual permissions - use roles as templates but allow overrides.
  ─────────────────────────────────────────────────

  🎯 Flexible Permission System with Admin Dashboard Control

  Database Design for Maximum Flexibility:

  -- Enhanced user_profiles table
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
    display_title TEXT,           -- "Project Manager" (what users see)
    role TEXT DEFAULT 'team_member',  -- Internal role template
    permission_level INTEGER DEFAULT 30,
    permission_flags BIGINT DEFAULT 0,
    custom_permissions BOOLEAN DEFAULT false;  -- Flag for customized permissions

  -- Example data:
  -- User 1: display_title="Senior Project Manager", role="project_manager", custom_permissions=false
  -- User 2: display_title="Project Manager", role="project_manager", custom_permissions=true, permission_flags=3
  (custom cost edit)

  Admin Dashboard UI Design:

  User Management Screen:

  // Admin Dashboard Component
  function UserPermissionManager({ user }) {
    const [useCustom, setUseCustom] = useState(user.custom_permissions);

    return (
      <Card>
        <h3>{user.name}</h3>

        {/* Display Title - Always Editable */}
        <Input
          label="Job Title (Display)"
          value={user.display_title}
          onChange={updateDisplayTitle}
          placeholder="e.g., Senior Project Manager"
        />

        {/* Role Template Selector */}
        <Select
          label="Permission Template"
          value={user.role}
          onChange={applyRoleTemplate}
          disabled={useCustom}
        >
          <option value="admin">Admin (Full Access)</option>
          <option value="technical_manager">Technical Manager</option>
          <option value="project_manager">Project Manager</option>
          <option value="team_member">Team Member</option>
          <option value="client">Client</option>
        </Select>

        {/* Custom Permissions Toggle */}
        <Switch
          label="Use Custom Permissions"
          checked={useCustom}
          onChange={setUseCustom}
        />

        {/* Individual Permission Toggles */}
        {useCustom && (
          <div className="permission-grid">
            <Checkbox
              label="View Costs"
              checked={hasPermission(user.permission_flags, VIEW_COSTS)}
              onChange={(checked) => togglePermission(VIEW_COSTS, checked)}
            />
            <Checkbox
              label="Edit Costs"
              checked={hasPermission(user.permission_flags, EDIT_COSTS)}
              onChange={(checked) => togglePermission(EDIT_COSTS, checked)}
            />
            <Checkbox
              label="View All Projects"
              checked={hasPermission(user.permission_flags, VIEW_ALL_PROJECTS)}
              onChange={(checked) => togglePermission(VIEW_ALL_PROJECTS, checked)}
            />
            <Checkbox
              label="Manage Users"
              checked={hasPermission(user.permission_flags, MANAGE_USERS)}
              onChange={(checked) => togglePermission(MANAGE_USERS, checked)}
            />
          </div>
        )}

        <Button onClick={savePermissions}>Save Changes</Button>
      </Card>
    );
  }

  How It Works:

  1. Default Role Templates (Quick Setup)

  When adding a new user, select a role template:
  // Applying a role template
  async function applyRoleTemplate(userId, role) {
    const templates = {
      'admin': { level: 100, flags: 1024 },
      'technical_manager': { level: 80, flags: 3 },
      'project_manager': { level: 60, flags: 1 },
      'team_member': { level: 30, flags: 0 },
      'client': { level: 10, flags: 0 }
    };

    const template = templates[role];

    await updateUser(userId, {
      role: role,
      permission_level: template.level,
      permission_flags: template.flags,
      custom_permissions: false  // Using template, not custom
    });
  }

  2. Custom Permissions (Fine-Grained Control)

  Override template for specific users:
  // Customizing individual permissions
  async function togglePermission(userId, permission, enabled) {
    const user = await getUser(userId);
    let flags = user.permission_flags;

    if (enabled) {
      flags = flags | permission;  // Add permission
    } else {
      flags = flags & ~permission; // Remove permission
    }

    await updateUser(userId, {
      permission_flags: flags,
      custom_permissions: true  // Mark as customized
    });
  }

  Real-World Examples:

  Scenario 1: Temporary Cost Access

  // Project Manager needs cost editing for budget season
  // Admin clicks: [✓] Edit Costs
  // Result:
  {
    display_title: "Project Manager",      // Title unchanged
    role: "project_manager",               // Template unchanged
    permission_flags: 3,                   // VIEW_COSTS + EDIT_COSTS
    custom_permissions: true               // Using custom perms
  }

  Scenario 2: Restricted Technical Manager

  // Technical Manager shouldn't edit costs on specific project
  // Admin unchecks: [ ] Edit Costs
  // Result:
  {
    display_title: "Technical Manager",    // Title unchanged
    role: "technical_manager",             // Template unchanged
    permission_flags: 1,                   // VIEW_COSTS only
    custom_permissions: true               // Customized
  }

  Scenario 3: Promoted Team Member

  // Team Member promoted but title not official yet
  // Admin selects: Role = "Project Manager"
  // Result:
  {
    display_title: "Senior Team Member",   // Keep current title
    role: "project_manager",               // New permissions
    permission_flags: 1,                   // From PM template
    custom_permissions: false              // Using template
  }

  API Implementation:

  // API endpoint for permission updates
  export async function POST(request: Request) {
    const { userId, updates } = await request.json();
    const adminUser = await validateAdmin(request);

    // Update user permissions
    const { error } = await supabase
      .from('user_profiles')
      .update({
        display_title: updates.display_title,
        role: updates.role,
        permission_level: updates.permission_level,
        permission_flags: updates.permission_flags,
        custom_permissions: updates.custom_permissions
      })
      .eq('id', userId);

    // Log the change for audit trail
    await logPermissionChange(adminUser.id, userId, updates);

    return NextResponse.json({ success: true });
  }

  Benefits of This Approach:

  ✅ Flexible: Change permissions without changing titles
  ✅ Quick Setup: Use templates for most users
  ✅ Fine Control: Override any permission when needed
  ✅ Audit Trail: Track who changed what permissions
  ✅ UI-Friendly: Single clicks in admin dashboard
  ✅ Reversible: Can revert to template anytime

  This gives you complete control through the UI while maintaining simplicity for common cases!
  ⎿  Interrupted by user

> are we still be able to use an admin dashboard and configure users permissions with single clicks on ui or they
  should be defined at beginning ? What
     if i want to change someones permissions ? but at the same time i dont want to change his/her title?

● ★ Insight ─────────────────────────────────────
  Critical Design Question: You're absolutely right to think about flexibility! A rigid role system would be
  frustrating. You need both default role templates AND the ability to customize individual permissions.

  Real Scenario: A Project Manager might temporarily need cost editing abilities for a specific project without
  becoming a Technical Manager. Or you might want to revoke someone's cost visibility without changing their title.

  Solution: Separate display title from actual permissions - use roles as templates but allow overrides.
  ─────────────────────────────────────────────────

  🎯 Flexible Permission System with Admin Dashboard Control

  Database Design for Maximum Flexibility:

  -- Enhanced user_profiles table
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
    display_title TEXT,           -- "Project Manager" (what users see)
    role TEXT DEFAULT 'team_member',  -- Internal role template
    permission_level INTEGER DEFAULT 30,
    permission_flags BIGINT DEFAULT 0,
    custom_permissions BOOLEAN DEFAULT false;  -- Flag for customized permissions

  -- Example data:
  -- User 1: display_title="Senior Project Manager", role="project_manager", custom_permissions=false
  -- User 2: display_title="Project Manager", role="project_manager", custom_permissions=true, permission_flags=3
  (custom cost edit)

  Admin Dashboard UI Design:

  User Management Screen:

  // Admin Dashboard Component
  function UserPermissionManager({ user }) {
    const [useCustom, setUseCustom] = useState(user.custom_permissions);

    return (
      <Card>
        <h3>{user.name}</h3>

        {/* Display Title - Always Editable */}
        <Input
          label="Job Title (Display)"
          value={user.display_title}
          onChange={updateDisplayTitle}
          placeholder="e.g., Senior Project Manager"
        />

        {/* Role Template Selector */}
        <Select
          label="Permission Template"
          value={user.role}
          onChange={applyRoleTemplate}
          disabled={useCustom}
        >
          <option value="admin">Admin (Full Access)</option>
          <option value="technical_manager">Technical Manager</option>
          <option value="project_manager">Project Manager</option>
          <option value="team_member">Team Member</option>
          <option value="client">Client</option>
        </Select>

        {/* Custom Permissions Toggle */}
        <Switch
          label="Use Custom Permissions"
          checked={useCustom}
          onChange={setUseCustom}
        />

        {/* Individual Permission Toggles */}
        {useCustom && (
          <div className="permission-grid">
            <Checkbox
              label="View Costs"
              checked={hasPermission(user.permission_flags, VIEW_COSTS)}
              onChange={(checked) => togglePermission(VIEW_COSTS, checked)}
            />
            <Checkbox
              label="Edit Costs"
              checked={hasPermission(user.permission_flags, EDIT_COSTS)}
              onChange={(checked) => togglePermission(EDIT_COSTS, checked)}
            />
            <Checkbox
              label="View All Projects"
              checked={hasPermission(user.permission_flags, VIEW_ALL_PROJECTS)}
              onChange={(checked) => togglePermission(VIEW_ALL_PROJECTS, checked)}
            />
            <Checkbox
              label="Manage Users"
              checked={hasPermission(user.permission_flags, MANAGE_USERS)}
              onChange={(checked) => togglePermission(MANAGE_USERS, checked)}
            />
          </div>
        )}

        <Button onClick={savePermissions}>Save Changes</Button>
      </Card>
    );
  }

  How It Works:

  1. Default Role Templates (Quick Setup)

  When adding a new user, select a role template:
  // Applying a role template
  async function applyRoleTemplate(userId, role) {
    const templates = {
      'admin': { level: 100, flags: 1024 },
      'technical_manager': { level: 80, flags: 3 },
      'project_manager': { level: 60, flags: 1 },
      'team_member': { level: 30, flags: 0 },
      'client': { level: 10, flags: 0 }
    };

    const template = templates[role];

    await updateUser(userId, {
      role: role,
      permission_level: template.level,
      permission_flags: template.flags,
      custom_permissions: false  // Using template, not custom
    });
  }

  2. Custom Permissions (Fine-Grained Control)

  Override template for specific users:
  // Customizing individual permissions
  async function togglePermission(userId, permission, enabled) {
    const user = await getUser(userId);
    let flags = user.permission_flags;

    if (enabled) {
      flags = flags | permission;  // Add permission
    } else {
      flags = flags & ~permission; // Remove permission
    }

    await updateUser(userId, {
      permission_flags: flags,
      custom_permissions: true  // Mark as customized
    });
  }

  Real-World Examples:

  Scenario 1: Temporary Cost Access

  // Project Manager needs cost editing for budget season
  // Admin clicks: [✓] Edit Costs
  // Result:
  {
    display_title: "Project Manager",      // Title unchanged
    role: "project_manager",               // Template unchanged
    permission_flags: 3,                   // VIEW_COSTS + EDIT_COSTS
    custom_permissions: true               // Using custom perms
  }

  Scenario 2: Restricted Technical Manager

  // Technical Manager shouldn't edit costs on specific project
  // Admin unchecks: [ ] Edit Costs
  // Result:
  {
    display_title: "Technical Manager",    // Title unchanged
    role: "technical_manager",             // Template unchanged
    permission_flags: 1,                   // VIEW_COSTS only
    custom_permissions: true               // Customized
  }

  Scenario 3: Promoted Team Member

  // Team Member promoted but title not official yet
  // Admin selects: Role = "Project Manager"
  // Result:
  {
    display_title: "Senior Team Member",   // Keep current title
    role: "project_manager",               // New permissions
    permission_flags: 1,                   // From PM template
    custom_permissions: false              // Using template
  }

  API Implementation:

  // API endpoint for permission updates
  export async function POST(request: Request) {
    const { userId, updates } = await request.json();
    const adminUser = await validateAdmin(request);

    // Update user permissions
    const { error } = await supabase
      .from('user_profiles')
      .update({
        display_title: updates.display_title,
        role: updates.role,
        permission_level: updates.permission_level,
        permission_flags: updates.permission_flags,
        custom_permissions: updates.custom_permissions
      })
      .eq('id', userId);

    // Log the change for audit trail
    await logPermissionChange(adminUser.id, userId, updates);

    return NextResponse.json({ success: true });
  }

  Benefits of This Approach:

  ✅ Flexible: Change permissions without changing titles✅ Quick Setup: Use templates for most users✅ Fine
  Control: Override any permission when needed✅ Audit Trail: Track who changed what permissions✅ UI-Friendly:
  Single clicks in admin dashboard✅ Reversible: Can revert to template anytime

  This gives you complete control through the UI while maintaining simplicity for common cases!