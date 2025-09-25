import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Stethoscope, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  Activity,
  Shield,
  Clock,
  CheckCircle,
  Users
} from 'lucide-react'
import { emailService } from '@/services/email-service'
import { useToast } from '@/hooks/use-toast'
import UserManagementDashboard from './UserManagementDashboard'

interface DashboardStats {
  totalDevices: number
  activeDevices: number
  pendingMaintenance: number
  criticalAlerts: number
  complianceScore: number
  uptime: number
}

interface RecentActivity {
  id: string
  type: 'maintenance' | 'alert' | 'compliance' | 'device'
  message: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDevices: 45,
    activeDevices: 42,
    pendingMaintenance: 8,
    criticalAlerts: 2,
    complianceScore: 96,
    uptime: 99.2
  })

  const [activities, setActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'alert',
      message: 'OCT Scanner #3 - Calibration drift detected',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      severity: 'high'
    },
    {
      id: '2', 
      type: 'maintenance',
      message: 'Fundus Camera #2 - Routine maintenance completed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      severity: 'low'
    },
    {
      id: '3',
      type: 'device',
      message: 'New Tonometer #5 added to inventory',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      severity: 'medium'
    },
    {
      id: '4',
      type: 'compliance',
      message: 'Monthly safety inspection report generated',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      severity: 'low'
    }
  ])

  const { toast } = useToast()

  const handleSendTestAlert = async () => {
    try {
      const success = await emailService.sendDeviceAlert(
        ['admin@hospital.com'],
        'OCT Scanner #3',
        'Calibration Drift',
        'Device calibration has drifted beyond acceptable parameters. Immediate recalibration required.',
        'critical'
      )

      if (success) {
        toast({
          title: 'Test Alert Sent',
          description: 'Critical device alert email has been sent successfully'
        })
      } else {
        toast({
          title: 'Email Failed',
          description: 'Failed to send test alert email',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test alert email',
        variant: 'destructive'
      })
    }
  }

  const handleSendMaintenanceNotification = async () => {
    try {
      const success = await emailService.sendMaintenanceNotification(
        ['maintenance@hospital.com'],
        'Fundus Camera #1',
        'Quarterly Calibration',
        '2024-01-15',
        'medium'
      )

      if (success) {
        toast({
          title: 'Maintenance Notification Sent',
          description: 'Maintenance reminder email has been sent successfully'
        })
      } else {
        toast({
          title: 'Email Failed',
          description: 'Failed to send maintenance notification',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send maintenance notification',
        variant: 'destructive'
      })
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-4 h-4" />
      case 'maintenance': return <Calendar className="w-4 h-4" />
      case 'device': return <Stethoscope className="w-4 h-4" />
      case 'compliance': return <Shield className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">OphthalmoTech Dashboard</h1>
        <p className="text-gray-600 mt-1">Medical device management and team oversight</p>
      </div>

      <Tabs defaultValue="devices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            Device Management
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6 mt-6">
          <DeviceManagementDashboard
            stats={stats}
            activities={activities}
            handleSendTestAlert={handleSendTestAlert}
            handleSendMaintenanceNotification={handleSendMaintenanceNotification}
            getActivityIcon={getActivityIcon}
            getSeverityColor={getSeverityColor}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-6 mt-6">
          <UserManagementDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Separate Device Management Dashboard Component
function DeviceManagementDashboard({
  stats,
  activities,
  handleSendTestAlert,
  handleSendMaintenanceNotification,
  getActivityIcon,
  getSeverityColor
}: {
  stats: DashboardStats
  activities: RecentActivity[]
  handleSendTestAlert: () => void
  handleSendMaintenanceNotification: () => void
  getActivityIcon: (type: string) => JSX.Element
  getSeverityColor: (severity: string) => string
}) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDevices}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+3 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Devices</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDevices}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">{((stats.activeDevices / stats.totalDevices) * 100).toFixed(1)}% operational</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingMaintenance}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-yellow-600">2 overdue</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.criticalAlerts}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-red-600">Requires attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Uptime</span>
                  <span className="text-sm font-bold text-green-600">{stats.uptime}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${stats.uptime}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Compliance Score</span>
                  <span className="text-sm font-bold text-blue-600">{stats.complianceScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${stats.complianceScore}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getSeverityColor(activity.severity)}>
                        {activity.severity}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {activity.timestamp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Email System Testing</CardTitle>
          <p className="text-sm text-gray-600">
            Test the integrated email notification system with sample alerts and maintenance notifications
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleSendTestAlert}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Send Test Critical Alert
            </Button>
            
            <Button 
              onClick={handleSendMaintenanceNotification}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Send Maintenance Reminder
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Note: Email sending requires Resend API key configuration. If you see errors, configure your Resend key in settings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
