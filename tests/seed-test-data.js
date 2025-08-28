/**
 * Test Data Seeding Script for Formula PM V3
 * Creates comprehensive test data for E2E testing
 * JavaScript version for compatibility
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrrrtwrfadcilwkgwacs.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.log('Please set your service role key in your environment variables')
  process.exit(1)
}

// Create admin client for seeding with RLS bypass
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

/**
 * Test data constants
 */
const TEST_USER_ID = '2c481dc9-90f6-45b4-a5c7-d4c98add23e5' // admin@formulapm.com

const TEST_PROJECTS = [
  {
    id: 'test_proj_001',
    name: 'Downtown Office Complex - TEST',
    description: 'Modern 12-story office building with retail ground floor (TEST DATA)',
    project_number: 'PMV3-001',
    project_code: 'DOC',
    status: 'active',
    priority: 'high',
    progress_percentage: 45,
    client_name: 'Urban Development Corp',
    client_contact: 'Sarah Johnson',
    client_email: 'sarah.johnson@urbandev.com',
    address: '123 Downtown Ave, Metropolitan City',
    start_date: '2024-01-15',
    end_date: '2025-06-30',
    project_manager: TEST_USER_ID,
    budget: 15000000,
    actual_cost: 8500000,
    created_by: TEST_USER_ID
  },
  {
    id: 'test_proj_002', 
    name: 'Riverside Residential - TEST',
    description: '50-unit luxury apartment complex with amenities (TEST DATA)',
    project_number: 'PMV3-002',
    project_code: 'RRR',
    status: 'planning',
    priority: 'medium',
    progress_percentage: 15,
    client_name: 'Riverside Properties LLC',
    client_contact: 'Michael Chen',
    client_email: 'mchen@riversideprop.com',
    address: '456 Riverside Dr, Waterfront District',
    start_date: '2024-03-01',
    end_date: '2025-12-15',
    project_manager: TEST_USER_ID,
    budget: 8500000,
    actual_cost: 2100000,
    created_by: TEST_USER_ID
  },
  {
    id: 'test_proj_003',
    name: 'Industrial Warehouse Renovation - TEST',
    description: 'Converting old warehouse to modern logistics center (TEST DATA)',
    project_number: 'PMV3-003',
    project_code: 'IWR',
    status: 'completed',
    priority: 'medium',
    progress_percentage: 100,
    client_name: 'Logistics Solutions Inc',
    client_contact: 'David Rodriguez',
    client_email: 'drodriguez@logisol.com',
    address: '789 Industrial Blvd, Commerce Zone',
    start_date: '2023-08-01',
    end_date: '2024-02-28',
    project_manager: TEST_USER_ID,
    budget: 3200000,
    actual_cost: 3150000,
    created_by: TEST_USER_ID
  }
]

const TEST_SCOPE_ITEMS = [
  {
    id: 'test_scope_001',
    project_id: 'test_proj_001',
    category: 'Structural',
    subcategory: 'Foundation',
    description: 'Excavation and concrete foundation work (TEST)',
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
    id: 'test_scope_002',
    project_id: 'test_proj_001', 
    category: 'Structural',
    subcategory: 'Steel Frame',
    description: 'Structural steel erection - main frame (TEST)',
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
    id: 'test_scope_003',
    project_id: 'test_proj_002',
    category: 'Finishes',
    subcategory: 'Flooring',
    description: 'Luxury vinyl plank flooring installation (TEST)',
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
    id: 'test_sd_001',
    project_id: 'test_proj_001',
    title: 'Structural Steel Details - Phase 1 (TEST)',
    drawing_number: 'SS-001-TEST',
    revision: 'A',
    status: 'pending_review',
    submitted_by: 'Steel Fabricators Inc',
    submitted_date: '2024-01-25',
    whose_turn: 'contractor',
    priority: 'high',
    description: 'Connection details for main structural frame (TEST DATA)',
    file_path: '/uploads/drawings/SS-001-RevA-TEST.pdf'
  },
  {
    id: 'test_sd_002',
    project_id: 'test_proj_001',
    title: 'HVAC Ductwork Layout - Floors 1-6 (TEST)',
    drawing_number: 'MH-003-TEST',
    revision: 'B',
    status: 'approved_with_comments',
    submitted_by: 'Climate Control Systems',
    submitted_date: '2024-02-01',
    whose_turn: 'subcontractor',
    priority: 'medium',
    description: 'Main ductwork routing and equipment locations (TEST DATA)',
    file_path: '/uploads/drawings/MH-003-RevB-TEST.pdf'
  }
]

