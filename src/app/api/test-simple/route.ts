import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const results: any[] = []
  const startTime = Date.now()

  try {
    // Test 1: Environment Variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    results.push({
      test: 'Environment Variables',
      status: url && key && serviceKey ? 'pass' : 'fail',
      data: { 
        hasUrl: !!url, 
        hasKey: !!key, 
        hasServiceKey: !!serviceKey,
        urlPreview: url ? url.substring(0, 30) + '...' : 'missing'
      }
    })

    if (!url || !key) {
      return NextResponse.json({ success: false, results })
    }

    // Test 2: Simple Supabase Connection
    // Using our configured client
    
    try {
      // Try the simplest possible query
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)

      results.push({
        test: 'Database Connection',
        status: error ? 'fail' : 'pass',
        message: error ? `Connection failed: ${error.message}` : 'Connected successfully',
        data: {
          error: error?.message,
          rowCount: data?.length || 0,
          method: 'direct_supabase_client'
        }
      })
    } catch (dbError) {
      results.push({
        test: 'Database Connection', 
        status: 'fail',
        message: `Database exception: ${dbError instanceof Error ? dbError.message : 'Unknown'}`,
        data: { exception: true }
      })
    }

    // Test 3: All 13 Core Tables Access Test
    const tables = [
      'companies',
      'user_profiles', 
      'subcontractors',
      'projects',
      'project_members',
      'scope_items',
      'shop_drawings',
      'material_specs',
      'tasks',
      'rfis',
      'change_orders',
      'punch_items',
      'activity_logs'
    ]
    const tableResults: any[] = []

    for (const table of tables) {
      try {
        const { data, error } = await (supabase as any)
          .from(table)
          .select('*')
          .limit(1)
        
        tableResults.push({
          table,
          accessible: !error,
          error: error?.message,
          hasData: data && data.length > 0
        })
      } catch (err) {
        tableResults.push({
          table,
          accessible: false,
          error: err instanceof Error ? err.message : 'Exception occurred'
        })
      }
    }

    const accessibleTables = tableResults.filter(t => t.accessible).length
    results.push({
      test: 'Table Access',
      status: accessibleTables > 0 ? 'pass' : 'fail', 
      message: `${accessibleTables}/${tables.length} tables accessible`,
      data: { tableResults }
    })

    const totalTime = Date.now() - startTime
    const passed = results.filter(r => r.status === 'pass').length

    return NextResponse.json({
      success: passed === results.length,
      results,
      summary: {
        total: results.length,
        passed,
        failed: results.length - passed,
        duration: `${totalTime}ms`
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      results,
      duration: `${Date.now() - startTime}ms`
    }, { status: 500 })
  }
}