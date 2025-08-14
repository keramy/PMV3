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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Package, 
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Plus,
  Upload,
  X,
  Image as ImageIcon,
  Download,
  MoreHorizontal,
  RotateCcw,
  Info,
  Pencil
} from 'lucide-react'
import { useState } from 'react'

export function MaterialSpecsTable() {
  // TODO: Replace with real API integration
  /*
  const { data: specsData, isLoading, error, refetch } = useQuery({
    queryKey: ['material-specs', projectId],
    queryFn: () => fetch(`/api/material-specs?project_id=${projectId}`)
      .then(res => res.json()),
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const approveMutation = useMutation({
    mutationFn: (specId: string) => 
      fetch(`/api/material-specs/${specId}/approve`, { method: 'POST' }),
    onSuccess: () => refetch()
  })

  const rejectMutation = useMutation({
    mutationFn: (specId: string) => 
      fetch(`/api/material-specs/${specId}/reject`, { method: 'POST' }),
    onSuccess: () => refetch()
  })

  if (isLoading) return <div>Loading material specs...</div>
  if (error) return <div>Error loading specs</div>

  const specs = specsData?.specs || []
  */

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingSpec, setEditingSpec] = useState<any>(null)
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    category: '',
    manufacturer: '',
    model: '',
    specification: '',
    notes: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionInfo, setCompressionInfo] = useState<{originalSize: number, compressedSize: number} | null>(null)

  // Image compression function
  const compressImage = (file: File): Promise<{blob: Blob, dataUrl: string}> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions (max 800x800, maintain aspect ratio)
        const maxSize = 800
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                blob,
                dataUrl: reader.result as string
              })
            }
            reader.readAsDataURL(blob)
          }
        }, 'image/webp', 0.8) // WebP format with 80% quality
      }
      
      const reader = new FileReader()
      reader.onload = () => {
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image must be smaller than 5MB')
      return
    }
    
    setIsCompressing(true)
    
    try {
      const { blob, dataUrl } = await compressImage(file)
      
      setImageFile(file)
      setImagePreview(dataUrl)
      setCompressionInfo({
        originalSize: file.size,
        compressedSize: blob.size
      })
    } catch (error) {
      console.error('Image compression failed:', error)
      alert('Failed to process image')
    } finally {
      setIsCompressing(false)
    }
  }

  const handleImageRemove = () => {
    setImageFile(null)
    setImagePreview(null)
    setCompressionInfo(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const resetForm = () => {
    setNewMaterial({ name: '', category: '', manufacturer: '', model: '', specification: '', notes: '' })
    handleImageRemove()
    setIsEditMode(false)
    setEditingSpec(null)
  }

  const handleEdit = (spec: any) => {
    setEditingSpec(spec)
    setNewMaterial({
      name: spec.item,
      category: spec.category,
      manufacturer: spec.manufacturer || '',
      model: spec.model || '',
      specification: spec.specification || '',
      notes: spec.notes || ''
    })
    // TODO: Load existing image if available
    // setImagePreview(spec.imageUrl)
    setIsEditMode(true)
    setIsAddModalOpen(true)
  }

  // Material specs data with PM-only approval (aligned with database enums)
  const specs = [
    {
      id: 'MS-001',
      item: 'Oak Veneer Panels',
      category: 'wood',
      project: 'Marina Bay Tower',
      status: 'pending',
      pmReviewer: 'Sarah Kim',
      submittedBy: 'Yusuf Saglam',
      submittedAt: '2025-06-10T14:30:00Z',
      notes: 'Premium oak veneer for executive offices',
      imageUrl: '/images/materials/oak-veneer.jpg',
      manufacturer: 'WoodCraft Inc',
      specification: '3mm thickness, Grade A'
    },
    {
      id: 'MS-002',
      item: 'Stainless Steel Railings',
      category: 'metal',
      project: 'Tech Hub Renovation',
      status: 'approved',
      pmReviewer: 'David Johnson',
      submittedBy: 'Fatma Arslan',
      submittedAt: '2025-06-09T10:15:00Z',
      approvedAt: '2025-06-10T09:00:00Z',
      notes: '316 grade stainless steel for lobby',
      imageUrl: '/images/materials/steel-railing.jpg',
      manufacturer: 'MetalWorks Pro',
      specification: '42" height, brushed finish'
    },
    {
      id: 'MS-003',
      item: 'Tempered Glass Partitions',
      category: 'glass',
      project: 'Garanti BBVA Tech Center',
      status: 'revision_required',
      pmReviewer: 'Sarah Kim',
      submittedBy: 'Emre Koc',
      submittedAt: '2025-06-07T16:20:00Z',
      notes: 'Need frosted option for privacy',
      imageUrl: '/images/materials/glass-partition.jpg',
      manufacturer: 'ClearView Glass',
      specification: '12mm tempered, clear'
    },
    {
      id: 'MS-004',
      item: 'Granite Counter Tops',
      category: 'stone',
      project: 'Akbank Head Office',
      status: 'approved',
      pmReviewer: 'David Johnson',
      submittedBy: 'Hakan Ayseli',
      submittedAt: '2025-06-05T11:00:00Z',
      approvedAt: '2025-06-06T14:30:00Z',
      notes: 'Black galaxy granite for kitchen',
      imageUrl: '/images/materials/granite-black.jpg',
      manufacturer: 'StoneWorld',
      specification: '30mm thickness, polished'
    },
    {
      id: 'MS-005',
      item: 'Epoxy Floor Coating',
      category: 'floor',
      project: 'Marina Bay Tower',
      status: 'rejected',
      pmReviewer: 'Sarah Kim',
      submittedBy: 'Serra Uluveren',
      submittedAt: '2025-06-08T13:45:00Z',
      rejectedAt: '2025-06-09T10:00:00Z',
      notes: 'Find non-slip alternative',
      imageUrl: '/images/materials/epoxy-floor.jpg',
      manufacturer: 'FloorTech',
      specification: 'Self-leveling, gray'
    },
    {
      id: 'MS-006',
      item: 'Interior Paint - Premium',
      category: 'paint',
      project: 'Tech Hub Renovation',
      status: 'pending',
      pmReviewer: 'David Johnson',
      submittedBy: 'Ahmet Yilmaz',
      submittedAt: '2025-06-10T16:00:00Z',
      notes: 'Low VOC, washable finish',
      imageUrl: '/images/materials/paint-sample.jpg',
      manufacturer: 'ColorPro',
      specification: 'Eggshell finish, white base'
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: 'Awaiting PM Decision', 
        className: 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200 px-1.5 py-0.5 text-xs font-medium',
        icon: <Clock className="mr-1 h-3 w-3" />
      },
      approved: { 
        label: 'PM Approved', 
        className: 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 px-1.5 py-0.5 text-xs font-medium',
        icon: <CheckCircle className="mr-1 h-3 w-3" />
      },
      rejected: { 
        label: 'PM Rejected', 
        className: 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 px-1.5 py-0.5 text-xs font-medium',
        icon: <XCircle className="mr-1 h-3 w-3" />
      },
      revision_required: { 
        label: 'Needs Revision', 
        className: 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200 px-1.5 py-0.5 text-xs font-medium',
        icon: <AlertCircle className="mr-1 h-3 w-3" />
      }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    
    return (
      <div className={`inline-flex items-center rounded-md transition-colors cursor-pointer ${config.className}`}>
        {config.icon}
        {config.label}
      </div>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'wood': 'bg-amber-100 text-amber-800 border-amber-300',
      'metal': 'bg-slate-100 text-slate-800 border-slate-300',
      'glass': 'bg-blue-100 text-blue-800 border-blue-300',
      'stone': 'bg-stone-100 text-stone-800 border-stone-300',
      'paint': 'bg-purple-100 text-purple-800 border-purple-300',
      'floor': 'bg-green-100 text-green-800 border-green-300',
      'fabric': 'bg-pink-100 text-pink-800 border-pink-300',
      'hardware': 'bg-orange-100 text-orange-800 border-orange-300',
      'miscellaneous': 'bg-gray-100 text-gray-800 border-gray-400'
    }
    return colors[category] || 'bg-gray-200 text-gray-800 border-gray-400'
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'wood': 'Wood',
      'metal': 'Metal',
      'glass': 'Glass',
      'stone': 'Stone',
      'paint': 'Paint',
      'floor': 'Floor',
      'fabric': 'Fabric',
      'hardware': 'Hardware',
      'miscellaneous': 'Misc'
    }
    return labels[category] || category
  }

  // Export to Excel function
  const exportToExcel = () => {
    // TODO: Implement Excel export
    /*
    import * as XLSX from 'xlsx'
    
    const exportData = specs.map(spec => ({
      'ID': spec.id,
      'Material': spec.item,
      'Category': getCategoryLabel(spec.category),
      'Project': spec.project,
      'Status': getStatusLabel(spec.status),
      'Manufacturer': spec.manufacturer || '',
      'Specification': spec.specification || '',
      'Notes': spec.notes || '',
      'Submitted By': spec.submittedBy,
      'Submitted Date': formatDate(spec.submittedAt)
    }))
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Material Specs')
    XLSX.writeFile(wb, `material-specs-${new Date().toISOString().split('T')[0]}.xlsx`)
    */
    console.log('Exporting material specs to Excel...')
  }

  const getStatusLabel = (status: string) => {
    const statusMap = {
      pending: 'Awaiting PM Decision',
      approved: 'PM Approved',
      rejected: 'PM Rejected',
      revision_required: 'PM Needs More Info'
    }
    return statusMap[status as keyof typeof statusMap] || status
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

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Statistics */}
      <div className="bg-gradient-to-r from-gray-100 to-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-6 w-6 text-blue-600" />
              Material Specifications
            </h2>
            <p className="text-sm text-gray-800 mt-1">PM single-click approval workflow with visual materials</p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-800">Pending PM Decision:</span>
                <span className="font-bold text-orange-700">{specs.filter(s => s.status === 'pending').length}</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-800">Approved:</span>
                <span className="font-bold text-green-700">{specs.filter(s => s.status === 'approved').length}</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-800">Need Revision:</span>
                <span className="font-bold text-yellow-700">{specs.filter(s => s.status === 'revision_required').length}</span>
              </span>
            </div>
          </div>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit Material Specification' : 'Add New Material Specification'}</DialogTitle>
                <DialogDescription>
                  {isEditMode ? 'Update the material specification details.' : 'Create a new material specification for PM approval.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-800">Material Image</Label>
                  
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageSelect(file)
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="space-y-2">
                          {isCompressing ? (
                            <div className="space-y-2">
                              <div className="animate-spin w-8 h-8 mx-auto border-2 border-blue-600 border-t-transparent rounded-full"></div>
                              <p className="text-sm text-gray-700">Compressing image...</p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mx-auto text-gray-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Click to upload image</p>
                                <p className="text-xs text-gray-600">PNG, JPG, WebP up to 5MB</p>
                                <p className="text-xs text-gray-500 mt-1">Images will be optimized to ~100KB</p>
                              </div>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative w-48 h-48 mx-auto border border-gray-400 rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={handleImageRemove}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {compressionInfo && (
                        <div className="text-center space-y-1">
                          <div className="text-xs text-gray-700">
                            <span className="font-medium">Optimized:</span> {formatFileSize(compressionInfo.compressedSize)}
                          </div>
                          <div className="text-xs text-green-600">
                            ✓ Reduced from {formatFileSize(compressionInfo.originalSize)} 
                            ({Math.round((1 - compressionInfo.compressedSize / compressionInfo.originalSize) * 100)}% savings)
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            document.getElementById('image-upload')?.click()
                          }}
                          className="text-xs"
                        >
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Change Image
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right font-medium text-gray-800">
                    Material Name
                  </Label>
                  <Input
                    id="name"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                    className="col-span-3"
                    placeholder="e.g., Oak Veneer Panels"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right font-medium text-gray-800">
                    Category
                  </Label>
                  <Select value={newMaterial.category} onValueChange={(value) => setNewMaterial({...newMaterial, category: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select material category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wood">Wood</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                      <SelectItem value="glass">Glass</SelectItem>
                      <SelectItem value="stone">Stone</SelectItem>
                      <SelectItem value="paint">Paint</SelectItem>
                      <SelectItem value="floor">Floor</SelectItem>
                      <SelectItem value="fabric">Fabric</SelectItem>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="manufacturer" className="text-right font-medium text-gray-800">
                    Manufacturer
                  </Label>
                  <Input
                    id="manufacturer"
                    value={newMaterial.manufacturer}
                    onChange={(e) => setNewMaterial({...newMaterial, manufacturer: e.target.value})}
                    className="col-span-3"
                    placeholder="e.g., WoodCraft Inc"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="model" className="text-right font-medium text-gray-800">
                    Model/SKU
                  </Label>
                  <Input
                    id="model"
                    value={newMaterial.model}
                    onChange={(e) => setNewMaterial({...newMaterial, model: e.target.value})}
                    className="col-span-3"
                    placeholder="e.g., OV-3000-A"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="specification" className="text-right font-medium text-gray-800">
                    Specification
                  </Label>
                  <Input
                    id="specification"
                    value={newMaterial.specification}
                    onChange={(e) => setNewMaterial({...newMaterial, specification: e.target.value})}
                    className="col-span-3"
                    placeholder="e.g., 3mm thickness, Grade A"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right font-medium text-gray-800">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={newMaterial.notes}
                    onChange={(e) => setNewMaterial({...newMaterial, notes: e.target.value})}
                    className="col-span-3"
                    placeholder="Additional notes or requirements..."
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-gray-400 hover:bg-gray-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    // TODO: Submit new/updated material spec with image
                    const materialData = {
                      ...newMaterial,
                      imagePreview,
                      imageFile,
                      compressionInfo,
                      ...(isEditMode && { id: editingSpec?.id })
                    }
                    console.log(isEditMode ? 'Updating material spec:' : 'Creating material spec:', materialData)
                    setIsAddModalOpen(false)
                    resetForm()
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!newMaterial.name || !newMaterial.category}
                >
                  <Package className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Material Spec' : 'Create Material Spec'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Search & Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            <Input
              placeholder="Search materials..."
              className="pl-10 h-10 text-sm border border-gray-400 focus:border-blue-500 rounded-lg"
            />
          </div>
          
          {/* Export and Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-3 font-medium">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Material
                </Button>
              </DialogTrigger>
            </Dialog>
            <Button 
              onClick={exportToExcel}
              variant="outline" 
              className="h-10 px-3 border hover:bg-gray-50 hover:border-gray-500"
            >
              <Download className="h-4 w-4 mr-2 text-gray-600" />
              Export Excel
            </Button>
            <Button variant="outline" className="h-10 px-3 border hover:bg-orange-50 hover:border-orange-300">
              <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
              Needs Decision ({specs.filter(s => s.status === 'pending').length})
            </Button>
            <Button variant="outline" className="h-10 px-3 border hover:bg-green-50 hover:border-green-300">
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
            <TableRow className="bg-gradient-to-r from-gray-100 to-white border-b-2 border-gray-400">
              <TableHead className="font-bold text-gray-800 py-4 w-20">Image</TableHead>
              <TableHead className="font-bold text-gray-800 py-4" style={{width: '35%'}}>Material Details</TableHead>
              <TableHead className="font-bold text-gray-800 py-4 w-32">Category</TableHead>
              <TableHead className="font-bold text-gray-800 py-4" style={{width: '20%'}}>Project</TableHead>
              <TableHead className="font-bold text-gray-800 py-4 text-center w-44">Status</TableHead>
              <TableHead className="font-bold text-gray-800 py-4 w-36">Submitted</TableHead>
              <TableHead className="font-bold text-gray-800 py-4 text-center w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specs.map((spec) => {
              const leftBorderClass = spec.status === 'pending' ? 'border-l-2 border-l-orange-400' :
                                     spec.status === 'approved' ? 'border-l-2 border-l-green-400' :
                                     spec.status === 'rejected' ? 'border-l-2 border-l-red-400' :
                                     'border-l-2 border-l-yellow-400'
              
              return (
                <TableRow key={spec.id} className={`hover:bg-gray-50 transition-colors duration-150 ${leftBorderClass}`}>
                  <TableCell className="py-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-400 flex items-center justify-center">
                      <div className="text-center">
                        <Package className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                        <span className="text-xs text-gray-700 font-medium">No Image</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{spec.item}</p>
                      <p className="text-xs text-gray-700 mt-1">{spec.manufacturer}</p>
                      <p className="text-xs text-gray-600 mt-1">{spec.specification}</p>
                      <p className="text-xs text-gray-700 mt-2 italic">{spec.notes}</p>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-medium px-1.5 py-0.5 border ${getCategoryColor(spec.category)}`}
                    >
                      {getCategoryLabel(spec.category)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <div className="text-sm font-medium text-gray-900">{spec.project}</div>
                  </TableCell>
                  
                  <TableCell className="py-4 text-center">
                    {getStatusBadge(spec.status)}
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-900">{formatDate(spec.submittedAt)}</p>
                      <p className="text-xs text-gray-700">by {spec.submittedBy}</p>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4 text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-gray-200"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem 
                                className="text-blue-700 hover:bg-blue-50"
                                onClick={() => handleEdit(spec)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-green-700 hover:bg-green-50">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-orange-700 hover:bg-orange-50">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Request Revision
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-700 hover:bg-red-50">
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>PM Actions</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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