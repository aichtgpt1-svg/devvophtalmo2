import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Upload, File, Check, AlertCircle, X, FileText, Image, Download } from 'lucide-react'
import { fileService, UploadResult } from '@/services/file-service'
import { aiService } from '@/services/ai-service'
import { useToast } from '@/hooks/use-toast'

interface UploadedFile extends UploadResult {
  file: File
  id: string
  analysis?: string
  isAnalyzing?: boolean
}

export default function FileUploadComponent() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (files: File[]) => {
    setIsUploading(true)
    
    try {
      for (const file of files) {
        // Validate file
        const validation = fileService.validateDeviceFile(file)
        if (!validation.valid) {
          toast({
            title: 'Invalid File',
            description: validation.error,
            variant: 'destructive'
          })
          continue
        }

        // Create initial file entry
        const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        const newFile: UploadedFile = {
          file,
          id: fileId,
          success: false,
          isAnalyzing: false
        }

        setUploadedFiles(prev => [...prev, newFile])

        // Upload file
        try {
          const uploadResult = await fileService.uploadFile(file)
          
          // Update file with upload result
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, ...uploadResult }
              : f
          ))

          if (uploadResult.success) {
            // Start AI analysis for text files
            if (file.type === 'text/plain' || file.type === 'text/csv') {
              setUploadedFiles(prev => prev.map(f => 
                f.id === fileId 
                  ? { ...f, isAnalyzing: true }
                  : f
              ))

              try {
                const fileContent = await fileService.readFileAsText(file)
                const analysis = await aiService.analyzeUploadedFile(fileContent, file.name)
                
                setUploadedFiles(prev => prev.map(f => 
                  f.id === fileId 
                    ? { ...f, analysis, isAnalyzing: false }
                    : f
                ))

                toast({
                  title: 'Analysis Complete',
                  description: `AI analysis completed for ${file.name}`
                })
              } catch (analysisError) {
                console.error('Analysis error:', analysisError)
                setUploadedFiles(prev => prev.map(f => 
                  f.id === fileId 
                    ? { ...f, isAnalyzing: false }
                    : f
                ))
                toast({
                  title: 'Analysis Failed',
                  description: 'Could not analyze file content',
                  variant: 'destructive'
                })
              }
            }

            toast({
              title: 'Upload Successful',
              description: `${file.name} uploaded successfully`
            })
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError)
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, success: false, error: 'Upload failed' }
              : f
          ))
        }
      }
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Medical Device File Analysis
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload device documentation, maintenance records, or specification files for AI-powered analysis
          </p>
        </CardHeader>
        <CardContent>
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Supports: PDF, TXT, CSV, Excel, Images (max 10MB each)
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              accept=".pdf,.txt,.csv,.xlsx,.xls,.jpg,.jpeg,.png,.gif"
            />
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-600">Uploading files...</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {uploadedFiles.map((uploadedFile) => (
                  <div key={uploadedFile.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getFileIcon(uploadedFile.file.type)}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {uploadedFile.file.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(uploadedFile.file.size)} • {uploadedFile.file.type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {uploadedFile.success ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="w-3 h-3 mr-1" />
                            Uploaded
                          </Badge>
                        ) : uploadedFile.error ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1" />
                            Uploading
                          </Badge>
                        )}
                        
                        {uploadedFile.isAnalyzing && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-1" />
                            Analyzing
                          </Badge>
                        )}

                        {uploadedFile.success && uploadedFile.fileUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(uploadedFile.fileUrl, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadedFile.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {uploadedFile.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                        <p className="text-sm text-red-700">{uploadedFile.error}</p>
                      </div>
                    )}

                    {uploadedFile.analysis && (
                      <>
                        <Separator className="my-3" />
                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                          <h5 className="font-medium text-blue-900 mb-2">
                            🤖 AI Analysis Results
                          </h5>
                          <div className="text-sm text-blue-800 whitespace-pre-wrap">
                            {uploadedFile.analysis}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
