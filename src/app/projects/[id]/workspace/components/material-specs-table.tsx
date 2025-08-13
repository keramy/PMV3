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
        label: 'Pending PM Review', 
        variant: 'modern_warning' as const,
        icon: <Clock className="mr-1 h-3 w-3" />
      },
      approved: { 
        label: 'Approved', 
        variant: 'modern_success' as const,
        icon: <CheckCircle className="mr-1 h-3 w-3" />
      },
      rejected: { 
        label: 'Rejected', 
        variant: 'modern_danger' as const,
        icon: <XCircle className="mr-1 h-3 w-3" />
      },
      revision_required: { 
        label: 'Revision Required', 
        variant: 'modern_warning' as const,
        icon: <AlertCircle className="mr-1 h-3 w-3" />
      }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    
    return (
      <Badge variant={config.variant}>
        {config.icon}
        {config.label}
      </Badge>
    )
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Material Specifications</h2>
          <p className="text-sm text-muted-foreground">PM approval workflow for material selections</p>
        </div>
        <Button>
          <Package className="mr-2 h-4 w-4" />
          Add Material Spec
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search materials..."
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>PM Reviewer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specs.map((spec) => (
              <TableRow key={spec.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{spec.item}</p>
                    <p className="text-xs text-muted-foreground">{spec.notes}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{spec.category}</Badge>
                </TableCell>
                <TableCell className="text-sm">{spec.project}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(spec.value, spec.currency)}
                </TableCell>
                <TableCell className="text-sm">{spec.pmReviewer}</TableCell>
                <TableCell>{getStatusBadge(spec.status)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">{formatDate(spec.submittedAt)}</p>
                    <p className="text-xs text-muted-foreground">by {spec.submittedBy}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {spec.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive">
                        Reject
                      </Button>
                    </div>
                  )}
                  {spec.status === 'revision_required' && (
                    <Button size="sm" variant="outline">
                      Review Changes
                    </Button>
                  )}
                  {(spec.status === 'approved' || spec.status === 'rejected') && (
                    <Button size="sm" variant="ghost">
                      View Details
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}