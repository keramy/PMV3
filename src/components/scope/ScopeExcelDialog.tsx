/**
 * Formula PM V3 Scope Excel Import/Export Dialog
 * Real implementation for Excel operations
 */

'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle,
  Loader2
} from 'lucide-react'

interface ScopeExcelDialogProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  projectId: string
  mode: 'import' | 'export'
}

export function ScopeExcelDialog({
  isOpen,
  onClose,
  onComplete,
  projectId,
  mode
}: ScopeExcelDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('project_id', projectId)
      formData.append('config', JSON.stringify({
        has_header_row: true,
        start_row: 2
      }))

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/scope/excel/import', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Import failed')
      }

      const result = await response.json()
      setImportResult(result.data)
      
      if (result.success) {
        onComplete()
      }
    } catch (error) {
      console.error('Import error:', error)
      setImportResult({ error: error instanceof Error ? error.message : 'Import failed' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async () => {
    setIsProcessing(true)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90))
      }, 300)

      const params = new URLSearchParams({
        project_id: projectId,
        include_summary: 'true',
        group_by_category: 'false'
      })

      const response = await fetch(`/api/scope/excel/export?${params}`)

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scope-items-${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      onComplete()
      onClose()
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const resetDialog = () => {
    setFile(null)
    setImportResult(null)
    setProgress(0)
    setIsProcessing(false)
  }

  const handleClose = () => {
    if (!isProcessing) {
      resetDialog()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {mode === 'import' ? (
              <>
                <Upload className="h-5 w-5" />
                <span>Import Scope Items from Excel</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>Export Scope Items to Excel</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'import' 
              ? 'Upload an Excel file to import scope items into your project'
              : 'Download all scope items as an Excel spreadsheet'
            }
          </DialogDescription>
        </DialogHeader>

        {mode === 'import' ? (
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="template">Download Template</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              {!importResult && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Select Excel File</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="file-upload">Excel File (.xlsx, .xls)</Label>
                          <Input
                            id="file-upload"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            disabled={isProcessing}
                            className="mt-2"
                          />
                        </div>
                        
                        {file && (
                          <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                            <FileSpreadsheet className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <Badge variant="outline">{(file.size / 1024).toFixed(1)} KB</Badge>
                          </div>
                        )}

                        {isProcessing && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Processing...</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Make sure your Excel file has columns: Title, Description, Category, Quantity, Unit, Unit Cost, Start Date, End Date, Priority, Status
                    </AlertDescription>
                  </Alert>
                </>
              )}

              {importResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {importResult.error ? (
                        <>
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <span>Import Failed</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span>Import Complete</span>
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {importResult.error ? (
                      <p className="text-red-600">{importResult.error}</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span>Total Rows:</span>
                            <span className="font-medium">{importResult.total_rows}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Successful:</span>
                            <span className="font-medium text-green-600">{importResult.successful_imports}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Failed:</span>
                            <span className="font-medium text-red-600">{importResult.failed_imports}</span>
                          </div>
                        </div>
                        
                        {importResult.warnings && importResult.warnings.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-yellow-600">Warnings:</p>
                            <ul className="text-sm text-yellow-700 list-disc list-inside">
                              {importResult.warnings.map((warning: string, index: number) => (
                                <li key={index}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="template" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Excel Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download our Excel template with the correct column format for importing scope items.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export all scope items to Excel format with summary statistics.
                </p>
                
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generating Excel file...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          
          {mode === 'import' && !importResult && (
            <Button onClick={handleImport} disabled={!file || isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Items
            </Button>
          )}
          
          {mode === 'export' && !importResult && (
            <Button onClick={handleExport} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Export to Excel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}