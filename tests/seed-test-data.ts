/**
 * Test Data Seeding Script for Formula PM V3
 * Creates comprehensive test data for E2E testing
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrrrtwrfadcilwkgwacs.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

// Create admin client for seeding
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Test data constants
 */
const TEST_USER_ID = '2c481dc9-90f6-45b4-a5c7-d4c98add23e5' // admin@formulapm.com

const TEST_PROJECTS = [
  {
    id: 'proj_001',
    name: 'Downtown Office Complex',
    description: 'Modern 12-story office building with retail ground floor',
    status: 'active',
    client_name: 'Urban Development Corp',
    start_date: '2024-01-15',
    target_completion: '2025-06-30',
    project_manager: TEST_USER_ID,
    estimated_value: 15000000,
    actual_cost: 8500000,
    created_by: TEST_USER_ID
  },
  {
    id: 'proj_002', 
    name: 'Riverside Residential',
    description: '50-unit luxury apartment complex with amenities',
    status: 'planning',
    client_name: 'Riverside Properties LLC',
    start_date: '2024-03-01',
    target_completion: '2025-12-15',
    project_manager: TEST_USER_ID,
    estimated_value: 8500000,
    actual_cost: 2100000,
    created_by: TEST_USER_ID
  },
  {
    id: 'proj_003',
    name: 'Industrial Warehouse Renovation',
    description: 'Converting old warehouse to modern logistics center',
    status: 'completed',
    client_name: 'Logistics Solutions Inc',
    start_date: '2023-08-01',
    target_completion: '2024-02-28',
    project_manager: TEST_USER_ID,
    estimated_value: 3200000,
    actual_cost: 3150000,
    created_by: TEST_USER_ID
  }
]

const TEST_SCOPE_ITEMS = [
  {
    id: 'scope_001',
    project_id: 'proj_001',
    category: 'Structural',
    subcategory: 'Foundation',
    description: 'Excavation and concrete foundation work',
    unit: 'CY',
    quantity: 450,
    unit_cost: 125.00,
    total_cost: 56250.00,
    status: 'in_progress',
    assigned_to: TEST_USER_ID,
    start_date: '2024-01-20',
    target_date: '2024-03-15'
  },
  {
    id: 'scope_002',
    project_id: 'proj_001', 
    category: 'Structural',
    subcategory: 'Steel Frame',
    description: 'Structural steel erection - main frame',
    unit: 'TON',
    quantity: 125,
    unit_cost: 2800.00,
    total_cost: 350000.00,
    status: 'pending',
    assigned_to: TEST_USER_ID,
    start_date: '2024-03-16',
    target_date: '2024-05-30'
  },
  {
    id: 'scope_003',
    project_id: 'proj_002',
    category: 'Finishes',
    subcategory: 'Flooring',
    description: 'Luxury vinyl plank flooring installation',
    unit: 'SF',
    quantity: 8500,
    unit_cost: 12.50,
    total_cost: 106250.00,
    status: 'pending',
    assigned_to: TEST_USER_ID,
    start_date: '2024-08-01',
    target_date: '2024-09-15'
  }
]

const TEST_SHOP_DRAWINGS = [
  {
    id: 'sd_001',
    project_id: 'proj_001',
    title: 'Structural Steel Details - Phase 1',
    drawing_number: 'SS-001',
    revision: 'A',
    status: 'pending_review',
    submitted_by: 'Steel Fabricators Inc',
    submitted_date: '2024-01-25',
    whose_turn: 'contractor',
    priority: 'high',
    description: 'Connection details for main structural frame',
    file_path: '/uploads/drawings/SS-001-RevA.pdf'
  },
  {
    id: 'sd_002',
    project_id: 'proj_001',
    title: 'HVAC Ductwork Layout - Floors 1-6',
    drawing_number: 'MH-003',
    revision: 'B',
    status: 'approved_with_comments',
    submitted_by: 'Climate Control Systems',
    submitted_date: '2024-02-01',
    whose_turn: 'subcontractor',
    priority: 'medium',
    description: 'Main ductwork routing and equipment locations',
    file_path: '/uploads/drawings/MH-003-RevB.pdf'
  }
]

const TEST_MATERIALS = [
  {
    id: 'mat_001',
    project_id: 'proj_001',
    category: 'Concrete',
    name: '4000 PSI Concrete Mix',
    supplier: 'Metro Concrete Supply',
    specification: 'ASTM C94 - 4000 PSI, 6" slump',
    unit_cost: 95.00,
    unit: 'CY',
    quantity_required: 1200,
    quantity_ordered: 450,
    status: 'approved',
    lead_time_days: 3,
    reviewed_by: TEST_USER_ID,
    review_date: '2024-01-15'
  },
  {
    id: 'mat_002',
    project_id: 'proj_001',
    category: 'Steel',
    name: 'W14x90 Structural Beam',
    supplier: 'National Steel Supply',
    specification: 'AISC A992 Grade 50 Steel',
    unit_cost: 2650.00,
    unit: 'TON',
    quantity_required: 45,
    quantity_ordered: 0,
    status: 'pending_approval',
    lead_time_days: 21,
    reviewed_by: null,
    review_date: null
  }
]

