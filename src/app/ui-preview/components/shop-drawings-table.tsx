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
  FileText, 
  Search, 
  Download, 
  MessageSquare,
  MoreVertical,
  CheckCircle,
  Eye,
  AlertTriangle,
  Clock,
  X,
  Users,
  UserCheck
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ShopDrawingsTable() {
  // Shop drawings data with "Whose Turn" system
  const drawings = [
    {
      id: 'SD-001',
      name: 'Executive_Kitchen_Cabinets_Rev_C.pdf',
      size: '2.8 MB',
      project: 'Akbank Head Office Renovation',
      room: 'Executive Kitchen',
      version: 'Rev C',
      status: 'approved',
      whoseTurn: 'complete',
      uploadedBy: 'Ahmet Yilmaz',
      uploadedAt: '2025-06-10T09:30:00Z',
      comments: 3
    },
    {
      id: 'SD-002',
      name: 'Executive_Reception_Desk_Rev_B.pdf',
      size: '1.9 MB',
      project: 'Akbank Head Office Renovation',
      room: 'Executive Reception',
      version: 'Rev B',
      status: 'submitted_to_client',
      whoseTurn: 'client',
      uploadedBy: 'Ahmet Yilmaz',
      uploadedAt: '2025-06-08T14:45:00Z',
      comments: 1
    },
    {
      id: 'SD-003',
      name: 'Data_Center_HVAC_System_Rev_A.pdf',
      size: '4.2 MB',
      project: 'Garanti BBVA Tech Center MEP',
      room: 'Data Center',
      version: 'Rev A',
      status: 'revision_requested',
      whoseTurn: 'us',
      uploadedBy: 'Emre Koc',
      uploadedAt: '2025-06-01T11:20:00Z',
      comments: 5
    },
    {
      id: 'SD-004',
      name: 'Main_Electrical_Distribution_Rev_A.pdf',
      size: '3.1 MB',
      project: 'Garanti BBVA Tech Center MEP',
      room: 'Electrical Room',
      version: 'Rev A',
      status: 'pending_submittal',
      whoseTurn: 'us',
      uploadedBy: 'Fatma Arslan',
      uploadedAt: '2025-06-09T08:30:00Z',
      comments: 2
    },
    {
      id: 'SD-005',
      name: 'Server_Room_Fire_Suppression_Rev_A.pdf',
      size: '2.6 MB',
      project: 'Garanti BBVA Tech Center MEP',
      room: 'Server Room',
      version: 'Rev A',
      status: 'rejected',
      whoseTurn: 'us',
      uploadedBy: 'Emre Koc',
      uploadedAt: '2025-06-14T15:10:00Z',
      comments: 4
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { 
        label: 'Approved', 
        variant: 'modern_success' as const, 
        icon: <CheckCircle className="w-3 h-3 mr-1" />
      },
      submitted_to_client: { 
        label: 'Client Review', 
        variant: 'modern_info' as const, 
        icon: <Eye className="w-3 h-3 mr-1" />
      },
      revision_requested: { 
        label: 'Revision Required', 
        variant: 'modern_warning' as const, 
        icon: <AlertTriangle className="w-3 h-3 mr-1" />
      },
      pending_submittal: { 
        label: 'Pending Review', 
        variant: 'modern_neutral' as const, 
        icon: <Clock className="w-3 h-3 mr-1" />
      },
      rejected: { 
        label: 'Rejected', 
        variant: 'modern_danger' as const, 
        icon: <X className="w-3 h-3 mr-1" />
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

  const getWhoseTurnBadge = (whoseTurn: string) => {
    const turnConfig = {
      us: { 
        label: 'Our Turn', 
        variant: 'modern_info' as const, 
        icon: <Users className="w-3 h-3 mr-1" />
      },
      client: { 
        label: 'Client\'s Turn', 
        variant: 'modern_warning' as const, 
        icon: <UserCheck className="w-3 h-3 mr-1" />
      },
      complete: { 
        label: 'Complete', 
        variant: 'modern_teal' as const, 
        icon: <CheckCircle className="w-3 h-3 mr-1" />
      }
    }
    
    const config = turnConfig[whoseTurn as keyof typeof turnConfig]
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
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Shop Drawings</h2>
          <p className="text-sm text-muted-foreground">Manage and track drawing approvals</p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Upload Drawing
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search drawings..."
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Drawing</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Whose Turn</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drawings.map((drawing) => (
              <TableRow key={drawing.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">{drawing.name}</p>
                      <p className="text-xs text-muted-foreground">{drawing.size}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{drawing.project}</TableCell>
                <TableCell>
                  <Badge variant="outline">Shop Drawing</Badge>
                </TableCell>
                <TableCell className="text-sm">{drawing.room}</TableCell>
                <TableCell className="text-sm font-medium">{drawing.version}</TableCell>
                <TableCell>{getStatusBadge(drawing.status)}</TableCell>
                <TableCell>{getWhoseTurnBadge(drawing.whoseTurn)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">{formatDate(drawing.uploadedAt)}</p>
                    <p className="text-xs text-muted-foreground">by {drawing.uploadedBy}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Comments ({drawing.comments})
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}