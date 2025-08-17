'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Shield, 
  Smartphone, 
  Clock,
  Users,
  Building2,
  Wrench,
  FileText
} from 'lucide-react'

export default function HomePage() {
  // Always call useAuth hook to avoid conditional hook calls
  const { user, loading } = useAuth()
  const useAuthBypass = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Formula PM V3...</p>
          {useAuthBypass && <p className="text-sm text-red-600 mt-2">Auth bypass enabled but still loading</p>}
        </div>
      </div>
    )
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🏗️ Welcome back to Formula PM V3
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Ready to manage your construction projects?
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="flex items-center gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth-debug">
                <Button variant="outline" size="lg">
                  System Debug
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🏗️ Formula PM V3
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            Revolutionary Construction Project Management
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            ✅ AUTHENTICATION SYSTEM FIXED & OPERATIONAL
          </Badge>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-green-600">Foundation Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Next.js 15, TypeScript, Supabase integration fully operational</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-blue-600">Revolutionary Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Shop Drawings "Whose Turn" system, simplified material specs</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-purple-600">Secure & Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Dynamic permissions, auto token refresh, &lt;500ms navigation</p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Built for Real Construction Workflows
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Smartphone className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Mobile-First Design</h3>
                  <p className="text-gray-600 text-sm">Touch-optimized for tablets and construction site use</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Simplified Workflows</h3>
                  <p className="text-gray-600 text-sm">5 clear statuses vs 7 complex ones - always know "whose turn"</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Dynamic Permissions</h3>
                  <p className="text-gray-600 text-sm">No fixed roles - admin-configurable permissions</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Building2 className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Construction-Focused</h3>
                  <p className="text-gray-600 text-sm">Built for electrical, plumbing, HVAC workflows</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Wrench className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Offline Capable</h3>
                  <p className="text-gray-600 text-sm">Works reliably on construction sites with poor connectivity</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Shop Drawings Revolution</h3>
                  <p className="text-gray-600 text-sm">"Whose turn" system with clear accountability tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="flex items-center gap-2">
                Login to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth-debug">
              <Button variant="outline" size="lg">
                System Diagnostics
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Formula PM V3 • Authentication Fixed • Ready for Development
          </p>
        </div>
      </div>
    </div>
  )
}