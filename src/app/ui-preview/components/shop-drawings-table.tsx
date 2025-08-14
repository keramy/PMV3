'use client'

import { useState } from 'react'
import { useShopDrawings, useUpdateShopDrawingStatus, useSubmitToClient, useRecordClientResponse } from '@/hooks/useShopDrawings'
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
  UserCheck,
  Send
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'

export function ShopDrawingsTable() {
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [newComment, setNewComment] = useState('')

  // TODO: Replace with real project ID from context
  // const { projectId } = useProject()
  const projectId = 'temp-project-id'

  // TODO: Replace mock data with API integration
  /*
  const { data: drawingsData, isLoading, error } = useQuery({
    queryKey: ['shop-drawings', projectId],
    queryFn: () => fetch(`/api/shop-drawings?project_id=${projectId}`)
      .then(res => res.json()),
    enabled: !!projectId
  })

  const drawings = drawingsData?.data || []

  if (isLoading) return <ShopDrawingsLoadingSkeleton />
  if (error) return <ErrorBoundary error={error} />
  */

  // Shop drawings data aligned with database schema (MOCK DATA - REMOVE WHEN API CONNECTED)
  const drawings = [
    {
      id: 'SD-001',
      drawing_number: 'MWK-001',
      title: 'Executive Kitchen Cabinets',
      file_name: 'Executive_Kitchen_Cabinets_Rev_C.pdf',
      file_size: 2800000,
      project: 'Akbank Head Office Renovation',
      revision: 'C',
      status: 'approved',
      responsibility: 'completed',
      submitted_by: 'Ahmet Yilmaz',
      submitted_at: '2025-06-10T09:30:00Z',
      review_comments: 3
    },
    {
      id: 'SD-002',
      drawing_number: 'MWK-002',
      title: 'Executive Reception Desk',
      file_name: 'Executive_Reception_Desk_Rev_B.pdf',
      file_size: 1900000,
      project: 'Akbank Head Office Renovation',
      revision: 'B',
      status: 'submitted_to_client',
      responsibility: 'client_review',
      submitted_by: 'Ahmet Yilmaz',
      submitted_at: '2025-06-08T14:45:00Z',
      review_comments: 1
    },
    {
      id: 'SD-003',
      drawing_number: 'MEP-101',
      title: 'Data Center HVAC System',
      file_name: 'Data_Center_HVAC_System_Rev_A.pdf',
      file_size: 4200000,
      project: 'Garanti BBVA Tech Center MEP',
      revision: 'A',
      status: 'revision_requested',
      responsibility: 'internal_action',
      submitted_by: 'Emre Koc',
      submitted_at: '2025-06-01T11:20:00Z',
      review_comments: 5
    },
    {
      id: 'SD-004',
      drawing_number: 'ELE-201',
      title: 'Main Electrical Distribution',
      file_name: 'Main_Electrical_Distribution_Rev_A.pdf',
      file_size: 3100000,
      project: 'Garanti BBVA Tech Center MEP',
      revision: 'A',
      status: 'pending_submittal',
      responsibility: 'internal_action',
      submitted_by: 'Fatma Arslan',
      submitted_at: '2025-06-09T08:30:00Z',
      review_comments: 2
    },
    {
      id: 'SD-005',
      drawing_number: 'FP-301',
      title: 'Server Room Fire Suppression',
      file_name: 'Server_Room_Fire_Suppression_Rev_A.pdf',
      file_size: 2600000,
      project: 'Garanti BBVA Tech Center MEP',
      revision: 'A',
      status: 'rejected',
      responsibility: 'internal_action',
      submitted_by: 'Emre Koc',
      submitted_at: '2025-06-14T15:10:00Z',
      review_comments: 4
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { 
        label: 'Approved', 
        className: 'bg-green-100 text-green-800 border border-green-300 px-2 py-1 text-sm',
        icon: <CheckCircle className="w-4 h-4 mr-1" />
      },
      submitted_to_client: { 
        label: 'Client Review', 
        className: 'bg-orange-100 text-orange-800 border border-orange-300 px-2 py-1 text-sm',
        icon: <Eye className="w-4 h-4 mr-1" />
      },
      revision_requested: { 
        label: 'Revision Required', 
        className: 'bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-1 text-sm',
        icon: <AlertTriangle className="w-4 h-4 mr-1" />
      },
      pending_submittal: { 
        label: 'Pending Review', 
        className: 'bg-gray-200 text-gray-900 border border-gray-400 px-2 py-1 text-sm',
        icon: <Clock className="w-4 h-4 mr-1" />
      },
      rejected: { 
        label: 'Rejected', 
        className: 'bg-red-100 text-red-800 border border-red-300 px-2 py-1 text-sm',
        icon: <X className="w-4 h-4 mr-1" />
      }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <div className={`inline-flex items-center rounded-md ${config.className}`}>
        {config.icon}
        {config.label}
      </div>
    )
  }

  const getResponsibilityBadge = (responsibility: string) => {
    const responsibilityConfig = {
      internal_action: { 
        label: 'Internal Action', 
        className: 'bg-blue-100 text-blue-800 border border-blue-300 px-2 py-1 text-sm',
        icon: <Users className="w-4 h-4 mr-1" />
      },
      client_review: { 
        label: 'Client Review', 
        className: 'bg-orange-100 text-orange-800 border border-orange-300 px-2 py-1 text-sm',
        icon: <UserCheck className="w-4 h-4 mr-1" />
      },
      completed: { 
        label: 'Completed', 
        className: 'bg-green-100 text-green-800 border border-green-300 px-2 py-1 text-sm',
        icon: <CheckCircle className="w-4 h-4 mr-1" />
      }
    }
    
    const config = responsibilityConfig[responsibility as keyof typeof responsibilityConfig]
    return (
      <div className={`inline-flex items-center rounded-md ${config.className}`}>
        {config.icon}
        {config.label}
      </div>
    )
  }

  const getDaysWithStatus = (submittedAt: string, responsibility: string) => {
    const submittedDate = new Date(submittedAt)
    const now = new Date()
    const days = Math.floor((now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (responsibility === 'completed') return null
    
    const isOverdue = days > 5 && responsibility === 'client_review' || days > 3 && responsibility === 'internal_action'
    
    return {
      days,
      text: days === 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`,
      isOverdue,
      className: isOverdue ? 'text-red-600 font-medium' : responsibility === 'client_review' ? 'text-orange-600' : 'text-blue-600'
    }
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  // TODO: Replace with real comments API
  /*
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['shop-drawing-comments', selectedDrawingId],
    queryFn: () => fetch(`/api/shop-drawings/${selectedDrawingId}/comments`)
      .then(res => res.json()),
    enabled: !!selectedDrawingId && isCommentsModalOpen
  })

  const currentComments = commentsData?.data || []
  */

  // Mock comments data for testing (REMOVE WHEN API CONNECTED)
  const getMockComments = (drawingId: string) => {
    const allComments = {
      'SD-001': [
        {
          id: 'c1',
          user: 'Sarah Kim',
          user_initials: 'SK',
          timestamp: '2025-01-12T10:30:00Z',
          comment_type: 'general',
          comment: 'Reviewed the cabinet specifications. The measurements look accurate for the executive kitchen space.'
        },
        {
          id: 'c2',
          user: 'Client Contact',
          user_initials: 'AC',
          timestamp: '2025-01-13T14:20:00Z',
          comment_type: 'approval',
          comment: 'Approved. Please proceed with manufacturing. The finishes match our requirements perfectly.'
        }
      ],
      'SD-002': [
        {
          id: 'c3',
          user: 'David Johnson',
          user_initials: 'DJ',
          timestamp: '2025-01-10T09:15:00Z',
          comment_type: 'general',
          comment: 'The reception desk design looks great. Waiting for client feedback on the material selection.'
        }
      ],
      'SD-003': [
        {
          id: 'c4',
          user: 'Emre Koc',
          user_initials: 'EK',
          timestamp: '2025-01-08T16:45:00Z',
          comment_type: 'submittal',
          comment: 'Initial HVAC system design submitted for review. Includes redundant cooling for critical server equipment.'
        },
        {
          id: 'c5',
          user: 'Client Engineer',
          user_initials: 'CE',
          timestamp: '2025-01-09T11:30:00Z',
          comment_type: 'revision_request',
          comment: 'Please revise to include additional backup cooling capacity and update the control system specifications.'
        }
      ]
    }
    return allComments[drawingId as keyof typeof allComments] || []
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return time.toLocaleDateString()
  }

  const getCommentTypeBadge = (type: string) => {
    const config = {
      general: { label: 'General', className: 'bg-gray-100 text-gray-700' },
      submittal: { label: 'Submittal', className: 'bg-blue-100 text-blue-700' },
      client_feedback: { label: 'Client', className: 'bg-orange-100 text-orange-700' },
      revision_request: { label: 'Revision', className: 'bg-yellow-100 text-yellow-700' },
      approval: { label: 'Approved', className: 'bg-green-100 text-green-700' },
      rejection: { label: 'Rejected', className: 'bg-red-100 text-red-700' }
    }
    const typeConfig = config[type as keyof typeof config] || config.general
    return (
      <Badge variant="outline" className={`text-xs px-2 py-0.5 ${typeConfig.className}`}>
        {typeConfig.label}
      </Badge>
    )
  }

  const openCommentsModal = (drawingId: string) => {
    setSelectedDrawingId(drawingId)
    setIsCommentsModalOpen(true)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    // TODO: Replace with real API call
    /*
    try {
      setIsSubmittingComment(true)
      
      const response = await fetch(`/api/shop-drawings/${selectedDrawingId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: newComment,
          comment_type: 'general' // TODO: Add comment type selector
        })
      })
      
      if (!response.ok) throw new Error('Failed to add comment')
      
      // Refresh comments
      queryClient.invalidateQueries(['shop-drawing-comments', selectedDrawingId])
      
      setNewComment('')
      
      // Show success toast
      toast.success('Comment added successfully')
      
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
    }
    */
    
    // MOCK IMPLEMENTATION (REMOVE WHEN API CONNECTED)
    console.log('Adding comment:', newComment, 'to drawing:', selectedDrawingId)
    setNewComment('')
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            Shop Drawings
          </h2>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-6 mt-2 text-sm text-gray-800">
            <span>Internal: <span className="font-medium text-blue-700">{drawings.filter(d => d.responsibility === 'internal_action').length}</span></span>
            <span>Client Review: <span className="font-medium text-orange-700">{drawings.filter(d => d.responsibility === 'client_review').length}</span></span>
            <span>Complete: <span className="font-medium text-green-700">{drawings.filter(d => d.responsibility === 'completed').length}</span></span>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <FileText className="mr-2 h-4 w-4" />
          Upload Drawing
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            <Input
              placeholder="Search drawings..."
              className="pl-10 border-gray-400"
            />
          </div>
          
          {/* Quick Filter Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-400">
              <Users className="h-4 w-4 mr-1" />
              Internal ({drawings.filter(d => d.responsibility === 'internal_action').length})
            </Button>
            <Button variant="outline" size="sm" className="border-gray-400">
              <UserCheck className="h-4 w-4 mr-1" />
              Client ({drawings.filter(d => d.responsibility === 'client_review').length})
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 border-b border-gray-400">
              <TableHead className="font-medium text-gray-800">Drawing #</TableHead>
              <TableHead className="font-medium text-gray-800">Title & File</TableHead>
              <TableHead className="font-medium text-gray-800">Revision</TableHead>
              <TableHead className="font-medium text-gray-800">Status</TableHead>
              <TableHead className="font-medium text-gray-800 text-center">Responsibility</TableHead>
              <TableHead className="font-medium text-gray-800">Days</TableHead>
              <TableHead className="font-medium text-gray-800">Comments</TableHead>
              <TableHead className="font-medium text-gray-800 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drawings.map((drawing) => {
              const daysInfo = getDaysWithStatus(drawing.submitted_at, drawing.responsibility)
              const borderClass = drawing.responsibility === 'internal_action' ? 'border-l-2 border-l-blue-500' :
                                 drawing.responsibility === 'client_review' ? 'border-l-2 border-l-orange-500' :
                                 'border-l-2 border-l-green-500'
              
              return (
                <TableRow key={drawing.id} className={`hover:bg-gray-50 ${borderClass}`}>
                  <TableCell>
                    <div className="text-sm font-medium text-gray-900">
                      {drawing.drawing_number}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{drawing.title}</p>
                        <p className="text-xs text-gray-700">{drawing.file_name} • {formatFileSize(drawing.file_size)}</p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      Rev {drawing.revision}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(drawing.status)}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {getResponsibilityBadge(drawing.responsibility)}
                  </TableCell>
                  
                  <TableCell>
                    {daysInfo ? (
                      <div className="text-sm">
                        <span className={daysInfo.className}>
                          {daysInfo.text}
                        </span>
                        {daysInfo.isOverdue && (
                          <div className="text-xs text-red-600 mt-1">
                            Overdue
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600">-</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8"
                      onClick={() => openCommentsModal(drawing.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {drawing.review_comments}
                    </Button>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="outline" size="sm" className="h-8 px-2">
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => openCommentsModal(drawing.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      
                      {drawing.responsibility === 'internal_action' && (
                        <Button variant="outline" size="sm" className="h-8 px-2 text-green-700 border-green-300 hover:bg-green-50">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Comments Modal */}
      <Dialog open={isCommentsModalOpen} onOpenChange={setIsCommentsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Comments - {selectedDrawingId ? drawings.find(d => d.id === selectedDrawingId)?.title : 'Drawing'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDrawingId && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Drawing Info */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                {(() => {
                  const drawing = drawings.find(d => d.id === selectedDrawingId)
                  return drawing ? (
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-sm">{drawing.drawing_number} - {drawing.title}</p>
                        <p className="text-xs text-gray-600">{drawing.file_name}</p>
                      </div>
                    </div>
                  ) : null
                })()}
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
                {getMockComments(selectedDrawingId).map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                        {comment.user_initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.user}</span>
                        {getCommentTypeBadge(comment.comment_type)}
                        <span className="text-xs text-gray-600">{formatTimeAgo(comment.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-900 leading-relaxed">{comment.comment}</p>
                    </div>
                  </div>
                ))}
                
                {getMockComments(selectedDrawingId).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No comments yet</p>
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="border-t pt-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-gray-100 text-gray-700">
                      KT
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-600">
                        {/* TODO: Add comment type selector */}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}