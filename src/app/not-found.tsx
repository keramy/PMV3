import { FileX, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <FileX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/dashboard">
            <Button className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          
          <Link href="/projects">
            <Button variant="outline" className="w-full">
              View Projects
            </Button>
          </Link>
        </div>
        
        <p className="mt-6 text-sm text-gray-500">
          Formula PM V3 - Construction Project Management
        </p>
      </div>
    </div>
  )
}