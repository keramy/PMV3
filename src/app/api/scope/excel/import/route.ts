/**
 * Formula PM V3 Scope Excel Import API
 * POST /api/scope/excel/import - Import scope items from Excel file
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SCOPE_PERMISSIONS } from '@/types/scope'
import { hasPermission } from '@/lib/permissions'
import * as XLSX from 'xlsx'
import type { 
  ExcelImportConfig, 
  ExcelImportResult, 
  ExcelValidationError,
  ScopeItemFormData,
  ScopeCategory,
  ScopeStatus
} from '@/types/scope'
import type { Database } from '@/types/database'

export async function POST(request: NextRequest) {
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
      .select('permissions')
      .eq('id', user.id)
      .single()

    if (!profile || !hasPermission(profile.permissions, SCOPE_PERMISSIONS.EXCEL_IMPORT)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const project_id = formData.get('project_id') as string
    const config_json = formData.get('config') as string

    if (!file || !project_id) {
      return Response.json({ 
        error: 'Missing required fields',
        validation_errors: {
          file: !file ? ['Excel file is required'] : undefined,
          project_id: !project_id ? ['Project ID is required'] : undefined
        }
      }, { status: 400 })
    }

    // Parse import configuration
    let config: Partial<ExcelImportConfig>
    try {
      config = config_json ? JSON.parse(config_json) : {}
    } catch {
      config = {}
    }

    // Set defaults
    const importConfig = {
      has_header_row: config.has_header_row ?? true,
      start_row: config.start_row ?? (config.has_header_row ? 2 : 1),
      default_values: config.default_values ?? {},
      ...config
    }

    // Read Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    if (!worksheet) {
      return Response.json({ error: 'No worksheet found in Excel file' }, { status: 400 })
    }

    // Convert to JSON with header row handling
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: importConfig.has_header_row ? 1 : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      range: importConfig.start_row - 1
    })

    if (!rawData || rawData.length === 0) {
      return Response.json({ error: 'No data found in Excel file' }, { status: 400 })
    }

    // Generate import batch ID
    const import_batch_id = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Process and validate data
    const validationErrors: ExcelValidationError[] = []
    const validItems: (ScopeItemFormData & { 
      import_batch_id: string, 
      excel_row_number: number 
    })[] = []

    rawData.forEach((row: any, index) => {
      const rowNumber = importConfig.start_row + index
      const item: Partial<ScopeItemFormData> = { ...importConfig.default_values }

      // Map Excel columns to scope item fields
      // Default mapping assumes standard column order: Title, Description, Category, etc.
      const columnMap = config.column_mappings || [
        { excel_column: 'A', field_name: 'title' as keyof ScopeItemFormData },
        { excel_column: 'B', field_name: 'description' as keyof ScopeItemFormData },
        { excel_column: 'C', field_name: 'category' as keyof ScopeItemFormData },
        { excel_column: 'D', field_name: 'quantity' as keyof ScopeItemFormData },
        { excel_column: 'E', field_name: 'unit' as keyof ScopeItemFormData },
        { excel_column: 'F', field_name: 'unit_cost' as keyof ScopeItemFormData },
        { excel_column: 'G', field_name: 'start_date' as keyof ScopeItemFormData },
        { excel_column: 'H', field_name: 'end_date' as keyof ScopeItemFormData },
        { excel_column: 'I', field_name: 'priority' as keyof ScopeItemFormData },
        { excel_column: 'J', field_name: 'status' as keyof ScopeItemFormData }
      ]

      // Map data from Excel row to scope item fields
      if (importConfig.has_header_row) {
        const headers = Object.keys(row)
        headers.forEach((header, colIndex) => {
          const mapping = columnMap.find(m => m.excel_column === String.fromCharCode(65 + colIndex))
          if (mapping) {
            (item as any)[mapping.field_name] = row[header]
          }
        })
      } else {
        columnMap.forEach(mapping => {
          if (row[mapping.excel_column] !== undefined) {
            (item as any)[mapping.field_name] = row[mapping.excel_column]
          }
        })
      }

      // Validate required fields
      const errors = validateScopeItem(item, rowNumber)
      validationErrors.push(...errors)

      // If no critical errors, add to valid items
      const hasCriticalError = errors.some(e => e.error_type === 'required')
      if (!hasCriticalError && item.title) {
        // Calculate total_cost if not provided
        if (item.quantity && item.unit_cost && !item.total_cost) {
          item.total_cost = item.quantity * item.unit_cost
        }

        validItems.push({
          ...item as ScopeItemFormData,
          import_batch_id,
          excel_row_number: rowNumber
        })
      }
    })

    // If there are too many validation errors, return them for review
    if (validationErrors.length > 0 && validItems.length === 0) {
      return Response.json({
        success: false,
        error: 'Validation failed',
        validation_summary: {
          total_rows: rawData.length,
          successful_imports: 0,
          failed_imports: rawData.length,
          warnings: []
        },
        validation_errors: validationErrors.slice(0, 50) // Limit to first 50 errors
      })
    }

    // Import valid items to database
    const createdItems = []
    const failedImports = []

    for (const item of validItems) {
      try {
        const { data: newItem, error: createError } = await supabase
          .from('scope_items')
          .insert({
            project_id,
            title: item.title,
            description: item.description,
            category: item.category,
            specification: item.specification,
            quantity: item.quantity,
            unit: item.unit as Database['public']['Enums']['unit_type'] | null,
            unit_cost: item.unit_cost,
            total_cost: item.total_cost,
            start_date: item.start_date,
            end_date: item.end_date,
            priority: item.priority,
            status: item.status || 'not_started',
            assigned_to: item.assigned_to,
            notes: item.notes,
            created_by: user.id,
          })
          .select()
          .single()

        if (createError) {
          failedImports.push({
            excel_row_number: item.excel_row_number,
            error: createError.message || 'Database insertion failed'
          })
        } else {
          createdItems.push(newItem)
        }
      } catch (error) {
        failedImports.push({
          excel_row_number: item.excel_row_number,
          error: 'Unexpected error during import'
        })
      }
    }

    // Log import activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        project_id,
        entity_type: 'scope_import',
        action: 'excel_import',
        details: {
          import_batch_id,
          filename: file.name,
          total_rows: rawData.length,
          successful_imports: createdItems.length,
          failed_imports: failedImports.length
        }
      })

    const result: ExcelImportResult = {
      import_batch_id,
      total_rows: rawData.length,
      successful_imports: createdItems.length,
      failed_imports: failedImports.length,
      created_items: createdItems,
      validation_errors: validationErrors,
      warnings: failedImports.length > 0 ? [`${failedImports.length} items failed to import`] : []
    }

    return Response.json({
      success: true,
      data: result,
      validation_summary: {
        total_rows: result.total_rows,
        successful_imports: result.successful_imports,
        failed_imports: result.failed_imports,
        warnings: result.warnings
      }
    })

  } catch (error) {
    console.error('Excel import API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Validation helper function
function validateScopeItem(item: Partial<ScopeItemFormData>, rowNumber: number): ExcelValidationError[] {
  const errors: ExcelValidationError[] = []

  // Required field validation
  if (!item.title || (typeof item.title === 'string' && item.title.trim() === '')) {
    errors.push({
      row_number: rowNumber,
      column: 'A',
      field_name: 'title',
      error_type: 'required',
      error_message: 'Title is required',
      cell_value: item.title
    })
  }

  // Category validation
  if (item.category) {
    const validCategories: ScopeCategory[] = ['construction', 'millwork', 'electrical', 'mechanical', 'plumbing', 'hvac']
    if (!validCategories.includes(item.category as ScopeCategory)) {
      errors.push({
        row_number: rowNumber,
        column: 'C',
        field_name: 'category',
        error_type: 'invalid_value',
        error_message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        cell_value: item.category,
        suggested_fix: 'Use a valid category'
      })
    }
  }

  // Status validation
  if (item.status) {
    const validStatuses: ScopeStatus[] = ['not_started', 'planning', 'materials_ordered', 'in_progress', 'quality_check', 'client_review', 'completed', 'blocked', 'on_hold', 'cancelled']
    if (!validStatuses.includes(item.status as ScopeStatus)) {
      errors.push({
        row_number: rowNumber,
        column: 'J',
        field_name: 'status',
        error_type: 'invalid_value',
        error_message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        cell_value: item.status,
        suggested_fix: 'Use a valid status'
      })
    }
  }

  // Numeric field validation
  if (item.quantity !== undefined && item.quantity !== null) {
    const quantity = Number(item.quantity)
    if (isNaN(quantity) || quantity < 0) {
      errors.push({
        row_number: rowNumber,
        column: 'D',
        field_name: 'quantity',
        error_type: 'invalid_format',
        error_message: 'Quantity must be a positive number',
        cell_value: item.quantity
      })
    }
  }

  if (item.unit_cost !== undefined && item.unit_cost !== null) {
    const unitCost = Number(item.unit_cost)
    if (isNaN(unitCost) || unitCost < 0) {
      errors.push({
        row_number: rowNumber,
        column: 'F',
        field_name: 'unit_cost',
        error_type: 'invalid_format',
        error_message: 'Unit cost must be a positive number',
        cell_value: item.unit_cost
      })
    }
  }

  // Unit validation
  if (item.unit) {
    const validUnits = ['pcs', 'set', 'lm', 'sqm', 'cum', 'kg', 'ton', 'lot', 'ea', 'sf', 'lf', 'cf', 'hrs', 'days', 'roll', 'bag', 'box', 'can', 'gal', 'ltr']
    if (!validUnits.includes(item.unit as string)) {
      errors.push({
        row_number: rowNumber,
        column: 'E',
        field_name: 'unit',
        error_type: 'invalid_value',
        error_message: `Invalid unit. Must be one of: ${validUnits.join(', ')}`,
        cell_value: item.unit,
        suggested_fix: 'Use a valid unit type'
      })
    }
  }

  // Date validation
  if (item.start_date && !isValidDate(item.start_date)) {
    errors.push({
      row_number: rowNumber,
      column: 'G',
      field_name: 'start_date',
      error_type: 'invalid_format',
      error_message: 'Start date must be a valid date (YYYY-MM-DD format)',
      cell_value: item.start_date
    })
  }

  if (item.end_date && !isValidDate(item.end_date)) {
    errors.push({
      row_number: rowNumber,
      column: 'H',
      field_name: 'end_date',
      error_type: 'invalid_format',
      error_message: 'End date must be a valid date (YYYY-MM-DD format)',
      cell_value: item.end_date
    })
  }

  return errors
}

// Date validation helper
function isValidDate(dateString: any): boolean {
  if (!dateString) return true // Optional field
  
  const date = new Date(dateString)
  return !isNaN(date.getTime()) && dateString.toString().match(/^\d{4}-\d{2}-\d{2}$/)
}