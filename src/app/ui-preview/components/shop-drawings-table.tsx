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
        className: 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200 px-3 py-2 text-sm font-semibold',
        icon: <CheckCircle className="w-4 h-4 mr-2" />
      },
      submitted_to_client: { 
        label: 'Client Review', 
        className: 'bg-orange-100 text-orange-800 border-2 border-orange-300 hover:bg-orange-200 px-3 py-2 text-sm font-semibold',
        icon: <Eye className="w-4 h-4 mr-2" />
      },
      revision_requested: { 
        label: 'Revision Required', 
        className: 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 hover:bg-yellow-200 px-3 py-2 text-sm font-semibold',
        icon: <AlertTriangle className="w-4 h-4 mr-2" />
      },
      pending_submittal: { 
        label: 'Pending Review', 
        className: 'bg-gray-100 text-gray-800 border-2 border-gray-300 hover:bg-gray-200 px-3 py-2 text-sm font-semibold',
        icon: <Clock className="w-4 h-4 mr-2" />
      },
      rejected: { 
        label: 'Rejected', 
        className: 'bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200 px-3 py-2 text-sm font-semibold',
        icon: <X className="w-4 h-4 mr-2" />
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

  const getWhoseTurnBadge = (whoseTurn: string) => {
    const turnConfig = {
      us: { 
        label: 'Our Turn', 
        className: 'bg-blue-100 text-blue-800 border-2 border-blue-400 hover:bg-blue-200 px-4 py-2 text-base font-bold shadow-sm',
        bgColor: 'bg-blue-50',
        icon: <Users className="w-5 h-5 mr-2" />
      },
      client: { 
        label: 'Client\'s Turn', 
        className: 'bg-orange-100 text-orange-800 border-2 border-orange-400 hover:bg-orange-200 px-4 py-2 text-base font-bold shadow-sm',
        bgColor: 'bg-orange-50',
        icon: <UserCheck className="w-5 h-5 mr-2" />
      },
      complete: { 
        label: 'Complete', 
        className: 'bg-green-100 text-green-800 border-2 border-green-400 hover:bg-green-200 px-4 py-2 text-base font-bold shadow-sm',
        bgColor: 'bg-green-50',
        icon: <CheckCircle className="w-5 h-5 mr-2" />
      }
    }
    
    const config = turnConfig[whoseTurn as keyof typeof turnConfig]
    return (
      <div className={`inline-flex items-center rounded-xl transition-all duration-200 cursor-pointer ${config.className}`}>
        {config.icon}
        {config.label}
      </div>
    )
  }

  const getDaysWithStatus = (uploadedAt: string, whoseTurn: string) => {
    const uploadDate = new Date(uploadedAt)
    const now = new Date()
    const days = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (whoseTurn === 'complete') return null
    
    const isOverdue = days > 5 && whoseTurn === 'client' || days > 3 && whoseTurn === 'us'
    
    return {
      days,
      text: days === 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`,
      isOverdue,
      className: isOverdue ? 'text-red-600 font-bold' : whoseTurn === 'client' ? 'text-orange-600 font-medium' : 'text-blue-600 font-medium'
    }
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
    <div className="space-y-6">
      {/* Enhanced Header with Statistics */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              Shop Drawings
            </h2>
            <p className="text-sm text-gray-600 mt-1">"Whose Turn" approval workflow - Clear accountability tracking</p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Our Turn:</span>
                <span className="font-bold text-blue-700">{drawings.filter(d => d.whoseTurn === 'us').length}</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Client Turn:</span>
                <span className="font-bold text-orange-700">{drawings.filter(d => d.whoseTurn === 'client').length}</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Complete:</span>
                <span className="font-bold text-green-700">{drawings.filter(d => d.whoseTurn === 'complete').length}</span>
              </span>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-auto font-medium shadow-sm">
            <FileText className="mr-2 h-5 w-5" />
            Upload Drawing
          </Button>
        </div>
      </div>

      {/* Enhanced Search & Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search drawings by name, room, or project..."
              className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg"
            />
          </div>
          
          {/* Quick Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="h-12 px-4 border-2 hover:bg-blue-50 hover:border-blue-300">
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              Our Turn ({drawings.filter(d => d.whoseTurn === 'us').length})
            </Button>
            <Button variant="outline" className="h-12 px-4 border-2 hover:bg-orange-50 hover:border-orange-300">
              <UserCheck className="h-4 w-4 mr-2 text-orange-600" />
              Client Turn ({drawings.filter(d => d.whoseTurn === 'client').length})
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Table with Color-Coded Rows */}
      <div className="rounded-xl border shadow-md bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
              <TableHead className="font-bold text-gray-800 py-4">Drawing</TableHead>
              <TableHead className="font-bold text-gray-800 py-4">Room/Area</TableHead>
              <TableHead className="font-bold text-gray-800 py-4">Version</TableHead>
              <TableHead className="font-bold text-gray-800 py-4">Status</TableHead>
              <TableHead className="font-bold text-gray-800 py-4 text-center">Whose Turn</TableHead>
              <TableHead className="font-bold text-gray-800 py-4">Days</TableHead>
              <TableHead className="font-bold text-gray-800 py-4">Comments</TableHead>
              <TableHead className="font-bold text-gray-800 py-4 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drawings.map((drawing) => {
              const daysInfo = getDaysWithStatus(drawing.uploadedAt, drawing.whoseTurn)
              const rowColorClass = drawing.whoseTurn === 'us' ? 'bg-blue-50/50 border-l-4 border-l-blue-400' :
                                   drawing.whoseTurn === 'client' ? 'bg-orange-50/50 border-l-4 border-l-orange-400' :
                                   'bg-green-50/50 border-l-4 border-l-green-400'
              
              return (
                <TableRow key={drawing.id} className={`hover:bg-gray-50/80 transition-all duration-200 ${rowColorClass}`}>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-red-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{drawing.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{drawing.size} • {drawing.project}</p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <div className="text-sm font-medium text-gray-900">{drawing.room}</div>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <Badge variant="outline" className="font-medium px-2 py-1">
                      {drawing.version}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    {getStatusBadge(drawing.status)}
                  </TableCell>
                  
                  <TableCell className="py-4 text-center">
                    {getWhoseTurnBadge(drawing.whoseTurn)}
                  </TableCell>
                  
                  <TableCell className="py-4">
                    {daysInfo ? (
                      <div className="text-center">
                        <div className={`text-sm font-bold ${daysInfo.className}`}>
                          {daysInfo.text}
                        </div>
                        {daysInfo.isOverdue && (
                          <div className="text-xs text-red-500 font-medium mt-1">
                            Overdue!
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 text-sm">-</div>
                    )}
                  </TableCell>
                  
                  <TableCell className="py-4 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {drawing.comments}
                    </Button>
                  </TableCell>
                  
                  <TableCell className="py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full hover:bg-gray-100 hover:border-gray-300">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-2">
                        <DropdownMenuItem className="flex items-center gap-3 hover:bg-blue-50 cursor-pointer p-3 rounded-lg">
                          <Download className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Download PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-3 hover:bg-green-50 cursor-pointer p-3 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                          <span className="font-medium">View Comments ({drawing.comments})</span>
                        </DropdownMenuItem>
                        {drawing.whoseTurn === 'us' && (
                          <DropdownMenuItem className="flex items-center gap-3 hover:bg-purple-50 cursor-pointer p-3 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">Submit to Client</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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