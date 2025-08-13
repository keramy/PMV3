'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

export function MaterialSpecsTable() {
  // Material specs data with PM-only approval
  const specs = [
    {
      id: 'MS-001',
      item: 'HVAC Units - Mitsubishi VRF System',
      category: 'Mechanical',
      project: 'Marina Bay Tower',
      value: 125000,
      currency: '₺',
      status: 'pending',
      pmReviewer: 'Sarah Kim',
      submittedBy: 'Yusuf Saglam',
      submittedAt: '2025-06-10T14:30:00Z',
      notes: 'High efficiency system for floors 15-20'
    },
    {
      id: 'MS-002',
      item: 'Electrical Panel - Schneider 400A',
      category: 'Electrical',
      project: 'Tech Hub Renovation',
      value: 15000,
      currency: '₺',
      status: 'approved',
      pmReviewer: 'David Johnson',
      submittedBy: 'Fatma Arslan',
      submittedAt: '2025-06-09T10:15:00Z',
      approvedAt: '2025-06-10T09:00:00Z',
      notes: 'Main distribution panel for Building A'
    },
    {
      id: 'MS-003',
      item: 'Fire Suppression System - FM200',
      category: 'Fire & Safety',
      project: 'Garanti BBVA Tech Center',
      value: 85000,
      currency: '₺',
      status: 'revision_required',
      pmReviewer: 'Sarah Kim',
      submittedBy: 'Emre Koc',
      submittedAt: '2025-06-07T16:20:00Z',
      notes: 'Need alternative quote for server room'
    },
    {
      id: 'MS-004',
      item: 'Kitchen Upper Cabinets - Custom Millwork',
      category: 'Millwork & Carpentry',
      project: 'Akbank Head Office',
      value: 45000,
      currency: '₺',
      status: 'approved',
      pmReviewer: 'David Johnson',
      submittedBy: 'Hakan Ayseli',
      submittedAt: '2025-06-05T11:00:00Z',
      approvedAt: '2025-06-06T14:30:00Z',
      notes: 'Premium maple finish with soft-close hardware'
    },
    {
      id: 'MS-005',
      item: 'Plumbing Fixtures - Grohe Executive Series',
      category: 'Plumbing',
      project: 'Marina Bay Tower',
      value: 32000,
      currency: '₺',
      status: 'rejected',
      pmReviewer: 'Sarah Kim',
      submittedBy: 'Serra Uluveren',
      submittedAt: '2025-06-08T13:45:00Z',
      rejectedAt: '2025-06-09T10:00:00Z',
      notes: 'Over budget - find alternative'
    },
    {
      id: 'MS-006',
      item: 'LED Lighting System - Philips',
      category: 'Electrical',
      project: 'Tech Hub Renovation',
      value: 28000,
      currency: '₺',
      status: 'pending',
      pmReviewer: 'David Johnson',
      submittedBy: 'Ahmet Yilmaz',
      submittedAt: '2025-06-10T16:00:00Z',
      notes: 'Smart lighting with motion sensors'
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: 'Awaiting PM Decision', 
        className: 'bg-orange-100 text-orange-800 border-2 border-orange-300 hover:bg-orange-200 px-3 py-2 text-sm font-semibold',
        icon: <Clock className="mr-2 h-4 w-4" />
      },
      approved: { 
        label: 'PM Approved - Ready to Order', 
        className: 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200 px-3 py-2 text-sm font-semibold',
        icon: <CheckCircle className="mr-2 h-4 w-4" />
      },
      rejected: { 
        label: 'PM Rejected - Find Alternative', 
        className: 'bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200 px-3 py-2 text-sm font-semibold',
        icon: <XCircle className="mr-2 h-4 w-4" />
      },
      revision_required: { 
        label: 'PM Needs More Info', 
        className: 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 hover:bg-yellow-200 px-3 py-2 text-sm font-semibold',
        icon: <AlertCircle className="mr-2 h-4 w-4" />
      }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    
    return (
      <div className={`inline-flex items-center rounded-lg transition-colors cursor-pointer ${config.className}`}>
        {config.icon}
        {config.label}
      </div>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Mechanical': 'bg-blue-100 text-blue-800 border-blue-300',
      'Electrical': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Fire & Safety': 'bg-red-100 text-red-800 border-red-300',
      'Millwork & Carpentry': 'bg-amber-100 text-amber-800 border-amber-300',
      'Plumbing': 'bg-teal-100 text-teal-800 border-teal-300'
    }
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours} hours ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatCurrency = (value: number, currency: string) => {
    return `${currency}${value.toLocaleString('tr-TR')}`
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Statistics */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-6 w-6 text-blue-600" />
              Material Specifications
            </h2>
            <p className="text-sm text-gray-600 mt-1">PM single-click approval workflow - No cost display needed</p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Pending PM Decision:</span>
                <span className="font-bold text-orange-700">{specs.filter(s => s.status === 'pending').length}</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Approved:</span>
                <span className="font-bold text-green-700">{specs.filter(s => s.status === 'approved').length}</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Need Revision:</span>
                <span className="font-bold text-yellow-700">{specs.filter(s => s.status === 'revision_required').length}</span>
              </span>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-auto font-medium shadow-sm">
            <Package className="mr-2 h-5 w-5" />
            Add Material Spec
          </Button>
        </div>
      </div>

      {/* Enhanced Search & Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search materials by name, category, or project..."
              className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg"
            />
          </div>
          
          {/* Quick Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="h-12 px-4 border-2 hover:bg-orange-50 hover:border-orange-300">
              <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
              Needs Decision ({specs.filter(s => s.status === 'pending').length})
            </Button>
            <Button variant="outline" className="h-12 px-4 border-2 hover:bg-green-50 hover:border-green-300">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Approved ({specs.filter(s => s.status === 'approved').length})
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Table with Color-Coded Rows */}
      <div className="rounded-xl border shadow-md bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
              <TableHead className="font-bold text-gray-800 py-4">Material Details</TableHead>
              <TableHead className="font-bold text-gray-800 py-4">Category</TableHead>
              <TableHead className="font-bold text-gray-800 py-4">Project</TableHead>
              <TableHead className="font-bold text-gray-800 py-4">PM Reviewer</TableHead>
              <TableHead className="font-bold text-gray-800 py-4 text-center">Status</TableHead>
              <TableHead className="font-bold text-gray-800 py-4">Submitted</TableHead>
              <TableHead className="font-bold text-gray-800 py-4 text-center">PM Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specs.map((spec) => {
              const rowColorClass = spec.status === 'pending' ? 'bg-orange-50/50 border-l-4 border-l-orange-400' :
                                   spec.status === 'approved' ? 'bg-green-50/50 border-l-4 border-l-green-400' :
                                   spec.status === 'rejected' ? 'bg-red-50/50 border-l-4 border-l-red-400' :
                                   'bg-yellow-50/50 border-l-4 border-l-yellow-400'
              
              return (
                <TableRow key={spec.id} className={`hover:bg-gray-50/80 transition-all duration-200 ${rowColorClass}`}>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-6 w-6 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{spec.item}</p>
                        <p className="text-xs text-gray-500 mt-1">{spec.notes}</p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <Badge 
                      variant="outline" 
                      className={`font-medium px-3 py-1 border-2 ${getCategoryColor(spec.category)}`}
                    >
                      {spec.category}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <div className="text-sm font-medium text-gray-900">{spec.project}</div>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <div className="text-sm font-medium text-gray-900">{spec.pmReviewer}</div>
                  </TableCell>
                  
                  <TableCell className="py-4 text-center">
                    {getStatusBadge(spec.status)}
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium">{formatDate(spec.submittedAt)}</p>
                      <p className="text-xs text-muted-foreground">by {spec.submittedBy}</p>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4 text-center">
                    {spec.status === 'pending' && (
                      <div className="flex gap-2 justify-center">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-medium shadow-sm"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="px-4 py-2 font-medium shadow-sm"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {spec.status === 'revision_required' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 px-4 py-2 font-medium"
                      >
                        <AlertCircle className="mr-1 h-4 w-4" />
                        Review Changes
                      </Button>
                    )}
                    {(spec.status === 'approved' || spec.status === 'rejected') && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="hover:bg-gray-100 px-4 py-2"
                      >
                        View Details
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}