const TEST_MATERIAL_SPECS = [
  {
    id: 'test_matspec_001',
    project_id: 'test_proj_001',
    category: 'Concrete',
    item_name: '4000 PSI Concrete Mix (TEST)',
    supplier: 'Metro Concrete Supply',
    specification: 'ASTM C94 - 4000 PSI, 6" slump (TEST DATA)',
    unit_cost: 95.00,
    unit: 'CY',
    quantity: 1200,
    status: 'approved',
    priority: 'high',
    required_date: '2024-02-01',
    created_by: TEST_USER_ID,
    notes: 'Primary concrete mix for foundation work'
  },
  {
    id: 'test_matspec_002',
    project_id: 'test_proj_001',
    category: 'Steel',
    item_name: 'W14x90 Structural Beam (TEST)',
    supplier: 'National Steel Supply',
    specification: 'AISC A992 Grade 50 Steel (TEST DATA)',
    unit_cost: 2650.00,
    unit: 'TON',
    quantity: 45,
    status: 'pending_approval',
    priority: 'medium',
    required_date: '2024-03-20',
    created_by: TEST_USER_ID,
    notes: 'Structural beams for main frame assembly'
  }
]

const TEST_TASKS = [
  {
    id: 'test_task_001',
    project_id: 'test_proj_001',
    title: 'Complete Foundation Inspection (TEST)',
    description: 'Schedule and coordinate foundation inspection with city inspector (TEST DATA)',
    status: 'in_progress',
    priority: 'high',
    assigned_to: TEST_USER_ID,
    created_by: TEST_USER_ID,
    due_date: '2024-02-15',
    estimated_hours: 4,
    category: 'Quality Control'
  },
  {
    id: 'test_task_002',
    project_id: 'test_proj_001',
    title: 'Submit Steel Fabrication Drawings (TEST)',
    description: 'Review and submit steel fabrication shop drawings to structural engineer (TEST DATA)',
    status: 'pending',
    priority: 'medium',
    assigned_to: TEST_USER_ID,
    created_by: TEST_USER_ID,
    due_date: '2024-02-28',
    estimated_hours: 6,
    category: 'Documentation'
  }
]

const TEST_ACTIVITY_LOGS = [
  {
    id: 'test_actlog_001',
    project_id: 'test_proj_001',
    user_id: TEST_USER_ID,
    activity_type: 'scope_update',
    description: 'Updated foundation scope item quantities (TEST DATA)',
    entity_type: 'scope_item',
    entity_id: 'test_scope_001',
    changes: JSON.stringify({ field_changed: 'quantity', old_value: 400, new_value: 450 }),
    created_at: '2024-01-22T10:30:00Z'
  },
  {
    id: 'test_actlog_002', 
    project_id: 'test_proj_001',
    user_id: TEST_USER_ID,
    activity_type: 'drawing_submission',
    description: 'New shop drawing submitted for review (TEST DATA)',
    entity_type: 'shop_drawing',
    entity_id: 'test_sd_001',
    changes: JSON.stringify({ drawing_number: 'SS-001-TEST', status: 'pending_review' }),
    created_at: '2024-01-25T14:15:00Z'
  }
]

/**
 * Seed database with test data
 */
