/**
 * Formula PM V3 Supabase Client Re-export
 * Clean architecture - browser client only, no complex configurations
 */

// Re-export everything from the working client
export { 
  getClient,
  createClient,
  resetClient
} from './supabase/client'

// For backward compatibility, export a client instance
export { getClient as supabase } from './supabase/client'

// Note: supabaseAdmin removed from browser exports - admin operations should be server-side only