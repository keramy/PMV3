/**
 * Safety Metrics API Route
 * Returns construction site safety data and metrics
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    // Mock safety metrics data
    const safetyData = {
      overallScore: 95,
      incidentCount: 1,
      daysWithoutIncident: 47,
      safetyTrainingCompliance: 98,
      inspectionScore: 92,
      
      // Monthly safety trend
      monthlyTrend: [
        { month: 'Jan', incidents: 0, score: 100, inspections: 12 },
        { month: 'Feb', incidents: 1, score: 95, inspections: 14 },
        { month: 'Mar', incidents: 0, score: 98, inspections: 16 },
        { month: 'Apr', incidents: 2, score: 88, inspections: 13 },
        { month: 'May', incidents: 0, score: 100, inspections: 15 },
        { month: 'Jun', incidents: 1, score: 95, inspections: 18 },
      ],

      // Incident categories
      incidentCategories: [
        { category: 'Slips/Falls', count: 2, severity: 'minor' },
        { category: 'Equipment', count: 1, severity: 'moderate' },
        { category: 'Chemical', count: 0, severity: 'none' },
        { category: 'Electrical', count: 0, severity: 'none' },
      ],

      // Safety program metrics
      programs: {
        toolboxTalks: { completed: 48, required: 52, compliance: 92 },
        safetyTraining: { completed: 234, required: 240, compliance: 98 },
        inspections: { completed: 156, required: 160, compliance: 98 },
        incidentReports: { submitted: 3, resolved: 3, pending: 0 }
      },

      // Leading indicators
      leadingIndicators: {
        nearMissReports: 15,
        safetyObservations: 87,
        hazardCorrections: 23,
        behavioralObservations: 156
      },

      // Project-specific safety scores
      projectScores: [
        { projectName: 'Downtown Office Complex', score: 98, incidents: 0 },
        { projectName: 'Residential Tower Phase 2', score: 94, incidents: 1 },
        { projectName: 'Industrial Warehouse', score: 100, incidents: 0 },
        { projectName: 'Shopping Center Renovation', score: 89, incidents: 0 },
        { projectName: 'Hospital Expansion', score: 96, incidents: 0 },
        { projectName: 'School Construction', score: 100, incidents: 0 },
      ]
    }

    // Simulate network delay for development
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 450))
    }

    return NextResponse.json(safetyData)
  } catch (error) {
    console.error('Safety metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch safety metrics' },
      { status: 500 }
    )
  }
}