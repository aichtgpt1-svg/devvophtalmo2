import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { databaseService, UserProfile, UserActivity } from '@/services/database-service'
import { fileService } from '@/services/file-service'
import { emailService } from '@/services/email-service'
import { aiService } from '@/services/ai-service'
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Shield,
  Camera,
  Download,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Briefcase
} from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('users')
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
    loadActivities()
    loadStats()
  }, [])

  const loadUsers = async () => {
    try {
      const { users: fetchedUsers } = await databaseService.getAllUsers()
      setUsers(fetchedUsers)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadActivities = async () => {
    try {
      const fetchedActivities = await databaseService.getAllActivities()
      setActivities(fetchedActivities)
    } catch (error) {
      console.error('Failed to load activities:', error)
    }
  }

  const loadStats = async () => {
    try {
      const userStats = await databaseService.getUserStats()
      setStats(userStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadUsers()
      return
    }

    try {
      const searchResults = await databaseService.searchUsers(searchTerm)
      setUsers(searchResults)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async (user: UserProfile) => {
    if (!user._id || !user._uid) return

    if (!confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      return
    }

    try {
      await databaseService.deleteUser(user._uid, user._id)
      toast({
        title: "Success",
        description: "User deleted successfully"
      })
      loadUsers()
      loadStats()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      })
    }
  }

  const sendWelcomeEmail = async (user: UserProfile) => {
    try {
      await emailService.sendEmail({
        to: [user.email],
        subject: `Welcome to OphthalmoTech - ${user.first_name}`,
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to OphthalmoTech</h1>
              <p style="color: #e5e7eb; margin: 10px 0 0 0;">Medical Device Management Platform</p>
            </div>
            <div style="padding: 40px 20px; background: #f8fafc;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${user.first_name},</h2>
              <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
                Your account has been created in the OphthalmoTech platform. Here are your account details:
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Role:</strong> ${user.role}</p>
                <p style="margin: 5px 0;"><strong>Department:</strong> ${user.department}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
              </div>
              <p style="color: #475569; line-height: 1.6;">
                You can now access the platform using your email address for secure OTP authentication.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Access Platform
                </a>
              </div>
            </div>
            <div style="background: #e2e8f0; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>OphthalmoTech Medical Device Management Platform</p>
            </div>
          </div>
        `,
        isHtml: true
      })

      toast({
        title: "Success",
        description: `Welcome email sent to ${user.first_name}`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send welcome email",
        variant: "destructive"
      })
    }
  }

  const generateUserReport = async () => {
    try {
      const reportData = {
        users: users,
        stats: stats,
        activities: activities.slice(0, 50),
        generatedAt: new Date().toISOString()
      }

      const aiAnalysis = await aiService.generateResponse(
        `Analyze this user management data and provide insights:\n${JSON.stringify(reportData, null, 2)}`
      )

      const reportHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h1>OphthalmoTech User Management Report</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          
          <h2>Statistics</h2>
          <p><strong>Total Users:</strong> ${stats?.total || 0}</p>
          
          <h3>By Role:</h3>
          <ul>
            ${Object.entries(stats?.byRole || {}).map(([role, count]) => 
              `<li>${role}: ${count as number}</li>`
            ).join('')}
          </ul>
          
          <h3>By Department:</h3>
          <ul>
            ${Object.entries(stats?.byDepartment || {}).map(([dept, count]) => 
              `<li>${dept}: ${count as number}</li>`
            ).join('')}
          </ul>
          
          <h2>AI Analysis</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            ${aiAnalysis.replace(/\n/g, '<br>')}
          </div>
          
          <h2>Recent Activities</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Action</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Resource</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${activities.slice(0, 20).map(activity => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${activity.action_type}</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${activity.resource_type}</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${new Date(activity.timestamp).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `

      // Send report via email
      await emailService.sendEmail({
        to: [users.find(u => u.role === 'admin')?.email || 'admin@ophthalmtech.com'],
        subject: `OphthalmoTech User Management Report - ${new Date().toLocaleDateString()}`,
        content: reportHtml,
        isHtml: true
      })

      toast({
        title: "Success",
        description: "User management report generated and sent"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      })
    }
  }

  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage healthcare team members and permissions</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={generateUserReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <CreateUserForm onSuccess={() => {
                setIsCreateDialogOpen(false)
                loadUsers()
                loadStats()
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{stats.byStatus?.active || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administrators</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.byRole?.admin || 0}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Activities</p>
                  <p className="text-2xl font-bold text-orange-600">{activities.length}</p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activities">Activity Log</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users by name, email, or department..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={handleSearch} variant="outline">
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Grid */}
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-gray-600 text-sm">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {user.department}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                        className={user.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                      >
                        {user.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendWelcomeEmail(user)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            {selectedUser && (
                              <EditUserForm 
                                user={selectedUser}
                                onSuccess={() => {
                                  setIsEditDialogOpen(false)
                                  setSelectedUser(null)
                                  loadUsers()
                                  loadStats()
                                }}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Recent User Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.slice(0, 20).map((activity) => (
                  <div key={activity._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.action_type === 'create' ? 'bg-green-500' :
                        activity.action_type === 'update' ? 'bg-blue-500' :
                        activity.action_type === 'delete' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-600">
                          {activity.action_type} • {activity.resource_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{new Date(activity.timestamp).toLocaleDateString()}</p>
                      <p>{new Date(activity.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.byRole || {}).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="capitalize">{role}</span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Users by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.byDepartment || {}).map(([dept, count]) => (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="capitalize">{dept}</span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal 
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}

// Create User Form Component
function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'viewer' as UserProfile['role'],
    department: 'ophthalmology' as UserProfile['department'],
    status: 'active' as UserProfile['status'],
    phone: '',
    bio: '',
    license_number: '',
    avatar_url: ''
  })
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadedFile = await fileService.uploadFile(file)
      if (uploadedFile.success && uploadedFile.fileUrl) {
        setFormData(prev => ({ ...prev, avatar_url: uploadedFile.fileUrl }))
      } else {
        throw new Error(uploadedFile.error || 'Upload failed')
      }
      toast({
        title: "Success",
        description: "Avatar uploaded successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await databaseService.createUser(formData)
      toast({
        title: "Success",
        description: "User created successfully"
      })
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Create New User</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={formData.avatar_url} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              <Camera className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar">Profile Picture</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value: UserProfile['role']) => 
              setFormData(prev => ({ ...prev, role: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={formData.department} onValueChange={(value: UserProfile['department']) => 
              setFormData(prev => ({ ...prev, department: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                <SelectItem value="biomedical">Biomedical</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="administration">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="license_number">License Number</Label>
          <Input
            id="license_number"
            value={formData.license_number}
            onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Create User
        </Button>
      </div>
    </form>
  )
}

// Edit User Form Component
function EditUserForm({ user, onSuccess }: { user: UserProfile, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    role: user.role,
    department: user.department,
    status: user.status,
    phone: user.phone || '',
    bio: user.bio || '',
    license_number: user.license_number || '',
    avatar_url: user.avatar_url || ''
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user._uid || !user._id) return

    try {
      await databaseService.updateUser(user._uid, {
        _id: user._id,
        ...formData
      })
      toast({
        title: "Success",
        description: "User updated successfully"
      })
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Edit User</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value: UserProfile['role']) => 
              setFormData(prev => ({ ...prev, role: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: UserProfile['status']) => 
              setFormData(prev => ({ ...prev, status: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={formData.department} onValueChange={(value: UserProfile['department']) => 
            setFormData(prev => ({ ...prev, department: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
              <SelectItem value="biomedical">Biomedical</SelectItem>
              <SelectItem value="it">IT</SelectItem>
              <SelectItem value="administration">Administration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="license_number">License Number</Label>
          <Input
            id="license_number"
            value={formData.license_number}
            onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Update User
        </Button>
      </div>
    </form>
  )
}

// User Detail Modal Component
function UserDetailModal({ user, onClose }: { user: UserProfile, onClose: () => void }) {
  const [activities, setActivities] = useState<UserActivity[]>([])
  
  useEffect(() => {
    if (user._uid) {
      databaseService.getUserActivities(user._uid).then(setActivities).catch(console.error)
    }
  }, [user._uid])

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.first_name} {user.last_name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge>{user.role}</Badge>
                <Badge variant="secondary">{user.department}</Badge>
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm">
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.license_number && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span>License: {user.license_number}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Dates</h4>
              <div className="space-y-2 text-sm">
                {user.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                )}
                {user.last_login && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Last Login: {new Date(user.last_login).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {user.bio && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Biography</h4>
              <p className="text-gray-600 text-sm">{user.bio}</p>
            </div>
          )}

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recent Activities</h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {activities.slice(0, 10).map((activity) => (
                <div key={activity._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{activity.description}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
