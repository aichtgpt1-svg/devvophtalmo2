import { upload } from '@devvai/devv-code-backend'

export interface UploadResult {
  success: boolean
  fileUrl?: string
  fileName?: string
  error?: string
}

class FileService {
  async uploadFile(file: File): Promise<UploadResult> {
    try {
      const result = await upload.uploadFile(file)
      
      if (upload.isErrorResponse(result)) {
        return {
          success: false,
          error: `Upload failed: ${result.errMsg}`
        }
      }

      return {
        success: true,
        fileUrl: result.link,
        fileName: result.filename || file.name
      }
    } catch (error) {
      console.error('File upload error:', error)
      return {
        success: false,
        error: 'Failed to upload file. Please try again.'
      }
    }
  }

  async uploadMultipleFiles(files: File[]): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file))
    return Promise.all(uploadPromises)
  }

  // Helper method to read file content as text
  async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // Helper method to validate file types for device documents
  validateDeviceFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif'
    ]

    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported. Please upload PDF, text, CSV, Excel, or image files.'
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Maximum size is 10MB.'
      }
    }

    return { valid: true }
  }

  // Extract device information from common file types
  async extractDeviceInfo(file: File): Promise<any> {
    const validation = this.validateDeviceFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    try {
      if (file.type === 'text/plain' || file.type === 'text/csv') {
        const content = await this.readFileAsText(file)
        return this.parseDeviceData(content)
      }
      
      // For other file types, we'll rely on AI analysis after upload
      const uploadResult = await this.uploadFile(file)
      if (!uploadResult.success) {
        throw new Error(uploadResult.error)
      }

      return {
        fileName: file.name,
        fileUrl: uploadResult.fileUrl,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Device info extraction error:', error)
      throw error
    }
  }

  // Parse device data from text/CSV content
  private parseDeviceData(content: string): any {
    const lines = content.split('\n').filter(line => line.trim())
    const deviceData: any = {
      rawContent: content,
      extractedFields: {}
    }

    // Look for common device fields
    const fieldPatterns = {
      serialNumber: /(?:serial|sn|s\/n)[:\s]*([a-zA-Z0-9-]+)/i,
      model: /(?:model|type)[:\s]*([a-zA-Z0-9\s-]+)/i,
      manufacturer: /(?:manufacturer|brand|make)[:\s]*([a-zA-Z0-9\s-]+)/i,
      installDate: /(?:install|installation|date)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
      lastMaintenance: /(?:maintenance|service|last)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i
    }

    lines.forEach(line => {
      Object.entries(fieldPatterns).forEach(([key, pattern]) => {
        const match = line.match(pattern)
        if (match && match[1]) {
          deviceData.extractedFields[key] = match[1].trim()
        }
      })
    })

    return deviceData
  }
}

export const fileService = new FileService()
