/**
 * Formula PM V3 Scope Excel Export API
 * GET /api/scope/excel/export - Export scope items to Excel file
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SCOPE_PERMISSIONS, SCOPE_CATEGORIES, SCOPE_STATUSES } from '@/types/scope'
import { hasPermission } from '@/lib/permissions'
import * as XLSX from 'xlsx'
import type { ScopeItem, ExcelExportConfig } from '@/types/scope'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile for permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('permissions_bitwise, role')
      .eq('id', user.id)
      .single()

    // Check EXPORT_DATA permission (bit 22: value 4194304) or admin (bit 0: value 1)
    const canExportData = profile?.permissions_bitwise && 
      ((profile.permissions_bitwise & 4194304) > 0 || (profile.permissions_bitwise & 1) > 0)
    if (!canExportData) {
      return Response.json({ error: 'Insufficient permissions to export Excel data' }, { status: 403 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const project_id = searchParams.get('project_id')
    const category = searchParams.get('category')
    const status = searchParams.get('status')?.split(',')
    const assigned_to = searchParams.get('assigned_to')?.split(',')
    const include_summary = searchParams.get('include_summary') === 'true'
    const group_by_category = searchParams.get('group_by_category') === 'true'

    if (!project_id) {
      return Response.json({ error: 'project_id is required' }, { status: 400 })
    }

    // Build query
    let query = supabase
      .from('scope_items')
      .select(`
        *,
        assigned_user:assigned_to(first_name, last_name, job_title),
        created_by_user:created_by(first_name, last_name)
      `)
      .eq('project_id', project_id)
      .order('category')
      .order('created_at')

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (status && status.length > 0) {
      query = query.in('status', status)
    }

    if (assigned_to && assigned_to.length > 0) {
      query = query.in('assigned_to', assigned_to)
    }

    // Execute query
    const { data: items, error: queryError } = await query

    if (queryError) {
      console.error('Scope items export query error:', queryError)
      return Response.json({ error: 'Failed to fetch scope items' }, { status: 500 })
    }

    if (!items || items.length === 0) {
      return Response.json({ error: 'No scope items found to export' }, { status: 404 })
    }

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Prepare data for export
    const exportData = items.map((item: any) => ({
      'Item #': items.indexOf(item) + 1,
      'Title': item.title || '',
      'Description': item.description || '',
      'Category': item.category ? SCOPE_CATEGORIES[item.category as keyof typeof SCOPE_CATEGORIES]?.label : '',
      'Specification': item.specification || '',
      'Quantity': item.quantity || '',
      'Unit': item.unit || '',
      'Unit Cost': item.unit_cost ? `$${item.unit_cost.toFixed(2)}` : '',
      'Total Cost': item.total_cost ? `$${item.total_cost.toFixed(2)}` : '',
      'Start Date': item.start_date ? new Date(item.start_date).toLocaleDateString() : '',
      'End Date': item.end_date ? new Date(item.end_date).toLocaleDateString() : '',
      'Priority': item.priority || '',
      'Status': item.status ? SCOPE_STATUSES[item.status as keyof typeof SCOPE_STATUSES]?.label : '',
      'Assigned To': item.assigned_user ? `${item.assigned_user.first_name} ${item.assigned_user.last_name}` : '',
      'Job Title': item.assigned_user?.job_title || '',
      'Notes': item.notes || '',
      'Created Date': item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
      'Created By': item.created_by_user ? `${item.created_by_user.first_name} ${item.created_by_user.last_name}` : ''
    }))

    if (group_by_category) {
      // Group by category and create separate sheets
      const categories = [...new Set(items.map((item: any) => item.category).filter(Boolean))]
      
      categories.forEach(category => {
        const categoryItems = exportData.filter(item => 
          item.Category === SCOPE_CATEGORIES[category as keyof typeof SCOPE_CATEGORIES]?.label
        )
        
        if (categoryItems.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(categoryItems)
          
          // Set column widths
          const colWidths = [
            { wch: 8 },   // Item #
            { wch: 30 },  // Title
            { wch: 40 },  // Description
            { wch: 12 },  // Category
            { wch: 25 },  // Specification
            { wch: 10 },  // Quantity
            { wch: 10 },  // Unit
            { wch: 12 },  // Unit Cost
            { wch: 12 },  // Total Cost
            { wch: 12 },  // Start Date
            { wch: 12 },  // End Date
            { wch: 10 },  // Priority
            { wch: 15 },  // Status
            { wch: 20 },  // Assigned To
            { wch: 15 },  // Job Title
            { wch: 30 },  // Notes
            { wch: 12 },  // Created Date
            { wch: 20 }   // Created By
          ]
          worksheet['!cols'] = colWidths

          const categoryLabel = SCOPE_CATEGORIES[category as keyof typeof SCOPE_CATEGORIES]?.label || category
          XLSX.utils.book_append_sheet(workbook, worksheet, categoryLabel)
        }
      })
    } else {
      // Single sheet with all items
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      
      // Set column widths
      const colWidths = [
        { wch: 8 },   // Item #
        { wch: 30 },  // Title
        { wch: 40 },  // Description
        { wch: 12 },  // Category
        { wch: 25 },  // Specification
        { wch: 10 },  // Quantity
        { wch: 10 },  // Unit
        { wch: 12 },  // Unit Cost
        { wch: 12 },  // Total Cost
        { wch: 12 },  // Start Date
        { wch: 12 },  // End Date
        { wch: 10 },  // Priority
        { wch: 15 },  // Status
        { wch: 20 },  // Assigned To
        { wch: 15 },  // Job Title
        { wch: 30 },  // Notes
        { wch: 12 },  // Created Date
        { wch: 20 }   // Created By
      ]
      worksheet['!cols'] = colWidths

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Scope Items')
    }

    // Add summary sheet if requested
    if (include_summary) {
      const summaryData = generateSummaryData(items)
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
      summaryWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary')
    }

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Get project name for filename
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', project_id)
      .single()

    const projectName = project?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Project'
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${projectName}_Scope_Items_${timestamp}.xlsx`

    // Log export activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        project_id,
        entity_type: 'scope_export',
        action: 'excel_export',
        details: {
          filename,
          item_count: items.length,
          filters_applied: {
            category,
            status,
            assigned_to
          }
        }
      })

    // Return Excel file
    return new Response(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Excel export API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to generate summary data
function generateSummaryData(items: any[]) {
  const summary = []
  
  // Overall statistics
  summary.push({
    'Metric': 'Total Items',
    'Value': items.length,
    'Percentage': '100%',
    'Notes': 'Total number of scope items'
  })

  // Status breakdown
  const statusCounts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {})

  Object.entries(statusCounts).forEach(([status, count]) => {
    const percentage = ((count as number / items.length) * 100).toFixed(1)
    const statusLabel = SCOPE_STATUSES[status as keyof typeof SCOPE_STATUSES]?.label || status
    summary.push({
      'Metric': `Status: ${statusLabel}`,
      'Value': count,
      'Percentage': `${percentage}%`,
      'Notes': `Items with status: ${statusLabel}`
    })
  })

  // Category breakdown
  const categoryCounts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {})

  Object.entries(categoryCounts).forEach(([category, count]) => {
    const percentage = ((count as number / items.length) * 100).toFixed(1)
    const categoryLabel = SCOPE_CATEGORIES[category as keyof typeof SCOPE_CATEGORIES]?.label || category
    summary.push({
      'Metric': `Category: ${categoryLabel}`,
      'Value': count,
      'Percentage': `${percentage}%`,
      'Notes': `Items in category: ${categoryLabel}`
    })
  })

  // Financial summary
  const totalCost = items.reduce((sum, item) => sum + (item.total_cost || 0), 0)
  const averageCost = totalCost / items.length
  
  summary.push({
    'Metric': 'Total Project Cost',
    'Value': `$${totalCost.toFixed(2)}`,
    'Percentage': '100%',
    'Notes': 'Sum of all scope item costs'
  })

  summary.push({
    'Metric': 'Average Item Cost',
    'Value': `$${averageCost.toFixed(2)}`,
    'Percentage': '-',
    'Notes': 'Average cost per scope item'
  })

  // Completion summary
  const completedItems = items.filter(item => item.status === 'completed').length
  const completionPercentage = ((completedItems / items.length) * 100).toFixed(1)
  
  summary.push({
    'Metric': 'Completion Rate',
    'Value': `${completedItems}/${items.length}`,
    'Percentage': `${completionPercentage}%`,
    'Notes': 'Items marked as completed'
  })

  return summary
}