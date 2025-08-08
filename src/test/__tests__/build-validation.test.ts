/**
 * Build validation tests
 * Tests that npm run build completes successfully without TypeScript errors
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'

describe('Build Validation', () => {
  it('should complete TypeScript type checking without errors', async () => {
    try {
      // Run TypeScript type checking
      execSync('npm run type-check', { 
        stdio: 'pipe',
        timeout: 60000 // 60 second timeout
      })
      
      // If we reach here, type checking passed
      expect(true).toBe(true)
    } catch (error: any) {
      // If type checking fails, the test should fail with the error output
      console.error('TypeScript type checking failed:')
      console.error(error.stdout?.toString() || '')
      console.error(error.stderr?.toString() || '')
      throw new Error(`TypeScript compilation failed: ${error.message}`)
    }
  }, 120000) // 2 minute timeout for the test

  it('should complete build process without errors', async () => {
    try {
      // Set test environment variables for build
      const testEnv = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key-for-testing-only',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-key-for-testing-only',
        NODE_ENV: 'test'
      }
      
      // Run the build process with test environment
      execSync('npm run build', { 
        stdio: 'pipe',
        timeout: 120000, // 2 minute timeout
        env: testEnv
      })
      
      // If we reach here, build passed
      expect(true).toBe(true)
    } catch (error: any) {
      // If build fails, the test should fail with the error output
      console.error('Build process failed:')
      console.error(error.stdout?.toString() || '')
      console.error(error.stderr?.toString() || '')
      throw new Error(`Build process failed: ${error.message}`)
    }
  }, 180000) // 3 minute timeout for the test
})