/**
 * Formula PM V3 - Authentication Debug Types
 * Proper TypeScript definitions instead of 'as any' hacks
 */

// JWT payload structure from Supabase
export interface JWTPayload {
  aud: string
  exp: number
  iat: number
  iss: string
  sub: string
  role: string
  email?: string
  phone?: string
  app_metadata?: Record<string, any>
  user_metadata?: Record<string, any>
  [key: string]: any
}

// RPC function return type for test_authorization_header
export interface AuthHeaderTestResult extends JWTPayload {
  role: string
  sub: string
  exp: number
  iat: number
}

// Task query result type (minimal)
export interface TaskProjectLookup {
  project_id: string
}

// Extension for additional functions (if needed)
// Note: test_authorization_header should be added to the main database schema
// This is a placeholder for when the function is properly defined