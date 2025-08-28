'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Logo } from '@/components/ui/logo'
import { getSupabaseSingleton } from '@/lib/supabase/singleton'
import { useAuthContext } from '@/providers/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { forceSignOut, hasPersistedSession } from '@/lib/auth/session-manager'

// Performance optimizations for construction site connectivity
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { isAuthenticated, user } = useAuthContext()
  
  const supabase = getSupabaseSingleton()

  // Clear any existing sessions when login page loads (prevents auto-login)
  useEffect(() => {
    const clearOldSessions = async () => {
      // Only clear if we have persisted session data but user is not authenticated
      if (hasPersistedSession() && !isAuthenticated) {
        console.log('🔍 Login Page: Clearing old session data to prevent auto-login')
        await forceSignOut()
      }
    }
    
    clearOldSessions()
  }, [isAuthenticated])

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('formulapm_remember_email')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  // Handle navigation when user is authenticated (using AuthProvider state)
  useEffect(() => {
    if (isAuthenticated && user) {
      
      // Show success toast
      toast({
        title: 'Welcome Back!',
        description: `Successfully signed in as ${user.email}`,
        duration: 3000,
      })
      
      // Navigate to dashboard
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, toast, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please fill in both email and password')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // 2024 BEST PRACTICE: Auth state listener will handle success/redirect
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      
      if (authError) {
        setError(authError.message)
        
        // Show user-friendly toast notification
        const getUserFriendlyMessage = (error: string) => {
          if (error.includes('Invalid login credentials')) {
            return {
              title: 'Login Failed',
              description: 'The email or password you entered is incorrect. Please try again.'
            }
          }
          if (error.includes('Email not confirmed')) {
            return {
              title: 'Email Not Verified',
              description: 'Please check your email and click the verification link before signing in.'
            }
          }
          if (error.includes('Too many requests')) {
            return {
              title: 'Too Many Attempts',
              description: 'Too many login attempts. Please wait a few minutes before trying again.'
            }
          }
          return {
            title: 'Authentication Error',
            description: 'Unable to sign in. Please check your credentials and try again.'
          }
        }

        const { title, description } = getUserFriendlyMessage(authError.message)
        toast({
          variant: 'destructive',
          title,
          description,
          duration: 5000,
        })
        
        return
      }

      if (data.user) {
        
        // Handle Remember Me functionality
        if (rememberMe) {
          localStorage.setItem('formulapm_remember_email', email)
        } else {
          localStorage.removeItem('formulapm_remember_email')
        }
        
        // AuthProvider will handle the redirect and success toast
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Unable to connect to the authentication service. Please check your internet connection and try again.',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-8">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo variant="full" size="lg" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-700 mt-2">Sign in to your construction management workspace</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Authentication Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-800">
                Email Address
              </Label>
              <Input
                id="email"
                data-testid="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@company.com"
                className="h-12 border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-800">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 pr-12 border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Toggle password visibility"
                  data-testid="password-toggle"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-600" />
                  )}
                </Button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="rememberMe"
                data-testid="remember-me-checkbox"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={loading}
                className="h-5 w-5"
              />
              <Label htmlFor="rememberMe" className="text-sm text-gray-800 cursor-pointer select-none">
                Remember my email for next time
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              data-testid="login-submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In to Formula PM'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-700">
              Need help? Contact your system administrator
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Formula PM v3.0 - Construction Project Management
            </p>
          </div>
        </div>

        {/* Mobile Optimization Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Optimized for construction site tablets and mobile devices
          </p>
        </div>
      </div>
    </div>
  )
}