async function seedTestData() {
  console.log('🌱 Starting test data seeding...')
  console.log('🔑 Using service role key for admin access...')
  
  try {
    // 1. Insert Projects (using service role to bypass RLS)
    console.log('📋 Inserting test projects...')
    const { error: projectsError, data: projectsData } = await supabase
      .from('projects')
      .upsert(TEST_PROJECTS, { onConflict: 'id' })
    
    console.log('📊 Projects insert result:', { error: projectsError, count: projectsData?.length })
    
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
      // Continue with other inserts even if scope items fail
      console.log('⚠️ Continuing with other data...')
    }
    
    // 3. Insert Shop Drawings (skip if table has issues)
    console.log('🏗️ Inserting shop drawings...')
    try {
      const { error: drawingsError } = await supabase
        .from('shop_drawings')
        .upsert(TEST_SHOP_DRAWINGS, { onConflict: 'id' })
      
      if (drawingsError) {
        console.error('❌ Shop drawings error:', drawingsError)
        console.log('⚠️ Skipping shop drawings due to schema issues...')
      }
    } catch (err) {
      console.log('⚠️ Skipping shop drawings due to table issues...')
    }
    
    // 4. Insert Material Specs
    console.log('🧱 Inserting material specs...')
    try {
      const { error: materialSpecsError } = await supabase
        .from('material_specs')
        .upsert(TEST_MATERIAL_SPECS, { onConflict: 'id' })
      
      if (materialSpecsError) {
        console.error('❌ Material specs error:', materialSpecsError)
        console.log('⚠️ Skipping material specs due to schema issues...')
      }
    } catch (err) {
      console.log('⚠️ Skipping material specs due to table issues...')
    }
    
    // 5. Insert Tasks
    console.log('✅ Inserting tasks...')
    try {
      const { error: tasksError } = await supabase
        .from('tasks')
        .upsert(TEST_TASKS, { onConflict: 'id' })
      
      if (tasksError) {
        console.error('❌ Tasks error:', tasksError)
        console.log('⚠️ Skipping tasks due to schema issues...')
      }
    } catch (err) {
      console.log('⚠️ Skipping tasks due to table issues...')
    }
    
    // 6. Insert Activity Logs
    console.log('📊 Inserting activity logs...')
    try {
      const { error: activityLogsError } = await supabase
        .from('activity_logs')
        .upsert(TEST_ACTIVITY_LOGS, { onConflict: 'id' })
      
      if (activityLogsError) {
        console.error('❌ Activity logs error:', activityLogsError)
        console.log('⚠️ Skipping activity logs due to schema issues...')
      }
    } catch (err) {
      console.log('⚠️ Skipping activity logs due to table issues...')
    }
    
    console.log('✅ Test data seeding completed successfully!')
    
    // Summary
    console.log('\n📈 Seeded Data Summary:')
    console.log(`  • ${TEST_PROJECTS.length} Projects`)
    console.log(`  • ${TEST_SCOPE_ITEMS.length} Scope Items (attempted)`)
    console.log(`  • ${TEST_SHOP_DRAWINGS.length} Shop Drawings (attempted)`)
    console.log(`  • ${TEST_MATERIAL_SPECS.length} Material Specs (attempted)`)
    console.log(`  • ${TEST_TASKS.length} Tasks (attempted)`)
    console.log(`  • ${TEST_ACTIVITY_LOGS.length} Activity Logs (attempted)`)
    
    console.log('\n📝 Note: Some inserts may have been skipped due to database schema differences.')
    console.log('   The projects should be successfully created for testing purposes.')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

/**
 * Clean test data (for cleanup)
 */
async function cleanTestData() {
  console.log('🧹 Cleaning test data...')
  
  try {
    // Delete in reverse order of creation due to foreign key constraints
    console.log('  • Cleaning activity logs...')
    await supabase.from('activity_logs').delete().in('id', TEST_ACTIVITY_LOGS.map(a => a.id)).catch(() => {})
    
    console.log('  • Cleaning tasks...')
    await supabase.from('tasks').delete().in('id', TEST_TASKS.map(t => t.id)).catch(() => {})
    
    console.log('  • Cleaning material specs...')
    await supabase.from('material_specs').delete().in('id', TEST_MATERIAL_SPECS.map(m => m.id)).catch(() => {})
    
    console.log('  • Cleaning shop drawings...')
    await supabase.from('shop_drawings').delete().in('id', TEST_SHOP_DRAWINGS.map(sd => sd.id)).catch(() => {})
    
    console.log('  • Cleaning scope items...')
    await supabase.from('scope_items').delete().in('id', TEST_SCOPE_ITEMS.map(si => si.id)).catch(() => {})
    
    console.log('  • Cleaning projects...')
    await supabase.from('projects').delete().in('id', TEST_PROJECTS.map(p => p.id))
    
    console.log('✅ Test data cleanup completed')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  }
}

// Export functions
module.exports = {
  seedTestData,
  cleanTestData
}

// Run seeding if called directly
if (require.main === module) {
  const command = process.argv[2]
  
  if (command === 'clean') {
    cleanTestData()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error)
        process.exit(1)
      })
  } else {
    seedTestData()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error)
        process.exit(1)
      })
  }
}