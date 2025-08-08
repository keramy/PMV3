/**
 * Integration tests for database queries
 * Tests that query functions can be imported and called without TypeScript errors
 */

import { describe, it, expect } from 'vitest'

describe('Query Function Integration', () => {
  it('should import all query functions without TypeScript errors', async () => {
    // Test that all query functions can be imported
    const queries = await import('../queries')
    
    expect(typeof queries.getCurrentUserProfile).toBe('function')
    expect(typeof queries.hasPermission).toBe('function')
    expect(typeof queries.getUserProfile).toBe('function')
    expect(typeof queries.getCompanyProjects).toBe('function')
    expect(typeof queries.getProjectDetails).toBe('function')
    expect(typeof queries.getTasks).toBe('function')
    expect(typeof queries.getOverdueTasks).toBe('function')
    expect(typeof queries.getScopeItems).toBe('function')
    expect(typeof queries.getShopDrawings).toBe('function')
    expect(typeof queries.getRFIs).toBe('function')
    expect(typeof queries.getMaterialSpecs).toBe('function')
    expect(typeof queries.getProjectStats).toBe('function')
    expect(typeof queries.checkDatabaseConnection).toBe('function')
    expect(typeof queries.measureConnectionLatency).toBe('function')
  })

  it('should import all database helper functions without TypeScript errors', async () => {
    // Test that all helper functions can be imported
    const helpers = await import('../../database-helpers')
    
    expect(typeof helpers.TypedQueryBuilder).toBe('function')
    expect(typeof helpers.createTypedQuery).toBe('function')
    expect(typeof helpers.eqFilter).toBe('function')
    expect(typeof helpers.neqFilter).toBe('function')
    expect(typeof helpers.transformUserProfile).toBe('function')
    expect(typeof helpers.transformToRawUserProfile).toBe('function')
    expect(typeof helpers.withErrorHandling).toBe('function')
    expect(typeof helpers.withArrayErrorHandling).toBe('function')
  })

  it('should import database types without TypeScript errors', async () => {
    // Test that all types can be imported
    const types = await import('../../../types/database')
    
    // Check that key types are available
    expect(types).toBeDefined()
  })

  it('should import auth types without TypeScript errors', async () => {
    // Test that auth types can be imported
    const authTypes = await import('../../../types/auth')
    
    expect(authTypes.PERMISSION_TEMPLATES).toBeDefined()
    expect(typeof authTypes.PERMISSION_TEMPLATES.PROJECT_MANAGER).toBe('object')
  })
})