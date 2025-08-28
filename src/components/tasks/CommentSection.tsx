'use client'

/**
 * Comment Section Component
 * Task comments with @mention support
 */

import { useState, useRef, useEffect } from 'react'
import { Send, User, Clock, UserPlus, Paperclip } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useTaskComments, useCreateComment } from '@/hooks/useTasks'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/loading-states'
import { cn } from '@/lib/utils'

interface CommentSectionProps {
  taskId: string
  projectId: string
}

interface ProjectMember {
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
  }
}

export function CommentSection({ taskId, projectId }: CommentSectionProps) {
  const [comment, setComment] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [mentionStartIndex, setMentionStartIndex] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const { data: comments, isLoading } = useTaskComments(taskId)
  const createComment = useCreateComment(taskId)
  
  // Fetch project members for mentions
  const { data: projectMembers } = useQuery<ProjectMember[]>({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/members`)
      if (!response.ok) throw new Error('Failed to fetch members')
      return response.json()
    }
  })

  // Handle comment input changes
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPosition = e.target.selectionStart
    setComment(value)

    // Check for @ symbol
    const lastAtIndex = value.lastIndexOf('@', cursorPosition - 1)
    
    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1, cursorPosition)
      
      // Only show mentions if no space after @
      if (!textAfterAt.includes(' ')) {
        setShowMentions(true)
        setMentionSearch(textAfterAt.toLowerCase())
        setMentionStartIndex(lastAtIndex)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  // Filter members based on search
  const filteredMembers = projectMembers?.filter(member => {
    const firstName = member.user.first_name?.toLowerCase() || ''
    const lastName = member.user.last_name?.toLowerCase() || ''
    const fullName = `${firstName} ${lastName}`.trim()
    const email = member.user.email?.toLowerCase() || ''
    
    return (
      firstName.includes(mentionSearch) ||
      lastName.includes(mentionSearch) ||
      fullName.includes(mentionSearch) ||
      email.includes(mentionSearch)
    )
  }).slice(0, 5) // Limit to 5 suggestions

  // Handle mention selection
  const handleMentionSelect = (member: ProjectMember) => {
    const username = `${member.user.first_name?.toLowerCase()}.${member.user.last_name?.toLowerCase()}`
    const beforeMention = comment.substring(0, mentionStartIndex)
    const afterMention = comment.substring(mentionStartIndex + mentionSearch.length + 1)
    const newComment = `${beforeMention}@${username} ${afterMention}`
    
    setComment(newComment)
    setShowMentions(false)
    textareaRef.current?.focus()
  }

  // Handle comment submission
  const handleSubmit = async () => {
    if (!comment.trim()) return
    
    try {
      await createComment.mutateAsync({
        comment: comment.trim(),
        comment_type: 'comment'
      })
      setComment('')
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  // Format comment with highlighted mentions
  const formatComment = (text: string) => {
    return text.replace(/@(\w+(?:\.\w+)?)/g, '<span class="text-blue-600 font-medium">@$1</span>')
  }

  // Get comment type icon
  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <Clock className="h-4 w-4" />
      case 'assignment':
        return <UserPlus className="h-4 w-4" />
      case 'attachment':
        return <Paperclip className="h-4 w-4" />
      default:
        return null
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={comment}
          onChange={handleCommentChange}
          placeholder="Add a comment... Use @ to mention team members"
          rows={3}
          className="pr-12"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleSubmit()
            }
          }}
        />
        
        <Button
          size="icon"
          className="absolute bottom-2 right-2"
          onClick={handleSubmit}
          disabled={!comment.trim() || createComment.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>

        {/* Mention Suggestions */}
        {showMentions && filteredMembers && filteredMembers.length > 0 && (
          <div className="absolute bottom-full mb-1 left-0 w-full max-w-sm bg-white border rounded-lg shadow-lg z-10">
            <div className="p-1">
              {filteredMembers.map((member) => (
                <button
                  key={member.user.id}
                  onClick={() => handleMentionSelect(member)}
                  className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded text-left"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.user.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {member.user.first_name?.[0]}
                      {member.user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {member.user.first_name} {member.user.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {member.user.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.user?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">
                  {comment.user?.first_name?.[0]}
                  {comment.user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {comment.user?.first_name} {comment.user?.last_name}
                  </span>
                  
                  {comment.comment_type !== 'comment' && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      {getCommentTypeIcon(comment.comment_type)}
                      {comment.comment_type.replace('_', ' ')}
                    </Badge>
                  )}
                  
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <div 
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: formatComment(comment.comment) }}
                />
                
                {/* Attachments */}
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {comment.attachments.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200"
                      >
                        <Paperclip className="h-3 w-3" />
                        {file.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  )
}