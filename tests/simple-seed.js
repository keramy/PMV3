/**
 * Simple Test Data Seeding Script
 * Just inserts basic projects for testing
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Service role key required')
  process.exit(1)
}

// Service role client bypasses RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const TEST_USER_ID = '2c481dc9-90f6-45b4-a5c7-d4c98add23e5'

const SIMPLE_PROJECTS = [
  {
    name: 'Test Project Alpha',
    description: 'Test project for comprehensive E2E testing',
    project_number: 'TEST-001',
    status: 'active',
    budget: 1000000,
    created_by: TEST_USER_ID
  },
  {
    name: 'Test Project Beta', 
    description: 'Second test project for dashboard testing',
    project_number: 'TEST-002',
    status: 'planning',
    budget: 500000,
    created_by: TEST_USER_ID
  }
]

async function seedSimpleData() {
  console.log('🌱 Simple seeding...')
  
  try {
    // Just insert basic projects
    const { data, error } = await supabase
      .from('projects')
      .insert(SIMPLE_PROJECTS)
      .select()
    
    if (error) {
      console.error('❌ Error:', error)
      
      // Try to understand the exact issue
      console.log('🔍 Debugging info:')
      console.log('- Service role key length:', SUPABASE_SERVICE_ROLE_KEY.length)
      console.log('- Supabase URL:', SUPABASE_URL)
      
      return
    }
    
    console.log('✅ Success! Inserted:', data?.length, 'projects')
    data?.forEach(p => console.log(`  - ${p.name} (ID: ${p.id})`))
    
  } catch (err) {
    console.error('💥 Exception:', err.message)
  }
}

seedSimpleData()