const TEST_TASKS = [
  {
    id: 'task_001',
    project_id: 'proj_001',
    title: 'Complete Foundation Inspection',
    description: 'Schedule and coordinate foundation inspection with city inspector',
    status: 'in_progress',
    priority: 'high',
    assigned_to: TEST_USER_ID,
    created_by: TEST_USER_ID,
    due_date: '2024-02-15',
    estimated_hours: 4,
    category: 'Quality Control'
  },
  {
    id: 'task_002',
    project_id: 'proj_001',
    title: 'Submit Steel Fabrication Drawings',
    description: 'Review and submit steel fabrication shop drawings to structural engineer',
    status: 'pending',
    priority: 'medium',
    assigned_to: TEST_USER_ID,
    created_by: TEST_USER_ID,
    due_date: '2024-02-28',
    estimated_hours: 6,
    category: 'Documentation'
  }
]

const TEST_ACTIVITIES = [
  {
    id: 'act_001',
    project_id: 'proj_001',
    user_id: TEST_USER_ID,
    activity_type: 'scope_update',
    description: 'Updated foundation scope item quantities',
    metadata: { scope_item_id: 'scope_001', field_changed: 'quantity', old_value: 400, new_value: 450 },
    created_at: '2024-01-22T10:30:00Z'
  },
  {
    id: 'act_002', 
    project_id: 'proj_001',
    user_id: TEST_USER_ID,
    activity_type: 'drawing_submission',
    description: 'New shop drawing submitted for review',
    metadata: { drawing_id: 'sd_001', drawing_number: 'SS-001' },
    created_at: '2024-01-25T14:15:00Z'
  }
]

/**
 * Seed database with test data
 */
export async function seedTestData() {
  console.log('🌱 Starting test data seeding...')
  
  try {
    // 1. Insert Projects
    console.log('📋 Inserting test projects...')
    const { error: projectsError } = await supabase
      .from('projects')
      .upsert(TEST_PROJECTS, { onConflict: 'id' })
    
    if (projectsError) {
      console.error('❌ Projects error:', projectsError)
      throw projectsError
    }
    
    // 2. Insert Scope Items
    console.log('📝 Inserting scope items...')
    const { error: scopeError } = await supabase
      .from('scope_items')
      .upsert(TEST_SCOPE_ITEMS, { onConflict: 'id' })
    
    if (scopeError) {
      console.error('❌ Scope items error:', scopeError)
      throw scopeError
    }
    
    // 3. Insert Shop Drawings
    console.log('🏗️ Inserting shop drawings...')
    const { error: drawingsError } = await supabase
      .from('shop_drawings')
      .upsert(TEST_SHOP_DRAWINGS, { onConflict: 'id' })
    
    if (drawingsError) {
      console.error('❌ Shop drawings error:', drawingsError)
      throw drawingsError
    }
    
    // 4. Insert Materials
    console.log('🧱 Inserting materials...')
    const { error: materialsError } = await supabase
      .from('materials')
      .upsert(TEST_MATERIALS, { onConflict: 'id' })
    
    if (materialsError) {
      console.error('❌ Materials error:', materialsError)
      throw materialsError
    }
    
    // 5. Insert Tasks
    console.log('✅ Inserting tasks...')
    const { error: tasksError } = await supabase
      .from('tasks')
      .upsert(TEST_TASKS, { onConflict: 'id' })
    
    if (tasksError) {
      console.error('❌ Tasks error:', tasksError)
      throw tasksError
    }
    
    // 6. Insert Activities
    console.log('📊 Inserting activities...')
    const { error: activitiesError } = await supabase
      .from('project_activities')
      .upsert(TEST_ACTIVITIES, { onConflict: 'id' })
    
    if (activitiesError) {
      console.error('❌ Activities error:', activitiesError)
      throw activitiesError
    }
    
    console.log('✅ Test data seeding completed successfully!')
    
    // Summary
    console.log('\n📈 Seeded Data Summary:')
    console.log(`  • ${TEST_PROJECTS.length} Projects`)
    console.log(`  • ${TEST_SCOPE_ITEMS.length} Scope Items`)
    console.log(`  • ${TEST_SHOP_DRAWINGS.length} Shop Drawings`)
    console.log(`  • ${TEST_MATERIALS.length} Materials`)
    console.log(`  • ${TEST_TASKS.length} Tasks`)
    console.log(`  • ${TEST_ACTIVITIES.length} Activities`)
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

/**
 * Clean test data (for cleanup)
 */
export async function cleanTestData() {
  console.log('🧹 Cleaning test data...')
  
  try {
    // Delete in reverse order of creation due to foreign key constraints
    await supabase.from('project_activities').delete().in('id', TEST_ACTIVITIES.map(a => a.id))
    await supabase.from('tasks').delete().in('id', TEST_TASKS.map(t => t.id))
    await supabase.from('materials').delete().in('id', TEST_MATERIALS.map(m => m.id))
    await supabase.from('shop_drawings').delete().in('id', TEST_SHOP_DRAWINGS.map(sd => sd.id))
    await supabase.from('scope_items').delete().in('id', TEST_SCOPE_ITEMS.map(si => si.id))
    await supabase.from('projects').delete().in('id', TEST_PROJECTS.map(p => p.id))
    
    console.log('✅ Test data cleanup completed')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedTestData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}