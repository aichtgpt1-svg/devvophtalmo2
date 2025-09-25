import { email } from '@devvai/devv-code-backend'

export interface EmailOptions {
  to: string[]
  subject: string
  content: string
  isHtml?: boolean
  cc?: string[]
  attachments?: Array<{
    filename: string
    url: string
    contentType?: string
  }>
}

export interface NotificationEmail {
  type: 'maintenance' | 'alert' | 'reminder' | 'report'
  deviceName?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  actionRequired?: string
}

class EmailService {
  private readonly fromEmail = 'noreply@ophthalmotech.com'

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const emailData: any = {
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        [options.isHtml ? 'html' : 'text']: options.content
      }

      if (options.cc && options.cc.length > 0) {
        emailData.cc = options.cc
      }

      if (options.attachments && options.attachments.length > 0) {
        emailData.attachments = options.attachments.map(att => ({
          filename: att.filename,
          path: att.url,
          content_type: att.contentType || 'application/octet-stream'
        }))
      }

      const result = await email.sendEmail(emailData)
      console.log('Email sent successfully:', result.id)
      return true
    } catch (error) {
      console.error('Email sending failed:', error)
      return false
    }
  }

  // Send device maintenance notification
  async sendMaintenanceNotification(
    recipients: string[],
    deviceName: string,
    maintenanceType: string,
    dueDate: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<boolean> {
    const priorityColors = {
      low: '#10B981',
      medium: '#F59E0B', 
      high: '#EF4444',
      critical: '#DC2626'
    }

    const priorityLabels = {
      low: 'Low Priority',
      medium: 'Medium Priority',
      high: 'High Priority',
      critical: 'CRITICAL'
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OphthalmoTech Maintenance Alert</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">OphthalmoTech</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Medical Device Management Platform</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 5px solid ${priorityColors[priority]};">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="background: ${priorityColors[priority]}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                    ${priorityLabels[priority]}
                </div>
            </div>
            
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Maintenance Required</h2>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #555;">Device:</td>
                        <td style="padding: 8px 0;">${deviceName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #555;">Maintenance Type:</td>
                        <td style="padding: 8px 0;">${maintenanceType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #555;">Due Date:</td>
                        <td style="padding: 8px 0; color: ${priority === 'critical' ? '#DC2626' : '#333'}; font-weight: ${priority === 'critical' ? 'bold' : 'normal'};">${dueDate}</td>
                    </tr>
                </table>
            </div>
            
            ${priority === 'critical' ? `
            <div style="background: #FEF2F2; border: 1px solid #FECACA; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; color: #991B1B; font-weight: bold;">⚠️ CRITICAL: Immediate attention required to ensure patient safety and device compliance.</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    View in OphthalmoTech Dashboard
                </a>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
            <p>This is an automated notification from OphthalmoTech Medical Device Management Platform.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </body>
    </html>
    `

    return this.sendEmail({
      to: recipients,
      subject: `${priority === 'critical' ? '🚨 CRITICAL' : '📋'} Maintenance Required: ${deviceName}`,
      content: htmlContent,
      isHtml: true
    })
  }

  // Send device alert notification
  async sendDeviceAlert(
    recipients: string[],
    deviceName: string,
    alertType: string,
    alertMessage: string,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'warning'
  ): Promise<boolean> {
    const severityConfig = {
      info: { color: '#3B82F6', icon: 'ℹ️', label: 'INFO' },
      warning: { color: '#F59E0B', icon: '⚠️', label: 'WARNING' },
      error: { color: '#EF4444', icon: '❌', label: 'ERROR' },
      critical: { color: '#DC2626', icon: '🚨', label: 'CRITICAL ALERT' }
    }

    const config = severityConfig[severity]

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OphthalmoTech Device Alert</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">OphthalmoTech</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Device Alert System</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 5px solid ${config.color};">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="background: ${config.color}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    ${config.icon} ${config.label}
                </div>
            </div>
            
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Device Alert: ${alertType}</h2>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #555;">Device:</td>
                        <td style="padding: 8px 0;">${deviceName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #555;">Alert Time:</td>
                        <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #555;">Details:</td>
                        <td style="padding: 8px 0;">${alertMessage}</td>
                    </tr>
                </table>
            </div>
            
            ${severity === 'critical' ? `
            <div style="background: #FEF2F2; border: 1px solid #FECACA; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; color: #991B1B; font-weight: bold;">🚨 CRITICAL ALERT: Immediate action required. Patient safety may be at risk.</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background: ${config.color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Acknowledge Alert
                </a>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
            <p>This is an automated alert from OphthalmoTech Device Monitoring System.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </body>
    </html>
    `

    return this.sendEmail({
      to: recipients,
      subject: `${config.icon} ${config.label}: ${deviceName} - ${alertType}`,
      content: htmlContent,
      isHtml: true
    })
  }

  // Send custom report via email
  async sendReport(
    recipients: string[],
    reportTitle: string,
    reportContent: string,
    attachmentUrl?: string,
    attachmentName?: string
  ): Promise<boolean> {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OphthalmoTech Report</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">OphthalmoTech</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Analytics & Reporting</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">📊 ${reportTitle}</h2>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #6c757d; margin-bottom: 15px;">Report generated on: ${new Date().toLocaleString()}</p>
                <div style="white-space: pre-wrap;">${reportContent}</div>
            </div>
            
            ${attachmentUrl ? `
            <div style="background: #E3F2FD; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; color: #1976D2;">
                    📎 <strong>Attachment:</strong> 
                    <a href="${attachmentUrl}" style="color: #1976D2; text-decoration: none;">${attachmentName || 'Report File'}</a>
                </p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    View Full Dashboard
                </a>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
            <p>This report was automatically generated by OphthalmoTech Analytics.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </body>
    </html>
    `

    const attachments = attachmentUrl ? [{
      filename: attachmentName || 'report.pdf',
      url: attachmentUrl,
      contentType: 'application/pdf'
    }] : undefined

    return this.sendEmail({
      to: recipients,
      subject: `📊 OphthalmoTech Report: ${reportTitle}`,
      content: htmlContent,
      isHtml: true,
      attachments
    })
  }
}

export const emailService = new EmailService()
