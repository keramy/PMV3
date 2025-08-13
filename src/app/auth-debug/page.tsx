/**
 * Formula PM V3 - Authentication Debug Page
 * Tool for diagnosing auth issues and testing fixes
 */

'use client'

import { useState, useEffect } from 'react'
import { debugClientAuth, printAuthDebug, type AuthDebugInfo } from '@/lib/auth-debug'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const { user, profile, loading: authLoading, isAuthenticated } = useAuth()

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const info = await debugClientAuth()
      setDebugInfo(info)
      printAuthDebug(info)
    } catch (error) {
      console.error('Failed to run diagnostics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      runDiagnostics()
    }
  }, [authLoading])

  const StatusIcon = ({ condition }: { condition: boolean }) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getTokenStatus = () => {
    if (!debugInfo?.session.exists) return { status: 'No Session', color: 'red' }
    if (!debugInfo?.jwt.valid) return { status: 'Invalid JWT', color: 'red' }
    
    const tokenAge = debugInfo.session.tokenAge
    if (tokenAge && tokenAge.includes('remaining')) {
      const minutes = parseInt(tokenAge.split(' ')[0])
      if (minutes < 10) return { status: 'Expiring Soon', color: 'yellow' }
      return { status: 'Valid', color: 'green' }
    }
    
    return { status: 'Unknown', color: 'gray' }
  }

  if (authLoading) {
    return <div className="p-8">Loading authentication...</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Authentication Debug</h1>
        <p className="text-gray-600 mt-2">
          Diagnostic tool for Formula PM V3 authentication system
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={runDiagnostics} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Running Diagnostics...' : 'Refresh Diagnostics'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Current Auth State */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon condition={isAuthenticated} />
              Current Auth State
            </CardTitle>
            <CardDescription>
              Current authentication status from useAuth hook
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Authenticated:</span>
              <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
                {isAuthenticated ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>User ID:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {user?.id || 'null'}
              </code>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span>{user?.email || 'null'}</span>
            </div>
            <div className="flex justify-between">
              <span>Profile Loaded:</span>
              <Badge variant={profile ? 'default' : 'outline'}>
                {profile ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Session Information */}
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon condition={debugInfo.session.exists} />
                Session Information
              </CardTitle>
              <CardDescription>
                Current session status and token information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Session Exists:</span>
                <Badge variant={debugInfo.session.exists ? 'default' : 'destructive'}>
                  {debugInfo.session.exists ? 'Yes' : 'No'}
                </Badge>
              </div>
              {debugInfo.session.exists && (
                <>
                  <div className="flex justify-between">
                    <span>Token Status:</span>
                    <Badge 
                      variant={
                        getTokenStatus().color === 'green' ? 'default' : 
                        getTokenStatus().color === 'yellow' ? 'secondary' : 'destructive'
                      }
                    >
                      {getTokenStatus().status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires At:</span>
                    <span className="text-sm">
                      {debugInfo.session.expiresAt || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Remaining:</span>
                    <span className="text-sm">
                      {debugInfo.session.tokenAge || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refresh Token:</span>
                    <Badge variant={debugInfo.session.refreshToken ? 'default' : 'destructive'}>
                      {debugInfo.session.refreshToken ? 'Available' : 'Missing'}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* JWT Information */}
        {debugInfo && debugInfo.jwt.valid && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon condition={debugInfo.jwt.valid} />
                JWT Token
              </CardTitle>
              <CardDescription>
                JSON Web Token validation and claims
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Valid:</span>
                <Badge variant={debugInfo.jwt.valid ? 'default' : 'destructive'}>
                  {debugInfo.jwt.valid ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Role:</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {debugInfo.jwt.role || 'Unknown'}
                </code>
              </div>
              <div className="flex justify-between">
                <span>User UUID:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {debugInfo.jwt.userUuid || 'Unknown'}
                </code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Permissions */}
        {debugInfo && debugInfo.permissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
              <CardDescription>
                Current user's permission array
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {debugInfo.permissions.map((permission, index) => (
                  <Badge key={index} variant="outline">
                    {permission}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* RLS Access */}
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Row Level Security (RLS)
              </CardTitle>
              <CardDescription>
                Database access permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>User Profiles Access:</span>
                <div className="flex items-center gap-2">
                  <StatusIcon condition={debugInfo.rls.canAccessUserProfiles} />
                  <Badge variant={debugInfo.rls.canAccessUserProfiles ? 'default' : 'destructive'}>
                    {debugInfo.rls.canAccessUserProfiles ? 'Allowed' : 'Denied'}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Projects Access:</span>
                <div className="flex items-center gap-2">
                  <StatusIcon condition={debugInfo.rls.canAccessProjects} />
                  <Badge variant={debugInfo.rls.canAccessProjects ? 'default' : 'destructive'}>
                    {debugInfo.rls.canAccessProjects ? 'Allowed' : 'Denied'}
                  </Badge>
                </div>
              </div>
              {debugInfo.rls.error && (
                <div className="text-sm text-red-600 mt-2">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Error: {debugInfo.rls.error}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Connection Health */}
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon condition={debugInfo.connectionHealth.connected} />
                Connection Health
              </CardTitle>
              <CardDescription>
                Database connection status and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Connected:</span>
                <Badge variant={debugInfo.connectionHealth.connected ? 'default' : 'destructive'}>
                  {debugInfo.connectionHealth.connected ? 'Yes' : 'No'}
                </Badge>
              </div>
              {debugInfo.connectionHealth.latency && (
                <div className="flex justify-between">
                  <span>Latency:</span>
                  <span className="text-sm">
                    {debugInfo.connectionHealth.latency}ms
                  </span>
                </div>
              )}
              {debugInfo.connectionHealth.error && (
                <div className="text-sm text-red-600">
                  Error: {debugInfo.connectionHealth.error}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}