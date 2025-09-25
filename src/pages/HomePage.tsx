import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import AIChat from '@/components/ai/AIChat'
import FileUploadComponent from '@/components/file-upload/FileUploadComponent'
import UserManagement from '@/components/users/UserManagement'
import { RoleManagement } from '@/components/admin/RoleManagement'
import { PermissionDemo } from '@/components/admin/PermissionDemo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Stethoscope, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  BarChart3,
  Shield,
  Users,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react'

function HomePage() {
  const [activeView, setActiveView] = useState('dashboard')

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview />
      case 'devices':
        return <DevicesView />
      case 'maintenance':
        return <MaintenanceView />
      case 'alerts':
        return <AlertsView />
      case 'reports':
        return <ReportsView />
      case 'analytics':
        return <AnalyticsView />
      case 'compliance':
        return <ComplianceView />
      case 'users':
        return <UserManagement />
      case 'roles':
        return <RoleManagement />
      case 'permissions':
        return <PermissionDemo />
      case 'file-upload':
        return <FileUploadComponent />
      case 'ai-chat':
        return <AIChat />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar activeView={activeView} onViewChange={setActiveView} />
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// Device Management View
function DevicesView() {
  const mockDevices = [
    { id: '1', name: 'OCT Scanner #1', type: 'Optical Coherence Tomography', status: 'active', lastMaintenance: '2024-01-15' },
    { id: '2', name: 'Fundus Camera #2', type: 'Retinal Imaging', status: 'maintenance', lastMaintenance: '2024-01-10' },
    { id: '3', name: 'Tonometer #3', type: 'Intraocular Pressure', status: 'active', lastMaintenance: '2024-01-12' },
    { id: '4', name: 'Slit Lamp #4', type: 'Microscopy', status: 'alert', lastMaintenance: '2024-01-08' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Medical Devices</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Stethoscope className="w-4 h-4 mr-2" />
          Add Device
        </Button>
      </div>

      <div className="grid gap-4">
        {mockDevices.map((device) => (
          <Card key={device.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{device.name}</h3>
                    <p className="text-sm text-gray-600">{device.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={device.status === 'active' ? 'outline' : 'secondary'} 
                         className={device.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                                   device.status === 'maintenance' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                   'bg-red-50 text-red-700 border-red-200'}>
                    {device.status}
                  </Badge>
                  <span className="text-sm text-gray-500">Last: {device.lastMaintenance}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Maintenance View
function MaintenanceView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Maintenance Schedule</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Upcoming Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Maintenance scheduling and tracking features will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Alerts View
function AlertsView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Alerts</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Device alerts and notifications will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Reports View
function ReportsView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Compliance and performance reports will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Analytics View
function AnalyticsView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Device performance analytics and insights will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Compliance View
function ComplianceView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Compliance</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Regulatory Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Compliance status and regulatory information will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Users View
function UsersView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">User roles and permissions management will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default HomePage 
